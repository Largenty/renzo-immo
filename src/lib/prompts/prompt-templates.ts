/**
 * Templates maîtres pour la construction des prompts
 * Optimisés pour l'attention des modèles de génération d'images
 *
 * PRINCIPES D'OPTIMISATION:
 * - Instructions critiques au DÉBUT et à la FIN (meilleure attention)
 * - Prompts concis: 50-80 lignes (vs 200+)
 * - Negative prompts explicites
 * - Weights/emphasis pour les contraintes clés
 * - Style photographique pour résultats photoréalistes
 * - Laisse NanoBanana interpréter naturellement les meubles selon le style
 *
 * Variables disponibles :
 * - {{room_dimensions}} : Dimensions exactes de la pièce (largeur x longueur, m²) - NOUVEAU
 * - {{room_constraints}} : Contraintes spécifiques à la pièce
 * - {{style_name}} : Nom du style (ex: Home Staging Moderne)
 * - {{style_palette}} : Palette de couleurs et matériaux
 * - {{room_name}} : Nom de la pièce (ex: Salon, Cuisine)
 * - {{final_instruction}} : Instruction finale
 * - {{furniture_instruction}} : Instruction pour fallback (ajouter ou retirer meubles)
 */

/**
 * Template optimisé pour transformations AVEC meubles
 * Ultra-simplifié: NanoBanana gère tout
 */
export const TEMPLATE_WITH_FURNITURE = `IMAGE-TO-IMAGE transformation: Apply {{style_name}} style to this {{room_name}} while preserving EXACT spatial structure. Professional architectural photography, wide-angle lens, natural lighting, 8K resolution, photorealistic real estate image.

===== CRITICAL: PRESERVE ORIGINAL IMAGE STRUCTURE (weight: 3.0) =====
{{room_dimensions}}
⚠️ STRICT GEOMETRIC PRESERVATION - NO MODIFICATIONS ALLOWED ⚠️

TRANSFORM ONLY: Colors, materials, furniture, lighting, decorations
PRESERVE 100%: Room size, walls, doors, windows, ceiling, floor layout, perspective

1. EXACT ROOM DIMENSIONS (weight: 3.0)
   • Room size CANNOT change - same width, length, height
   • If room is small, keep it small. If large, keep it large.
   • NO expanding or shrinking the space
   • Wall-to-wall distances LOCKED
   • Ceiling height FIXED

2. PRESERVE EVERY ARCHITECTURAL ELEMENT (weight: 3.0)
   • COUNT all walls/doors/windows in original → MUST match exactly in output
   • Door positions CANNOT move (left/right/center stays same)
   • Window positions LOCKED (same wall, same location)
   • Doorframes, openings, passages: EXACT same shape and position
   • If there's an entrance on the right → MUST remain on the right
   • If there's NO door on a wall → MUST stay empty
   • Radiators, pipes, fixed elements: KEEP in place

3. PERSPECTIVE LOCK (weight: 3.0)
   • SAME camera position, height, angle - ZERO deviation
   • Vanishing points CANNOT shift
   • Floor plane horizontal, walls vertical
   • NO rotation, tilt, or perspective change

4. SPATIAL COHERENCE (weight: 2.5)
   • Floor ONLY horizontal on ground
   • Walls ONLY vertical from floor to ceiling
   • Door openings lead to spaces (not blocked by walls)
   • Window openings show light/outside (not filled)
   • All corners and junctions aligned correctly

{{room_constraints}}

===== STYLE APPLICATION =====

TARGET: {{style_name}}

Apply this style palette precisely:
{{style_palette}}

The transformation MUST reflect {{style_name}} through:
• Specified wall colors applied accurately
• Floor materials from the palette only
• Cohesive aesthetic matching style keywords
• Appropriate lighting for the style
• Add furniture appropriate for this {{room_name}} in {{style_name}} style

⚠️ FURNITURE SCALE & REALISM (weight: 3.0) ⚠️
CRITICAL: Use realistic, FULL-SIZE furniture appropriate for room type
• Bedrooms: FULL-SIZE double/queen bed (160-180cm width minimum, NOT single, NOT undersized)
• Living rooms: FULL-SIZE sofa matching wall length proportionally
• Furniture should FILL and ANCHOR the space - room must feel FURNISHED not sparse
• NO miniature furniture, NO dollhouse scale, NO tiny items, NO undersized pieces
• Standard furniture dimensions: double bed 160cm+ width, queen bed 180cm+ width
• All furniture GROUNDED with proper weight, shadows, and realistic proportions

===== LIGHTING & REALISM =====

• Match original natural light direction
• Add artificial lighting enhancing {{style_name}}
• Consistent shadows across all elements
• Proper light fall-off and depth graduation
• Professional photography quality lighting
• HDR-style exposure capturing all details

===== FINAL OUTPUT =====

{{final_instruction}}

⚠️ FINAL CRITICAL CHECKS (weight: 3.0) ⚠️

BEFORE generating, verify:
✓ Room dimensions unchanged (same size as input)
✓ ALL doors/windows in SAME positions as input
✓ Door count matches input (if 1 door in input → 1 door in output)
✓ Window count matches input
✓ NO new openings created, NO existing openings removed
✓ Camera angle identical to input
✓ Perspective lines match input
✓ Furniture proportionally sized (fills space well, not undersized or lost in room)
✓ For bedrooms: bed is focal point and reaches AT LEAST halfway across window
✓ Bed size appropriate: 160-180cm for double bed, dominates space visually
✓ Balanced layout with clearances (60-80cm around bed)
✓ Only colors/materials/furniture changed - NOTHING ELSE

OUTPUT REQUIREMENTS:
✓ IMAGE-TO-IMAGE transformation respecting input structure
✓ {{style_name}} style applied ONLY to surfaces and objects
✓ Architectural shell preserved 100%
✓ Professional photorealistic quality`

