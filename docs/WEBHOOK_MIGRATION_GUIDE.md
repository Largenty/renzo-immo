# 🔄 Guide de Migration - Webhook NanoBanana

## 📋 Contexte

Le webhook NanoBanana permet de recevoir les notifications quand une image est générée de manière asynchrone. Cette migration ajoute la colonne `nano_request_id` nécessaire pour lier les callbacks webhook aux images.

---

## 🎯 Ce qui a été fait

### 1. Webhook Endpoint Créé
- **Fichier:** `app/api/nanobanana-webhook/route.ts`
- **Route:** `POST /api/nanobanana-webhook`
- **Fonction:** Reçoit les callbacks de NanoBanana et met à jour les images

### 2. Génération d'Image Modifiée
- **Fichier:** `app/api/generate-image/route.ts`
- **Changement:** Stocke maintenant le `requestId` retourné par NanoBanana
- **Ligne 314:** Extraction du `requestId`
- **Ligne 328:** Sauvegarde dans `nano_request_id`

### 3. Migration SQL Créée
- **Fichier:** `supabase/migrations/20250130_add_nano_request_id.sql`
- **Contenu:** Ajoute la colonne et l'index nécessaires

---

## ⚡ Action Requise: Appliquer la Migration

### Option 1: Via Supabase Dashboard (Recommandé)

1. **Connectez-vous à Supabase:**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet: `renzo-immo`

2. **Ouvrez le SQL Editor:**
   - Dans le menu de gauche, cliquez sur **SQL Editor**
   - Cliquez sur **"New Query"**

3. **Copiez-collez ce SQL:**

```sql
-- Ajouter la colonne nano_request_id pour stocker l'ID de la requête NanoBanana
-- Cela permet au webhook de retrouver l'image à mettre à jour

ALTER TABLE images
ADD COLUMN IF NOT EXISTS nano_request_id TEXT;

-- Index pour recherche rapide par request ID
CREATE INDEX IF NOT EXISTS idx_images_nano_request_id
ON images(nano_request_id);

-- Commentaire
COMMENT ON COLUMN images.nano_request_id IS 'ID de la requête NanoBanana pour le callback webhook';
```

4. **Exécutez la requête:**
   - Cliquez sur **"Run"** ou appuyez sur `Ctrl+Enter`
   - Vous devriez voir: **"Success. No rows returned"**

5. **C'est fait! ✅**

---

### Option 2: Via CLI Supabase (Alternative)

Si vous avez Supabase CLI installé:

```bash
# Se connecter à Supabase
npx supabase link --project-ref votre-project-ref

# Appliquer la migration
npx supabase db push
```

---

## 🧪 Vérifier que la Migration a Fonctionné

### Via SQL Editor

Exécutez cette requête pour vérifier:

```sql
-- Vérifier que la colonne existe
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'images'
  AND column_name = 'nano_request_id';
```

**Résultat attendu:**
```
column_name       | data_type | is_nullable
------------------|-----------|------------
nano_request_id   | text      | YES
```

### Via l'Application

1. Lancez votre application: `npm run dev`
2. Générez une nouvelle image via le dashboard
3. Vérifiez dans Supabase Table Editor → `images`
4. La colonne `nano_request_id` devrait être visible

---

## 🔄 Comment ça Marche

### Flux Complet

```
1. Utilisateur demande génération d'image
   ↓
2. app/api/generate-image/route.ts
   - Appelle NanoBanana avec callBackUrl
   - Reçoit requestId
   - Stocke dans images.nano_request_id
   ↓
3. NanoBanana génère l'image (peut prendre 30-60 secondes)
   ↓
4. NanoBanana appelle notre webhook: POST /api/nanobanana-webhook
   - Payload contient: requestId, status, outputUrls
   ↓
5. app/api/nanobanana-webhook/route.ts
   - Trouve l'image par nano_request_id
   - Met à jour status → 'completed'
   - Met à jour transformed_url
   ↓
6. Utilisateur voit l'image générée! ✅
```

### Payload Webhook Exemple

NanoBanana envoie quelque chose comme ça:

