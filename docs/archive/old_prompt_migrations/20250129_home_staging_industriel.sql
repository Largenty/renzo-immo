-- Home Staging Industriel - Prompts par type de pièce

DELETE FROM transformation_prompts
WHERE transformation_type = 'home_staging_industriel';

-- SALON / LIVING ROOM
INSERT INTO transformation_prompts (
  transformation_type,
  room_type,
  furniture_mode,
  is_default,
  priority,
  prompt_text
) VALUES (
  'home_staging_industriel',
  'salon',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Remove old furniture. Add industrial loft style furniture.

Industrial living room: Dark leather or charcoal fabric sofa, reclaimed wood coffee table with metal frame, metal floor lamp (black/bronze), exposed brick accent wall OR concrete-look wall, metal shelving unit, vintage-style Edison bulb pendant lights, dark metal-framed wall art, industrial clock, minimal plants in metal planters.
Walls: Exposed brick OR concrete gray OR dark charcoal.
Floor: Dark stained wood planks OR polished concrete look.

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
  'home_staging_industriel',
  'chambre',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Remove old furniture. Add industrial loft style furniture.

Industrial bedroom: Metal bed frame (black iron), dark gray/charcoal bedding, reclaimed wood nightstands, industrial metal lamps with Edison bulbs, exposed brick accent wall OR concrete gray wall, metal wall hooks, vintage-style decor.
Walls: Exposed brick OR concrete gray OR dark charcoal.
Floor: Dark stained wood planks OR polished concrete look.

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
  'home_staging_industriel',
  'salle_a_manger',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Remove old furniture. Add industrial loft style furniture.

Industrial dining room: Solid wood dining table with metal legs (reclaimed wood look), metal chairs with wooden seats OR leather seats, industrial cage pendant lights OR Edison bulb chandeliers, metal wine rack, exposed brick or concrete wall, metal shelving.
Walls: Exposed brick OR concrete gray OR dark charcoal.
Floor: Dark stained wood planks OR polished concrete look.

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
  'home_staging_industriel',
  'cuisine',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries, cabinet layout positions, window positions, door positions.

CRITICAL: Keep EXACT same kitchen layout - cabinets in SAME positions, appliances in SAME locations, countertop SAME shape.

ONLY CHANGE: Update cabinet doors, countertop material, backsplash, fixtures, hardware, lighting.

Industrial kitchen upgrade: Dark wood or black matte cabinet doors, concrete-look countertops, subway tiles with dark grout OR exposed brick, black metal faucet, Edison bulb lights, metal shelving.
Walls: Exposed brick OR concrete gray.
Floor: Dark stained wood planks OR concrete-look tiles.

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
  'home_staging_industriel',
  'salle_de_bain',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries, bathtub position, shower position, toilet position, sink position, window position.

CRITICAL: Keep EXACT same bathroom layout - fixtures in SAME locations, bathtub SAME position and size, shower SAME position, vanity SAME position.

ONLY CHANGE: Update tiles, fixtures finish, vanity material, mirror, lighting.

Industrial bathroom upgrade: Black metal fixtures, reclaimed wood vanity, subway tiles with dark grout, metal-framed mirror, Edison bulb lighting.
Walls: Concrete gray OR subway tiles with dark grout.
Floor: Dark concrete-look tiles OR black hexagonal tiles.

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
  'home_staging_industriel',
  'bureau',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Remove old furniture. Add industrial loft style furniture.

Industrial office: Reclaimed wood desk with metal pipe legs, black metal office chair OR vintage leather chair, industrial metal shelving, exposed brick wall OR concrete wall, metal desk lamp with Edison bulb, vintage clock, metal storage boxes.
Walls: Exposed brick OR concrete gray OR dark charcoal.
Floor: Dark stained wood planks OR polished concrete look.

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
  'home_staging_industriel',
  NULL,
  'with',
  TRUE,
  50,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Remove old furniture. Add industrial loft style furniture.

Industrial loft style: Reclaimed wood and black metal furniture, exposed brick or concrete walls, Edison bulb lighting, dark colors, raw materials, vintage industrial decor.
Walls: Exposed brick OR concrete gray OR dark charcoal.
Floor: Dark stained wood planks OR polished concrete look.

Keep everything else identical to source photo.'
);
