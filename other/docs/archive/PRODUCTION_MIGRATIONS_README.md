# 🚀 Migrations Production - Guide d'Application

**Date:** 2025-01-30
**Statut:** Prêt pour application
**Environnement cible:** Supabase Production

---

## 📋 Vue d'ensemble

Ces migrations modernisent la base de données pour:
- ✅ Éliminer les redondances avec `auth.users`
- ✅ Garantir la cohérence des montants (centimes)
- ✅ Sécuriser le système de crédits (ledger immuable)
- ✅ Améliorer la robustesse des webhooks (idempotence)
- ✅ Sécuriser Supabase Storage (RLS)

---

## ⚠️ IMPORTANT: Avant de commencer

### 1. Backup complet
```bash
# Via Supabase Dashboard: Settings > Database > Backup
# Ou via CLI:
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Environnement de test
- ✅ Appliquer d'abord sur environnement de **staging**
- ✅ Tester toutes les fonctionnalités
- ✅ Valider que l'app fonctionne normalement
- ⚠️ Seulement après: appliquer en **production**

### 3. Mode maintenance (recommandé)
```typescript
// Activer mode maintenance pendant les migrations
// Bloquer temporairement l'accès utilisateur
```

---

## 📦 Migrations à Appliquer (dans l'ordre)

### Phase 1: Migrations Essentielles (OBLIGATOIRE)

| # | Fichier | Durée | Risque | Rollback |
|---|---------|-------|--------|----------|
| 1 | `PRODUCTION_001_auth_cleanup.sql` | ~5 min | 🟢 Faible | Difficile |
| 2 | `PRODUCTION_002_amounts_in_cents.sql` | ~10 min | 🟡 Moyen | Facile |
| 3 | `PRODUCTION_003_credits_ledger.sql` | ~15 min | 🔴 Élevé | Difficile |
| 4 | `PRODUCTION_004_images_idempotence.sql` | ~5 min | 🟢 Faible | Facile |
| 5 | `PRODUCTION_005_storage_policies.sql` | ~5 min | 🟡 Moyen | Facile |

**Temps total estimé:** 40 minutes

---

## 🔧 Instructions d'Application

### Migration 1: Auth Cleanup

**Objectif:** Supprimer les redondances avec `auth.users`

**Pré-requis:**
- Aucun code ne lit `password_hash`, `two_factor_*`, `email_verified` depuis `public.users`

**Étapes:**
1. Ouvrir Supabase SQL Editor
2. Copier-coller le contenu de `PRODUCTION_001_auth_cleanup.sql`
3. Exécuter
4. Vérifier les logs (doit afficher "FK créée", "Colonnes supprimées")

**Vérifications post-migration:**
```sql
-- Doit retourner 0
SELECT COUNT(*) FROM public.users
WHERE id NOT IN (SELECT id FROM auth.users);

-- Doit retourner 0 lignes
SELECT column_name FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('password_hash', 'two_factor_enabled', 'email_verified');

-- Doit retourner 1 ligne
SELECT tgname FROM pg_trigger WHERE tgname = 'trg_auth_users_email_sync';
```

**Rollback (si nécessaire):**
```sql
-- Impossible de restaurer password_hash (perdu)
-- Recréer les colonnes vides:
ALTER TABLE public.users
  ADD COLUMN email_verified BOOLEAN DEFAULT false,
  ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false;
```

---

### Migration 2: Montants en Centimes

**Objectif:** Conversion DECIMAL → INTEGER (centimes)

**Pré-requis:**
- Avoir un backup récent (conversion irréversible avec perte de précision)

**Étapes:**
1. Copier-coller `PRODUCTION_002_amounts_in_cents.sql`
2. Exécuter
3. Les anciennes colonnes DECIMAL sont **conservées** pour transition douce

**Vérifications post-migration:**
```sql
-- Vérifier conversion invoices
SELECT
  invoice_number,
  amount_total,
  amount_total_cents,
  amount_total_cents::NUMERIC / 100 AS reconverted
