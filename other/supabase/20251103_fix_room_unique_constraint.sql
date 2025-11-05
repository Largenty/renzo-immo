-- =====================================================
-- MIGRATION: Fix Room Specifications Unique Constraint
-- =====================================================
-- Date: 2025-11-03
-- Purpose: Allow users to create custom versions of room types
-- Issue: Current UNIQUE constraint on room_type prevents users
--        from creating their own versions of existing room types
-- Solution: Replace with partial unique constraint on (user_id, room_type)
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: Drop old unique constraint on room_type alone
-- =====================================================

-- Drop the existing unique constraint that prevents duplicate room_types
ALTER TABLE room_specifications
DROP CONSTRAINT IF EXISTS room_specifications_room_type_key;

-- Also drop the unique index if it exists
DROP INDEX IF EXISTS room_specifications_room_type_key;

-- =====================================================
-- STEP 2: Create composite unique constraint
-- =====================================================

-- Create unique constraint on (user_id, room_type) combination
-- This allows:
-- - One default room per type (user_id IS NULL)
-- - One custom room per type per user (user_id = specific user)
CREATE UNIQUE INDEX IF NOT EXISTS idx_room_specifications_user_room_type
  ON room_specifications(COALESCE(user_id::text, 'default'), room_type);

-- Alternative: If you want true NULL handling, use a partial unique index
-- This ensures only ONE default room per type (where user_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_room_specifications_default_room_type
  ON room_specifications(room_type)
  WHERE user_id IS NULL;

-- And one room per user per type
CREATE UNIQUE INDEX IF NOT EXISTS idx_room_specifications_user_room_unique
  ON room_specifications(user_id, room_type)
  WHERE user_id IS NOT NULL;

-- Drop the COALESCE version since we're using partial indexes instead
DROP INDEX IF EXISTS idx_room_specifications_user_room_type;

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check constraints
-- SELECT
--   conname as constraint_name,
--   contype as constraint_type,
--   pg_get_constraintdef(oid) as definition
-- FROM pg_constraint
-- WHERE conrelid = 'room_specifications'::regclass
-- ORDER BY conname;

-- Check indexes
-- SELECT
--   indexname,
--   indexdef
-- FROM pg_indexes
-- WHERE tablename = 'room_specifications'
-- ORDER BY indexname;

-- Test: Try to create duplicate default room (should fail)
-- INSERT INTO room_specifications (room_type, display_name_fr, display_name_en, constraints_text)
-- VALUES ('salon', 'Test Salon', 'Test Living Room', 'Test constraints');

-- Test: Try to create user-specific room with existing type (should succeed)
-- INSERT INTO room_specifications (room_type, display_name_fr, display_name_en, constraints_text, user_id)
-- VALUES ('salon', 'Mon Salon Custom', 'My Custom Living Room', 'Custom constraints', 'dcfad524-98d7-489d-ad66-1f17a2580465');
