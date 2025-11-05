/**
 * Script to query all transformation types and their style palettes
 * Run with: node scripts/query-styles.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function queryStyles() {
  console.log('📊 Querying all transformation types and style palettes...\n');

  // Query transformation types
  const { data: transformationTypes, error: ttError } = await supabase
    .from('transformation_types')
    .select('id, name, slug, category, is_system, is_active')
    .eq('is_system', true)
    .eq('is_active', true)
    .order('name');

  if (ttError) {
    console.error('❌ Error querying transformation_types:', ttError);
    return;
  }

  console.log(`✅ Found ${transformationTypes.length} transformation types:\n`);

  for (const tt of transformationTypes) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📁 ${tt.name} (${tt.slug})`);
    console.log(`   ID: ${tt.id}`);
    console.log(`   Category: ${tt.category || 'N/A'}`);
    console.log(`   Active: ${tt.is_active ? '✅' : '❌'}`);

    // Query style palette for this transformation type
    const { data: palette, error: paletteError } = await supabase
      .from('style_palettes')
      .select('*')
      .eq('transformation_type_id', tt.id)
      .single();

    if (paletteError) {
      console.log(`   ⚠️  NO STYLE PALETTE FOUND`);
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

queryStyles()
  .then(() => {
    console.log('✅ Query complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
