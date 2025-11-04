-- =====================================================
-- MIGRATION: Add furniture_ids to images table
-- =====================================================
-- Description: Support modular prompt system with user-selected furniture
-- Date: 2025-01-31
-- =====================================================

BEGIN;

-- Add furniture_ids column to images table
ALTER TABLE public.images
  ADD COLUMN IF NOT EXISTS furniture_ids UUID[] NULL DEFAULT '{}';

-- Add helpful comment
COMMENT ON COLUMN public.images.furniture_ids IS 'IDs des meubles sélectionnés pour cette transformation (provient de furniture_catalog)';

-- Add GIN index for efficient array queries
CREATE INDEX IF NOT EXISTS idx_images_furniture_ids
  ON public.images USING GIN (furniture_ids);

COMMIT;

-- =====================================================
-- VÉRIFICATIONS
-- =====================================================

-- Vérifier que la colonne existe
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'images' AND column_name = 'furniture_ids';

-- Vérifier les index
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'images' AND indexname LIKE '%furniture%';
