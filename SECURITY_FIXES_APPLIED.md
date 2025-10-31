# 🔒 CORRECTIONS DE SÉCURITÉ APPLIQUÉES

## Date: 2025-10-30
## Version: 1.0.0

---

## ✅ CORRECTIONS COMPLÉTÉES

### 1. Webhook NanoBanana sécurisé ✅

**Fichier:** `/app/api/nanobanana-webhook/route.ts`

**Corrections appliquées:**
- ✅ Validation HMAC de la signature avec `verifyNanoBananaWebhook()`
- ✅ Validation Zod du payload avec `nanoBananaWebhookSchema`
- ✅ Vérification du header `x-nanobanana-signature`
- ✅ Retour 401 si signature invalide

**Configuration requise:**
Ajouter à `.env`:
```bash
NANOBANANA_WEBHOOK_SECRET=votre_secret_partagé_avec_nanobanana
```

**Test:**
```bash
# ❌ Sans signature - doit échouer
curl -X POST http://localhost:3000/api/nanobanana-webhook \
  -H "Content-Type: application/json" \
  -d '{"requestId":"test","status":"completed"}'

# ✅ Avec signature valide - doit réussir
curl -X POST http://localhost:3000/api/nanobanana-webhook \
  -H "Content-Type: application/json" \
  -H "x-nanobanana-signature: sha256=SIGNATURE_CALCULÉE" \
  -d '{"requestId":"uuid-valide","status":"completed"}'
```

---

### 2. Routes Furniture sécurisées ✅

**Fichiers modifiés:**
- `/app/api/furniture/route.ts` - POST ✅
- `/app/api/furniture/[id]/route.ts` - PATCH ✅, DELETE ✅

**Corrections appliquées:**
- ✅ Check admin avec `requireAdmin()` avant toute opération CRUD
- ✅ Retour 403 Forbidden si l'utilisateur n'est pas admin
- ✅ Logs des tentatives d'accès non autorisées

**Comportement:**
```typescript
// ✅ Utilisateur admin → peut créer/modifier/supprimer
// ❌ Utilisateur normal → 403 Forbidden
// ❌ Non authentifié → 401 Unauthorized
```

---

### 3. Fonction helper admin créée ✅

**Fichier:** `/src/lib/auth/check-admin.ts`

**Fonctions disponibles:**
```typescript
// Vérifie si user est admin
await isUserAdmin(supabase, userId)

// Vérifie admin + retourne response 403 si non-admin
const adminCheck = await requireAdmin(supabase, user.id)
if (!adminCheck.isAdmin) return adminCheck.response!

// Vérifie ownership d'une ressource
await checkResourceOwnership(supabase, 'projects', projectId, userId)
```

---

### 4. Validateurs webhook créés ✅

**Fichier:** `/src/lib/validators/webhook-validators.ts`

**Schémas Zod:**
```typescript
nanoBananaWebhookSchema // Valide payload webhook
```

---

### 5. Sécurité webhook créée ✅

**Fichier:** `/src/lib/webhook-security.ts`

**Fonctions:**
```typescript
verifyWebhookSignature() // Vérifie HMAC générique
verifyNanoBananaWebhook() // Vérifie webhook NanoBanana
```

---

## ✅ Routes Rooms sécurisées (Appliqué le 2025-10-30)

**Fichiers modifiés:**
- `/app/api/rooms/route.ts` - POST ✅
- `/app/api/rooms/[id]/route.ts` - PATCH ✅, DELETE ✅

**Corrections appliquées:**
- ✅ Import de `requireAdmin` ajouté dans les 2 fichiers
- ✅ Check admin avec `requireAdmin()` avant POST/PATCH/DELETE
- ✅ Retour 403 Forbidden si l'utilisateur n'est pas admin
- ✅ Logs des tentatives d'accès non autorisées

**Code ajouté:**
```typescript
// 🔒 SÉCURITÉ: Vérifier les droits admin
const adminCheck = await requireAdmin(supabase, user.id)
if (!adminCheck.isAdmin) {
  return adminCheck.response!
}
```

**Comportement:**
```typescript
// ✅ Utilisateur admin → peut créer/modifier/supprimer
// ❌ Utilisateur normal → 403 Forbidden
// ❌ Non authentifié → 401 Unauthorized
```

---

## 📋 CONFIGURATION BASE DE DONNÉES REQUISE

### Ajouter la colonne `role` à la table `users`:

```sql
-- Migration à créer
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Créer un index
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Donner le rôle admin à un utilisateur
UPDATE users
SET role = 'admin'
WHERE email = 'admin@renzo-immo.com';
```

### Créer la migration:

```bash
# Créer le fichier
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_add_user_roles.sql
```

