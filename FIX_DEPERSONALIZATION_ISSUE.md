# FIX: Dépersonnalisation Issue

## Problème

L'utilisateur reportait: "j'ai toujours le style dépersonnalisation" - même après avoir sélectionné un style de home staging avec meubles, le système générait des images vides (dépersonnalisation).

## Cause Racine

Le système utilisait des **slugs** (ex: `"home_staging_moderne"`) partout dans le code frontend et backend, mais le **PromptBuilder** attendait des **UUIDs** pour faire les requêtes en base de données.

### Flow du bug:

1. Frontend envoie `transformationType: "home_staging_moderne"` (slug)
2. Backend stocke ce slug dans `images.transformation_type`
3. `generate-image` API lit le slug et le passe au PromptBuilder
4. **PromptBuilder essayait de faire:**
   ```sql
   SELECT * FROM style_palettes
   WHERE transformation_type_id = 'home_staging_moderne'
   ```
5. **Résultat:** Aucune palette trouvée (car `transformation_type_id` est un UUID)
6. **Conséquence:** Prompt fallback utilisé → dépersonnalisation

## Solution Implémentée

### 1. Ajout de la résolution Slug → UUID dans PromptBuilder

**Fichier:** `/home/ludo/dev/renzo-immo/src/lib/prompts/prompt-builder.ts`

Ajout d'une méthode `resolveTransformationTypeId()`:

```typescript
private async resolveTransformationTypeId(input: string): Promise<string | null> {
  // Si c'est déjà un UUID (contient des tirets), le retourner tel quel
  if (input.includes('-')) {
    return input;
  }

  // Sinon, c'est un slug → résoudre en UUID
  const { data, error } = await this.supabase
    .from('transformation_types')
    .select('id')
    .eq('slug', input)
    .single();

  if (error || !data) {
    logger.error('[PromptBuilder] Failed to resolve slug', { slug: input, error });
    return null;
  }

  return data.id;
}
```

### 2. Modification de la méthode `build()`

La méthode résout maintenant le slug en UUID avant de faire les requêtes:

```typescript
async build(params: PromptBuilderParams): Promise<PromptBuilderResult> {
  // ...

  // 🔄 RÉSOLUTION SLUG → UUID
  const resolvedUUID = await this.resolveTransformationTypeId(transformationTypeId);

  if (!resolvedUUID) {
    logger.error('[PromptBuilder] Failed to resolve transformation type');
    return this.getFallbackPrompt(transformationTypeId);
  }

  // 2. Récupérer les composants avec l'UUID résolu
  const [stylePalette, roomSpec, furnitureVariants, transformationType] = await Promise.all([
    this.getStylePalette(resolvedUUID),  // ✅ Utilise UUID
    this.getRoomSpec(roomType),
    furnitureIds.length > 0 ? this.getFurnitureVariants(resolvedUUID, furnitureIds) : Promise.resolve([]),
    this.getTransformationType(resolvedUUID),  // ✅ Utilise UUID
  ]);
}
```

### 3. Ajout du champ `furnitureIds` manquant

**Fichier:** `/home/ludo/dev/renzo-immo/app/dashboard/projects/[id]/page.tsx`

L'interface `UploadedFile` manquait le champ `furnitureIds`:

```typescript
interface UploadedFile {
  file: File;
  transformationType: string;
  customPrompt?: string;
  withFurniture?: boolean;
  furnitureIds?: string[]; // ✅ AJOUTÉ
  roomType?: RoomType;
  customRoom?: string;
}
```

### 4. Nettoyage des logs debug

Suppression des références à `transformationTypeId` (UUID) qui n'existe plus dans l'interface.

## Test de Validation

Pour vérifier que le fix fonctionne:

1. **Uploader une image** dans un projet
2. **Sélectionner "Home Staging Scandinave"**
3. **Cliquer sur "Avec meubles"**
4. **Sélectionner "Salon" comme type de pièce**
5. **Observer le toast "Meubles par défaut ajoutés"** (auto-loading activé)
6. **Soumettre l'image**

### Logs attendus dans la console:

```
[PromptBuilder] Resolving slug to UUID: home_staging_scandinave
[PromptBuilder] Resolved transformation type: { input: "home_staging_scandinave", resolvedUUID: "abc-123-..." }
[PromptBuilder] Modular prompt built successfully
```

### Résultat attendu:

- Le prompt doit contenir la palette de style scandinave
- Le prompt doit lister les meubles (canapé, table basse, etc.)
- L'image transformée doit montrer un salon avec meubles style scandinave
- **PAS de dépersonnalisation!**

## Fichiers Modifiés

1. ✅ `/home/ludo/dev/renzo-immo/src/lib/prompts/prompt-builder.ts`
   - Ajout de `resolveTransformationTypeId()`
   - Modification de `build()` pour utiliser la résolution

2. ✅ `/home/ludo/dev/renzo-immo/app/dashboard/projects/[id]/page.tsx`
   - Ajout du champ `furnitureIds` dans l'interface `UploadedFile`
   - Nettoyage des logs debug

## Architecture Finale

```
Frontend (ImageUploader)
  └─> UploadedFile { transformationType: "home_staging_moderne" }
       └─> Page.tsx handleUploadComplete()
            └─> uploadImageMutation
                 └─> Backend: /api/upload (Supabase)
                      └─> images.transformation_type = "home_staging_moderne" (slug)
                           └─> /api/generate-image
                                └─> PromptBuilder.build({ transformationTypeId: "home_staging_moderne" })
                                     └─> resolveTransformationTypeId("home_staging_moderne")
                                          └─> Query: SELECT id FROM transformation_types WHERE slug = 'home_staging_moderne'
                                               └─> Retourne UUID: "abc-123-def-..."
                                                    └─> getStylePalette(UUID)
                                                         └─> Palette trouvée! ✅
                                                              └─> Prompt avec meubles généré ✅
```

## Pourquoi ce bug est survenu?

Le code avait une incohérence architecturale:

- **Frontend/UI**: Utilisait des slugs lisibles (`home_staging_moderne`)
- **Database Schema**: Utilisait des UUIDs comme foreign keys (`transformation_type_id`)
- **PromptBuilder**: Attendait des UUIDs mais recevait des slugs

La solution élégante était d'ajouter une couche de résolution automatique dans le PromptBuilder pour accepter **les deux formats**.

## Alternative Envisagée (Non Retenue)

Nous aurions pu modifier tout le frontend pour utiliser des UUIDs, mais:

❌ Cela aurait nécessité de modifier 10+ fichiers
❌ Les slugs sont plus lisibles dans les logs
❌ Les slugs sont plus faciles à utiliser dans l'UI
❌ Risque de casser d'autres parties du code

✅ **Solution choisie:** Ajouter la résolution dans le PromptBuilder (1 fichier modifié)
