#!/usr/bin/env node

/**
 * Check if room_specifications table has user_id column
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRoomTable() {
  console.log('🔍 Checking room_specifications table...\n');

  try {
    // Try to select with user_id column
    const { data, error } = await supabase
      .from('room_specifications')
      .select('id, room_type, user_id, display_name_fr')
      .limit(3);

    if (error) {
      if (error.message.includes('column') && error.message.includes('user_id')) {
        console.log('❌ Column user_id does NOT exist');
        console.log('\n📝 You need to apply migration: 20251030_add_user_ownership_to_furniture_rooms.sql');
        console.log('\nManual steps:');
        console.log('1. Go to https://supabase.com/dashboard');
        console.log('2. Select your project');
        console.log('3. Go to SQL Editor');
        console.log('4. Copy and paste the migration file');
        console.log('5. Run the SQL');
        return false;
      }
      throw error;
    }

    console.log('✅ Column user_id exists!');
    console.log('\n📊 Sample data:');
    data?.forEach(room => {
      console.log(`  - ${room.display_name_fr} (${room.room_type}) - user_id: ${room.user_id || 'default'}`);
    });

    return true;
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    return false;
  }
}

checkRoomTable()
  .then(success => process.exit(success ? 0 : 1));
