-- =====================================================
-- MIGRATION: Fix View Count Race Condition
-- =====================================================
-- Date: 2025-11-03
-- Purpose: Make increment_view_count return the new count
--          to avoid race conditions with optimistic updates
-- =====================================================

BEGIN;

-- Drop the old function
DROP FUNCTION IF EXISTS increment_view_count(UUID);

-- Create improved function that returns the new count
CREATE OR REPLACE FUNCTION increment_view_count(project_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE projects
  SET
    view_count = COALESCE(view_count, 0) + 1,
    last_viewed_at = NOW()
  WHERE id = project_id
  RETURNING view_count INTO new_count;

  -- Return the actual new count, or 0 if project not found
  RETURN COALESCE(new_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Test the function
-- SELECT increment_view_count('your-project-id-here');
