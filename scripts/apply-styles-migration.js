const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

(async () => {
  console.log('📊 Checking current state...\n');

  const { data: existing, error: checkError } = await supabase
    .from('transformation_types')
    .select('slug, name, is_system, user_id')
    .order('is_system', { ascending: false });

  if (checkError) {
    console.error('❌ Error checking existing data:', checkError.message);
    process.exit(1);
  }

  console.log('Found', existing?.length || 0, 'existing transformation types:');
  console.log('  - System styles:', existing?.filter(s => s.is_system).length || 0);
  console.log('  - Custom styles:', existing?.filter(s => !s.is_system).length || 0);

  const customStyles = existing?.filter(s => !s.is_system) || [];
  if (customStyles.length > 0) {
    console.log('\n📌 Custom styles found (will be preserved):');
    customStyles.forEach(s => {
      console.log(`   • ${s.name} (user: ${s.user_id?.substring(0, 8)}...)`);
    });
  }

  console.log('\n🗑️  Deleting only system styles...');
  const { error: deleteError } = await supabase
    .from('transformation_types')
    .delete()
    .eq('is_system', true);

  if (deleteError) {
    console.error('❌ Error deleting system styles:', deleteError.message);
    process.exit(1);
  }

  console.log('✅ System styles deleted\n');
  console.log('✨ Creating new system styles...\n');

  const systemStyles = [
    { slug: 'depersonnalisation', name: 'Dépersonnalisation', description: 'Retire les éléments personnels pour une présentation neutre', icon_name: 'Home', category: 'depersonalization', allow_furniture_toggle: false, is_system: true, is_active: true, allow_room_type_selection: true, credit_cost: 1, order_index: 1 },
    { slug: 'depersonnalisation_premium', name: 'Dépersonnalisation Premium', description: 'Dépersonnalisation avancée avec optimisation lumière', icon_name: 'Sparkles', category: 'depersonalization', allow_furniture_toggle: false, is_system: true, is_active: true, allow_room_type_selection: true, credit_cost: 2, order_index: 2 },
    { slug: 'home_staging_moderne', name: 'Home Staging Moderne', description: 'Mobilier contemporain épuré aux lignes minimalistes', icon_name: 'Sofa', category: 'staging', allow_furniture_toggle: true, is_system: true, is_active: true, allow_room_type_selection: true, credit_cost: 3, order_index: 3 },
    { slug: 'home_staging_scandinave', name: 'Home Staging Scandinave', description: 'Style scandinave chaleureux et hygge', icon_name: 'Coffee', category: 'staging', allow_furniture_toggle: true, is_system: true, is_active: true, allow_room_type_selection: true, credit_cost: 3, order_index: 4 },
    { slug: 'home_staging_industriel', name: 'Home Staging Industriel', description: 'Style industriel avec matériaux bruts et métal', icon_name: 'Factory', category: 'staging', allow_furniture_toggle: true, is_system: true, is_active: true, allow_room_type_selection: true, credit_cost: 3, order_index: 5 },
    { slug: 'home_staging_contemporain', name: 'Home Staging Contemporain', description: 'Design actuel avec touches de couleurs vives', icon_name: 'Palette', category: 'staging', allow_furniture_toggle: true, is_system: true, is_active: true, allow_room_type_selection: true, credit_cost: 3, order_index: 6 },
    { slug: 'home_staging_classique', name: 'Home Staging Classique Chic', description: 'Élégance intemporelle avec moulures et matériaux nobles', icon_name: 'Crown', category: 'staging', allow_furniture_toggle: true, is_system: true, is_active: true, allow_room_type_selection: true, credit_cost: 3, order_index: 7 },
    { slug: 'home_staging_nature', name: 'Home Staging Nature', description: 'Ambiance naturelle avec bois brut et tons terreux', icon_name: 'Leaf', category: 'staging', allow_furniture_toggle: true, is_system: true, is_active: true, allow_room_type_selection: true, credit_cost: 3, order_index: 8 },
    { slug: 'home_staging_minimaliste', name: 'Home Staging Minimaliste', description: 'Épuré extrême, couleurs neutres, peu d\'objets', icon_name: 'Minus', category: 'staging', allow_furniture_toggle: true, is_system: true, is_active: true, allow_room_type_selection: true, credit_cost: 3, order_index: 9 },
    { slug: 'home_staging_mediterraneen', name: 'Home Staging Méditerranéen', description: 'Blanc éclatant avec touches de bleu et terracotta', icon_name: 'Sun', category: 'staging', allow_furniture_toggle: true, is_system: true, is_active: true, allow_room_type_selection: true, credit_cost: 3, order_index: 10 },
    { slug: 'home_staging_boheme', name: 'Home Staging Bohème', description: 'Chaleureux et éclectique avec textiles et plantes', icon_name: 'Flower', category: 'staging', allow_furniture_toggle: true, is_system: true, is_active: true, allow_room_type_selection: true, credit_cost: 3, order_index: 11 },
    { slug: 'renovation_luxe', name: 'Rénovation Luxe', description: 'Transformation haut de gamme avec matériaux nobles', icon_name: 'Crown', category: 'renovation', allow_furniture_toggle: false, is_system: true, is_active: true, allow_room_type_selection: true, credit_cost: 5, order_index: 12 },
    { slug: 'renovation_contemporaine', name: 'Rénovation Contemporaine', description: 'Rénovation moderne et épurée', icon_name: 'Paintbrush', category: 'renovation', allow_furniture_toggle: false, is_system: true, is_active: true, allow_room_type_selection: true, credit_cost: 4, order_index: 13 },
    { slug: 'style_personnalise', name: 'Style Personnalisé', description: 'Créez votre propre style avec un prompt personnalisé', icon_name: 'Wand', category: 'custom', allow_furniture_toggle: false, is_system: true, is_active: true, allow_room_type_selection: true, credit_cost: 1, order_index: 14 },
  ];

  const { data: created, error: insertError } = await supabase
    .from('transformation_types')
    .insert(systemStyles)
    .select();

  if (insertError) {
    console.error('❌ Error creating system styles:', insertError.message);
    process.exit(1);
  }

  console.log('✅ Created', created?.length || 0, 'system styles\n');

  // Vérification finale
  const { data: final } = await supabase
    .from('transformation_types')
    .select('slug, name, is_system')
    .order('is_system', { ascending: false })
    .order('order_index', { ascending: true });

  console.log('📊 Final state:');
  console.log('  - Total styles:', final?.length || 0);
  console.log('  - System styles:', final?.filter(s => s.is_system).length || 0);
  console.log('  - Custom styles:', final?.filter(s => !s.is_system).length || 0);
  console.log('\n✨ System styles:');
  final?.filter(s => s.is_system).forEach(s => {
    console.log(`   • ${s.name} (${s.slug})`);
  });
  console.log('\n🎨 Custom styles:');
  const customs = final?.filter(s => !s.is_system) || [];
  if (customs.length === 0) {
    console.log('   (none yet)');
  } else {
    customs.forEach(s => {
      console.log(`   • ${s.name} (${s.slug})`);
    });
  }
})();
