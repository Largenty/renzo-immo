# 🚀 CONFIGURATION RAPIDE - RÔLES ADMIN

## Étape 1: Ajouter la colonne `role` (2 minutes)

### Option A: Via Supabase Dashboard (Recommandé)

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet **renzo-immo**
3. Cliquer sur **"SQL Editor"** dans le menu gauche
4. Cliquer sur **"New Query"**
5. Copier-coller ce SQL:

```sql
-- Ajouter la colonne role
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'
CHECK (role IN ('user', 'admin'));

-- Créer l'index pour performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Ajouter le commentaire
COMMENT ON COLUMN users.role IS 'User role: user (default) or admin';
```

6. Cliquer sur **"Run"** (ou Ctrl+Enter)
7. Vérifier que vous voyez: `Success. No rows returned`

### Option B: Via CLI Supabase (Si configuré)

```bash
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  -f supabase/migrations/20251030222859_add_user_roles.sql
```

---

## Étape 2: Créer votre premier admin (1 minute)

### Dans Supabase SQL Editor:

1. Ouvrir le **SQL Editor** sur Supabase Dashboard
2. Exécuter cette requête (remplacer par votre email):

```sql
-- Voir vos utilisateurs actuels
SELECT id, email, role FROM users;

-- Promouvoir un utilisateur en admin (REMPLACER L'EMAIL)
UPDATE users
SET role = 'admin'
WHERE email = 'votre-email@example.com';

-- Vérifier
SELECT id, email, role FROM users WHERE role = 'admin';
```

✅ Vous devriez voir votre utilisateur avec `role = 'admin'`

---

## Étape 3: Configurer le Webhook Secret (1 minute)

Ajouter à votre fichier `.env`:

```bash
# Webhook NanoBanana Security
NANOBANANA_WEBHOOK_SECRET=votre_secret_partagé_avec_nanobanana
```

**Comment générer un secret sécurisé:**

```bash
# Option 1: OpenSSL
openssl rand -hex 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

📝 **Important:** Partagez ce secret avec NanoBanana pour qu'ils signent leurs webhooks

---

## Étape 4: Vérifier que tout fonctionne (2 minutes)

### Test 1: Vérifier votre rôle admin

```bash
# Essayer de créer un meuble
curl -X POST http://localhost:3000/api/furniture \
  -H "Content-Type: application/json" \
  -H "Cookie: [VOTRE_COOKIE_AUTH]" \
  -d '{
    "category": "seating",
    "room_types": ["salon"],
    "name_fr": "Test Admin",
    "name_en": "Test Admin",
    "is_essential": false,
    "priority": 50
  }'

# Attendu si vous êtes admin: 201 Created
# Attendu si vous n'êtes pas admin: 403 Forbidden
```

### Test 2: Vérifier le dashboard

1. Se connecter sur `/dashboard`
2. Aller sur `/dashboard/furniture`
3. Cliquer sur **"Ajouter un meuble"**
4. Remplir le formulaire
5. Si vous êtes admin → ça fonctionne ✅
6. Si vous n'êtes pas admin → Erreur 403 ❌

---

## 🔧 Troubleshooting

### Erreur: "column role does not exist"

➡️ La migration n'a pas été appliquée. Retourner à l'Étape 1.

### Erreur: "Forbidden: Admin rights required"

➡️ Votre utilisateur n'est pas admin. Vérifier avec:

```sql
SELECT email, role FROM users WHERE id = 'votre-user-id';
```

Si `role` est `NULL` ou `'user'`:

```sql
UPDATE users SET role = 'admin' WHERE id = 'votre-user-id';
```

### Comment trouver mon user ID?

```sql
-- Par email
SELECT id, email, role FROM users WHERE email = 'votre@email.com';

-- Tous les users
SELECT id, email, role, created_at FROM users ORDER BY created_at DESC;
```

### Le webhook retourne 401

➡️ Vérifier que `NANOBANANA_WEBHOOK_SECRET` est configuré dans `.env`

```bash
# Vérifier
node -e "require('dotenv').config(); console.log('Secret:', process.env.NANOBANANA_WEBHOOK_SECRET ? 'Configuré ✅' : 'Manquant ❌')"
```

---

## 📋 Checklist Finale

Avant de tester en prod:

- [ ] Colonne `role` ajoutée à la table `users`
- [ ] Au moins 1 utilisateur avec `role = 'admin'`
- [ ] Variable `NANOBANANA_WEBHOOK_SECRET` dans `.env`
- [ ] Test création meuble réussi en tant qu'admin
- [ ] Test création meuble échoue en tant que user normal
- [ ] Webhook NanoBanana configuré avec le secret

---

## 🎯 Résumé SQL Complet

Si vous préférez tout faire d'un coup dans le SQL Editor:

```sql
-- 1. Ajouter la colonne role
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'
CHECK (role IN ('user', 'admin'));

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

COMMENT ON COLUMN users.role IS 'User role: user (default) or admin';

-- 2. Voir tous les utilisateurs
SELECT id, email, role, created_at FROM users ORDER BY created_at DESC;

-- 3. Promouvoir un utilisateur en admin (REMPLACER L'EMAIL)
UPDATE users SET role = 'admin' WHERE email = 'VOTRE_EMAIL_ICI@example.com';

-- 4. Vérifier les admins
SELECT id, email, role FROM users WHERE role = 'admin';
```

---

**Temps total:** ~5 minutes
**Difficulté:** Facile ⭐

Une fois terminé, vos APIs seront sécurisées! 🔒
