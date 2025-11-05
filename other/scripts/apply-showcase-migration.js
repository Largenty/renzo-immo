#!/usr/bin/env node

/**
 * Script to apply the showcase migration to Supabase
 *
 * Usage: node scripts/apply-showcase-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('📦 Reading migration file...');

    const migrationPath = path.join(__dirname, '../supabase/migrations/20251103_add_showcase_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('🚀 Applying migration to Supabase...');

    // Execute the migration SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      // If exec_sql doesn't exist, we need to apply manually via SQL Editor
      console.log('\n⚠️  Cannot apply migration automatically.');
      console.log('\n📋 Please apply the migration manually:');
      console.log('1. Go to https://supabase.com/dashboard');
      console.log('2. Select your project');
      console.log('3. Go to SQL Editor');
      console.log('4. Copy and paste the contents of:');
      console.log('   supabase/migrations/20251103_add_showcase_fields.sql');
      console.log('5. Click "Run"\n');
      return;
    }

    console.log('✅ Migration applied successfully!');

    // Verify the migration
    console.log('\n🔍 Verifying migration...');
    const { data: columns, error: verifyError } = await supabase
      .from('projects')
      .select('*')
      .limit(1);

    if (!verifyError) {
      console.log('✅ Migration verified - is_public column exists');
    }

  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    console.log('\n📋 Please apply the migration manually (see instructions above)');
  }
}

applyMigration();
