-- ============================================
-- Configuration Storage pour les Images
-- ============================================

-- 1. Créer le bucket 'images' s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Users can upload images to their projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete images from their projects" ON storage.objects;
DROP POLICY IF EXISTS "Public can read images" ON storage.objects;

-- 3. Policy INSERT : Upload d'images
-- Les utilisateurs authentifiés peuvent uploader dans leurs propres projets
CREATE POLICY "Users can upload images to their projects"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM projects WHERE user_id = auth.uid()
  )
);

-- 4. Policy SELECT : Lecture des images
-- Les utilisateurs authentifiés peuvent lire leurs propres images
CREATE POLICY "Users can read their own images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM projects WHERE user_id = auth.uid()
  )
);

-- 5. Policy SELECT PUBLIC : Lecture publique (pour Next.js Image)
-- Permet l'accès public aux images (nécessaire pour Next.js)
CREATE POLICY "Public can read images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'images');

-- 6. Policy DELETE : Suppression d'images
-- Les utilisateurs peuvent supprimer les images de leurs projets
CREATE POLICY "Users can delete images from their projects"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM projects WHERE user_id = auth.uid()
  )
);

-- ============================================
-- Vérifications
-- ============================================

-- Vérifier que le bucket existe
SELECT
  id,
  name,
  public,
  created_at
FROM storage.buckets
WHERE name = 'images';

-- Vérifier les policies Storage
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%images%';

-- ============================================
-- Instructions
-- ============================================

/*
Pour exécuter ce script dans Supabase :

1. Aller sur https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Coller tout ce script SQL
3. Cliquer sur "Run"
4. Vérifier que les policies sont créées dans la section "Vérifications"

Une fois exécuté, vous pourrez uploader des images depuis l'application !
*/
