-- Home Staging Moderne - Prompts par type de pièce

DELETE FROM transformation_prompts
WHERE transformation_type = 'home_staging_moderne';

-- SALON / LIVING ROOM
INSERT INTO transformation_prompts (
  transformation_type,
  room_type,
  furniture_mode,
  is_default,
  priority,
  prompt_text
) VALUES (
  'home_staging_moderne',
  'salon',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Remove old furniture. Add modern minimal furniture.

Living room furniture: White 3-seater sofa, light wood coffee table, black metal floor lamp, white/black wall art, 1-2 plants.
Walls: Pure white.
Floor: Light oak wood planks OR light gray large tiles (60x60cm).

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
  'home_staging_moderne',
  'chambre',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Remove old furniture. Add modern minimal furniture.

Bedroom furniture: Low platform bed with white bedding, white/light wood nightstands, simple white table lamps.
Walls: Pure white.
Floor: Light oak wood planks OR light gray large tiles (60x60cm).

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
  'home_staging_moderne',
  'salle_a_manger',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Remove old furniture. Add modern minimal furniture.

Dining room furniture: Light wood dining table, white/light wood chairs, black metal pendant light.
Walls: Pure white.
Floor: Light oak wood planks OR light gray large tiles (60x60cm).

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
  'home_staging_moderne',
  'cuisine',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries, cabinet layout positions, window positions, door positions.

CRITICAL: Keep EXACT same kitchen layout - cabinets in SAME positions (upper/lower/corner), appliances in SAME locations, countertop SAME shape.

ONLY CHANGE: Update cabinet doors, countertop material, backsplash, appliances finish, hardware, lighting.

Ultra-modern kitchen upgrade: White handleless cabinet doors with LED lighting, white quartz countertops, white or black backsplash, black metal faucet, designer pendant lights, modern appliance finishes.
Walls: Pure white.
Floor: Large format light gray tiles (80x80cm) OR light oak planks.

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
  'home_staging_moderne',
  'salle_de_bain',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Modernize bathroom while keeping layout.

Modern bathroom: White fixtures, light wood or white vanity, minimal accessories, clean and bright.
Walls: Pure white or light gray tiles.
Floor: Light gray large tiles (60x60cm) OR white marble-look tiles.

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
  'home_staging_moderne',
  'bureau',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Remove old furniture. Add modern minimal furniture.

Office furniture: Light wood desk, white ergonomic chair, simple shelving, minimal decor.
Walls: Pure white.
Floor: Light oak wood planks OR light gray large tiles (60x60cm).

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
  'home_staging_moderne',
  NULL,
  'with',
  TRUE,
  50,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Remove old furniture. Add modern minimal furniture.

Modern furniture: White and light wood pieces, minimal decor, clean lines.
Walls: Pure white.
Floor: Light oak wood planks OR light gray large tiles (60x60cm).

Keep everything else identical to source photo.'
);
