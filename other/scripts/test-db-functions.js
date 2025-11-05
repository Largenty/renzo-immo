const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testFunctions() {
  console.log('\n🔍 Testing database functions...\n');

  // Test 1: get_user_credits
  console.log('1️⃣ Testing get_user_credits...');
  const { data: credits, error: creditsError } = await supabase.rpc('get_user_credits', {
    p_user_id: '00000000-0000-0000-0000-000000000000'
  });

  if (creditsError) {
    console.log('   ❌ Error:', creditsError.message);
  } else {
    console.log('   ✅ Works! Result:', credits);
  }

  // Test 2: get_credit_stats
  console.log('\n2️⃣ Testing get_credit_stats...');
  const { data: stats, error: statsError } = await supabase.rpc('get_credit_stats', {
    p_user_id: '00000000-0000-0000-0000-000000000000'
  });

  if (statsError) {
    console.log('   ❌ Error:', statsError.message);
    console.log('   Details:', JSON.stringify(statsError, null, 2));
  } else {
    console.log('   ✅ Works! Result:', stats);
  }

  // Test 3: get_weekly_stats
  console.log('\n3️⃣ Testing get_weekly_stats...');
  const { data: weekly, error: weeklyError } = await supabase.rpc('get_weekly_stats', {
    p_user_id: '00000000-0000-0000-0000-000000000000'
  });

  if (weeklyError) {
    console.log('   ❌ Error:', weeklyError.message);
    console.log('   Details:', JSON.stringify(weeklyError, null, 2));
  } else {
    console.log('   ✅ Works! Result:', weekly);
  }

  console.log('\n✅ Test complete!\n');
}

testFunctions().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
