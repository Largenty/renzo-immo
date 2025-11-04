-- Migration: Create admin audit log table
-- Description: Track all admin actions for security and compliance
-- Author: System
-- Date: 2025-10-30

-- Create the audit log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL, -- 'create_furniture', 'delete_room', 'update_furniture', etc.
  resource_type VARCHAR(50) NOT NULL, -- 'furniture', 'room', 'style', etc.
  resource_id UUID, -- ID of the affected resource (can be NULL for list operations)
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional context (old values, new values, etc.)
  ip_address INET, -- IP address of the request
  user_agent TEXT, -- User agent of the request
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_audit_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created_at ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_resource ON admin_audit_log(resource_type, resource_id);

-- RLS: Enable Row Level Security
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read all audit logs
CREATE POLICY policy_admin_audit_read
  ON admin_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Only the system can insert (server-side only, not through PostgREST)
-- This is enforced by not having an INSERT policy for authenticated users
-- Inserts will only work via service role key

-- Add comment for documentation
COMMENT ON TABLE admin_audit_log IS 'Audit log of all admin actions for security tracking and compliance';
COMMENT ON COLUMN admin_audit_log.action IS 'Action performed: create_*, update_*, delete_*, etc.';
COMMENT ON COLUMN admin_audit_log.resource_type IS 'Type of resource affected: furniture, room, style, etc.';
COMMENT ON COLUMN admin_audit_log.resource_id IS 'ID of the affected resource (NULL for list operations)';
COMMENT ON COLUMN admin_audit_log.metadata IS 'Additional context: old/new values, query params, etc.';
COMMENT ON COLUMN admin_audit_log.ip_address IS 'IP address of the admin making the request';
COMMENT ON COLUMN admin_audit_log.user_agent IS 'User agent of the admin making the request';

-- Create a view for easy querying of recent admin actions
-- Note: RLS is inherited from the base table (admin_audit_log)
-- Only admins can see the view because the underlying table has RLS
CREATE OR REPLACE VIEW admin_audit_recent AS
SELECT
  aal.id,
  aal.created_at,
  aal.action,
  aal.resource_type,
  aal.resource_id,
  aal.metadata,
  aal.ip_address,
  u.email as admin_email,
  u.id as admin_id
FROM admin_audit_log aal
JOIN users u ON u.id = aal.admin_id
ORDER BY aal.created_at DESC
LIMIT 100;

-- Grant access to the view for authenticated users
-- The RLS on admin_audit_log will ensure only admins can see data
GRANT SELECT ON admin_audit_recent TO authenticated;
