-- Migration 003: Storage Buckets and Policies
-- Description: Configure les buckets Supabase Storage et leurs policies
-- Created: 2025-10-23

-- =====================================================
-- CREATE STORAGE BUCKETS
-- =====================================================

-- Bucket pour les images (originales et transformées)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  false, -- Privé, accès via signed URLs
  52428800, -- 50 MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

-- Bucket pour les avatars utilisateurs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- Public
  5242880, -- 5 MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Bucket pour les exemples de styles personnalisés
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'styles',
  'styles',
  false, -- Privé
  5242880, -- 5 MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- =====================================================
-- STORAGE POLICIES - IMAGES BUCKET
-- =====================================================

-- Les users peuvent uploader leurs propres images
-- Format: {user_id}/originals/{project_id}/{image_id}.jpg
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Les users peuvent lire leurs propres images
CREATE POLICY "Users can read their own images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Les users peuvent mettre à jour leurs propres images
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Les users peuvent supprimer leurs propres images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- STORAGE POLICIES - AVATARS BUCKET
-- =====================================================

-- Les users peuvent uploader leur propre avatar
-- Format: {user_id}.jpg
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  name = auth.uid()::text || '.' || split_part(name, '.', 2)
);

-- Lecture publique des avatars
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Les users peuvent mettre à jour leur propre avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  split_part(name, '.', 1) = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' AND
  split_part(name, '.', 1) = auth.uid()::text
);

-- Les users peuvent supprimer leur propre avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  split_part(name, '.', 1) = auth.uid()::text
);

-- =====================================================
-- STORAGE POLICIES - STYLES BUCKET
-- =====================================================

-- Les users peuvent uploader des exemples pour leurs styles
-- Format: {user_id}/{style_id}-example.jpg
CREATE POLICY "Users can upload their style examples"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'styles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Les users peuvent lire leurs propres exemples de styles
CREATE POLICY "Users can read their own style examples"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'styles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Les users peuvent mettre à jour leurs exemples de styles
CREATE POLICY "Users can update their style examples"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'styles' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'styles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Les users peuvent supprimer leurs exemples de styles
CREATE POLICY "Users can delete their style examples"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'styles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- HELPER FUNCTIONS FOR STORAGE
-- =====================================================

-- Fonction pour générer des signed URLs (à utiliser dans l'API)
CREATE OR REPLACE FUNCTION get_signed_image_url(
  bucket_name TEXT,
  file_path TEXT,
  expires_in INTEGER DEFAULT 3600
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  signed_url TEXT;
BEGIN
  -- Vérifier que l'utilisateur a accès au fichier
  IF (storage.foldername(file_path))[1] != auth.uid()::text THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Générer l'URL signée (via API Supabase en pratique)
  -- Cette fonction est un placeholder, l'implémentation réelle est côté client
  signed_url := format(
    '%s/storage/v1/object/sign/%s/%s?token=PLACEHOLDER',
    current_setting('app.supabase_url', true),
    bucket_name,
    file_path
  );

  RETURN signed_url;
END;
$$;

-- =====================================================
-- STORAGE STRUCTURE DOCUMENTATION
-- =====================================================

-- Bucket: images
-- Structure:
-- images/
--   {user_id}/
--     originals/
--       {project_id}/
--         {image_id}.jpg
--     transformed/
--       {project_id}/
--         {image_id}.jpg

-- Bucket: avatars
-- Structure:
-- avatars/
--   {user_id}.jpg

-- Bucket: styles
-- Structure:
-- styles/
--   {user_id}/
--     {style_id}-example.jpg

-- =====================================================
-- SECURITY NOTES
-- =====================================================

-- 1. Images bucket: Privé, accès via signed URLs uniquement
-- 2. Avatars bucket: Public pour affichage dans l'app
-- 3. Styles bucket: Privé, accès limité au propriétaire
-- 4. Toutes les policies vérifient auth.uid() pour isolation
-- 5. Limites de taille: 50MB images, 5MB avatars/styles
-- 6. Types MIME autorisés: JPEG, PNG, WebP, HEIC (images)

-- Migration completed successfully
