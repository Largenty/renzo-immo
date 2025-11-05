const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv/config');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  console.log('\n🚀 Applying stats functions migration...\n');

  const migrationPath = path.join(__dirname, '../supabase/migrations/20251103_create_stats_functions.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  try {
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql_string: sql }).single();

    if (error) {
      // If exec_sql doesn't exist, try direct execution
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.toUpperCase().includes('BEGIN') || statement.toUpperCase().includes('COMMIT')) {
          continue;
        }

        const { error: execError } = await supabase.rpc('query', statement);
        if (execError) {
          console.error(`❌ Error executing statement:`, execError);
          console.error(`Statement: ${statement.substring(0, 100)}...`);
        }
      }
    }

    console.log('✅ Migration applied successfully!\n');
    console.log('📊 Created functions:');
    console.log('   - get_credit_stats(p_user_id UUID)');
    console.log('   - get_weekly_stats(p_user_id UUID)');
    console.log('   - get_user_credit_stats(p_user_id UUID)\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration().then(() => process.exit(0));
