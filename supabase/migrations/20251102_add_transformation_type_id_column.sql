-- Migration: Add transformation_type_id column to images table
-- Description: Replace transformation_type (slug) with transformation_type_id (UUID foreign key)
-- Date: 2025-11-02

BEGIN;

-- =====================================================
-- 1. ADD transformation_type_id COLUMN
-- =====================================================

-- Add the new column as nullable first (to allow existing rows)
ALTER TABLE images
ADD COLUMN IF NOT EXISTS transformation_type_id UUID REFERENCES transformation_types(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_images_transformation_type_id
  ON images(transformation_type_id);

COMMENT ON COLUMN images.transformation_type_id IS 'UUID foreign key to transformation_types table';

-- =====================================================
-- 2. MIGRATE EXISTING DATA (if transformation_type column exists)
-- =====================================================

-- Check if transformation_type column exists and migrate data
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'images'
    AND column_name = 'transformation_type'
  ) THEN
    -- Update existing rows: resolve slug to UUID
    UPDATE images i
    SET transformation_type_id = tt.id
    FROM transformation_types tt
    WHERE i.transformation_type = tt.slug
    AND i.transformation_type_id IS NULL;

    -- Log how many rows were updated
    RAISE NOTICE 'Migrated % rows from transformation_type to transformation_type_id',
      (SELECT COUNT(*) FROM images WHERE transformation_type_id IS NOT NULL);
  END IF;
END $$;

-- =====================================================
-- 3. MAKE COLUMN NOT NULL (after data migration)
-- =====================================================

-- Now make it required
ALTER TABLE images
ALTER COLUMN transformation_type_id SET NOT NULL;

-- =====================================================
-- 4. DROP OLD COLUMN (if exists)
-- =====================================================

-- Remove the old transformation_type column if it exists
ALTER TABLE images
DROP COLUMN IF EXISTS transformation_type;

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify the column exists and is properly configured
DO $$
DECLARE
  column_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns
  WHERE table_name = 'images'
  AND column_name = 'transformation_type_id';

  IF column_count = 0 THEN
    RAISE EXCEPTION 'Migration failed: transformation_type_id column not found';
  END IF;

  RAISE NOTICE 'Migration successful: transformation_type_id column exists';
END $$;
