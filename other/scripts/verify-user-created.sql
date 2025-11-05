-- Vérifier que l'utilisateur a bien été créé

-- 1. Vérifier dans public.users
SELECT
  id,
  email,
  first_name,
  last_name,
  email_verified,
  credits_balance,
  created_at
FROM public.users
WHERE id = '24173e93-8cb9-4a84-ad7b-5ded0537843f';

-- 2. Vérifier la correspondance auth.users <-> public.users
SELECT
  au.id,
  au.email as "email (auth)",
  u.email as "email (public)",
  au.confirmed_at as "confirmed_at (auth)",
  u.email_verified as "email_verified (public)",
  CASE
    WHEN u.id IS NOT NULL THEN '✅ Utilisateur existe dans les 2 tables'
    ELSE '❌ Utilisateur MANQUANT dans public.users'
  END as status
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE au.id = '24173e93-8cb9-4a84-ad7b-5ded0537843f';
