-- Migration: Ajouter les colonnes room_type et custom_room à la table images
-- Créé le: 2025-01-29
-- Description: Permet de stocker le type de pièce et une valeur personnalisée

-- Ajouter la colonne room_type
ALTER TABLE images
ADD COLUMN IF NOT EXISTS room_type VARCHAR(50);

-- Ajouter la colonne custom_room
ALTER TABLE images
ADD COLUMN IF NOT EXISTS custom_room VARCHAR(100);

-- Ajouter des commentaires pour documenter les colonnes
COMMENT ON COLUMN images.room_type IS
  'Type de pièce (salon, cuisine, chambre, etc.)';

COMMENT ON COLUMN images.custom_room IS
  'Type de pièce personnalisé saisi par l''utilisateur quand room_type = "autre"';
