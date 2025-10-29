-- ============================================
-- Mise à jour des prompts pour PRÉSERVER l'architecture exacte
-- ============================================
-- Ces prompts insistent sur la préservation de TOUS les éléments architecturaux

-- IMPORTANT: Vider la table d'abord pour éviter les doublons
TRUNCATE TABLE transformation_prompts;

-- ============================================
-- DÉPERSONNALISATION
-- ============================================

-- Dépersonnalisation - AVEC meubles
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, is_default, priority)
VALUES (
  'depersonnalisation',
  NULL,
  true,
  'PRESERVE EXACTLY: wall positions, window positions, door positions, room dimensions, ceiling height, and spatial layout. You CAN change: wall colors, flooring, furniture styles. Keep furniture in similar positions. ONLY REMOVE: all personal items (photos, decorations, personal objects, clutter). NEUTRALIZE: colors to whites/greys/beiges. Make the space clean, neutral, and depersonalized while keeping the exact same room structure (walls, windows, doors must stay in exact positions).',
  true,
  10
);

-- Dépersonnalisation - SANS meubles
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, is_default, priority)
VALUES (
  'depersonnalisation',
  NULL,
  false,
  'PRESERVE EXACTLY: wall positions, window positions, door positions, room dimensions, ceiling height, and spatial layout. You CAN change: wall colors (neutral whites/greys), flooring finish. Remove ALL movable items (furniture, decorations, curtains, objects). Show an empty, clean space with ONLY: walls, floor, ceiling, windows, doors, and fixed built-in features. The room structure (walls, windows, doors positions) must remain identical.',
  true,
  10
);

-- ============================================
-- HOME STAGING MODERNE
-- ============================================

-- Salon - Avec meubles
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, priority)
VALUES (
  'home_staging_moderne',
  'salon',
  true,
  'PRESERVE EXACTLY: wall positions, window positions, door positions, room dimensions, ceiling height. You CAN change: wall colors, flooring (modern wood/tiles), furniture styles. TRANSFORM: Replace furniture with modern pieces in similar positions (contemporary sofa, sleek coffee table, modern side tables). Add staging: grey/beige cushions, abstract art, monstera plant, modern lighting. Neutral palette: white, grey, beige. Keep room structure (walls, windows, doors positions) identical.',
  10
);

-- Cuisine - Avec meubles
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, priority)
VALUES (
  'home_staging_moderne',
  'cuisine',
  true,
  'PRESERVE EXACTLY: wall positions, window positions, door positions, room dimensions. You CAN change: wall colors, flooring, cabinet finishes, countertop materials, furniture. TRANSFORM: Modernize kitchen with sleek cabinets, contemporary countertops, modern appliances, bar stools, pendant lights, staging (fruit bowl, herbs). Colors: white, grey, stainless steel. Keep room structure (walls, windows, doors positions) identical.',
  10
);

-- Chambre - Avec meubles
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, priority)
VALUES (
  'home_staging_moderne',
  'chambre',
  true,
  'PRESERVE EXACTLY: wall positions, window positions, door positions, room dimensions, ceiling height. You CAN change: wall colors, flooring, furniture styles. TRANSFORM: Modern bedroom with upholstered bed, hotel-quality white bedding, grey throw, modern nightstands, contemporary lamps, abstract art above bed, neutral rug. Palette: white, grey, beige, cream. Keep room structure (walls, windows, doors positions) identical.',
  10
);

-- Salle de bain - Avec meubles
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, priority)
VALUES (
  'home_staging_moderne',
  'salle_de_bain',
  true,
  'PRESERVE EXACTLY: wall positions, window positions, door positions, room dimensions. You CAN change: wall tiles, flooring, fixture finishes. TRANSFORM: Modern spa-like bathroom with white towels, contemporary fixtures, minimal soap dispenser, small plant (orchid), clean surfaces. Colors: white, chrome, natural. Keep room structure (walls, windows, doors positions) identical.',
  10
);

-- Défaut - Avec meubles
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, is_default, priority)
VALUES (
  'home_staging_moderne',
  NULL,
  true,
  'PRESERVE EXACTLY: wall positions, window positions, door positions, room dimensions, ceiling height. You CAN change: wall colors, flooring, furniture styles. TRANSFORM: Replace furniture with modern equivalents, use neutral staging (white, grey, beige), add modern decor (plants, abstract art, modern lighting). Keep room structure (walls, windows, doors positions) identical.',
  true,
  5
);

-- ============================================
-- HOME STAGING SCANDINAVE
-- ============================================

