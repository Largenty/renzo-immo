/**
 * Templates maîtres pour la construction des prompts
 *
 * Variables disponibles :
 * - {{room_constraints}} : Contraintes spécifiques à la pièce
 * - {{style_name}} : Nom du style (ex: Home Staging Moderne)
 * - {{style_palette}} : Palette de couleurs et matériaux
 * - {{furniture_list}} : Liste des meubles à ajouter
 * - {{room_name}} : Nom de la pièce (ex: Salon, Cuisine)
 * - {{final_instruction}} : Instruction finale
 */

/**
 * Template principal pour les transformations AVEC meubles
 */
export const TEMPLATE_WITH_FURNITURE = `===== ARCHITECTURAL CONSTRAINTS (ABSOLUTE PRIORITY) =====

{{room_constraints}}

CRITICAL GEOMETRY RULES:
• Camera angle: MUST remain identical (same viewpoint, same height, same focal length)
• Perspective lines: MUST converge to the same vanishing points
• Room proportions: Width/height/depth ratios MUST be preserved exactly
• Wall angles: Keep all wall junctions at their original angles
• Floor level: Maintain the exact same floor plane and level
• Ceiling height: Keep the original ceiling height visible in the frame
• Light sources: Natural light direction and intensity must match (windows, exposure)

===== TRANSFORMATION STYLE =====

TARGET STYLE: {{style_name}}

YOU MUST APPLY THIS STYLE COMPLETELY. This is not optional.

REQUIRED PALETTE & MATERIALS:
{{style_palette}}

The room MUST reflect the {{style_name}} aesthetic through:
• Wall colors matching the specified palette EXACTLY
• Floor materials from the specified list
• Overall atmosphere and ambiance matching the style keywords
• Cohesive design that clearly represents {{style_name}}

LIGHTING & ATMOSPHERE:
• Match the original natural light direction and quality
• Add artificial lighting that enhances the {{style_name}} aesthetic
• Maintain consistent shadows and light fall-off
• Preserve the sense of depth through proper lighting graduation

===== FURNITURE TO ADD =====

MANDATORY: You MUST add the following furniture items. This is not optional. The room cannot remain empty.

PLACEMENT RULES:
• Respect the room's circulation paths and functional zones
• Furniture must be proportional to the room's scale
• Items must follow the floor plane and perspective grid
• Shadows must be consistent with light sources
• Furniture depth and volume must be realistic for the space
• Each item in the list below MUST appear in the final image

REQUIRED FURNITURE LIST (ADD ALL OF THESE):
{{furniture_list}}

CRITICAL: Every single item listed above MUST be present in the transformed image. Do not skip any item.

===== SPATIAL COHERENCE REQUIREMENTS =====

• All added elements must follow the same perspective system
• Furniture scale must be realistic (standard human proportions)
• Distances between objects must be logical and navigable
• Vertical elements (lamps, plants) must be perfectly vertical
• Horizontal surfaces (tables, shelves) must align with floor plane
• No floating objects: everything must rest on surfaces or floor
• Maintain spatial hierarchy: foreground, middle ground, background

===== FINAL RESULT =====

{{final_instruction}}

QUALITY CHECKS:
✓ All architectural elements unchanged (walls, windows, doors, ceiling)
✓ Perspective and geometry perfectly preserved
✓ Furniture realistically placed and proportioned
✓ Lighting coherent with sources and shadows
✓ Style palette consistently applied
✓ Professional, photorealistic result`

/**
 * Template principal pour les transformations SANS meubles (dépersonnalisation)
 */
