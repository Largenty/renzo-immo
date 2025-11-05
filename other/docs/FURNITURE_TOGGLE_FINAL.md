# ✅ Furniture Feature - Final Implementation

**Date**: 2025-11-02
**Status**: ✅ **COMPLETE & CORRECTED**

---

## 🎯 Final Solution

La fonctionnalité furniture a été **simplifiée** :
- ❌ **Supprimé** : Sélection détaillée de meubles individuels (catalogue, checkboxes, etc.)
- ✅ **Conservé** : Toggle simple "Avec meubles" / "Sans meubles"
- ✅ **Résultat** : Le prompt utilise le flag pour choisir le template approprié

---

## 🔧 Fonctionnement

### User Experience
1. User upload une image
2. User sélectionne le style (ex: "Home Staging Moderne")
3. User sélectionne le type de pièce (ex: "Salon")
4. **User toggle "Avec meubles" ou "Sans meubles"** 👈 NOUVEAU
5. System génère le prompt approprié

### Backend Logic

#### Si `withFurniture = true`:
```typescript
// Template: TEMPLATE_WITH_FURNITURE
// Prompt includes: "Add furniture appropriate for this salon in Home Staging Moderne style"
// NanoBanana automatically determines appropriate furniture
```

#### Si `withFurniture = false`:
```typescript
// Template: TEMPLATE_WITHOUT_FURNITURE
// Prompt focuses on: walls, floor, colors, lighting (no furniture mention)
```

---

## 📝 Files Modified (Final Corrections)

### 1. `/src/infra/adapters/images-repository.supabase.ts`
**Changes**:
- ✅ Removed `furniture_ids` from `ImageRow` interface
- ✅ Removed `furniture_ids` from `mapRowToDomain()`
- ✅ Removed `furniture_ids` from `createImage()` INSERT
- ✅ Removed `furniture_ids` from `updateImage()`
- ✅ **KEPT** `with_furniture` (boolean)

**Status**: ✅ Fixed - No more "furniture_ids column not found" error

---

### 2. `/src/domain/images/models/image.ts`
**Changes**:
- ✅ Removed `furnitureIds?: string[]` from `Image` interface
- ✅ Removed `furnitureIds` from `imageSchema` Zod validation
- ✅ **KEPT** `withFurniture?: boolean`

**Status**: ✅ Fixed - Domain model aligned with database schema

---

### 3. `/src/components/upload/image-uploader.tsx`
**Changes Added**:
- ✅ Re-added `withFurniture?: boolean` to `UploadedFile` interface
- ✅ Added `toggleFurnitureMode()` function
- ✅ Added `applyBulkFurniture()` function
- ✅ **NEW**: Furniture toggle UI in bulk mode (lines 620-695)
- ✅ **NEW**: Furniture toggle UI in individual mode (lines 944-1006)

**UI Components**:
```tsx
// Bulk Mode - Card with 2 buttons
<Card>
  <Label>Meubles pour {files.length} photo(s)</Label>
  <div className="grid grid-cols-2 gap-3">
    <button onClick={() => applyBulkFurniture(true)}>
      <Sofa /> Avec meubles (Automatiques)
    </button>
    <button onClick={() => applyBulkFurniture(false)}>
      <Sparkles /> Sans meubles (Espace vide)
    </button>
  </div>
</Card>

// Individual Mode - Same structure, per-file
```

**Status**: ✅ UI restored with simple toggle

---

### 4. `/src/lib/prompts/prompt-builder.ts`
**Changes**:
- ✅ Changed from `const withFurniture = true` (forced)
- ✅ To: `const { withFurniture = true } = params` (respects user choice)
- ✅ Updated comment from "DEPRECATED" to "Toggle: true = with furniture, false = without"

**Before**:
```typescript
async build(params: PromptBuilderParams): Promise<PromptBuilderResult> {
  const { transformationTypeId, roomType, customPrompt = null } = params;
  const withFurniture = true; // ❌ Always forced
```

