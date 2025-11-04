-- Migration: Add role column to users table for admin rights
-- Created: 2025-10-30
-- Purpose: Enable admin-only access to furniture and rooms management

-- Add role column with CHECK constraint
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'
CHECK (role IN ('user', 'admin'));

-- Create index for performance (queries filtering by role)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add comment for documentation
COMMENT ON COLUMN users.role IS 'User role: user (default) or admin. Admins can manage furniture_catalog and room_specifications.';

-- Example: Set a user as admin (replace with actual email)
-- UPDATE users SET role = 'admin' WHERE email = 'your-admin@email.com';
