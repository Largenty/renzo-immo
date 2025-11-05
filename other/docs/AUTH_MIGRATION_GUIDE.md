# Guide : Appliquer la migration OAuth

## 🎯 Objectif

Appliquer la migration `20251101_fix_oauth_users_schema.sql` qui:
1. Ajoute la colonne `auth_provider` (email, google, etc.)
2. Rend `password_hash` nullable pour les utilisateurs OAuth
3. Ajoute une contrainte CHECK pour la cohérence

## ⚠️ Prérequis

Le code dans `app/auth/callback/route.ts` utilise ces colonnes:
- `auth_provider` (ligne 103)
- `password_hash` peut être NULL (ligne 102)

**Sans cette migration, l'authentification Google va échouer !**

---

## 📝 Méthode 1: Supabase Dashboard (Recommandé)

### Étapes:

1. **Aller sur le Dashboard Supabase**
   ```
   https://supabase.com/dashboard/project/rbtosufegzicxvenwtpt
   ```

2. **Ouvrir le SQL Editor**
   - Menu gauche → "SQL Editor"
   - Cliquer sur "+ New query"

3. **Copier le SQL**
   - Ouvrir le fichier: `/home/ludo/dev/renzo-immo/supabase/migrations/20251101_fix_oauth_users_schema.sql`
   - Copier tout le contenu

4. **Exécuter**
   - Coller dans l'éditeur SQL
   - Cliquer sur "Run" (ou Ctrl+Enter)

5. **Vérifier le succès**
   ```sql
   -- Vérifier que auth_provider existe
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'users'
     AND column_name IN ('auth_provider', 'password_hash');
   ```

   **Résultat attendu:**
   ```
   column_name    | data_type         | is_nullable
   ---------------|-------------------|-------------
   auth_provider  | character varying | NO
   password_hash  | character varying | YES  ← Doit être YES
   ```

---

## 📝 Méthode 2: Supabase CLI (Alternative)

### Prérequis CLI:
```bash
# Installer la CLI si pas déjà fait
npm install -g supabase

# Login
npx supabase login
```

### Appliquer la migration:

```bash
cd /home/ludo/dev/renzo-immo

# Option A: Push toutes les migrations
npx supabase db push

# Option B: Exécuter cette migration spécifique
npx supabase db execute --file supabase/migrations/20251101_fix_oauth_users_schema.sql
```

---

## ✅ Vérification Post-Migration

### 1. Vérifier le schéma

```sql
-- Dans le SQL Editor de Supabase
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('password_hash', 'auth_provider', 'credits_remaining')
ORDER BY column_name;
```

**Résultat attendu:**
```
column_name       | data_type         | is_nullable | column_default
------------------|-------------------|-------------|------------------
auth_provider     | character varying | NO          | 'email'::character varying
credits_remaining | integer           | NO          | 0
password_hash     | character varying | YES         | NULL
```

### 2. Vérifier la contrainte CHECK

```sql
SELECT
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'users'
  AND con.conname LIKE '%password%';
```

**Résultat attendu:**
```
constraint_name                    | constraint_definition
-----------------------------------|----------------------------------------------------
check_password_hash_for_email_auth | CHECK (((auth_provider = 'email'::text) AND ...))
```

### 3. Vérifier l'index

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'users'
  AND indexname = 'idx_users_auth_provider';
```

**Résultat attendu:**
```
indexname                 | indexdef
--------------------------|--------------------------------------------------
idx_users_auth_provider   | CREATE INDEX idx_users_auth_provider ON ...
```

---

## 🧪 Test après migration

### Test 1: Créer un utilisateur email/password

```sql
-- Devrait fonctionner (password_hash requis pour email)
INSERT INTO users (
  id, email, first_name, last_name,
  password_hash, auth_provider, credits_remaining
)
VALUES (
  'test-email-123',
  'test@example.com',
  'Test',
  'User',
  'hashed_password_here',
  'email',
  5
);
```

### Test 2: Créer un utilisateur OAuth

```sql
-- Devrait fonctionner (password_hash NULL pour google)
INSERT INTO users (
  id, email, first_name, last_name,
  password_hash, auth_provider, credits_remaining
)
VALUES (
  'test-google-456',
  'google@example.com',
  'Google',
  'User',
  NULL,  -- NULL OK pour OAuth
  'google',
  5
);
```

### Test 3: Tentative invalide (devrait échouer)

```sql
-- Devrait ÉCHOUER (password_hash NULL pour email)
INSERT INTO users (
  id, email, first_name, last_name,
  password_hash, auth_provider, credits_remaining
)
VALUES (
  'test-invalid-789',
  'invalid@example.com',
  'Invalid',
  'User',
  NULL,  -- ❌ NULL interdit pour auth_provider='email'
  'email',
  5
);
-- Erreur attendue: check constraint "check_password_hash_for_email_auth"
```

### Nettoyage des tests:

```sql
DELETE FROM users WHERE email LIKE 'test%@example.com';
DELETE FROM users WHERE email LIKE 'google@example.com';
DELETE FROM users WHERE email LIKE 'invalid@example.com';
```

---

## 🔄 Rollback (si besoin)

Si tu veux annuler la migration:

```sql
-- 1. Supprimer la contrainte CHECK
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_password_hash_for_email_auth;

-- 2. Remettre password_hash NOT NULL (attention: échoue si des NULLs existent)
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;

-- 3. Supprimer l'index
DROP INDEX IF EXISTS idx_users_auth_provider;

-- 4. Supprimer la colonne auth_provider
ALTER TABLE users DROP COLUMN IF EXISTS auth_provider;
```

---

## 📊 Métriques de succès

| Vérification | Statut | Commande |
|-------------|--------|----------|
| ✅ Colonne `auth_provider` existe | ⏳ | Voir SQL ci-dessus |
| ✅ `password_hash` nullable | ⏳ | Voir SQL ci-dessus |
| ✅ Contrainte CHECK présente | ⏳ | Voir SQL ci-dessus |
| ✅ Index créé | ⏳ | Voir SQL ci-dessus |
| ✅ Test insert OAuth OK | ⏳ | Voir tests ci-dessus |

---

## 🆘 Troubleshooting

### Erreur: "column auth_provider already exists"

```sql
-- La migration a déjà été appliquée
SELECT column_name FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'auth_provider';

-- Si elle existe déjà, vérifier juste qu'elle est correcte
```

### Erreur: "cannot drop constraint password_hash NOT NULL because column contains null values"

```sql
-- Des utilisateurs OAuth existent déjà avec NULL password_hash
-- Option 1: Mettre une valeur temporaire
UPDATE users SET password_hash = 'oauth_placeholder'
WHERE password_hash IS NULL;

-- Puis relancer la migration
```

### Erreur: "check constraint is violated by some row"

```sql
-- Identifier les lignes problématiques
SELECT id, email, auth_provider, password_hash
FROM users
WHERE (auth_provider = 'email' AND password_hash IS NULL)
   OR (auth_provider != 'email' AND password_hash IS NOT NULL);

-- Corriger manuellement avant d'appliquer la contrainte
```

---

## 📞 Support

Si tu rencontres des problèmes:
1. Copier l'erreur exacte
2. Vérifier le schéma actuel avec les SQL de vérification
3. Consulter les logs Supabase Dashboard → Logs

---

**Date de création:** 2025-11-01
**Version:** 1.0.0
