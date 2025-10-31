# DEBUG: Furniture Selection Flow

## 🐛 Problème actuel

L'utilisateur sélectionne des meubles mais `furnitureIds` arrive vide `[]` au backend, causant la génération d'un prompt de dépersonnalisation au lieu de home staging avec meubles.

## 📊 Logs ajoutés

### 1. **ImageUploader - Ouverture du dialogue**
Fichier: `src/components/upload/image-uploader.tsx`

```
[ImageUploader] Opening furniture selector: {
  fileId: null,
  mode: 'bulk',
  hasTransformationType: true,
  transformationType: 'home_staging_scandinave',
  hasRoomType: true,
  roomType: 'salon'
}
```

**À vérifier:**
- `hasRoomType` doit être `true`
- `roomType` ne doit pas être `undefined`
- Si `hasRoomType: false`, le dialogue ne s'ouvrira pas du tout!

---

### 2. **FurnitureSelectorDialog - Initialisation**
Fichier: `src/components/furniture/furniture-selector-dialog.tsx`

```
[FurnitureSelectorDialog] Opening with params: {
  transformationTypeId: 'uuid-home-staging-scandinave',
  roomType: 'salon',
  initialSelection: []
}
```

**À vérifier:**
- Le dialogue est bien instancié avec les bons paramètres
- `initialSelection` peut être vide la première fois

---

### 3. **FurnitureSelectorDialog - Confirmation**
Fichier: `src/components/furniture/furniture-selector-dialog.tsx`

```
[FurnitureSelectorDialog] Confirming selection: {
  selectedCount: 5,
  selectedIds: ['uuid-1', 'uuid-2', 'uuid-3', 'uuid-4', 'uuid-5']
}
```

**À vérifier:**
- `selectedCount` doit être > 0
- `selectedIds` doit contenir des UUIDs valides

---

### 4. **ImageUploader - Réception de la sélection**
Fichier: `src/components/upload/image-uploader.tsx`

```
[ImageUploader] Furniture selected: {
  furnitureCount: 5,
  furnitureIds: ['uuid-1', 'uuid-2', 'uuid-3', 'uuid-4', 'uuid-5'],
  mode: 'bulk',
  fileId: null
}
```

**À vérifier:**
- `furnitureCount` doit correspondre au nombre de meubles sélectionnés
- `furnitureIds` doit contenir les mêmes IDs que dans le dialogue
- `mode: 'bulk'` ou `mode: 'individual'` selon le contexte

---

### 5. **ImageUploader - Submission finale**
Fichier: `src/components/upload/image-uploader.tsx`

```
[ImageUploader] Submitting files: {
  fileCount: 1,
  files: [{
    id: 'abc123',
    name: 'salon.jpg',
    transformationType: 'home_staging_scandinave',
    withFurniture: true,
    furnitureIds: ['uuid-1', 'uuid-2', 'uuid-3', 'uuid-4', 'uuid-5'],
    furnitureCount: 5,
    roomType: 'salon',
    customRoom: undefined
  }]
}
```

**À vérifier:**
- Chaque fichier doit avoir `furnitureIds` rempli
- `furnitureCount` doit être > 0
- `withFurniture` doit être `true`

---

### 6. **ProjectDetailPage - Upload**
Fichier: `app/dashboard/projects/[id]/page.tsx`

```
[Upload] Données envoyées: {
  transformationType: 'home_staging_scandinave',
  withFurniture: true,
  furnitureIds: ['uuid-1', 'uuid-2', 'uuid-3', 'uuid-4', 'uuid-5'],
  furnitureCount: 5,
  roomType: 'salon'
}
```

**À vérifier:**
- Les données passées au mutation doivent contenir `furnitureIds`
- `furnitureCount` > 0

---

## 🔍 Points de défaillance possibles

### A. Room Type non sélectionné
**Symptôme:** Le bouton "Personnaliser les meubles" n'apparaît pas ou ne fait rien

