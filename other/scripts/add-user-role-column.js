/**
 * Script pour ajouter la colonne role à la table users
 * Usage: node scripts/add-user-role-column.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addRoleColumn() {
  console.log('🔧 Adding role column to users table...\n');

  try {
    // Exécuter la migration SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Vérifier si la colonne existe déjà
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'users'
                AND column_name = 'role'
            ) THEN
                -- Ajouter la colonne role
                ALTER TABLE users
                ADD COLUMN role VARCHAR(50) DEFAULT 'user'
                CHECK (role IN ('user', 'admin'));

                RAISE NOTICE 'Column "role" added successfully';
            ELSE
                RAISE NOTICE 'Column "role" already exists';
            END IF;
        END $$;

        -- Créer l'index
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

        -- Ajouter le commentaire
        COMMENT ON COLUMN users.role IS 'User role: user (default) or admin';
      `
    });

    if (error) {
      // Si exec_sql n'existe pas, essayer directement avec le client admin
      console.log('⚠️  RPC exec_sql not available, trying direct SQL...\n');

      // Malheureusement, Supabase JS client ne permet pas d'exécuter du DDL directement
      // Il faut utiliser psql ou le dashboard Supabase
      console.log('📋 Instructions pour appliquer manuellement:');
      console.log('');
      console.log('1. Aller sur https://supabase.com/dashboard');
      console.log('2. Sélectionner votre projet');
      console.log('3. Aller dans "SQL Editor"');
      console.log('4. Exécuter le SQL suivant:\n');
      console.log('```sql');
      console.log('-- Ajouter la colonne role');
      console.log('ALTER TABLE users');
      console.log("ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'");
      console.log("CHECK (role IN ('user', 'admin'));");
      console.log('');
      console.log('-- Créer l\'index');
      console.log('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);');
      console.log('');
      console.log('-- Ajouter le commentaire');
      console.log("COMMENT ON COLUMN users.role IS 'User role: user (default) or admin';");
      console.log('```\n');
      console.log('5. Pour créer un admin, exécuter:');
      console.log('```sql');
      console.log("UPDATE users SET role = 'admin' WHERE email = 'votre-email@example.com';");
      console.log('```\n');

      process.exit(0);
    }

    console.log('✅ Migration appliquée avec succès!\n');

    // Vérifier que la colonne a été créée
    const { data: users, error: selectError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(1);

    if (selectError) {
      console.log('⚠️  Impossible de vérifier la colonne:', selectError.message);
    } else {
      console.log('✅ Colonne "role" vérifiée et accessible\n');
    }

    console.log('📝 Prochaine étape: Créer votre premier admin');
    console.log('   Exécuter dans le SQL Editor:');
    console.log("   UPDATE users SET role = 'admin' WHERE email = 'votre-email@example.com';");

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

addRoleColumn();
