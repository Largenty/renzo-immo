-- ============================================
-- DIAGNOSTIC STORAGE SUPABASE
-- ============================================
-- Exécutez ce script pour identifier le problème

-- 1. Vérifier que le bucket 'images' existe
SELECT
  '✅ Bucket exists' as status,
  id,
  name,
  public,
  created_at
FROM storage.buckets
WHERE name = 'images'
UNION ALL
SELECT
  '❌ Bucket MISSING - RUN setup-storage-policies.sql' as status,
  NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'images');

-- 2. Vérifier les Storage Policies
SELECT
  '📋 Storage Policies' as info,
  policyname,
  cmd as operation,
  CASE
    WHEN roles = '{authenticated}' THEN 'authenticated users'
    WHEN roles = '{public}' THEN 'public access'
    ELSE roles::text
  END as who_can_access
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND (policyname LIKE '%images%' OR policyname LIKE '%upload%' OR policyname LIKE '%read%');

-- 3. Compter les policies (devrait être au minimum 3)
SELECT
  CASE
    WHEN COUNT(*) >= 3 THEN '✅ Storage policies configured (' || COUNT(*) || ' policies)'
    WHEN COUNT(*) > 0 THEN '⚠️ Incomplete storage policies (' || COUNT(*) || ' policies, need at least 3)'
    ELSE '❌ NO storage policies - RUN setup-storage-policies.sql'
  END as policy_status
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%images%';

-- 4. Vérifier la table 'projects'
SELECT
  '✅ Projects table exists' as status,
  COUNT(*) as project_count
FROM projects
UNION ALL
SELECT
  '❌ Projects table MISSING' as status,
  0
WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects');

-- 5. Vérifier la table 'images'
SELECT
  '✅ Images table exists' as status,
  COUNT(*) as image_count
FROM images
UNION ALL
SELECT
  '❌ Images table MISSING' as status,
  0
WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'images');

-- 6. Vérifier RLS sur la table images
SELECT
  CASE
    WHEN relrowsecurity THEN '✅ RLS enabled on images table'
    ELSE '❌ RLS NOT enabled on images table'
  END as rls_status
FROM pg_class
WHERE relname = 'images';

-- 7. Vérifier les policies de la table images
SELECT
  '📋 Table Images Policies' as info,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'images';

-- ============================================
-- RÉSUMÉ ET ACTIONS
-- ============================================

SELECT
  '🔍 DIAGNOSTIC SUMMARY' as summary,
  CASE
    WHEN bucket_exists AND policies_count >= 3 AND table_exists
    THEN '✅ Everything configured correctly! If you still have errors, check the error details below.'

    WHEN NOT bucket_exists
    THEN '❌ BUCKET MISSING - Run supabase/setup-storage-policies.sql'

    WHEN policies_count = 0
    THEN '❌ NO POLICIES - Run supabase/setup-storage-policies.sql'

    WHEN policies_count < 3
    THEN '⚠️ INCOMPLETE POLICIES - Run supabase/setup-storage-policies.sql'

    WHEN NOT table_exists
    THEN '❌ TABLES MISSING - Run database schema setup first (see DATABASE_SCHEMA.md)'

    ELSE '⚠️ Unknown issue - contact support'
  END as action_required
FROM (
  SELECT
    EXISTS(SELECT 1 FROM storage.buckets WHERE name = 'images') as bucket_exists,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%images%') as policies_count,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'images') as table_exists
) as checks;

-- ============================================
-- INSTRUCTIONS
-- ============================================

/*
📖 HOW TO USE THIS DIAGNOSTIC:

1. Copy this entire file
2. Go to Supabase Dashboard → SQL Editor
3. Paste and click "Run"
4. Read the results to see what's missing

COMMON FIXES:

❌ If "Bucket MISSING":
   → Run: supabase/setup-storage-policies.sql

❌ If "NO storage policies" or "INCOMPLETE":
   → Run: supabase/setup-storage-policies.sql

❌ If "Tables MISSING":
   → Create tables first (see DATABASE_SCHEMA.md)
   → Then run setup-storage-policies.sql

✅ If everything is configured but still errors:
   → Check that you're logged in (auth.uid() not null)
   → Check browser console for detailed error
   → Verify the project_id exists in projects table
*/
