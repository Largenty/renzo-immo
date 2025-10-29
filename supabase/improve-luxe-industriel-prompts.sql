-- ============================================
-- 🔧 AMÉLIORATION DES PROMPTS LUXE & INDUSTRIEL
-- ============================================
-- Ce script améliore les prompts pour:
-- - renovation_luxe : Plus de détails sur les matériaux nobles et l'ambiance haut de gamme
-- - home_staging_industriel : Plus d'authenticité et de détails sur le style loft urbain

BEGIN;

-- ============================================
-- 🏙️ RÉNOVATION LUXE - VERSION AMÉLIORÉE
-- ============================================

-- Mise à jour du prompt AVEC meubles
UPDATE transformation_prompts
SET prompt_text = 'ARCHITECTURAL PRESERVATION: Keep ALL walls (including curves), ALL moldings, niches, ceiling heights, window/door placements EXACTLY as they are. Preserve geometry and proportions 100%. MATERIALS TRANSFORMATION - LUXURY FOCUS: Install PREMIUM flooring (herringbone parquet in rich walnut or dark oak with satin finish, OR polished Carrara/Calacatta marble, OR natural stone tiles with elegant veining), apply REFINED wall finishes (silk or linen wallpaper in subtle patterns, leather or fabric upholstered panels, OR premium matte paint in sophisticated tones: deep navy, forest green, warm taupe, or ivory), ADD/ENHANCE architectural details (ornate crown moldings, decorative ceiling roses, elegant baseboards in white or gold trim, wainscoting panels). Ceiling: coffered design with indirect LED lighting, or smooth premium paint with statement chandelier. FURNITURE STYLE TRANSFORMATION - HIGH-END STAGING: Transform existing furniture layout to LUXURY aesthetic — replace ALL seating with designer pieces (deep-button tufted velvet sofas in jewel tones, wingback armchairs in rich fabrics), upgrade tables to premium materials (marble-top coffee tables with brass legs, solid walnut dining tables, lacquered side tables), add LUXURY TEXTILES (silk or velvet curtains with elegant draping, plush area rug in Persian or modern geometric pattern, velvet or silk cushions), incorporate REFINED ACCESSORIES (crystal table lamps, large framed classical or contemporary art, coffee table books, sculptural vases, fresh flowers in elegant vessels, mirrored or brass decorative objects). LIGHTING: statement crystal or modern designer chandelier, elegant wall sconces in brass/gold, table lamps with silk shades. Maintain functional layout while creating an atmosphere of refined elegance and timeless luxury. PALETTE: cream, ivory, gold accents, navy blue, emerald green, burgundy, rich walnut/mahogany woods, marble whites with grey veining, brass/gold metallic touches. Architecture identical, materials elevated to premium luxury, furniture and decor transformed to high-end sophisticated staging worthy of luxury real estate.'
WHERE transformation_type = 'renovation_luxe'
  AND furniture_mode = 'with';

-- Mise à jour du prompt SANS meubles
UPDATE transformation_prompts
SET prompt_text = 'CRITICAL: COMPLETELY EMPTY ROOM REQUIRED. ARCHITECTURAL PRESERVATION: Keep ALL architectural elements EXACTLY — curved walls, straight walls, moldings, window/door openings, ceiling shapes. MATERIALS TRANSFORMATION - LUXURY FOCUS: Install PREMIUM flooring (herringbone parquet in rich walnut or dark oak with satin finish, OR polished Carrara/Calacatta marble with elegant veining, OR natural stone tiles in cream/grey tones), apply REFINED wall treatments (silk or linen wallpaper in subtle damask or geometric patterns, OR leather/fabric upholstered accent panels, OR premium matte paint in sophisticated colors: deep navy, forest green, warm taupe, ivory white), ADD/ENHANCE architectural millwork (ornate crown moldings with decorative details, elegant baseboards in white or subtle gold trim, wainscoting panels in lower third of walls, decorative ceiling roses or medallions). CEILING TREATMENT: install coffered ceiling design with recessed panels, OR smooth premium paint with decorative plaster moldings, add sophisticated lighting (recessed LED spots with dimming, OR elegant chandelier mounting point with decorative ceiling rose). LUXURY LIGHTING FIXTURES: install statement chandelier (crystal, modern brass geometric, or designer piece) as focal point, add elegant wall sconces in brass/gold/chrome finish on either side of focal walls. MANDATORY FURNITURE REMOVAL: REMOVE ALL FURNITURE AND OBJECTS — NO sofas, NO tables, NO chairs, NO rugs, NO curtains, NO decorations, NO movable items. Display ONLY the luxury architectural finishes and premium materials on the bare shell: ornate moldings, premium flooring, refined wall treatments, sophisticated ceiling details, elegant lighting fixtures. THIS IS AN EMPTY LUXURY-FINISHED ROOM showing only premium materials and architectural refinement.'
WHERE transformation_type = 'renovation_luxe'
  AND furniture_mode = 'without';

