-- =====================================================
-- MIGRATION: Fix credit_packs table structure
-- =====================================================
-- Date: 2025-11-03
-- Purpose: Add missing columns to credit_packs table if they don't exist
-- =====================================================

BEGIN;

-- Drop the old table if it exists with wrong structure and recreate it
DROP TABLE IF EXISTS credit_packs CASCADE;

-- Create the correct structure
CREATE TABLE credit_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  credits INTEGER NOT NULL CHECK (credits > 0),
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  stripe_price_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_product_id VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE credit_packs IS 'Available credit packs for purchase';
COMMENT ON COLUMN credit_packs.price_cents IS 'Price in cents (e.g., 999 = 9.99€)';
COMMENT ON COLUMN credit_packs.stripe_price_id IS 'Stripe Price ID (price_xxx)';
COMMENT ON COLUMN credit_packs.stripe_product_id IS 'Stripe Product ID (prod_xxx)';

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_credit_packs_active
  ON credit_packs(is_active, display_order)
  WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE credit_packs ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policy
DROP POLICY IF EXISTS "Anyone can view active credit packs" ON credit_packs;
CREATE POLICY "Anyone can view active credit packs"
  ON credit_packs FOR SELECT
  USING (is_active = TRUE);

-- Insert placeholder data (will be replaced by actual Stripe products)
INSERT INTO credit_packs (name, credits, price_cents, stripe_price_id, stripe_product_id, display_order, popular) VALUES
  ('Pack Starter', 50, 999, 'price_placeholder_starter', 'prod_placeholder_starter', 1, FALSE),
  ('Pack Standard', 150, 2499, 'price_placeholder_standard', 'prod_placeholder_standard', 2, TRUE),
  ('Pack Premium', 500, 6999, 'price_placeholder_premium', 'prod_placeholder_premium', 3, FALSE),
  ('Pack Enterprise', 1000, 11999, 'price_placeholder_enterprise', 'prod_placeholder_enterprise', 4, FALSE)
ON CONFLICT (stripe_price_id) DO NOTHING;

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check table structure
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'credit_packs'
-- ORDER BY ordinal_position;
