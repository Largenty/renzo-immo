-- =====================================================
-- MIGRATION MODULAR 004: Home Staging Styles
-- =====================================================
-- Description: Palettes et variantes de meubles pour Home Staging
-- Prérequis: MODULAR_001 + 002 + 003
-- =====================================================

BEGIN;

-- =====================================================
-- STYLE PALETTES
-- =====================================================

-- HOME STAGING MODERNE
INSERT INTO public.style_palettes (
  transformation_type_id,
  wall_colors,
  floor_materials,
  accent_colors,
  materials,
  finishes,
  ambiance_keywords,
  lighting_style,
  general_instructions
)
SELECT
  id,
  ARRAY['Pure white', 'Light gray', 'Off-white'],
  ARRAY['Light oak wood planks', 'Large format gray tiles (60x60cm)', 'Light gray porcelain tiles'],
  ARRAY['Black', 'Brushed steel', 'Charcoal gray'],
  ARRAY['Wood', 'Metal', 'Glass', 'White quartz', 'Matte finishes'],
  ARRAY['Smooth', 'Matte', 'Handleless'],
  ARRAY['Minimal', 'Clean lines', 'Uncluttered', 'Bright', 'Spacious', 'Contemporary'],
  'Recessed LED spotlights + minimal pendant lights',
  'Create a modern, minimalist space with clean lines and neutral tones'
FROM public.transformation_types
WHERE slug = 'home_staging_moderne'
ON CONFLICT (transformation_type_id) DO NOTHING;

-- HOME STAGING SCANDINAVE
INSERT INTO public.style_palettes (
  transformation_type_id,
  wall_colors,
  floor_materials,
  accent_colors,
  materials,
  finishes,
  ambiance_keywords,
  lighting_style,
  general_instructions
)
SELECT
  id,
  ARRAY['Off-white', 'Light gray', 'Warm white'],
  ARRAY['Natural light wood planks (ash or birch)', 'Light wood laminate'],
  ARRAY['Soft gray', 'Dusty blue', 'Warm brass', 'Natural green'],
  ARRAY['Natural wood', 'Wool', 'Linen', 'Ceramic', 'Rattan'],
  ARRAY['Natural', 'Textured', 'Matte'],
  ARRAY['Cozy', 'Hygge', 'Natural', 'Warm', 'Inviting', 'Simple'],
  'Warm pendant lights with natural materials + candles',
  'Create a warm, inviting Scandinavian space with natural materials and textures'
FROM public.transformation_types
WHERE slug = 'home_staging_scandinave'
ON CONFLICT (transformation_type_id) DO NOTHING;

-- HOME STAGING INDUSTRIEL
INSERT INTO public.style_palettes (
  transformation_type_id,
  wall_colors,
  floor_materials,
  accent_colors,
  materials,
  finishes,
  ambiance_keywords,
  lighting_style,
  general_instructions
)
SELECT
  id,
  ARRAY['Exposed brick', 'Dark gray concrete', 'Charcoal gray', 'Black'],
  ARRAY['Polished concrete', 'Dark wood planks', 'Dark tiles'],
  ARRAY['Black metal', 'Copper', 'Vintage brass', 'Dark leather brown'],
  ARRAY['Metal', 'Dark wood', 'Leather', 'Exposed steel', 'Concrete'],
  ARRAY['Raw', 'Exposed', 'Industrial', 'Matte black'],
  ARRAY['Urban', 'Loft', 'Raw', 'Edgy', 'Bold', 'Vintage industrial'],
  'Industrial pendant lights + Edison bulbs + exposed fixtures',
  'Create an urban industrial loft aesthetic with raw materials and metal accents'
FROM public.transformation_types
WHERE slug = 'home_staging_industriel'
ON CONFLICT (transformation_type_id) DO NOTHING;

-- =====================================================
-- FURNITURE VARIANTS - HOME STAGING MODERNE
-- =====================================================