/**
 * Template optimisé pour dépersonnalisation (SANS meubles)
 */
export const TEMPLATE_WITHOUT_FURNITURE = `IMAGE-TO-IMAGE transformation: Apply {{style_name}} style to this {{room_name}} while preserving EXACT spatial structure. Remove movable furniture, keep fixed architecture. Professional architectural photography, wide-angle lens, natural lighting, 8K resolution, photorealistic real estate image.

===== CRITICAL: PRESERVE ORIGINAL IMAGE STRUCTURE (weight: 3.0) =====
{{room_dimensions}}
⚠️ STRICT GEOMETRIC PRESERVATION - NO MODIFICATIONS ALLOWED ⚠️

TRANSFORM ONLY: Colors, materials, lighting, remove furniture
PRESERVE 100%: Room size, walls, doors, windows, ceiling, floor layout, perspective

1. EXACT ROOM DIMENSIONS (weight: 3.0)
   • Room size CANNOT change - same width, length, height
   • If room is small, keep it small. If large, keep it large.
   • NO expanding or shrinking the space
   • Wall-to-wall distances LOCKED
   • Ceiling height FIXED

2. PRESERVE EVERY ARCHITECTURAL ELEMENT (weight: 3.0)
   • COUNT all walls/doors/windows in original → MUST match exactly in output
   • Door positions CANNOT move (left/right/center stays same)
   • Window positions LOCKED (same wall, same location)
   • Doorframes, openings, passages: EXACT same shape and position
   • If there's an entrance on the right → MUST remain on the right
   • If there's NO door on a wall → MUST stay empty
   • Radiators, pipes, fixed elements: KEEP in place

3. PERSPECTIVE LOCK (weight: 3.0)
   • SAME camera position, height, angle - ZERO deviation
   • Vanishing points CANNOT shift
   • Floor plane horizontal, walls vertical
   • NO rotation, tilt, or perspective change

4. SPATIAL COHERENCE (weight: 2.5)
   • Floor ONLY horizontal on ground
   • Walls ONLY vertical from floor to ceiling
   • Door openings lead to spaces (not blocked by walls)
   • Ceiling meets walls at correct angles
   • All surfaces properly connected
   • No floating or disconnected elements

{{room_constraints}}

===== STYLE APPLICATION =====

STYLE: {{style_name}}

Apply this palette:
{{style_palette}}

===== DEPERSONALIZATION RULES =====

REMOVE ONLY (movable items):
• Furniture: sofas, tables, chairs, beds, dressers, freestanding shelves
• Decorations: wall art, photos, posters (hanging)
• Personal items: electronics, books, decorative objects, potted plants
• Freestanding lamps and lighting (table/floor lamps)
• Textiles: area rugs, carpets, cushions, throws
• Any portable belongings

PRESERVE EVERYTHING ELSE (fixed elements):
• Fixed lighting: chandeliers, ceiling lights, wall sconces, pendant lights
• Window treatments: curtains, drapes, blinds, shutters
• Built-in elements: cabinets, shelves, fireplace mantels, moldings
• Architectural details: wainscoting, chair rails, crown molding, cornices
• All flooring: wood, tiles, stone (just remove rugs on top)
• All walls: paint, wallpaper, texture, paneling
• Doors, windows, frames, handles, hardware
• Radiators, vents, fixed utilities

GOLDEN RULE: When in doubt, KEEP IT. If unsure whether fixed or movable, preserve it.

===== LIGHTING & ATMOSPHERE =====

• Maintain original natural light direction and quality
• Preserve window light and architectural lighting fixtures
• Shadows should reveal clean, empty space geometry
• Light naturally fills the room showing wall/floor textures
• Professional, well-exposed photography

===== FINAL OUTPUT =====

{{final_instruction}}

⚠️ FINAL CRITICAL CHECKS (weight: 3.0) ⚠️

BEFORE generating, verify:
✓ Room dimensions unchanged (same size as input)
✓ ALL doors/windows in SAME positions as input
✓ Door count matches input (if 1 door in input → 1 door in output)
✓ Window count matches input
✓ NO new openings created, NO existing openings removed
✓ Camera angle identical to input
✓ Perspective lines match input
✓ Only colors/materials changed + furniture removed - NOTHING ELSE

OUTPUT REQUIREMENTS:
✓ IMAGE-TO-IMAGE transformation respecting input structure
✓ {{style_name}} style applied ONLY to surfaces
✓ Architectural shell preserved 100%
✓ Space completely empty of movable furniture
✓ Fixed elements (lighting, built-ins) preserved
✓ Professional photorealistic quality`

