-- =====================================================
-- MIGRATION: Add Showcase/Share Feature
-- =====================================================
-- Date: 2025-11-03
-- Purpose: Add fields for public project showcase pages
-- Features:
--   - User display name for personalized URLs
--   - Project slug for SEO-friendly URLs
--   - Public/private toggle for projects
--   - View counter for analytics
-- =====================================================

BEGIN;

-- =====================================================
-- PART 1: ADD FIELDS TO USERS TABLE
-- =====================================================

-- Add display_name for showcase URL (ex: /showcase/jean-dupont/...)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);

-- Create unique index on display_name (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_display_name_lower
  ON users(LOWER(display_name))
  WHERE display_name IS NOT NULL;

-- Create index for fast lookup
CREATE INDEX IF NOT EXISTS idx_users_display_name
  ON users(display_name)
  WHERE display_name IS NOT NULL;

-- =====================================================
-- PART 2: ADD FIELDS TO PROJECTS TABLE
-- =====================================================

-- Add slug for SEO-friendly URLs (ex: /showcase/jean-dupont/villa-moderne-2025)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS slug VARCHAR(255),
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMP WITH TIME ZONE;

-- Create unique index on (user_id, slug) combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_user_slug
  ON projects(user_id, slug)
  WHERE slug IS NOT NULL;

-- Create index for public projects lookup
CREATE INDEX IF NOT EXISTS idx_projects_public
  ON projects(is_public, user_id)
  WHERE is_public = true;

-- Create index for slug lookup
CREATE INDEX IF NOT EXISTS idx_projects_slug
  ON projects(slug)
  WHERE slug IS NOT NULL;

-- =====================================================
-- PART 3: CREATE SLUG GENERATION FUNCTION
-- =====================================================

-- Function to generate a URL-safe slug from text
CREATE OR REPLACE FUNCTION generate_slug(text_input TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  -- Convert to lowercase
  slug := LOWER(text_input);

  -- Remove accents (French characters)
  slug := TRANSLATE(slug,
    'àáâãäåāăąèéêëēĕėęěìíîïīĭįıòóôõöøōŏőùúûüūŭůűųñçćĉċčďđĝğġģĥħĵķĺļľŀłńņňŋŕŗřśŝşšţťŧŵŷźżž',
    'aaaaaaaaaeeeeeeeeeiiiiiiioooooooooouuuuuuuuuncccccdgggghhjklllllnnnrrrssssttwyzzzz'
  );

  -- Replace spaces and special characters with hyphens
  slug := REGEXP_REPLACE(slug, '[^a-z0-9]+', '-', 'g');

  -- Remove leading/trailing hyphens
  slug := TRIM(BOTH '-' FROM slug);

  -- Limit length to 100 characters
  slug := SUBSTRING(slug FROM 1 FOR 100);

  RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- PART 4: AUTO-GENERATE DISPLAY_NAME FOR EXISTING USERS
-- =====================================================

-- Generate display_name from first_name + last_name for existing users
UPDATE users
SET display_name = generate_slug(
  COALESCE(first_name, '') || '-' || COALESCE(last_name, '')
)
WHERE display_name IS NULL
  AND (first_name IS NOT NULL OR last_name IS NOT NULL);

-- For users without names, use email prefix
UPDATE users
SET display_name = generate_slug(
  SPLIT_PART(email, '@', 1)
)
WHERE display_name IS NULL;

-- Handle duplicates by appending user ID suffix
WITH duplicates AS (
  SELECT
    id,
    display_name,
    ROW_NUMBER() OVER (PARTITION BY LOWER(display_name) ORDER BY created_at) as rn
  FROM users
  WHERE display_name IS NOT NULL
)
UPDATE users u
SET display_name = d.display_name || '-' || SUBSTRING(u.id::text FROM 1 FOR 8)
FROM duplicates d
WHERE u.id = d.id
  AND d.rn > 1;

-- =====================================================
-- PART 5: AUTO-GENERATE SLUGS FOR EXISTING PROJECTS
-- =====================================================

-- Generate slug from project name for existing projects
UPDATE projects
SET slug = generate_slug(name)
WHERE slug IS NULL;

-- Handle duplicate slugs for the same user by appending a number
WITH duplicates AS (
  SELECT
    id,
    user_id,
    slug,
    ROW_NUMBER() OVER (PARTITION BY user_id, slug ORDER BY created_at) as rn
  FROM projects
  WHERE slug IS NOT NULL
)
UPDATE projects p
SET slug = d.slug || '-' || d.rn
FROM duplicates d
WHERE p.id = d.id
  AND d.rn > 1;

-- =====================================================
-- PART 6: CREATE TRIGGER TO AUTO-GENERATE SLUG ON INSERT/UPDATE
-- =====================================================

-- Function to auto-generate slug when project name changes
CREATE OR REPLACE FUNCTION auto_generate_project_slug()
RETURNS TRIGGER AS $$
DECLARE
  new_slug TEXT;
  slug_exists BOOLEAN;
  counter INTEGER := 1;
BEGIN
  -- Only generate if slug is NULL or name has changed
  IF (TG_OP = 'INSERT' AND NEW.slug IS NULL) OR
     (TG_OP = 'UPDATE' AND OLD.name != NEW.name AND NEW.slug = OLD.slug) THEN

    -- Generate base slug
    new_slug := generate_slug(NEW.name);

    -- Check if slug already exists for this user
    SELECT EXISTS(
      SELECT 1 FROM projects
      WHERE user_id = NEW.user_id
        AND slug = new_slug
        AND id != NEW.id
    ) INTO slug_exists;

    -- If exists, append counter
    WHILE slug_exists LOOP
      counter := counter + 1;
      new_slug := generate_slug(NEW.name) || '-' || counter;

      SELECT EXISTS(
        SELECT 1 FROM projects
        WHERE user_id = NEW.user_id
          AND slug = new_slug
          AND id != NEW.id
      ) INTO slug_exists;
    END LOOP;

    NEW.slug := new_slug;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_project_slug ON projects;
CREATE TRIGGER trigger_auto_generate_project_slug
  BEFORE INSERT OR UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_project_slug();

-- =====================================================
-- PART 7: CREATE VIEW FOR PUBLIC SHOWCASE
-- =====================================================

-- View to fetch public project data with owner info
CREATE OR REPLACE VIEW public_projects AS
SELECT
  p.id,
  p.slug,
  p.name,
  p.cover_image_url,
  p.total_images,
  p.completed_images,
  p.view_count,
  p.created_at,
  p.updated_at,
  u.id as user_id,
  u.display_name,
  u.first_name,
  u.last_name,
  u.company,
  u.avatar_url
FROM projects p
JOIN users u ON p.user_id = u.id
WHERE p.is_public = true
  AND p.status = 'active';

-- =====================================================
-- PART 8: CREATE ATOMIC VIEW COUNT INCREMENT FUNCTION
-- =====================================================

-- Function to atomically increment view count (prevents race conditions)
CREATE OR REPLACE FUNCTION increment_view_count(project_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE projects
  SET
    view_count = COALESCE(view_count, 0) + 1,
    last_viewed_at = NOW()
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Uncomment to verify the migration

-- Check users with display_name
-- SELECT id, email, first_name, last_name, display_name
-- FROM users
-- ORDER BY created_at
-- LIMIT 10;

-- Check projects with slug
-- SELECT id, user_id, name, slug, is_public, view_count
-- FROM projects
-- ORDER BY created_at DESC
-- LIMIT 10;

-- Check public projects view
-- SELECT * FROM public_projects LIMIT 5;
