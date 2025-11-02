-- =====================================================
-- MIGRATION: Remove User Furniture Features
-- =====================================================
-- Description: Remove user-created furniture and user ownership features
--              Keep system furniture catalog for automatic prompt generation
-- Date: 2025-11-02
-- Author: System
-- =====================================================
--
-- CONTEXT:
-- The furniture selection feature is being removed from the UI.
-- Users will no longer be able to:
--   - Select specific furniture items when generating images
--   - Create custom furniture in their catalog
--   - Create custom room presets
--
-- The prompt system will now AUTOMATICALLY select appropriate furniture
-- based on the style and room type using the system furniture catalog.
--
-- WHAT THIS MIGRATION DOES:
--   ✅ Removes furniture_ids column from images table
--   ✅ Removes user_id column from furniture_catalog (no more user furniture)
--   ✅ Removes user_id column from room_specifications
--   ✅ Deletes all user-created furniture items
--   ✅ Deletes all user-created presets
--   ✅ Simplifies RLS policies (system data only)
--   ✅ Keeps all system tables: furniture_catalog, style_furniture_variants, room_furniture_presets
-- =====================================================

BEGIN;

-- ============================================================================
-- STEP 1: Remove furniture_ids from images table
-- ============================================================================

-- Drop index first
DROP INDEX IF EXISTS idx_images_furniture_ids;

-- Drop the column
ALTER TABLE public.images
  DROP COLUMN IF EXISTS furniture_ids;

COMMENT ON TABLE public.images IS 'Images table - furniture_ids removed (now handled automatically by prompt system)';

-- ============================================================================
-- STEP 2: Clean up user-created data BEFORE removing columns
-- ============================================================================

-- Delete user-created furniture (keep only system/default furniture)
DELETE FROM furniture_catalog
WHERE user_id IS NOT NULL;

-- Delete user-created or non-system presets
DELETE FROM room_furniture_presets
WHERE user_id IS NOT NULL OR is_system = FALSE;

-- Delete user-created room specifications (if any)
DELETE FROM room_specifications
WHERE user_id IS NOT NULL;

-- ============================================================================
-- STEP 3: Drop RLS policies related to user ownership
-- ============================================================================

-- furniture_catalog policies
DROP POLICY IF EXISTS policy_furniture_catalog_read ON furniture_catalog;
DROP POLICY IF EXISTS policy_furniture_catalog_insert ON furniture_catalog;
DROP POLICY IF EXISTS policy_furniture_catalog_update ON furniture_catalog;
DROP POLICY IF EXISTS policy_furniture_catalog_delete ON furniture_catalog;

-- room_specifications policies
DROP POLICY IF EXISTS policy_room_specifications_read ON room_specifications;
DROP POLICY IF EXISTS policy_room_specifications_insert ON room_specifications;
DROP POLICY IF EXISTS policy_room_specifications_update ON room_specifications;
DROP POLICY IF EXISTS policy_room_specifications_delete ON room_specifications;

-- ============================================================================
-- STEP 4: Remove user_id columns
-- ============================================================================

-- Drop indexes first
DROP INDEX IF EXISTS idx_furniture_catalog_user_id;
DROP INDEX IF EXISTS idx_room_specifications_user_id;

-- Remove user_id from furniture_catalog
ALTER TABLE furniture_catalog
  DROP COLUMN IF EXISTS user_id;

-- Remove user_id from room_specifications
ALTER TABLE room_specifications
  DROP COLUMN IF EXISTS user_id;

-- ============================================================================
-- STEP 5: Restore simplified RLS policies (read-only for authenticated users)
-- ============================================================================

-- furniture_catalog: Everyone can read active furniture
CREATE POLICY policy_furniture_catalog_read_only
  ON furniture_catalog
  FOR SELECT
  TO authenticated, anon
  USING (is_active = TRUE);

-- room_specifications: Everyone can read active rooms
CREATE POLICY policy_room_specifications_read_only
  ON room_specifications
  FOR SELECT
  TO authenticated, anon
  USING (is_active = TRUE);

-- room_furniture_presets: Everyone can read system presets
DROP POLICY IF EXISTS policy_room_furniture_presets_read ON room_furniture_presets;

CREATE POLICY policy_room_furniture_presets_read_only
  ON room_furniture_presets
  FOR SELECT
  TO authenticated, anon
  USING (is_system = TRUE);

-- style_furniture_variants: Everyone can read
DROP POLICY IF EXISTS policy_style_furniture_variants_read ON style_furniture_variants;

CREATE POLICY policy_style_furniture_variants_read_only
  ON style_furniture_variants
  FOR SELECT
  TO authenticated, anon
  USING (TRUE);

-- ============================================================================
-- STEP 6: Update comments for clarity
-- ============================================================================

COMMENT ON TABLE furniture_catalog IS 'System furniture catalog - used automatically by prompt generation system';
COMMENT ON TABLE style_furniture_variants IS 'Style-specific furniture descriptions - used automatically by prompt system';
COMMENT ON TABLE room_furniture_presets IS 'Default furniture presets per style+room - used automatically by prompt system';
COMMENT ON TABLE room_specifications IS 'System room specifications - read-only for users';

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify furniture_ids column removed from images
-- SELECT column_name
-- FROM information_schema.columns
-- WHERE table_name = 'images' AND column_name = 'furniture_ids';
-- Expected: 0 rows

-- Verify user_id columns removed
-- SELECT column_name, table_name
-- FROM information_schema.columns
-- WHERE table_name IN ('furniture_catalog', 'room_specifications')
--   AND column_name = 'user_id';
-- Expected: 0 rows

-- Count remaining furniture (should be system only)
-- SELECT COUNT(*) as system_furniture_count FROM furniture_catalog;

-- Count remaining presets (should be system only)
-- SELECT COUNT(*) as system_presets_count FROM room_furniture_presets WHERE is_system = TRUE;

-- Verify policies
-- SELECT tablename, policyname, cmd
-- FROM pg_policies
-- WHERE tablename IN ('furniture_catalog', 'room_specifications', 'room_furniture_presets', 'style_furniture_variants')
-- ORDER BY tablename, policyname;

-- =====================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- =====================================================
--
-- To rollback this migration:
-- 1. Re-add furniture_ids to images:
--    ALTER TABLE images ADD COLUMN furniture_ids UUID[] DEFAULT '{}';
--    CREATE INDEX idx_images_furniture_ids ON images USING GIN (furniture_ids);
--
-- 2. Re-add user_id columns:
--    ALTER TABLE furniture_catalog ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
--    ALTER TABLE room_specifications ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
--
-- 3. Restore full RLS policies from migration 20251030_add_user_ownership_to_furniture_rooms.sql
--
-- Note: User-created data cannot be restored after this migration!
-- =====================================================