-- Canapé 3 places - Moderne
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'White leather 3-seat sofa with clean lines and brushed steel legs',
  ARRAY['White leather', 'Brushed steel'],
  ARRAY['White', 'Silver'],
  'Low-profile design with minimal cushions'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'home_staging_moderne'
  AND fc.name_en = '3-seat sofa'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Table basse - Moderne
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Light wood coffee table with minimalist design and clean edges',
  ARRAY['Light oak', 'Glass'],
  ARRAY['Natural light wood', 'Clear glass'],
  'Rectangular with simple legs, no ornamentation'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'home_staging_moderne'
  AND fc.name_en = 'Coffee table'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Lampadaire - Moderne
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Black metal floor lamp with simple cylindrical shade',
  ARRAY['Matte black metal'],
  ARRAY['Black', 'White shade'],
  'Arc or tripod style, minimalist design'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'home_staging_moderne'
  AND fc.name_en = 'Floor lamp'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Plante décorative moyenne - Moderne
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Medium potted plant (Monstera or Fiddle Leaf Fig) in white ceramic pot',
  ARRAY['Ceramic'],
  ARRAY['White pot', 'Green plant'],
  'Simple geometric pot, no patterns'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'home_staging_moderne'
  AND fc.name_en = 'Decorative plant (medium)'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Plante décorative petite - Moderne
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Small succulent in white ceramic pot',
  ARRAY['Ceramic'],
  ARRAY['White pot'],
  'Minimal design'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'home_staging_moderne'
  AND fc.name_en = 'Decorative plant (small)'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Table à manger - Moderne
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Light wood dining table with clean lines and metal legs',
  ARRAY['Light oak', 'Brushed steel'],
  ARRAY['Natural wood', 'Silver'],
  'Simple rectangular shape'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'home_staging_moderne'
  AND fc.name_en = 'Dining table'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Chaises SAM - Moderne
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'White or light wood chairs with minimal design',
  ARRAY['Light wood', 'White plastic'],
  ARRAY['White', 'Natural wood'],
  'Scandinavian-inspired but more minimal'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'home_staging_moderne'
  AND fc.name_en = 'Dining chairs (4-6)'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Lit - Moderne
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Low platform bed with upholstered headboard in white or light gray',
  ARRAY['Upholstered fabric', 'Light wood'],
  ARRAY['White', 'Light gray'],
  'Simple lines, no decorative elements'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'home_staging_moderne'
  AND fc.name_en = 'Double bed'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Tables de chevet - Moderne
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Pair of white or light wood floating nightstands with single drawer',
  ARRAY['Light wood', 'White lacquer'],
  ARRAY['White', 'Natural wood'],
  'Wall-mounted or slim-legged'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'home_staging_moderne'
  AND fc.name_en = 'Nightstands (2)'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Bureau desk - Moderne
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Light wood desk with clean lines and metal legs',
  ARRAY['Light oak', 'Matte black metal'],
  ARRAY['Natural wood', 'Black'],
  'Minimal design with cable management'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'home_staging_moderne'
  AND fc.name_en = 'Desk'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Chaise de bureau - Moderne
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'White ergonomic office chair with clean design',
  ARRAY['White mesh', 'Chrome'],
  ARRAY['White', 'Silver'],
  'Modern ergonomic design'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'home_staging_moderne'
  AND fc.name_en = 'Office chair'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- =====================================================
-- FURNITURE VARIANTS - HOME STAGING SCANDINAVE
-- =====================================================

