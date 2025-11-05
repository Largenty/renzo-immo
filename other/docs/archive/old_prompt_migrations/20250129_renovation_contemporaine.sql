-- Rénovation Contemporaine - Prompts par type de pièce

DELETE FROM transformation_prompts
WHERE transformation_type = 'renovation_contemporaine';

-- SALON / LIVING ROOM
INSERT INTO transformation_prompts (
  transformation_type,
  room_type,
  furniture_mode,
  is_default,
  priority,
  prompt_text
) VALUES (
  'renovation_contemporaine',
  'salon',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Remove old furniture. Add contemporary furniture with bold design.

Contemporary living room: Sleek modular sofa (charcoal/navy/taupe), geometric coffee table (marble/glass with metal), statement floor lamp (arc/sculptural), bold abstract wall art (large format), floating TV unit, geometric area rug, designer pendant lights, mix of textures (velvet/leather/metal), 1-2 statement plants in modern planters.
Walls: Feature wall in bold color (charcoal/navy/emerald) OR textured finish, other walls white/light gray.
Floor: Large format porcelain tiles (gray/taupe/beige) OR wide plank dark wood.

Keep everything else identical to source photo.'
);

-- CHAMBRE / BEDROOM
INSERT INTO transformation_prompts (
  transformation_type,
  room_type,
  furniture_mode,
  is_default,
  priority,
  prompt_text
) VALUES (
  'renovation_contemporaine',
  'chambre',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Remove old furniture. Add contemporary furniture with bold design.

Contemporary bedroom: Platform bed with upholstered headboard (charcoal/navy/taupe), modern bedding (geometric patterns or solid bold colors), floating nightstands, sculptural table lamps, statement wall art, textured accent wall behind bed, modern pendant lights, geometric area rug.
Walls: Feature wall in bold color OR textured finish (wood slats/3D panels), other walls white/light gray.
Floor: Large format porcelain tiles (gray/taupe) OR wide plank dark wood.

Keep everything else identical to source photo.'
);

-- SALLE À MANGER / DINING ROOM
INSERT INTO transformation_prompts (
  transformation_type,
  room_type,
  furniture_mode,
  is_default,
  priority,
  prompt_text
) VALUES (
  'renovation_contemporaine',
  'salle_a_manger',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Remove old furniture. Add contemporary furniture with bold design.

Contemporary dining room: Modern dining table (dark wood/marble/glass), designer chairs (mix of materials - velvet/leather/molded plastic), statement chandelier (geometric/sculptural), floating sideboard, bold abstract wall art, geometric area rug, wine display unit.
Walls: Feature wall in bold color (charcoal/navy/emerald) OR textured finish, other walls white/light gray.
Floor: Large format porcelain tiles (gray/taupe/beige) OR wide plank dark wood.

Keep everything else identical to source photo.'
);

-- CUISINE / KITCHEN
INSERT INTO transformation_prompts (
  transformation_type,
  room_type,
  furniture_mode,
  is_default,
  priority,
  prompt_text
) VALUES (
  'renovation_contemporaine',
  'cuisine',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries, cabinet layout positions, window positions, door positions.

CRITICAL: Keep EXACT same kitchen layout - cabinets in SAME positions, appliances in SAME locations, countertop SAME shape.

ONLY CHANGE: Update cabinet doors, countertop material, backsplash, fixtures, hardware, lighting.

Contemporary kitchen upgrade: Two-tone handleless cabinet doors (white/dark gray), quartz countertops, bold backsplash, matte black fixtures, geometric pendant lights.
Walls: White with accent wall.
Floor: Large format gray tiles OR dark wood planks.

Keep everything else identical to source photo.'
);

-- SALLE DE BAIN / BATHROOM
INSERT INTO transformation_prompts (
  transformation_type,
  room_type,
  furniture_mode,
  is_default,
  priority,
  prompt_text
) VALUES (
  'renovation_contemporaine',
  'salle_de_bain',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries, bathtub position, shower position, toilet position, sink position, window position.

CRITICAL: Keep EXACT same bathroom layout - fixtures in SAME locations, bathtub SAME position and size, shower SAME position, vanity SAME position.

ONLY CHANGE: Update tiles, fixtures finish, vanity material, mirror, lighting.

Contemporary bathroom upgrade: Large format gray tiles, floating vanity (dark wood/white), matte black fixtures, LED backlit mirror, geometric accent tiles.
Walls: Large format tiles (gray/taupe).
Floor: Large format gray tiles OR wood-look tiles.

Keep everything else identical to source photo.'
);

-- BUREAU / OFFICE
INSERT INTO transformation_prompts (
  transformation_type,
  room_type,
  furniture_mode,
  is_default,
  priority,
  prompt_text
) VALUES (
  'renovation_contemporaine',
  'bureau',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Remove old furniture. Add contemporary furniture with bold design.

Contemporary office: Modern desk (glass/dark wood with metal frame), ergonomic designer chair, floating shelves with geometric design, statement desk lamp, bold wall art, textured accent wall (wood slats/3D panels), geometric area rug, minimal but bold accessories.
Walls: Feature wall in bold color (charcoal/navy) OR textured finish, other walls white/light gray.
Floor: Large format porcelain tiles (gray/taupe) OR wide plank dark wood.

Keep everything else identical to source photo.'
);

-- DEFAULT (pour pièces non spécifiées)
INSERT INTO transformation_prompts (
  transformation_type,
  room_type,
  furniture_mode,
  is_default,
  priority,
  prompt_text
) VALUES (
  'renovation_contemporaine',
  NULL,
  'with',
  TRUE,
  50,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Remove old furniture. Add contemporary furniture with bold design.

Contemporary style: Clean lines with bold accents, mix of materials (metal/glass/wood), statement lighting, geometric patterns, feature walls in bold colors, modern sculptural furniture.
Walls: Feature wall in bold color OR textured finish, other walls white/light gray.
Floor: Large format porcelain tiles (gray/taupe) OR wide plank dark wood.

Keep everything else identical to source photo.'
);
