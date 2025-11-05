-- Migration: Mettre à jour le prompt pour le style dépersonnalisation
-- Nouveau prompt: Pièce complètement vide avec uniquement les murs et le sol

UPDATE transformation_types
SET prompt_template = 'ARCHITECTURAL PRESERVATION: Keep EXACT geometry of ALL walls (including curves), ALL window/door positions/sizes, ALL structural elements unchanged.

COMPLETE DEPERSONALIZATION:
- Remove ALL furniture, decoration, objects
- Empty room showing ONLY walls and floor
- Keep existing wall colors and finishes AS-IS
- Keep existing floor material and color AS-IS
- NO modifications to walls or floor
- NO repainting or renovations
- Just an empty space

Keep ALL architectural details:
- Wall textures, colors, materials (unchanged)
- Floor material and pattern (unchanged)
- Windows, doors, frames (unchanged)
- Ceiling, moldings, baseboards (unchanged)
- Light switches, outlets (unchanged)

STRICT REMOVAL:
- All furniture
- All decorations
- All personal items
- All objects
- All textiles (curtains, rugs, etc.)

Result: Completely empty room with existing walls and floor, ready for staging.'

WHERE slug = 'depersonnalisation';

-- Vérifier la mise à jour
SELECT slug, name, prompt_template
FROM transformation_types
WHERE slug = 'depersonnalisation';
