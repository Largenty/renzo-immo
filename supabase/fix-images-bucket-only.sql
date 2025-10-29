-- ============================================
-- FIX URGENT : Bucket "images" seulement
-- ============================================
-- Ce script configure UNIQUEMENT le bucket "images"
-- (Le bucket "project-covers" fonctionne déjà)

-- 1. Créer le bucket 'images' s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  52428800, -- 50MB max
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[];

-- 2. Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Users can upload images to their projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete images from their projects" ON storage.objects;
DROP POLICY IF EXISTS "Public can read images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to images bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from images bucket" ON storage.objects;

-- 3. Policy INSERT : Upload d'images
-- Utilisateurs authentifiés peuvent uploader dans le dossier de leurs projets
CREATE POLICY "Users can upload images to their projects"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.projects WHERE user_id = auth.uid()
  )
);

-- 4. Policy SELECT PUBLIC : Lecture publique
-- Permet l'accès public pour afficher les images dans Next.js
CREATE POLICY "Public can read images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'images');

-- 5. Policy SELECT AUTHENTICATED : Lecture pour les utilisateurs
-- Les utilisateurs authentifiés peuvent lire leurs propres images
CREATE POLICY "Users can read their own images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.projects WHERE user_id = auth.uid()
  )
);

-- 6. Policy DELETE : Suppression d'images
-- Les utilisateurs peuvent supprimer les images de leurs projets
CREATE POLICY "Users can delete images from their projects"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.projects WHERE user_id = auth.uid()
  )
);

-- ============================================
-- Vérifications
-- ============================================

-- Test 1: Le bucket existe et est public ?
SELECT
  '✅ Test 1: Bucket Configuration' as test,
  id,
  name,
  public,
  file_size_limit / 1024 / 1024 || 'MB' as max_size
FROM storage.buckets
WHERE name = 'images';

-- Test 2: Combien de policies ?
SELECT
  '✅ Test 2: Storage Policies Count' as test,
  COUNT(*) as policy_count,
  CASE
    WHEN COUNT(*) >= 4 THEN '✅ OK (4 policies trouvées)'
    ELSE '❌ PROBLÈME (devrait avoir 4 policies)'
  END as status
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%images%';

-- Test 3: Liste des policies
SELECT
  '✅ Test 3: Policies Details' as test,
  policyname,
  cmd as operation,
  CASE
    WHEN roles::text LIKE '%authenticated%' THEN 'authenticated'
    WHEN roles::text LIKE '%public%' THEN 'public'
    ELSE roles::text
  END as role
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%images%'
ORDER BY cmd, policyname;

-- Test 4: La table projects existe ?
SELECT
  '✅ Test 4: Projects Table' as test,
  COUNT(*) as project_count,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ OK (projets trouvés)'
    ELSE '⚠️ Aucun projet (créez-en un d''abord)'
  END as status
FROM public.projects;

-- ============================================
-- RÉSULTAT FINAL
-- ============================================

SELECT
  '🎯 RÉSULTAT FINAL' as summary,
  CASE
    WHEN bucket_ok AND policies_ok AND table_ok
    THEN '✅ TOUT EST PRÊT ! Vous pouvez uploader des images maintenant.'
    WHEN NOT bucket_ok
    THEN '❌ Bucket "images" manquant ou mal configuré'
    WHEN NOT policies_ok
    THEN '❌ Policies manquantes (devrait avoir 4)'
    WHEN NOT table_ok
    THEN '❌ Table projects manquante'
    ELSE '⚠️ Problème inconnu'
  END as result
FROM (
  SELECT
    EXISTS(SELECT 1 FROM storage.buckets WHERE name = 'images' AND public = true) as bucket_ok,
    (SELECT COUNT(*) >= 4 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%images%') as policies_ok,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'projects') as table_ok
) checks;

-- ============================================
-- Instructions
-- ============================================

/*
🚀 COMMENT UTILISER CE SCRIPT :

1. Copier TOUT ce fichier (Ctrl+A, Ctrl+C)
2. Aller sur Supabase Dashboard → SQL Editor
3. Coller (Ctrl+V)
4. Cliquer sur "RUN" (bouton vert)
5. Vérifier le "RÉSULTAT FINAL" en bas

✅ Si vous voyez "TOUT EST PRÊT" :
   → Retourner sur l'app
   → Recharger (F5)
   → Uploader une image
   → Ça devrait marcher !

❌ Si vous voyez une erreur :
   → Lire le message d'erreur
   → Partager la capture d'écran
*/
