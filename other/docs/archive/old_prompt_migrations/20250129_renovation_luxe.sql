-- Rénovation Luxe - Prompts par type de pièce

DELETE FROM transformation_prompts
WHERE transformation_type = 'renovation_luxe';

-- SALON / LIVING ROOM
INSERT INTO transformation_prompts (
  transformation_type,
  room_type,
  furniture_mode,
  is_default,
  priority,
  prompt_text
) VALUES (
  'renovation_luxe',
  'salon',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Remove old furniture. Add luxury high-end furniture.

Luxury living room: Elegant velvet sofa (deep blue/emerald/gray), marble or glass coffee table with gold/brass accents, crystal chandelier or luxury pendant lights, crown molding on ceiling, decorative wall paneling OR wallpaper with subtle pattern, large ornate mirror with gold frame, luxury area rug (Persian/Oriental style), tall indoor plants, marble side tables, designer table lamps.
Walls: Elegant colors (cream/beige/soft gray/navy) with decorative molding or paneling.
Floor: High-end herringbone parquet (dark oak/walnut) OR large marble-look porcelain tiles.

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
  'renovation_luxe',
  'chambre',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Remove old furniture. Add luxury high-end furniture.

Luxury bedroom: Upholstered king bed with tall tufted headboard (velvet/leather), luxury bedding (white/cream with decorative pillows), elegant nightstands with marble tops and gold accents, crystal table lamps, crown molding, decorative wall paneling, luxury curtains with valance, ornate mirror, plush area rug.
Walls: Elegant colors (cream/taupe/soft gray) with crown molding and decorative paneling.
Floor: High-end herringbone parquet (dark oak/walnut) OR luxury carpet.

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
  'renovation_luxe',
  'salle_a_manger',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Remove old furniture. Add luxury high-end furniture.

Luxury dining room: Elegant dining table (dark wood with high gloss finish OR marble top), upholstered dining chairs with decorative backs (velvet/leather), crystal chandelier, crown molding, decorative wall paneling, luxury china cabinet with glass doors, large ornate mirror, decorative centerpiece (crystal bowl/candelabra), luxury area rug.
Walls: Elegant colors (cream/taupe/navy) with crown molding and decorative paneling.
Floor: High-end herringbone parquet (dark oak/walnut) OR large marble-look tiles.

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
  'renovation_luxe',
  'cuisine',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries, cabinet layout positions, window positions, door positions.

CRITICAL: Keep EXACT same kitchen layout - cabinets in SAME positions (upper/lower/corner), appliances in SAME locations, countertop SAME shape.

ONLY CHANGE: Update cabinet doors, countertop material, backsplash, appliances finish, hardware.

Luxury kitchen upgrade: White or cream shaker cabinet doors with gold/brass hardware, marble countertops (Carrara/Calacatta), marble backsplash, gold/brass faucet, luxury pendant lights, high-end appliance finishes.
Walls: Elegant cream or soft white.
Floor: High-end herringbone parquet (light oak) OR large marble-look tiles.

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
  'renovation_luxe',
  'salle_de_bain',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries, bathtub position, shower position, toilet position, sink position, window position.

CRITICAL: Keep EXACT same bathroom layout - fixtures in SAME locations, bathtub SAME position and size, shower SAME position, vanity SAME position.

ONLY CHANGE: Update tiles, fixtures finish, vanity material, mirror, lighting.

Luxury bathroom upgrade: White or cream marble tiles, gold/brass fixtures (faucet, shower head, towel bars), marble vanity countertop, ornate mirror with gold frame, luxury lighting.
Walls: White or cream marble tiles.
Floor: Large format marble tiles (Carrara/Calacatta).

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
  'renovation_luxe',
  'bureau',
  'with',
  FALSE,
  100,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Remove old furniture. Add luxury high-end furniture.

Luxury office: Dark wood executive desk with leather top, leather executive chair (tufted), built-in bookshelves with crown molding, decorative wall paneling, luxury table lamp with brass accents, ornate mirror or framed art, Persian rug, elegant curtains.
Walls: Dark wood paneling OR rich colors (navy/forest green/burgundy) with crown molding.
Floor: High-end herringbone parquet (dark oak/walnut).

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
  'renovation_luxe',
  NULL,
  'with',
  TRUE,
  50,
  'DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

ONLY CHANGE: Remove old furniture. Add luxury high-end furniture and finishes.

Luxury style: Elegant furniture with velvet/leather upholstery, marble/gold accents, crystal lighting, crown molding, decorative paneling, rich colors, high-end materials.
Walls: Elegant colors (cream/taupe/navy) with crown molding and decorative details.
Floor: High-end herringbone parquet OR marble-look tiles.

Keep everything else identical to source photo.'
);
