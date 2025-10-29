-- ============================================
-- 🔄 RÉINITIALISATION COMPLÈTE DES PROMPTS
-- ============================================
-- Ce script repart de zéro avec une structure propre
-- ATTENTION : Cela supprime TOUTES les données de transformation_prompts

BEGIN;

-- ============================================
-- ÉTAPE 1 : Nettoyer complètement
-- ============================================

-- Supprimer la fonction si elle existe
DROP FUNCTION IF EXISTS get_transformation_prompt(VARCHAR, VARCHAR, BOOLEAN);
DROP FUNCTION IF EXISTS get_transformation_prompt(VARCHAR, VARCHAR, TEXT);

-- Supprimer les tables
DROP TABLE IF EXISTS transformation_prompts_backup CASCADE;
DROP TABLE IF EXISTS transformation_prompts CASCADE;

-- ============================================
-- ÉTAPE 2 : Créer la nouvelle table
-- ============================================

CREATE TABLE public.transformation_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Type de transformation
  transformation_type VARCHAR(100) NOT NULL,

  -- Filtres optionnels (NULL = s'applique à tous)
  room_type VARCHAR(100), -- NULL = tous les types de pièces
  furniture_mode TEXT CHECK (furniture_mode IN ('with', 'without', 'auto')) DEFAULT 'auto',

  -- Le prompt IA
  prompt_text TEXT NOT NULL,

  -- Métadonnées
  is_default BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Contrainte unique
  CONSTRAINT unique_prompt_combination UNIQUE (transformation_type, room_type, furniture_mode)
);

-- Index pour performance
CREATE INDEX idx_prompts_transformation ON transformation_prompts(transformation_type);
CREATE INDEX idx_prompts_room ON transformation_prompts(room_type);
CREATE INDEX idx_prompts_default ON transformation_prompts(is_default);
CREATE INDEX idx_prompts_furniture_mode ON transformation_prompts(furniture_mode);
CREATE INDEX idx_prompts_selection ON transformation_prompts(transformation_type, room_type, furniture_mode, priority DESC);

-- ============================================
-- ÉTAPE 3 : Insérer tous les prompts enrichis
-- ============================================

-- ============================================
-- 🧹 DÉPERSONNALISATION
-- ============================================

INSERT INTO transformation_prompts (transformation_type, room_type, furniture_mode, prompt_text, is_default, priority)
VALUES (
  'depersonnalisation',
  NULL,
  'with',
  'ARCHITECTURAL PRESERVATION CRITICAL: Keep EXACT positions, proportions and geometry of ALL walls (curved or straight), ALL window openings, ALL door openings, ALL ceiling shapes/slopes, ALL alcoves, niches, arches, moldings. Preserve identical room dimensions, wall thickness, and natural light direction. MATERIALS YOU MUST CHANGE: Transform wall colors (apply neutral white/soft grey/beige paint), replace flooring with neutral materials (light wood, beige tiles, or grey carpet), update ceiling finish if needed. FURNITURE ADAPTATION: Keep similar furniture layout and positions, but neutralize the style — if there is a sofa, replace with neutral modern sofa in similar position; if there is a coffee table, replace with minimal neutral one. REMOVE all personal items (photos, clutter, memorabilia, personal decorations). Result: Clean, depersonalized space with fresh neutral materials and neutralized furniture in familiar arrangement, ready for real-estate showcase, architecture 100% unchanged.',
  true,
  10
);

INSERT INTO transformation_prompts (transformation_type, room_type, furniture_mode, prompt_text, is_default, priority)
VALUES (
  'depersonnalisation',
  NULL,
  'without',
  'CRITICAL: COMPLETELY EMPTY ROOM REQUIRED. ARCHITECTURAL PRESERVATION: Keep EXACT positions and geometry of ALL walls (curved/straight), ALL window openings, ALL door openings, ALL ceiling shapes/slopes, alcoves, niches, trims, arches. Preserve identical room dimensions and natural light orientation. MATERIALS YOU MUST CHANGE: Apply fresh white or soft grey paint to ALL walls, install neutral flooring (light grey tiles, beige wood, or light carpet), refresh ceiling with white paint. MANDATORY FURNITURE REMOVAL: DELETE EVERYTHING MOVABLE — NO sofas, NO chairs, NO tables, NO beds, NO curtains, NO decorations, NO lamps, NO rugs, NO plants, NO objects of ANY kind. The room MUST be 100% EMPTY showing ONLY: bare painted walls, bare neutral floor, bare ceiling, windows, doors, and fixed built-in elements (radiators, electrical outlets if visible). THIS IS AN EMPTY ROOM WITH FRESH NEUTRAL MATERIALS.',
  true,
  11
);

