#!/usr/bin/env node

/**
 * Script to verify the showcase migration was applied successfully
 * Checks if new columns and functions exist in the database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyMigration() {
  console.log('🔍 Verifying migration...\n');

  try {
    // Test 1: Check if display_name column exists in users table
    console.log('1️⃣  Checking users.display_name column...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, display_name')
      .limit(1);

    if (usersError) {
      console.error('   ❌ FAILED - display_name column does not exist');
      console.error('   Error:', usersError.message);
      return false;
    }
    console.log('   ✅ users.display_name exists');

    // Test 2: Check if new project columns exist
    console.log('\n2️⃣  Checking projects columns (slug, is_public, view_count)...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, slug, is_public, view_count, last_viewed_at')
      .limit(1);

    if (projectsError) {
      console.error('   ❌ FAILED - One or more columns do not exist');
      console.error('   Error:', projectsError.message);
      return false;
    }
    console.log('   ✅ projects.slug exists');
    console.log('   ✅ projects.is_public exists');
    console.log('   ✅ projects.view_count exists');
    console.log('   ✅ projects.last_viewed_at exists');

    // Test 3: Check if increment_view_count function exists
    console.log('\n3️⃣  Testing increment_view_count() function...');
    if (projects && projects[0]) {
      const { error: rpcError } = await supabase.rpc('increment_view_count', {
        project_id: projects[0].id
      });

      if (rpcError && rpcError.message.includes('function') && rpcError.message.includes('does not exist')) {
        console.error('   ❌ FAILED - increment_view_count function does not exist');
        console.error('   Error:', rpcError.message);
        return false;
      }
      console.log('   ✅ increment_view_count() function exists');
    } else {
      console.log('   ⚠️  SKIPPED - No projects to test with');
    }

    // Test 4: Check if public_projects view exists
    console.log('\n4️⃣  Checking public_projects view...');
    const { error: viewError } = await supabase
      .from('public_projects')
      .select('id')
      .limit(1);

    if (viewError && viewError.message.includes('does not exist')) {
      console.error('   ❌ FAILED - public_projects view does not exist');
      console.error('   Error:', viewError.message);
      return false;
    }
    console.log('   ✅ public_projects view exists');

    console.log('\n✅ All migration checks passed!');
    console.log('\n📊 Sample data:');
    if (users && users[0]) {
      console.log(`   User display_name: ${users[0].display_name || '(not set yet)'}`);
    }
    if (projects && projects[0]) {
      console.log(`   Project slug: ${projects[0].slug || '(not set yet)'}`);
      console.log(`   Project is_public: ${projects[0].is_public}`);
      console.log(`   Project view_count: ${projects[0].view_count}`);
    }

    return true;
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    return false;
  }
}

verifyMigration()
  .then(success => process.exit(success ? 0 : 1));
