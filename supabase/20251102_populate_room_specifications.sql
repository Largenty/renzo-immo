-- =====================================================
-- MIGRATION: Populate Room Specifications
-- =====================================================
-- Date: 2025-11-02
-- Purpose: Create room specifications for all room types
-- Total: 22 room types (3 bedroom types + 19 other rooms)
-- =====================================================

BEGIN;

-- =====================================================
-- CHAMBRES (3 types)
-- =====================================================

-- CHAMBRE PRINCIPALE (Master Bedroom)
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
  'chambre',
  'Chambre Principale',
  'Master Bedroom',
  'Large bedroom space with potential for king/queen bed (180-200cm), nightstands on both sides, and additional furniture (dresser, seating). Preserve window placement for natural light. Maintain closet/wardrobe positions.',
  12.00,
  25.00,
  'Grande chambre parentale avec espace pour lit king/queen et mobilier complémentaire',
  'Bed',
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

-- Note: 'chambre' is the main bedroom type in the enum, we'll handle variations through styling

-- =====================================================
-- PIÈCES DE VIE (Living Spaces)
-- =====================================================

-- SALON (Living Room)
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
  'salon',
  'Salon',
  'Living Room',
  'Main living space with seating area. Preserve window positions and natural light sources. Maintain door placements and circulation paths. Keep architectural features like fireplaces, built-in shelving in original positions.',
  15.00,
  40.00,
  'Espace de vie principal pour détente et réception',
  'Sofa',
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

-- CUISINE (Kitchen)
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
  'cuisine',
  'Cuisine',
  'Kitchen',
  'Kitchen space with fixed appliances and plumbing. CRITICAL: Preserve all plumbing fixtures, sink position, stove location, and appliance placements. Maintain cabinet and counter layouts. Keep window positions unchanged.',
  8.00,
  20.00,
  'Espace cuisine avec électroménager et plans de travail',
  'ChefHat',
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

-- SALLE À MANGER (Dining Room)
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
  'salle_a_manger',
  'Salle à Manger',
  'Dining Room',
  'Dining space for table and chairs. Preserve window and door positions. Maintain circulation paths around dining table area. Keep any built-in elements like buffets or shelving.',
  10.00,
  20.00,
  'Espace repas avec table et chaises',
  'UtensilsCrossed',
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

-- =====================================================
-- PIÈCES D'EAU (Bathrooms)
-- =====================================================

-- SALLE DE BAIN (Bathroom)
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
  'salle_de_bain',
  'Salle de Bain',
  'Bathroom',
  'Bathroom with fixtures. CRITICAL: Preserve all plumbing fixtures - sink, toilet, shower/bathtub positions CANNOT move. Maintain tile layouts and water-related infrastructure. Keep ventilation and window positions.',
  4.00,
  12.00,
  'Salle de bain avec douche/baignoire et lavabo',
  'Bath',
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

-- WC (Toilet)
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
  'wc',
  'WC',
  'Toilet',
  'Toilet room. CRITICAL: Toilet fixture position LOCKED - plumbing cannot be moved. Preserve door swing direction and ventilation. Maintain any built-in storage.',
  1.50,
  3.00,
  'Toilettes séparées',
  'DoorOpen',
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

-- =====================================================
-- PIÈCES DE TRAVAIL ET RANGEMENT (Work & Storage)
-- =====================================================

-- BUREAU (Office)
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
  'bureau',
  'Bureau',
  'Office',
  'Office/study space. Preserve window positions for natural light (important for work). Maintain door location and circulation. Keep any built-in desks or shelving in place.',
  8.00,
  15.00,
  'Espace de travail avec bureau et rangements',
  'Laptop',
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

-- DRESSING (Walk-in Closet)
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
  'dressing',
  'Dressing',
  'Walk-in Closet',
  'Walk-in closet space. Preserve door and any window positions. Maintain built-in shelving and hanging rod layouts. Keep circulation space for access.',
  4.00,
  10.00,
  'Dressing avec rangements intégrés',
  'Shirt',
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

-- BUANDERIE (Laundry Room)
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
  'buanderie',
  'Buanderie',
  'Laundry Room',
  'Laundry space with appliances. CRITICAL: Preserve plumbing and electrical connections for washer/dryer. Maintain utility hookups and ventilation. Keep any built-in storage.',
  3.00,
  8.00,
  'Espace buanderie avec lave-linge',
  'WashingMachine',
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

