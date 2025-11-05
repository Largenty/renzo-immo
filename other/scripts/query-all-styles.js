/**
 * Script to query ALL transformation types (including non-system, inactive)
 * Run with: node scripts/query-all-styles.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function queryAllStyles() {
  console.log('📊 Querying ALL transformation types (no filters)...\n');

  // Query ALL transformation types
  const { data: transformationTypes, error: ttError } = await supabase
    .from('transformation_types')
    .select('id, name, slug, category, is_system, is_active')
    .order('name');

  if (ttError) {
    console.error('❌ Error querying transformation_types:', ttError);
    return;
  }

  console.log(`✅ Found ${transformationTypes.length} transformation types:\n`);

  // Group by status
  const systemActive = transformationTypes.filter(t => t.is_system && t.is_active);
  const systemInactive = transformationTypes.filter(t => t.is_system && !t.is_active);
  const userStyles = transformationTypes.filter(t => !t.is_system);

  console.log(`📊 Summary:`);
  console.log(`   • System Active: ${systemActive.length}`);
  console.log(`   • System Inactive: ${systemInactive.length}`);
  console.log(`   • User Styles: ${userStyles.length}\n`);

  for (const tt of transformationTypes) {
    const status = tt.is_system ? '🏢' : '👤';
    const active = tt.is_active ? '✅' : '❌';
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`${status} ${tt.name} (${tt.slug}) ${active}`);
    console.log(`   ID: ${tt.id}`);
    console.log(`   Category: ${tt.category || 'N/A'}`);
    console.log(`   System: ${tt.is_system}, Active: ${tt.is_active}`);

    // Query style palette for this transformation type
    const { data: palette, error: paletteError } = await supabase
      .from('style_palettes')
      .select('*')
      .eq('transformation_type_id', tt.id)
      .single();

    if (paletteError) {
      console.log(`   ⚠️  NO STYLE PALETTE FOUND (Error: ${paletteError.code})`);
    } else {
      console.log(`   \n   🎨 STYLE PALETTE:`);
      console.log(`      • Walls: ${palette.wall_colors?.join(', ') || 'N/A'}`);
      console.log(`      • Floor: ${palette.floor_materials?.join(', ') || 'N/A'}`);
      console.log(`      • Accents: ${palette.accent_colors?.join(', ') || 'N/A'}`);
      console.log(`      • Materials: ${palette.materials?.join(', ') || 'N/A'}`);
      console.log(`      • Ambiance: ${palette.ambiance_keywords?.join(', ') || 'N/A'}`);
      console.log(`      • Lighting: ${palette.lighting_style || 'N/A'}`);
      console.log(`      • Instructions: ${palette.general_instructions || 'N/A'}`);
    }
    console.log('');
  }

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

queryAllStyles()
  .then(() => {
    console.log('✅ Query complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
