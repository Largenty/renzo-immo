-- Migration: Synchroniser email_verified avec auth.users.confirmed_at
-- Créé le: 2025-01-29
-- Description: Trigger pour mettre à jour automatiquement email_verified dans la table users
--              quand l'email est vérifié dans auth.users

-- Fonction qui synchronise email_verified
CREATE OR REPLACE FUNCTION public.sync_email_verified()
RETURNS TRIGGER AS $$
BEGIN
  -- Si confirmed_at passe de NULL à une valeur (email vérifié)
  IF OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL THEN
    UPDATE public.users
    SET email_verified = true
    WHERE id = NEW.id;
  END IF;

  -- Si confirmed_at repasse à NULL (email non vérifié)
  IF OLD.confirmed_at IS NOT NULL AND NEW.confirmed_at IS NULL THEN
    UPDATE public.users
    SET email_verified = false
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_email_verified ON auth.users;
CREATE TRIGGER on_auth_user_email_verified
  AFTER UPDATE OF confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_email_verified();

-- Synchroniser les données existantes (au cas où)
UPDATE public.users u
SET email_verified = true
FROM auth.users au
WHERE u.id = au.id
  AND au.confirmed_at IS NOT NULL
  AND u.email_verified = false;

COMMENT ON FUNCTION public.sync_email_verified IS
  'Synchronise automatiquement email_verified dans public.users avec confirmed_at dans auth.users';
