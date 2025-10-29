#!/usr/bin/env node

/**
 * Script pour appliquer les améliorations des prompts Luxe et Industriel
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applyPromptsImprovement() {
  console.log('🔧 Application des améliorations des prompts...\n');

  try {
    // 1. Amélioration du prompt Rénovation Luxe (avec meubles)
    console.log('📝 Mise à jour du prompt Rénovation Luxe (avec meubles)...');
    const { error: luxeWithError } = await supabase
      .from('transformation_prompts')
      .update({
        prompt_text: `ARCHITECTURAL PRESERVATION: Keep ALL walls (including curves), ALL moldings, niches, ceiling heights, window/door placements EXACTLY as they are. Preserve geometry and proportions 100%. MATERIALS TRANSFORMATION - LUXURY FOCUS: Install PREMIUM flooring (herringbone parquet in rich walnut or dark oak with satin finish, OR polished Carrara/Calacatta marble, OR natural stone tiles with elegant veining), apply REFINED wall finishes (silk or linen wallpaper in subtle patterns, leather or fabric upholstered panels, OR premium matte paint in sophisticated tones: deep navy, forest green, warm taupe, or ivory), ADD/ENHANCE architectural details (ornate crown moldings, decorative ceiling roses, elegant baseboards in white or gold trim, wainscoting panels). Ceiling: coffered design with indirect LED lighting, or smooth premium paint with statement chandelier. FURNITURE STYLE TRANSFORMATION - HIGH-END STAGING: Transform existing furniture layout to LUXURY aesthetic — replace ALL seating with designer pieces (deep-button tufted velvet sofas in jewel tones, wingback armchairs in rich fabrics), upgrade tables to premium materials (marble-top coffee tables with brass legs, solid walnut dining tables, lacquered side tables), add LUXURY TEXTILES (silk or velvet curtains with elegant draping, plush area rug in Persian or modern geometric pattern, velvet or silk cushions), incorporate REFINED ACCESSORIES (crystal table lamps, large framed classical or contemporary art, coffee table books, sculptural vases, fresh flowers in elegant vessels, mirrored or brass decorative objects). LIGHTING: statement crystal or modern designer chandelier, elegant wall sconces in brass/gold, table lamps with silk shades. Maintain functional layout while creating an atmosphere of refined elegance and timeless luxury. PALETTE: cream, ivory, gold accents, navy blue, emerald green, burgundy, rich walnut/mahogany woods, marble whites with grey veining, brass/gold metallic touches. Architecture identical, materials elevated to premium luxury, furniture and decor transformed to high-end sophisticated staging worthy of luxury real estate.`
      })
      .eq('transformation_type', 'renovation_luxe')
      .eq('furniture_mode', 'with');

    if (luxeWithError) throw luxeWithError;
    console.log('   ✅ Prompt Rénovation Luxe (avec meubles) mis à jour\n');

    // 2. Amélioration du prompt Rénovation Luxe (sans meubles)
    console.log('📝 Mise à jour du prompt Rénovation Luxe (sans meubles)...');
    const { error: luxeWithoutError } = await supabase
      .from('transformation_prompts')
      .update({
        prompt_text: `CRITICAL: COMPLETELY EMPTY ROOM REQUIRED. ARCHITECTURAL PRESERVATION: Keep ALL architectural elements EXACTLY — curved walls, straight walls, moldings, window/door openings, ceiling shapes. MATERIALS TRANSFORMATION - LUXURY FOCUS: Install PREMIUM flooring (herringbone parquet in rich walnut or dark oak with satin finish, OR polished Carrara/Calacatta marble with elegant veining, OR natural stone tiles in cream/grey tones), apply REFINED wall treatments (silk or linen wallpaper in subtle damask or geometric patterns, OR leather/fabric upholstered accent panels, OR premium matte paint in sophisticated colors: deep navy, forest green, warm taupe, ivory white), ADD/ENHANCE architectural millwork (ornate crown moldings with decorative details, elegant baseboards in white or subtle gold trim, wainscoting panels in lower third of walls, decorative ceiling roses or medallions). CEILING TREATMENT: install coffered ceiling design with recessed panels, OR smooth premium paint with decorative plaster moldings, add sophisticated lighting (recessed LED spots with dimming, OR elegant chandelier mounting point with decorative ceiling rose). LUXURY LIGHTING FIXTURES: install statement chandelier (crystal, modern brass geometric, or designer piece) as focal point, add elegant wall sconces in brass/gold/chrome finish on either side of focal walls. MANDATORY FURNITURE REMOVAL: REMOVE ALL FURNITURE AND OBJECTS — NO sofas, NO tables, NO chairs, NO rugs, NO curtains, NO decorations, NO movable items. Display ONLY the luxury architectural finishes and premium materials on the bare shell: ornate moldings, premium flooring, refined wall treatments, sophisticated ceiling details, elegant lighting fixtures. THIS IS AN EMPTY LUXURY-FINISHED ROOM showing only premium materials and architectural refinement.`
      })
      .eq('transformation_type', 'renovation_luxe')
      .eq('furniture_mode', 'without');

    if (luxeWithoutError) throw luxeWithoutError;
    console.log('   ✅ Prompt Rénovation Luxe (sans meubles) mis à jour\n');

    // 3. Amélioration du prompt Home Staging Industriel (avec meubles)
    console.log('📝 Mise à jour du prompt Home Staging Industriel (avec meubles)...');
    const { error: industrielWithError } = await supabase
      .from('transformation_prompts')
      .update({
        prompt_text: `ARCHITECTURAL PRESERVATION: Keep EXACT wall positions, ALL openings (windows/doors), ceiling height, room geometry 100% identical. MATERIALS TRANSFORMATION - AUTHENTIC INDUSTRIAL LOFT: Transform walls to INDUSTRIAL finishes (exposed red brick texture with visible mortar joints, OR raw concrete finish with formwork marks and industrial patina, OR painted brick in charcoal grey/dark grey maintaining brick texture, OR combination of brick accent walls with painted concrete), install INDUSTRIAL flooring (wide-plank reclaimed wood in dark stain showing natural wear and knots, OR polished concrete with visible aggregate and subtle cracks sealed, OR large-format dark grey cement tiles 60x60cm), EXPOSE or CREATE industrial ceiling elements (visible black-painted steel I-beams, exposed ductwork and ventilation pipes painted matte black, visible electrical conduits in metal, painted ceiling in dark charcoal or matte black, OR industrial concrete ceiling with rough texture), add METAL industrial details (black metal window frames if visible, metal corner guards, exposed metal baseboards or no baseboards showing raw floor-to-wall junction). FURNITURE STYLE TRANSFORMATION - URBAN LOFT AESTHETIC: Transform existing furniture to INDUSTRIAL LOFT style — replace seating with metal-frame pieces (steel frame sofas with distressed leather cushions in brown/black, metal dining chairs with wood seats, vintage metal stools), update tables to industrial designs (reclaimed wood dining table with visible grain and metal hairpin legs, coffee table made from wood planks on metal frame, metal side tables with riveted details or wheel casters), add INDUSTRIAL LIGHTING (black metal pendant lights with Edison bulbs on fabric cords hanging at various heights, vintage-style metal task lamps, exposed bulb fixtures with metal cages), incorporate URBAN INDUSTRIAL DECOR (metal shelving units with wood planks, vintage industrial clock with metal frame, metal signs or typography, minimal plants in concrete or metal planters, black-and-white urban photography in simple black metal frames). TEXTILES minimal and raw (dark leather, canvas, burlap, minimal grey/black throws). Maintain functional layout while creating authentic urban loft industrial atmosphere. PALETTE: charcoal grey, matte black, exposed brick red-brown, raw concrete grey, dark stained wood, rust/copper metal accents, minimal warm Edison bulb amber light. Architecture unchanged, materials transformed to authentic industrial warehouse aesthetic, furniture and decor transformed to edgy urban loft style.`
      })
      .eq('transformation_type', 'home_staging_industriel')
      .eq('furniture_mode', 'with');

    if (industrielWithError) throw industrielWithError;
    console.log('   ✅ Prompt Home Staging Industriel (avec meubles) mis à jour\n');

    // 4. Amélioration du prompt Home Staging Industriel (sans meubles)
    console.log('📝 Mise à jour du prompt Home Staging Industriel (sans meubles)...');
    const { error: industrielWithoutError } = await supabase
      .from('transformation_prompts')
      .update({
        prompt_text: `CRITICAL: COMPLETELY EMPTY ROOM REQUIRED. ARCHITECTURAL PRESERVATION: Keep ALL architectural geometry EXACTLY as is — walls, windows, doors, ceiling height. MATERIALS TRANSFORMATION - AUTHENTIC INDUSTRIAL LOFT: Transform walls to INDUSTRIAL finishes (exposed red brick with visible mortar joints and industrial patina, OR raw concrete with formwork texture and marks, OR painted brick in charcoal/dark grey maintaining brick relief, OR mix of exposed brick accent wall with raw concrete), install INDUSTRIAL flooring (wide-plank reclaimed wood in dark walnut/espresso stain showing grain and knots, OR polished concrete floor with visible aggregate and sealed micro-cracks for authenticity, OR large-format dark cement tiles 60x60cm+ in anthracite grey), CREATE/EXPOSE industrial ceiling treatment (visible black-painted steel beams and structural elements, exposed HVAC ductwork and pipes painted matte black, visible electrical conduit in black metal, raw concrete ceiling with rough finish, OR painted ceiling in dark charcoal/black maintaining industrial feel). INDUSTRIAL ARCHITECTURAL DETAILS: black metal window frames (if windows present), no baseboards OR minimal black metal baseboards, exposed floor-to-wall junctions, visible metal corner guards or edge protectors. INDUSTRIAL LIGHTING FIXTURES: install dramatic industrial lighting (large black metal pendant lights with Edison bulbs on long fabric-wrapped cords, vintage factory-style lights with metal shades, exposed bulb fixtures with wire cages, track lighting with black metal fixtures). MANDATORY FURNITURE REMOVAL: DELETE ALL FURNITURE AND OBJECTS — NO sofas, NO tables, NO chairs, NO rugs, NO decorations, NO shelving, NO movable items. Display ONLY authentic industrial materials and finishes on the bare architectural shell: exposed brick or concrete walls, dark industrial flooring, black metal structural elements, industrial lighting fixtures, raw urban loft aesthetic. THIS IS AN EMPTY INDUSTRIAL LOFT-FINISHED ROOM showing only raw materials and urban warehouse character.`
      })
      .eq('transformation_type', 'home_staging_industriel')
      .eq('furniture_mode', 'without');

    if (industrielWithoutError) throw industrielWithoutError;
    console.log('   ✅ Prompt Home Staging Industriel (sans meubles) mis à jour\n');

    // 5. Vérification
    console.log('🔍 Vérification des prompts mis à jour...\n');

    const { data: luxePrompts, error: luxeCheckError } = await supabase
      .from('transformation_prompts')
      .select('furniture_mode, prompt_text')
      .eq('transformation_type', 'renovation_luxe')
      .order('furniture_mode');

    if (luxeCheckError) throw luxeCheckError;

    console.log('📋 Prompts Rénovation Luxe:');
    luxePrompts.forEach(prompt => {
      console.log(`   - ${prompt.furniture_mode}: ${prompt.prompt_text.substring(0, 100)}...`);
    });

    const { data: industrielPrompts, error: industrielCheckError } = await supabase
      .from('transformation_prompts')
      .select('furniture_mode, prompt_text')
      .eq('transformation_type', 'home_staging_industriel')
      .order('furniture_mode');

    if (industrielCheckError) throw industrielCheckError;

    console.log('\n📋 Prompts Home Staging Industriel:');
    industrielPrompts.forEach(prompt => {
      console.log(`   - ${prompt.furniture_mode}: ${prompt.prompt_text.substring(0, 100)}...`);
    });

    console.log('\n✅ AMÉLIORATIONS APPLIQUÉES AVEC SUCCÈS !\n');
    console.log('📝 Changements effectués:');
    console.log('   - Rénovation Luxe: Détails enrichis sur matériaux nobles (marbres, parquets, moulures)');
    console.log('   - Rénovation Luxe: Mobilier précisé (velours capitonné, laiton, cristal)');
    console.log('   - Industriel: Authenticité renforcée (briques apparentes, béton brut, métal noir)');
    console.log('   - Industriel: Style loft urbain plus détaillé (Edison, conduits apparents, acier)');

  } catch (error) {
    console.error('❌ Erreur lors de l\'application des améliorations:', error);
    process.exit(1);
  }
}

// Exécuter le script
applyPromptsImprovement();
