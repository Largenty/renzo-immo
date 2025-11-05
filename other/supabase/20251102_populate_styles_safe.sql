-- =====================================================
-- MIGRATION: Populate Transformation Types & Style Palettes (SAFE VERSION)
-- =====================================================
-- Date: 2025-11-02
-- Purpose: Create all transformation types and their style palettes
-- User feedback: "le style scandinave marche, le style industriel marche
--                 mais tout les autres ne marche pas des masses"
-- Solution: Create styles with palettes that perfectly match prompt template
--
-- SAFE: Updates existing types, adds new ones, doesn't delete anything
-- =====================================================

BEGIN;

-- =====================================================
-- PART 1: UPDATE OR INSERT TRANSFORMATION TYPES
-- =====================================================

-- 1. DÉPERSONNALISATION (Update if exists, insert if not)
INSERT INTO transformation_types (slug, name, description, icon_name, category, allow_furniture_toggle, is_system, is_active) VALUES
('depersonnalisation', 'Dépersonnalisation', 'Retire les éléments personnels pour une présentation neutre', 'Home', 'depersonnalisation', false, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  category = EXCLUDED.category,
  allow_furniture_toggle = EXCLUDED.allow_furniture_toggle,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

INSERT INTO transformation_types (slug, name, description, icon_name, category, allow_furniture_toggle, is_system, is_active) VALUES
('depersonnalisation_premium', 'Dépersonnalisation Premium', 'Dépersonnalisation avancée avec optimisation lumière', 'Sparkles', 'depersonnalisation', false, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  category = EXCLUDED.category,
  allow_furniture_toggle = EXCLUDED.allow_furniture_toggle,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 2. HOME STAGING STYLES (Update existing)
INSERT INTO transformation_types (slug, name, description, icon_name, category, allow_furniture_toggle, is_system, is_active) VALUES
('home_staging_moderne', 'Home Staging Moderne', 'Mobilier contemporain épuré aux lignes minimalistes', 'Sofa', 'staging', true, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  category = EXCLUDED.category,
  allow_furniture_toggle = EXCLUDED.allow_furniture_toggle,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

INSERT INTO transformation_types (slug, name, description, icon_name, category, allow_furniture_toggle, is_system, is_active) VALUES
('home_staging_scandinave', 'Home Staging Scandinave', 'Style scandinave chaleureux et hygge', 'Coffee', 'staging', true, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  category = EXCLUDED.category,
  allow_furniture_toggle = EXCLUDED.allow_furniture_toggle,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

INSERT INTO transformation_types (slug, name, description, icon_name, category, allow_furniture_toggle, is_system, is_active) VALUES
('home_staging_industriel', 'Home Staging Industriel', 'Style industriel avec matériaux bruts et métal', 'Factory', 'staging', true, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  category = EXCLUDED.category,
  allow_furniture_toggle = EXCLUDED.allow_furniture_toggle,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 3. NEW STYLES - Add only if they don't exist
INSERT INTO transformation_types (slug, name, description, icon_name, category, allow_furniture_toggle, is_system, is_active) VALUES
('home_staging_contemporain', 'Home Staging Contemporain', 'Design actuel avec touches de couleurs vives', 'Palette', 'staging', true, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  category = EXCLUDED.category,
  allow_furniture_toggle = EXCLUDED.allow_furniture_toggle,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

INSERT INTO transformation_types (slug, name, description, icon_name, category, allow_furniture_toggle, is_system, is_active) VALUES
('home_staging_classique', 'Home Staging Classique Chic', 'Élégance intemporelle avec moulures et matériaux nobles', 'Crown', 'staging', true, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  category = EXCLUDED.category,
  allow_furniture_toggle = EXCLUDED.allow_furniture_toggle,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

INSERT INTO transformation_types (slug, name, description, icon_name, category, allow_furniture_toggle, is_system, is_active) VALUES
('home_staging_nature', 'Home Staging Nature', 'Ambiance naturelle avec bois brut et tons terreux', 'Leaf', 'staging', true, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  category = EXCLUDED.category,
  allow_furniture_toggle = EXCLUDED.allow_furniture_toggle,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

INSERT INTO transformation_types (slug, name, description, icon_name, category, allow_furniture_toggle, is_system, is_active) VALUES
('home_staging_minimaliste', 'Home Staging Minimaliste', 'Épuré extrême, couleurs neutres, peu d''objets', 'Minus', 'staging', true, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  category = EXCLUDED.category,
  allow_furniture_toggle = EXCLUDED.allow_furniture_toggle,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

INSERT INTO transformation_types (slug, name, description, icon_name, category, allow_furniture_toggle, is_system, is_active) VALUES
('home_staging_mediterraneen', 'Home Staging Méditerranéen', 'Blanc éclatant avec touches de bleu et terracotta', 'Sun', 'staging', true, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  category = EXCLUDED.category,
  allow_furniture_toggle = EXCLUDED.allow_furniture_toggle,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

INSERT INTO transformation_types (slug, name, description, icon_name, category, allow_furniture_toggle, is_system, is_active) VALUES
('home_staging_boheme', 'Home Staging Bohème', 'Chaleureux et éclectique avec textiles et plantes', 'Flower', 'staging', true, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  category = EXCLUDED.category,
  allow_furniture_toggle = EXCLUDED.allow_furniture_toggle,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 4. RENOVATION STYLES
INSERT INTO transformation_types (slug, name, description, icon_name, category, allow_furniture_toggle, is_system, is_active) VALUES
('renovation_luxe', 'Rénovation Luxe', 'Transformation haut de gamme avec matériaux nobles', 'Crown', 'renovation', false, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  category = EXCLUDED.category,
  allow_furniture_toggle = EXCLUDED.allow_furniture_toggle,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

INSERT INTO transformation_types (slug, name, description, icon_name, category, allow_furniture_toggle, is_system, is_active) VALUES
('renovation_contemporaine', 'Rénovation Contemporaine', 'Rénovation moderne et épurée', 'Paintbrush', 'renovation', false, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  category = EXCLUDED.category,
  allow_furniture_toggle = EXCLUDED.allow_furniture_toggle,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 5. CUSTOM
INSERT INTO transformation_types (slug, name, description, icon_name, category, allow_furniture_toggle, is_system, is_active) VALUES
('style_personnalise', 'Style Personnalisé', 'Créez votre propre style avec un prompt personnalisé', 'Wand', 'custom', false, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  category = EXCLUDED.category,
  allow_furniture_toggle = EXCLUDED.allow_furniture_toggle,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- =====================================================
-- PART 2: CREATE OR UPDATE STYLE PALETTES
-- =====================================================
-- Using INSERT ... ON CONFLICT to update existing palettes
-- =====================================================

-- HOME STAGING MODERNE (Modern, minimal, clean)
INSERT INTO style_palettes (
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
FROM transformation_types
WHERE slug = 'home_staging_moderne'
ON CONFLICT (transformation_type_id) DO UPDATE SET
  wall_colors = EXCLUDED.wall_colors,
  floor_materials = EXCLUDED.floor_materials,
  accent_colors = EXCLUDED.accent_colors,
  materials = EXCLUDED.materials,
  finishes = EXCLUDED.finishes,
  ambiance_keywords = EXCLUDED.ambiance_keywords,
  lighting_style = EXCLUDED.lighting_style,
  general_instructions = EXCLUDED.general_instructions,
  updated_at = NOW();

-- HOME STAGING SCANDINAVE (Cozy, hygge, natural)
INSERT INTO style_palettes (
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
FROM transformation_types
WHERE slug = 'home_staging_scandinave'
ON CONFLICT (transformation_type_id) DO UPDATE SET
  wall_colors = EXCLUDED.wall_colors,
  floor_materials = EXCLUDED.floor_materials,
  accent_colors = EXCLUDED.accent_colors,
  materials = EXCLUDED.materials,
  finishes = EXCLUDED.finishes,
  ambiance_keywords = EXCLUDED.ambiance_keywords,
  lighting_style = EXCLUDED.lighting_style,
  general_instructions = EXCLUDED.general_instructions,
  updated_at = NOW();

-- HOME STAGING INDUSTRIEL (Urban, raw, metal)
INSERT INTO style_palettes (
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
FROM transformation_types
WHERE slug = 'home_staging_industriel'
ON CONFLICT (transformation_type_id) DO UPDATE SET
  wall_colors = EXCLUDED.wall_colors,
  floor_materials = EXCLUDED.floor_materials,
  accent_colors = EXCLUDED.accent_colors,
  materials = EXCLUDED.materials,
  finishes = EXCLUDED.finishes,
  ambiance_keywords = EXCLUDED.ambiance_keywords,
  lighting_style = EXCLUDED.lighting_style,
  general_instructions = EXCLUDED.general_instructions,
  updated_at = NOW();

-- HOME STAGING CONTEMPORAIN (Modern with pops of color)
INSERT INTO style_palettes (
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
  ARRAY['White', 'Light gray', 'Soft beige'],
  ARRAY['Light wood planks', 'Large format tiles', 'Polished concrete'],
  ARRAY['Navy blue', 'Emerald green', 'Mustard yellow', 'Coral orange'],
  ARRAY['Wood', 'Fabric', 'Metal', 'Marble', 'Glass'],
  ARRAY['Smooth', 'Polished', 'Matte', 'Glossy accents'],
  ARRAY['Fresh', 'Dynamic', 'Stylish', 'Balanced', 'Inviting', 'Sophisticated'],
  'Modern pendant lights + integrated LED strips + statement fixtures',
  'Create a contemporary space with pops of color and balanced modern aesthetics'
FROM transformation_types
WHERE slug = 'home_staging_contemporain'
ON CONFLICT (transformation_type_id) DO UPDATE SET
  wall_colors = EXCLUDED.wall_colors,
  floor_materials = EXCLUDED.floor_materials,
  accent_colors = EXCLUDED.accent_colors,
  materials = EXCLUDED.materials,
  finishes = EXCLUDED.finishes,
  ambiance_keywords = EXCLUDED.ambiance_keywords,
  lighting_style = EXCLUDED.lighting_style,
  general_instructions = EXCLUDED.general_instructions,
  updated_at = NOW();

-- HOME STAGING CLASSIQUE CHIC (Timeless elegance)
INSERT INTO style_palettes (
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
  ARRAY['Warm white', 'Cream', 'Soft gray', 'Pale taupe'],
  ARRAY['Dark oak parquet (herringbone pattern)', 'Light oak planks', 'Cream marble tiles'],
  ARRAY['Gold', 'Navy blue', 'Deep burgundy', 'Forest green'],
  ARRAY['Wood', 'Velvet', 'Marble', 'Brass', 'Crystal'],
  ARRAY['Polished', 'Ornate', 'Carved details', 'Glossy'],
  ARRAY['Elegant', 'Refined', 'Timeless', 'Luxurious', 'Graceful', 'Sophisticated'],
  'Crystal chandeliers + brass sconces + table lamps with fabric shades',
  'Create an elegant classic space with refined details and timeless sophistication'
FROM transformation_types
WHERE slug = 'home_staging_classique'
ON CONFLICT (transformation_type_id) DO UPDATE SET
  wall_colors = EXCLUDED.wall_colors,
  floor_materials = EXCLUDED.floor_materials,
  accent_colors = EXCLUDED.accent_colors,
  materials = EXCLUDED.materials,
  finishes = EXCLUDED.finishes,
  ambiance_keywords = EXCLUDED.ambiance_keywords,
  lighting_style = EXCLUDED.lighting_style,
  general_instructions = EXCLUDED.general_instructions,
  updated_at = NOW();

-- HOME STAGING NATURE (Natural, earthy, organic)
INSERT INTO style_palettes (
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
  ARRAY['Warm beige', 'Terracotta', 'Sage green', 'Clay brown'],
  ARRAY['Raw wood planks', 'Natural stone tiles', 'Cork flooring'],
  ARRAY['Forest green', 'Terracotta orange', 'Mustard', 'Earth brown'],
  ARRAY['Raw wood', 'Stone', 'Rattan', 'Jute', 'Linen', 'Clay'],
  ARRAY['Natural', 'Raw', 'Textured', 'Unpolished', 'Organic'],
  ARRAY['Natural', 'Earthy', 'Organic', 'Calming', 'Grounded', 'Rustic'],
  'Natural fiber pendant lights + wooden fixtures + warm bulbs',
  'Create a natural organic space with earthy tones and raw natural materials'
FROM transformation_types
WHERE slug = 'home_staging_nature'
ON CONFLICT (transformation_type_id) DO UPDATE SET
  wall_colors = EXCLUDED.wall_colors,
  floor_materials = EXCLUDED.floor_materials,
  accent_colors = EXCLUDED.accent_colors,
  materials = EXCLUDED.materials,
  finishes = EXCLUDED.finishes,
  ambiance_keywords = EXCLUDED.ambiance_keywords,
  lighting_style = EXCLUDED.lighting_style,
  general_instructions = EXCLUDED.general_instructions,
  updated_at = NOW();

-- HOME STAGING MINIMALISTE (Extreme simplicity)
INSERT INTO style_palettes (
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
  ARRAY['Pure white', 'Off-white', 'Very light gray'],
  ARRAY['Light wood planks', 'White polished concrete', 'Pale gray tiles'],
  ARRAY['Black', 'Charcoal', 'Single muted tone'],
  ARRAY['Wood', 'Metal', 'Glass', 'Smooth surfaces'],
  ARRAY['Matte', 'Smooth', 'Seamless', 'Handleless'],
  ARRAY['Minimal', 'Zen', 'Serene', 'Uncluttered', 'Pure', 'Spacious'],
  'Recessed LED lighting + single minimalist pendant',
  'Create an extremely minimal space with maximum empty space and very few objects'
FROM transformation_types
WHERE slug = 'home_staging_minimaliste'
ON CONFLICT (transformation_type_id) DO UPDATE SET
  wall_colors = EXCLUDED.wall_colors,
  floor_materials = EXCLUDED.floor_materials,
  accent_colors = EXCLUDED.accent_colors,
  materials = EXCLUDED.materials,
  finishes = EXCLUDED.finishes,
  ambiance_keywords = EXCLUDED.ambiance_keywords,
  lighting_style = EXCLUDED.lighting_style,
  general_instructions = EXCLUDED.general_instructions,
  updated_at = NOW();

-- HOME STAGING MÉDITERRANÉEN (Bright, airy, coastal)
INSERT INTO style_palettes (
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
  ARRAY['Bright white', 'Cream white', 'Sky blue'],
  ARRAY['Terracotta tiles', 'White stone tiles', 'Light wood planks'],
  ARRAY['Azure blue', 'Turquoise', 'Terracotta', 'Yellow ochre'],
  ARRAY['Stone', 'Ceramic', 'Wood', 'Wicker', 'Linen'],
  ARRAY['Natural', 'Smooth', 'Glossy ceramic', 'Textured'],
  ARRAY['Bright', 'Airy', 'Coastal', 'Sunny', 'Relaxed', 'Fresh'],
  'Natural light maximized + woven pendant lights + ceramic fixtures',
  'Create a bright Mediterranean space with white walls and pops of blue and terracotta'
FROM transformation_types
WHERE slug = 'home_staging_mediterraneen'
ON CONFLICT (transformation_type_id) DO UPDATE SET
  wall_colors = EXCLUDED.wall_colors,
  floor_materials = EXCLUDED.floor_materials,
  accent_colors = EXCLUDED.accent_colors,
  materials = EXCLUDED.materials,
  finishes = EXCLUDED.finishes,
  ambiance_keywords = EXCLUDED.ambiance_keywords,
  lighting_style = EXCLUDED.lighting_style,
  general_instructions = EXCLUDED.general_instructions,
  updated_at = NOW();

-- HOME STAGING BOHÈME (Eclectic, warm, layered)
INSERT INTO style_palettes (
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
  ARRAY['Warm white', 'Cream', 'Terracotta', 'Dusty pink'],
  ARRAY['Natural wood planks', 'Vintage patterned tiles', 'Woven rugs'],
  ARRAY['Burnt orange', 'Mustard yellow', 'Deep teal', 'Burgundy', 'Dusty pink'],
  ARRAY['Wood', 'Rattan', 'Macrame', 'Velvet', 'Vintage textiles', 'Plants'],
  ARRAY['Textured', 'Layered', 'Eclectic', 'Vintage'],
  ARRAY['Warm', 'Eclectic', 'Cozy', 'Artistic', 'Layered', 'Inviting'],
  'Moroccan lanterns + macrame hanging lights + string lights + candles',
  'Create a warm bohemian space with layered textiles, plants, and eclectic decor'
FROM transformation_types
WHERE slug = 'home_staging_boheme'
ON CONFLICT (transformation_type_id) DO UPDATE SET
  wall_colors = EXCLUDED.wall_colors,
  floor_materials = EXCLUDED.floor_materials,
  accent_colors = EXCLUDED.accent_colors,
  materials = EXCLUDED.materials,
  finishes = EXCLUDED.finishes,
  ambiance_keywords = EXCLUDED.ambiance_keywords,
  lighting_style = EXCLUDED.lighting_style,
  general_instructions = EXCLUDED.general_instructions,
  updated_at = NOW();

-- RÉNOVATION LUXE (High-end materials)
INSERT INTO style_palettes (
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
  ARRAY['Soft gray', 'Warm white', 'Deep charcoal', 'Navy blue'],
  ARRAY['Wide oak herringbone parquet', 'Large format marble tiles', 'Polished concrete'],
  ARRAY['Gold', 'Brass', 'Black', 'Deep blue'],
  ARRAY['Marble', 'Wood', 'Brass', 'Leather', 'Velvet', 'Glass'],
  ARRAY['Polished', 'Smooth', 'Metallic', 'Luxurious'],
  ARRAY['Luxurious', 'Premium', 'Sophisticated', 'Elegant', 'High-end', 'Refined'],
  'Designer pendant lights + integrated lighting + accent spotlights',
  'Create a luxurious high-end space with premium materials and sophisticated details'
FROM transformation_types
WHERE slug = 'renovation_luxe'
ON CONFLICT (transformation_type_id) DO UPDATE SET
  wall_colors = EXCLUDED.wall_colors,
  floor_materials = EXCLUDED.floor_materials,
  accent_colors = EXCLUDED.accent_colors,
  materials = EXCLUDED.materials,
  finishes = EXCLUDED.finishes,
  ambiance_keywords = EXCLUDED.ambiance_keywords,
  lighting_style = EXCLUDED.lighting_style,
  general_instructions = EXCLUDED.general_instructions,
  updated_at = NOW();

-- RÉNOVATION CONTEMPORAINE (Modern renovation)
INSERT INTO style_palettes (
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
  ARRAY['White', 'Light gray', 'Concrete gray'],
  ARRAY['Light wood planks', 'Large format tiles', 'Polished concrete'],
  ARRAY['Black', 'Charcoal', 'Steel gray'],
  ARRAY['Wood', 'Concrete', 'Metal', 'Glass', 'Stone'],
  ARRAY['Smooth', 'Matte', 'Polished', 'Clean lines'],
  ARRAY['Modern', 'Clean', 'Functional', 'Bright', 'Streamlined', 'Efficient'],
  'Recessed LED strips + modern pendant lights + minimal fixtures',
  'Create a modern renovated space with clean lines and functional design'
FROM transformation_types
WHERE slug = 'renovation_contemporaine'
ON CONFLICT (transformation_type_id) DO UPDATE SET
  wall_colors = EXCLUDED.wall_colors,
  floor_materials = EXCLUDED.floor_materials,
  accent_colors = EXCLUDED.accent_colors,
  materials = EXCLUDED.materials,
  finishes = EXCLUDED.finishes,
  ambiance_keywords = EXCLUDED.ambiance_keywords,
  lighting_style = EXCLUDED.lighting_style,
  general_instructions = EXCLUDED.general_instructions,
  updated_at = NOW();

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES (uncomment to run)
-- =====================================================

-- Count transformation types
-- SELECT COUNT(*) as total_styles FROM transformation_types WHERE is_system = true AND is_active = true;

-- Count styles with palettes
-- SELECT
--   tt.name,
--   tt.slug,
--   CASE WHEN sp.id IS NOT NULL THEN '✅ Has Palette' ELSE '⚠️ No Palette' END as palette_status
-- FROM transformation_types tt
-- LEFT JOIN style_palettes sp ON sp.transformation_type_id = tt.id
-- WHERE tt.is_system = true AND tt.is_active = true
-- ORDER BY tt.name;

-- Show summary by category
-- SELECT
--   tt.category,
--   COUNT(tt.id) as style_count,
--   COUNT(sp.id) as palette_count
-- FROM transformation_types tt
-- LEFT JOIN style_palettes sp ON sp.transformation_type_id = tt.id
-- WHERE tt.is_system = true AND tt.is_active = true
-- GROUP BY tt.category
-- ORDER BY tt.category;
