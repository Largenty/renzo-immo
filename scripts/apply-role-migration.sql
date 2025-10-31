-- Script pour appliquer la migration role
-- Exécuter avec: psql [connection-string] -f scripts/apply-role-migration.sql

-- Vérifier si la colonne existe déjà
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'role'
    ) THEN
        -- Ajouter la colonne role
        ALTER TABLE users
        ADD COLUMN role VARCHAR(50) DEFAULT 'user'
        CHECK (role IN ('user', 'admin'));

        RAISE NOTICE 'Column "role" added successfully';
    ELSE
        RAISE NOTICE 'Column "role" already exists';
    END IF;
END $$;

-- Créer l'index
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Ajouter le commentaire
COMMENT ON COLUMN users.role IS 'User role: user (default) or admin. Admins can manage furniture_catalog and room_specifications.';

-- Afficher le résultat
SELECT
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name = 'role';