FROM public.invoices
LIMIT 5;
-- Les colonnes reconverted et amount_total doivent être identiques

-- Vérifier vues
SELECT * FROM public.v_invoices_display LIMIT 1;
SELECT * FROM public.v_credit_packs_display;
```

**Migration du code TypeScript (À FAIRE APRÈS):**

```typescript
// ❌ AVANT
const invoice = {
  amount_total: 19.99,
  amount_subtotal: 16.66,
  amount_tax: 3.33
};

// ✅ APRÈS
const invoice = {
  amount_total_cents: 1999,
  amount_subtotal_cents: 1666,
  amount_tax_cents: 333
};

// Affichage UI
const priceEur = invoice.amount_total_cents / 100;
return `${priceEur.toFixed(2)}€`;
```

**Suppression anciennes colonnes (APRÈS migration code complète):**
```sql
-- NE PAS FAIRE MAINTENANT
-- À faire dans 1-2 semaines quand le code est migré:
-- ALTER TABLE public.invoices DROP COLUMN amount_total;
-- ALTER TABLE public.invoices DROP COLUMN amount_subtotal;
-- ALTER TABLE public.invoices DROP COLUMN amount_tax;
```

---

### Migration 3: Crédits Ledger (CRITIQUE)

**Objectif:** Transformation en ledger immuable avec fonctions atomiques

**⚠️ ATTENTION:** Cette migration change la logique métier des crédits

**Pré-requis:**
- Comprendre que `INSERT/UPDATE/DELETE` directs seront interdits
- Tout le code doit passer par les fonctions RPC

**Étapes:**
1. Copier-coller `PRODUCTION_003_credits_ledger.sql`
2. Exécuter
3. **IMMÉDIATEMENT** migrer le code pour utiliser les RPC

**Vérifications post-migration:**
```sql
-- Vérifier les policies (doit retourner des lignes)
SELECT tablename, policyname, permissive, roles
FROM pg_policies
WHERE tablename = 'credit_transactions';

-- Vérifier le solde d'un user (remplacer UUID)
SELECT * FROM v_user_credits_balance
WHERE user_id = 'votre-user-uuid';

-- Tester consommation (doit fonctionner)
SELECT * FROM sp_consume_credits(
  'user-uuid'::uuid,
  1,
  'test',
  gen_random_uuid(),
  'Test migration'
);
```

**Migration du code TypeScript (OBLIGATOIRE):**

```typescript
// ❌ AVANT (NE FONCTIONNE PLUS)
await supabase.from('credit_transactions').insert({
  user_id: userId,
  type: 'debit',
  amount: -1,
  balance_after: newBalance,
  description: 'Génération image'
});

// ✅ APRÈS (OBLIGATOIRE)
const { data, error } = await supabase.rpc('sp_consume_credits', {
  p_user_id: userId,
  p_amount: 1,
  p_reference_type: 'image',
  p_reference_id: imageId,
  p_description: 'Génération image HD'
});

if (error) {
  if (error.message.includes('Insufficient credits')) {
    // Gérer le cas: pas assez de crédits
  }
  throw error;
}

const newBalance = data[0].new_balance;
```

**Pour ajouter des crédits:**
```typescript
const { data } = await supabase.rpc('sp_add_credits', {
  p_user_id: userId,
  p_amount: 10,
  p_type: 'credit',
  p_reference_type: 'pack',
  p_reference_id: packId,
  p_description: 'Achat Pack Starter'
});
```

**Pour lire le solde:**
```typescript
const { data } = await supabase.rpc('fn_get_user_credits_balance', {
  p_user_id: userId
});
const balance = data; // INTEGER
```

**Rollback (difficile):**
```sql
-- Restaurer les droits directs (temporaire, pour debug)
GRANT INSERT ON credit_transactions TO authenticated;

