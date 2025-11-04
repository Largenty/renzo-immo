const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkStructure() {
  console.log('\n🔍 Checking table structure...\n');

  // Check credit_transactions table
  const { data, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .limit(1);

  if (error) {
    console.log('❌ Error fetching from credit_transactions:', error.message);

    // Try to check if table exists at all
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%credit%');

    if (!tableError && tables) {
      console.log('\n📋 Available credit-related tables:', tables.map(t => t.table_name));
    }
  } else {
    if (data && data.length > 0) {
      console.log('✅ Table exists! Sample record:');
      console.log(JSON.stringify(data[0], null, 2));
      console.log('\n📊 Available columns:', Object.keys(data[0]));
    } else {
      console.log('⚠️  Table exists but is empty. Let me check the columns...');

      // Check columns via metadata
      const { data: sample } = await supabase
        .from('credit_transactions')
        .select('*')
        .limit(0);

      console.log('Checking schema...');
    }
  }

  // Check users table for credits column
  console.log('\n🔍 Checking users table for credits column...');
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, credits')
    .limit(1);

  if (userError) {
    console.log('❌ Error:', userError.message);
  } else {
    console.log('✅ Users table has credits column');
    if (userData && userData.length > 0) {
      console.log('Sample:', userData[0]);
    }
  }
}

checkStructure().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
