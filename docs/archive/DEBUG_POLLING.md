# Debug: Pourquoi le Polling Ne Démarre Pas

## Symptôme
```
🔄 Polling 0 image(s) {isPolling: false}
```

Cela signifie qu'aucune image n'est détectée en statut "processing" avec un taskId.

## Étapes de Debug

### 1. Vérifier les Images dans la Base de Données

Exécutez ce SQL dans Supabase SQL Editor:

```sql
SELECT
  id,
  project_id,
  status,
  metadata->>'nanobanana_task_id' as task_id,
  metadata,
  processing_started_at,
  created_at
FROM images
WHERE project_id = '309b3758-d9ab-46cf-a8bc-2775ac24b279'
ORDER BY created_at DESC
LIMIT 10;
```

**Attendu**: Vous devriez voir des images avec:
- `status = 'processing'`
- `task_id` non null (par exemple: `11bd9cd3e6b6208fbb6ae5391e721265`)

### 2. Vérifier les Images Côté Client

Dans la console du navigateur, collez ce code:

```javascript
// Récupérer les images du projet
fetch('/api/projects/309b3758-d9ab-46cf-a8bc-2775ac24b279/images', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(images => {
    console.log('📦 Total images:', images.length);
    console.log('🔄 Processing images:', images.filter(i => i.status === 'processing'));
    console.log('✅ Completed images:', images.filter(i => i.status === 'completed'));
    console.log('⏳ Pending images:', images.filter(i => i.status === 'pending'));

    // Vérifier les taskIds
    const processingWithTaskId = images.filter(i =>
      i.status === 'processing' && i.metadata?.nanobanana_task_id
    );
    console.log('🎯 Processing images WITH taskId:', processingWithTaskId);
  });
```

### 3. Vérifier Manuellement le Statut auprès de NanoBanana

Si vous avez un taskId (par exemple: `11bd9cd3e6b6208fbb6ae5391e721265`), vérifiez manuellement:

```javascript
// Remplacez IMAGE_ID et TASK_ID
fetch('/api/check-generation-status', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageId: 'VOTRE_IMAGE_ID_ICI',
    taskId: '11bd9cd3e6b6208fbb6ae5391e721265'
  })
})
  .then(r => r.json())
  .then(result => {
    console.log('📊 Status check result:', result);
  });
```

## Scénarios Possibles

### Scénario A: Les images sont en "pending" au lieu de "processing"

**Problème**: L'image n'a jamais été envoyée à NanoBanana pour génération.

**Solution**: Cliquez sur le bouton "Générer" pour chaque image.

**Code pour vérifier**:
```javascript
// Dans la console
const pendingImages = images.filter(i => i.status === 'pending');
console.log('Images qui attendent génération:', pendingImages);
```

### Scénario B: Les images sont en "processing" mais sans taskId

**Problème**: Le taskId n'a pas été sauvegardé dans les metadata.

**Cause**: L'API `/api/generate-image` n'a pas mis à jour correctement les metadata.

**Solution**: Regarder les logs serveur pour voir si la mise à jour a échoué.

### Scénario C: Les images sont déjà "completed"

**Problème**: Elles ont déjà été récupérées!

**Solution**: Rafraîchir la page (F5) pour voir les images transformées.

### Scénario D: Le hook useProjectImages ne retourne pas les bonnes données

**Problème**: React Query cache obsolète ou mauvaise query key.

**Solution**:
```javascript
// Dans la console, invalider le cache
// (Note: nécessite accès à queryClient, à faire dans le composant)
```

## Fix Temporaire: Forcer le Polling

Si les images sont bien en "processing" avec un taskId mais le polling ne démarre pas, ajoutez ce code temporaire dans la console:

```javascript
// Polling manuel pour tester
const imageId = 'VOTRE_IMAGE_ID';
const taskId = '11bd9cd3e6b6208fbb6ae5391e721265';

const pollInterval = setInterval(async () => {
  console.log('🔍 Checking status...');

  const response = await fetch('/api/check-generation-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageId, taskId })
  });

  const result = await response.json();
  console.log('📊 Result:', result);

  if (result.status === 'completed' || result.status === 'failed') {
    console.log('✅ Done! Stopping polling.');
    clearInterval(pollInterval);
    // Rafraîchir la page
    window.location.reload();
  }
}, 5000); // Toutes les 5 secondes

// Pour arrêter manuellement:
// clearInterval(pollInterval);
```

## Vérifier le Hook de Polling

Le hook vérifie cette condition:

```typescript
const processingImages = images.filter(
  (img) => img.status === 'processing' && img.metadata?.nanobanana_task_id
)
```

**Checklist**:
- [ ] `img.status === 'processing'` ✓ ou ✗
- [ ] `img.metadata` existe ✓ ou ✗
- [ ] `img.metadata.nanobanana_task_id` existe ✓ ou ✗

## Solution Rapide: Debug dans le Hook

Ajoutez temporairement ces logs dans [src/domain/images/hooks/use-image-polling.ts](src/domain/images/hooks/use-image-polling.ts):

```typescript
useEffect(() => {
  // DEBUG: Afficher toutes les images
  console.log('🔍 ALL images:', images.map(i => ({
    id: i.id,
    status: i.status,
    hasMetadata: !!i.metadata,
    taskId: i.metadata?.nanobanana_task_id
  })));

  const processingImages = images.filter(
    (img) => img.status === 'processing' && img.metadata?.nanobanana_task_id
  )

  console.log('🎯 Processing images with taskId:', processingImages.length);
  // ... reste du code
}, [images, ...])
```

## Résultat Attendu

Une fois le problème identifié, vous devriez voir:

```
🔍 ALL images: [{id: "...", status: "processing", hasMetadata: true, taskId: "11bd..."}]
🎯 Processing images with taskId: 1
🔄 Starting polling for 1 image(s) in project 309b...
🔍 Checking status for image xxx (task: 11bd...)
📊 Status for image xxx: processing
... (après 30-60 secondes) ...
✅ Image xxx finished with status: completed
```
