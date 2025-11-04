-- =====================================================
-- MIGRATION: Create Stats Functions
-- =====================================================
-- Date: 2025-11-03
-- Purpose: Create SQL functions for credit statistics
-- =====================================================

BEGIN;

-- =====================================================
-- FUNCTION: get_credit_stats
-- =====================================================
-- Calcule les statistiques de crédits pour un utilisateur
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
    -- Somme des achats et bonus
    COALESCE(SUM(CASE WHEN transaction_type IN ('purchase', 'bonus') THEN amount ELSE 0 END), 0)::INTEGER AS total_purchased,
    -- Somme des déductions (en valeur absolue)
    COALESCE(SUM(CASE WHEN transaction_type = 'deduction' THEN ABS(amount) ELSE 0 END), 0)::INTEGER AS total_used,
    -- Solde restant depuis la table users
    (SELECT credits FROM users WHERE id = p_user_id)::INTEGER AS total_remaining,
    -- Nombre total de transactions
    COUNT(*)::INTEGER AS transactions_count
  FROM credit_transactions
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_credit_stats(UUID) IS
'Calcule les statistiques de crédits pour un utilisateur donné. Retourne total acheté, total utilisé, solde restant et nombre de transactions.';

-- =====================================================
-- FUNCTION: get_weekly_stats
-- =====================================================
-- Calcule les statistiques hebdomadaires pour un utilisateur
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
  -- Calculer la somme de la semaine actuelle
  SELECT COALESCE(SUM(ABS(amount)), 0)::INTEGER
  INTO this_week_sum
  FROM credit_transactions
  WHERE user_id = p_user_id
    AND transaction_type = 'deduction'
    AND created_at >= week_ago;

  -- Calculer la somme de la semaine précédente
  SELECT COALESCE(SUM(ABS(amount)), 0)::INTEGER
  INTO last_week_sum
  FROM credit_transactions
  WHERE user_id = p_user_id
    AND transaction_type = 'deduction'
    AND created_at >= two_weeks_ago
    AND created_at < week_ago;

  -- Retourner les résultats
  RETURN QUERY
  SELECT
    this_week_sum AS this_week_credits,
    last_week_sum AS last_week_credits,

    -- Calculer le pourcentage de changement
    CASE
      WHEN last_week_sum > 0 THEN
        ROUND(((this_week_sum::NUMERIC - last_week_sum::NUMERIC) / last_week_sum::NUMERIC) * 100)::INTEGER
      ELSE 0
    END AS percentage_change,

    -- Compter les images HD cette semaine (basé sur la description)
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

COMMENT ON FUNCTION get_weekly_stats(UUID) IS
'Calcule les statistiques hebdomadaires pour un utilisateur : crédits utilisés cette semaine vs semaine dernière, pourcentage de changement, et nombre d''images HD.';

-- =====================================================
-- FUNCTION: get_user_credit_stats (alias)
-- =====================================================
-- Alias pour get_credit_stats pour compatibilité
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
-- VERIFICATION
-- =====================================================
-- SELECT proname FROM pg_proc WHERE proname IN ('get_credit_stats', 'get_weekly_stats', 'get_user_credit_stats');
