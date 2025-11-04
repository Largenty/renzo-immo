import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verify() {
  console.log('\n📊 Vérification des packs de crédits en base de données:\n');

  const { data, error } = await supabase
    .from('credit_packs')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ Pack              │ Crédits │ Prix     │ €/crédit │ Popular │ Active │');
  console.log('├─────────────────────────────────────────────────────────────────────────────┤');

  data.forEach((pack: any) => {
    const price = (pack.price_cents / 100).toFixed(2);
    const perCredit = (pack.price_cents / 100 / pack.credits).toFixed(3);
    const popular = pack.popular ? '✓' : ' ';
    const active = pack.is_active ? '✓' : ' ';

    console.log(`│ ${pack.name.padEnd(17)} │ ${String(pack.credits).padStart(7)} │ ${(price + '€').padStart(8)} │ ${(perCredit + '€').padStart(8)} │ ${popular.padStart(7)} │ ${active.padStart(6)} │`);
  });

  console.log('└─────────────────────────────────────────────────────────────────────────────┘');
  console.log(`\n✅ Total: ${data.length} packs créés`);
  console.log(`💰 Total crédits disponibles: ${data.reduce((sum: number, p: any) => sum + p.credits, 0)}`);
  console.log(`💵 Prix total: ${(data.reduce((sum: number, p: any) => sum + p.price_cents, 0) / 100).toFixed(2)}€\n`);
}

verify().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
