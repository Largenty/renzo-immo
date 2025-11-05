# Fix: Colonne Metadata Manquante

## Problème Identifié ✅

Les images restent bloquées en statut "processing" car **la colonne `metadata` n'existe pas** dans la table `images`.

### Logs qui ont révélé le problème
```
🔍 DEBUG - All images: [
  {id: '4ae8b15a...', status: 'processing', hasMetadata: false, taskId: 'undefined...'},
  {id: '14f9d6fc...', status: 'processing', hasMetadata: false, taskId: 'undefined...'},
  ...
]
🎯 DEBUG - Processing images with taskId: 0
```

**`hasMetadata: false`** = La colonne n'existe pas ou est NULL pour toutes les images.

## Solution: Ajouter la Colonne Metadata

### Étape 1: Ouvrir Supabase SQL Editor

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Cliquez sur **"SQL Editor"** dans le menu de gauche
4. Cliquez sur **"New query"**

### Étape 2: Exécuter la Migration

Copiez et collez ce SQL, puis cliquez sur **"Run"**:

```sql
-- Migration: Ajouter une colonne metadata JSONB à la table images
-- Cette colonne stocke des données flexibles comme le taskId de NanoBanana

-- Ajouter la colonne metadata
ALTER TABLE images
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Ajouter un index GIN pour des requêtes rapides sur les metadata
CREATE INDEX IF NOT EXISTS idx_images_metadata ON images USING GIN (metadata);

-- Commentaire pour documenter
COMMENT ON COLUMN images.metadata IS 'Métadonnées flexibles en JSON, incluant nanobanana_task_id, original_width, original_height, etc.';
```

Vous devriez voir:
```
Success. No rows returned
```

### Étape 3: Réparer les Images Bloquées

Copiez et collez ce SQL pour réinitialiser les images bloquées:

```sql
-- Réinitialiser les images en "processing" sans taskId vers "pending"
UPDATE images
SET
  status = 'pending',
  processing_started_at = NULL,
  error_message = 'Reset: No taskId found - ready to regenerate'
WHERE status = 'processing'
  AND (metadata IS NULL OR metadata->>'nanobanana_task_id' IS NULL);

-- Réinitialiser les images "failed" pour retry
UPDATE images
SET
  status = 'pending',
  processing_started_at = NULL,
  processing_completed_at = NULL,
  error_message = NULL
WHERE status = 'failed'
  AND project_id = '309b3758-d9ab-46cf-a8bc-2775ac24b279';

-- Vérifier le résultat
SELECT
  id,
  status,
  metadata->>'nanobanana_task_id' as task_id,
  CASE
    WHEN metadata IS NULL THEN 'NULL'
    WHEN metadata = '{}'::jsonb THEN 'EMPTY'
    ELSE 'HAS DATA'
  END as metadata_status
FROM images
WHERE project_id = '309b3758-d9ab-46cf-a8bc-2775ac24b279'
ORDER BY created_at DESC;
```

Vous devriez voir vos images maintenant en statut `pending` avec `metadata_status = 'EMPTY'`.

### Étape 4: Vérifier dans l'Application

1. **Rafraîchissez la page** de votre projet (F5)
2. Vous devriez voir toutes les images en statut "pending"
3. **Cliquez sur "Générer"** pour une image
4. Observez les logs dans la console navigateur

**Logs attendus**:
```
🎨 Generating image with prompt: ...
⏳ NanoBanana task queued with ID: xxxxx
```

Puis après le rafraîchissement:
```
🔍 DEBUG - All images: [
  {id: 'xxx', status: 'processing', hasMetadata: true, taskId: '11bd9cd3...'},
  ...
]
🎯 DEBUG - Processing images with taskId: 1
🔄 Starting polling for 1 image(s) in project 309b...
```

## Vérification Finale

Pour vérifier que tout fonctionne, exécutez ce SQL:

```sql
-- Vérifier qu'une image en processing a bien un taskId
SELECT
  id,
  status,
  metadata->>'nanobanana_task_id' as task_id,
  metadata
FROM images
WHERE status = 'processing'
  AND metadata->>'nanobanana_task_id' IS NOT NULL
LIMIT 1;
```

Si vous voyez une ligne avec un `task_id` non-null, **c'est bon!** ✅

## Timeline du Flux Complet

1. **Upload** → Image créée en statut `pending`
2. **Clic "Générer"** → Appel à `/api/generate-image`
3. **NanoBanana** → Retourne un `taskId`
4. **Sauvegarde** → `metadata.nanobanana_task_id` sauvegardé ✅ (maintenant que la colonne existe!)
5. **Statut** → Image passe en `processing`
6. **Polling** → Hook détecte l'image avec taskId
7. **Vérification** → Toutes les 5s, appel à `/api/check-generation-status`
8. **Complété** → Quand `successFlag = 1`, image téléchargée et statut → `completed`

## Fichiers Créés

- [supabase/migrations/20250129_add_metadata_to_images.sql](../supabase/migrations/20250129_add_metadata_to_images.sql) - Migration principale
- [scripts/fix-processing-images.sql](../scripts/fix-processing-images.sql) - Script de réparation

## Dépannage

### Les images restent en "pending" après génération

**Vérifier**: Le taskId est-il sauvegardé?
```sql
SELECT id, status, metadata FROM images WHERE status = 'processing' LIMIT 1;
```

Si `metadata` est `{}` ou `null`, vérifiez les logs serveur pour voir l'erreur.

### Le polling ne démarre toujours pas

**Vérifier**: Dans la console navigateur:
```
🔍 DEBUG - All images: [{..., hasMetadata: true, taskId: 'xxx...'}]
```

Si `hasMetadata: false`, la colonne n'a pas été ajoutée correctement.

### Les images sont générées mais pas récupérées

**Vérifier**: Le statut auprès de NanoBanana manuellement:
```javascript
fetch('/api/check-generation-status', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageId: 'VOTRE_IMAGE_ID',
    taskId: 'VOTRE_TASK_ID'
  })
}).then(r => r.json()).then(console.log)
```

## Prochaines Étapes

Après avoir exécuté les migrations:

1. ✅ Rafraîchir la page
2. ✅ Générer une nouvelle image
3. ✅ Observer le polling démarrer
4. ✅ Attendre ~30-60s que l'image soit générée
5. ✅ L'image devrait apparaître automatiquement!

---

**Note**: Les images actuellement bloquées ont été réinitialisées en `pending`. Vous devrez les régénérer manuellement en cliquant sur le bouton "Générer".
