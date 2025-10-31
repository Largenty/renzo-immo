-- TEMPORAIRE: Désactiver RLS pour debug (NE PAS LAISSER EN PRODUCTION)

-- Désactiver RLS sur users
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Pour réactiver plus tard :
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
