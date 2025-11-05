-- Réactiver RLS sur la table users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Vérifier que RLS est bien activé
SELECT
  schemaname,
  tablename,
  rowsecurity as "RLS enabled"
FROM pg_tables
WHERE tablename = 'users';
