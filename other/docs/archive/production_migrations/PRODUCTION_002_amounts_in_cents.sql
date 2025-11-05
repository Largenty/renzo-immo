-- =====================================================
-- MIGRATION PRODUCTION 002: Montants en Centimes
-- =====================================================
-- Description: Conversion des montants DECIMAL en INTEGER (centimes)
--              pour éviter les problèmes d'arrondi
-- Risque: MOYEN (changement de type, nécessite migration code)
-- Rollback: Possible avec perte de précision
-- =====================================================

BEGIN;

-- 1) Ajouter les nouvelles colonnes en centimes
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS amount_total_cents    INTEGER,
  ADD COLUMN IF NOT EXISTS amount_subtotal_cents INTEGER,
  ADD COLUMN IF NOT EXISTS amount_tax_cents      INTEGER;

-- 2) Backfill: convertir les montants existants en centimes
UPDATE public.invoices
SET
  amount_total_cents    = ROUND(amount_total * 100)::INTEGER,
  amount_subtotal_cents = ROUND(amount_subtotal * 100)::INTEGER,
  amount_tax_cents      = ROUND(amount_tax * 100)::INTEGER
WHERE amount_total_cents IS NULL;

-- 3) Ajouter contraintes NOT NULL après backfill
ALTER TABLE public.invoices
  ALTER COLUMN amount_total_cents SET NOT NULL,
  ALTER COLUMN amount_subtotal_cents SET NOT NULL,
  ALTER COLUMN amount_tax_cents SET NOT NULL;

-- 4) Contraintes de cohérence
ALTER TABLE public.invoices
  DROP CONSTRAINT IF EXISTS ck_invoices_amounts_positive,
  ADD CONSTRAINT ck_invoices_amounts_positive
    CHECK (
      amount_total_cents >= 0
      AND amount_subtotal_cents >= 0
      AND amount_tax_cents >= 0
    );

-- 5) Contrainte: total = subtotal + tax
ALTER TABLE public.invoices
  DROP CONSTRAINT IF EXISTS ck_invoices_amounts_sum,
  ADD CONSTRAINT ck_invoices_amounts_sum
    CHECK (amount_total_cents = amount_subtotal_cents + amount_tax_cents);

-- 6) Ajouter colonnes centimes pour credit_packs
ALTER TABLE public.credit_packs
  ADD COLUMN IF NOT EXISTS price_cents INTEGER,
  ADD COLUMN IF NOT EXISTS price_per_credit_cents INTEGER;

-- Backfill credit_packs
UPDATE public.credit_packs
SET
  price_cents = ROUND(price * 100)::INTEGER,
  price_per_credit_cents = ROUND(price_per_credit * 100)::INTEGER
WHERE price_cents IS NULL;

ALTER TABLE public.credit_packs
  ALTER COLUMN price_cents SET NOT NULL,
  ALTER COLUMN price_per_credit_cents SET NOT NULL;

-- 7) Ajouter colonnes centimes pour subscription_plans
ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS price_monthly_cents INTEGER,
  ADD COLUMN IF NOT EXISTS price_yearly_cents INTEGER;

-- Backfill subscription_plans
UPDATE public.subscription_plans
SET
  price_monthly_cents = ROUND(price_monthly * 100)::INTEGER,
  price_yearly_cents = ROUND(price_yearly * 100)::INTEGER
WHERE price_monthly_cents IS NULL;

ALTER TABLE public.subscription_plans
  ALTER COLUMN price_monthly_cents SET NOT NULL,
  ALTER COLUMN price_yearly_cents SET NOT NULL;

-- 8) Créer une vue helper pour convertir centimes → euros (affichage UI)
CREATE OR REPLACE VIEW public.v_invoices_display AS
SELECT
  id,
  user_id,
  invoice_number,
  status,
  amount_total_cents::NUMERIC / 100 AS amount_total_eur,
  amount_subtotal_cents::NUMERIC / 100 AS amount_subtotal_eur,
  amount_tax_cents::NUMERIC / 100 AS amount_tax_eur,
  currency,
  paid_at,
  created_at
FROM public.invoices;

CREATE OR REPLACE VIEW public.v_credit_packs_display AS
SELECT
  id,
  name,
  credits,
  price_cents::NUMERIC / 100 AS price_eur,
  price_per_credit_cents::NUMERIC / 100 AS price_per_credit_eur,
  is_popular,
  is_active
FROM public.credit_packs;

CREATE OR REPLACE VIEW public.v_subscription_plans_display AS
SELECT
  id,
  name,
  slug,
  description,
  price_monthly_cents::NUMERIC / 100 AS price_monthly_eur,
  price_yearly_cents::NUMERIC / 100 AS price_yearly_eur,
  credits_per_month,
  features,
  is_active
FROM public.subscription_plans;

-- 9) Commentaires pour documentation
COMMENT ON COLUMN public.invoices.amount_total_cents IS 'Montant total TTC en centimes (ex: 1999 = 19,99€)';
COMMENT ON COLUMN public.invoices.amount_subtotal_cents IS 'Montant HT en centimes';
COMMENT ON COLUMN public.invoices.amount_tax_cents IS 'Montant TVA en centimes';

COMMENT ON COLUMN public.credit_packs.price_cents IS 'Prix du pack en centimes';
COMMENT ON COLUMN public.credit_packs.price_per_credit_cents IS 'Prix unitaire par crédit en centimes';

COMMENT ON COLUMN public.subscription_plans.price_monthly_cents IS 'Prix mensuel en centimes';
COMMENT ON COLUMN public.subscription_plans.price_yearly_cents IS 'Prix annuel en centimes';

-- 10) Note: GARDER les anciennes colonnes DECIMAL pendant la transition
-- À supprimer APRÈS migration complète du code frontend/backend:
-- ALTER TABLE public.invoices DROP COLUMN amount_total;
-- ALTER TABLE public.invoices DROP COLUMN amount_subtotal;
-- ALTER TABLE public.invoices DROP COLUMN amount_tax;
-- ALTER TABLE public.credit_packs DROP COLUMN price;
-- ALTER TABLE public.credit_packs DROP COLUMN price_per_credit;
-- ALTER TABLE public.subscription_plans DROP COLUMN price_monthly;
-- ALTER TABLE public.subscription_plans DROP COLUMN price_yearly;

COMMIT;

-- =====================================================
-- VÉRIFICATIONS POST-MIGRATION
-- =====================================================
-- Exécuter ces requêtes pour vérifier:

-- 1) Vérifier conversion invoices
-- SELECT
--   invoice_number,
--   amount_total,
--   amount_total_cents,
--   amount_total_cents::NUMERIC / 100 AS reconverted
-- FROM public.invoices
-- LIMIT 5;

-- 2) Vérifier credit_packs
-- SELECT
--   name,
--   price,
--   price_cents,
--   price_cents::NUMERIC / 100 AS reconverted
-- FROM public.credit_packs;

-- 3) Vérifier vues
-- SELECT * FROM public.v_invoices_display LIMIT 1;
-- SELECT * FROM public.v_credit_packs_display;
-- SELECT * FROM public.v_subscription_plans_display;

-- =====================================================
-- MIGRATION CODE TYPESCRIPT (À FAIRE APRÈS)
-- =====================================================
-- Frontend:
--   const priceEur = invoice.amount_total_cents / 100;
--   return `${priceEur.toFixed(2)}€`;
--
-- Backend:
--   const amountCents = Math.round(amountEur * 100);
--   await supabase.from('invoices').insert({
--     amount_total_cents: amountCents
--   });
