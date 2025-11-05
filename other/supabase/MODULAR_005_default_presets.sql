-- =====================================================
-- MIGRATION MODULAR 005: Default Furniture Presets
-- =====================================================
-- Description: Presets de sélection de meubles par défaut
-- Prérequis: MODULAR_001 + 002 + 003 + 004
-- =====================================================

BEGIN;

-- =====================================================
-- HOME STAGING MODERNE - PRESETS
-- =====================================================

-- Salon Moderne
INSERT INTO public.room_furniture_presets (
  transformation_type_id,
  room_type,
  user_id,
  name,
  description,
  furniture_ids,
  is_system,
  is_public
)
SELECT
  tt.id,
  'salon'::room_type,
  NULL,
  'Salon Moderne Standard',
  'Configuration par défaut pour un salon moderne',
  ARRAY[
    (SELECT id FROM public.furniture_catalog WHERE name_en = '3-seat sofa'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Coffee table'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Floor lamp'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Decorative plant (medium)'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Decorative plant (small)')
  ],
  TRUE,
  TRUE
FROM public.transformation_types tt
WHERE tt.slug = 'home_staging_moderne';

-- Salle à manger Moderne
INSERT INTO public.room_furniture_presets (
  transformation_type_id,
  room_type,
  user_id,
  name,
  description,
  furniture_ids,
  is_system,
  is_public
)
SELECT
  tt.id,
  'salle_a_manger'::room_type,
  NULL,
  'Salle à manger Moderne Standard',
  'Configuration par défaut pour une salle à manger moderne',
  ARRAY[
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Dining table'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Dining chairs (4-6)'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Pendant light / Chandelier')
  ],
  TRUE,
  TRUE
FROM public.transformation_types tt
WHERE tt.slug = 'home_staging_moderne';

-- Chambre Moderne
INSERT INTO public.room_furniture_presets (
  transformation_type_id,
  room_type,
  user_id,
  name,
  description,
  furniture_ids,
  is_system,
  is_public
)
SELECT
  tt.id,
  'chambre'::room_type,
  NULL,
  'Chambre Moderne Standard',
  'Configuration par défaut pour une chambre moderne',
  ARRAY[
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Double bed'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Nightstands (2)'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Table lamps (2)')
  ],
  TRUE,
  TRUE
FROM public.transformation_types tt
WHERE tt.slug = 'home_staging_moderne';

-- Bureau Moderne
INSERT INTO public.room_furniture_presets (
  transformation_type_id,
  room_type,
  user_id,
  name,
  description,
  furniture_ids,
  is_system,
  is_public
)
SELECT
  tt.id,
  'bureau'::room_type,
  NULL,
  'Bureau Moderne Standard',
  'Configuration par défaut pour un bureau moderne',
  ARRAY[
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Desk'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Office chair'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Floor lamp'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Decorative plant (medium)')
  ],
  TRUE,
  TRUE
FROM public.transformation_types tt
WHERE tt.slug = 'home_staging_moderne';

-- =====================================================
-- HOME STAGING SCANDINAVE - PRESETS
-- =====================================================

-- Salon Scandinave
INSERT INTO public.room_furniture_presets (
  transformation_type_id,
  room_type,
  user_id,
  name,
  description,
  furniture_ids,
  is_system,
  is_public
)
SELECT
  tt.id,
  'salon'::room_type,
  NULL,
  'Salon Scandinave Standard',
  'Configuration par défaut pour un salon scandinave',
  ARRAY[
    (SELECT id FROM public.furniture_catalog WHERE name_en = '3-seat sofa'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Coffee table'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Floor lamp'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Decorative plant (medium)'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Rug')
  ],
  TRUE,
  TRUE
FROM public.transformation_types tt
WHERE tt.slug = 'home_staging_scandinave';

-- Salle à manger Scandinave
INSERT INTO public.room_furniture_presets (
  transformation_type_id,
  room_type,
  user_id,
  name,
  description,
  furniture_ids,
  is_system,
  is_public
)
SELECT
  tt.id,
  'salle_a_manger'::room_type,
  NULL,
  'Salle à manger Scandinave Standard',
  'Configuration par défaut pour une salle à manger scandinave',
  ARRAY[
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Dining table'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Dining chairs (4-6)'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Pendant light / Chandelier')
  ],
  TRUE,
  TRUE
FROM public.transformation_types tt
WHERE tt.slug = 'home_staging_scandinave';

