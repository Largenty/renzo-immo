-- =====================================================
-- MIGRATION PRODUCTION 004: Images Idempotence & Statuts
-- =====================================================
-- Description: Garantit l'idempotence des webhooks NanoBanana
--              et valide les transitions de statuts
-- Risque: FAIBLE (ajoute contraintes de sécurité)
-- Rollback: Facile (drop constraints/triggers)
-- =====================================================

BEGIN;

-- =====================================================
-- PARTIE 1: Idempotence webhook NanoBanana
-- =====================================================

-- 1) Contrainte unique sur nano_request_id (évite les duplications)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uq_images_nano_request_id'
  ) THEN
    -- Créer l'unique constraint (ignore les NULL)
    ALTER TABLE public.images
      ADD CONSTRAINT uq_images_nano_request_id
      UNIQUE NULLS NOT DISTINCT (nano_request_id);

    RAISE NOTICE 'Contrainte unique nano_request_id créée';
  ELSE
    RAISE NOTICE 'Contrainte unique nano_request_id existe déjà';
  END IF;
END $$;

-- 2) Index pour lookup rapide par nano_request_id + status
CREATE INDEX IF NOT EXISTS idx_images_nano_status
  ON public.images(nano_request_id, status)
  WHERE nano_request_id IS NOT NULL;

COMMENT ON INDEX idx_images_nano_status IS 'Lookup rapide pour webhook NanoBanana';

-- =====================================================
-- PARTIE 2: Machine à états - Transitions valides
-- =====================================================

-- 3) Fonction de validation des transitions de statuts
CREATE OR REPLACE FUNCTION public.fn_images_validate_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Seulement pour les UPDATE
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN

    -- Transition interdite: retour à processing depuis completed/failed
    IF NEW.status = 'processing' AND OLD.status IN ('completed', 'failed') THEN
      RAISE EXCEPTION 'Transition invalide: % → processing (impossible de revenir en traitement)', OLD.status;
    END IF;

    -- Transition interdite: retour à pending
    IF NEW.status = 'pending' AND OLD.status != 'pending' THEN
      RAISE EXCEPTION 'Transition invalide: % → pending (impossible de revenir en attente)', OLD.status;
    END IF;

    -- Transition interdite: completed → processing
    IF OLD.status = 'completed' AND NEW.status = 'processing' THEN
      RAISE EXCEPTION 'Transition invalide: completed → processing (image déjà terminée)';
    END IF;

    -- Log les transitions valides
    RAISE NOTICE 'Image % transition: % → %', NEW.id, OLD.status, NEW.status;

  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.fn_images_validate_status_transition IS 'Valide les transitions de statuts pour éviter les états incohérents';

-- 4) Trigger de validation
DROP TRIGGER IF EXISTS trg_images_status_guard ON public.images;
CREATE TRIGGER trg_images_status_guard
  BEFORE UPDATE OF status ON public.images
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_images_validate_status_transition();

-- =====================================================
-- PARTIE 3: Calcul automatique de la durée de traitement
-- =====================================================

-- 5) Fonction pour calculer processing_duration_ms
CREATE OR REPLACE FUNCTION public.fn_images_calculate_duration()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Calcul automatique de la durée quand les deux timestamps sont présents
  IF NEW.processing_started_at IS NOT NULL
     AND NEW.processing_completed_at IS NOT NULL THEN

    NEW.processing_duration_ms := EXTRACT(
      EPOCH FROM (NEW.processing_completed_at - NEW.processing_started_at)
    )::INTEGER * 1000;

  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.fn_images_calculate_duration IS 'Calcule automatiquement processing_duration_ms';

-- 6) Trigger de calcul de durée
DROP TRIGGER IF EXISTS trg_images_duration ON public.images;
CREATE TRIGGER trg_images_duration
  BEFORE INSERT OR UPDATE OF processing_started_at, processing_completed_at
  ON public.images
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_images_calculate_duration();

-- =====================================================
-- PARTIE 4: Timestamps automatiques pour traitement
-- =====================================================

-- 7) Fonction pour auto-remplir processing_started_at
CREATE OR REPLACE FUNCTION public.fn_images_auto_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Quand status passe à 'processing', set processing_started_at
  IF TG_OP = 'UPDATE'
     AND NEW.status = 'processing'
     AND OLD.status != 'processing'
     AND NEW.processing_started_at IS NULL THEN

    NEW.processing_started_at := NOW();
    RAISE NOTICE 'Image % démarrage du traitement: %', NEW.id, NEW.processing_started_at;

  END IF;

  -- Quand status passe à 'completed' ou 'failed', set processing_completed_at
  IF TG_OP = 'UPDATE'
     AND NEW.status IN ('completed', 'failed')
     AND OLD.status NOT IN ('completed', 'failed')
     AND NEW.processing_completed_at IS NULL THEN

    NEW.processing_completed_at := NOW();
    RAISE NOTICE 'Image % fin du traitement: % (status: %)', NEW.id, NEW.processing_completed_at, NEW.status;

  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.fn_images_auto_timestamps IS 'Auto-remplit processing_started_at et processing_completed_at';

