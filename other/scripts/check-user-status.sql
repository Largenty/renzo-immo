-- Vérifier l'état de TOUS les utilisateurs
SELECT
  u.id,
  u.email,
  u.email_verified as "email_verified (table users)",
  au.confirmed_at as "confirmed_at (auth.users)",
  CASE
    WHEN au.confirmed_at IS NOT NULL THEN '✅ Email vérifié dans auth'
    ELSE '❌ Email NON vérifié dans auth'
  END as "status_auth",
  CASE
    WHEN u.email_verified = true THEN '✅ Vérifié dans users'
    ELSE '❌ NON vérifié dans users'
  END as "status_users"
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id;

-- Si aucun résultat, alors le problème est que l'utilisateur n'existe pas dans public.users
-- Vérifier dans auth.users seulement :
SELECT
  id,
  email,
  confirmed_at,
  created_at,
  CASE
    WHEN confirmed_at IS NOT NULL THEN '✅ Email vérifié'
    ELSE '❌ Email NON vérifié'
  END as "status"
FROM auth.users;