/**
 * Template de fallback simplifié
 */
export const TEMPLATE_FALLBACK = `IMAGE-TO-IMAGE: Transform this {{room_name}} to {{style_name}} style while preserving EXACT structure. Professional architectural photography, 8K, photorealistic, natural lighting, real estate quality.

CRITICAL PRESERVATION (weight: 3.0):
• Room size CANNOT change - same dimensions
• ALL architectural elements (walls, windows, doors, ceiling) MUST stay in SAME positions
• Camera angle and perspective LOCKED - ZERO deviation
• Room geometry FIXED - no expanding, shrinking, or modifications
• Only colors, materials, lighting can change

{{furniture_instruction}}

VERIFICATION: Room dimensions unchanged, doors/windows in same positions, perspective identical.
OUTPUT: {{style_name}} {{room_name}}, EXACT same structure, professional real estate photography.`

/**
 * Negative prompts par type de transformation
 */
export const NEGATIVE_PROMPT_WITH_FURNITURE = `room size changed, expanded room, shrunken room, larger space, smaller space, added walls, removed walls, extra doors, missing doors, doors moved, doors in different position, extra windows, missing windows, windows moved, windows in different position, new openings, removed openings, changed room geometry, different room layout, modified architecture, distorted perspective, warped walls, curved lines, wrong camera angle, different viewpoint, changed room proportions, floating furniture, unrealistic scale, furniture out of proportion, disproportionate furniture, furniture blocking doors, furniture overlapping, empty room with tiny furniture, miniature furniture, dollhouse scale, furniture too far apart, sparse furniture, room feels empty despite furniture, undersized bed, small bed in large room, bed too short, bed too narrow, single bed in master bedroom, furniture lost in space, furniture looks small, insufficient furniture, minimalist with tiny items, bed doesn't reach window, bed ends before window midpoint, floor extending into walls, floor climbing walls, walls not vertical, misaligned wall junctions, doorways blocked by walls, incorrect spatial relationships, perspective distortion, warped geometry, disconnected surfaces, architectural inconsistencies, blurry, low quality, amateur photo, cartoon, sketch, drawing, painting, CGI look, unnatural lighting, oversaturated colors, underexposed, overexposed, noise, grain, artifacts, watermark`

export const NEGATIVE_PROMPT_WITHOUT_FURNITURE = `distorted perspective, warped walls, curved lines, wrong camera angle, different viewpoint, changed room proportions, floor extending into walls, floor climbing walls, walls not vertical, misaligned wall junctions, doorways blocked, incorrect spatial relationships, perspective distortion, warped geometry, architectural inconsistencies, furniture remaining, people, personal items, decorations, blurry, low quality, amateur photo, cartoon, sketch, drawing, painting, CGI look, unnatural lighting, changed architecture, modified walls, removed windows, removed doors, removed fixed lighting, oversaturated colors, underexposed, overexposed, noise, grain, artifacts, watermark`

export const NEGATIVE_PROMPT_FALLBACK = `distorted perspective, warped walls, wrong camera angle, different viewpoint, blurry, low quality, amateur photo, cartoon, sketch, unnatural lighting, changed architecture, oversaturated, underexposed, overexposed, noise, artifacts, watermark`

/**
 * Fonction utilitaire pour remplacer les variables dans un template
 */
export function fillTemplate(template: string, variables: Record<string, string>): string {
  let result = template

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`
    result = result.replace(new RegExp(placeholder, 'g'), value || '')
  }

  // Nettoyer les doubles sauts de ligne
  result = result.replace(/\n{3,}/g, '\n\n')

  // Trim les espaces en début/fin
  result = result.trim()

  return result
}

/**
 * Fonction pour obtenir le negative prompt approprié
 */
export function getNegativePrompt(hasFurniture: boolean): string {
  return hasFurniture ? NEGATIVE_PROMPT_WITH_FURNITURE : NEGATIVE_PROMPT_WITHOUT_FURNITURE
}
