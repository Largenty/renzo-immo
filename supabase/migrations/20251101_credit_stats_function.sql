-- Migration: Créer une fonction SQL optimisée pour les statistiques de crédits
-- Cette fonction remplace le calcul côté application par une agrégation SQL native
-- Performance: 10 000 transactions → 1 requête en ~10ms au lieu de charger toutes les lignes

-- Fonction pour calculer les statistiques de crédits d'un utilisateur
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
    COALESCE(SUM(CASE WHEN type IN ('purchase', 'bonus') THEN amount ELSE 0 END), 0)::INTEGER AS total_purchased,
    -- Somme des utilisations (en valeur absolue)
    COALESCE(SUM(CASE WHEN type = 'usage' THEN ABS(amount) ELSE 0 END), 0)::INTEGER AS total_used,
    -- Solde restant (somme de tous les montants, usage étant négatif)
    COALESCE(SUM(amount), 0)::INTEGER AS total_remaining,
    -- Nombre total de transactions
    COUNT(*)::INTEGER AS transactions_count
  FROM credit_transactions
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Commentaire pour la documentation
COMMENT ON FUNCTION get_credit_stats(UUID) IS
'Calcule les statistiques de crédits pour un utilisateur donné. Retourne total acheté, total utilisé, solde restant et nombre de transactions.';
