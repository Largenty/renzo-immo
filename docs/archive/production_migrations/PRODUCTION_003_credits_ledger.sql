-- =====================================================
-- MIGRATION PRODUCTION 003: Crédits Ledger Immuable
-- =====================================================
-- Description: Transformation en ledger append-only avec
--              fonctions atomiques pour éviter double-spend
-- Risque: ÉLEVÉ (change la logique métier des crédits)
-- Rollback: Difficile (nécessite rejeu des transactions)
-- =====================================================

BEGIN;

-- =====================================================
-- PARTIE 1: RLS pour ledger immuable
-- =====================================================

-- 1) Activer RLS sur credit_transactions
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- 2) Policy lecture: propriétaire uniquement
DROP POLICY IF EXISTS policy_credit_transactions_read ON public.credit_transactions;
CREATE POLICY policy_credit_transactions_read
  ON public.credit_transactions
  FOR SELECT
  USING (user_id = auth.uid());

-- 3) Révoquer INSERT/UPDATE/DELETE directs (sauf service_role)
REVOKE INSERT, UPDATE, DELETE ON public.credit_transactions FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.credit_transactions FROM anon;

-- Note: service_role garde tous les droits pour les fonctions SECURITY DEFINER

-- =====================================================
-- PARTIE 2: Contraintes de cohérence
-- =====================================================

-- 4) Contrainte: montant doit avoir le bon signe selon le type
ALTER TABLE public.credit_transactions
  DROP CONSTRAINT IF EXISTS ck_credit_transaction_amount_sign;

ALTER TABLE public.credit_transactions
  ADD CONSTRAINT ck_credit_transaction_amount_sign
  CHECK (
    (type = 'credit' AND amount > 0)
    OR
    (type = 'debit' AND amount < 0)
    OR
    (type = 'refund' AND amount > 0)
    OR
    (type = 'subscription_renewal' AND amount > 0)
  );

-- 5) Index pour calcul rapide du solde
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_created
  ON public.credit_transactions(user_id, created_at DESC);

-- =====================================================
-- PARTIE 3: Vue du solde actuel
-- =====================================================

-- 6) Vue pour lire le solde actuel de chaque user
CREATE OR REPLACE VIEW public.v_user_credits_balance AS
SELECT
  user_id,
  COALESCE(SUM(amount), 0) AS balance,
  COUNT(*) AS transaction_count,
  MAX(created_at) AS last_transaction_at
FROM public.credit_transactions
GROUP BY user_id;

COMMENT ON VIEW public.v_user_credits_balance IS 'Solde de crédits actuel calculé depuis le ledger';

-- =====================================================
-- PARTIE 4: Fonction atomique - Consommer des crédits
-- =====================================================

-- 7) Fonction pour débiter des crédits (génération image, etc.)
CREATE OR REPLACE FUNCTION public.sp_consume_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reference_type TEXT,
  p_reference_id UUID,
  p_description TEXT DEFAULT 'Consumption de crédits'
)
RETURNS TABLE(new_balance INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_lock_key BIGINT;
BEGIN
  -- Validation des paramètres
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'p_amount doit être positif (nombre de crédits à consommer)';
  END IF;

  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'p_user_id ne peut pas être NULL';
  END IF;

  -- Advisory lock sur l'utilisateur pour éviter race conditions
  -- Clé dérivée de l'UUID (prend les 16 premiers caractères hex)
  v_lock_key := ('x' || substring(replace(p_user_id::text, '-', ''), 1, 16))::bit(64)::bigint;
  PERFORM pg_advisory_xact_lock(v_lock_key);

  -- Calculer le solde actuel
  SELECT COALESCE(SUM(amount), 0)
  INTO v_current_balance
  FROM public.credit_transactions
  WHERE user_id = p_user_id;

  -- Vérifier si suffisamment de crédits
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Crédits insuffisants: disponibles=%, requis=%', v_current_balance, p_amount;
  END IF;

  -- Créer la transaction de débit
  INSERT INTO public.credit_transactions (
    user_id,
    type,
    amount,
    balance_after,
    description,
    reference_type,
    reference_id,
    created_at
  )
  VALUES (
    p_user_id,
    'debit',
    -p_amount, -- Négatif pour débit
    v_current_balance - p_amount,
    p_description,
    p_reference_type,
    p_reference_id,
    NOW()
  );

  -- Retourner le nouveau solde
  RETURN QUERY SELECT v_current_balance - p_amount;
END;
$$;

COMMENT ON FUNCTION public.sp_consume_credits IS 'Consomme des crédits de manière atomique avec advisory lock';

-- =====================================================
-- PARTIE 5: Fonction atomique - Ajouter des crédits
-- =====================================================

-- 8) Fonction pour créditer (achat pack, abonnement, ajustement admin)
CREATE OR REPLACE FUNCTION public.sp_add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type transaction_type,
  p_reference_type TEXT,
  p_reference_id UUID,
  p_description TEXT DEFAULT 'Ajout de crédits'
)
RETURNS TABLE(new_balance INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_lock_key BIGINT;
BEGIN
  -- Validation des paramètres
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'p_amount doit être positif (nombre de crédits à ajouter)';
  END IF;

  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'p_user_id ne peut pas être NULL';
  END IF;

  IF p_type NOT IN ('credit', 'refund', 'subscription_renewal') THEN
    RAISE EXCEPTION 'Type invalide pour ajout: %. Utiliser: credit, refund, ou subscription_renewal', p_type;
  END IF;

  -- Advisory lock
  v_lock_key := ('x' || substring(replace(p_user_id::text, '-', ''), 1, 16))::bit(64)::bigint;
  PERFORM pg_advisory_xact_lock(v_lock_key);

  -- Calculer le solde actuel
  SELECT COALESCE(SUM(amount), 0)
  INTO v_current_balance
  FROM public.credit_transactions
  WHERE user_id = p_user_id;

  -- Créer la transaction de crédit
  INSERT INTO public.credit_transactions (
    user_id,
    type,
    amount,
    balance_after,
    description,
    reference_type,
    reference_id,
    created_at
  )
  VALUES (
    p_user_id,
    p_type,
    p_amount, -- Positif pour crédit
    v_current_balance + p_amount,
    p_description,
    p_reference_type,
    p_reference_id,
    NOW()
  );

  -- Retourner le nouveau solde
  RETURN QUERY SELECT v_current_balance + p_amount;
END;
$$;

COMMENT ON FUNCTION public.sp_add_credits IS 'Ajoute des crédits de manière atomique avec advisory lock';

-- =====================================================
-- PARTIE 6: Fonction helper - Lire le solde
-- =====================================================

-- 9) Fonction pour lire le solde (plus performant que la vue pour 1 user)
CREATE OR REPLACE FUNCTION public.fn_get_user_credits_balance(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(amount), 0)::INTEGER
  FROM public.credit_transactions
  WHERE user_id = p_user_id;
