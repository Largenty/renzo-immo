-- Home Staging Scandinave - Prompts par type de pièce

DELETE FROM transformation_prompts
WHERE transformation_type = 'home_staging_scandinave';

-- SALON / LIVING ROOM
INSERT INTO transformation_prompts (
  transformation_type,
  room_type,
  furniture_mode,
  is_default,
  priority,
  prompt_text
) VALUES (
  'home_staging_scandinave',
  'salon',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Remove old furniture. Add Scandinavian style furniture.

Scandinavian living room: Light gray fabric sofa with wooden legs, light wood coffee table (birch/oak), cozy textured throw blanket (cream/gray), soft cushions, white ceramic vase, small indoor plants (monstera/fiddle leaf fig), woven baskets, simple pendant lamp, minimal black-framed wall art.
Walls: Soft white or very light gray.
Floor: Light natural wood planks (blonde oak/birch).

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
  'home_staging_scandinave',
  'chambre',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Remove old furniture. Add Scandinavian style furniture.

Scandinavian bedroom: Low wooden bed frame (light oak/birch), white/cream linen bedding, soft gray throw blanket, light wood nightstands, simple ceramic table lamps with fabric shades, woven rug beside bed, minimal wall art, small plant.
Walls: Soft white or very light gray.
Floor: Light natural wood planks (blonde oak/birch).

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
  'home_staging_scandinave',
  'salle_a_manger',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Remove old furniture. Add Scandinavian style furniture.

Scandinavian dining room: Light wood dining table (oak/birch), wooden chairs with white/gray cushions OR white molded chairs, simple pendant light (white/natural materials), small centerpiece (candles/vase), open shelving with minimal ceramics.
Walls: Soft white or very light gray.
Floor: Light natural wood planks (blonde oak/birch).

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
  'home_staging_scandinave',
  'cuisine',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries, cabinet layout positions, window positions, door positions.

CRITICAL: Keep EXACT same kitchen layout - cabinets in SAME positions, appliances in SAME locations, countertop SAME shape.

ONLY CHANGE: Update cabinet doors, countertop, backsplash, hardware, accessories.

Scandinavian kitchen upgrade: White or light wood cabinet doors with simple handles, white countertops, white subway tile backsplash, wooden shelving, simple pendant lights.
Walls: Soft white.
Floor: Light natural wood planks (blonde oak/birch).

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
  'home_staging_scandinave',
  'salle_de_bain',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries, bathtub position, shower position, toilet position, sink position, window position.

CRITICAL: Keep EXACT same bathroom layout - fixtures in SAME locations, bathtub SAME position and size, shower SAME position, vanity SAME position.

ONLY CHANGE: Update tiles, fixtures, vanity material, mirror, accessories.

Scandinavian bathroom upgrade: White subway tiles, light wood vanity, simple round mirror, white fixtures, woven baskets.
Walls: White subway tiles or soft white paint.
Floor: Light wood-look tiles OR white hexagonal tiles.

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
  'home_staging_scandinave',
  'bureau',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Remove old furniture. Add Scandinavian style furniture.

Scandinavian office: Light wood desk (birch/oak), simple white/wooden chair, open shelving with books and minimal decor, desk lamp with wooden base, small plant, woven storage baskets.
Walls: Soft white or very light gray.
Floor: Light natural wood planks (blonde oak/birch).

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
  'home_staging_scandinave',
  NULL,
  'with',
  TRUE,
  50,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Remove old furniture. Add Scandinavian style furniture.

Scandinavian style: Light wood furniture (birch/oak), soft neutral colors (white/gray/beige), natural materials, cozy textiles, minimal decor, plants.
Walls: Soft white or very light gray.
Floor: Light natural wood planks (blonde oak/birch).

Keep everything else identical to source photo.'
);