-- ============================================
-- 🏡 HOME STAGING MODERNE
-- ============================================

INSERT INTO transformation_prompts (transformation_type, room_type, furniture_mode, prompt_text, priority)
VALUES (
  'home_staging_moderne',
  'salon',
  'with',
  'ARCHITECTURAL PRESERVATION: Keep EXACT geometry of ALL walls (including curves), ALL window/door positions and sizes, wall thickness, ceiling shapes, spatial proportions. Preserve identical natural light direction. MATERIALS TRANSFORMATION: Install modern flooring (wide-plank light wood, large-format grey tiles, or plush neutral carpet), paint walls in modern neutrals (white, soft grey, greige), update ceiling with smooth white finish, add modern baseboards/trims. FURNITURE STYLE TRANSFORMATION: Analyze existing furniture layout, then replace each piece with modern equivalent — if there is a sofa, replace with modern low-profile sofa in similar position; if coffee table, replace with sleek modern one; adapt existing layout to modern style. Add modern staging elements: textured neutral rug, abstract framed art, contemporary floor/pendant lighting, a few statement plants (monstera/ficus). Palette: white, beige, soft grey with light wood or stone accents. Architecture unchanged, materials refreshed, furniture adapted to modern style.',
  10
);

INSERT INTO transformation_prompts (transformation_type, room_type, furniture_mode, prompt_text, priority)
VALUES (
  'home_staging_moderne',
  'cuisine',
  'with',
  'ARCHITECTURAL PRESERVATION: Keep EXACT positions of ALL walls (curved or straight), ALL windows, ALL doors, built-in volumes, and fixed cabinet structures. Maintain identical geometry and proportions. MATERIALS TRANSFORMATION: Install modern flooring (large-format porcelain tiles in light grey/white, or engineered wood), apply fresh paint or tile backsplash to walls, install stone/quartz countertops, replace cabinet fronts with flat-panel matte finish (white/grey/sand), modern ceiling. FURNITURE & APPLIANCES STYLE TRANSFORMATION: Replace existing appliances with modern stainless steel ones, update furniture to modern style (minimal bar stools if existing seating, subtle pendant/task lighting), add small modern staging decor (herbs in pots, fruit bowl, minimal accessories). Respect original circulation and functional zones. Materials modernized, furniture/appliances updated to modern style, architecture preserved.',
  10
);

INSERT INTO transformation_prompts (transformation_type, room_type, furniture_mode, prompt_text, priority)
VALUES (
  'home_staging_moderne',
  'chambre',
  'with',
  'ARCHITECTURAL PRESERVATION: Keep EXACT positions of ALL walls (curved/straight), ALL window openings, ALL door openings, ceiling slopes/shapes, wall openings. Preserve identical proportions and natural light. MATERIALS TRANSFORMATION: Install modern flooring (light wood planks, neutral carpet), paint walls in calming neutrals (soft white, warm grey, greige), smooth white ceiling finish. FURNITURE STYLE TRANSFORMATION: Adapt existing bedroom layout to modern style — replace bed with modern upholstered headboard version, hotel-quality white bedding, grey throw; replace nightstands with sleek modern ones, update lamps to contemporary style, add abstract art above bed, neutral area rug. Add subtle indirect LED lighting. Architecture unchanged, materials updated, furniture transformed to modern bedroom staging.',
  10
);

