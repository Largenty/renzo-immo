-- =====================================================
-- AJOUT DES VARIANTES DE MEUBLES POUR RÉNOVATION LUXE ET CONTEMPORAINE
-- =====================================================

-- =====================================================
-- RÉNOVATION LUXE - Variantes de meubles
-- =====================================================

-- Canapé 3 places - Luxe
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Elegant 3-seat sofa in premium beige or taupe velvet with carved wooden legs',
  ARRAY['Velvet', 'Solid oak or walnut'],
  ARRAY['Beige', 'Taupe', 'Cream'],
  'Classic design with high-quality upholstery and refined details'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'renovation_luxe'
  AND fc.name_en = '3-seat sofa'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Table basse - Luxe
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Luxury coffee table in marble or solid wood with brass or gold accents',
  ARRAY['Marble', 'Solid wood', 'Brass'],
  ARRAY['White marble', 'Dark wood', 'Gold'],
  'Elegant design with refined proportions and quality finishes'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'renovation_luxe'
  AND fc.name_en = 'Coffee table'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Lampadaire - Luxe
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Designer floor lamp in brass or bronze with elegant fabric shade',
  ARRAY['Brass', 'Bronze', 'Quality fabric'],
  ARRAY['Gold', 'Bronze', 'Cream shade'],
  'Classic or art deco inspired design with premium materials'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'renovation_luxe'
  AND fc.name_en = 'Floor lamp'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Fauteuil - Luxe
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Elegant armchair in leather or velvet with carved wooden frame',
  ARRAY['Premium leather', 'Velvet', 'Solid wood'],
  ARRAY['Deep burgundy', 'Navy', 'Beige', 'Emerald'],
  'High back with sophisticated upholstery and refined details'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'renovation_luxe'
  AND fc.name_en = 'Armchair'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Table à manger - Luxe
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Luxury dining table in solid wood or marble with elegant turned legs',
  ARRAY['Solid oak', 'Walnut', 'Marble'],
  ARRAY['Dark wood', 'Natural wood', 'White marble'],
  'Classic proportions with refined details and quality craftsmanship'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'renovation_luxe'
  AND fc.name_en = 'Dining table'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Chaises - Luxe
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Elegant dining chairs with upholstered seats in velvet or leather',
  ARRAY['Velvet', 'Leather', 'Solid wood'],
  ARRAY['Beige', 'Navy', 'Gray', 'Natural wood'],
  'Classic design with curved backs and comfortable padding'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'renovation_luxe'
  AND fc.name_en = 'Dining chairs'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Lit double - Luxe
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Luxury king-size bed with upholstered headboard in velvet or quality fabric',
  ARRAY['Premium velvet', 'Quality fabric', 'Solid wood'],
  ARRAY['Beige', 'Taupe', 'Navy', 'Gray'],
  'High headboard with elegant proportions and refined details'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'renovation_luxe'
  AND fc.name_en = 'King-size bed'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Commode - Luxe
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Elegant dresser in solid wood with brass or gold handles',
  ARRAY['Solid wood', 'Brass'],
  ARRAY['Dark wood', 'Natural wood', 'Gold accents'],
  'Classic design with refined proportions and quality hardware'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'renovation_luxe'
  AND fc.name_en = 'Dresser'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- =====================================================
-- RÉNOVATION CONTEMPORAINE - Variantes de meubles
-- =====================================================

-- Canapé 3 places - Contemporain
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Modern 3-seat sofa in light gray fabric with clean lines and metal legs',
  ARRAY['Light gray fabric', 'Matte black metal'],
  ARRAY['Light gray', 'Charcoal', 'White'],
  'Low-profile minimalist design with simple geometric forms'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'renovation_contemporaine'
  AND fc.name_en = '3-seat sofa'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Table basse - Contemporain
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Contemporary coffee table in light wood or concrete with minimalist design',
  ARRAY['Light wood', 'Concrete', 'Glass'],
  ARRAY['Natural light wood', 'Gray concrete', 'Clear glass'],
  'Rectangular or round with simple lines, no ornamentation'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'renovation_contemporaine'
  AND fc.name_en = 'Coffee table'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Lampadaire - Contemporain
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Minimalist floor lamp in black or white metal with simple geometric shade',
  ARRAY['Matte black metal', 'White metal'],
  ARRAY['Black', 'White'],
  'Arc, tripod, or simple vertical design with clean lines'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'renovation_contemporaine'
  AND fc.name_en = 'Floor lamp'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Fauteuil - Contemporain
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Contemporary armchair in light gray fabric with simple metal frame',
  ARRAY['Light fabric', 'Metal frame'],
  ARRAY['Light gray', 'White', 'Black frame'],
  'Low back with minimalist design and clean proportions'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'renovation_contemporaine'
  AND fc.name_en = 'Armchair'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Table à manger - Contemporain
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Modern dining table in light wood or white with simple metal legs',
  ARRAY['Light wood', 'White lacquer', 'Metal'],
  ARRAY['Natural light wood', 'White', 'Black metal'],
  'Rectangular with clean edges and minimal design'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'renovation_contemporaine'
  AND fc.name_en = 'Dining table'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Chaises - Contemporain
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Minimalist dining chairs in white or light wood with metal legs',
  ARRAY['Light wood', 'Plastic', 'Metal'],
  ARRAY['White', 'Natural light wood', 'Black'],
  'Simple sculptural forms with clean lines'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'renovation_contemporaine'
  AND fc.name_en = 'Dining chairs'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Lit double - Contemporain
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Modern king-size bed with low platform and simple upholstered headboard',
  ARRAY['Light wood', 'Fabric', 'Metal'],
  ARRAY['White', 'Light gray', 'Light wood'],
  'Low profile platform design with minimal headboard'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'renovation_contemporaine'
  AND fc.name_en = 'King-size bed'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Commode - Contemporain
INSERT INTO public.style_furniture_variants (
  transformation_type_id, furniture_id,
  description, materials, colors, details
)
SELECT
  tt.id,
  fc.id,
  'Contemporary dresser in light wood or white with handle-free drawers',
  ARRAY['Light wood', 'White lacquer'],
  ARRAY['Natural light wood', 'White', 'Gray'],
  'Clean rectangular design with push-to-open drawers'
FROM public.transformation_types tt, public.furniture_catalog fc
WHERE tt.slug = 'renovation_contemporaine'
  AND fc.name_en = 'Dresser'
ON CONFLICT (transformation_type_id, furniture_id) DO NOTHING;

-- Vérification
SELECT
  tt.slug,
  tt.name,
  COUNT(sfv.id) as variant_count
FROM transformation_types tt
LEFT JOIN style_furniture_variants sfv ON sfv.transformation_type_id = tt.id
WHERE tt.slug IN ('renovation_luxe', 'renovation_contemporaine')
GROUP BY tt.slug, tt.name;
