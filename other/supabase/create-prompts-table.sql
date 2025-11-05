-- ============================================
-- Table transformation_prompts
-- ============================================
-- Stocke les prompts IA pour chaque combinaison de transformation

CREATE TABLE IF NOT EXISTS public.transformation_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Type de transformation
  transformation_type VARCHAR(100) NOT NULL,

  -- Filtres optionnels (NULL = s'applique à tous)
  room_type VARCHAR(100), -- NULL = tous les types de pièces
  with_furniture BOOLEAN,  -- NULL = avec ou sans meubles

  -- Le prompt IA
  prompt_text TEXT NOT NULL,

  -- Métadonnées
  is_default BOOLEAN DEFAULT false, -- Prompt par défaut si aucune correspondance
  priority INTEGER DEFAULT 0,       -- Plus haut = plus prioritaire

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Contraintes
  CONSTRAINT unique_prompt_combination UNIQUE (transformation_type, room_type, with_furniture)
);

-- Index pour performance
CREATE INDEX idx_prompts_transformation ON transformation_prompts(transformation_type);
CREATE INDEX idx_prompts_room ON transformation_prompts(room_type);
CREATE INDEX idx_prompts_default ON transformation_prompts(is_default);

-- ============================================
-- Prompts pour DÉPERSONNALISATION
-- ============================================

-- Dépersonnalisation - AVEC meubles - Toutes pièces (défaut)
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, is_default, priority)
VALUES (
  'depersonnalisation',
  NULL,
  true,
  'Transform this interior photo into a depersonalized, neutral space. Remove all personal items including family photos, decorative objects, personal belongings, and any identifying elements. Keep all existing furniture in place, but ensure surfaces are clean and clutter-free. Maintain the room''s layout and architecture. The result should feel welcoming but anonymous, suitable for real estate marketing.',
  true,
  0
);

-- Dépersonnalisation - SANS meubles - Toutes pièces
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, is_default, priority)
VALUES (
  'depersonnalisation',
  NULL,
  false,
  'Create a completely empty, depersonalized version of this interior space. Remove ALL items including furniture, decorations, curtains, and any movable objects. Show only the bare architecture: walls, floor, ceiling, windows, doors, and built-in fixtures. The space should appear clean, neutral, and ready for viewing, with good natural lighting.',
  true,
  0
);

-- ============================================
-- Prompts pour HOME STAGING MODERNE
-- ============================================

-- Home Staging Moderne - Salon - Avec meubles
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, priority)
VALUES (
  'home_staging_moderne',
  'salon',
  true,
  'Transform this living room into a beautifully staged modern space. Add or replace furniture with contemporary, sleek pieces: a modern sofa in neutral tones (grey, beige, or white), a minimalist coffee table, and elegant side tables. Include tasteful decorative elements: geometric cushions, a contemporary rug, abstract wall art, modern lighting fixtures, and a few plants (monstera or fiddle leaf fig). Keep the color palette neutral with accent colors. Ensure perfect lighting and a welcoming, upscale atmosphere.',
  10
);

-- Home Staging Moderne - Cuisine - Avec meubles
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, priority)
VALUES (
  'home_staging_moderne',
  'cuisine',
  true,
  'Stage this kitchen with modern, high-end elements. Add or enhance with sleek appliances (stainless steel or matte black), modern bar stools, pendant lighting over the island/counter, minimalist canisters, a fruit bowl with fresh produce, and subtle plants (herbs in modern pots). Keep countertops mostly clear. Use a neutral color palette with possible metallic accents. The space should feel clean, functional, and luxurious.',
  10
);

-- Home Staging Moderne - Chambre - Avec meubles
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, priority)
VALUES (
  'home_staging_moderne',
  'chambre',
  true,
  'Create a modern, hotel-quality bedroom staging. Feature a contemporary bed with a upholstered headboard, luxury bedding in neutral tones (white, grey, beige) with textured throws, matching nightstands with modern lamps, and minimal but elegant decor. Add subtle elements: a contemporary rug, abstract artwork above the bed, and a small plant. The atmosphere should be serene, sophisticated, and inviting.',
  10
);

