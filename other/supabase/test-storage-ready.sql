-- ============================================
-- TEST RAPIDE : Storage est-il prêt ?
-- ============================================

-- Ce script vérifie en 1 seconde si tout est configuré

SELECT
  CASE
    WHEN (
      -- Bucket existe ?
      EXISTS(SELECT 1 FROM storage.buckets WHERE name = 'images' AND public = true)
      AND
      -- Au moins 3 policies ?
      (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%images%') >= 3
    )
    THEN '✅ STORAGE PRÊT - Vous pouvez uploader des images!'

    WHEN NOT EXISTS(SELECT 1 FROM storage.buckets WHERE name = 'images')
    THEN '❌ BUCKET MANQUANT - Exécutez setup-storage-policies.sql'

    WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%images%') = 0
    THEN '❌ AUCUNE POLICY - Exécutez setup-storage-policies.sql'

    ELSE '⚠️ CONFIGURATION INCOMPLETE - Exécutez setup-storage-policies.sql'
  END as status;

-- Détails (si vous voulez voir ce qui manque) :

SELECT '🪣 Bucket Status' as check_type,
  CASE
    WHEN EXISTS(SELECT 1 FROM storage.buckets WHERE name = 'images' AND public = true)
    THEN '✅ Bucket "images" existe et est public'
    WHEN EXISTS(SELECT 1 FROM storage.buckets WHERE name = 'images' AND public = false)
    THEN '⚠️ Bucket existe mais n''est pas public'
    ELSE '❌ Bucket "images" n''existe pas'
  END as result;

SELECT '🔒 Policies Status' as check_type,
  COUNT(*) || ' policies trouvées (besoin de 3 minimum)' as result
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%images%';

-- Liste des policies (si elles existent) :
SELECT '📋 Policies Détaillées' as info, policyname, cmd as operation
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%images%'
UNION ALL
SELECT '📋 Policies Détaillées', '(aucune policy trouvée)', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM pg_policies
  WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%images%'
);