-- 8) Trigger pour timestamps automatiques
DROP TRIGGER IF EXISTS trg_images_auto_timestamps ON public.images;
CREATE TRIGGER trg_images_auto_timestamps
  BEFORE INSERT OR UPDATE OF status ON public.images
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_images_auto_timestamps();

-- =====================================================
-- PARTIE 5: Contraintes supplémentaires
-- =====================================================

-- 9) Contrainte: processing_completed_at doit être après processing_started_at
ALTER TABLE public.images
  DROP CONSTRAINT IF EXISTS ck_images_processing_dates_order;

ALTER TABLE public.images
  ADD CONSTRAINT ck_images_processing_dates_order
  CHECK (
    processing_completed_at IS NULL
    OR processing_started_at IS NULL
    OR processing_completed_at >= processing_started_at
  );

-- 10) Contrainte: durée doit être positive
ALTER TABLE public.images
  DROP CONSTRAINT IF EXISTS ck_images_duration_positive;

ALTER TABLE public.images
  ADD CONSTRAINT ck_images_duration_positive
  CHECK (processing_duration_ms IS NULL OR processing_duration_ms >= 0);

-- 11) Contrainte: image completed doit avoir transformed_url
ALTER TABLE public.images
  DROP CONSTRAINT IF EXISTS ck_images_completed_has_url;

ALTER TABLE public.images
  ADD CONSTRAINT ck_images_completed_has_url
  CHECK (
    status != 'completed'
    OR transformed_url IS NOT NULL
  );

-- =====================================================
-- PARTIE 6: Vue pour monitoring
-- =====================================================

-- 12) Vue pour surveiller les images en cours trop longtemps
CREATE OR REPLACE VIEW public.v_images_stuck_processing AS
SELECT
  id,
  project_id,
  user_id,
  status,
  nano_request_id,
  processing_started_at,
  NOW() - processing_started_at AS stuck_duration,
  error_message
FROM public.images
WHERE status = 'processing'
  AND processing_started_at < NOW() - INTERVAL '10 minutes'
ORDER BY processing_started_at ASC;

COMMENT ON VIEW public.v_images_stuck_processing IS 'Images en traitement depuis plus de 10 minutes (possiblement bloquées)';

-- 13) Vue pour statistiques de performance
CREATE OR REPLACE VIEW public.v_images_processing_stats AS
SELECT
  DATE(processing_completed_at) AS date,
  status,
  COUNT(*) AS count,
  AVG(processing_duration_ms) AS avg_duration_ms,
  MIN(processing_duration_ms) AS min_duration_ms,
  MAX(processing_duration_ms) AS max_duration_ms,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY processing_duration_ms) AS median_duration_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY processing_duration_ms) AS p95_duration_ms
FROM public.images
WHERE processing_completed_at IS NOT NULL
  AND processing_completed_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(processing_completed_at), status
ORDER BY date DESC, status;

COMMENT ON VIEW public.v_images_processing_stats IS 'Statistiques quotidiennes de traitement des images (30 derniers jours)';

-- =====================================================
-- PARTIE 7: Fonction utilitaire pour webhook
-- =====================================================

-- 14) Fonction pour retrouver une image par nano_request_id (pour webhook)
CREATE OR REPLACE FUNCTION public.fn_get_image_by_nano_request_id(p_nano_request_id TEXT)
RETURNS TABLE(
  id UUID,
  project_id UUID,
  user_id UUID,
  status image_status,
  original_url TEXT,
  transformed_url TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    id,
    project_id,
    user_id,
    status,
    original_url,
    transformed_url
  FROM public.images
  WHERE nano_request_id = p_nano_request_id
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.fn_get_image_by_nano_request_id IS 'Retrouve une image par son nano_request_id (pour webhook)';

GRANT EXECUTE ON FUNCTION public.fn_get_image_by_nano_request_id TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_get_image_by_nano_request_id TO anon;

COMMIT;

-- =====================================================
-- VÉRIFICATIONS POST-MIGRATION
-- =====================================================

-- 1) Vérifier la contrainte unique
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conname = 'uq_images_nano_request_id';

-- 2) Vérifier les triggers
-- SELECT tgname, tgtype, tgenabled
-- FROM pg_trigger
-- WHERE tgrelid = 'public.images'::regclass
-- AND tgname LIKE 'trg_images%';

-- 3) Tester les transitions invalides (doit échouer)
-- UPDATE public.images
-- SET status = 'processing'
-- WHERE status = 'completed'
-- LIMIT 1;
-- Attendu: ERROR: Transition invalide

-- 4) Voir les images bloquées
-- SELECT * FROM public.v_images_stuck_processing;

-- 5) Voir les stats de performance
-- SELECT * FROM public.v_images_processing_stats LIMIT 10;

-- =====================================================
-- UTILISATION DANS LE CODE
-- =====================================================

-- Webhook NanoBanana:
-- const { data } = await supabase.rpc('fn_get_image_by_nano_request_id', {
--   p_nano_request_id: webhookPayload.requestId
-- });
-- if (data.length === 0) {
--   // Image déjà traitée (idempotence) ou requestId invalide
-- }

-- Monitoring:
-- const { data: stuckImages } = await supabase
--   .from('v_images_stuck_processing')
--   .select('*');
