-- =====================================================
-- RESET DATABASE - Keep Users Only
-- =====================================================
-- Date: 2025-11-02
-- Purpose: Reset all application data while preserving users and authentication
-- WARNING: This will DELETE ALL:
--   - Projects
--   - Images
--   - Credit transactions
--   - Custom styles
--   - Furniture data
--   - Room specifications
--   - Style palettes
--
-- PRESERVED:
--   - Users (auth.users)
--   - User profiles
--   - User authentication data
-- =====================================================

BEGIN;

-- =====================================================
-- PART 1: DELETE ALL APPLICATION DATA
-- =====================================================
-- Order matters due to foreign key constraints
-- Delete from child tables to parent tables

-- 1. Delete credit transactions (depends on users but we're keeping users)
DELETE FROM credit_transactions WHERE TRUE;

-- 2. Delete images (depends on projects, transformation_types)
DELETE FROM images WHERE TRUE;

-- 3. Delete projects (depends on users but we're keeping users)
DELETE FROM projects WHERE TRUE;

-- 4. Delete furniture-related data (if tables exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'style_furniture_variants') THEN
    DELETE FROM style_furniture_variants WHERE TRUE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'furniture_presets') THEN
    DELETE FROM furniture_presets WHERE TRUE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'furniture_catalog') THEN
    DELETE FROM furniture_catalog WHERE TRUE;
  END IF;
END $$;

-- 5. Delete style palettes (depends on transformation_types)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'style_palettes') THEN
    DELETE FROM style_palettes WHERE TRUE;
  END IF;
END $$;

-- 6. Delete transformation types (no dependencies)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transformation_types') THEN
    DELETE FROM transformation_types WHERE TRUE;
  END IF;
END $$;

-- 7. Delete room specifications (no dependencies)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'room_specifications') THEN
    DELETE FROM room_specifications WHERE TRUE;
  END IF;
END $$;

-- 8. Reset user credits (keep profiles but reset credits)
UPDATE users SET
  credits_remaining = 100,  -- Reset to default starting credits
  updated_at = NOW()
WHERE TRUE;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Uncomment to see what's left in each table

-- SELECT 'users' as table_name, COUNT(*) as count FROM users
-- UNION ALL
-- SELECT 'projects', COUNT(*) FROM projects
-- UNION ALL
-- SELECT 'images', COUNT(*) FROM images
-- UNION ALL
-- SELECT 'credit_transactions', COUNT(*) FROM credit_transactions
-- UNION ALL
-- SELECT 'transformation_types', COUNT(*) FROM transformation_types
-- UNION ALL
-- SELECT 'style_palettes', COUNT(*) FROM style_palettes
-- UNION ALL
-- SELECT 'room_specifications', COUNT(*) FROM room_specifications
-- UNION ALL
-- SELECT 'furniture_catalog', COUNT(*) FROM furniture_catalog
-- ORDER BY table_name;

COMMIT;

-- =====================================================
-- CONFIRMATION MESSAGE
-- =====================================================
-- All application data has been deleted
-- Users and authentication data have been preserved
-- All users have been reset to 100 credits
-- =====================================================
