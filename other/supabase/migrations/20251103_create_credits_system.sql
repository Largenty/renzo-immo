-- =====================================================
-- MIGRATION: Create Credits and Payment System
-- =====================================================
-- Date: 2025-11-03
-- Purpose: Create tables for credits management and Stripe payments
-- =====================================================

BEGIN;

-- =====================================================
-- PART 1: CREDIT_PACKS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS credit_packs (
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

-- =====================================================
-- PART 2: CREDIT_TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS credit_transactions (
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

-- =====================================================
-- PART 3: STRIPE_EVENTS TABLE (Webhook deduplication)
-- =====================================================

CREATE TABLE IF NOT EXISTS stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE stripe_events IS 'Track processed Stripe webhook events to prevent duplicates';

-- =====================================================
-- PART 4: UPDATE USERS TABLE
-- =====================================================

-- Add credits column to users if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'credits'
  ) THEN
    ALTER TABLE users ADD COLUMN credits INTEGER DEFAULT 0 CHECK (credits >= 0);
  END IF;
END $$;

-- =====================================================
-- PART 5: INDEXES
-- =====================================================

-- Credit transactions indexes
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

-- Stripe events indexes
CREATE INDEX IF NOT EXISTS idx_stripe_events_event_id
  ON stripe_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_processed
  ON stripe_events(processed, created_at)
  WHERE processed = FALSE;

-- Credit packs indexes
CREATE INDEX IF NOT EXISTS idx_credit_packs_active
  ON credit_packs(is_active, display_order)
  WHERE is_active = TRUE;

-- =====================================================
-- PART 6: FUNCTIONS
-- =====================================================

-- Function to add credits to user
CREATE OR REPLACE FUNCTION add_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type VARCHAR(50),
  p_description TEXT DEFAULT NULL,
  p_credit_pack_id UUID DEFAULT NULL,
  p_stripe_payment_intent_id VARCHAR(255) DEFAULT NULL,
  p_stripe_checkout_session_id VARCHAR(255) DEFAULT NULL,
  p_reference_type VARCHAR(50) DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_new_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Update user credits
  UPDATE users
  SET credits = credits + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING credits INTO v_new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  -- Create transaction record
  INSERT INTO credit_transactions (
    user_id,
    amount,
    balance_after,
    transaction_type,
    description,
    credit_pack_id,
    stripe_payment_intent_id,
    stripe_checkout_session_id,
    reference_type,
    reference_id
  ) VALUES (
    p_user_id,
    p_amount,
    v_new_balance,
    p_transaction_type,
    p_description,
    p_credit_pack_id,
    p_stripe_payment_intent_id,
    p_stripe_checkout_session_id,
    p_reference_type,
    p_reference_id
  ) RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct credits (for image generation)
CREATE OR REPLACE FUNCTION deduct_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reference_type VARCHAR(50),
  p_reference_id UUID,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Get current balance
  SELECT credits INTO v_current_balance
  FROM users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  -- Check sufficient credits
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits. Required: %, Available: %', p_amount, v_current_balance;
  END IF;

  -- Deduct credits
  UPDATE users
  SET credits = credits - p_amount,
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING credits INTO v_new_balance;

  -- Create transaction record (negative amount for deduction)
  INSERT INTO credit_transactions (
    user_id,
    amount,
    balance_after,
    transaction_type,
    description,
    reference_type,
    reference_id
  ) VALUES (
    p_user_id,
    -p_amount,
    v_new_balance,
    'deduction',
    p_description,
    p_reference_type,
    p_reference_id
  ) RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user credit balance
CREATE OR REPLACE FUNCTION get_user_credits(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_credits INTEGER;
BEGIN
  SELECT credits INTO v_credits
  FROM users
  WHERE id = p_user_id;

  RETURN COALESCE(v_credits, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 7: RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE credit_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;

-- Credit packs: Anyone can read active packs
CREATE POLICY "Anyone can view active credit packs"
  ON credit_packs FOR SELECT
  USING (is_active = TRUE);

-- Credit transactions: Users can only see their own transactions
CREATE POLICY "Users can view their own credit transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Stripe events: No public access (admin only via service role)
CREATE POLICY "Only service role can manage stripe events"
  ON stripe_events FOR ALL
  USING (FALSE);

-- =====================================================
-- PART 8: SEED DATA (Example credit packs)
-- =====================================================

-- These will be replaced by actual Stripe products
-- This is just for reference, actual packs will be created via Stripe API
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

-- Check tables exist
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN ('credit_packs', 'credit_transactions', 'stripe_events');

-- Check functions exist
-- SELECT proname FROM pg_proc
-- WHERE proname IN ('add_user_credits', 'deduct_user_credits', 'get_user_credits');

-- Check RLS policies
-- SELECT tablename, policyname FROM pg_policies
-- WHERE tablename IN ('credit_packs', 'credit_transactions', 'stripe_events');
