const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testCreditDeduction() {
  console.log('\n🧪 Test de déduction de crédits\n');

  // 1. Vérifier les crédits actuels de l'utilisateur
  const { data: users } = await supabase
    .from('users')
    .select('id, email, credits')
    .limit(1);

  if (!users || users.length === 0) {
    console.log('❌ Aucun utilisateur trouvé');
    return;
  }

  const user = users[0];
  console.log(`👤 Utilisateur: ${user.email}`);
  console.log(`💰 Crédits actuels: ${user.credits || 0}\n`);

  // 2. Simuler une déduction de crédit
  console.log('🔄 Simulation de déduction de 1 crédit...\n');

  const { data: transactionId, error } = await supabase.rpc('deduct_user_credits', {
    p_user_id: user.id,
    p_amount: 1,
    p_reference_type: 'image',
    p_reference_id: '00000000-0000-0000-0000-000000000000', // Fake ID pour test
    p_description: 'Test de génération d\'image',
  });

  if (error) {
    console.log('❌ Erreur lors de la déduction:', error.message);
    if (error.message.includes('Insufficient credits')) {
      console.log('\n💡 L\'utilisateur n\'a pas assez de crédits.');
      console.log('   Achetez des crédits sur /dashboard/credits\n');
    }
    return;
  }

  console.log('✅ Crédit déduit avec succès!');
  console.log(`   Transaction ID: ${transactionId}\n`);

  // 3. Vérifier le nouveau solde
  const { data: updatedUser } = await supabase
    .from('users')
    .select('credits')
    .eq('id', user.id)
    .single();

  console.log(`💰 Nouveau solde: ${updatedUser.credits} crédits\n`);

  // 4. Afficher la dernière transaction
  const { data: transaction } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('id', transactionId)
    .single();

  if (transaction) {
    console.log('📊 Détails de la transaction:');
    console.log(`   Type: ${transaction.transaction_type}`);
    console.log(`   Montant: ${transaction.amount}`);
    console.log(`   Solde après: ${transaction.balance_after}`);
    console.log(`   Description: ${transaction.description}`);
    console.log(`   Date: ${new Date(transaction.created_at).toLocaleString()}\n`);
  }

  console.log('✅ Test terminé!\n');
}

testCreditDeduction().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
