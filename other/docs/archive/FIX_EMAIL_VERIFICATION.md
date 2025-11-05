# Fix Email Verification - Supabase

## ❌ Problème
La colonne `email_confirmed_at` n'existe pas dans auth.users de Supabase.

## ✅ Solution : Utiliser confirmed_at

Supabase utilise la colonne **`confirmed_at`** (pas `email_confirmed_at`).

---

## 🔧 CORRECTION RAPIDE

### Méthode 1 : SQL Direct (RECOMMANDÉ)

Dans Supabase SQL Editor :

```sql
-- Vérifier manuellement l'email
UPDATE auth.users 
SET confirmed_at = NOW()
WHERE email = 'votre-email@example.com';
```

### Méthode 2 : Via Dashboard

1. Aller sur https://supabase.com/dashboard
2. **Authentication** → **Users**
3. Trouver votre utilisateur
4. Cliquer sur **⋮** (3 points)
5. **Confirm email** ou **Verify email**

---

## 🐛 BUG DANS LE CODE

Notre code utilise `user.email_confirmed_at` mais Supabase utilise `user.confirmed_at`.

### Fichiers à corriger :

1. **src/lib/supabase/middleware.ts** (ligne 60)
2. **app/api/generate-image/route.ts** (ligne 41)
3. **app/api/check-generation-status/route.ts** (ligne 44)
4. **app/auth/verify-email/page.tsx** (ligne 21)

Remplacer :
```typescript
// ❌ ANCIEN (incorrect)
if (!user.email_confirmed_at) { ... }

// ✅ NOUVEAU (correct)
if (!user.confirmed_at) { ... }
```

---

## 📝 Vérification rapide

Vous pouvez vérifier quelle colonne existe avec :

```sql
-- Liste des colonnes dans auth.users
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'users';
```

Résultat attendu : `confirmed_at`, pas `email_confirmed_at`

---

**Je vais corriger le code maintenant.**