export const TEMPLATE_WITHOUT_FURNITURE = `===== ARCHITECTURAL CONSTRAINTS (ABSOLUTE PRIORITY) =====

{{room_constraints}}

CRITICAL GEOMETRY RULES:
• Camera angle: MUST remain identical (same viewpoint, same height, same focal length)
• Perspective lines: MUST converge to the same vanishing points
• Room proportions: Width/height/depth ratios MUST be preserved exactly
• Wall angles: Keep all wall junctions at their original angles
• Floor level: Maintain the exact same floor plane and level
• Ceiling height: Keep the original ceiling height visible in the frame
• Light sources: Natural light direction and intensity must match (windows, exposure)

===== DEPERSONALIZATION STYLE =====

STYLE: {{style_name}}

PALETTE & MATERIALS:
{{style_palette}}

LIGHTING & ATMOSPHERE:
• Maintain the original natural light direction and quality
• Preserve window light and any architectural lighting
• Keep consistent shadows showing the empty space
• Maintain the sense of depth and volume

===== FURNITURE REMOVAL =====

REMOVE COMPLETELY (and nothing else):
• Movable furniture ONLY: sofas, armchairs, coffee tables, side tables, dining tables, chairs, beds, nightstands, dressers, bookshelves (freestanding)
• Wall decorations: paintings, photos, posters, art prints in frames (hanging on walls)
• Personal decorative items: vases, books, magazines, sculptures, decorative objects on surfaces
• Personal belongings: electronics (TV, computers), freestanding lamps, potted plants, accessories
• Textiles and soft furnishings: cushions, throws, area rugs, carpets, mats (but NOT curtains/drapes)
• Any item that could be carried out by hand

ABSOLUTELY PRESERVE (DO NOT MODIFY):
• ALL architectural fixtures: ceiling lights/chandeliers, wall sconces, pendant lights (fixed)
• ALL window treatments: curtains, drapes, blinds, shutters (they are part of window dressing)
• ALL fixed wall elements: picture rails, chair rails, wainscoting, crown molding
• ALL built-in elements: built-in cabinets, shelves, fireplace mantels, radiator covers
• ALL doors and door frames: including handles, hinges, door casings
• ALL windows and window frames: including mullions, transoms, window sills
• ALL ceiling elements: ceiling roses, cornices, beams, coffers
• ALL fixed decorative elements: fireplace surrounds, architectural ornaments
• ALL flooring: wood, tiles, stone, parquet (just remove rugs on top)
• ALL walls: paint color, wallpaper, texture, paneling
• ALL fixed lighting: chandeliers, ceiling fixtures, wall sconces

CRITICAL: If you're not sure whether something is removable furniture or a fixed architectural element, KEEP IT. When in doubt, preserve it.

COMMON MISTAKES TO AVOID:
• DO NOT remove chandeliers, ceiling lights, or wall sconces (they are FIXED)
• DO NOT remove or change curtains, drapes, or blinds (they are FIXED window treatments)
• DO NOT remove or modify fireplace mantels or surrounds (they are FIXED architecture)
• DO NOT change wall colors, paint, or wallpaper (they are FIXED finishes)
• DO NOT remove picture frames or artwork that appear to be permanently mounted
• DO NOT modify radiators, vents, or heating elements (they are FIXED utilities)

===== SPATIAL COHERENCE REQUIREMENTS =====

• Empty space must feel natural and believable
• Maintain proper exposure showing wall and floor textures
• Shadows should reveal the room's true geometry
• Light should naturally fill the emptied space
• Floor and walls must appear clean and well-maintained
• Depth perception must be clear in the empty room

===== FINAL RESULT =====

{{final_instruction}}

QUALITY CHECKS:
✓ All architectural elements unchanged (walls, windows, doors, ceiling)
✓ Perspective and geometry perfectly preserved
✓ Space completely empty of furniture and personal items
✓ Lighting coherent and natural
✓ Clean, professional, ready-to-show result`

/**
 * Template de fallback si aucun composant n'est trouvé
 */
export const TEMPLATE_FALLBACK = `Transform this {{room_name}} into a {{style_name}} style.

CRITICAL RULES:
• Keep camera angle and perspective exactly the same
• Preserve all architectural elements (walls, windows, doors, ceiling)
• Maintain room geometry and proportions
• Match natural light direction

{{furniture_instruction}}

RESULT: Professional, photorealistic transformation maintaining original architecture.`

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
