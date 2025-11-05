-- =====================================================
-- MIGRATION PRODUCTION 001: Auth Cleanup
-- =====================================================
-- Description: Supprime les redondances avec auth.users
--              et établit auth.users comme source of truth
-- Risque: FAIBLE (supprime colonnes inutilisées)
-- Rollback: Possible mais perte de données colonnes supprimées
-- =====================================================

BEGIN;

-- 1) Vérifier que la FK vers auth.users existe (si pas déjà fait)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'users_id_fk_auth'
    AND table_name = 'users'
  ) THEN
    -- Assure que tous les users.id existent dans auth.users
    DELETE FROM public.users
    WHERE id NOT IN (SELECT id FROM auth.users);

    -- Crée la FK
    ALTER TABLE public.users
      ADD CONSTRAINT users_id_fk_auth
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

    RAISE NOTICE 'FK users -> auth.users créée';
  ELSE
    RAISE NOTICE 'FK users -> auth.users existe déjà';
  END IF;
END $$;

-- 2) Supprimer les colonnes redondantes avec auth.users
DO $$
BEGIN
  -- password_hash (géré par auth.users)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='password_hash'
  ) THEN
    ALTER TABLE public.users DROP COLUMN password_hash;
    RAISE NOTICE 'Colonne password_hash supprimée';
  END IF;

  -- two_factor_enabled (géré par auth.users via auth.mfa_factors)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='two_factor_enabled'
  ) THEN
    ALTER TABLE public.users DROP COLUMN two_factor_enabled;
    RAISE NOTICE 'Colonne two_factor_enabled supprimée';
  END IF;

  -- two_factor_secret (géré par auth.users via auth.mfa_factors)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='two_factor_secret'
  ) THEN
    ALTER TABLE public.users DROP COLUMN two_factor_secret;
    RAISE NOTICE 'Colonne two_factor_secret supprimée';
  END IF;

  -- email_verified (géré par auth.users.confirmed_at)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='email_verified'
  ) THEN
    ALTER TABLE public.users DROP COLUMN email_verified;
    RAISE NOTICE 'Colonne email_verified supprimée';
  END IF;
END $$;

-- 3) Créer fonction de synchronisation email (cache côté métier)
CREATE OR REPLACE FUNCTION public.sync_user_email_from_auth()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Met à jour l'email dans public.users quand il change dans auth.users
  UPDATE public.users
  SET
    email = NEW.email,
    updated_at = NOW()
  WHERE
    id = NEW.id
    AND email IS DISTINCT FROM NEW.email;

  RETURN NEW;
END $$;

-- 4) Créer trigger de sync email
DROP TRIGGER IF EXISTS trg_auth_users_email_sync ON auth.users;
CREATE TRIGGER trg_auth_users_email_sync
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_email_from_auth();

-- 5) Synchroniser les emails actuels (one-time)
UPDATE public.users u
SET email = a.email
FROM auth.users a
WHERE u.id = a.id AND u.email IS DISTINCT FROM a.email;

-- 6) Supprimer la table sessions (Supabase Auth gère déjà)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'sessions'
  ) THEN
    DROP TABLE public.sessions CASCADE;
    RAISE NOTICE 'Table sessions supprimée (gérée par Supabase Auth)';
  ELSE
    RAISE NOTICE 'Table sessions n''existe pas';
  END IF;
END $$;

-- 7) Supprimer les triggers/fonctions liés aux colonnes supprimées
DROP TRIGGER IF EXISTS trigger_create_notification_preferences ON public.users;
DROP FUNCTION IF EXISTS public.create_default_notification_preferences() CASCADE;

-- 8) Recréer le trigger de création des préférences notifications
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_notifications_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END $$;

CREATE TRIGGER trigger_create_notification_preferences
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_notification_preferences();

COMMIT;

-- =====================================================
-- VÉRIFICATIONS POST-MIGRATION
-- =====================================================
-- Exécuter ces requêtes pour vérifier:

-- 1) Vérifier que tous les users ont un enregistrement auth
-- SELECT COUNT(*) FROM public.users WHERE id NOT IN (SELECT id FROM auth.users);
-- Doit retourner: 0

-- 2) Vérifier que les colonnes sont bien supprimées
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'users' AND column_name IN ('password_hash', 'two_factor_enabled', 'two_factor_secret', 'email_verified');
-- Doit retourner: 0 lignes

-- 3) Vérifier le trigger de sync
-- SELECT tgname FROM pg_trigger WHERE tgname = 'trg_auth_users_email_sync';
-- Doit retourner: 1 ligne