INSERT INTO transformation_prompts (transformation_type, room_type, furniture_mode, prompt_text, priority)
VALUES (
  'home_staging_moderne',
  'salle_de_bain',
  'with',
  'ARCHITECTURAL PRESERVATION: Keep EXACT wall geometry (including curves), ALL window openings, built-in shower/tub recesses. Maintain identical layout and proportions. MATERIALS TRANSFORMATION: Install luxury wall tiles (light marble, terrazzo, or large-format porcelain), modern flooring (heated tiles), update fixtures to chrome/matte black modern style, modernize vanity to minimalist floating style, modern mirror. ACCESSORIES STYLE TRANSFORMATION: Replace existing accessories with modern spa-like staging — white fluffy towels, small orchid or plant, bright but soft LED lighting, subtle modern decorative elements. Palette: white, sand, light grey, chrome/black accents. Structure unchanged, materials spa-like modern, fixtures and accessories updated to modern style.',
  10
);

INSERT INTO transformation_prompts (transformation_type, room_type, furniture_mode, prompt_text, is_default, priority)
VALUES (
  'home_staging_moderne',
  NULL,
  'with',
  'ARCHITECTURAL PRESERVATION: Keep ALL wall curves, ALL openings (windows/doors), ALL moldings, ALL proportions EXACTLY as they are. Preserve natural light direction and room layout. MATERIALS TRANSFORMATION: Update flooring (light wood, neutral tiles, or carpet), paint walls in modern neutrals (white/grey/beige), refresh ceiling with smooth white finish, add modern trims/baseboards. FURNITURE STYLE TRANSFORMATION: Analyze existing furniture arrangement, then transform each piece to modern aesthetic — replace seating with clean-lined modern pieces, update tables to neutral palette with light wood or stone, add modern staging elements (abstract art, tasteful plants, refined contemporary lighting like floor lamps or pendants). Maintain functional room layout while updating style completely. Architecture stays 100% identical, materials modernized, furniture transformed to modern style.',
  true,
  8
);

INSERT INTO transformation_prompts (transformation_type, room_type, furniture_mode, prompt_text, is_default, priority)
VALUES (
  'home_staging_moderne',
  NULL,
  'without',
  'CRITICAL: COMPLETELY EMPTY ROOM REQUIRED. ARCHITECTURAL PRESERVATION: Keep complete architectural geometry EXACTLY — curved walls, straight walls, ceiling shapes, ALL window openings, ALL door openings. Maintain identical proportions. MATERIALS TRANSFORMATION: Install modern flooring (wide-plank wood in light oak/walnut, OR large-format tiles in grey/white), paint walls in clean modern colors (crisp white, soft grey, or greige), smooth white ceiling, modern minimal baseboards, recessed LED lighting if appropriate. MANDATORY FURNITURE REMOVAL: REMOVE ALL MOVABLE ITEMS — NO furniture, NO sofas, NO tables, NO chairs, NO beds, NO curtains, NO rugs, NO plants, NO decorations, NO lamps, NO objects. Show ONLY the bare architectural shell with fresh modern materials applied to surfaces. THIS IS AN EMPTY ROOM WITH MODERN FINISHES ONLY.',
  true,
  9
);

-- ============================================
-- ❄️ HOME STAGING SCANDINAVE
-- ============================================

INSERT INTO transformation_prompts (transformation_type, room_type, furniture_mode, prompt_text, is_default, priority)
VALUES (
  'home_staging_scandinave',
  NULL,
  'with',
  'ARCHITECTURAL PRESERVATION: Keep every curve, wall thickness, alcove, window/door opening EXACTLY as is; preserve proportions and light direction 100%. MATERIALS TRANSFORMATION: Install light wood flooring (birch, light oak, ash), paint walls pure white or very light grey, white ceiling finish, simple white painted trims/baseboards. FURNITURE STYLE TRANSFORMATION: Adapt existing furniture layout to Scandinavian aesthetic — replace seating with light wood pieces (birch/oak), add soft textiles (linen curtains, wool throws), incorporate cozy hygge accents (candles in holders, simple ceramics), add green plants in simple pots, update to minimal rounded furniture pieces, warm ambient lighting (simple pendants, floor lamps). Maintain functional layout while transforming to Scandinavian style. Palette: white walls, light wood floors, beige/soft grey textiles. Architecture 100% preserved, materials Scandinavian, furniture transformed to hygge style.',
  true,
  10
);

