# Simplification de la gestion des meubles

## 🎯 Objectif

Simplifier radicalement le système de prompts en supprimant toute la logique complexe de gestion des meubles.
NanoBanana interprète naturellement les meubles selon le style demandé.

## ❌ Ce qui a été supprimé

### 1. **Tables et données DB**
Rien n'a été supprimé de la base de données. Les tables suivantes restent en place mais ne sont plus utilisées par le PromptBuilder:
- `furniture_catalog` - Catalogue des meubles
- `style_furniture_variants` - Variantes de meubles par style
- `room_furniture_presets` - Presets de sélection de meubles

**Raison:** Ces tables peuvent toujours servir pour:
- Interface utilisateur (sélection de meubles)
- Analytics (préférences utilisateurs)
- Futures fonctionnalités

### 2. **Code de gestion des meubles**

#### PromptBuilder - AVANT (complexe)
```typescript
export interface PromptBuilderParams {
  transformationTypeId: string;
  roomType: RoomType;
  furnitureIds?: string[];  // ❌ Liste d'IDs
  customPrompt?: string | null;
}

// Récupération des variantes de meubles
const furnitureVariants = await this.getFurnitureVariants(resolvedUUID, furnitureIds);

// Construction de la liste détaillée
furnitureVariants.forEach((variant, index) => {
  const details = variant.details ? ` (${variant.details})` : '';
  const materials = variant.materials?.length ? ` - Materials: ${variant.materials.join(', ')}` : '';
  const colors = variant.colors?.length ? ` - Colors: ${variant.colors.join(', ')}` : '';
  furnitureLines.push(`${index + 1}. ${variant.description}${details}${materials}${colors}`);
});
```

#### PromptBuilder - APRÈS (simple)
```typescript
export interface PromptBuilderParams {
  transformationTypeId: string;
  roomType: RoomType;
  withFurniture?: boolean;  // ✅ Simple flag
  customPrompt?: string | null;
}

// Juste un boolean, aucune requête DB supplémentaire
const withFurniture = params.withFurniture || false;
```

### 3. **Templates de prompts**

#### AVANT (87 lignes)
```
===== REQUIRED FURNITURE =====

ADD ALL items below. Each one MUST appear in the final image:

{{furniture_list}}
1. Sofa moderne en tissu gris - Materials: fabric, wood - Colors: gray, natural wood
2. Table basse en bois massif - Materials: oak - Colors: natural wood
3. Étagère murale - Materials: metal, wood - Colors: black, oak
...

PLACEMENT REQUIREMENTS:
• Furniture proportional to room scale (realistic human-scale sizing)
• Items follow floor plane and perspective grid
• Respect circulation paths and functional zones
• Shadows consistent with light sources
• Realistic depth and volume for each piece
• No floating objects - all items grounded properly
```

#### APRÈS (56 lignes)
```
===== STYLE APPLICATION =====

TARGET: {{style_name}}

Apply this style palette precisely:
{{style_palette}}

The transformation MUST reflect {{style_name}} through:
• Specified wall colors applied accurately
• Floor materials from the palette only
• Cohesive aesthetic matching style keywords
• Appropriate lighting for the style
• Add furniture appropriate for this {{room_name}} in {{style_name}} style

===== LIGHTING & REALISM =====
...
```

## ✅ Ce qui reste

### 1. **Sélection de meubles dans l'UI**
L'interface peut toujours proposer la sélection de meubles, mais maintenant:
- C'est purement visuel/UX
- Active juste le flag `withFurniture: true`
- Les IDs sélectionnés peuvent être stockés pour analytics

### 2. **Palettes de style et contraintes de pièce**
Le système modulaire reste robuste avec:
- ✅ `style_palettes` - Couleurs, matériaux, ambiance
- ✅ `room_specifications` - Contraintes architecturales
- ✅ `transformation_types` - Styles disponibles

### 3. **Deux modes simples**
```typescript
// Mode WITH furniture
buildPrompt({
  transformationTypeId: 'home_staging_moderne',
  roomType: 'salon',
  withFurniture: true  // ← Simple!
});

// Mode WITHOUT furniture (dépersonnalisation)
buildPrompt({
  transformationTypeId: 'depersonnalisation',
  roomType: 'salon',
  withFurniture: false
});
```

## 📊 Gains

### Réduction de code
```
PromptBuilder:
- AVANT: ~500 lignes avec getFurnitureVariants()
- APRÈS: ~400 lignes sans logique meubles
Économie: 100 lignes

Templates:
- AVANT: 87 lignes (WITH_FURNITURE)
- APRÈS: 75 lignes
Économie: 12 lignes

Total: ~112 lignes de code en moins
```

### Réduction de complexité
```
- 0 requête DB supplémentaire pour les meubles
- 0 jointure sur style_furniture_variants
- 0 logique de mapping furniture_id → description
- Prompts plus courts = meilleure attention du modèle AI
```

### Performance
```
Avant:
1. Requête style_palettes
2. Requête room_specifications
3. Requête style_furniture_variants (avec JOIN furniture_catalog)
4. Requête transformation_types
Total: 4 requêtes

Après:
1. Requête style_palettes
2. Requête room_specifications
3. Requête transformation_types
Total: 3 requêtes (-25%)
```