-- ============================================
-- 🏭 HOME STAGING INDUSTRIEL - VERSION AMÉLIORÉE
-- ============================================

-- Mise à jour du prompt AVEC meubles
UPDATE transformation_prompts
SET prompt_text = 'ARCHITECTURAL PRESERVATION: Keep EXACT wall positions, ALL openings (windows/doors), ceiling height, room geometry 100% identical. MATERIALS TRANSFORMATION - AUTHENTIC INDUSTRIAL LOFT: Transform walls to INDUSTRIAL finishes (exposed red brick texture with visible mortar joints, OR raw concrete finish with formwork marks and industrial patina, OR painted brick in charcoal grey/dark grey maintaining brick texture, OR combination of brick accent walls with painted concrete), install INDUSTRIAL flooring (wide-plank reclaimed wood in dark stain showing natural wear and knots, OR polished concrete with visible aggregate and subtle cracks sealed, OR large-format dark grey cement tiles 60x60cm), EXPOSE or CREATE industrial ceiling elements (visible black-painted steel I-beams, exposed ductwork and ventilation pipes painted matte black, visible electrical conduits in metal, painted ceiling in dark charcoal or matte black, OR industrial concrete ceiling with rough texture), add METAL industrial details (black metal window frames if visible, metal corner guards, exposed metal baseboards or no baseboards showing raw floor-to-wall junction). FURNITURE STYLE TRANSFORMATION - URBAN LOFT AESTHETIC: Transform existing furniture to INDUSTRIAL LOFT style — replace seating with metal-frame pieces (steel frame sofas with distressed leather cushions in brown/black, metal dining chairs with wood seats, vintage metal stools), update tables to industrial designs (reclaimed wood dining table with visible grain and metal hairpin legs, coffee table made from wood planks on metal frame, metal side tables with riveted details or wheel casters), add INDUSTRIAL LIGHTING (black metal pendant lights with Edison bulbs on fabric cords hanging at various heights, vintage-style metal task lamps, exposed bulb fixtures with metal cages), incorporate URBAN INDUSTRIAL DECOR (metal shelving units with wood planks, vintage industrial clock with metal frame, metal signs or typography, minimal plants in concrete or metal planters, black-and-white urban photography in simple black metal frames). TEXTILES minimal and raw (dark leather, canvas, burlap, minimal grey/black throws). Maintain functional layout while creating authentic urban loft industrial atmosphere. PALETTE: charcoal grey, matte black, exposed brick red-brown, raw concrete grey, dark stained wood, rust/copper metal accents, minimal warm Edison bulb amber light. Architecture unchanged, materials transformed to authentic industrial warehouse aesthetic, furniture and decor transformed to edgy urban loft style.'
WHERE transformation_type = 'home_staging_industriel'
  AND furniture_mode = 'with';

-- Mise à jour du prompt SANS meubles
UPDATE transformation_prompts
SET prompt_text = 'CRITICAL: COMPLETELY EMPTY ROOM REQUIRED. ARCHITECTURAL PRESERVATION: Keep ALL architectural geometry EXACTLY as is — walls, windows, doors, ceiling height. MATERIALS TRANSFORMATION - AUTHENTIC INDUSTRIAL LOFT: Transform walls to INDUSTRIAL finishes (exposed red brick with visible mortar joints and industrial patina, OR raw concrete with formwork texture and marks, OR painted brick in charcoal/dark grey maintaining brick relief, OR mix of exposed brick accent wall with raw concrete), install INDUSTRIAL flooring (wide-plank reclaimed wood in dark walnut/espresso stain showing grain and knots, OR polished concrete floor with visible aggregate and sealed micro-cracks for authenticity, OR large-format dark cement tiles 60x60cm+ in anthracite grey), CREATE/EXPOSE industrial ceiling treatment (visible black-painted steel beams and structural elements, exposed HVAC ductwork and pipes painted matte black, visible electrical conduit in black metal, raw concrete ceiling with rough finish, OR painted ceiling in dark charcoal/black maintaining industrial feel). INDUSTRIAL ARCHITECTURAL DETAILS: black metal window frames (if windows present), no baseboards OR minimal black metal baseboards, exposed floor-to-wall junctions, visible metal corner guards or edge protectors. INDUSTRIAL LIGHTING FIXTURES: install dramatic industrial lighting (large black metal pendant lights with Edison bulbs on long fabric-wrapped cords, vintage factory-style lights with metal shades, exposed bulb fixtures with wire cages, track lighting with black metal fixtures). MANDATORY FURNITURE REMOVAL: DELETE ALL FURNITURE AND OBJECTS — NO sofas, NO tables, NO chairs, NO rugs, NO decorations, NO shelving, NO movable items. Display ONLY authentic industrial materials and finishes on the bare architectural shell: exposed brick or concrete walls, dark industrial flooring, black metal structural elements, industrial lighting fixtures, raw urban loft aesthetic. THIS IS AN EMPTY INDUSTRIAL LOFT-FINISHED ROOM showing only raw materials and urban warehouse character.'
WHERE transformation_type = 'home_staging_industriel'
  AND furniture_mode = 'without';