INSERT INTO transformation_prompts (transformation_type, room_type, furniture_mode, prompt_text, is_default, priority)
VALUES (
  'home_staging_scandinave',
  NULL,
  'without',
  'CRITICAL: COMPLETELY EMPTY ROOM REQUIRED. ARCHITECTURAL PRESERVATION: Keep ALL curved/straight walls, alcoves, arches, window/door geometry, ceiling shapes EXACTLY identical. Preserve proportions and light. MATERIALS TRANSFORMATION: Install light wood flooring (birch, light oak, ash planks), paint ALL walls pure white or very light grey, white ceiling, simple white painted trims/baseboards, soft ambient lighting fixtures (simple white pendants or recessed lights). MANDATORY FURNITURE REMOVAL: DELETE ALL MOVABLE ITEMS — NO furniture, NO sofas, NO chairs, NO tables, NO curtains, NO rugs, NO plants, NO decorative objects, NO textiles. Display ONLY the bare architectural structure with Scandinavian materials applied: white walls, light wood floor, white trims. THIS IS AN EMPTY ROOM WITH SCANDINAVIAN MATERIALS ONLY.',
  true,
  9
);

-- ============================================
-- 🏙️ RÉNOVATION LUXE
-- ============================================

INSERT INTO transformation_prompts (transformation_type, room_type, furniture_mode, prompt_text, is_default, priority)
VALUES (
  'renovation_luxe',
  NULL,
  'with',
  'ARCHITECTURAL PRESERVATION: Keep ALL walls (including curves), ALL moldings, niches, ceiling heights, window/door placements EXACTLY as they are. Preserve geometry and proportions 100%. MATERIALS TRANSFORMATION: Install luxury flooring (herringbone parquet in dark oak/walnut, OR marble/stone tiles), apply refined wall finishes (subtle textured wallpaper, fabric panels, or premium paint in rich tones), add/enhance crown moldings, elegant baseboards, coffered ceiling if appropriate. FURNITURE STYLE TRANSFORMATION: Transform existing furniture arrangement to luxury aesthetic — replace seating with tufted velvet pieces, upgrade tables to marble/high-end wood, add brass/gold accents, incorporate silk or velvet drapes, premium area rug (Persian/modern geometric), designer lighting (crystal chandelier, elegant sconces), refined accessories (vases, books, art). Maintain functional layout while elevating to luxury style. Palette: cream, gold, navy/emerald, rich woods. Architecture identical, materials elevated to luxury, furniture transformed to high-end staging.',
  true,
  10
);

INSERT INTO transformation_prompts (transformation_type, room_type, furniture_mode, prompt_text, is_default, priority)
VALUES (
  'renovation_luxe',
  NULL,
  'without',
  'CRITICAL: COMPLETELY EMPTY ROOM REQUIRED. ARCHITECTURAL PRESERVATION: Keep ALL architectural elements EXACTLY — curved walls, straight walls, moldings, window/door openings, ceiling shapes. MATERIALS TRANSFORMATION: Install luxury flooring (herringbone parquet in rich walnut/oak, OR premium marble/stone), apply refined wall treatments (elegant wallpaper, fabric panels, or premium paint in sophisticated colors), add crown moldings and elegant baseboards, sophisticated ceiling treatment (coffered/tray ceiling or smooth premium paint), luxury lighting fixtures (elegant chandelier, wall sconces). MANDATORY FURNITURE REMOVAL: REMOVE ALL FURNITURE AND OBJECTS — NO sofas, NO tables, NO chairs, NO rugs, NO curtains, NO decorations, NO movable items. Display ONLY luxury finishes on the bare architectural shell. THIS IS AN EMPTY LUXURY-FINISHED ROOM.',
  true,
  9
);

-- ============================================
-- 🏗️ RÉNOVATION CONTEMPORAINE
-- ============================================

