-- ============================================================================
-- Migration: Performance Optimization - Database Indexes
-- Date: 2025-10-31
-- Description: Ajoute les index manquants pour optimiser les queries
--              les plus fréquentes de l'application
-- ============================================================================

-- ============================================================================
-- PRIORITY 1: CRITICAL MISSING INDEXES ON FOREIGN KEYS
-- ============================================================================

-- subscriptions.subscription_plan_id
-- Impact: Tous les JOINs avec subscription_plans sont lents sans cet index
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan
  ON subscriptions(subscription_plan_id);

COMMENT ON INDEX idx_subscriptions_plan IS
  'Index FK pour optimiser les JOINs subscription_plans';

-- ============================================================================
-- PRIORITY 2: COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- ============================================================================

-- payment_methods: "get user's default payment method"
-- Pattern: WHERE user_id = X AND is_default = true
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_default
  ON payment_methods(user_id, is_default)
  WHERE is_default = true;

COMMENT ON INDEX idx_payment_methods_user_default IS
  'Index composite pour trouver la méthode de paiement par défaut d''un user';

-- invoices: "get user invoices ordered by date"
-- Pattern: WHERE user_id = X ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_invoices_user_created
  ON invoices(user_id, created_at DESC);

COMMENT ON INDEX idx_invoices_user_created IS
  'Index composite pour liste factures user triées par date';

-- sessions: cleanup + user session management
-- Pattern: WHERE user_id = X AND expires_at > NOW()
CREATE INDEX IF NOT EXISTS idx_sessions_user_expires
  ON sessions(user_id, expires_at);

COMMENT ON INDEX idx_sessions_user_expires IS
  'Index composite pour gérer sessions user et cleanup expirations';

-- contact_submissions: admin dashboard
-- Pattern: WHERE status = X ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_contact_status_created
  ON contact_submissions(status, created_at DESC);

COMMENT ON INDEX idx_contact_status_created IS
  'Index composite pour dashboard admin contacts';

-- room_furniture_presets: "get presets for style X in room type Y"
-- Pattern: WHERE transformation_type_id = X AND room_type = Y
CREATE INDEX IF NOT EXISTS idx_room_furniture_presets_style_room
  ON room_furniture_presets(transformation_type_id, room_type)
  WHERE is_active = true;

COMMENT ON INDEX idx_room_furniture_presets_style_room IS
  'Index composite pour trouver presets meubles par style + type pièce';

-- style_furniture_variants: JOIN pattern fréquent
-- Pattern: WHERE transformation_type_id = X AND furniture_id IN (...)
CREATE INDEX IF NOT EXISTS idx_style_furniture_variants_composite
  ON style_furniture_variants(transformation_type_id, furniture_id);

COMMENT ON INDEX idx_style_furniture_variants_composite IS
  'Index composite pour optimiser JOINs variants meubles par style';

-- credit_transactions: v_credit_history_summary view optimization
-- Pattern: WHERE reference_type = X AND reference_id = Y
CREATE INDEX IF NOT EXISTS idx_credit_transactions_reference
  ON credit_transactions(reference_type, reference_id);

COMMENT ON INDEX idx_credit_transactions_reference IS
  'Index composite pour optimiser view historique crédits avec références';

-- ============================================================================
-- PRIORITY 3: OPTIMIZE VIEWS
-- ============================================================================

-- Refactoriser v_user_dashboard_stats pour éviter JOIN massif sur images
DROP VIEW IF EXISTS v_user_dashboard_stats;

CREATE VIEW v_user_dashboard_stats AS
SELECT
  u.id as user_id,
  -- Utiliser scalar subqueries au lieu de JOINs pour éviter cartesian products
  (
    SELECT COUNT(*)
    FROM projects
    WHERE user_id = u.id AND status = 'active'
  ) as total_projects,
  (
    SELECT COALESCE(SUM(completed_images), 0)
    FROM projects
    WHERE user_id = u.id AND status = 'active'
  ) as completed_images,
  (
    SELECT COUNT(*)
    FROM images
    WHERE user_id = u.id AND status = 'processing'
  ) as processing_images,
  u.credits_remaining,
  COALESCE(sp.credits_per_month, 0) as credits_per_month,
  s.current_period_end as next_renewal_date
FROM users u
LEFT JOIN subscription_plans sp ON sp.id = u.subscription_plan_id
LEFT JOIN LATERAL (
  SELECT current_period_end
  FROM subscriptions
  WHERE user_id = u.id AND status = 'active'
  ORDER BY current_period_end DESC
  LIMIT 1
) s ON TRUE;

COMMENT ON VIEW v_user_dashboard_stats IS
  'Vue optimisée stats dashboard user - utilise données dénormalisées projects';

-- ============================================================================
-- ANALYZE TABLES AFTER INDEX CREATION
-- ============================================================================

-- Mettre à jour les statistiques PostgreSQL pour l'optimiseur de requêtes
ANALYZE subscriptions;
ANALYZE payment_methods;
ANALYZE invoices;
ANALYZE sessions;
ANALYZE contact_submissions;
ANALYZE room_furniture_presets;
ANALYZE style_furniture_variants;
ANALYZE credit_transactions;

-- ============================================================================
-- VERIFICATION INDEXES
-- ============================================================================

-- Query pour vérifier que tous les index sont créés
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_indexes
JOIN pg_class ON pg_class.relname = indexname
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log de succès
DO $$
BEGIN
  RAISE NOTICE '✅ Migration performance indexes completed successfully';
  RAISE NOTICE 'Added 8 new indexes for query optimization';
  RAISE NOTICE 'Refactored v_user_dashboard_stats view';
END $$;
