-- Migration: Ajouter policy INSERT pour permettre l'auto-création lors de l'inscription
-- Créé le: 2025-01-29
-- Problème: Les utilisateurs ne peuvent pas être créés dans public.users lors de l'inscription
-- Solution: Permettre l'INSERT pour un utilisateur qui vient de s'inscrire

-- Supprimer l'ancienne policy si elle existe
DROP POLICY IF EXISTS "Users can insert their own profile on signup" ON users;

-- Créer la policy INSERT
-- Permet à un utilisateur authentifié de créer SON PROPRE profil (id = auth.uid())
CREATE POLICY "Users can insert their own profile on signup"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Note: Cette policy permet uniquement d'insérer une ligne où l'ID correspond
-- à l'ID de l'utilisateur authentifié. Cela empêche de créer des profils
-- pour d'autres utilisateurs.

COMMENT ON POLICY "Users can insert their own profile on signup" ON users IS
  'Permet à un utilisateur authentifié de créer son propre profil lors de l''inscription';