$$;

COMMENT ON FUNCTION public.fn_get_user_credits_balance IS 'Retourne le solde de crédits d''un utilisateur';

-- =====================================================
-- PARTIE 7: Déprécier users.credits_remaining
-- =====================================================

-- 10) Supprimer le trigger qui met à jour users.credits_remaining
DROP TRIGGER IF EXISTS trigger_update_credits ON public.credit_transactions;
DROP FUNCTION IF EXISTS public.update_user_credits() CASCADE;

-- 11) Ajouter une colonne deprecated flag
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'credits_remaining'
  ) THEN
    COMMENT ON COLUMN public.users.credits_remaining IS 'DEPRECATED: Utiliser fn_get_user_credits_balance() ou v_user_credits_balance';
    -- Note: On garde la colonne pour compatibilité, mais on arrête de la mettre à jour
  END IF;
END $$;

-- 12) One-time sync du solde actuel dans users.credits_remaining (pour transition douce)
UPDATE public.users u
SET credits_remaining = COALESCE((
  SELECT SUM(amount)
  FROM public.credit_transactions ct
  WHERE ct.user_id = u.id
), 0);

-- =====================================================
-- PARTIE 8: Grants pour les fonctions RPC
-- =====================================================

-- 13) Permettre aux utilisateurs authentifiés d'appeler les fonctions
GRANT EXECUTE ON FUNCTION public.sp_consume_credits TO authenticated;
GRANT EXECUTE ON FUNCTION public.sp_add_credits TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_get_user_credits_balance TO authenticated;

COMMIT;

-- =====================================================
-- VÉRIFICATIONS POST-MIGRATION
-- =====================================================

-- 1) Vérifier les policies
-- SELECT tablename, policyname, permissive, roles, qual
-- FROM pg_policies
-- WHERE tablename = 'credit_transactions';

-- 2) Vérifier le solde d'un user
-- SELECT * FROM v_user_credits_balance WHERE user_id = 'votre-uuid';

-- 3) Tester la fonction de consommation (remplacer UUID)
-- SELECT * FROM sp_consume_credits(
--   'user-uuid'::uuid,
--   1,
--   'image',
--   'image-uuid'::uuid,
--   'Test génération image'
-- );

-- 4) Tester la fonction d'ajout
-- SELECT * FROM sp_add_credits(
--   'user-uuid'::uuid,
--   10,
--   'credit',
--   'pack',
--   'pack-uuid'::uuid,
--   'Test achat pack'
-- );

-- 5) Vérifier les contraintes
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'public.credit_transactions'::regclass;

-- =====================================================
-- MIGRATION CODE TYPESCRIPT (À FAIRE APRÈS)
-- =====================================================

-- AVANT (❌ à supprimer):
-- await supabase.from('credit_transactions').insert({
--   user_id: userId,
--   type: 'debit',
--   amount: -1,
--   ...
-- })

-- APRÈS (✅ obligatoire):
-- const { data, error } = await supabase.rpc('sp_consume_credits', {
--   p_user_id: userId,
--   p_amount: 1,
--   p_reference_type: 'image',
--   p_reference_id: imageId,
--   p_description: 'Génération image HD'
-- });
--
-- if (error) throw error;
-- const newBalance = data[0].new_balance;

-- Pour lire le solde:
-- const { data } = await supabase.rpc('fn_get_user_credits_balance', {
--   p_user_id: userId
-- });
-- const balance = data;
