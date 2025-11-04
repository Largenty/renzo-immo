-- =====================================================
-- MIGRATION: Add Room Specifications for New Types
-- =====================================================
-- Date: 2025-11-02
-- Purpose: Create room specifications for new room types
-- PREREQUISITE: Run 20251102_add_room_type_enums.sql FIRST
-- =====================================================

BEGIN;

-- CHAMBRE ENFANT (Children's Bedroom)
INSERT INTO room_specifications (
  room_type,
  display_name_fr,
  display_name_en,
  constraints_text,
  typical_area_min,
  typical_area_max,
  description,
  icon_name,
  is_active
) VALUES (
  'chambre_enfant',
  'Chambre d''Enfant',
  'Children''s Bedroom',
  'Children''s bedroom space with room for single/twin bed (90-120cm), desk area, and storage. Preserve window placement for natural light (important for study area). Maintain closet and door positions. Keep safety features like radiator guards if present.',
  9.00,
  16.00,
  'Chambre pour enfant avec lit simple et espace de jeu/travail',
  'Baby',
  true
) ON CONFLICT (room_type) DO UPDATE SET
  display_name_fr = EXCLUDED.display_name_fr,
  display_name_en = EXCLUDED.display_name_en,
  constraints_text = EXCLUDED.constraints_text,
  typical_area_min = EXCLUDED.typical_area_min,
  typical_area_max = EXCLUDED.typical_area_max,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- SALLE DE JEUX (Playroom)
INSERT INTO room_specifications (
  room_type,
  display_name_fr,
  display_name_en,
  constraints_text,
  typical_area_min,
  typical_area_max,
  description,
  icon_name,
  is_active
) VALUES (
  'salle_de_jeux',
  'Salle de Jeux',
  'Playroom',
  'Playroom/recreation space with open floor area for activities. Preserve window positions for natural light. Maintain door locations and circulation. Keep any built-in storage like toy cabinets or shelving. Ensure safe, open play space.',
  10.00,
  25.00,
  'Espace de jeux et loisirs pour enfants',
  'Gamepad2',
  true
) ON CONFLICT (room_type) DO UPDATE SET
  display_name_fr = EXCLUDED.display_name_fr,
  display_name_en = EXCLUDED.display_name_en,
  constraints_text = EXCLUDED.constraints_text,
  typical_area_min = EXCLUDED.typical_area_min,
  typical_area_max = EXCLUDED.typical_area_max,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- TOILETTE (Powder Room - different from WC)
INSERT INTO room_specifications (
  room_type,
  display_name_fr,
  display_name_en,
  constraints_text,
  typical_area_min,
  typical_area_max,
  description,
  icon_name,
  is_active
) VALUES (
  'toilette',
  'Toilette',
  'Powder Room',
  'Powder room with toilet and sink. CRITICAL: Toilet and sink fixture positions LOCKED - plumbing cannot be moved. Preserve door swing direction, mirror placement, and ventilation. Maintain any built-in storage or vanity.',
  2.00,
  4.00,
  'Toilette avec lavabo (WC invités)',
  'Droplet',
  true
) ON CONFLICT (room_type) DO UPDATE SET
  display_name_fr = EXCLUDED.display_name_fr,
  display_name_en = EXCLUDED.display_name_en,
  constraints_text = EXCLUDED.constraints_text,
  typical_area_min = EXCLUDED.typical_area_min,
  typical_area_max = EXCLUDED.typical_area_max,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- SELECT
--   room_type,
--   display_name_fr,
--   display_name_en,
--   typical_area_min || '-' || typical_area_max || 'm²' as typical_size
-- FROM room_specifications
-- WHERE room_type IN ('chambre_enfant', 'salle_de_jeux', 'toilette')
-- ORDER BY display_name_fr;
