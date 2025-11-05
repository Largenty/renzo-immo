-- Migration: Prompt dépersonnalisation ULTRA STRICT
-- CRITICAL: Ne JAMAIS changer les murs ni le sol

UPDATE transformation_types
SET prompt_template = '⚠️ CRITICAL ARCHITECTURAL PRESERVATION - ABSOLUTE RULES ⚠️

🔒 MANDATORY PRESERVATION (NEVER CHANGE):
1. WALL COLORS: Keep EXACT original colors (yellow stays yellow, white stays white, blue stays blue)
2. WALL TEXTURES: Keep EXACT original textures and patterns (wallpaper, paint finish, etc.)
3. FLOOR MATERIAL: Keep EXACT original flooring (wood stays wood, tiles stay tiles, carpet stays carpet)
4. FLOOR COLOR: Keep EXACT original floor color and pattern
5. WINDOWS: Keep EXACT size, position, frames, glass
6. DOORS: Keep EXACT size, position, frames, handles
7. CEILING: Keep EXACT color, height, features
8. MOLDINGS: Keep ALL baseboards, crown moldings, trim
9. RADIATORS/HEATERS: Keep in place
10. LIGHT FIXTURES: Keep ceiling lights, wall sconces
11. ELECTRICAL: Keep switches, outlets visible

🗑️ ONLY ACTION ALLOWED - REMOVE:
- Furniture (beds, tables, chairs, sofas, etc.)
- Decorations (pictures, frames, wall art)
- Personal items (toys, books, objects)
- Textiles (curtains, rugs, bedding) - EXCEPT if they are permanent fixtures
- Lamps (portable ones only)

✅ RESULT MUST SHOW:
- Original wall color UNCHANGED (if yellow, stays yellow)
- Original wall texture UNCHANGED (if wallpaper pattern, keep it)
- Original floor material UNCHANGED (if wood parquet, stays wood parquet)
- Original floor color UNCHANGED
- Completely empty space with NO furniture
- Ready for home staging with PRESERVED original surfaces

❌ ABSOLUTELY FORBIDDEN:
- Repainting walls
- Changing wall colors
- Removing wallpaper patterns
- Changing floor material
- Changing floor color
- Any renovation work
- Any surface modifications

This is DEPERSONALIZATION not RENOVATION. Keep the room EXACTLY as-is but EMPTY.'

WHERE slug = 'depersonnalisation';

-- Vérifier
SELECT slug, name, LEFT(prompt_template, 200) as prompt_preview
FROM transformation_types
WHERE slug = 'depersonnalisation';
