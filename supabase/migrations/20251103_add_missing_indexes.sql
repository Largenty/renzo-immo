-- =====================================================
-- MIGRATION: Add Missing Database Indexes
-- =====================================================
-- Date: 2025-11-03
-- Purpose: Add indexes for frequently queried columns
--          to improve query performance
-- =====================================================

BEGIN;

-- =====================================================
-- PART 1: IMAGES TABLE INDEXES
-- =====================================================

-- Index on project_id (foreign key, frequently queried)
CREATE INDEX IF NOT EXISTS idx_images_project_id
  ON images(project_id)
  WHERE project_id IS NOT NULL;

-- Index on user_id (for user-specific queries)
CREATE INDEX IF NOT EXISTS idx_images_user_id
  ON images(user_id)
  WHERE user_id IS NOT NULL;

-- Index on status (frequently filtered)
CREATE INDEX IF NOT EXISTS idx_images_status
  ON images(status);

-- Composite index for project + status queries
CREATE INDEX IF NOT EXISTS idx_images_project_status
  ON images(project_id, status)
  WHERE project_id IS NOT NULL;

-- Index for processing images with task_id (polling queries)
CREATE INDEX IF NOT EXISTS idx_images_processing_with_task
  ON images(status, metadata)
  WHERE status = 'processing' AND metadata IS NOT NULL;

-- Index for created_at (ordering)
CREATE INDEX IF NOT EXISTS idx_images_created_at
  ON images(created_at DESC);

-- =====================================================
-- PART 2: PROJECTS TABLE INDEXES
-- =====================================================

-- Index on user_id (foreign key, frequently queried)
CREATE INDEX IF NOT EXISTS idx_projects_user_id
  ON projects(user_id)
  WHERE user_id IS NOT NULL;

-- Index on status (frequently filtered)
CREATE INDEX IF NOT EXISTS idx_projects_status
  ON projects(status);

-- Composite index for user + status queries
CREATE INDEX IF NOT EXISTS idx_projects_user_status
  ON projects(user_id, status)
  WHERE user_id IS NOT NULL;

-- Index on created_at (ordering)
CREATE INDEX IF NOT EXISTS idx_projects_created_at
  ON projects(created_at DESC);

-- Index on updated_at (ordering)
CREATE INDEX IF NOT EXISTS idx_projects_updated_at
  ON projects(updated_at DESC);

-- =====================================================
-- PART 3: USERS TABLE INDEXES
-- =====================================================

-- Index on email (frequently queried for lookups)
CREATE INDEX IF NOT EXISTS idx_users_email
  ON users(email);

-- Index on created_at (analytics queries)
CREATE INDEX IF NOT EXISTS idx_users_created_at
  ON users(created_at DESC);

-- =====================================================
-- PART 4: TRANSFORMATION_TYPES INDEXES
-- =====================================================

-- Index on is_active (frequently filtered)
CREATE INDEX IF NOT EXISTS idx_transformation_types_active
  ON transformation_types(is_active)
  WHERE is_active = TRUE;

-- Index on user_id for custom types
CREATE INDEX IF NOT EXISTS idx_transformation_types_user_id
  ON transformation_types(user_id)
  WHERE user_id IS NOT NULL;

-- Composite index for user + active queries
CREATE INDEX IF NOT EXISTS idx_transformation_types_user_active
  ON transformation_types(user_id, is_active)
  WHERE is_active = TRUE;

-- =====================================================
-- PART 5: CREDITS TABLE INDEXES (if exists)
-- =====================================================

-- Check if credits table exists before creating indexes
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'credits'
  ) THEN
    -- Index on user_id (foreign key, frequently queried)
    CREATE INDEX IF NOT EXISTS idx_credits_user_id
      ON credits(user_id);

    -- Index on created_at for history queries
    CREATE INDEX IF NOT EXISTS idx_credits_created_at
      ON credits(created_at DESC);

    -- Composite index for user + date range queries
    CREATE INDEX IF NOT EXISTS idx_credits_user_created
      ON credits(user_id, created_at DESC);
  END IF;
END $$;

-- =====================================================
-- PART 6: AUDIT_LOGS TABLE INDEXES (if exists)
-- =====================================================

-- Check if audit_logs table exists before creating indexes
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'audit_logs'
  ) THEN
    -- Index on user_id
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
      ON audit_logs(user_id);

    -- Index on action
    CREATE INDEX IF NOT EXISTS idx_audit_logs_action
      ON audit_logs(action);

    -- Index on created_at
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
      ON audit_logs(created_at DESC);

    -- Composite index for user + date queries
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created
      ON audit_logs(user_id, created_at DESC);
  END IF;
END $$;

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check all indexes on images table
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   indexdef
-- FROM pg_indexes
-- WHERE tablename = 'images'
-- ORDER BY indexname;

-- Check all indexes on projects table
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   indexdef
-- FROM pg_indexes
-- WHERE tablename = 'projects'
-- ORDER BY indexname;

-- Check index usage statistics
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan as index_scans,
--   idx_tup_read as tuples_read,
--   idx_tup_fetch as tuples_fetched
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;
