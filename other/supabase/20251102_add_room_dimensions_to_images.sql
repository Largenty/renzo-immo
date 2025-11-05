-- Migration: Add room dimension columns to images table
-- Date: 2025-11-02
-- Purpose: Allow users to provide explicit room measurements for better AI dimensional accuracy
-- Related: docs/ROOM_DIMENSIONS_FEATURE.md

-- Add room dimension columns
ALTER TABLE images
  ADD COLUMN IF NOT EXISTS room_width DECIMAL(5,2),     -- Largeur en mètres (max 999.99m)
  ADD COLUMN IF NOT EXISTS room_length DECIMAL(5,2),    -- Longueur en mètres (max 999.99m)
  ADD COLUMN IF NOT EXISTS room_area DECIMAL(7,2);      -- Surface en m² (max 99999.99m²)

-- Add check constraints for reasonable values
ALTER TABLE images
  ADD CONSTRAINT images_room_width_positive CHECK (room_width IS NULL OR room_width > 0),
  ADD CONSTRAINT images_room_length_positive CHECK (room_length IS NULL OR room_length > 0),
  ADD CONSTRAINT images_room_area_positive CHECK (room_area IS NULL OR room_area > 0);

-- Add check constraint for reasonable max values (optional safety)
ALTER TABLE images
  ADD CONSTRAINT images_room_width_reasonable CHECK (room_width IS NULL OR room_width <= 100),
  ADD CONSTRAINT images_room_length_reasonable CHECK (room_length IS NULL OR room_length <= 100),
  ADD CONSTRAINT images_room_area_reasonable CHECK (room_area IS NULL OR room_area <= 10000);

-- Add index for potential queries (optional, for analytics)
CREATE INDEX IF NOT EXISTS idx_images_room_dimensions
  ON images(room_width, room_length, room_area)
  WHERE room_width IS NOT NULL OR room_length IS NOT NULL OR room_area IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN images.room_width IS 'Largeur de la pièce en mètres (optionnel). Aide l''IA à respecter les dimensions réelles.';
COMMENT ON COLUMN images.room_length IS 'Longueur de la pièce en mètres (optionnel). Aide l''IA à respecter les dimensions réelles.';
COMMENT ON COLUMN images.room_area IS 'Surface de la pièce en m² (optionnel, calculé automatiquement si largeur et longueur fournis).';
