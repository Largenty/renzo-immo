-- =====================================================
-- MIGRATION MODULAR 003: Seed Furniture Catalog
-- =====================================================
-- Description: Catalogue de meubles réutilisables
-- Prérequis: MODULAR_001_core_tables.sql
-- =====================================================

BEGIN;

-- =====================================================
-- SALON / LIVING ROOM
-- =====================================================

-- Canapé 3 places
INSERT INTO public.furniture_catalog (
  category, room_types, name_fr, name_en,
  generic_description, typical_dimensions,
  is_essential, priority, icon_name
) VALUES (
  'seating', ARRAY['salon']::room_type[], 'Canapé 3 places', '3-seat sofa',
  'Large sofa for 3 people', '{"width_cm": 220, "depth_cm": 90, "height_cm": 85}',
  TRUE, 100, 'Sofa'
);

-- Fauteuil
INSERT INTO public.furniture_catalog (
  category, room_types, name_fr, name_en,
  generic_description, typical_dimensions,
  is_essential, priority
) VALUES (
  'seating', ARRAY['salon', 'bureau']::room_type[], 'Fauteuil', 'Armchair',
  'Single armchair', '{"width_cm": 80, "depth_cm": 85, "height_cm": 90}',
  FALSE, 80
);

-- Table basse
INSERT INTO public.furniture_catalog (
  category, room_types, name_fr, name_en,
  generic_description, typical_dimensions,
  is_essential, priority
) VALUES (
  'table', ARRAY['salon']::room_type[], 'Table basse', 'Coffee table',
  'Low table for living room', '{"width_cm": 120, "depth_cm": 60, "height_cm": 40}',
  TRUE, 90
);

-- Lampadaire
INSERT INTO public.furniture_catalog (
  category, room_types, name_fr, name_en,
  generic_description, typical_dimensions,
  is_essential, priority
) VALUES (
  'lighting', ARRAY['salon', 'bureau', 'chambre']::room_type[], 'Lampadaire', 'Floor lamp',
  'Standing floor lamp', '{"height_cm": 150}',
  FALSE, 70
);

-- Plante décorative moyenne
INSERT INTO public.furniture_catalog (
  category, room_types, name_fr, name_en,
  generic_description, typical_dimensions,
  is_essential, priority
) VALUES (
  'decor', ARRAY['salon', 'bureau', 'chambre', 'entree']::room_type[], 'Plante décorative (moyenne)', 'Decorative plant (medium)',
  'Medium-sized potted plant', '{"height_cm": 80}',
  FALSE, 60
);

-- Plante décorative petite
INSERT INTO public.furniture_catalog (
  category, room_types, name_fr, name_en,
  generic_description, typical_dimensions,
  is_essential, priority
) VALUES (
  'decor', ARRAY['salon', 'bureau', 'cuisine', 'salle_de_bain']::room_type[], 'Plante décorative (petite)', 'Decorative plant (small)',
  'Small potted plant or succulent', '{"height_cm": 30}',
  FALSE, 50
);

-- Tableau mural
INSERT INTO public.furniture_catalog (
  category, room_types, name_fr, name_en,
  generic_description, typical_dimensions,
  is_essential, priority
) VALUES (
  'decor', ARRAY['salon', 'salle_a_manger', 'bureau', 'chambre']::room_type[], 'Tableau mural', 'Wall art',
  'Framed artwork or print', '{"width_cm": 80, "height_cm": 60}',
  FALSE, 40
);

-- Tapis
INSERT INTO public.furniture_catalog (
  category, room_types, name_fr, name_en,
  generic_description, typical_dimensions,
  is_essential, priority
) VALUES (
  'decor', ARRAY['salon', 'salle_a_manger', 'chambre']::room_type[], 'Tapis', 'Rug',
  'Area rug', '{"width_cm": 200, "depth_cm": 300}',
  FALSE, 55
);

-- =====================================================
-- SALLE À MANGER / DINING ROOM
-- =====================================================

-- Table à manger
INSERT INTO public.furniture_catalog (
  category, room_types, name_fr, name_en,
  generic_description, typical_dimensions,
  is_essential, priority
) VALUES (
  'table', ARRAY['salle_a_manger']::room_type[], 'Table à manger', 'Dining table',
  'Dining table for 4-8 people', '{"width_cm": 180, "depth_cm": 90, "height_cm": 75}',
  TRUE, 100
);

-- Chaises de salle à manger (x4-6)
INSERT INTO public.furniture_catalog (
  category, room_types, name_fr, name_en,
  generic_description, typical_dimensions,
  is_essential, priority
) VALUES (
  'seating', ARRAY['salle_a_manger']::room_type[], 'Chaises de salle à manger (4-6)', 'Dining chairs (4-6)',
  'Set of dining chairs', '{"width_cm": 45, "depth_cm": 50, "height_cm": 85}',
  TRUE, 95
);

-- Suspension / Lustre
INSERT INTO public.furniture_catalog (
  category, room_types, name_fr, name_en,
  generic_description, typical_dimensions,
  is_essential, priority
) VALUES (
  'lighting', ARRAY['salle_a_manger', 'cuisine']::room_type[], 'Suspension / Lustre', 'Pendant light / Chandelier',
  'Hanging light fixture above table', '{"diameter_cm": 50}',
  FALSE, 75
);

-- =====================================================
-- CHAMBRE / BEDROOM
-- =====================================================

