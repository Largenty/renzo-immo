-- Script temporaire : Synchroniser la vérification email pour l'utilisateur actuel
-- À exécuter dans Supabase SQL Editor

-- Vérifier l'état actuel
SELECT
  u.id,
  u.email,
  u.email_verified as "email_verified (table users)",
  au.confirmed_at as "confirmed_at (auth.users)"
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.email = 'VOTRE_EMAIL@example.com';  -- Remplacez par votre email

-- Mettre à jour email_verified dans users si confirmed_at existe
UPDATE public.users u
SET email_verified = true
FROM auth.users au
WHERE u.id = au.id
  AND au.confirmed_at IS NOT NULL
  AND u.email_verified = false;

-- Vérifier après la mise à jour
SELECT
  u.id,
  u.email,
  u.email_verified as "email_verified (après mise à jour)",
  au.confirmed_at
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.email = 'VOTRE_EMAIL@example.com';
