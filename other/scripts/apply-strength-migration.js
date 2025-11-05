const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv/config');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  console.log('\n🔧 Applying strength column migration...\n');

  const migrationPath = path.join(__dirname, '../supabase/migrations/20251104_add_strength_column.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Try alternative method: direct SQL execution
      console.log('⚠️  RPC method failed, trying direct SQL execution...\n');

      const queries = sql.split(';').filter(q => q.trim());

      for (const query of queries) {
        if (query.trim()) {
          const { error: queryError } = await supabase.from('_').rpc('exec', { query: query.trim() });

          if (queryError) {
            console.log('❌ Error:', queryError.message);

            // Manual query execution as fallback
            console.log('\n📝 Please run this SQL manually in Supabase SQL Editor:\n');
            console.log('═'.repeat(60));
            console.log(sql);
            console.log('═'.repeat(60));
            console.log('\n✅ Once applied manually, the migration is complete.\n');
            return;
          }
        }
      }

      console.log('✅ Migration applied successfully!\n');
    } else {
      console.log('✅ Migration applied successfully!\n');
    }
  } catch (err) {
    console.error('❌ Fatal error:', err);
    console.log('\n📝 Please run this SQL manually in Supabase SQL Editor:\n');
    console.log('═'.repeat(60));
    console.log(sql);
    console.log('═'.repeat(60));
    console.log('\n');
  }
}

applyMigration().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