**Contenu:**
```sql
-- Add role column to users table for admin rights
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'
CHECK (role IN ('user', 'admin'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add comment
COMMENT ON COLUMN users.role IS 'User role: user (default) or admin';
```

---

## 🔐 VARIABLES D'ENVIRONNEMENT

Ajouter à `.env`:

```bash
# Webhook NanoBanana
NANOBANANA_WEBHOOK_SECRET=votre_secret_hmac_partagé_avec_nanobanana
```

Ajouter à `.env.example`:

```bash
# Webhook Security
NANOBANANA_WEBHOOK_SECRET=your_webhook_secret_here
```

---

## 🧪 TESTS DE SÉCURITÉ

### Test 1: Webhook sans signature
```bash
curl -X POST http://localhost:3000/api/nanobanana-webhook \
  -H "Content-Type: application/json" \
  -d '{"requestId":"test","status":"completed"}'
# Attendu: 401 Unauthorized
```

### Test 2: Création furniture sans admin
```bash
# Se connecter en tant qu'utilisateur normal
curl -X POST http://localhost:3000/api/furniture \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_USER_NORMAL" \
  -d '{"category":"seating","room_types":["salon"],"name_fr":"Test","name_en":"Test"}'
# Attendu: 403 Forbidden
```

### Test 3: Création furniture avec admin
```bash
# Se connecter en tant qu'admin
curl -X POST http://localhost:3000/api/furniture \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -d '{"category":"seating","room_types":["salon"],"name_fr":"Test","name_en":"Test"}'
# Attendu: 201 Created
```

---

## 📊 TABLEAU RÉCAPITULATIF

| Route | Méthode | Auth | Admin Check | Validation Zod | Status |
|-------|---------|------|-------------|----------------|--------|
| `/api/nanobanana-webhook` | POST | Token ✅ | N/A | ✅ | ✅ SÉCURISÉ |
| `/api/furniture` | POST | ✅ | ✅ | ✅ | ✅ SÉCURISÉ |
| `/api/furniture/[id]` | PATCH | ✅ | ✅ | ✅ | ✅ SÉCURISÉ |
| `/api/furniture/[id]` | DELETE | ✅ | ✅ | N/A | ✅ SÉCURISÉ |
| `/api/rooms` | POST | ✅ | ✅ | ✅ | ✅ SÉCURISÉ |
| `/api/rooms/[id]` | PATCH | ✅ | ✅ | ✅ | ✅ SÉCURISÉ |
| `/api/rooms/[id]` | DELETE | ✅ | ✅ | N/A | ✅ SÉCURISÉ |

---

## 🎯 PROCHAINES ÉTAPES

1. ~~**[URGENT]** Appliquer les corrections rooms (30 min)~~ ✅ **FAIT**
2. **[URGENT]** Appliquer la migration SQL pour `role` dans Supabase Dashboard (5 min)
3. **[URGENT]** Configurer `NANOBANANA_WEBHOOK_TOKEN` dans `.env` (5 min)
4. **[IMPORTANT]** Créer un premier utilisateur admin (5 min)
5. **[IMPORTANT]** Envoyer l'URL webhook à NanoBanana avec le token (10 min)
6. **[IMPORTANT]** Tester tous les endpoints sécurisés (30 min)
7. **[BONUS]** Ajouter validation Zod query params catalog/preset (30 min)

---

## 📝 NOTES IMPORTANTES

### Pourquoi admin check sur furniture/rooms?

Les tables `furniture_catalog` et `room_specifications` sont **GLOBALES** - tous les utilisateurs les voient et les utilisent. Sans check admin, n'importe quel utilisateur pourrait:
- Créer des meubles avec des noms offensants
- Supprimer tous les meubles de la plateforme
- Modifier les spécifications de pièces
- Polluer la base de données

### Pourquoi HMAC sur webhook?

Sans HMAC, n'importe qui peut envoyer de faux webhooks pour:
- Remplacer les images transformées par des contenus malicieux
- Marquer des images comme "failed" alors qu'elles sont en cours
- Injecter des URLs malveillantes dans la base

### RLS vs Admin Check

- **RLS**: Protège les données par utilisateur (mes projets, mes images)
- **Admin Check**: Protège les ressources globales (furniture, rooms)
- Les deux sont nécessaires et complémentaires

---

## ✅ CHECKLIST FINALE

Avant de passer en production:

- [ ] Migration SQL `role` appliquée
- [ ] Variable `NANOBANANA_WEBHOOK_TOKEN` configurée
- [x] Routes rooms sécurisées avec admin check ✅
- [x] Routes furniture sécurisées avec admin check ✅
- [ ] Au moins 1 utilisateur admin créé
- [ ] Tests de sécurité passés
- [ ] Webhook NanoBanana configuré avec le token
- [x] Documentation admin créée ✅

---

**Rapport généré le:** 2025-10-30
**Par:** Claude Code - Security Audit