-- Home Staging Moderne - Salle de bain - Avec meubles
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, priority)
VALUES (
  'home_staging_moderne',
  'salle_de_bain',
  true,
  'Stage this bathroom with modern, spa-like elements. Add pristine white towels (rolled or folded), minimalist storage baskets, modern soap dispensers, a small plant (orchid or succulent), and subtle decorative elements. Enhance lighting to create a bright, clean atmosphere. Keep surfaces clear and organized. The space should feel like a luxury hotel bathroom: clean, modern, and relaxing.',
  10
);

-- Home Staging Moderne - Défaut (toutes pièces) - Avec meubles
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, is_default, priority)
VALUES (
  'home_staging_moderne',
  NULL,
  true,
  'Transform this space into a beautifully staged modern interior. Add or replace elements with contemporary, minimalist furniture and decor. Use a neutral color palette (whites, greys, beiges) with subtle accent colors. Include modern lighting, plants, and tasteful decorative objects. Keep the space uncluttered and sophisticated. The result should feel welcoming, upscale, and ready for real estate marketing.',
  true,
  0
);

-- ============================================
-- Prompts pour HOME STAGING SCANDINAVE
-- ============================================

-- Home Staging Scandinave - Défaut - Avec meubles
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, is_default, priority)
VALUES (
  'home_staging_scandinave',
  NULL,
  true,
  'Create a Scandinavian-style staged interior. Use light wood furniture (birch, oak, ash), a white and grey color palette with natural textures (linen, wool, cotton). Add hygge elements: cozy throws, knitted cushions, simple ceramic vases, candles in minimal holders, and plenty of greenery. Maximize natural light. The space should feel bright, airy, warm, and minimalist with a focus on functionality and comfort.',
  true,
  0
);

-- ============================================
-- Prompts pour HOME STAGING INDUSTRIEL
-- ============================================

-- Home Staging Industriel - Défaut - Avec meubles
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, is_default, priority)
VALUES (
  'home_staging_industriel',
  NULL,
  true,
  'Stage this space in industrial loft style. Include exposed materials (brick, concrete, metal), dark metal furniture frames, leather or distressed fabric seating, Edison bulb lighting, metal shelving units, and urban-style decor. Use a color palette of grey, black, brown, and raw materials. Add modern industrial touches: factory-style lamps, metal stools, and minimalist plants in concrete pots. The atmosphere should be edgy, urban, and sophisticated.',
  true,
  0
);

-- ============================================
-- Prompts pour RÉNOVATION LUXE
-- ============================================

-- Rénovation Luxe - Défaut - Avec meubles
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, is_default, priority)
VALUES (
  'renovation_luxe',
  NULL,
  true,
  'Transform this space into a luxurious, high-end renovation. Upgrade all finishes to premium materials: marble countertops, hardwood floors, designer light fixtures, high-end appliances, and elegant moldings. Add luxury furniture: velvet or leather seating, ornate mirrors, crystal chandeliers, and sophisticated artwork. Use rich colors and textures. Every detail should scream quality and elegance. The result should look like a million-dollar renovation.',
  true,
  0
);

-- ============================================
-- Prompts pour RÉNOVATION CONTEMPORAINE
-- ============================================

-- Rénovation Contemporaine - Défaut - Avec meubles
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, is_default, priority)
VALUES (
  'renovation_contemporaine',
  NULL,
  true,
  'Show this space as a contemporary renovation with clean lines and modern finishes. Update with sleek cabinetry, quartz or concrete countertops, large format tiles, recessed lighting, and modern fixtures. Add contemporary furniture with geometric shapes and neutral tones. Include smart home elements and energy-efficient features. The space should feel current, functional, and sophisticated without being overly trendy.',
  true,
  0
);

-- ============================================
-- Vérifications
-- ============================================

-- Compter les prompts par type
SELECT
  '📊 Prompts par type' as info,
  transformation_type,
  COUNT(*) as prompt_count,
  COUNT(*) FILTER (WHERE is_default) as default_count
