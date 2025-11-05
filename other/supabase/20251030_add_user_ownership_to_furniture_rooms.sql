-- Migration: Add user ownership to furniture and rooms
-- Description: Allow users to create their own furniture/rooms while keeping defaults
-- Author: System
-- Date: 2025-10-30

-- ============================================================================
-- FURNITURE_CATALOG: Add user_id column
-- ============================================================================

-- Add user_id column (nullable for default furniture)
ALTER TABLE furniture_catalog
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_furniture_catalog_user_id ON furniture_catalog(user_id);

-- Add comment
COMMENT ON COLUMN furniture_catalog.user_id IS 'NULL for default furniture (created by admins), UUID for user-specific furniture';

-- Update RLS policies for furniture_catalog
DROP POLICY IF EXISTS policy_furniture_catalog_read ON furniture_catalog;

-- New policy: Users can read default furniture (user_id IS NULL) OR their own furniture
CREATE POLICY policy_furniture_catalog_read
  ON furniture_catalog
  FOR SELECT
  TO authenticated, anon
  USING (
    is_active = TRUE
    AND (
      user_id IS NULL  -- Default furniture (visible to all)
      OR user_id = auth.uid()  -- User's own furniture
    )
  );

-- Policy: Users can insert their own furniture
CREATE POLICY policy_furniture_catalog_insert
  ON furniture_catalog
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()  -- Users can only create furniture for themselves
  );

-- Policy: Users can update their own furniture (not defaults)
CREATE POLICY policy_furniture_catalog_update
  ON furniture_catalog
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()  -- Can only update their own furniture
  )
  WITH CHECK (
    user_id = auth.uid()  -- Ensure user_id doesn't change
  );

-- Policy: Users can delete their own furniture (not defaults)
CREATE POLICY policy_furniture_catalog_delete
  ON furniture_catalog
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()  -- Can only delete their own furniture
  );

-- ============================================================================
-- ROOM_SPECIFICATIONS: Add user_id column
-- ============================================================================

-- Add user_id column (nullable for default rooms)
ALTER TABLE room_specifications
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_room_specifications_user_id ON room_specifications(user_id);

-- Add comment
COMMENT ON COLUMN room_specifications.user_id IS 'NULL for default rooms (created by admins), UUID for user-specific rooms';

-- Update RLS policies for room_specifications
DROP POLICY IF EXISTS policy_room_specifications_read ON room_specifications;

-- New policy: Users can read default rooms (user_id IS NULL) OR their own rooms
CREATE POLICY policy_room_specifications_read
  ON room_specifications
  FOR SELECT
  TO authenticated, anon
  USING (
    is_active = TRUE
    AND (
      user_id IS NULL  -- Default rooms (visible to all)
      OR user_id = auth.uid()  -- User's own rooms
    )
  );

-- Policy: Users can insert their own rooms
CREATE POLICY policy_room_specifications_insert
  ON room_specifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()  -- Users can only create rooms for themselves
  );

-- Policy: Users can update their own rooms (not defaults)
CREATE POLICY policy_room_specifications_update
  ON room_specifications
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()  -- Can only update their own rooms
  )
  WITH CHECK (
    user_id = auth.uid()  -- Ensure user_id doesn't change
  );

-- Policy: Users can delete their own rooms (not defaults)
CREATE POLICY policy_room_specifications_delete
  ON room_specifications
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()  -- Can only delete their own rooms
  );

-- ============================================================================
-- VERIFICATION QUERIES (for testing)
-- ============================================================================

-- Verify furniture_catalog schema
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'furniture_catalog' AND column_name = 'user_id';

-- Verify room_specifications schema
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'room_specifications' AND column_name = 'user_id';

-- Verify policies
-- SELECT schemaname, tablename, policyname, roles, cmd
-- FROM pg_policies
-- WHERE tablename IN ('furniture_catalog', 'room_specifications');
