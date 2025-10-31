# Fix: Récupération Automatique des Images Générées

## Problème

Les images étaient bien envoyées à NanoBanana pour génération, mais n'étaient jamais récupérées car il n'y avait pas de mécanisme de **polling** côté client.

### Symptômes
- ✅ Image envoyée à NanoBanana (taskId reçu)
- ✅ Status "processing" dans la base de données
- ❌ Image jamais récupérée et affichée
- ❌ Pas de mise à jour automatique du statut

### Log typique
```
📦 NanoBanana result: {
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "e3a3195debde21ba1bf88130f2eee7ed"
  }
}
⏳ NanoBanana task queued with ID: e3a3195debde21ba1bf88130f2eee7ed
POST /api/generate-image 200 in 3533ms
```

## Solution Implémentée

### 1. Création du Hook de Polling

**Fichier**: [src/domain/images/hooks/use-image-polling.ts](src/domain/images/hooks/use-image-polling.ts)

Ce hook:
- ✅ Détecte automatiquement les images en statut "processing"
- ✅ Vérifie leur statut toutes les 5 secondes via l'API
- ✅ Invalide le cache React Query quand une image est complétée
- ✅ S'arrête automatiquement quand il n'y a plus d'images à poller
- ✅ Logs détaillés pour le debugging

### 2. Intégration dans la Page du Projet

**Fichier**: [app/dashboard/projects/[id]/page.tsx](app/dashboard/projects/[id]/page.tsx:70-78)

```tsx
// ✅ POLLING: Vérifier automatiquement le statut des images en cours de traitement
const { pollingCount, isPolling } = useImagePolling({
  images,
  projectId,
  enabled: true, // Toujours actif quand on est sur la page
  interval: 5000, // Vérifier toutes les 5 secondes
});
```

### 3. Fix Erreur File is not defined

**Fichier**: [src/domain/projects/models/project.ts](src/domain/projects/models/project.ts:70)

Correction pour supporter le SSR (Server-Side Rendering):
```tsx
coverImage: typeof File !== 'undefined' ? z.instanceof(File).optional() : z.any().optional(),
```

## Comment Ça Marche

### Flux Complet

1. **Upload & Génération**
   - Utilisateur upload une image
   - API `/api/generate-image` envoie la requête à NanoBanana
   - Reçoit un `taskId` et stocke l'image en statut "processing"

2. **Polling Automatique** (NOUVEAU ✨)
   - Le hook `useImagePolling` détecte l'image en "processing"
   - Toutes les 5 secondes, appelle `/api/check-generation-status`
   - Cette API interroge NanoBanana pour le statut de la tâche

3. **Récupération**
   - Quand NanoBanana retourne `successFlag: 1` (complété)
   - L'API télécharge l'image générée
   - Redimensionne aux dimensions exactes de l'original
   - Upload sur Supabase Storage
   - Met à jour le statut à "completed"

4. **Mise à Jour UI**
   - React Query invalide le cache
   - L'interface se rafraîchit automatiquement
   - L'utilisateur voit son image transformée

## Monitoring

### Console Logs à Surveiller

```
🔄 Starting polling for X image(s) in project [projectId]
🔍 Checking status for image [imageId] (task: [taskId])
📊 Status for image [imageId]: processing
✅ Image [imageId] finished with status: completed
⏹️ Stopping polling for project [projectId]
```

### API NanoBanana

L'endpoint de vérification du statut:
```
GET https://api.nanobananaapi.ai/api/v1/nanobanana/record-info?taskId=xxx
```

Retourne:
```json
{
  "data": {
    "successFlag": 0,  // 0=en cours, 1=complété, 2/3=échec
    "response": {
      "resultImageUrl": "https://..."
    }
  }
}
```

## Configuration

### Variables d'Environnement Requises

```env
# NanoBanana API
NANOBANANA_API_KEY=your_api_key

# Upstash Redis (pour rate limiting)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

### Paramètres du Polling

Pour modifier l'intervalle de polling, éditez [app/dashboard/projects/[id]/page.tsx](app/dashboard/projects/[id]/page.tsx:74):

```tsx
interval: 5000, // en millisecondes (5000 = 5 secondes)
```

**Recommandations**:
- ⚠️ Trop fréquent (< 3s) = risque de rate limiting
- ✅ Optimal: 5-10 secondes
- ❌ Trop lent (> 30s) = mauvaise UX

## Tests

### Tester le Polling

1. Uploader une image dans un projet
2. Observer les logs dans la console du navigateur
3. Vérifier que le polling démarre automatiquement
4. Attendre que l'image soit générée (30-60 secondes généralement)
5. L'image devrait apparaître automatiquement sans refresh

### Debug

Si le polling ne fonctionne pas:

1. **Vérifier les logs console**:
   ```
   🔄 Starting polling for X image(s)
   ```

2. **Vérifier le taskId dans la DB**:
   ```sql
   SELECT id, status, metadata->>'nanobanana_task_id' as task_id
   FROM images
   WHERE status = 'processing';
   ```

3. **Tester l'API manuellement**:
   ```bash
   curl -X POST http://localhost:3000/api/check-generation-status \
     -H "Content-Type: application/json" \
     -d '{"imageId":"xxx","taskId":"xxx"}'
   ```

## Améliorations Futures

- [ ] Afficher une barre de progression estimée
- [ ] Toast notification quand une image est complétée
- [ ] Retry automatique en cas d'échec réseau
- [ ] Polling exponentiel (plus lent au fil du temps)
- [ ] WebSocket pour notifications temps réel (au lieu du polling)

## Références

- [NanoBanana API Docs](https://docs.nanobananaapi.ai/)
- [React Query Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation)
- [useEffect Cleanup](https://react.dev/reference/react/useEffect#cleanup-function)
