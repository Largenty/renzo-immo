-- =====================================================
-- MIGRATION PRODUCTION 005: Storage Policies (RLS)
-- =====================================================
-- Description: Sécurise les buckets Supabase Storage avec
--              des policies fines basées sur ownership
-- Risque: MOYEN (peut bloquer accès si mal configuré)
-- Rollback: Facile (drop policies)
-- =====================================================

BEGIN;

-- =====================================================
-- PRÉREQUIS: Vérifier que les buckets existent
-- =====================================================

-- Note: Ces buckets doivent être créés manuellement via Supabase Dashboard
-- ou via la migration 003_storage_buckets.sql

-- Buckets attendus:
-- 1. project-images (privé) - images originales et transformées
-- 2. avatars (public) - avatars utilisateurs
-- 3. temp-uploads (privé) - uploads temporaires

-- =====================================================
-- BUCKET 1: project-images (privé)
-- =====================================================

-- Structure path: {user_id}/{project_id}/{image_id}/{filename}

-- 1) Policy LECTURE: propriétaire du projet OU projet public
DROP POLICY IF EXISTS policy_project_images_read ON storage.objects;
CREATE POLICY policy_project_images_read
  ON storage.objects
  FOR SELECT
  TO authenticated, anon
  USING (
    bucket_id = 'project-images'
    AND (
      -- Lecture par propriétaire (path commence par user_id)
      (storage.foldername(name))[1] = auth.uid()::TEXT
      OR
      -- OU lecture via projet public
      EXISTS (
        SELECT 1
        FROM public.projects p
        WHERE p.user_id::TEXT = (storage.foldername(name))[1]
          AND p.id::TEXT = (storage.foldername(name))[2]
          AND p.status = 'active'
          -- Note: si tu as une colonne is_public, ajoute: AND p.is_public = true
      )
    )
  );

-- 2) Policy ÉCRITURE: propriétaire uniquement, dans son dossier
DROP POLICY IF EXISTS policy_project_images_insert ON storage.objects;
CREATE POLICY policy_project_images_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'project-images'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- 3) Policy UPDATE: propriétaire uniquement
DROP POLICY IF EXISTS policy_project_images_update ON storage.objects;
CREATE POLICY policy_project_images_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'project-images'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  )
  WITH CHECK (
    bucket_id = 'project-images'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- 4) Policy DELETE: propriétaire uniquement
DROP POLICY IF EXISTS policy_project_images_delete ON storage.objects;
CREATE POLICY policy_project_images_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'project-images'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- =====================================================
-- BUCKET 2: avatars (public en lecture)
-- =====================================================

-- Structure path: {user_id}/avatar.{ext}

-- 5) Policy LECTURE: tout le monde (avatars publics)
DROP POLICY IF EXISTS policy_avatars_read ON storage.objects;
CREATE POLICY policy_avatars_read
  ON storage.objects
  FOR SELECT
  TO authenticated, anon
  USING (bucket_id = 'avatars');

-- 6) Policy ÉCRITURE: propriétaire uniquement
DROP POLICY IF EXISTS policy_avatars_insert ON storage.objects;
CREATE POLICY policy_avatars_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- 7) Policy UPDATE: propriétaire uniquement
DROP POLICY IF EXISTS policy_avatars_update ON storage.objects;
CREATE POLICY policy_avatars_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- 8) Policy DELETE: propriétaire uniquement
DROP POLICY IF EXISTS policy_avatars_delete ON storage.objects;
CREATE POLICY policy_avatars_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- =====================================================
-- BUCKET 3: temp-uploads (privé strict)
-- =====================================================

-- Structure path: {user_id}/{temp_filename}

