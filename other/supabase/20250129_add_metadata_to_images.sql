-- Migration: Ajouter une colonne metadata JSONB à la table images
-- Cette colonne stocke des données flexibles comme le taskId de NanoBanana

-- Ajouter la colonne metadata
ALTER TABLE images
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Ajouter un index GIN pour des requêtes rapides sur les metadata
CREATE INDEX IF NOT EXISTS idx_images_metadata ON images USING GIN (metadata);

-- Commentaire pour documenter
COMMENT ON COLUMN images.metadata IS 'Métadonnées flexibles en JSON, incluant nanobanana_task_id, original_width, original_height, etc.';
