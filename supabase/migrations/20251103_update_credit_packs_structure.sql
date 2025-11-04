-- =====================================================
-- MIGRATION: Update credit_packs table structure
-- =====================================================
-- Date: 2025-11-03
-- Purpose: Add missing columns to existing credit_packs table
-- =====================================================

BEGIN;

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Add price_cents column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'credit_packs' AND column_name = 'price_cents'
  ) THEN
    ALTER TABLE credit_packs ADD COLUMN price_cents INTEGER NOT NULL DEFAULT 0 CHECK (price_cents > 0);
  END IF;

  -- Add stripe_price_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'credit_packs' AND column_name = 'stripe_price_id'
  ) THEN
    ALTER TABLE credit_packs ADD COLUMN stripe_price_id VARCHAR(255) UNIQUE;
  END IF;

  -- Add stripe_product_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'credit_packs' AND column_name = 'stripe_product_id'
  ) THEN
    ALTER TABLE credit_packs ADD COLUMN stripe_product_id VARCHAR(255);
  END IF;

  -- Add display_order column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'credit_packs' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE credit_packs ADD COLUMN display_order INTEGER DEFAULT 0;
  END IF;

  -- Add popular column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'credit_packs' AND column_name = 'popular'
  ) THEN
    ALTER TABLE credit_packs ADD COLUMN popular BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add is_active column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'credit_packs' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE credit_packs ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- Update existing data if needed
-- If old 'price' column exists, migrate to price_cents
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'credit_packs' AND column_name = 'price'
  ) THEN
    -- Convert price from euros to cents (price * 100)
    UPDATE credit_packs
    SET price_cents = CAST(price * 100 AS INTEGER)
    WHERE price_cents = 0 OR price_cents IS NULL;
  END IF;
END $$;

-- Delete old placeholder data with invalid stripe IDs
DELETE FROM credit_packs
WHERE stripe_price_id LIKE 'price_placeholder_%'
   OR stripe_product_id LIKE 'prod_placeholder_%';

-- Create unique constraint on stripe_price_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'credit_packs_stripe_price_id_key'
  ) THEN
    ALTER TABLE credit_packs ADD CONSTRAINT credit_packs_stripe_price_id_key UNIQUE (stripe_price_id);
  END IF;
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE credit_packs ENABLE ROW LEVEL SECURITY;

-- Drop old policy if exists and recreate
DROP POLICY IF EXISTS "Anyone can view active credit packs" ON credit_packs;
CREATE POLICY "Anyone can view active credit packs"
  ON credit_packs FOR SELECT
  USING (is_active = TRUE);

-- Create index
CREATE INDEX IF NOT EXISTS idx_credit_packs_active
  ON credit_packs(is_active, display_order)
  WHERE is_active = TRUE;

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check columns
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'credit_packs'
-- ORDER BY ordinal_position;

-- Check data
-- SELECT * FROM credit_packs ORDER BY display_order;
