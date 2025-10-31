# 🐛 Résumé du Bug et Fix

## Problème

**Tu obtiens toujours de la dépersonnalisation au lieu du home staging avec meubles.**

## Cause Racine (ROOT CAUSE) 🎯

**La colonne `furniture_ids` n'existe PAS dans la table `images`!**

Quand tu sélectionnes des meubles dans l'interface:
1. ✅ Les meubles sont bien sélectionnés dans le frontend
2. ✅ Les `furnitureIds` sont passés à l'API d'upload
3. ❌ **MAIS** le repository ne les insère PAS en base de données (ligne commentée)
4. ❌ Résultat: `furniture_ids = null` en DB
5. ❌ Lors de la génération, le PromptBuilder ne trouve aucun meuble
6. ❌ Prompt généré sans meubles → NanoBanana génère une dépersonnalisation

## Solution ✅

### Étape 1: Appliquer la Migration SQL

Ouvre le **Supabase Dashboard** → **SQL Editor** et exécute:

```sql
-- Ajouter la colonne furniture_ids
ALTER TABLE images
ADD COLUMN IF NOT EXISTS furniture_ids UUID[] DEFAULT NULL;

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_images_furniture_ids
ON images USING GIN (furniture_ids);
```

### Étape 2: Le Code est Déjà Fixé

J'ai déjà mis à jour:
- ✅ [src/infra/adapters/images-repository.supabase.ts](src/infra/adapters/images-repository.supabase.ts#L115) - Insert furniture_ids
- ✅ [src/infra/adapters/images-repository.supabase.ts](src/infra/adapters/images-repository.supabase.ts#L144) - Update furniture_ids
- ✅ [src/lib/prompts/prompt-builder.ts](src/lib/prompts/prompt-builder.ts#L276-L301) - Résolution slug → UUID
- ✅ [app/api/generate-image/route.ts](app/api/generate-image/route.ts#L96-L107) - Logs détaillés

### Étape 3: Tester

1. **Rafraîchir le serveur:**
   ```bash
   # Stopper npm run dev (Ctrl+C)
   npm run dev
   ```

2. **Uploader une nouvelle image:**
   - Sélectionner "Home Staging Scandinave"
   - Cliquer "Avec meubles" → Toast "Meubles par défaut ajoutés"
   - Sélectionner "Salon"
   - Soumettre

3. **Vérifier les logs du terminal:**

Tu devrais voir:

```bash
========== IMAGE DATA FROM DATABASE ==========
{
  transformation_type: 'home_staging_scandinave',
  with_furniture: true,
  furniture_ids: ['uuid-1', 'uuid-2', 'uuid-3', 'uuid-4', 'uuid-5'],  ← ✅ PAS VIDE!
  room_type: 'salon'
}

========== PROMPT COMPONENTS ==========
{
  stylePalette: { wall_colors: [...], floor_materials: [...], ... },  ← ✅ Palette trouvée
  furnitureVariants: ['Scandinavian sofa', 'Coffee table', ...]       ← ✅ Meubles trouvés
}

========== FINAL PROMPT GENERATED ==========
{
  source: 'modular',
  furnitureCount: 5,  ← ✅ 5 meubles dans le prompt!
  promptPreview: "Transform this living room into a Scandinavian home staging...
}
```

4. **Résultat:** L'image générée doit contenir des meubles style scandinave! 🎉

## Flow Complet (Après Fix)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Frontend: User sélectionne meubles                          │
│    └─> furnitureIds = ['uuid-1', 'uuid-2', ...]               │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. API Upload: POST /api/upload                                │
│    └─> Sauvegarde en DB avec furniture_ids = ['uuid-1', ...]  │
│        ✅ NOUVEAU: La colonne existe maintenant!                │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. API Generate: POST /api/generate-image                      │
│    ├─> Lit furniture_ids depuis la DB                         │
│    ├─> Résout le slug 'home_staging_scandinave' → UUID        │
│    ├─> PromptBuilder.build({                                  │
│    │     transformationTypeId: UUID,                          │
│    │     furnitureIds: ['uuid-1', ...],  ← ✅ PAS VIDE!       │
│    │     roomType: 'salon'                                    │
│    │   })                                                     │
│    └─> Construit le prompt avec:                              │
│         • Palette scandinave (bois clair, blanc, beige)       │
│         • Liste des 5 meubles avec descriptions               │
│         • Contraintes du salon                                │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. NanoBanana API                                              │
│    └─> Reçoit le prompt complet avec meubles                  │
│    └─> Génère une image avec meubles style scandinave ✅      │
└─────────────────────────────────────────────────────────────────┘
```

## Vérification en Base de Données

Après avoir uploadé une image, vérifie:

```sql
SELECT
  id,
  transformation_type,
  with_furniture,
  furniture_ids,
  array_length(furniture_ids, 1) as furniture_count,
  room_type
FROM images
ORDER BY created_at DESC
LIMIT 1;
```

**Résultat Attendu:**
```
| transformation_type      | with_furniture | furniture_ids        | furniture_count | room_type |
|--------------------------|----------------|----------------------|-----------------|-----------|
| home_staging_scandinave  | true           | {uuid1,uuid2,uuid3}  | 3               | salon     |
```

## Fichiers Modifiés

1. ✅ **src/infra/adapters/images-repository.supabase.ts**
   - Ligne 115: Ajout de `furniture_ids: image.furnitureIds || null`
   - Ligne 144: Ajout de `furniture_ids` dans updateImage

2. ✅ **src/lib/prompts/prompt-builder.ts**
   - Ligne 276-301: Méthode `resolveTransformationTypeId()` pour slug → UUID
   - Ligne 131-143: Résolution automatique dans `build()`

3. ✅ **app/api/generate-image/route.ts**
   - Ligne 96-107: Logs détaillés des données depuis la DB

4. ✅ **app/dashboard/projects/[id]/page.tsx**
   - Ligne 37: Ajout de `furnitureIds?: string[]` dans l'interface
   - Ligne 110-116: Validation que transformationType est défini

5. ✅ **src/components/upload/image-uploader.tsx**
   - Ligne 30: Import du type TransformationType

## Documents Créés

- 📄 [APPLY_FURNITURE_IDS_MIGRATION.md](APPLY_FURNITURE_IDS_MIGRATION.md) - Guide pour appliquer la migration
- 📄 [supabase/migrations/20250130_add_furniture_ids_column.sql](supabase/migrations/20250130_add_furniture_ids_column.sql) - Migration SQL
- 📄 [FIX_DEPERSONALIZATION_ISSUE.md](FIX_DEPERSONALIZATION_ISSUE.md) - Explication technique
- 📄 [TEST_FURNITURE_SELECTION.md](TEST_FURNITURE_SELECTION.md) - Guide de test

## Prochaines Étapes

1. ✅ **Appliquer la migration SQL** (voir [APPLY_FURNITURE_IDS_MIGRATION.md](APPLY_FURNITURE_IDS_MIGRATION.md))
2. ✅ **Redémarrer le serveur** (`npm run dev`)
3. ✅ **Tester avec une nouvelle image**
4. ✅ **Vérifier les logs** pour confirmer que furniture_ids n'est plus vide

## ✨ Résultat Final Attendu

Une fois la migration appliquée, tu devrais obtenir:

✅ Images avec meubles style scandinave (canapé, table basse, étagère, plantes)
✅ Couleurs neutres (blanc, beige, gris clair, bois clair)
✅ **PAS de dépersonnalisation!**

Si ça ne marche toujours pas après la migration, montre-moi les logs complets du terminal! 🔍
