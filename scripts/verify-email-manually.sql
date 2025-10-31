-- Script pour vérifier manuellement l'email d'un utilisateur en développement
-- À exécuter dans Supabase SQL Editor

-- Voir tous les utilisateurs et leur statut de vérification
SELECT
  id,
  email,
  confirmed_at,
  email_confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- Vérifier l'email d'un utilisateur spécifique (remplacez l'email)
-- DÉCOMMENTER LA LIGNE SUIVANTE ET REMPLACER PAR VOTRE EMAIL:
-- UPDATE auth.users
-- SET confirmed_at = NOW(), email_confirmed_at = NOW()
-- WHERE email = 'votre-email@example.com';

-- Vérifier tous les utilisateurs non vérifiés (⚠️ DEV ONLY)
-- DÉCOMMENTER SI VOUS VOULEZ VÉRIFIER TOUS LES EMAILS:
-- UPDATE auth.users
-- SET confirmed_at = NOW(), email_confirmed_at = NOW()
-- WHERE confirmed_at IS NULL;