-- 9) Policy ALL: propriétaire uniquement (lecture + écriture)
DROP POLICY IF EXISTS policy_temp_uploads_all ON storage.objects;
CREATE POLICY policy_temp_uploads_all
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'temp-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  )
  WITH CHECK (
    bucket_id = 'temp-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- =====================================================
-- FONCTION HELPER: Vérifier ownership d'un fichier
-- =====================================================

-- 10) Fonction pour vérifier si l'user courant est propriétaire d'un path
CREATE OR REPLACE FUNCTION public.fn_storage_check_ownership(p_bucket_id TEXT, p_path TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  v_owner_id TEXT;
BEGIN
  -- Extraire le user_id du path (première partie avant /)
  v_owner_id := split_part(p_path, '/', 1);

  -- Vérifier si l'user courant correspond
  RETURN v_owner_id = auth.uid()::TEXT;
END;
$$;

COMMENT ON FUNCTION public.fn_storage_check_ownership IS 'Vérifie si l''utilisateur courant est propriétaire d''un path storage';

GRANT EXECUTE ON FUNCTION public.fn_storage_check_ownership TO authenticated;

-- =====================================================
-- FONCTION HELPER: Générer URL signée
-- =====================================================

-- 11) Fonction pour générer une URL signée (expire après X secondes)
-- Note: Nécessite que Supabase soit configuré avec JWT_SECRET correct
CREATE OR REPLACE FUNCTION public.fn_get_signed_url(
  p_bucket_id TEXT,
  p_path TEXT,
  p_expires_in INTEGER DEFAULT 3600 -- 1 heure par défaut
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  v_url TEXT;
BEGIN
  -- Vérifier ownership
  IF NOT public.fn_storage_check_ownership(p_bucket_id, p_path) THEN
    RAISE EXCEPTION 'Accès refusé: vous n''êtes pas propriétaire de ce fichier';
  END IF;

  -- Générer l'URL signée via Supabase Storage API
  -- Note: Cette fonction utilise l'API interne de Supabase
  SELECT storage.create_signed_url(p_bucket_id, p_path, p_expires_in)
  INTO v_url;

  RETURN v_url;
END;
$$;

COMMENT ON FUNCTION public.fn_get_signed_url IS 'Génère une URL signée temporaire pour accéder à un fichier';

GRANT EXECUTE ON FUNCTION public.fn_get_signed_url TO authenticated;

-- =====================================================
-- VUE: Fichiers par utilisateur
-- =====================================================

-- 12) Vue pour lister les fichiers d'un utilisateur
CREATE OR REPLACE VIEW public.v_user_storage_files AS
SELECT
  o.id,
  o.bucket_id,
  o.name,
  o.owner,
  o.created_at,
  o.updated_at,
  o.last_accessed_at,
  o.metadata,
  (storage.foldername(o.name))[1] AS user_id,
  (storage.foldername(o.name))[2] AS project_id
FROM storage.objects o
WHERE o.bucket_id IN ('project-images', 'avatars', 'temp-uploads')
  AND (storage.foldername(o.name))[1] = auth.uid()::TEXT;

COMMENT ON VIEW public.v_user_storage_files IS 'Liste des fichiers storage de l''utilisateur courant';

-- =====================================================
-- NETTOYAGE AUTOMATIQUE: temp-uploads (optionnel)
-- =====================================================

-- 13) Fonction pour nettoyer les uploads temporaires > 24h
CREATE OR REPLACE FUNCTION public.fn_cleanup_temp_uploads()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Supprimer les fichiers > 24h dans temp-uploads
  WITH deleted AS (
    DELETE FROM storage.objects
    WHERE bucket_id = 'temp-uploads'
      AND created_at < NOW() - INTERVAL '24 hours'
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted;

  RAISE NOTICE 'Nettoyage temp-uploads: % fichiers supprimés', v_deleted_count;

  RETURN v_deleted_count;
END;
$$;

COMMENT ON FUNCTION public.fn_cleanup_temp_uploads IS 'Nettoie les uploads temporaires > 24h (à exécuter via cron)';

-- Note: Pour automatiser, créer un cron job Supabase:
-- SELECT cron.schedule('cleanup-temp-uploads', '0 2 * * *',
--   $$SELECT public.fn_cleanup_temp_uploads()$$
-- );

COMMIT;

-- =====================================================
-- VÉRIFICATIONS POST-MIGRATION
-- =====================================================

-- 1) Lister toutes les policies storage
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'objects';

-- 2) Tester lecture d'un fichier (remplacer par un vrai path)
-- SELECT * FROM storage.objects
-- WHERE bucket_id = 'project-images'
--   AND name = 'user-uuid/project-uuid/image-uuid/original.jpg';

-- 3) Voir les fichiers de l'user courant
-- SELECT * FROM public.v_user_storage_files;

-- 4) Tester génération URL signée
-- SELECT public.fn_get_signed_url('project-images', 'user-uuid/project-uuid/image-uuid/original.jpg', 3600);

-- =====================================================
-- UTILISATION DANS LE CODE
-- =====================================================

-- Upload vers project-images:
-- const filePath = `${userId}/${projectId}/${imageId}/original.jpg`;
-- const { data, error } = await supabase.storage
--   .from('project-images')
--   .upload(filePath, file);

-- Lecture avec URL publique (si projet public):
-- const { data } = supabase.storage
--   .from('project-images')
--   .getPublicUrl(filePath);

-- Lecture avec URL signée (si privé):
-- const { data } = await supabase.rpc('fn_get_signed_url', {
--   p_bucket_id: 'project-images',
--   p_path: filePath,
--   p_expires_in: 3600
-- });

-- Suppression:
-- const { error } = await supabase.storage
--   .from('project-images')
--   .remove([filePath]);
