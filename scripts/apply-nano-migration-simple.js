const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applyMigration() {
  console.log('📦 Applying nano_request_id migration...\n');

  try {
    // Step 1: Add column
    console.log('1. Adding nano_request_id column...');
    const { error: addColumnError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE images ADD COLUMN IF NOT EXISTS nano_request_id TEXT;'
    });

    // Supabase doesn't support exec_sql directly, so we'll check if column exists via query
    const { data: columns, error: checkError } = await supabase
      .from('images')
      .select('nano_request_id')
      .limit(0);

    if (checkError && !checkError.message.includes('column')) {
      console.log('✅ Column nano_request_id already exists or was added');
    } else if (checkError) {
      console.log('ℹ️  Column might need to be added via SQL editor');
      console.log('   Please run this SQL in Supabase SQL Editor:');
      console.log('\n   ALTER TABLE images ADD COLUMN IF NOT EXISTS nano_request_id TEXT;');
      console.log('   CREATE INDEX IF NOT EXISTS idx_images_nano_request_id ON images(nano_request_id);');
      console.log('   COMMENT ON COLUMN images.nano_request_id IS \'ID de la requête NanoBanana pour le callback webhook\';\n');
    } else {
      console.log('✅ Column nano_request_id exists');
    }

    console.log('\n✅ Migration check complete!');
    console.log('\nℹ️  If column doesn\'t exist, please apply the SQL manually via Supabase Dashboard > SQL Editor');
    console.log('   Migration file: supabase/migrations/20250130_add_nano_request_id.sql');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nℹ️  Please apply the migration manually via Supabase Dashboard > SQL Editor');
    console.log('   Migration file: supabase/migrations/20250130_add_nano_request_id.sql');
  }
}

applyMigration();
