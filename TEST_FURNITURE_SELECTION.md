# Guide de Test - Sélection de Meubles

## ✅ Modifications Complétées

Les bugs suivants ont été corrigés:

1. ✅ **Résolution Slug → UUID** dans le PromptBuilder
2. ✅ **Import du type TransformationType** dans ImageUploader
3. ✅ **Ajout du champ `furnitureIds`** dans l'interface UploadedFile
4. ✅ **Validation du transformationType** avant upload

## 🧪 Procédure de Test

### Étape 1: Lancer le serveur de développement

```bash
npm run dev
```

### Étape 2: Ouvrir un projet existant

1. Aller sur http://localhost:3000/dashboard/projects
2. Cliquer sur un projet existant

### Étape 3: Uploader une image avec meubles

1. **Cliquer sur "Ajouter des images"**
2. **Sélectionner une image** (par exemple une photo de salon)
3. **Sélectionner le style "Home Staging Scandinave"**
   - Vérifier que le bouton devient bleu
4. **Cliquer sur "Avec meubles"**
   - ✅ **ATTENDU:** Un toast "Meubles par défaut ajoutés" apparaît
   - ✅ **ATTENDU:** Le bouton affiche le nombre de meubles (ex: "5 meubles sélectionnés")
5. **Sélectionner "Salon" comme type de pièce**
6. **[OPTIONNEL] Cliquer sur "Personnaliser les meubles"** pour modifier la sélection
7. **Cliquer sur "Ajouter X photo(s) au projet"**

### Étape 4: Vérifier les logs dans la console

Ouvrir la console du navigateur (F12) et vérifier la présence de ces logs:

#### ✅ Log 1: Auto-chargement des meubles
```
[ImageUploader] Auto-loading furniture preset: {
  transformationType: "home_staging_scandinave",
  roomType: "salon"
}
```

#### ✅ Log 2: Preset chargé
```
[ImageUploader] Preset loaded: {
  furnitureCount: 5,
  furnitureIds: ["uuid-1", "uuid-2", "uuid-3", "uuid-4", "uuid-5"]
}
```

#### ✅ Log 3: Submission avec meubles
```
[ImageUploader] Submitting files: {
  fileCount: 1,
  files: [{
    transformationType: "home_staging_scandinave",
    withFurniture: true,
    furnitureIds: ["uuid-1", "uuid-2", ...],
    furnitureCount: 5,
    roomType: "salon"
  }]
}
```

#### ✅ Log 4: Upload avec données
```
[Upload] Données envoyées: {
  transformationType: "home_staging_scandinave",
  withFurniture: true,
  furnitureIds: ["uuid-1", "uuid-2", ...],
  furnitureCount: 5,
  roomType: "salon"
}
```

### Étape 5: Vérifier les logs serveur

Dans le terminal où tourne `npm run dev`, vérifier:

#### ✅ Log 5: Résolution du slug
```
[PromptBuilder] Resolving slug to UUID: home_staging_scandinave
[PromptBuilder] Resolved transformation type: {
  input: "home_staging_scandinave",
  resolvedUUID: "abc-123-def-456-..."
}
```

#### ✅ Log 6: Prompt modulaire construit
```
[PromptBuilder] Modular prompt built successfully: {
  transformationTypeId: "abc-123-...",
  roomType: "salon",
  furnitureCount: 5,
  promptLength: 1234
}
```

### Étape 6: Attendre la génération

1. Attendre que l'image passe de "pending" à "processing" puis "completed"
2. **Vérifier que l'image générée contient:**
   - ✅ Des meubles (canapé, table basse, étagère, etc.)
   - ✅ Style scandinave (bois clair, couleurs neutres)
   - ✅ **PAS une pièce vide!**

## ❌ Problèmes Possibles

### Problème 1: "Veuillez sélectionner un style de transformation"

**Cause:** L'utilisateur n'a pas sélectionné de style avant de soumettre

**Solution:** Sélectionner un des styles proposés (Home Staging Scandinave, Moderne, etc.)

### Problème 2: Toast "Meubles par défaut ajoutés" n'apparaît pas

**Cause:**
- Le type de pièce n'est pas sélectionné
- OU le style sélectionné ne permet pas les meubles (ex: Dépersonnalisation)

**Solution:**
1. Sélectionner un style avec `allowFurnitureToggle: true`
2. Sélectionner un type de pièce (Salon, Chambre, etc.)
3. Puis cliquer sur "Avec meubles"

### Problème 3: L'image générée est vide (dépersonnalisation)

**Causes possibles:**
- `furnitureIds` est vide
- Le prompt builder n'a pas trouvé la palette de style
- La résolution slug → UUID a échoué

**Vérifier:**
1. Les logs dans la console montrent `furnitureCount > 0`
2. Les logs serveur montrent "Resolved transformation type"
3. Les logs serveur montrent "Modular prompt built successfully"

**Si le problème persiste:**
- Vérifier que la table `transformation_types` contient bien une entrée avec `slug = 'home_staging_scandinave'`
- Vérifier que la table `style_palettes` contient une palette pour ce `transformation_type_id`

### Problème 4: Erreur "Failed to resolve transformation type"

**Cause:** Le slug n'existe pas dans la table `transformation_types`

**Solution:**
```sql
-- Vérifier les slugs disponibles
SELECT slug, name FROM transformation_types;
```

## 📊 Checklist de Validation

- [ ] Upload d'image réussi
- [ ] Toast "Meubles par défaut ajoutés" apparaît
- [ ] Log "[Upload] Données envoyées" montre `furnitureCount > 0`
- [ ] Log "[PromptBuilder] Resolved transformation type" apparaît
- [ ] Log "[PromptBuilder] Modular prompt built successfully" apparaît
- [ ] Image transformée contient des meubles
- [ ] Style scandinave est appliqué (bois clair, couleurs neutres)
- [ ] **PAS de dépersonnalisation!**

## 🎯 Résultat Attendu Final

Une image de salon avec:
- Canapé style scandinave
- Table basse en bois clair
- Étagère murale
- Lampe design
- Plantes vertes
- Couleurs neutres (blanc, beige, gris clair)
- Bois clair visible

**Exemple de prompt généré (extrait):**

```
STYLE: Home Staging Scandinave

PALETTE & MATERIALS:
• Walls: White OR Light Beige OR Soft Gray
• Floor: Light Oak Parquet OR Whitewashed Wood
• Accents: Pastel Blue OR Sage Green

FURNITURE LIST:
1. Scandinavian sofa - Minimalist 3-seater sofa with clean lines, light gray fabric, wooden legs
2. Coffee table - Low rectangular table in light oak with simple design
3. Wall shelf - Floating shelf in whitewashed wood
4. Floor lamp - Arc lamp with brass finish and white shade
5. Potted plants - Fiddle leaf fig in ceramic pot
```
