-- =====================================================
-- MIGRATION: Add Triggers for Automatic Image Counters
-- =====================================================
-- Date: 2025-11-03
-- Purpose: Automatically update project image counters
--          to prevent race conditions and ensure accuracy
-- =====================================================

BEGIN;

-- =====================================================
-- PART 1: Create trigger function
-- =====================================================

CREATE OR REPLACE FUNCTION update_project_image_counters()
RETURNS TRIGGER AS $$
DECLARE
  affected_project_id UUID;
BEGIN
  -- Determine which project_id was affected
  IF TG_OP = 'DELETE' THEN
    affected_project_id := OLD.project_id;
  ELSE
    affected_project_id := NEW.project_id;
  END IF;

  -- Update the project counters
  UPDATE projects
  SET
    total_images = (
      SELECT COUNT(*)
      FROM images
      WHERE project_id = affected_project_id
    ),
    completed_images = (
      SELECT COUNT(*)
      FROM images
      WHERE project_id = affected_project_id
        AND status = 'completed'
    ),
    updated_at = NOW()
  WHERE id = affected_project_id;

  -- Return the appropriate row
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 2: Create triggers on images table
-- =====================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_project_counters_on_insert ON images;
DROP TRIGGER IF EXISTS trigger_update_project_counters_on_update ON images;
DROP TRIGGER IF EXISTS trigger_update_project_counters_on_delete ON images;

-- Trigger on INSERT
CREATE TRIGGER trigger_update_project_counters_on_insert
  AFTER INSERT ON images
  FOR EACH ROW
  EXECUTE FUNCTION update_project_image_counters();

-- Trigger on UPDATE (when status changes)
CREATE TRIGGER trigger_update_project_counters_on_update
  AFTER UPDATE OF status ON images
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_project_image_counters();

-- Trigger on DELETE
CREATE TRIGGER trigger_update_project_counters_on_delete
  AFTER DELETE ON images
  FOR EACH ROW
  EXECUTE FUNCTION update_project_image_counters();

-- =====================================================
-- PART 3: Fix existing counters (one-time sync)
-- =====================================================

-- Sync all existing projects
UPDATE projects p
SET
  total_images = (
    SELECT COUNT(*)
    FROM images
    WHERE project_id = p.id
  ),
  completed_images = (
    SELECT COUNT(*)
    FROM images
    WHERE project_id = p.id
      AND status = 'completed'
  ),
  updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM images WHERE project_id = p.id
);

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check trigger function exists
-- SELECT proname FROM pg_proc WHERE proname = 'update_project_image_counters';

-- Check triggers exist
-- SELECT tgname, tgrelid::regclass, tgenabled
-- FROM pg_trigger
-- WHERE tgname LIKE 'trigger_update_project_counters%';

-- Verify counters are correct
-- SELECT
--   p.id,
--   p.name,
--   p.total_images as stored_total,
--   p.completed_images as stored_completed,
--   (SELECT COUNT(*) FROM images WHERE project_id = p.id) as actual_total,
--   (SELECT COUNT(*) FROM images WHERE project_id = p.id AND status = 'completed') as actual_completed
-- FROM projects p
-- ORDER BY p.created_at DESC
-- LIMIT 10;
