#!/usr/bin/env node

/**
 * Script pour ajouter les politiques RLS manquantes sur room_specifications
 * Permet aux utilisateurs de créer, modifier et supprimer leurs propres rooms
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function addRLSPolicies() {
  console.log('🔧 Ajout des politiques RLS pour room_specifications...\n')

  const migrationPath = path.join(__dirname, '../other/supabase/add_room_specifications_rls_policies.sql')
  const sql = fs.readFileSync(migrationPath, 'utf-8')

  try {
    // Exécuter le SQL via RPC ou directement
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // Si la fonction RPC n'existe pas, on essaie d'exécuter chaque policy séparément
      console.log('⚠️  Fonction exec_sql non disponible, application manuelle...\n')

      // Politique INSERT
      console.log('📝 Ajout de la politique INSERT...')
      const { error: insertError } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE POLICY IF NOT EXISTS policy_room_specifications_insert
            ON room_specifications FOR INSERT TO authenticated
            WITH CHECK (user_id = auth.uid() AND is_active = TRUE);
        `
      })

      if (insertError) {
        console.error('❌ Erreur INSERT policy:', insertError.message)
      } else {
        console.log('✅ Politique INSERT ajoutée')
      }

      // Politique UPDATE
      console.log('📝 Ajout de la politique UPDATE...')
      const { error: updateError } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE POLICY IF NOT EXISTS policy_room_specifications_update
            ON room_specifications FOR UPDATE TO authenticated
            USING (user_id = auth.uid())
            WITH CHECK (user_id = auth.uid());
        `
      })

      if (updateError) {
        console.error('❌ Erreur UPDATE policy:', updateError.message)
      } else {
        console.log('✅ Politique UPDATE ajoutée')
      }

      // Politique DELETE
      console.log('📝 Ajout de la politique DELETE...')
      const { error: deleteError } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE POLICY IF NOT EXISTS policy_room_specifications_delete
            ON room_specifications FOR DELETE TO authenticated
            USING (user_id = auth.uid());
        `
      })

      if (deleteError) {
        console.error('❌ Erreur DELETE policy:', deleteError.message)
      } else {
        console.log('✅ Politique DELETE ajoutée')
      }

      console.log('\n⚠️  Si des erreurs persistent, il faut appliquer le SQL manuellement via le Dashboard Supabase')
      console.log('📄 Fichier SQL:', migrationPath)
      return
    }

    console.log('✅ Politiques RLS ajoutées avec succès!')
    console.log('   - INSERT: Utilisateurs peuvent créer leurs propres rooms')
    console.log('   - UPDATE: Utilisateurs peuvent modifier leurs propres rooms')
    console.log('   - DELETE: Utilisateurs peuvent supprimer leurs propres rooms')

  } catch (err) {
    console.error('❌ Erreur lors de l\'application des politiques:', err)
    console.log('\n💡 Solution alternative:')
    console.log('   1. Ouvrir le Dashboard Supabase')
    console.log('   2. Aller dans SQL Editor')
    console.log('   3. Copier-coller le contenu du fichier:')
    console.log('      ' + migrationPath)
    console.log('   4. Exécuter le SQL')
    process.exit(1)
  }
}

// Vérifier les politiques existantes
async function checkPolicies() {
  console.log('🔍 Vérification des politiques existantes...\n')

  const { data, error } = await supabase
    .from('pg_policies')
    .select('policyname, cmd')
    .eq('tablename', 'room_specifications')

  if (error) {
    console.log('⚠️  Impossible de vérifier les politiques (erreur attendue si table pg_policies non accessible)')
    return
  }

  if (data && data.length > 0) {
    console.log('📋 Politiques actuelles sur room_specifications:')
    data.forEach(policy => {
      console.log(`   - ${policy.policyname} (${policy.cmd})`)
    })
    console.log('')
  }
}

// Exécuter
;(async () => {
  try {
    await checkPolicies()
    await addRLSPolicies()
  } catch (err) {
    console.error('❌ Erreur fatale:', err)
    process.exit(1)
  }
})()
