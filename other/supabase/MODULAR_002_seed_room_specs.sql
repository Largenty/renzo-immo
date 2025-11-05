-- =====================================================
-- MIGRATION MODULAR 002: Seed Room Specifications
-- =====================================================
-- Description: Peupler les spécifications des pièces
-- Prérequis: MODULAR_001_core_tables.sql
-- =====================================================

BEGIN;

-- =====================================================
-- ROOM SPECIFICATIONS
-- =====================================================

-- Salon
INSERT INTO public.room_specifications (
  room_type,
  display_name_fr,
  display_name_en,
  constraints_text,
  typical_area_min,
  typical_area_max,
  zones,
  description,
  icon_name
) VALUES (
  'salon'::room_type,
  'Salon',
  'Living Room',
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

MANDATORY PRESERVATION:
• Windows: Keep EXACT positions, sizes, frames
• Doors: Keep EXACT positions, sizes, frames, handles
• Ceiling: Keep height, moldings, ceiling fixtures
• Walls: Keep structural walls, columns
• Floor boundaries: Maintain room shape',
  12.0,
  40.0,
  '{"seating_area": "Main conversation area with sofa and chairs", "circulation": "Maintain clear pathways", "focal_point": "TV wall, fireplace, or window view"}',
  'Principal espace de vie et de détente',
  'Sofa'
) ON CONFLICT (room_type) DO NOTHING;

-- Chambre
INSERT INTO public.room_specifications (
  room_type,
  display_name_fr,
  display_name_en,
  constraints_text,
  typical_area_min,
  typical_area_max,
  zones,
  description,
  icon_name
) VALUES (
  'chambre'::room_type,
  'Chambre',
  'Bedroom',
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

MANDATORY PRESERVATION:
• Windows: Keep EXACT positions, sizes, frames, curtain rods (if built-in)
• Doors: Keep positions, sizes (including closet doors)
• Ceiling: Keep height, moldings
• Built-in closets: Keep positions and sizes
• Walls: Keep structural walls',
  9.0,
  25.0,
  '{"sleeping_area": "Bed placement zone", "storage": "Closet and dresser area", "circulation": "Access paths to closet and door"}',
  'Espace de repos et sommeil',
  'Bed'
) ON CONFLICT (room_type) DO NOTHING;

-- Cuisine
INSERT INTO public.room_specifications (
  room_type,
  display_name_fr,
  display_name_en,
  constraints_text,
  typical_area_min,
  typical_area_max,
  zones,
  description,
  icon_name
) VALUES (
  'cuisine'::room_type,
  'Cuisine',
  'Kitchen',
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

CRITICAL PRESERVATION:
• Cabinet layout: Keep ALL cabinets in EXACT positions (upper/lower/corner)
• Appliances: Keep built-in appliances in SAME locations
• Countertop shape: Maintain EXACT countertop configuration
• Sink: Keep position and plumbing location
• Windows, doors: Keep unchanged
• Ventilation: Keep hood/vent position

TRANSFORMATION ALLOWED:
• Cabinet door style and finish
• Countertop material and color
• Backsplash tiles/material
• Hardware (handles, faucets)
• Appliance finishes (colors, styles)
• Lighting fixtures',
  5.0,
  20.0,
  '{"work_triangle": "Sink, stove, fridge efficient triangle", "prep_area": "Countertop workspace", "storage": "Upper and lower cabinets", "appliances": "Built-in appliance zones"}',
  'Espace de préparation culinaire',
  'UtensilsCrossed'
) ON CONFLICT (room_type) DO NOTHING;

-- Salle à manger
INSERT INTO public.room_specifications (
  room_type,
  display_name_fr,
  display_name_en,
  constraints_text,
  typical_area_min,
  typical_area_max,
  zones,
  description,
  icon_name
) VALUES (
  'salle_a_manger'::room_type,
  'Salle à manger',
  'Dining Room',
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

MANDATORY PRESERVATION:
• Windows: Keep EXACT positions, sizes
• Doors: Keep positions, sizes
• Ceiling: Keep height, moldings, chandelier hook (if present)
• Built-in buffets: Keep if present
• Walls: Keep structural walls',
  8.0,
  25.0,
  '{"dining_area": "Table and chairs zone (allow 1.2m around table)", "buffet_area": "Sideboard or storage", "circulation": "Access to kitchen and living areas"}',
  'Espace de repas convivial',
  'UtensilsCrossed'
) ON CONFLICT (room_type) DO NOTHING;

-- Salle de bain
INSERT INTO public.room_specifications (
  room_type,
  display_name_fr,
  display_name_en,
  constraints_text,
  typical_area_min,
  typical_area_max,
  zones,
  description,
  icon_name
) VALUES (
  'salle_de_bain'::room_type,
  'Salle de bain',
  'Bathroom',
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

TRANSFORMATION ALLOWED FOR BATHROOMS:
• Complete layout redesign possible for better flow
• Can relocate fixtures (toilet, sink, shower) if more efficient
• Can change shower/tub configuration
• Complete material upgrade

KEEP APPROXIMATELY:
• Overall room dimensions
• Window position (if present)
• Door position
• Plumbing wall location (within reason)',
  3.0,
  12.0,
  '{"wet_zone": "Shower/bathtub area", "vanity_zone": "Sink and mirror", "toilet_zone": "WC area", "storage": "Cabinets and shelving"}',
  'Espace d''hygiène et bien-être',
  'Bath'
) ON CONFLICT (room_type) DO NOTHING;

