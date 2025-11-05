-- Debug : Vérifier l'utilisateur et les RLS policies

-- 1. L'utilisateur existe-t-il dans public.users ?
SELECT
  'User in public.users' as check_type,
  id, email, first_name, last_name, email_verified, credits_remaining
FROM public.users
WHERE id = '24173e93-8cb9-4a84-ad7b-5ded0537843f';

-- 2. L'utilisateur existe-t-il dans auth.users ?
SELECT
  'User in auth.users' as check_type,
  id, email, confirmed_at, created_at
FROM auth.users
WHERE id = '24173e93-8cb9-4a84-ad7b-5ded0537843f';

-- 3. Quelles sont les policies sur la table users ?
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'users';

-- 4. RLS est-il activé ?
SELECT
  schemaname,
  tablename,
  rowsecurity as "RLS enabled"
FROM pg_tables
WHERE tablename = 'users';
