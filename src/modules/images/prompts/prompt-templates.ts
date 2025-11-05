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
 * Format concis et lisible
 */
export const TEMPLATE_WITH_FURNITURE = `IMAGE-TO-IMAGE transformation: Apply {{style_name}} style to this {{room_name}} while preserving the EXACT room geometry and camera perspective.

Resolution: Ultra-high-res, photorealistic real estate image, cinematic natural lighting, professional wide-angle photography.

===== CRITICAL CONSTRAINTS (structural preservation) =====
{{room_dimensions}}
(Weight: 3.0)
• Keep all walls, doors, windows, and ceiling exactly as in input.
• No new openings, no displacement of existing elements.
• Perspective, vanishing points, and camera angle LOCKED.
• Maintain same floor plan, wall layout, and window orientation.
• Preserve lighting direction from input photo.

{{room_constraints}}

===== STYLE: {{style_name}} =====
{{style_palette}}

Add realistic {{style_name}} {{room_name}} furniture:
• Bedrooms: full-size double/queen bed (160–180cm width minimum)
• Living rooms: full-size sofa matching wall length proportionally
• Furniture should FILL and ANCHOR the space – room must feel FURNISHED, not sparse
• All furniture GROUNDED with proper weight, shadows, and realistic proportions
• NO miniature furniture, NO dollhouse scale, NO undersized pieces

===== REALISM & PHOTOGRAPHIC QUALITY =====
• Maintain depth and shadows consistent with input light direction.
• Realistic scale and grounding for all furniture.
• Sharp textures and clean materials.
• Cinematic exposure, balanced contrast, soft diffusion.
• Professional photography quality lighting.

Final Output:
→ Photorealistic {{style_name}} {{room_name}} home-staged version of the input image.
→ Preserve 100% of geometry and layout; transform only materials, colors, and decor.`

/**
 * Template optimisé pour dépersonnalisation (SANS meubles)
 * Format concis et lisible
 */
export const TEMPLATE_WITHOUT_FURNITURE = `IMAGE-TO-IMAGE transformation: Apply {{style_name}} style to this {{room_name}} while preserving the EXACT room geometry and camera perspective. Remove all movable furniture and personal items.

Resolution: Ultra-high-res, photorealistic real estate image, cinematic natural lighting, professional wide-angle photography.

===== CRITICAL CONSTRAINTS (structural preservation) =====
{{room_dimensions}}
(Weight: 3.0)
• Keep all walls, doors, windows, and ceiling exactly as in input.
• No new openings, no displacement of existing elements.
• Perspective, vanishing points, and camera angle LOCKED.
• Maintain same floor plan, wall layout, and window orientation.
• Preserve lighting direction from input photo.

{{room_constraints}}

===== STYLE: {{style_name}} =====
{{style_palette}}

===== DEPERSONALIZATION RULES =====
REMOVE (movable items):
• Furniture: sofas, tables, chairs, beds, dressers, freestanding shelves
• Decorations: wall art, photos, posters, personal items
• Freestanding lamps, textiles (rugs, cushions), portable objects

PRESERVE (fixed elements):
• Fixed lighting: chandeliers, ceiling lights, wall sconces
• Window treatments: curtains, drapes, blinds
• Built-in elements: cabinets, shelves, moldings
• All flooring, walls, doors, windows, frames, hardware
• Radiators, vents, fixed utilities

===== REALISM & PHOTOGRAPHIC QUALITY =====
• Maintain depth and shadows consistent with input light direction.
• Shadows reveal clean, empty space geometry.
• Sharp textures and clean materials.
• Cinematic exposure, balanced contrast, soft diffusion.
• Professional photography quality lighting.

Final Output:
→ Photorealistic empty {{style_name}} {{room_name}} depersonalized version of the input image.
→ Preserve 100% of geometry and layout; transform only materials and colors, remove movable items.`

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
