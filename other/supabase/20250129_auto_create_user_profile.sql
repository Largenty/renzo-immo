-- Migration: Créer automatiquement le profil utilisateur lors de l'inscription
-- Créé le: 2025-01-29
-- Problème: Les utilisateurs ne sont pas créés automatiquement dans public.users
-- Solution: Trigger qui crée automatiquement l'entrée lors de l'inscription dans auth.users

-- 1. Fonction qui crée automatiquement le profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer dans public.users automatiquement
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    company,
    email_verified,
    credits_remaining,
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
    0, -- credits_remaining par défaut
    'managed_by_supabase_auth',
    NEW.created_at,
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Créer le trigger sur auth.users (déclenché APRÈS INSERT)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Réparer les utilisateurs existants qui n'ont pas de profil
INSERT INTO public.users (
  id, email, first_name, last_name, company,
  email_verified, credits_remaining, password_hash,
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

COMMENT ON FUNCTION public.handle_new_user IS
  'Crée automatiquement un profil dans public.users lors de l''inscription dans auth.users';
