const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkWebhook() {
  console.log('\n🔍 Checking Stripe webhook events...\n');

  // Check recent Stripe events
  const { data: events, error: eventsError } = await supabase
    .from('stripe_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (eventsError) {
    console.log('❌ Error fetching stripe_events:', eventsError.message);
  } else if (!events || events.length === 0) {
    console.log('⚠️  No Stripe events found in database');
    console.log('\n📝 This means either:');
    console.log('   1. Stripe CLI is not running (stripe listen)');
    console.log('   2. The webhook endpoint is not being called');
    console.log('   3. The webhook signature verification is failing\n');
  } else {
    console.log('✅ Found', events.length, 'recent Stripe events:\n');
    events.forEach((event, i) => {
      console.log(`${i + 1}. Event: ${event.event_type}`);
      console.log(`   ID: ${event.stripe_event_id}`);
      console.log(`   Processed: ${event.processed ? '✅' : '❌'}`);
      console.log(`   Created: ${new Date(event.created_at).toLocaleString()}`);
      if (event.error_message) {
        console.log(`   Error: ${event.error_message}`);
      }
      console.log('');
    });
  }

  // Check recent credit transactions
  console.log('\n🔍 Checking credit transactions...\n');

  const { data: transactions, error: txError } = await supabase
    .from('credit_transactions')
    .select('*, users(email)')
    .order('created_at', { ascending: false })
    .limit(10);

  if (txError) {
    console.log('❌ Error fetching transactions:', txError.message);
  } else if (!transactions || transactions.length === 0) {
    console.log('⚠️  No credit transactions found');
  } else {
    console.log('✅ Found', transactions.length, 'recent transactions:\n');
    transactions.forEach((tx, i) => {
      console.log(`${i + 1}. User: ${tx.users?.email || tx.user_id}`);
      console.log(`   Type: ${tx.transaction_type}`);
      console.log(`   Amount: ${tx.amount} credits`);
      console.log(`   Balance after: ${tx.balance_after}`);
      console.log(`   Session: ${tx.stripe_checkout_session_id || 'N/A'}`);
      console.log(`   Created: ${new Date(tx.created_at).toLocaleString()}`);
      console.log('');
    });
  }

  // Check user credits
  console.log('\n🔍 Checking user credits...\n');

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, credits')
    .order('updated_at', { ascending: false })
    .limit(5);

  if (usersError) {
    console.log('❌ Error fetching users:', usersError.message);
  } else if (!users || users.length === 0) {
    console.log('⚠️  No users found');
  } else {
    console.log('✅ Recent users and their credits:\n');
    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.email}`);
      console.log(`   Credits: ${user.credits || 0}`);
      console.log('');
    });
  }
}

checkWebhook().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