**Cause:** Dans `ImageUploader.tsx` ligne 578 et 882:
```typescript
{uploadedFile.withFurniture === true && uploadedFile.roomType && (
  <Button onClick={() => openFurnitureSelector(uploadedFile.id)}>
    Personnaliser les meubles
  </Button>
)}
```

Si `roomType` est `undefined`, le bouton n'apparaît pas!

**Solution:** L'utilisateur doit d'abord sélectionner un type de pièce (salon, chambre, etc.)

---

### B. Dialogue ne s'ouvre pas
**Symptôme:** Rien ne se passe au clic sur "Personnaliser les meubles"

**Cause:** Condition ligne 1021 de `ImageUploader.tsx`:
```typescript
{furnitureDialogOpen && files[0]?.transformationType && files[0]?.roomType && (
  <FurnitureSelectorDialog ... />
)}
```

Si `roomType` est `undefined`, le dialogue ne render pas!

---

### C. Sélection ne persiste pas
**Symptôme:** Les meubles sont cochés mais `furnitureIds` reste vide

**Vérifier:**
1. Le log "Confirming selection" dans FurnitureSelectorDialog
2. Le log "Furniture selected" dans ImageUploader
3. Vérifier que `handleFurnitureSelect` appelle bien `applyBulkFurnitureIds` ou `updateFurnitureIds`

---

### D. Données perdues à l'upload
**Symptôme:** Les logs montrent `furnitureIds` dans ImageUploader mais pas dans `[Upload] Données envoyées`

**Cause possible:** L'objet `UploadedFile` n'est pas correctement mappé dans `handleUploadComplete`

---

## 🧪 Test manuel

### Étapes pour tester le flow complet:

1. **Uploader une image**
   - Console: "[ImageUploader] Transformation types loaded"

2. **Sélectionner un style** (ex: Home Staging Scandinave)
   - Vérifier que "Avec meubles" apparaît

3. **Cliquer sur "Avec meubles"**
   - Bouton doit être activé (bleu)

4. **Sélectionner un type de pièce** (ex: Salon)
   - ⚠️ CRUCIAL: Sans cette étape, le dialogue ne s'ouvrira pas!

5. **Cliquer sur "Personnaliser les meubles"**
   - Console: "[ImageUploader] Opening furniture selector"
   - Console: "[FurnitureSelectorDialog] Opening with params"
   - Vérifier `hasRoomType: true`

6. **Sélectionner des meubles dans le dialogue**
   - Cocher au moins 3-5 meubles

7. **Cliquer sur "Confirmer"**
   - Console: "[FurnitureSelectorDialog] Confirming selection"
   - Console: "[ImageUploader] Furniture selected"
   - Vérifier `furnitureCount > 0`

8. **Cliquer sur "Ajouter X photo(s) au projet"**
   - Console: "[ImageUploader] Submitting files"
   - Console: "[Upload] Données envoyées"
   - Vérifier `furnitureCount > 0`

---

## 🎯 Hypothèses

### Hypothèse A: Room Type non sélectionné
L'utilisateur oublie de sélectionner le type de pièce avant de cliquer sur "Personnaliser les meubles"
→ Le dialogue ne s'ouvre pas
→ `furnitureIds` reste vide

### Hypothèse B: Sélection pas confirmée
L'utilisateur ferme le dialogue sans cliquer sur "Confirmer"
→ `onSelect` n'est jamais appelé
→ `furnitureIds` reste vide

### Hypothèse C: Bug dans applyBulkFurnitureIds
La fonction `applyBulkFurnitureIds` ne met pas à jour correctement l'état
→ À vérifier dans les logs

---

## ✅ Actions suivantes

1. **Demander à l'utilisateur de tester** avec le flux complet en suivant les étapes ci-dessus
2. **Vérifier les logs** dans la console du navigateur
3. **Identifier** à quelle étape `furnitureIds` se perd
4. **Fix** en fonction du point de défaillance identifié
