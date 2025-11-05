const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('🔍 Checking transformation_types table...\n');

  // Récupérer tous les styles
  const { data: allStyles, error: allError } = await supabase
    .from('transformation_types')
    .select('id, name, slug, is_system, user_id, is_active')
    .order('is_system', { ascending: false })
    .order('created_at', { ascending: false });

  if (allError) {
    console.error('❌ Error:', allError.message);
    process.exit(1);
  }

  console.log('📊 Total styles:', allStyles?.length || 0);
  console.log('📊 System styles:', allStyles?.filter(s => s.is_system).length || 0);
  console.log('📊 Custom styles:', allStyles?.filter(s => !s.is_system).length || 0);
  console.log('\n🔍 Custom styles details:');

  const customStyles = allStyles?.filter(s => !s.is_system) || [];
  if (customStyles.length === 0) {
    console.log('   ⚠️  No custom styles found in database');
  } else {
    customStyles.forEach(style => {
      console.log(`   - ${style.name} (slug: ${style.slug}, user_id: ${style.user_id?.substring(0, 8)}...)`);
    });
  }

  console.log('\n🔍 System styles:');
  const systemStyles = allStyles?.filter(s => s.is_system) || [];
  systemStyles.forEach(style => {
    console.log(`   - ${style.name} (slug: ${style.slug})`);
  });
})();
