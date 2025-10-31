# ✅ FIX COMPLET - Sélection de Meubles

## 🐛 Problème Identifié

Tu obtiens toujours de la **dépersonnalisation** au lieu du **home staging avec meubles**.

## 🔍 Causes Racines Trouvées

### 1. ❌ Colonne `furniture_ids` manquante en DB
La colonne n'existait pas dans la table `images`, donc les IDs des meubles n'étaient jamais sauvegardés.

### 2. ❌ APIs recevant des slugs mais attendant des UUIDs
Les APIs `/api/furniture/catalog` et `/api/furniture/preset` recevaient le slug `"home_staging_scandinave"` mais essayaient de l'utiliser directement comme UUID dans les requêtes SQL.

**Erreur:**
```
invalid input syntax for type uuid: "home_staging_scandinave"
```

## ✅ Solutions Appliquées

### Fix #1: Ajout de la Résolution Slug → UUID

**Fichiers modifiés:**

1. **[app/api/furniture/catalog/route.ts](app/api/furniture/catalog/route.ts#L41-L66)**
   - Ajout de la résolution automatique slug → UUID
   - Utilisation du UUID résolu dans toutes les requêtes

2. **[app/api/furniture/preset/route.ts](app/api/furniture/preset/route.ts#L40-L65)**
   - Même résolution automatique slug → UUID
   - Correction de la requête vers `room_furniture_presets`

3. **[src/lib/prompts/prompt-builder.ts](src/lib/prompts/prompt-builder.ts#L276-L301)** (déjà fait)
   - Méthode `resolveTransformationTypeId()` pour résoudre slugs

### Fix #2: Insertion de furniture_ids en DB

**Fichiers modifiés:**

1. **[src/infra/adapters/images-repository.supabase.ts](src/infra/adapters/images-repository.supabase.ts#L115)**
   ```typescript
   furniture_ids: image.furnitureIds || null, // ✅ AJOUTÉ
   ```

2. **[src/infra/adapters/images-repository.supabase.ts](src/infra/adapters/images-repository.supabase.ts#L144)**
   ```typescript
   if (updates.furnitureIds !== undefined) {
     updateData.furniture_ids = updates.furnitureIds // ✅ AJOUTÉ
   }
   ```

### Fix #3: Migration SQL

**Fichier créé:** [supabase/migrations/20250130_add_furniture_ids_column.sql](supabase/migrations/20250130_add_furniture_ids_column.sql)

```sql
ALTER TABLE images
ADD COLUMN IF NOT EXISTS furniture_ids UUID[] DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_images_furniture_ids
ON images USING GIN (furniture_ids);
```

## 📋 Étapes pour Finaliser le Fix

### Étape 1: Appliquer la Migration SQL ⚠️ IMPORTANT

**Tu DOIS faire ça maintenant:**

1. Ouvre **Supabase Dashboard** → **SQL Editor**
2. Copie/colle ce SQL:

```sql
-- Ajouter la colonne furniture_ids
ALTER TABLE images
ADD COLUMN IF NOT EXISTS furniture_ids UUID[] DEFAULT NULL;

-- Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_images_furniture_ids
ON images USING GIN (furniture_ids);

-- Vérifier que ça a marché
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'images'
AND column_name = 'furniture_ids';
```

3. Clique **"Run"**
4. Vérifie que tu vois: `furniture_ids | ARRAY`

### Étape 2: Redémarrer le Serveur

```bash
# Ctrl+C pour stopper
npm run dev
```

### Étape 3: Tester le Flow Complet

1. **Rafraîchir la page** du dashboard
2. **Upload une nouvelle image** avec:
   - Style: "Home Staging Scandinave"
   - Cliquer "Avec meubles" → Toast "Meubles par défaut ajoutés"
   - Type de pièce: "Salon"
   - Cliquer "Ajouter au projet"

## 🔍 Logs Attendus (Terminal)

Après avoir uploadé l'image, tu devrais voir:

### ✅ Résolution du Slug (APIs Furniture)
```bash
[Furniture Catalog] Resolved slug to UUID {
  slug: 'home_staging_scandinave',
  uuid: 'abc-123-def-456-...'
}
```

### ✅ Données en DB
```bash
========== IMAGE DATA FROM DATABASE ==========
{
  transformation_type: 'home_staging_scandinave',
  with_furniture: true,
  furniture_ids: [
    'uuid-1',
    'uuid-2',
    'uuid-3',
    'uuid-4',
    'uuid-5'
  ],  ← ✅ PAS VIDE!
  room_type: 'salon'
}
```

### ✅ Composants du Prompt
```bash
========== PROMPT COMPONENTS ==========
{
  stylePalette: {
    wall_colors: ['White', 'Light Beige', 'Soft Gray'],
    floor_materials: ['Light Oak Parquet', 'Whitewashed Wood'],
    hasData: true
  },
  furnitureVariants: [
    'Scandinavian sofa',
    'Coffee table',
    'Wall shelf',
    'Floor lamp',
    'Potted plants'
  ]  ← ✅ 5 MEUBLES!
}
```

### ✅ Prompt Final
```bash
========== FINAL PROMPT GENERATED ==========
{
  source: 'modular',
  metadata: {
    furniture_count: 5
  },
  promptPreview: 'Transform this living room into a Scandinavian home staging.
                   STYLE: Home Staging Scandinave
                   PALETTE: White walls, light oak floor...
                   FURNITURE:
                   1. Scandinavian sofa - Minimalist 3-seater...'
}
```

## ✅ Résultat Final Attendu

L'image générée par NanoBanana devrait contenir:

- ✅ Un canapé style scandinave (tissu clair, pieds bois)
- ✅ Une table basse en bois clair
- ✅ Une étagère murale
- ✅ Une lampe design
- ✅ Des plantes vertes
- ✅ Couleurs neutres (blanc, beige, gris clair)
- ✅ **PAS de dépersonnalisation!**

## 🧪 Vérification en Base de Données

Après upload, vérifie dans Supabase SQL Editor:

```sql
SELECT
  id,
  transformation_type,
  with_furniture,
  furniture_ids,
  array_length(furniture_ids, 1) as furniture_count,
  room_type,
  status,
  created_at
FROM images
ORDER BY created_at DESC
LIMIT 1;
```

**Résultat attendu:**
```
| transformation_type      | with_furniture | furniture_ids           | furniture_count |
|--------------------------|----------------|-------------------------|-----------------|
| home_staging_scandinave  | true           | {uuid1,uuid2,uuid3,...} | 5               |
```

## 📊 Récapitulatif des Fichiers Modifiés

### APIs Corrigées (Slug → UUID)
- ✅ [app/api/furniture/catalog/route.ts](app/api/furniture/catalog/route.ts)
- ✅ [app/api/furniture/preset/route.ts](app/api/furniture/preset/route.ts)
- ✅ [src/lib/prompts/prompt-builder.ts](src/lib/prompts/prompt-builder.ts)

### Repository (Insertion furniture_ids)
- ✅ [src/infra/adapters/images-repository.supabase.ts](src/infra/adapters/images-repository.supabase.ts)

### Logs Ajoutés (Debug)
- ✅ [app/api/generate-image/route.ts](app/api/generate-image/route.ts)

### Types
- ✅ [app/dashboard/projects/[id]/page.tsx](app/dashboard/projects/[id]/page.tsx)
- ✅ [src/components/upload/image-uploader.tsx](src/components/upload/image-uploader.tsx)

### Migration SQL
- ✅ [supabase/migrations/20250130_add_furniture_ids_column.sql](supabase/migrations/20250130_add_furniture_ids_column.sql)

## ❓ Si Ça Ne Marche Toujours Pas

### Problème: Les erreurs UUID persistent

**Cause:** La migration SQL n'a pas été appliquée

**Solution:**
1. Vérifie que la colonne existe:
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'images' AND column_name = 'furniture_ids';
   ```
2. Si elle n'existe pas, applique la migration (Étape 1 ci-dessus)

### Problème: furniture_ids reste vide en DB

**Cause:** Code pas mis à jour ou serveur pas redémarré

**Solution:**
1. Vérifie que le code du repository a été mis à jour (ligne 115)
2. Redémarre le serveur Next.js
3. Upload une **NOUVELLE** image (pas une ancienne)

### Problème: Prompt généré mais toujours dépersonnalisation

**Cause:** Les presets n'existent pas en DB

**Solution:**
```sql
-- Vérifier si des presets existent
SELECT * FROM room_furniture_presets
WHERE room_type = 'salon'
AND is_system = true;
```

Si aucun résultat, tu dois créer les presets (voir migrations précédentes).

## 🎯 Status du Fix

- ✅ Résolution Slug → UUID dans toutes les APIs
- ✅ Insertion furniture_ids dans le repository
- ✅ Migration SQL créée
- ⚠️ **ATTENTE:** Migration SQL à appliquer par l'utilisateur
- ⏳ **TEST:** Attente des résultats après migration

---

**Une fois la migration appliquée, lance un test et montre-moi les logs!** 🚀