COMMIT;

-- ============================================
-- VÉRIFICATIONS
-- ============================================

SELECT '✅ PROMPTS AMÉLIORÉS AVEC SUCCÈS !' as status;

-- Afficher les prompts mis à jour
SELECT
  '📋 Prompts Rénovation Luxe' as info,
  furniture_mode,
  LEFT(prompt_text, 150) || '...' as prompt_preview
FROM transformation_prompts
WHERE transformation_type = 'renovation_luxe'
ORDER BY furniture_mode;

SELECT
  '📋 Prompts Home Staging Industriel' as info,
  furniture_mode,
  LEFT(prompt_text, 150) || '...' as prompt_preview
FROM transformation_prompts
WHERE transformation_type = 'home_staging_industriel'
ORDER BY furniture_mode;

-- ============================================
-- 📝 CHANGEMENTS EFFECTUÉS
-- ============================================

/*
✅ RÉNOVATION LUXE - AMÉLIORATIONS :

MATÉRIAUX PLUS DÉTAILLÉS :
- Sol : Parquet point de Hongrie en noyer/chêne foncé avec finition satinée, marbre Carrara/Calacatta poli, pierres naturelles avec veinage
- Murs : Papier peint soie/lin avec motifs subtils, panneaux capitonnés cuir/tissu, peinture mate haut de gamme (bleu marine, vert forêt, taupe)
- Plafond : Design à caissons avec éclairage LED indirect, roses décoratives, moulures en plâtre
- Détails : Corniches ornées, plinthes blanches ou dorées, lambris

MOBILIER & DÉCORATION PLUS PRÉCIS :
- Canapés capitonnés en velours (tons bijoux), fauteuils à oreilles
- Tables : dessus marbre avec pieds laiton, bois massif noyer, laqués
- Textiles : Rideaux soie/velours drapés, tapis persans ou géométriques modernes
- Accessoires : Lampes cristal, art encadré classique/contemporain, vases sculptés, fleurs fraîches, objets miroir/laiton
- Éclairage : Lustres cristal ou design moderne, appliques murales laiton/or, lampes à abat-jour soie

PALETTE ENRICHIE :
Crème, ivoire, accents or, bleu marine, vert émeraude, bordeaux, bois riches noyer/acajou, marbres blancs à veinage gris, touches métalliques laiton/or

---

✅ HOME STAGING INDUSTRIEL - AMÉLIORATIONS :

MATÉRIAUX PLUS AUTHENTIQUES :
- Murs : Brique rouge apparente avec joints mortier visibles, béton brut avec marques de coffrage et patine, brique peinte gris anthracite gardant la texture
- Sol : Planches bois récupéré teinte foncée avec nœuds et usure naturelle, béton poli avec agrégats visibles et micro-fissures scellées, carreaux ciment gris foncé 60x60cm
- Plafond : Poutres en acier peintes noir, tuyauterie et conduits apparents peints noir mat, conduits électriques métalliques visibles, béton brut ou peint anthracite/noir
- Détails : Cadres fenêtres métal noir, pas de plinthes OU plinthes métal noir, jonctions sol-mur apparentes, protections d'angle métalliques

MOBILIER & DÉCORATION PLUS INDUSTRIEL :
- Assises : Cadres acier avec coussins cuir vieilli marron/noir, chaises métal industriel avec sièges bois, tabourets métal vintage
- Tables : Bois récupéré avec veinage visible et pieds métal hairpin, plateau planches sur cadre métal, tables d'appoint métal avec roulettes
- Éclairage : Suspensions métal noir avec ampoules Edison sur câbles tissu (hauteurs variées), lampes tâche vintage métal, ampoules apparentes avec cages métalliques
- Déco : Étagères métal avec planches bois, horloge industrielle métal, enseignes métalliques/typographie, plantes en pots béton/métal, photos noir-blanc urbaines en cadres métal simples
- Textiles minimalistes : Cuir foncé, toile, jute, plaids gris/noir minimes

PALETTE ENRICHIE :
Gris anthracite, noir mat, rouge-brun brique apparente, gris béton brut, bois teinte foncée, accents métal rouille/cuivre, lumière ambrée ampoules Edison

---

Ces changements apportent beaucoup plus de détails et de précision pour que l'IA génère
des images plus fidèles aux styles "Luxe" et "Industriel" authentiques.
*/
