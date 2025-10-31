# 🔧 Migration: Ajouter la colonne furniture_ids

## ❌ Problème Identifié

**La colonne `furniture_ids` n'existe pas dans la table `images`!**

C'est pour ça que tu as toujours de la dépersonnalisation - les IDs des meubles ne sont jamais sauvegardés en base de données.

## ✅ Solution

Ajouter la colonne `furniture_ids UUID[]` à la table `images`.

## 📋 Étapes pour Appliquer la Migration

### Méthode 1: Via Supabase Dashboard (RECOMMANDÉ)

1. **Ouvrir le Supabase Dashboard**
   - Aller sur https://supabase.com/dashboard
   - Sélectionner ton projet

2. **Ouvrir le SQL Editor**
   - Menu latéral → "SQL Editor"
   - Cliquer sur "New Query"

3. **Copier/coller ce SQL:**

```sql
-- Migration: Ajouter la colonne furniture_ids à la table images
-- Cette colonne stocke les UUIDs des meubles sélectionnés pour le home staging

-- 1. Ajouter la colonne furniture_ids (array d'UUIDs)
ALTER TABLE images
ADD COLUMN IF NOT EXISTS furniture_ids UUID[] DEFAULT NULL;

-- 2. Créer un index pour améliorer les performances des queries
CREATE INDEX IF NOT EXISTS idx_images_furniture_ids
ON images USING GIN (furniture_ids);

-- 3. Ajouter un commentaire pour documentation
COMMENT ON COLUMN images.furniture_ids IS 'Array of furniture UUIDs selected for home staging. NULL means no furniture or depersonalization.';

-- 4. Vérifier que la colonne est bien ajoutée
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'images'
AND column_name = 'furniture_ids';
```

4. **Cliquer sur "Run"**

5. **Vérifier le résultat:**
   - Tu devrais voir un message de succès
   - La dernière query devrait retourner:
     ```
     column_name   | data_type | is_nullable
     --------------|-----------|------------
     furniture_ids | ARRAY     | YES
     ```

### Méthode 2: Via psql (Alternative)

Si tu préfères utiliser psql:

```bash
# Récupérer les credentials depuis Supabase Dashboard → Project Settings → Database
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Puis exécuter le SQL ci-dessus
```

## ✅ Vérification

Après avoir appliqué la migration, vérifie que tout fonctionne:

### 1. Vérifier que la colonne existe

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'images'
ORDER BY ordinal_position;
```

Tu devrais voir `furniture_ids` avec le type `ARRAY`.

### 2. Tester l'insertion

```sql
-- Test d'insertion avec furniture_ids
INSERT INTO images (
  project_id,
  user_id,
  original_url,
  transformation_type,
  status,
  with_furniture,
  furniture_ids,
  room_type
) VALUES (
  'test-project-id',
  'test-user-id',
  'https://example.com/test.jpg',
  'home_staging_scandinave',
  'pending',
  true,
  ARRAY['uuid-1'::uuid, 'uuid-2'::uuid]::uuid[],
  'salon'
)
RETURNING *;

-- Supprimer le test
DELETE FROM images WHERE user_id = 'test-user-id';
```

## 🧪 Tester l'Application

Après avoir appliqué la migration:

1. **Rafraîchir la page** du dashboard
2. **Uploader une nouvelle image** avec:
   - Style: "Home Staging Scandinave"
   - Cliquer sur "Avec meubles"
   - Type de pièce: "Salon"
3. **Vérifier les logs** dans le terminal (`npm run dev`):
   - Tu devrais voir `furniture_ids: ["uuid-1", "uuid-2", ...]`
   - Pas `furniture_ids: []`

4. **Vérifier en base de données:**

```sql
SELECT
  id,
  transformation_type,
  with_furniture,
  furniture_ids,
  array_length(furniture_ids, 1) as furniture_count,
  room_type,
  status
FROM images
ORDER BY created_at DESC
LIMIT 5;
```

Tu devrais voir les UUIDs des meubles dans la colonne `furniture_ids`.

## 📊 Résultat Attendu

Après la migration, quand tu uploads une image avec meubles:

### AVANT (bug):
```
furniture_ids: null  ← ❌ Les meubles ne sont pas sauvegardés
```

### APRÈS (fixé):
```
furniture_ids: [
  "abc-123-def-456",
  "def-456-ghi-789",
  "ghi-789-jkl-012"
]  ← ✅ Les meubles sont sauvegardés!
```

## 🎯 Impact sur le Prompt

Une fois la colonne ajoutée, le système pourra:

1. ✅ Sauvegarder les `furniture_ids` en DB lors de l'upload
2. ✅ Les récupérer lors de la génération
3. ✅ Les passer au PromptBuilder
4. ✅ Construire un prompt avec la liste des meubles
5. ✅ Envoyer à NanoBanana un prompt complet avec meubles
6. ✅ **Obtenir une image avec meubles au lieu de dépersonnalisation!**

## ❓ Problèmes Possibles

### Erreur: "column furniture_ids already exists"

Si tu vois cette erreur, c'est que la colonne existe déjà. Vérifie avec:

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'images' AND column_name = 'furniture_ids';
```

### Erreur: "permission denied"

Tu n'as pas les droits pour modifier le schéma. Vérifie que tu es connecté avec le bon utilisateur (postgres).

### La migration passe mais furniture_ids reste vide

Vérifie que:
1. Le code du repository a bien été mis à jour (ligne 115 dans images-repository.supabase.ts)
2. Le serveur Next.js a été redémarré
3. Tu uploades une NOUVELLE image (pas une ancienne)
