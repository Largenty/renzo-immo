-- =====================================================
-- MIGRATION: Fix credit_transactions schema
-- =====================================================
-- Date: 2025-11-03
-- Purpose: Add missing transaction_type column and update schema
-- =====================================================

BEGIN;

-- Drop and recreate credit_transactions table with correct schema
DROP TABLE IF EXISTS credit_transactions CASCADE;

CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Can be negative for deductions
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('purchase', 'deduction', 'refund', 'bonus', 'adjustment')),

  -- Reference data
  reference_type VARCHAR(50), -- 'image', 'project', 'payment', etc.
  reference_id UUID, -- ID of the related entity

  -- Stripe payment data (for purchases)
  stripe_payment_intent_id VARCHAR(255),
  stripe_checkout_session_id VARCHAR(255),
  credit_pack_id UUID REFERENCES credit_packs(id) ON DELETE SET NULL,

  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE credit_transactions IS 'All credit transactions (purchases, usage, refunds)';
COMMENT ON COLUMN credit_transactions.amount IS 'Credit change amount (positive for add, negative for deduct)';
COMMENT ON COLUMN credit_transactions.balance_after IS 'User credit balance after this transaction';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id
  ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at
  ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_created
  ON credit_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type
  ON credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_reference
  ON credit_transactions(reference_type, reference_id)
  WHERE reference_type IS NOT NULL AND reference_id IS NOT NULL;

-- Enable RLS
DO $$
BEGIN
  ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'RLS already enabled on credit_transactions';
END $$;

-- RLS Policy: Users can only see their own transactions
DROP POLICY IF EXISTS "Users can view their own credit transactions" ON credit_transactions;
CREATE POLICY "Users can view their own credit transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Add credits column to users if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'credits'
  ) THEN
    ALTER TABLE users ADD COLUMN credits INTEGER DEFAULT 0 CHECK (credits >= 0);
    RAISE NOTICE 'Added credits column to users table';
  ELSE
    RAISE NOTICE 'Credits column already exists in users table';
  END IF;
END $$;

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'credit_transactions' ORDER BY ordinal_position;
