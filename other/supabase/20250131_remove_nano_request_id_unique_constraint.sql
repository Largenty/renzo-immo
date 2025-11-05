-- Supprimer la contrainte UNIQUE sur nano_request_id
-- Cette contrainte empêche de re-uploader des images, ce qui n'est pas souhaitable

BEGIN;

-- Supprimer la contrainte si elle existe
ALTER TABLE public.images
  DROP CONSTRAINT IF EXISTS uq_images_nano_request_id;

-- Vérifier qu'on garde bien l'index pour la performance
-- (l'index peut exister sans contrainte UNIQUE)
CREATE INDEX IF NOT EXISTS idx_images_nano_request_id
  ON public.images(nano_request_id)
  WHERE nano_request_id IS NOT NULL;

COMMIT;

-- =====================================================
-- EXPLICATION
-- =====================================================
-- La contrainte UNIQUE sur nano_request_id empêchait de re-uploader
-- des images car l'ID NanoBanana pouvait être réutilisé.
-- On garde l'index pour la performance des lookups par webhook,
-- mais on supprime la contrainte UNIQUE.
