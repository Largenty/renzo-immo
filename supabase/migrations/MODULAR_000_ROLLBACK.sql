-- =====================================================
-- ROLLBACK: Supprimer le système modulaire complet
-- =====================================================
-- Description: Supprime toutes les tables du système modulaire
-- WARNING: Cette opération est IRREVERSIBLE
-- DANGER: Toutes les données modulaires seront perdues
-- =====================================================

BEGIN;

-- =====================================================
-- ATTENTION: LIRE AVANT D'EXECUTER
-- =====================================================
-- Ce script supprime:
-- - 5 tables (room_specifications, style_palettes, furniture_catalog,
--              style_furniture_variants, room_furniture_presets)
-- - 2 ENUMs (furniture_category, room_type)
-- - Toutes les données insérées (10 rooms, 23 meubles, 3 styles, etc.)
--
-- Les tables transformation_types et images NE SONT PAS touchées
-- =====================================================

-- Désactiver temporairement les vérifications de contraintes
SET session_replication_role = replica;

-- =====================================================
-- 1. SUPPRIMER LES TABLES (dans l'ordre inverse des FK)
-- =====================================================

-- Supprimer les presets en premier (dépendent de tout)
DROP TABLE IF EXISTS public.room_furniture_presets CASCADE;

-- Supprimer les variantes de meubles
DROP TABLE IF EXISTS public.style_furniture_variants CASCADE;

-- Supprimer le catalogue de meubles
DROP TABLE IF EXISTS public.furniture_catalog CASCADE;

-- Supprimer les palettes de styles
DROP TABLE IF EXISTS public.style_palettes CASCADE;

-- Supprimer les spécifications de pièces
DROP TABLE IF EXISTS public.room_specifications CASCADE;

-- =====================================================
-- 2. SUPPRIMER LES FONCTIONS
-- =====================================================

DROP FUNCTION IF EXISTS public.fn_update_updated_at() CASCADE;

-- =====================================================
-- 3. SUPPRIMER LES ENUMS
-- =====================================================

-- ATTENTION: room_type pourrait être utilisé ailleurs
-- Décommenter uniquement si tu es SÛR de ne pas l'utiliser ailleurs
-- DROP TYPE IF EXISTS room_type CASCADE;

-- furniture_category est safe à supprimer (spécifique au système modulaire)
DROP TYPE IF EXISTS furniture_category CASCADE;

-- =====================================================
-- 4. NETTOYER LES POLICIES RLS
-- =====================================================

-- Les policies sont automatiquement supprimées avec les tables via CASCADE

-- Réactiver les vérifications
SET session_replication_role = DEFAULT;

COMMIT;

-- =====================================================
-- VÉRIFICATIONS POST-ROLLBACK
-- =====================================================

-- Vérifier que les tables ont été supprimées
-- SELECT tablename FROM pg_tables
-- WHERE schemaname = 'public'
--   AND tablename IN ('room_specifications', 'style_palettes', 'furniture_catalog',
--                     'style_furniture_variants', 'room_furniture_presets');
-- Devrait retourner 0 lignes

-- Vérifier que les ENUMs ont été supprimés
-- SELECT typname FROM pg_type
-- WHERE typname IN ('furniture_category', 'room_type');
-- furniture_category devrait être absent

-- =====================================================
-- NOTES IMPORTANTES
-- =====================================================

-- 1. Ce script NE TOUCHE PAS:
--    - transformation_types (table principale des styles)
--    - images (table des images générées)
--    - Toutes les autres tables de l'application
--
-- 2. Si tu as des images.furniture_ids déjà créées:
--    ALTER TABLE images DROP COLUMN IF EXISTS furniture_ids;
--
-- 3. Pour réinstaller le système modulaire après rollback:
--    - Réexécuter MODULAR_001 à MODULAR_005 dans l'ordre
--
-- 4. ENUM room_type:
--    - Commenté par sécurité (peut être utilisé ailleurs)
--    - Si tu veux le supprimer, décommenter la ligne ci-dessus
--    - Si room_type est utilisé dans d'autres tables, le DROP échouera
--
-- =====================================================