-- WC
INSERT INTO public.room_specifications (
  room_type,
  display_name_fr,
  display_name_en,
  constraints_text,
  typical_area_min,
  typical_area_max,
  zones,
  description,
  icon_name
) VALUES (
  'wc'::room_type,
  'WC / Toilettes',
  'Toilet',
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

MANDATORY PRESERVATION:
• Toilet position: Keep plumbing location
• Sink: Keep if present
• Walls: Keep exact dimensions
• Door: Keep position
• Window: Keep if present

TRANSFORMATION ALLOWED:
• Fixture styles (modern toilet, sink)
• Tiles and wall materials
• Lighting',
  1.0,
  3.0,
  '{"toilet_area": "WC fixture", "sink_area": "Hand washing (if space permits)"}',
  'Toilettes séparées',
  'Bath'
) ON CONFLICT (room_type) DO NOTHING;

-- Bureau
INSERT INTO public.room_specifications (
  room_type,
  display_name_fr,
  display_name_en,
  constraints_text,
  typical_area_min,
  typical_area_max,
  zones,
  description,
  icon_name
) VALUES (
  'bureau'::room_type,
  'Bureau',
  'Office',
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

MANDATORY PRESERVATION:
• Windows: Keep EXACT positions, sizes
• Doors: Keep positions, sizes
• Ceiling: Keep height, moldings
• Built-in shelves: Keep if present
• Walls: Keep structural walls',
  6.0,
  20.0,
  '{"work_area": "Desk and computer zone", "storage": "Bookshelves and filing", "meeting_area": "Small seating if space permits"}',
  'Espace de travail professionnel',
  'Briefcase'
) ON CONFLICT (room_type) DO NOTHING;

-- Entrée
INSERT INTO public.room_specifications (
  room_type,
  display_name_fr,
  display_name_en,
  constraints_text,
  typical_area_min,
  typical_area_max,
  zones,
  description,
  icon_name
) VALUES (
  'entree'::room_type,
  'Entrée',
  'Entrance',
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

MANDATORY PRESERVATION:
• Entry door: Keep EXACT position, size
• Windows: Keep if present
• Walls: Keep structural walls
• Built-in coat racks: Keep if present
• Intercom/doorbell: Keep positions',
  2.0,
  10.0,
  '{"reception_area": "Entry point", "storage": "Coat and shoe storage", "circulation": "Distribution to other rooms"}',
  'Hall d''entrée accueillant',
  'DoorOpen'
) ON CONFLICT (room_type) DO NOTHING;

-- Terrasse
INSERT INTO public.room_specifications (
  room_type,
  display_name_fr,
  display_name_en,
  constraints_text,
  typical_area_min,
  typical_area_max,
  zones,
  description,
  icon_name
) VALUES (
  'terrasse'::room_type,
  'Terrasse',
  'Terrace',
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, boundaries.

MANDATORY PRESERVATION:
• Floor material: Keep existing (wood deck, tiles, stone)
• Railings: Keep if present (safety requirement)
• Doors to interior: Keep positions
• Built-in features: Keep planters, built-in seating

TRANSFORMATION ALLOWED:
• Furniture arrangement
• Potted plants and decor
• Lighting fixtures
• Textiles (cushions, outdoor rugs)',
  5.0,
  50.0,
  '{"seating_area": "Outdoor furniture zone", "dining_area": "Outdoor dining if space permits", "circulation": "Access paths", "green_area": "Plants and greenery"}',
  'Espace extérieur aménagé',
  'Trees'
) ON CONFLICT (room_type) DO NOTHING;

-- Balcon
INSERT INTO public.room_specifications (
  room_type,
  display_name_fr,
  display_name_en,
  constraints_text,
  typical_area_min,
  typical_area_max,
  zones,
  description,
  icon_name
) VALUES (
  'balcon'::room_type,
  'Balcon',
  'Balcony',
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, boundaries.

MANDATORY PRESERVATION:
• Floor material: Keep existing
• Railings: Keep EXACT (safety requirement)
• Doors to interior: Keep positions
• Size and shape: Keep exact dimensions

TRANSFORMATION ALLOWED:
• Small furniture (bistro set, chairs)
• Potted plants
• Lighting
• Decor elements',
  2.0,
  15.0,
  '{"seating_area": "Compact outdoor seating", "plant_area": "Potted plants and greenery"}',
  'Petit espace extérieur',
  'Home'
) ON CONFLICT (room_type) DO NOTHING;

COMMIT;

-- =====================================================
-- VÉRIFICATIONS
-- =====================================================

-- Compter les room specs insérées
-- SELECT COUNT(*) FROM public.room_specifications;
-- Devrait retourner 10

-- Voir toutes les pièces
-- SELECT room_type, display_name_fr, display_name_en FROM public.room_specifications ORDER BY room_type;