```json
{
  "requestId": "req_abc123def456",
  "status": "completed",
  "outputUrls": [
    "https://nanobanana-cdn.com/output/xyz789.png"
  ]
}
```

---

## 🛠️ Configuration Webhook chez NanoBanana

### Variables d'Environnement

Assurez-vous que ces variables sont configurées:

```bash
# Dans .env
NANOBANANA_API_KEY=votre_api_key
APP_URL=https://votre-domaine.com  # En production
# APP_URL=http://localhost:3000    # En développement
```

### URL du Webhook

Le webhook est automatiquement configuré dans le code:

```typescript
// Dans app/api/generate-image/route.ts
callBackUrl: (process.env.APP_URL || 'http://localhost:3000') + '/api/nanobanana-webhook'
```

**Production:** `https://votre-domaine.com/api/nanobanana-webhook`
**Dev:** `http://localhost:3000/api/nanobanana-webhook`

---

## 🧪 Tester le Webhook

### En Développement (avec ngrok)

Le webhook ne peut pas être testé directement en localhost car NanoBanana ne peut pas appeler `localhost`.

**Solution: Utiliser ngrok**

1. **Installer ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Exposer votre localhost:**
   ```bash
   ngrok http 3000
   ```

3. **Copier l'URL ngrok:**
   ```
   Forwarding  https://abc123.ngrok.io -> http://localhost:3000
   ```

4. **Mettre à jour .env:**
   ```bash
   APP_URL=https://abc123.ngrok.io
   ```

5. **Redémarrer l'app:**
   ```bash
   npm run dev
   ```

6. **Générer une image:**
   - Le webhook sera maintenant accessible par NanoBanana!

### En Production

Aucune configuration spéciale nécessaire! Le webhook fonctionne automatiquement.

---

## 🔍 Debugging du Webhook

### Vérifier les Logs

Les logs du webhook sont visibles dans:

```typescript
// En développement
// Les logs s'affichent dans la console

// En production
// Configurez Sentry pour voir les logs et erreurs
```

### Erreurs Courantes

#### "Image not found for requestId"

**Cause:** Le `nano_request_id` n'a pas été stocké correctement

**Solution:**
1. Vérifiez que la migration a été appliquée
2. Vérifiez que le code dans `generate-image/route.ts` stocke bien le requestId

#### "Missing requestId"

**Cause:** NanoBanana n'envoie pas de requestId

**Solution:**
- Vérifiez le payload reçu dans les logs
- Contactez le support NanoBanana si nécessaire

---

## 📊 Monitoring

### Vérifier les Images en Processing

Pour voir les images en cours de génération:

```sql
-- Images en attente de callback
SELECT
  id,
  nano_request_id,
  status,
  created_at,
  processing_started_at
FROM images
WHERE status = 'processing'
  AND nano_request_id IS NOT NULL
ORDER BY created_at DESC;
```

### Vérifier les Images Complétées

```sql
-- Images complétées via webhook
SELECT
  id,
  nano_request_id,
  status,
  processing_completed_at,
  transformed_url IS NOT NULL as has_url
FROM images
WHERE status = 'completed'
  AND nano_request_id IS NOT NULL
ORDER BY processing_completed_at DESC
LIMIT 10;
```

---

## ✅ Checklist de Migration

- [ ] Migration SQL appliquée via Supabase Dashboard
- [ ] Colonne `nano_request_id` existe dans la table `images`
- [ ] Index créé sur `nano_request_id`
- [ ] Variable `APP_URL` configurée dans `.env`
- [ ] Webhook endpoint accessible: `/api/nanobanana-webhook`
- [ ] Test de génération d'image effectué
- [ ] Vérification dans Supabase que `nano_request_id` est bien rempli

---

## 🚀 Prochaines Étapes

Une fois la migration appliquée:

1. **Tester en développement** (avec ngrok si besoin)
2. **Déployer en production**
3. **Vérifier que les webhooks fonctionnent**
4. **Monitorer les erreurs** via Sentry

**La génération d'images asynchrone est maintenant opérationnelle! 🎉**