INSERT INTO transformation_prompts (transformation_type, room_type, furniture_mode, prompt_text, is_default, priority)
VALUES (
  'renovation_contemporaine',
  NULL,
  'with',
  'ARCHITECTURAL PRESERVATION: Keep EXACT wall positions, curves, ALL window/door openings, ceiling geometry. Preserve all proportions. MATERIALS TRANSFORMATION: Install contemporary flooring (large-format tiles 60x60cm or larger in grey/white/black, OR polished concrete, OR wide-plank engineered wood), paint walls in contemporary colors (white, light grey, charcoal, or accent wall in bold color), smooth ceiling with recessed/track lighting, minimalist trims/baseboards, integrated storage panels if space allows. FURNITURE STYLE TRANSFORMATION: Transform existing furniture to contemporary aesthetic — replace seating with sleek low-profile pieces, update tables to glass/metal/concrete designs, add minimal side tables, incorporate contemporary art pieces, simple plants, industrial/modern light fixtures. Maintain functional arrangement while updating to bold contemporary style. Palette: white, grey, black, natural wood accents. Architecture preserved, materials bold contemporary, furniture transformed to contemporary style.',
  true,
  10
);

INSERT INTO transformation_prompts (transformation_type, room_type, furniture_mode, prompt_text, is_default, priority)
VALUES (
  'renovation_contemporaine',
  NULL,
  'without',
  'CRITICAL: COMPLETELY EMPTY ROOM REQUIRED. ARCHITECTURAL PRESERVATION: Keep ALL architectural geometry EXACTLY — walls, windows, doors, ceiling. MATERIALS TRANSFORMATION: Install contemporary flooring (large format tiles 60x60cm+ in grey/white/black, OR polished concrete finish, OR engineered wood planks), paint walls in contemporary colors (clean white, light grey, charcoal accent), smooth ceiling with recessed LED lighting strips/spots, minimalist baseboards and trims. MANDATORY FURNITURE REMOVAL: REMOVE EVERYTHING MOVABLE — NO furniture, NO sofas, NO tables, NO chairs, NO curtains, NO decorations, NO rugs, NO plants, NO objects. Show ONLY contemporary materials on bare architectural structure. THIS IS AN EMPTY CONTEMPORARY-FINISHED ROOM.',
  true,
  9
);

-- ============================================
-- 🏭 HOME STAGING INDUSTRIEL
-- ============================================

INSERT INTO transformation_prompts (transformation_type, room_type, furniture_mode, prompt_text, is_default, priority)
VALUES (
  'home_staging_industriel',
  NULL,
  'with',
  'ARCHITECTURAL PRESERVATION: Keep EXACT wall positions, ALL openings (windows/doors), geometry. MATERIALS TRANSFORMATION: Transform walls to industrial aesthetic (exposed brick texture, raw concrete finish, or painted brick in grey/charcoal), install industrial flooring (dark stained wood planks, polished concrete, or large dark tiles), expose ceiling elements (beams, ductwork) or paint ceiling dark grey/black, add metal trims. FURNITURE STYLE TRANSFORMATION: Transform existing furniture to industrial loft aesthetic — replace seating with metal-frame pieces with leather cushions, update tables to reclaimed wood designs, add metal side tables/accents, incorporate vintage metal pendant lights with Edison bulbs, minimal raw materials decor (metal signs, industrial clock). Maintain functional layout while transforming to edgy industrial style. Palette: grey, black, brown, rust, exposed brick red, metal tones. Architecture unchanged, materials industrial raw, furniture transformed to urban loft style.',
  true,
  10
);

INSERT INTO transformation_prompts (transformation_type, room_type, furniture_mode, prompt_text, is_default, priority)
VALUES (
  'home_staging_industriel',
  NULL,
  'without',
  'CRITICAL: COMPLETELY EMPTY ROOM REQUIRED. ARCHITECTURAL PRESERVATION: Keep ALL architectural elements EXACTLY as they are. MATERIALS TRANSFORMATION: Transform walls to industrial finishes (exposed brick texture, raw concrete, or painted brick in grey), install industrial flooring (dark stained wood, polished concrete, or dark tiles), expose ceiling elements (visible beams, ductwork, painted dark grey/black), add metal industrial lighting fixtures (bare Edison bulbs, metal pendants). MANDATORY FURNITURE REMOVAL: DELETE ALL FURNITURE AND OBJECTS — NO sofas, NO tables, NO chairs, NO rugs, NO decorations, NO movable items. Display ONLY industrial materials and finishes on the bare architectural structure. THIS IS AN EMPTY INDUSTRIAL-FINISHED ROOM.',
  true,
  9
);