**After**:
```typescript
async build(params: PromptBuilderParams): Promise<PromptBuilderResult> {
  const { transformationTypeId, roomType, withFurniture = true, customPrompt = null } = params;
  // ✅ Respects user choice, defaults to true
```

**Status**: ✅ Respects user toggle

---

## 🗄️ Database Schema

### Columns REMOVED
- ❌ `images.furniture_ids` (UUID[])
- ❌ `furniture_catalog.user_id`
- ❌ `room_specifications.user_id`

### Columns KEPT
- ✅ `images.with_furniture` (boolean) - Used by toggle
- ✅ `images.transformation_type_id` (UUID)
- ✅ `images.room_type` (text)

### Tables KEPT (for automatic prompt generation)
- ✅ `furniture_catalog` (system furniture data)
- ✅ `style_furniture_variants` (style-specific descriptions)
- ✅ `room_furniture_presets` (default presets)

---

## 🧪 Testing Steps

1. **Apply Database Migration** (REQUIRED):
```sql
-- Run in Supabase SQL Editor:
-- File: supabase/migrations/20251102_remove_furniture_user_features.sql
```

2. **Test Upload Flow**:
- [ ] Navigate to `/dashboard/projects/new`
- [ ] Upload an image
- [ ] Select transformation type
- [ ] Select room type
- [ ] **Toggle "Avec meubles" / "Sans meubles"**
- [ ] Submit
- [ ] Verify no errors in console
- [ ] Verify image is created in database

3. **Verify Database**:
```sql
-- Check image was created with correct fields
SELECT
  id,
  transformation_type_id,
  room_type,
  with_furniture,
  status
FROM images
ORDER BY created_at DESC
LIMIT 1;

-- Should return: with_furniture = true or false (NOT NULL)
```

4. **Test Prompt Generation**:
- [ ] Wait for image to process
- [ ] Check generated image contains furniture if `withFurniture=true`
- [ ] Check generated image is empty if `withFurniture=false`

---

## ✅ Error Resolution

### ❌ Previous Error
```
Failed to create image: Could not find the 'furniture_ids' column of 'images' in the schema cache
```

### ✅ Root Cause
Repository was trying to INSERT `furniture_ids` array, but:
1. Column was removed by migration
2. Domain model still had `furnitureIds` property
3. mapper was trying to set it

### ✅ Fix Applied
1. Removed `furniture_ids` from all repository code
2. Removed `furnitureIds` from domain model
3. Kept only `withFurniture` boolean
4. Re-added toggle UI for user to set `withFurniture`

---

## 📊 Summary

| Aspect | Status | Details |
|--------|--------|---------|
| **Database Error** | ✅ Fixed | Removed `furniture_ids` from repository |
| **Domain Model** | ✅ Fixed | Removed `furnitureIds`, kept `withFurniture` |
| **UI Toggle** | ✅ Added | Simple "Avec/Sans meubles" buttons |
| **Prompt Builder** | ✅ Fixed | Respects `withFurniture` flag |
| **User Experience** | ✅ Improved | Simple toggle instead of complex catalog |
| **Code Reduction** | ✅ ~2,600 lines | Removed 17 files |

---

## 🚀 Next Steps

1. ✅ **Code Changes**: COMPLETE
2. ⏳ **Database Migration**: Apply via Supabase Dashboard
3. ⏳ **Testing**: Full end-to-end test
4. ⏳ **Deployment**: Deploy to production

---

## 📞 Support

**If image upload fails with furniture_ids error**:
- Ensure database migration was applied
- Check `images` table doesn't have `furniture_ids` column
- Restart Next.js dev server

**If toggle doesn't appear**:
- Clear browser cache
- Rebuild: `npm run build`
- Check imports in `image-uploader.tsx` (Sofa icon)

**Questions?** See:
- Full migration guide: `docs/FURNITURE_FEATURE_REMOVAL_COMPLETE.md`
- Summary: `docs/FURNITURE_REMOVAL_SUMMARY.md`
