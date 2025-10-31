-- ========================================
-- URGENT : EXÉCUTEZ CE SCRIPT MAINTENANT
-- ========================================
-- Ce script corrige le problème des utilisateurs manquants dans public.users

-- 1. Créer le trigger automatique pour les futurs utilisateurs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company', NULL),
    CASE WHEN NEW.confirmed_at IS NOT NULL THEN true ELSE false END,
    0,
    'managed_by_supabase_auth',
    NEW.created_at,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. RÉPARER IMMÉDIATEMENT TOUS LES UTILISATEURS EXISTANTS
INSERT INTO public.users (
  id, email, first_name, last_name, company,
  email_verified, credits_balance, password_hash,
  created_at, updated_at
)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', ''),
  COALESCE(au.raw_user_meta_data->>'last_name', ''),
  COALESCE(au.raw_user_meta_data->>'company', NULL),
  CASE WHEN au.confirmed_at IS NOT NULL THEN true ELSE false END,
  0,
  'managed_by_supabase_auth',
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 3. VÉRIFIER QUE TOUT EST OK
SELECT
  '✅ UTILISATEURS RÉPARÉS' as status,
  COUNT(*) as "Nombre d'utilisateurs créés"
FROM public.users;
