# 🔄 Architecture Polling NanoBanana

**Date:** 2025-10-30
**Méthode:** Polling (pas de webhook)

---

## 📋 Vue d'ensemble

L'application utilise le **polling côté client** pour vérifier le statut des images en cours de génération auprès de NanoBanana. Aucun webhook n'est configuré.

---

## 🏗️ Architecture

### 1. Flux complet

```
┌──────────────────────────────────────────────────────────────┐
│ 1. USER UPLOAD IMAGE                                         │
│    → Dashboard: /dashboard/projects/[id]                     │
│    → Component: ImageUploader                                │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. API: POST /api/generate-image                             │
│    → Validate user, credits, email                           │
│    → Upload original to Supabase Storage                     │
│    → Call NanoBanana API: POST /api/v1/nanobanana/create     │
│    → Get taskId from response                                │
│    → Save to DB with status: "processing"                    │
│    → metadata: { nanobanana_task_id: taskId }                │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. CLIENT POLLING STARTS                                     │
│    → Hook: useImagePolling()                                 │
│    → Interval: 5 seconds (configurable)                      │
│    → Auto-detect images with status="processing"             │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ▼ (every 5s)
┌──────────────────────────────────────────────────────────────┐
│ 4. API: POST /api/check-generation-status                    │
│    → Rate limit: 60 req/min per user                         │
│    → Get taskId from DB                                      │
│    → Call NanoBanana: GET /record-info?taskId=XXX            │
│    → Check successFlag:                                      │
│        • 0 = processing → continue polling                   │
│        • 1 = completed → download image                      │
│        • 2/3 = failed → update status                        │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ▼ (if successFlag = 1)
┌──────────────────────────────────────────────────────────────┐
│ 5. IMAGE PROCESSING                                          │
│    → Download from NanoBanana URL                            │
│    → Resize to exact original dimensions (sharp)             │
│    → Upload to Supabase Storage                              │
│    → Update DB: status="completed", transformed_url=...      │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. UI UPDATE                                                 │
│    → React Query invalidation                                │
│    → UI shows transformed image                              │
│    → Polling stops automatically                             │
└──────────────────────────────────────────────────────────────┘
```

---

## 📁 Fichiers clés

### Frontend

**[src/domain/images/hooks/use-image-polling.ts](src/domain/images/hooks/use-image-polling.ts)**
```typescript
// Hook React pour le polling automatique
export function useImagePolling({
  images,
  projectId,
  enabled = true,
  interval = 5000, // 5 secondes
})
```

**Fonctionnalités:**
- Détecte automatiquement les images avec `status === 'processing'`
- Vérifie le statut toutes les 5 secondes
- Invalide les queries React Query pour rafraîchir l'UI
- S'arrête automatiquement quand il n'y a plus d'images à traiter
- Cleanup automatique au démontage du composant

**Utilisation dans les pages:**
```typescript
// /app/dashboard/projects/[id]/page.tsx
const { pollingCount, isPolling } = useImagePolling({
  images: images || [],
  projectId: params.id,
  enabled: true,
})
```

---

### Backend

**[app/api/check-generation-status/route.ts](app/api/check-generation-status/route.ts)**

**Endpoint:** `POST /api/check-generation-status`

**Body:**
```json
{
  "imageId": "uuid-de-l-image",
  "taskId": "task-id-nanobanana"
}
```