-- Salon - Avec meubles
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, priority)
VALUES (
  'home_staging_scandinave',
  'salon',
  true,
  'PRESERVE EXACTLY: wall positions, window positions, door positions, room dimensions, ceiling height. You CAN change: wall colors, flooring (light wood), furniture styles. TRANSFORM: Scandinavian living room with light wood furniture, Nordic design, hygge elements (knitted throws, natural textiles, candles, ceramics), lots of plants. Colors: white walls, light wood (birch/oak), grey, natural linen. Maximize natural light. Keep room structure (walls, windows, doors positions) identical.',
  10
);

-- Cuisine - Avec meubles
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, priority)
VALUES (
  'home_staging_scandinave',
  'cuisine',
  true,
  'PRESERVE EXACTLY: wall positions, window positions, door positions, room dimensions. You CAN change: wall colors, flooring, cabinet finishes, furniture. TRANSFORM: Scandinavian kitchen with light wood accents, white/natural ceramics, herbs in pots, minimal pendant lights, natural textiles. Colors: white, light wood, grey, natural. Keep room structure (walls, windows, doors positions) identical.',
  10
);

-- Défaut - Avec meubles
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, is_default, priority)
VALUES (
  'home_staging_scandinave',
  NULL,
  true,
  'PRESERVE EXACTLY: wall positions, window positions, door positions, room dimensions, ceiling height. You CAN change: wall colors, flooring (light wood), furniture styles. TRANSFORM: Scandinavian-style space with light wood, white, natural textiles, hygge elements (throws, plants, candles, simple decor). Colors: white, light wood, grey, natural. Maximize light. Keep room structure (walls, windows, doors positions) identical.',
  true,
  5
);

-- ============================================
-- RENOVATION LUXE
-- ============================================

-- Défaut - Toutes pièces
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, is_default, priority)
VALUES (
  'renovation_luxe',
  NULL,
  NULL,
  'PRESERVE EXACTLY: wall positions, window positions, door positions, room dimensions, ceiling height. You CAN change: flooring (herringbone wood, marble, luxury tiles), wall finishes (texture, designer paint), moldings, lighting fixtures, furniture, built-ins. TRANSFORM to luxury: high-end materials, premium finishes, elegant furniture, sophisticated lighting. Keep room structure (walls, windows, doors positions) identical.',
  true,
  10
);

-- ============================================
-- RENOVATION CONTEMPORAINE
-- ============================================

-- Défaut - Toutes pièces
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, is_default, priority)
VALUES (
  'renovation_contemporaine',
  NULL,
  NULL,
  'PRESERVE EXACTLY: wall positions, window positions, door positions, room dimensions, ceiling height. You CAN change: flooring (large format tiles, polished concrete, wide plank wood), wall finishes, lighting, fixtures, furniture. TRANSFORM to contemporary: sleek materials, clean lines, minimalist fixtures, integrated storage, modern furniture. Keep room structure (walls, windows, doors positions) identical.',
  true,
  10
);

-- ============================================
-- HOME STAGING INDUSTRIEL
-- ============================================

-- Défaut - Avec meubles
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, is_default, priority)
VALUES (
  'home_staging_industriel',
  NULL,
  true,
  'PRESERVE EXACTLY: wall positions, window positions, door positions, room dimensions, ceiling height. You CAN change: wall finishes (exposed brick/concrete texture), flooring, furniture styles. TRANSFORM: Industrial-style with metal frame furniture, reclaimed wood, leather, metal pendant lights, Edison bulbs, raw materials. Colors: grey, black, brown, metal tones. Keep room structure (walls, windows, doors positions) identical.',
  true,
  10
);

-- ============================================
-- HOME STAGING BOHÈME
-- ============================================

-- Défaut - Avec meubles
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, is_default, priority)
VALUES (
  'home_staging_boheme',
  NULL,
  true,
  'PRESERVE EXACTLY: wall positions, window positions, door positions, room dimensions, ceiling height. You CAN change: wall colors, flooring, furniture styles. TRANSFORM: Bohemian-style with rattan, wicker, eclectic textiles, macramé, lots of plants, patterned cushions, natural textiles, woven baskets, vintage accents. Colors: warm earth tones, terracotta, cream, green. Keep room structure (walls, windows, doors positions) identical.',
  true,
  10
);

-- ============================================
-- STYLE PERSONNALISÉ
-- ============================================

-- Défaut - Le prompt custom sera fourni par l'utilisateur
-- On garde un fallback au cas où
INSERT INTO transformation_prompts (transformation_type, room_type, with_furniture, prompt_text, is_default, priority)
VALUES (
  'style_personnalise',
  NULL,
  NULL,
  'PRESERVE EXACTLY: wall positions, window positions, door positions, room dimensions, ceiling height. You CAN change: wall colors, flooring, furniture styles, finishes. Apply the user''s custom style while keeping the room structure (walls, windows, doors positions) identical.',
  true,
  10
);