-- Lit double
INSERT INTO public.furniture_catalog (
  category, room_types, name_fr, name_en,
  generic_description, typical_dimensions,
  is_essential, priority
) VALUES (
  'bed', ARRAY['chambre']::room_type[], 'Lit double', 'Double bed',
  'Double bed with headboard', '{"width_cm": 160, "depth_cm": 200, "height_cm": 50}',
  TRUE, 100
);

-- Table de chevet (x2)
INSERT INTO public.furniture_catalog (
  category, room_types, name_fr, name_en,
  generic_description, typical_dimensions,
  is_essential, priority
) VALUES (
  'table', ARRAY['chambre']::room_type[], 'Tables de chevet (2)', 'Nightstands (2)',
  'Pair of bedside tables', '{"width_cm": 50, "depth_cm": 40, "height_cm": 50}',
  TRUE, 90
);

-- Lampe de chevet
INSERT INTO public.furniture_catalog (
  category, room_types, name_fr, name_en,
  generic_description, typical_dimensions,
  is_essential, priority
) VALUES (
  'lighting', ARRAY['chambre']::room_type[], 'Lampes de chevet (2)', 'Table lamps (2)',
  'Pair of bedside lamps', '{"height_cm": 45}',
  FALSE, 70
);

-- =====================================================
-- BUREAU / OFFICE
-- =====================================================

-- Bureau / Desk
INSERT INTO public.furniture_catalog (
  category, room_types, name_fr, name_en,
  generic_description, typical_dimensions,
  is_essential, priority
) VALUES (
  'table', ARRAY['bureau']::room_type[], 'Bureau', 'Desk',
  'Work desk', '{"width_cm": 140, "depth_cm": 70, "height_cm": 75}',
  TRUE, 100
);

-- Chaise de bureau
INSERT INTO public.furniture_catalog (
  category, room_types, name_fr, name_en,
  generic_description, typical_dimensions,
  is_essential, priority
) VALUES (
  'seating', ARRAY['bureau']::room_type[], 'Chaise de bureau', 'Office chair',
  'Ergonomic office chair', '{"width_cm": 60, "depth_cm": 60, "height_cm": 120}',
  TRUE, 95
);

-- Étagère / Bibliothèque
INSERT INTO public.furniture_catalog (
  category, room_types, name_fr, name_en,
  generic_description, typical_dimensions,
  is_essential, priority
) VALUES (
  'storage', ARRAY['bureau', 'salon']::room_type[], 'Étagère / Bibliothèque', 'Bookshelf',
  'Open shelving unit', '{"width_cm": 100, "depth_cm": 30, "height_cm": 200}',
  FALSE, 75
);

-- =====================================================
-- CUISINE / KITCHEN (meubles mobiles uniquement)
-- =====================================================

-- Tabourets de bar (x2-3)
INSERT INTO public.furniture_catalog (
  category, room_types, name_fr, name_en,
  generic_description, typical_dimensions,
  is_essential, priority
) VALUES (
  'seating', ARRAY['cuisine']::room_type[], 'Tabourets de bar (2-3)', 'Bar stools (2-3)',
  'Counter-height stools', '{"width_cm": 40, "depth_cm": 40, "height_cm": 75}',
  FALSE, 60
);

-- =====================================================
-- SALLE DE BAIN / BATHROOM (fixtures)
-- =====================================================

-- Vanité / Meuble vasque
INSERT INTO public.furniture_catalog (
  category, room_types, name_fr, name_en,
  generic_description, typical_dimensions,
  is_essential, priority
) VALUES (
  'storage', ARRAY['salle_de_bain']::room_type[], 'Meuble vasque', 'Vanity unit',
  'Bathroom vanity with sink', '{"width_cm": 100, "depth_cm": 50, "height_cm": 85}',
  TRUE, 100
);

-- Miroir de salle de bain
INSERT INTO public.furniture_catalog (
  category, room_types, name_fr, name_en,
  generic_description, typical_dimensions,
  is_essential, priority
) VALUES (
  'decor', ARRAY['salle_de_bain']::room_type[], 'Miroir', 'Mirror',
  'Bathroom mirror', '{"width_cm": 80, "height_cm": 70}',
  TRUE, 95
);

-- =====================================================
-- TERRASSE / BALCON
-- =====================================================

-- Salon de jardin
INSERT INTO public.furniture_catalog (
  category, room_types, name_fr, name_en,
  generic_description, typical_dimensions,
  is_essential, priority
) VALUES (
  'seating', ARRAY['terrasse', 'balcon']::room_type[], 'Salon de jardin', 'Outdoor seating set',
  'Outdoor furniture set (sofa or chairs + table)', '{"width_cm": 200, "depth_cm": 100}',
  TRUE, 100
);

-- Plantes extérieures / Jardinières
INSERT INTO public.furniture_catalog (
  category, room_types, name_fr, name_en,
  generic_description, typical_dimensions,
  is_essential, priority
) VALUES (
  'decor', ARRAY['terrasse', 'balcon']::room_type[], 'Plantes extérieures', 'Outdoor plants',
  'Potted outdoor plants', '{"height_cm": 60}',
  FALSE, 80
);

COMMIT;

-- =====================================================
-- VÉRIFICATIONS
-- =====================================================

-- Compter les meubles par catégorie
-- SELECT category, COUNT(*) FROM public.furniture_catalog GROUP BY category ORDER BY category;

-- Voir les meubles essentiels par pièce
-- SELECT
--   UNNEST(room_types) as room,
--   name_fr,
--   is_essential
-- FROM public.furniture_catalog
-- WHERE is_essential = TRUE
-- ORDER BY room, priority DESC;