-- =====================================================
-- ESPACES DE CIRCULATION (Circulation Spaces)
-- =====================================================

-- ENTRÉE (Entrance/Foyer)
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
  'entree',
  'Entrée',
  'Entrance',
  'Entry space. Preserve main entrance door position and swing direction. Maintain circulation paths to adjacent rooms. Keep any built-in coat storage or shelving.',
  3.00,
  10.00,
  'Hall d''entrée et accueil',
  'DoorOpen',
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

-- COULOIR (Hallway)
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
  'couloir',
  'Couloir',
  'Hallway',
  'Hallway/corridor space. CRITICAL: Preserve all door positions and hallway width - circulation path LOCKED. Maintain lighting fixtures and any built-in storage positions.',
  3.00,
  12.00,
  'Couloir de circulation',
  'ArrowRight',
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

-- =====================================================
-- ESPACES EXTÉRIEURS (Outdoor Spaces)
-- =====================================================

-- TERRASSE (Terrace/Deck)
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
  'terrasse',
  'Terrasse',
  'Terrace',
  'Outdoor terrace space. Preserve railing positions and door access points. Maintain floor boundaries and any built-in planters or features. Keep elevation levels.',
  8.00,
  30.00,
  'Terrasse extérieure aménagée',
  'Sun',
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

-- BALCON (Balcony)
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
  'balcon',
  'Balcon',
  'Balcony',
  'Balcony space. CRITICAL: Preserve railing height and position - safety feature. Maintain door access and floor boundaries. Keep any drainage systems in place.',
  3.00,
  10.00,
  'Balcon avec vue extérieure',
  'Building',
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

-- JARDIN (Garden)
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
  'jardin',
  'Jardin',
  'Garden',
  'Garden space. Preserve property boundaries and access paths. Maintain any permanent landscape features like paths, walls, or built-in planters.',
  20.00,
  200.00,
  'Jardin avec espaces verts',
  'Trees',
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

-- VÉRANDA (Sunroom/Conservatory)
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
  'veranda',
  'Véranda',
  'Sunroom',
  'Sunroom/conservatory with extensive windows. Preserve all window and glass door positions. Maintain structural supports and roof configuration. Keep access doors to house/garden.',
  10.00,
  25.00,
  'Véranda vitrée avec lumière naturelle',
  'Sun',
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

-- =====================================================
-- ESPACES DE STOCKAGE (Storage Spaces)
-- =====================================================

-- GARAGE (Garage)
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
  'garage',
  'Garage',
  'Garage',
  'Garage space for vehicle parking. CRITICAL: Preserve garage door size and position. Maintain access to house and any utility connections. Keep structural supports.',
  12.00,
  40.00,
  'Garage pour véhicules et stockage',
  'Car',
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

-- CAVE (Cellar/Basement)
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
  'cave',
  'Cave',
  'Cellar',
  'Basement/cellar storage. Preserve structural supports and stairs/access. Maintain any utility installations (heating, electrical panels). Keep ventilation systems.',
  8.00,
  30.00,
  'Cave ou sous-sol de stockage',
  'Archive',
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

-- GRENIER (Attic)
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
  'grenier',
  'Grenier',
  'Attic',
  'Attic space with sloped ceilings. CRITICAL: Preserve roof pitch and ceiling height variations. Maintain dormer windows and roof access. Keep structural beams visible if exposed.',
  10.00,
  40.00,
  'Combles ou grenier aménageable',
  'Home',
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

-- =====================================================
-- ESPACES SPÉCIAUX (Special Spaces)
-- =====================================================

-- MEZZANINE (Mezzanine/Loft)
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
  'mezzanine',
  'Mezzanine',
  'Mezzanine',
  'Mezzanine level space. CRITICAL: Preserve railing positions and height - safety feature. Maintain stairs/ladder access position. Keep structural supports and floor boundaries. Respect ceiling height below.',
  8.00,
  20.00,
  'Mezzanine en hauteur',
  'Layers',
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

-- AUTRE (Other)
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
  'autre',
  'Autre',
  'Other',
  'Custom room type. Preserve all architectural elements: walls, doors, windows in original positions. Maintain structural integrity and circulation paths. Keep any fixed installations.',
  5.00,
  50.00,
  'Autre type d''espace personnalisé',
  'HelpCircle',
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
--   display_name_fr,
--   display_name_en,
--   typical_area_min || '-' || typical_area_max || 'm²' as typical_size,
--   is_active
-- FROM room_specifications
-- ORDER BY display_name_fr;