-- ============================================
-- 🌿 HOME STAGING BOHÈME
-- ============================================

INSERT INTO transformation_prompts (transformation_type, room_type, furniture_mode, prompt_text, is_default, priority)
VALUES (
  'home_staging_boheme',
  NULL,
  'with',
  'ARCHITECTURAL PRESERVATION: Keep EXACT wall positions, curves, ALL openings, geometry. MATERIALS TRANSFORMATION: Paint walls in warm bohemian colors (terracotta, warm cream, ochre, or soft peach), install natural wood flooring (medium to dark wood planks or cork), warm white ceiling, natural wood trims. FURNITURE STYLE TRANSFORMATION: Transform existing furniture to bohemian aesthetic — replace seating with rattan/wicker pieces, update tables to low wooden designs, layer eclectic textiles (patterned cushions with ethnic prints, woven throws, layered rugs), add macramé wall hangings, incorporate lots of plants in various sizes (hanging, floor, tabletop), woven baskets, vintage/ethnic accents (poufs, lanterns), warm ambient lighting (rattan pendants, string lights). Maintain functional layout while creating eclectic bohemian atmosphere. Palette: earth tones, terracotta, cream, mustard, green plants, natural textures. Architecture preserved, materials warm bohemian, furniture transformed to boho style.',
  true,
  10
);

INSERT INTO transformation_prompts (transformation_type, room_type, furniture_mode, prompt_text, is_default, priority)
VALUES (
  'home_staging_boheme',
  NULL,
  'without',
  'CRITICAL: COMPLETELY EMPTY ROOM REQUIRED. ARCHITECTURAL PRESERVATION: Keep ALL architectural geometry EXACTLY. MATERIALS TRANSFORMATION: Paint ALL walls in warm bohemian colors (terracotta, warm cream, ochre, or soft peach), install natural wood flooring (medium/dark wood planks or cork tiles), warm white ceiling, natural wood baseboards/trims, warm ambient lighting fixtures (simple rattan pendant or warm LED). MANDATORY FURNITURE REMOVAL: REMOVE ALL MOVABLE ITEMS — NO furniture, NO rattan pieces, NO chairs, NO tables, NO rugs, NO textiles, NO plants, NO decorations, NO baskets, NO macramé, NO objects. Show ONLY bohemian finishes and colors applied to bare walls, floor, ceiling. THIS IS AN EMPTY ROOM WITH BOHEMIAN FINISHES ONLY.',
  true,
  9
);

-- ============================================
-- 🎨 STYLE PERSONNALISÉ
-- ============================================

INSERT INTO transformation_prompts (transformation_type, room_type, furniture_mode, prompt_text, is_default, priority)
VALUES (
  'style_personnalise',
  NULL,
  'auto',
  'ARCHITECTURAL PRESERVATION CRITICAL: Keep EXACT positions of ALL walls, ALL window openings, ALL door openings, room dimensions, ceiling height, and ALL architectural geometry 100% identical. MATERIALS YOU CAN TRANSFORM: Change wall colors/finishes (paint, wallpaper, tiles), replace flooring (wood, tiles, carpet, stone), update ceiling finish, modify trims/baseboards, change lighting fixtures. FURNITURE: Apply the user''s custom style requirements for furniture and decor. If user requests empty/unfurnished/sans meubles space, COMPLETELY REMOVE all furniture, rugs, curtains, and movable objects while applying the requested material finishes to walls/floor/ceiling only. Architecture MUST remain absolutely identical, only surface materials and furniture/decor change.',
  true,
  10
);

-- ============================================
-- ÉTAPE 4 : Créer la fonction helper
-- ============================================

