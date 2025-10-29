/**
 * Script pour appliquer les migrations Supabase
 * Usage: node scripts/apply-migrations.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Erreur: NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans .env');
  process.exit(1);
}

async function executeSql(sql, migrationName) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`);

    // Utiliser l'endpoint SQL direct de Supabase
    const apiUrl = `${SUPABASE_URL}/rest/v1/`;

    const postData = JSON.stringify({ query: sql });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`\n📝 Exécution de ${migrationName}...`);
    console.log(`URL: ${SUPABASE_URL}`);

    // Pour exécuter du SQL avec Supabase, on doit utiliser une fonction RPC
    // Créons d'abord la fonction, puis exécutons le SQL

    // Approche alternative: utiliser directement psql ou le dashboard
    console.log(`\n⚠️  Ce script nécessite l'API Management de Supabase.`);
    console.log(`\n📋 Pour appliquer cette migration, copiez le SQL ci-dessous:`);
    console.log(`\n${'='.repeat(80)}`);
    console.log(sql);
    console.log(`${'='.repeat(80)}\n`);

    resolve();
  });
}

async function applyMigrations() {
  console.log('🚀 Application des migrations Supabase\n');

  const migrationsDir = path.join(__dirname, '../supabase/migrations');

  // Lire tous les fichiers de migration
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`📁 ${migrationFiles.length} migration(s) trouvée(s):\n`);

  for (const file of migrationFiles) {
    const migrationPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    try {
      await executeSql(sql, file);
      console.log(`✅ ${file} - SQL préparé\n`);
    } catch (error) {
      console.error(`❌ Erreur lors de ${file}:`, error.message);
      console.log('\n⚠️  Continuez avec le dashboard Supabase\n');
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📖 INSTRUCTIONS:');
  console.log('='.repeat(80));
  console.log('\n1. Ouvrir le dashboard Supabase:');
  console.log(`   ${SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/')}`);
  console.log('\n2. Aller dans SQL Editor (icône </> dans le menu)');
  console.log('\n3. Pour chaque migration ci-dessus:');
  console.log('   - Créer une "New query"');
  console.log('   - Copier/coller le SQL affiché');
  console.log('   - Cliquer "Run" (ou Ctrl+Enter)');
  console.log('   - Vérifier qu\'il n\'y a pas d\'erreur');
  console.log('\n4. Vérifier que les tables sont créées:');
  console.log('   - Aller dans "Table Editor"');
  console.log('   - Vous devriez voir 15 tables');
  console.log('\n' + '='.repeat(80));
  console.log('\n✨ Ou utilisez cette méthode plus rapide:\n');
  console.log('   npx supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"\n');
}

applyMigrations().catch(console.error);