**Sécurité:**
- ✅ Authentication check
- ✅ Email verification required
- ✅ Rate limiting: 60 req/min per user
- ✅ Ownership check (image appartient à l'user)
- ✅ Zod validation

**Flux:**
1. Récupère l'image avec le taskId depuis la DB
2. Appelle NanoBanana API: `GET /api/v1/nanobanana/record-info?taskId=XXX`
3. Vérifie le `successFlag`:
   - `0` → En cours → retourne `status: "processing"`
   - `1` → Complété → télécharge + upload + update DB
   - `2` → Échec création → update DB avec erreur
   - `3` → Échec génération → update DB avec erreur
4. Si complété:
   - Télécharge l'image depuis l'URL NanoBanana
   - Redimensionne aux dimensions exactes de l'original (sharp)
   - Upload sur Supabase Storage
   - Met à jour la DB avec `transformed_url` et `status: "completed"`

**Response (processing):**
```json
{
  "success": true,
  "status": "processing",
  "message": "Image generation still in progress"
}
```

**Response (completed):**
```json
{
  "success": true,
  "status": "completed",
  "imageId": "uuid",
  "transformedUrl": "https://supabase.co/.../transformed.png"
}
```

**Response (failed):**
```json
{
  "success": false,
  "status": "failed",
  "message": "Generation failed"
}
```

---

### API NanoBanana utilisée

**Endpoint de vérification de statut:**
```
GET https://api.nanobananaapi.ai/api/v1/nanobanana/record-info?taskId={taskId}
Authorization: Bearer {NANOBANANA_API_KEY}
```

**Response:**
```json
{
  "data": {
    "successFlag": 0 | 1 | 2 | 3,
    "response": {
      "resultImageUrl": "https://...",
      "originImageUrl": "https://..."
    }
  }
}
```

**successFlag values:**
- `0` = En cours de traitement
- `1` = Complété avec succès
- `2` = Échec lors de la création de la tâche
- `3` = Échec lors de la génération

---

## ⚙️ Configuration

### Variables d'environnement

```bash
# .env
NANOBANANA_API_KEY=votre_api_key_ici
```

### Paramètres du polling

**Interval par défaut:** 5 secondes
**Rate limit:** 60 requêtes/minute par utilisateur

**Modifier l'interval:**
```typescript
// Dans la page où useImagePolling est appelé
const { pollingCount } = useImagePolling({
  images,
  projectId,
  interval: 3000, // 3 secondes (plus agressif)
})
```

⚠️ **Attention:** Un interval trop court peut causer:
- Rate limiting (429 errors)
- Coûts API plus élevés
- Charge serveur accrue

---

## 🔒 Sécurité

### Rate Limiting

Configuré dans [src/lib/rate-limit.ts](src/lib/rate-limit.ts):

```typescript
export const statusCheckLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 req/min
  analytics: true,
})
```

### Ownership Check

```typescript
// Ligne 93 de check-generation-status/route.ts
if (image.projects.user_id !== user.id) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

Empêche un user de vérifier le statut d'une image d'un autre user.

### Email Verification

```typescript
if (!user.confirmed_at) {
  return NextResponse.json({
    error: 'Email verification required'
  }, { status: 403 })
}
```

### Validation Zod

```typescript
const validation = validateRequest(checkStatusRequestSchema, body)
```

Valide le format du body (imageId et taskId doivent être des UUIDs).

---

## 📊 Monitoring & Logs

### Logs importants

```typescript
// useImagePolling
logger.debug(`🔄 Starting polling for ${count} image(s)`)
logger.debug(`🔍 Checking status for image ${imageId}`)
logger.debug(`✅ Image ${imageId} finished with status: ${status}`)
logger.debug(`⏹️ Stopping polling`)

// check-generation-status
logger.debug('🔍 Checking NanoBanana task status:', taskId)
logger.debug('📦 Task status:', statusResult)
logger.debug('🎯 successFlag:', successFlag)
logger.debug('✅ Image ready! Using URL:', imageUrl)
logger.debug('🔄 Resizing image to exact dimensions')
logger.debug('✅ Image uploaded to Supabase Storage')
logger.debug('🎉 Image generation completed!')
```

### Erreurs communes

**Error: "No task ID found for this image"**
- Cause: L'image n'a pas de `nanobanana_task_id` dans metadata
- Solution: Vérifier que `/api/generate-image` sauvegarde bien le taskId

**Error: "Rate limit exceeded"**
- Cause: Trop de requêtes (>60/min)
- Solution: Augmenter l'interval de polling ou le rate limit

**Error: "Image not found"**
- Cause: imageId invalide ou image appartient à un autre user
- Solution: Vérifier les permissions RLS Supabase

**Error: "Failed to check task status: 404"**
- Cause: taskId invalide ou tâche expirée sur NanoBanana
- Solution: Vérifier que le taskId est correct dans la DB

---

## 🎯 Avantages du Polling

✅ **Simplicité:**
- Aucune configuration webhook nécessaire
- Pas besoin de domaine public en développement
- Fonctionne derrière un firewall

✅ **Contrôle:**
- Interval configurable
- Rate limiting côté serveur
- Arrêt automatique quand terminé

✅ **Sécurité:**
- Pas de endpoint public exposé
- Ownership check sur chaque requête
- Rate limiting par user

✅ **Fiabilité:**
- Retry automatique en cas d'erreur réseau
- Pas de webhook manqué
- UI toujours synchronisée

---

## ⚠️ Inconvénients du Polling

❌ **Latence:**
- Délai de 0-5 secondes avant détection (selon interval)
- Webhook serait instantané

❌ **Charge serveur:**
- Requêtes continues même si rien ne change
- Webhook ne déclenche que quand nécessaire

❌ **Coûts API:**
- Appels réguliers à NanoBanana API
- Webhook serait un seul appel

---

## 🚀 Performance

### Statistiques typiques

- **Temps de génération NanoBanana:** 30-60 secondes
- **Polling checks pendant ce temps:** 6-12 requêtes
- **Délai de détection:** 0-5 secondes après completion
- **Rate limit impact:** Minimal (<20% de la limite)

### Optimisations possibles

1. **Backoff exponentiel:**
```typescript
// Augmenter l'interval progressivement
let interval = 5000
if (pollingCount > 10) interval = 10000 // 10s après 10 checks
if (pollingCount > 30) interval = 30000 // 30s après 30 checks
```

2. **Pause si user inactif:**
```typescript
// Arrêter le polling si tab pas visible
const enabled = document.visibilityState === 'visible'
```

3. **WebSocket alternative:**
- Remplacer polling par WebSocket pour temps réel
- Nécessite infrastructure WebSocket

---

## 🧪 Testing

### Test du polling en développement

1. Démarrer le serveur:
```bash
npm run dev
```

2. Uploader une image dans un projet

3. Ouvrir la console navigateur, observer les logs:
```
🔄 Starting polling for 1 image(s)
🔍 Checking status for image xxx
📊 Status for image xxx: processing
...
📊 Status for image xxx: completed
✅ Image xxx finished with status: completed
⏹️ Stopping polling
```

4. Vérifier que l'image apparaît automatiquement quand prête

### Test manuel de l'API

```bash
# 1. Créer une image avec taskId
curl -X POST http://localhost:3000/api/generate-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"projectId":"xxx","transformationType":"xxx",...}'

# 2. Vérifier le statut
curl -X POST http://localhost:3000/api/check-generation-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"imageId":"xxx","taskId":"yyy"}'
```

---

## 📚 Ressources

- **API NanoBanana:** https://docs.nanobananaapi.ai/
- **React Query invalidation:** https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation
- **Sharp (resize):** https://sharp.pixelplumbing.com/
- **Upstash Rate Limiting:** https://upstash.com/docs/redis/features/ratelimiting

---

**Dernière mise à jour:** 2025-10-30
**Version:** 1.0.0
