-- ============================================================================
-- Vérification des Index de Performance
-- Execute ce script après avoir appliqué 20251031_performance_indexes.sql
-- ============================================================================

\echo '🔍 Vérification des index de performance...\n'

-- Liste tous les nouveaux index créés
SELECT
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_indexes
JOIN pg_class ON pg_class.relname = indexname
WHERE schemaname = 'public'
  AND indexname IN (
    'idx_subscriptions_plan',
    'idx_payment_methods_user_default',
    'idx_invoices_user_created',
    'idx_sessions_user_expires',
    'idx_contact_status_created',
    'idx_room_furniture_presets_style_room',
    'idx_style_furniture_variants_composite',
    'idx_credit_transactions_reference'
  )
ORDER BY tablename, indexname;

\echo '\n✅ Migration terminée avec succès si 8 index affichés ci-dessus\n'