## 🔄 Migration de l'API generate-image

### AVANT
```typescript
const furnitureIds = Array.isArray(image.furniture_ids)
  ? (image.furniture_ids as string[])
  : [];

const promptResult = await buildPrompt({
  transformationTypeId,
  roomType,
  furnitureIds,  // ❌ Passait les IDs
  customPrompt: sanitizedCustomPrompt,
});
```

### APRÈS
```typescript
const withFurniture = image.with_furniture || false;

const promptResult = await buildPrompt({
  transformationTypeId,
  roomType,
  withFurniture,  // ✅ Juste un boolean
  customPrompt: sanitizedCustomPrompt,
});
```

## 📝 Fichiers modifiés

1. ✅ `src/lib/prompts/prompt-templates.ts`
   - Template WITH_FURNITURE simplifié
   - Suppression de la section FURNITURE LIST détaillée

2. ✅ `src/lib/prompts/prompt-builder.ts`
   - Interface `PromptBuilderParams`: `furnitureIds` → `withFurniture`
   - Suppression de `getFurnitureVariants()`
   - Suppression de l'interface `FurnitureVariant`
   - Simplification de `assemblePrompt()`

3. ⏳ `app/api/generate-image/route.ts` (À MODIFIER)
   - Remplacer `furnitureIds` par `withFurniture`

## ⚠️ Breaking Changes

### API generate-image
```diff
// Dans l'appel à buildPrompt()
- furnitureIds: image.furniture_ids || [],
+ withFurniture: image.with_furniture || false,
```

### Schéma DB images (optionnel)
Si vous voulez nettoyer complètement:
```sql
-- Optionnel: Supprimer la colonne furniture_ids de la table images
ALTER TABLE images DROP COLUMN IF EXISTS furniture_ids;
```

**Attention:** Gardez `furniture_ids` si vous voulez conserver l'historique des sélections!

## 🧪 Tests à faire

- [ ] Upload d'image AVEC meubles
- [ ] Upload d'image SANS meubles (dépersonnalisation)
- [ ] Vérifier que les prompts générés sont corrects
- [ ] Vérifier que NanoBanana génère bien des meubles appropriés
- [ ] Vérifier les logs du PromptBuilder

## 🎨 Exemple de prompt généré

### AVANT (avec liste détaillée)
```
Professional architectural photography of a Home Staging Moderne salon...

===== REQUIRED FURNITURE =====

ADD ALL items below. Each one MUST appear in the final image:

1. Sofa moderne en tissu gris - Materials: fabric, wood - Colors: gray, natural wood
2. Table basse en verre - Materials: tempered glass, metal - Colors: transparent, chrome
3. Fauteuil d'appoint - Materials: leather, wood - Colors: cognac, walnut
4. Étagère murale - Materials: metal, wood - Colors: black, oak
5. Lampe sur pied - Materials: metal, fabric - Colors: brass, white
6. Tapis moderne - Materials: wool - Colors: cream, gray
7. Plante d'intérieur - Materials: ceramic pot - Colors: white, green

PLACEMENT REQUIREMENTS:
• Furniture proportional to room scale...
• Items follow floor plane...
[200+ caractères de contraintes détaillées]
```

### APRÈS (ultra-simple)
```
Professional architectural photography of a Home Staging Moderne salon...

===== STYLE APPLICATION =====

TARGET: Home Staging Moderne

Apply this style palette precisely:
• Walls: White OR Light gray
• Floor: Light oak parquet OR Polished concrete
• Accent colors: Navy blue, Brass, Emerald green
• Ambiance: Clean, Bright, Minimal, Sophisticated
• Lighting: Natural light, Warm accents

The transformation MUST reflect Home Staging Moderne through:
• Specified wall colors applied accurately
• Floor materials from the palette only
• Cohesive aesthetic matching style keywords
• Appropriate lighting for the style
• Add furniture appropriate for this salon in Home Staging Moderne style
```

## 🚀 Résultat attendu

NanoBanana, avec sa compréhension contextuelle, va:
1. ✅ Comprendre le style "Home Staging Moderne"
2. ✅ Comprendre le type de pièce "salon"
3. ✅ Ajouter automatiquement les meubles appropriés (canapé, table basse, etc.)
4. ✅ Respecter la palette de couleurs donnée
5. ✅ Créer une composition cohérente et professionnelle

**Avantage:** Résultats plus naturels et variés, sans contraintes trop rigides!

## 📚 Prochaines étapes optionnelles

1. **Nettoyer la DB** (optionnel)
   - Marquer `style_furniture_variants` comme deprecated
   - Supprimer `furniture_ids` de la table `images`

2. **Simplifier l'UI** (optionnel)
   - Remplacer le sélecteur de meubles par un simple toggle "Avec/Sans meubles"
   - Ou garder le sélecteur pour l'UX mais ne pas l'utiliser dans les prompts

3. **A/B Testing**
   - Comparer qualité: prompts détaillés vs prompts simples
   - Mesurer: temps de génération, satisfaction utilisateur
