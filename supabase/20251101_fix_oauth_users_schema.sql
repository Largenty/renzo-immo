-- Migration: Fix OAuth Users Schema
-- Date: 2025-11-01
-- Description:
--   1. Add auth_provider column to users table
--   2. Make password_hash nullable for OAuth users (Google, etc.)
--
-- Context:
--   OAuth users (Google) don't have a password_hash since authentication is managed by the provider.
--   We need to store the auth provider type and allow null password_hash.

-- =====================================================
-- 1. ADD auth_provider COLUMN
-- =====================================================
ALTER TABLE users
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'email' NOT NULL;

-- Add comment
COMMENT ON COLUMN users.auth_provider IS 'Authentication provider: email, google, etc.';

-- Create index for filtering by provider
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider);

-- =====================================================
-- 2. MAKE password_hash NULLABLE
-- =====================================================
-- This allows OAuth users to have NULL password_hash since they don't need one
ALTER TABLE users
ALTER COLUMN password_hash DROP NOT NULL;

-- Add comment
COMMENT ON COLUMN users.password_hash IS 'Password hash for email/password users. NULL for OAuth users (Google, etc.)';

-- =====================================================
-- 3. ADD CHECK CONSTRAINT
-- =====================================================
-- Ensure email/password users have a password_hash
-- OAuth users can have NULL password_hash
ALTER TABLE users
ADD CONSTRAINT check_password_hash_for_email_auth
CHECK (
  (auth_provider = 'email' AND password_hash IS NOT NULL) OR
  (auth_provider != 'email' AND password_hash IS NULL)
);

-- =====================================================
-- 4. UPDATE EXISTING ROWS (if needed)
-- =====================================================
-- Update existing users with arbitrary password_hash values to have proper auth_provider
-- This is a data migration for existing users who might have been created with old code

-- Set auth_provider to 'google' for users with 'oauth_google' password
UPDATE users
SET auth_provider = 'google', password_hash = NULL
WHERE password_hash = 'oauth_google';

-- Set auth_provider to 'email' for users with real password hashes
UPDATE users
SET auth_provider = 'email'
WHERE auth_provider = 'email' AND password_hash IS NOT NULL AND password_hash != 'managed_by_supabase_auth';

-- Migration completed successfully
