/**
 * Test database connection and count rows
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Environment check:');
console.log('   URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('   KEY:', supabaseKey ? `✅ Set (${supabaseKey.substring(0, 20)}...)` : '❌ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('\n📡 Testing database connection...\n');

  // Simple count query
  const { data, error, count } = await supabase
    .from('transformation_types')
    .select('*', { count: 'exact', head: false });

  if (error) {
    console.error('❌ Error:', error.message);
    console.error('   Code:', error.code);
    console.error('   Details:', error.details);
    console.error('   Hint:', error.hint);
    return;
  }

  console.log(`✅ Connection successful!`);
  console.log(`   Found ${data?.length || 0} rows in transformation_types table\n`);

  if (data && data.length > 0) {
    console.log('📋 Data sample:');
    data.forEach((row, i) => {
      console.log(`\n   ${i + 1}. ${row.name} (${row.slug})`);
      console.log(`      • System: ${row.is_system}`);
      console.log(`      • Active: ${row.is_active}`);
      console.log(`      • Category: ${row.category}`);
    });
  } else {
    console.log('⚠️  No data found in transformation_types table');
    console.log('   This might indicate:');
    console.log('   1. The initial migration hasn\'t been run');
    console.log('   2. RLS policies are blocking access');
    console.log('   3. The table is actually empty');
  }
}

testConnection()
  .then(() => {
    console.log('\n✅ Test complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
