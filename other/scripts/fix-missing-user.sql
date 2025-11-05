-- Script: Créer les utilisateurs manquants dans public.users
-- Problème: Les utilisateurs existent dans auth.users mais pas dans public.users
-- Solution: Créer automatiquement les entrées manquantes

-- 1. Vérifier quels utilisateurs manquent
SELECT
  au.id,
  au.email,
  au.created_at,
  au.confirmed_at,
  CASE
    WHEN u.id IS NULL THEN '❌ MANQUANT dans public.users'
    ELSE '✅ Existe dans public.users'
  END as "status"
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id;

-- 2. Créer les utilisateurs manquants
INSERT INTO public.users (
  id,
  email,
  first_name,
  last_name,
  company,
  email_verified,
  credits_balance,
  password_hash,
  created_at,
  updated_at
)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', ''),
  COALESCE(au.raw_user_meta_data->>'last_name', ''),
  COALESCE(au.raw_user_meta_data->>'company', NULL),
  CASE WHEN au.confirmed_at IS NOT NULL THEN true ELSE false END,
  0, -- credits_balance par défaut
  'managed_by_supabase_auth',
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL; -- Seulement les utilisateurs qui n'existent pas encore

-- 3. Vérifier que tout est OK maintenant
SELECT
  u.id,
  u.email,
  u.email_verified,
  u.credits_balance,
  au.confirmed_at,
  '✅ Synchronisé' as status
FROM public.users u
JOIN auth.users au ON u.id = au.id;
