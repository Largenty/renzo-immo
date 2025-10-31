-- Ajouter la colonne nano_request_id pour stocker l'ID de la requête NanoBanana
-- Cela permet au webhook de retrouver l'image à mettre à jour

ALTER TABLE images
ADD COLUMN IF NOT EXISTS nano_request_id TEXT;

-- Index pour recherche rapide par request ID
CREATE INDEX IF NOT EXISTS idx_images_nano_request_id
ON images(nano_request_id);

-- Commentaire
COMMENT ON COLUMN images.nano_request_id IS 'ID de la requête NanoBanana pour le callback webhook';
