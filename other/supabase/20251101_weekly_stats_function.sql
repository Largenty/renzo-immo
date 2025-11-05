-- Migration: Créer une fonction SQL optimisée pour les statistiques hebdomadaires
-- Cette fonction calcule les stats de la semaine actuelle vs semaine précédente
-- Performance: Calculs en SQL natif au lieu de charger 100 transactions en JS

-- Fonction pour calculer les statistiques hebdomadaires d'un utilisateur
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
    AND type = 'usage'
    AND created_at >= week_ago;

  -- Calculer la somme de la semaine précédente
  SELECT COALESCE(SUM(ABS(amount)), 0)::INTEGER
  INTO last_week_sum
  FROM credit_transactions
  WHERE user_id = p_user_id
    AND type = 'usage'
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
        AND type = 'usage'
        AND created_at >= week_ago
        AND description ILIKE '%HD%'
    ), 0) AS hd_images_count,

    this_week_sum AS total_credits_used;
END;
$$ LANGUAGE plpgsql STABLE;

-- Commentaire pour la documentation
COMMENT ON FUNCTION get_weekly_stats(UUID) IS
'Calcule les statistiques hebdomadaires pour un utilisateur : crédits utilisés cette semaine vs semaine dernière, pourcentage de changement, et nombre d''images HD.';