CREATE OR REPLACE FUNCTION get_transformation_prompt(
  p_transformation_type VARCHAR,
  p_room_type VARCHAR DEFAULT NULL,
  p_furniture_mode TEXT DEFAULT 'auto'
)
RETURNS TEXT AS $$
DECLARE
  v_prompt TEXT;
BEGIN
  -- 1. Chercher une correspondance exacte
  SELECT prompt_text INTO v_prompt
  FROM transformation_prompts
  WHERE transformation_type = p_transformation_type
    AND (room_type = p_room_type OR (room_type IS NULL AND p_room_type IS NULL))
    AND furniture_mode = p_furniture_mode
  ORDER BY priority DESC
  LIMIT 1;

  IF v_prompt IS NOT NULL THEN
    RETURN v_prompt;
  END IF;

  -- 2. Chercher avec room_type mais mode auto
  SELECT prompt_text INTO v_prompt
  FROM transformation_prompts
  WHERE transformation_type = p_transformation_type
    AND (room_type = p_room_type OR (room_type IS NULL AND p_room_type IS NULL))
    AND furniture_mode = 'auto'
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
  RETURN 'Transform this space according to the ' || p_transformation_type || ' style while preserving all architectural elements.';
END;
$$ LANGUAGE plpgsql;

COMMIT;

-- ============================================
-- ÉTAPE 5 : Vérifications finales
-- ============================================

SELECT '✅ RÉINITIALISATION TERMINÉE !' as status;

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
  furniture_mode as meubles,
  LEFT(prompt_text, 80) || '...' as prompt_preview,
  is_default,
  priority
FROM transformation_prompts
ORDER BY transformation_type, priority DESC, room_type NULLS LAST;

-- Test de la fonction
SELECT '🧪 Test de la fonction get_transformation_prompt()' as test;
SELECT get_transformation_prompt('home_staging_moderne', 'salon', 'with') as test_specifique;
SELECT get_transformation_prompt('depersonnalisation', NULL, 'without') as test_vide;

-- ============================================
-- 📝 INSTRUCTIONS D'UTILISATION
-- ============================================

/*
✅ RÉINITIALISATION COMPLÈTE EFFECTUÉE !

Ce qui a été fait :
1. ✅ Suppression complète de l'ancienne structure
2. ✅ Création de la nouvelle table avec furniture_mode (TEXT)
3. ✅ Insertion de tous les prompts enrichis avec transformation de matériaux
4. ✅ Création de la fonction get_transformation_prompt()
5. ✅ Création de tous les index pour performance

Structure de la table :
- transformation_type : 'depersonnalisation', 'home_staging_moderne', etc.
- room_type : 'salon', 'cuisine', 'chambre', 'salle_de_bain' ou NULL (toutes)
- furniture_mode : 'with' (avec meubles), 'without' (sans meubles), 'auto'
- prompt_text : Le prompt IA enrichi avec préservation architecture + transformation matériaux

Utilisation dans votre code :

```sql
-- Récupérer le prompt
SELECT get_transformation_prompt(
  'home_staging_moderne',  -- type de transformation
  'salon',                 -- type de pièce (ou NULL pour toutes)
  'with'                   -- 'with' | 'without' | 'auto'
);
```

Modes furniture_mode :
- 'with'    : Transformation complète avec meubles et décoration
- 'without' : Pièce 100% vide avec seulement les matériaux appliqués
- 'auto'    : Mode automatique (défaut)

Tous les prompts incluent :
✅ ARCHITECTURAL PRESERVATION : Préservation exacte de la géométrie
✅ MATERIALS TRANSFORMATION : Modification des sols, murs, plafonds
✅ Mode "without" ultra-strict : Pièce complètement vide

Total de prompts créés : 18
- Dépersonnalisation : 2 (with/without)
- Home Staging Moderne : 6 (salon, cuisine, chambre, sdb + défaut with/without)
- Home Staging Scandinave : 2 (with/without)
- Rénovation Luxe : 2 (with/without)
- Rénovation Contemporaine : 2 (with/without)
- Home Staging Industriel : 2 (with/without)
- Home Staging Bohème : 2 (with/without)
- Style Personnalisé : 1 (auto)
*/