-- Canapé - Scandinave
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Light gray fabric sofa with natural wood legs and cozy cushions',
  ARRAY['Light gray fabric', 'Natural wood'],
  ARRAY['Light gray', 'Natural wood'],
  'Soft, inviting design with textured fabric'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'home_staging_scandinave'
  AND fc.name_en = '3-seat sofa'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Table basse - Scandinave
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Natural wood coffee table with rounded edges and simple joinery',
  ARRAY['Natural oak or ash'],
  ARRAY['Natural light wood'],
  'Organic shape, visible wood grain'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'home_staging_scandinave'
  AND fc.name_en = 'Coffee table'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Lampadaire - Scandinave
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Wooden floor lamp with natural linen shade',
  ARRAY['Natural wood', 'Linen'],
  ARRAY['Natural wood', 'Beige linen'],
  'Warm, cozy lighting'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'home_staging_scandinave'
  AND fc.name_en = 'Floor lamp'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Plante moyenne - Scandinave
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Potted plant (Ficus or Monstera) in natural ceramic or woven basket pot',
  ARRAY['Ceramic', 'Woven basket'],
  ARRAY['Natural tones', 'Terracotta'],
  'Natural, organic pot design'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'home_staging_scandinave'
  AND fc.name_en = 'Decorative plant (medium)'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Table SAM - Scandinave
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Natural wood dining table with simple tapered legs',
  ARRAY['Natural oak or ash'],
  ARRAY['Natural wood'],
  'Classic Scandinavian design'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'home_staging_scandinave'
  AND fc.name_en = 'Dining table'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Chaises SAM - Scandinave
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'White or gray chairs with natural wood legs (Eames or wishbone style)',
  ARRAY['White plastic', 'Gray fabric', 'Natural wood'],
  ARRAY['White', 'Gray', 'Natural wood'],
  'Iconic Scandinavian chair design'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'home_staging_scandinave'
  AND fc.name_en = 'Dining chairs (4-6)'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Lit - Scandinave
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Natural wood bed frame with simple headboard and white/gray textiles',
  ARRAY['Natural oak', 'Linen'],
  ARRAY['Natural wood', 'White', 'Light gray'],
  'Cozy with layered bedding'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'home_staging_scandinave'
  AND fc.name_en = 'Double bed'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- =====================================================
-- FURNITURE VARIANTS - HOME STAGING INDUSTRIEL
-- =====================================================

-- Canapé - Industriel
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Black or brown leather sofa with metal frame and industrial rivets',
  ARRAY['Dark leather', 'Black metal'],
  ARRAY['Black', 'Dark brown'],
  'Vintage industrial aesthetic'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'home_staging_industriel'
  AND fc.name_en = '3-seat sofa'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Table basse - Industriel
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Metal and reclaimed wood coffee table with industrial wheels or metal base',
  ARRAY['Dark reclaimed wood', 'Black metal'],
  ARRAY['Dark wood', 'Black'],
  'Raw industrial look with exposed hardware'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'home_staging_industriel'
  AND fc.name_en = 'Coffee table'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Lampadaire - Industriel
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Black metal floor lamp with Edison bulb and exposed wiring',
  ARRAY['Matte black metal', 'Brass accents'],
  ARRAY['Black', 'Vintage brass'],
  'Industrial factory style'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'home_staging_industriel'
  AND fc.name_en = 'Floor lamp'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Table SAM - Industriel
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Dark wood dining table with heavy metal base and industrial finish',
  ARRAY['Dark reclaimed wood', 'Black metal'],
  ARRAY['Dark wood', 'Black'],
  'Robust, raw industrial design'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'home_staging_industriel'
  AND fc.name_en = 'Dining table'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Chaises SAM - Industriel
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Black metal chairs with minimal back (Tolix or industrial style)',
  ARRAY['Black metal'],
  ARRAY['Matte black'],
  'Stackable industrial chairs'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'home_staging_industriel'
  AND fc.name_en = 'Dining chairs (4-6)'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Lit - Industriel
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Black metal bed frame with industrial pipe headboard',
  ARRAY['Black metal', 'Industrial pipes'],
  ARRAY['Black'],
  'Raw industrial loft aesthetic'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'home_staging_industriel'
  AND fc.name_en = 'Double bed'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

COMMIT;

-- =====================================================
-- VÉRIFICATIONS
-- =====================================================

-- Compter les palettes
-- SELECT COUNT(*) FROM public.style_palettes;

-- Compter les variantes par style
-- SELECT tt.slug, COUNT(sfv.id) as variant_count
-- FROM public.transformation_types tt
-- LEFT JOIN public.style_furniture_variants sfv ON sfv.transformation_type_id = tt.id
-- WHERE tt.slug IN ('home_staging_moderne', 'home_staging_scandinave', 'home_staging_industriel')
-- GROUP BY tt.slug;
