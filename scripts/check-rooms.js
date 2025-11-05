const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('🔍 Checking room_specifications table...\n');

  // Récupérer toutes les rooms
  const { data: allRooms, error: allError } = await supabase
    .from('room_specifications')
    .select('id, display_name_fr, room_type, user_id, is_active')
    .order('user_id', { ascending: true, nullsFirst: true });

  if (allError) {
    console.error('❌ Error:', allError.message);
    process.exit(1);
  }

  console.log('📊 Total rooms:', allRooms?.length || 0);
  console.log('📊 System rooms (user_id = null):', allRooms?.filter(r => !r.user_id).length || 0);
  console.log('📊 Custom rooms (user_id != null):', allRooms?.filter(r => r.user_id).length || 0);

  console.log('\n🏠 System rooms (default):');
  const systemRooms = allRooms?.filter(r => !r.user_id) || [];
  if (systemRooms.length === 0) {
    console.log('   ⚠️  No system rooms found - database needs to be populated!');
  } else {
    systemRooms.forEach(room => {
      console.log(`   • ${room.display_name_fr} (type: ${room.room_type})`);
    });
  }

  console.log('\n🎨 Custom rooms (user-created):');
  const customRooms = allRooms?.filter(r => r.user_id) || [];
  if (customRooms.length === 0) {
    console.log('   (none yet)');
  } else {
    customRooms.forEach(room => {
      console.log(`   • ${room.display_name_fr} (user: ${room.user_id?.substring(0, 8)}...)`);
    });
  }
})();
