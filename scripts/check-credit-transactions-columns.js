const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkColumns() {
  console.log('\n🔍 Checking credit_transactions table structure...\n');

  // Method 1: Try to insert a dummy record to see what columns are required
  const { data, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .limit(0);

  if (error) {
    console.log('❌ Table might not exist:', error.message);
    return;
  }

  console.log('✅ Table exists but is empty\n');

  // Method 2: Check via information_schema
  console.log('📋 Querying column information from information_schema...\n');

  // We'll use a raw SQL query through RPC
  const query = `
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'credit_transactions'
    ORDER BY ordinal_position;
  `;

  console.log('Run this query in Supabase SQL Editor to see the columns:');
  console.log('-----------------------------------------------------------');
  console.log(query);
  console.log('-----------------------------------------------------------\n');

  // Try to query using a different approach
  const { data: tables } = await supabase
    .from('pg_tables')
    .select('*')
    .eq('tablename', 'credit_transactions');

  if (tables && tables.length > 0) {
    console.log('✅ Table is registered in pg_tables');
  }
}

checkColumns().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
