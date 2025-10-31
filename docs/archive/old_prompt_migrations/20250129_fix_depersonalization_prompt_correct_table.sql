-- Migration: Mettre à jour le prompt de dépersonnalisation dans la BONNE table
-- La fonction get_transformation_prompt lit depuis transformation_prompts, pas transformation_types

-- Supprimer l'ancien prompt s'il existe
DELETE FROM transformation_prompts 
WHERE transformation_type = 'depersonnalisation';

-- Insérer le nouveau prompt ULTRA STRICT
INSERT INTO transformation_prompts (
  transformation_type,
  room_type,
  with_furniture,
  is_default,
  priority,
  prompt_text
) VALUES (
  'depersonnalisation',
  NULL,  -- S'applique à tous les types de pièces
  NULL,  -- Pas de variation avec/sans meubles
  TRUE,  -- C'est le prompt par défaut
  100,   -- Priorité élevée
  '⚠️ CRITICAL - DEPERSONALIZATION NOT RENOVATION ⚠️

🔒 ABSOLUTE PRESERVATION RULES (NEVER MODIFY):

WALLS:
- Keep EXACT original wall color (yellow stays yellow, blue stays blue, white stays white)
- Keep EXACT wallpaper patterns if present
- Keep EXACT paint texture and finish
- NO repainting, NO color changes, NO surface modifications

FLOOR:
- Keep EXACT original flooring material (wood parquet stays wood parquet, tiles stay tiles, carpet stays carpet)
- Keep EXACT floor color and pattern
- Keep EXACT wood grain, tile pattern, carpet texture
- NO material changes, NO refinishing, NO replacements

ARCHITECTURAL ELEMENTS (Keep 100%):
- Windows: exact size, position, frames, glass, handles
- Doors: exact size, position, frames, handles, color
- Ceiling: exact height, color, texture, features
- Moldings: baseboards, crown moldings, trim (keep all)
- Radiators/heaters: keep in exact position
- Light fixtures: ceiling lights, wall sconces (permanent ones)
- Electrical: switches, outlets, covers
- Plumbing: radiators, visible pipes

🗑️ ONLY TASK - REMOVE THESE ITEMS:
- All furniture (beds, tables, chairs, sofas, shelves, dressers)
- All decorations (pictures, frames, wall art, posters)
- All personal items (toys, books, objects, accessories)
- All portable textiles (curtains CAN be removed, rugs, bedding)
- All portable lamps
- All movable objects

✅ FINAL RESULT REQUIREMENTS:
- Completely empty room
- EXACT same wall color as original
- EXACT same floor material and color as original
- Zero furniture, zero decorations
- Original architectural elements 100% preserved
- Room ready for home staging

❌ ABSOLUTELY FORBIDDEN ACTIONS:
- Repainting walls in any color
- Changing wall finishes or textures
- Removing or changing wallpaper
- Changing floor material (wood to tile, tile to wood, etc.)
- Changing floor color
- Refinishing floors
- Any renovation work
- Any surface modifications
- Changing window or door colors

REMEMBER: This is DEPERSONALIZATION (removing items) NOT RENOVATION (changing surfaces).
The room must look EXACTLY the same but EMPTY.'
);

-- Vérifier l'insertion
SELECT 
  transformation_type,
  room_type,
  is_default,
  LEFT(prompt_text, 150) as prompt_preview
FROM transformation_prompts
WHERE transformation_type = 'depersonnalisation';