-- Supprimer les policies
DROP POLICY policy_credit_transactions_read ON credit_transactions;
```

---

### Migration 4: Images Idempotence

**Objectif:** Éviter duplications webhook + valider transitions statuts

**Pré-requis:**
- Aucun (sécurise juste le comportement existant)

**Étapes:**
1. Copier-coller `PRODUCTION_004_images_idempotence.sql`
2. Exécuter
3. Aucune modification de code requise

**Vérifications post-migration:**
```sql
-- Vérifier contrainte unique
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'uq_images_nano_request_id';

-- Voir les images bloquées (si présent)
SELECT * FROM v_images_stuck_processing;

-- Tester transition invalide (doit échouer)
-- UPDATE public.images SET status = 'processing'
-- WHERE status = 'completed' LIMIT 1;
-- Attendu: ERROR
```

**Utilisation dans webhook:**
```typescript
// Webhook NanoBanana
const { data } = await supabase.rpc('fn_get_image_by_nano_request_id', {
  p_nano_request_id: webhookPayload.requestId
});

if (data.length === 0) {
  // Image déjà traitée (idempotence) ou requestId invalide
  return { ok: true, message: 'Already processed' };
}

// Continuer le traitement...
```

---

### Migration 5: Storage Policies

**Objectif:** Sécuriser Supabase Storage avec RLS

**⚠️ ATTENTION:** Peut bloquer l'accès aux fichiers si mal configuré

**Pré-requis:**
- Structure de paths Storage cohérente: `{user_id}/{project_id}/{image_id}/file.jpg`

**Étapes:**
1. **D'ABORD:** Vérifier la structure actuelle de vos paths Storage
2. Adapter la migration si nécessaire
3. Copier-coller `PRODUCTION_005_storage_policies.sql`
4. Exécuter
5. **IMMÉDIATEMENT** tester l'upload/download de fichiers

**Vérifications post-migration:**
```sql
-- Lister policies storage
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'objects';

-- Voir fichiers user courant (connecté)
SELECT * FROM v_user_storage_files LIMIT 10;
```

**Test dans le code:**
```typescript
// Upload (doit fonctionner)
const userId = session.user.id;
const filePath = `${userId}/${projectId}/${imageId}/original.jpg`;
const { data, error } = await supabase.storage
  .from('project-images')
  .upload(filePath, file);

// Download privé (URL signée)
const { data } = await supabase.rpc('fn_get_signed_url', {
  p_bucket_id: 'project-images',
  p_path: filePath,
  p_expires_in: 3600
});
console.log(data); // URL signée valide 1h
```

**Rollback (si bloque l'accès):**
```sql
-- Supprimer toutes les policies temporairement
DROP POLICY IF EXISTS policy_project_images_read ON storage.objects;
DROP POLICY IF EXISTS policy_project_images_insert ON storage.objects;
DROP POLICY IF EXISTS policy_project_images_update ON storage.objects;
DROP POLICY IF EXISTS policy_project_images_delete ON storage.objects;
-- Répéter pour avatars et temp-uploads
```

---

## 🧪 Plan de Test Post-Migration

### 1. Test Auth
- [ ] Inscription nouveau user
- [ ] Connexion user existant
- [ ] Vérification email via Supabase
- [ ] Profil utilisateur chargé correctement

### 2. Test Crédits (CRITIQUE)
- [ ] Lecture du solde: `fn_get_user_credits_balance()`
- [ ] Consommation: `sp_consume_credits()`
- [ ] Ajout: `sp_add_credits()`
- [ ] Test double-spend (2 requêtes simultanées)
- [ ] Vérifier qu'un INSERT direct échoue

### 3. Test Images
- [ ] Upload image
- [ ] Génération transformation
- [ ] Webhook NanoBanana idempotent (envoyer 2x le même requestId)
- [ ] Vérifier transition de statuts invalide bloquée
- [ ] Vérifier `processing_duration_ms` calculé automatiquement

### 4. Test Storage
- [ ] Upload fichier dans project-images
- [ ] Lecture fichier par propriétaire
- [ ] Lecture fichier par non-propriétaire (doit échouer)
- [ ] Upload avatar
- [ ] Génération URL signée

### 5. Test Montants
- [ ] Affichage prix en euros (diviser par 100)
- [ ] Calcul montant pour Stripe (multiplier par 100)
- [ ] Facture avec TVA correcte

---

## 📊 Monitoring Post-Migration

### Requêtes de monitoring à exécuter régulièrement

```sql
-- 1. Images bloquées en processing
SELECT * FROM v_images_stuck_processing;

