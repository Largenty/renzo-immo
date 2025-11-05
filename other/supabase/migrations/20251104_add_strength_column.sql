-- Migration: Add strength column to images table
-- Date: 2025-11-04
-- Description: Add AI transformation intensity control (strength) to images

-- Add strength column to images table
ALTER TABLE images
ADD COLUMN IF NOT EXISTS strength DECIMAL(3,2) DEFAULT 0.15 CHECK (strength >= 0 AND strength <= 1);

-- Comment on the column
COMMENT ON COLUMN images.strength IS 'AI transformation intensity (0-1). Lower values preserve more of the original image, higher values allow more AI modification. Default: 0.15';
