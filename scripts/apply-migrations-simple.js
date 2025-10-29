/**
 * Script simplifié pour afficher les migrations à copier dans Supabase Dashboard
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(80));
console.log('🗄️  MIGRATIONS SUPABASE - RENZO IMMOBILIER');
console.log('='.repeat(80) + '\n');

const migrationsDir = path.join(__dirname, '../supabase/migrations');
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

console.log(`📁 ${migrationFiles.length} migration(s) trouvée(s)\n`);

migrationFiles.forEach((file, index) => {
  const migrationPath = path.join(migrationsDir, file);
  const sql = fs.readFileSync(migrationPath, 'utf8');
  const lines = sql.split('\n').length;

  console.log(`${index + 1}. ${file} (${lines} lignes)`);
});

console.log('\n' + '='.repeat(80));
console.log('📖 COMMENT APPLIQUER LES MIGRATIONS:');
console.log('='.repeat(80) + '\n');

console.log('Option 1 - Via le Dashboard Supabase (RECOMMANDÉ):');
console.log('────────────────────────────────────────────────\n');
console.log('1. Ouvrir: https://supabase.com/dashboard/project/rbtosufegzicxvenwtpt');
console.log('2. Aller dans "SQL Editor" (icône </>)');
console.log('3. Pour chaque migration:');
console.log('   → Cliquer "New query"');
console.log('   → Ouvrir le fichier supabase/migrations/XXX.sql');
console.log('   → Copier TOUT le contenu');
console.log('   → Coller dans l\'éditeur SQL');
console.log('   → Cliquer "Run" (ou Ctrl+Enter)');
console.log('   → Attendre "Success" ✅\n');

console.log('⚠️  ORDRE IMPORTANT:');
console.log('   1️⃣  001_initial_schema.sql   (tables, triggers, views)');
console.log('   2️⃣  002_rls_policies.sql     (sécurité RLS)');
console.log('   3️⃣  003_storage_buckets.sql  (buckets storage)\n');

console.log('\n' + '='.repeat(80));
console.log('✅ VÉRIFICATION:');
console.log('='.repeat(80) + '\n');

console.log('Après avoir appliqué les migrations:');
console.log('1. Table Editor → Voir 15 tables');
console.log('2. Storage → Voir 3 buckets (images, avatars, styles)');
console.log('3. Authentication → Policies → Voir les RLS policies');
console.log('\nDonnées initiales créées:');
console.log('  • 3 subscription_plans (Starter, Pro, Agence)');
console.log('  • 4 credit_packs');
console.log('  • 8 transformation_types (styles système)\n');

console.log('='.repeat(80) + '\n');
