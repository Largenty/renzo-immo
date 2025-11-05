-- Migration: Ajouter la colonne furniture_ids à la table images
-- Cette colonne stocke les UUIDs des meubles sélectionnés pour le home staging

-- 1. Ajouter la colonne furniture_ids (array d'UUIDs)
ALTER TABLE images
ADD COLUMN IF NOT EXISTS furniture_ids UUID[] DEFAULT NULL;

-- 2. Créer un index pour améliorer les performances des queries
CREATE INDEX IF NOT EXISTS idx_images_furniture_ids
ON images USING GIN (furniture_ids);

-- 3. Ajouter un commentaire pour documentation
COMMENT ON COLUMN images.furniture_ids IS 'Array of furniture UUIDs selected for home staging. NULL means no furniture or depersonalization.';

-- 4. Vérifier que la colonne est bien ajoutée
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'images'
        AND column_name = 'furniture_ids'
    ) THEN
        RAISE NOTICE 'Column furniture_ids successfully added to images table';
    ELSE
        RAISE EXCEPTION 'Failed to add furniture_ids column';
    END IF;
END $$;