-- Chambre Scandinave
INSERT INTO public.room_furniture_presets (
  transformation_type_id,
  room_type,
  user_id,
  name,
  description,
  furniture_ids,
  is_system,
  is_public
)
SELECT
  tt.id,
  'chambre'::room_type,
  NULL,
  'Chambre Scandinave Standard',
  'Configuration par défaut pour une chambre scandinave',
  ARRAY[
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Double bed'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Nightstands (2)'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Table lamps (2)'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Rug')
  ],
  TRUE,
  TRUE
FROM public.transformation_types tt
WHERE tt.slug = 'home_staging_scandinave';

-- Bureau Scandinave
INSERT INTO public.room_furniture_presets (
  transformation_type_id,
  room_type,
  user_id,
  name,
  description,
  furniture_ids,
  is_system,
  is_public
)
SELECT
  tt.id,
  'bureau'::room_type,
  NULL,
  'Bureau Scandinave Standard',
  'Configuration par défaut pour un bureau scandinave',
  ARRAY[
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Desk'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Office chair'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Bookshelf'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Decorative plant (medium)')
  ],
  TRUE,
  TRUE
FROM public.transformation_types tt
WHERE tt.slug = 'home_staging_scandinave';

-- =====================================================
-- HOME STAGING INDUSTRIEL - PRESETS
-- =====================================================

-- Salon Industriel
INSERT INTO public.room_furniture_presets (
  transformation_type_id,
  room_type,
  user_id,
  name,
  description,
  furniture_ids,
  is_system,
  is_public
)
SELECT
  tt.id,
  'salon'::room_type,
  NULL,
  'Salon Industriel Standard',
  'Configuration par défaut pour un salon industriel',
  ARRAY[
    (SELECT id FROM public.furniture_catalog WHERE name_en = '3-seat sofa'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Coffee table'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Floor lamp'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Bookshelf')
  ],
  TRUE,
  TRUE
FROM public.transformation_types tt
WHERE tt.slug = 'home_staging_industriel';

-- Salle à manger Industriel
INSERT INTO public.room_furniture_presets (
  transformation_type_id,
  room_type,
  user_id,
  name,
  description,
  furniture_ids,
  is_system,
  is_public
)
SELECT
  tt.id,
  'salle_a_manger'::room_type,
  NULL,
  'Salle à manger Industriel Standard',
  'Configuration par défaut pour une salle à manger industrielle',
  ARRAY[
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Dining table'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Dining chairs (4-6)'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Pendant light / Chandelier')
  ],
  TRUE,
  TRUE
FROM public.transformation_types tt
WHERE tt.slug = 'home_staging_industriel';

-- Chambre Industriel
INSERT INTO public.room_furniture_presets (
  transformation_type_id,
  room_type,
  user_id,
  name,
  description,
  furniture_ids,
  is_system,
  is_public
)
SELECT
  tt.id,
  'chambre'::room_type,
  NULL,
  'Chambre Industriel Standard',
  'Configuration par défaut pour une chambre industrielle',
  ARRAY[
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Double bed'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Nightstands (2)'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Floor lamp')
  ],
  TRUE,
  TRUE
FROM public.transformation_types tt
WHERE tt.slug = 'home_staging_industriel';

-- Bureau Industriel
INSERT INTO public.room_furniture_presets (
  transformation_type_id,
  room_type,
  user_id,
  name,
  description,
  furniture_ids,
  is_system,
  is_public
)
SELECT
  tt.id,
  'bureau'::room_type,
  NULL,
  'Bureau Industriel Standard',
  'Configuration par défaut pour un bureau industriel',
  ARRAY[
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Desk'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Office chair'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Bookshelf'),
    (SELECT id FROM public.furniture_catalog WHERE name_en = 'Floor lamp')
  ],
  TRUE,
  TRUE
FROM public.transformation_types tt
WHERE tt.slug = 'home_staging_industriel';

COMMIT;

-- =====================================================
-- VÉRIFICATIONS
-- =====================================================

-- Compter les presets par style
-- SELECT tt.slug, COUNT(rfp.id) as preset_count
-- FROM public.transformation_types tt
-- LEFT JOIN public.room_furniture_presets rfp ON rfp.transformation_type_id = tt.id
-- WHERE tt.slug IN ('home_staging_moderne', 'home_staging_scandinave', 'home_staging_industriel')
-- GROUP BY tt.slug;

-- Voir les presets par style et room
-- SELECT
--   tt.slug,
--   rfp.room_type,
--   rfp.name,
--   array_length(rfp.furniture_ids, 1) as furniture_count
-- FROM public.room_furniture_presets rfp
-- JOIN public.transformation_types tt ON tt.id = rfp.transformation_type_id
-- WHERE rfp.is_system = TRUE
-- ORDER BY tt.slug, rfp.room_type;
