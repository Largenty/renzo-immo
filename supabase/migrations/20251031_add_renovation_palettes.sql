-- =====================================================
-- AJOUT DES PALETTES POUR RÉNOVATION LUXE ET CONTEMPORAINE
-- =====================================================
-- Le système génère automatiquement les prompts à partir des style_palettes

-- 0. ACTIVER allow_furniture_toggle POUR CES STYLES
UPDATE transformation_types
SET allow_furniture_toggle = true
WHERE slug IN ('renovation_luxe', 'renovation_contemporaine');

-- 1. RÉNOVATION LUXE
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
  ARRAY['Beige', 'Warm white', 'Taupe', 'Cream', 'Light gray'],
  ARRAY['Solid oak parquet', 'Walnut wood', 'Marble', 'High-end wood laminate'],
  ARRAY['Gold', 'Bronze', 'Deep burgundy', 'Navy blue', 'Emerald green'],
  ARRAY['Noble wood', 'Marble', 'Leather', 'Velvet', 'Brass', 'Crystal'],
  ARRAY['Polished', 'Elegant moldings', 'High baseboards', 'Textured wallpaper', 'Premium paint'],
  ARRAY['Elegant', 'Sophisticated', 'Luxurious', 'Timeless', 'Refined', 'Warm'],
  'Designer chandeliers or high-end pendants + indirect LED lighting + recessed spotlights + elegant floor and wall lamps',
  'Create an elegant and sophisticated high-end renovation with noble materials. Mix modernity and classicism. Add architectural depth and volume while maintaining existing architecture but enhancing it.'
FROM public.transformation_types
WHERE slug = 'renovation_luxe'
ON CONFLICT (transformation_type_id) DO NOTHING;

-- 2. RÉNOVATION CONTEMPORAINE
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
  ARRAY['White', 'Light gray', 'Concrete gray', 'Black', 'Light beige'],
  ARRAY['Light wood planks', 'Polished concrete', 'Light gray tiles'],
  ARRAY['Black', 'Charcoal gray', 'Light wood', 'White'],
  ARRAY['Light wood', 'Concrete', 'Glass', 'Metal', 'Linen'],
  ARRAY['Clean lines', 'Smooth surfaces', 'Matte paint', 'Concrete finish', 'Minimalist'],
  ARRAY['Clean', 'Functional', 'Airy', 'Modern', 'Minimalist', 'Open'],
  'Recessed LED spotlights + minimalist design pendants + indirect architectural lighting + LED strips for modern effects',
  'Create a modern and refined contemporary renovation with clean lines. Prioritize simplicity and functionality. Maximize natural light. Create fluid and open spaces. Use modern materials and discreet integrated technology.'
FROM public.transformation_types
WHERE slug = 'renovation_contemporaine'
ON CONFLICT (transformation_type_id) DO NOTHING;

-- Vérification
SELECT
  tt.slug,
  tt.name,
  tt.allow_furniture_toggle,
  sp.wall_colors,
  sp.floor_materials,
  sp.ambiance_keywords,
  sp.lighting_style
FROM transformation_types tt
LEFT JOIN style_palettes sp ON sp.transformation_type_id = tt.id
WHERE tt.slug IN ('renovation_luxe', 'renovation_contemporaine');