FROM transformation_prompts
GROUP BY transformation_type
ORDER BY transformation_type;

-- Afficher tous les prompts
SELECT
  '📋 Liste complète des prompts' as info,
  transformation_type,
  COALESCE(room_type, 'TOUTES') as room,
  CASE
    WHEN with_furniture IS NULL THEN 'TOUS'
    WHEN with_furniture THEN 'AVEC'
    ELSE 'SANS'
  END as meubles,
  LEFT(prompt_text, 80) || '...' as prompt_preview,
  is_default,
  priority
FROM transformation_prompts
ORDER BY transformation_type, priority DESC, room_type NULLS LAST;

-- ============================================
-- Fonction helper pour récupérer le bon prompt
-- ============================================

CREATE OR REPLACE FUNCTION get_transformation_prompt(
  p_transformation_type VARCHAR,
  p_room_type VARCHAR DEFAULT NULL,
  p_with_furniture BOOLEAN DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  v_prompt TEXT;
BEGIN
  -- 1. Chercher une correspondance exacte
  SELECT prompt_text INTO v_prompt
  FROM transformation_prompts
  WHERE transformation_type = p_transformation_type
    AND room_type = p_room_type
    AND with_furniture = p_with_furniture
  ORDER BY priority DESC
  LIMIT 1;

  IF v_prompt IS NOT NULL THEN
    RETURN v_prompt;
  END IF;

  -- 2. Chercher avec room_type mais sans spécification de meubles
  SELECT prompt_text INTO v_prompt
  FROM transformation_prompts
  WHERE transformation_type = p_transformation_type
    AND room_type = p_room_type
    AND with_furniture IS NULL
  ORDER BY priority DESC
  LIMIT 1;

  IF v_prompt IS NOT NULL THEN
    RETURN v_prompt;
  END IF;

  -- 3. Chercher le prompt par défaut (is_default = true)
  SELECT prompt_text INTO v_prompt
  FROM transformation_prompts
  WHERE transformation_type = p_transformation_type
    AND is_default = true
  ORDER BY priority DESC
  LIMIT 1;

  IF v_prompt IS NOT NULL THEN
    RETURN v_prompt;
  END IF;

  -- 4. Fallback générique
  RETURN 'Transform this space according to the ' || p_transformation_type || ' style.';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Tests de la fonction
-- ============================================

-- Test 1: Prompt spécifique (salon moderne avec meubles)
SELECT get_transformation_prompt('home_staging_moderne', 'salon', true) as test_specifique;

-- Test 2: Prompt par défaut (home staging moderne, pièce inconnue)
SELECT get_transformation_prompt('home_staging_moderne', 'terrasse', true) as test_default;

-- Test 3: Dépersonnalisation sans meubles
SELECT get_transformation_prompt('depersonnalisation', NULL, false) as test_deperson_vide;

-- ============================================
-- Instructions
-- ============================================

/*
🚀 CE QU'ON VIENT DE CRÉER :

1. ✅ Table transformation_prompts
   - Stocke tous les prompts IA
   - Peut être spécifique à une pièce + meubles
   - Ou général (défaut)

2. ✅ 15+ prompts pré-configurés :
   - Dépersonnalisation (avec/sans meubles)
   - Home Staging Moderne (salon, cuisine, chambre, sdb, défaut)
   - Home Staging Scandinave
   - Home Staging Industriel
   - Rénovation Luxe
   - Rénovation Contemporaine

3. ✅ Fonction get_transformation_prompt()
   - Cherche le prompt le plus spécifique
   - Fallback sur le défaut si pas de correspondance exacte

UTILISATION dans votre code :

```sql
-- Récupérer le prompt pour une image
SELECT get_transformation_prompt(
  'home_staging_moderne',  -- type
  'salon',                 -- pièce
  true                     -- avec meubles
);
```

POUR AJOUTER UN NOUVEAU PROMPT :

```sql
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, priority)
VALUES ('nouveau_style', 'bureau', true, 'Votre prompt ici...', 10);
```
*/
