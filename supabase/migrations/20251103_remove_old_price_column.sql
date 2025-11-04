-- =====================================================
-- MIGRATION: Remove old price column
-- =====================================================
-- Date: 2025-11-03
-- Purpose: Remove old 'price' column and keep only 'price_cents'
-- =====================================================

BEGIN;

-- Check if old 'price' column exists and remove it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'credit_packs' AND column_name = 'price'
  ) THEN
    -- First, drop NOT NULL constraint if exists
    ALTER TABLE credit_packs ALTER COLUMN price DROP NOT NULL;

    -- Then drop the column
    ALTER TABLE credit_packs DROP COLUMN price;

    RAISE NOTICE 'Dropped old price column';
  END IF;
END $$;

-- Also remove price_per_credit if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'credit_packs' AND column_name = 'price_per_credit'
  ) THEN
    ALTER TABLE credit_packs DROP COLUMN price_per_credit;
    RAISE NOTICE 'Dropped old price_per_credit column';
  END IF;
END $$;

-- Also remove price_per_credit_cents if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'credit_packs' AND column_name = 'price_per_credit_cents'
  ) THEN
    ALTER TABLE credit_packs DROP COLUMN price_per_credit_cents;
    RAISE NOTICE 'Dropped old price_per_credit_cents column';
  END IF;
END $$;

-- Drop views that depend on old columns
DROP VIEW IF EXISTS v_credit_packs_display CASCADE;

-- Also remove is_popular if it exists (we use 'popular' now)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'credit_packs' AND column_name = 'is_popular'
  ) THEN
    ALTER TABLE credit_packs DROP COLUMN is_popular CASCADE;
    RAISE NOTICE 'Dropped old is_popular column';
  END IF;
END $$;

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check final structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'credit_packs'
-- ORDER BY ordinal_position;