-- 2. Stats performance images
SELECT * FROM v_images_processing_stats
ORDER BY date DESC LIMIT 7;

-- 3. Crédits négatifs (ne devrait jamais arriver)
SELECT user_id, balance
FROM v_user_credits_balance
WHERE balance < 0;

-- 4. Fichiers storage par bucket
SELECT
  bucket_id,
  COUNT(*) as file_count,
  SUM(COALESCE((metadata->>'size')::bigint, 0)) / 1024 / 1024 AS total_mb
FROM storage.objects
GROUP BY bucket_id;

-- 5. Transactions crédits récentes
SELECT
  user_id,
  type,
  amount,
  balance_after,
  description,
  created_at
FROM credit_transactions
ORDER BY created_at DESC
LIMIT 20;
```

---

## 🚨 En Cas de Problème

### Problème: App ne fonctionne plus

1. **Vérifier les logs Supabase:**
   - Dashboard > Logs > Postgres Logs
   - Chercher les erreurs SQL

2. **Rollback de sécurité:**
   ```bash
   # Restaurer le backup
   psql -h db.xxx.supabase.co -U postgres -d postgres < backup_YYYYMMDD.sql
   ```

3. **Contact:**
   - Slack: #tech-support
   - Email: dev@renzo-immobilier.com

### Problème: Crédits bloqués

```sql
-- Vérifier les policies
SELECT * FROM pg_policies WHERE tablename = 'credit_transactions';

-- Vérifier qu'une transaction est bien créée
SELECT * FROM credit_transactions
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC
LIMIT 5;

-- En dernier recours: réautoriser les INSERT temporairement
GRANT INSERT ON credit_transactions TO authenticated;
```

### Problème: Storage inaccessible

```sql
-- Lister les policies actuelles
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'objects';

-- Désactiver temporairement toutes les policies
DROP POLICY IF EXISTS policy_project_images_read ON storage.objects;
-- Répéter pour toutes les policies

-- Tester accès
SELECT * FROM storage.objects WHERE bucket_id = 'project-images' LIMIT 1;
```

---

## ✅ Checklist Finale

Avant de valider la migration en production:

- [ ] Backup complet créé
- [ ] Migrations testées sur staging
- [ ] Code TypeScript migré (crédits RPC)
- [ ] Code TypeScript migré (montants centimes)
- [ ] Tests manuels passés
- [ ] Mode maintenance activé
- [ ] Migrations appliquées en production
- [ ] Vérifications post-migration OK
- [ ] Tests en production OK
- [ ] Mode maintenance désactivé
- [ ] Monitoring actif (vérifier 24h après)

---

## 📝 Notes Importantes

1. **Ne PAS supprimer les anciennes colonnes DECIMAL immédiatement**
   - Attendre 1-2 semaines
   - Vérifier que tout fonctionne
   - Puis exécuter les DROP COLUMN

2. **users.credits_remaining est DEPRECATED**
   - Ne plus utiliser dans le code
   - Utiliser `fn_get_user_credits_balance()` à la place
   - Sera supprimé dans une future migration

3. **Storage paths doivent être cohérents**
   - Toujours: `{user_id}/{project_id}/{image_id}/filename`
   - Si structure différente: adapter les policies

4. **Advisory locks = protection double-spend**
   - Les fonctions `sp_consume_credits` et `sp_add_credits` sont thread-safe
   - Même avec 100 requêtes simultanées

---

**Date de création:** 2025-01-30
**Auteur:** Équipe Renzo Immobilier
**Version:** 1.0
