-- =====================================================
-- MIGRATION COMPLÈTE ET SÉCURISÉE
-- =====================================================
-- Cette migration applique tout ce qui manque sans dupliquer
-- =====================================================

BEGIN;

-- =====================================================
-- PARTIE 1: Recréer credit_transactions avec la bonne structure
-- =====================================================

DROP TABLE IF EXISTS credit_transactions CASCADE;

CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('purchase', 'deduction', 'refund', 'bonus', 'adjustment')),
  reference_type VARCHAR(50),
  reference_id UUID,
  stripe_payment_intent_id VARCHAR(255),
  stripe_checkout_session_id VARCHAR(255),
  credit_pack_id UUID REFERENCES credit_packs(id) ON DELETE SET NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX idx_credit_transactions_user_created ON credit_transactions(user_id, created_at DESC);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX idx_credit_transactions_reference ON credit_transactions(reference_type, reference_id)
  WHERE reference_type IS NOT NULL AND reference_id IS NOT NULL;

-- RLS
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own credit transactions" ON credit_transactions;
CREATE POLICY "Users can view their own credit transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- PARTIE 2: Ajouter la colonne credits à users
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'credits'
  ) THEN
    ALTER TABLE users ADD COLUMN credits INTEGER DEFAULT 0 CHECK (credits >= 0);
    RAISE NOTICE 'Added credits column to users table';
  ELSE
    RAISE NOTICE 'Credits column already exists';
  END IF;
END $$;

-- =====================================================
-- PARTIE 3: Fonctions de gestion des crédits
-- =====================================================

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
  UPDATE users
  SET credits = credits + p_amount, updated_at = NOW()
  WHERE id = p_user_id
  RETURNING credits INTO v_new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  INSERT INTO credit_transactions (
    user_id, amount, balance_after, transaction_type, description,
    credit_pack_id, stripe_payment_intent_id, stripe_checkout_session_id,
    reference_type, reference_id
  ) VALUES (
    p_user_id, p_amount, v_new_balance, p_transaction_type, p_description,
    p_credit_pack_id, p_stripe_payment_intent_id, p_stripe_checkout_session_id,
    p_reference_type, p_reference_id
  ) RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
  SELECT credits INTO v_current_balance FROM users WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits. Required: %, Available: %', p_amount, v_current_balance;
  END IF;

  UPDATE users
  SET credits = credits - p_amount, updated_at = NOW()
  WHERE id = p_user_id
  RETURNING credits INTO v_new_balance;

  INSERT INTO credit_transactions (
    user_id, amount, balance_after, transaction_type, description, reference_type, reference_id
  ) VALUES (
    p_user_id, -p_amount, v_new_balance, 'deduction', p_description, p_reference_type, p_reference_id
  ) RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_credits(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_credits INTEGER;
BEGIN
  SELECT credits INTO v_credits FROM users WHERE id = p_user_id;
  RETURN COALESCE(v_credits, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PARTIE 4: Fonctions de statistiques
-- =====================================================

CREATE OR REPLACE FUNCTION get_credit_stats(p_user_id UUID)
RETURNS TABLE(
  total_purchased INTEGER,
  total_used INTEGER,
  total_remaining INTEGER,
  transactions_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN transaction_type IN ('purchase', 'bonus') THEN amount ELSE 0 END), 0)::INTEGER AS total_purchased,
    COALESCE(SUM(CASE WHEN transaction_type = 'deduction' THEN ABS(amount) ELSE 0 END), 0)::INTEGER AS total_used,
    (SELECT credits FROM users WHERE id = p_user_id)::INTEGER AS total_remaining,
    COUNT(*)::INTEGER AS transactions_count
  FROM credit_transactions
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_weekly_stats(p_user_id UUID)
RETURNS TABLE(
  this_week_credits INTEGER,
  last_week_credits INTEGER,
  percentage_change INTEGER,
  hd_images_count INTEGER,
  total_credits_used INTEGER
) AS $$
DECLARE
  week_ago TIMESTAMP := NOW() - INTERVAL '7 days';
  two_weeks_ago TIMESTAMP := NOW() - INTERVAL '14 days';
  this_week_sum INTEGER;
  last_week_sum INTEGER;
BEGIN
  SELECT COALESCE(SUM(ABS(amount)), 0)::INTEGER
  INTO this_week_sum
  FROM credit_transactions
  WHERE user_id = p_user_id
    AND transaction_type = 'deduction'
    AND created_at >= week_ago;

  SELECT COALESCE(SUM(ABS(amount)), 0)::INTEGER
  INTO last_week_sum
  FROM credit_transactions
  WHERE user_id = p_user_id
    AND transaction_type = 'deduction'
    AND created_at >= two_weeks_ago
    AND created_at < week_ago;

  RETURN QUERY
  SELECT
    this_week_sum AS this_week_credits,
    last_week_sum AS last_week_credits,
    CASE
      WHEN last_week_sum > 0 THEN
        ROUND(((this_week_sum::NUMERIC - last_week_sum::NUMERIC) / last_week_sum::NUMERIC) * 100)::INTEGER
      ELSE 0
    END AS percentage_change,
    COALESCE((
      SELECT COUNT(*)::INTEGER
      FROM credit_transactions
      WHERE user_id = p_user_id
        AND transaction_type = 'deduction'
        AND created_at >= week_ago
        AND description ILIKE '%HD%'
    ), 0) AS hd_images_count,
    this_week_sum AS total_credits_used;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_credit_stats(p_user_id UUID)
RETURNS TABLE(
  total_purchased INTEGER,
  total_used INTEGER,
  total_remaining INTEGER,
  transactions_count INTEGER
) AS $$
BEGIN
  RETURN QUERY SELECT * FROM get_credit_stats(p_user_id);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMIT;

-- =====================================================
-- VÉRIFICATION
-- =====================================================
-- SELECT proname FROM pg_proc
-- WHERE proname IN ('get_user_credits', 'get_credit_stats', 'get_weekly_stats', 'add_user_credits', 'deduct_user_credits');
