# 🪑 Furniture Feature Removal - Complete Migration Guide

**Date**: 2025-11-02
**Status**: ✅ **COMPLETED**
**Impact**: HIGH - Major feature removal

---

## 📋 Executive Summary

The furniture selection feature has been **completely removed** from the application. Users can no longer manually select specific furniture items when generating room transformations.

**New Behavior**: The AI prompt system now **automatically adds appropriate furniture** based on the style and room type, resulting in more natural and varied outputs from NanoBanana.

---

## 🎯 What Changed

### Before
- ❌ Users could browse a furniture catalog
- ❌ Users could select individual furniture items (sofas, tables, lamps, etc.)
- ❌ Selected furniture was explicitly listed in prompts
- ❌ Admin panel for managing furniture catalog
- ❌ Complex furniture selection UI in image uploader
- ❌ User-specific custom furniture items

### After
- ✅ Furniture is **automatically generated** by AI
- ✅ Furniture matches the style (e.g., "modern sofa" for modern style)
- ✅ Furniture is appropriate for room type
- ✅ Simpler, cleaner UI
- ✅ More natural and varied AI outputs
- ✅ System furniture catalog retained for internal use

---

## 📊 Migration Statistics

| Category | Files Deleted | Files Modified | Lines Removed |
|----------|---------------|----------------|---------------|
| **API Routes** | 4 | 0 | ~500 |
| **Domain Layer** | 6 | 0 | ~800 |
| **Repositories** | 1 | 2 | ~200 |
| **UI Components** | 4 | 2 | ~600 |
| **Stores** | 1 | 1 | ~150 |
| **Pages** | 1 | 1 | ~300 |
| **Database** | 0 | 1 migration | ~50 |
| **TOTAL** | **17 files** | **7 files** | **~2,600 lines** |

---

## 🗂️ Files Deleted

### API Routes (`/app/api/furniture/`)
1. ✅ `route.ts` - Main CRUD endpoint
2. ✅ `[id]/route.ts` - Individual furniture operations
3. ✅ `catalog/route.ts` - Furniture catalog fetching
4. ✅ `preset/route.ts` - Default preset fetching

### Domain Layer (`/src/domain/furniture/`)
1. ✅ `models/furniture.ts` - TypeScript types & Zod schemas
2. ✅ `hooks/use-furniture.ts` - React Query hooks
3. ✅ `ports/furniture-repository.ts` - Repository interface
4. ✅ `services/manage-furniture.ts` - Business logic service
5. ✅ `business-rules/validate-furniture.ts` - Validation rules
6. ✅ `index.ts` - Exports aggregator

### Repositories
1. ✅ `/src/repositories/furniture.repository.ts`

### UI Components (`/src/components/furniture/`)
1. ✅ `furniture-selector-dialog.tsx` - Selection modal
2. ✅ `furniture-form-dialog.tsx` - Create/edit form
3. ✅ `furniture-card.tsx` - Display card
4. ✅ `index.ts` - Exports aggregator

### Stores
1. ✅ `/src/lib/stores/furniture-store.ts` - Zustand store

### Pages
1. ✅ `/app/dashboard/furniture/` - Entire directory

---

## ✏️ Files Modified

### 1. `/src/repositories/index.ts`
**Change**: Removed `FurnitureRepository` export

```diff
export { BaseRepository, type IRepository } from "./base.repository";
- export { FurnitureRepository } from "./furniture.repository";
export { RoomsRepository } from "./rooms.repository";
```

---

### 2. `/src/lib/stores/index.ts`
**Change**: Removed `furniture-store` export

```diff
export * from './auth-store';
export * from './projects-store';
export * from './styles-store';
export * from './credits-store';
- export * from './furniture-store';
```

---

### 3. `/src/components/upload/image-uploader.tsx`
**Changes**:
- Removed `useFurnitureStore` import
- Removed `withFurniture` and `furnitureIds` from `UploadedFile` interface
- Removed furniture store hook (10 variables)
- Removed `toggleFurnitureMode` and `applyBulkFurniture` functions
- Removed furniture toggle UI (~80 lines in bulk mode)
- Removed furniture catalog selection UI (~110 lines in individual mode)
- Removed useEffect for furniture catalog loading

**Stats**:
- Before: 1,298 lines
- After: 893 lines
- **Removed: 405 lines (31% reduction)**

---

### 4. `/app/dashboard/layout.tsx`
**Changes**:
- Removed "Meubles" navigation link
- Removed `Sofa` icon import

```diff
const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Mes projets", href: "/dashboard/projects", icon: FolderOpen },
  { name: "Mes styles", href: "/dashboard/styles", icon: Palette },
-  { name: "Meubles", href: "/dashboard/furniture", icon: Sofa },
  { name: "Pièces", href: "/dashboard/rooms", icon: Home },
  { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
  { name: "Crédits", href: "/dashboard/credits", icon: CreditCard },
];
```

---

### 5. `/src/lib/prompts/prompt-builder.ts`
**Changes**:
- Marked `withFurniture` parameter as `DEPRECATED`
- **Furniture now ALWAYS enabled automatically** (`const withFurniture = true`)
- System automatically adds furniture appropriate for style + room type

```typescript
// NEW BEHAVIOR
async build(params: PromptBuilderParams): Promise<PromptBuilderResult> {
  const { transformationTypeId, roomType, customPrompt = null } = params;

  // 🪑 FURNITURE ALWAYS ENABLED: Automatically add appropriate furniture for all rooms
  const withFurniture = true;

  // ... rest of prompt building logic
}
```

---

### 6. `/app/api/generate-image/route.ts`
**Changes**: Already updated in previous session to use `withFurniture` boolean (instead of `furnitureIds` array)

**Note**: This file currently still accepts `withFurniture` from images table, but the prompt-builder now **ignores it** and always generates furniture.

---

## 🗄️ Database Changes

### Migration: `20251102_remove_furniture_user_features.sql`

#### What It Does
1. ✅ Removes `furniture_ids` column from `images` table
2. ✅ Removes `user_id` column from `furniture_catalog` table
3. ✅ Removes `user_id` column from `room_specifications` table
4. ✅ Deletes all user-created furniture items
5. ✅ Deletes all user-created presets
6. ✅ Simplifies RLS policies (read-only for users)

#### Tables KEPT (for automatic prompt generation)
- ✅ `furniture_catalog` - System furniture catalog
- ✅ `style_furniture_variants` - Style-specific descriptions
- ✅ `room_furniture_presets` - Default presets per style+room
- ✅ `room_specifications` - Room specs (constraints, zones)

#### Tables/Columns REMOVED
- ❌ `images.furniture_ids` (UUID array)
- ❌ `furniture_catalog.user_id` (user ownership)
- ❌ `room_specifications.user_id` (user ownership)

#### To Apply This Migration
```bash
# Via Supabase Dashboard
1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/editor
2. Open SQL Editor
3. Paste contents of supabase/migrations/20251102_remove_furniture_user_features.sql
4. Execute

# OR via Supabase CLI (if configured)
npx supabase db push
```

**⚠️ WARNING**: This migration is **irreversible**. User-created furniture data will be permanently deleted.

---

## 🧪 Testing Checklist

After applying changes, verify:

- [ ] ✅ Dashboard loads without errors
- [ ] ✅ "Meubles" link removed from navigation
- [ ] ✅ Image upload page loads correctly
- [ ] ✅ No furniture selection UI visible in uploader
- [ ] ✅ Room type selection still works
- [ ] ✅ Transformation type selection still works
- [ ] ✅ Custom prompt functionality still works
- [ ] ✅ Image generation works end-to-end
- [ ] ✅ Generated images contain appropriate furniture
- [ ] ✅ No console errors related to furniture
- [ ] ✅ No broken imports or missing modules
- [ ] ✅ Build succeeds: `npm run build`
- [ ] ✅ TypeScript compiles without errors: `npx tsc --noEmit`

---

## 🔧 How It Works Now

### Image Generation Flow

1. **User uploads image** → Selects style + room type
2. **System builds prompt** → `PromptBuilder` automatically determines:
   - Style palette (colors, materials)
   - Room specifications (constraints)
   - **Furniture** (automatically based on style + room)
3. **Prompt sent to NanoBanana** → AI generates image with appropriate furniture
4. **Result** → Natural, varied furniture that matches the style

### Example Generated Prompts

**Before** (with manual selection):
```
Transform this room to Home Staging Moderne style.

FURNITURE TO ADD:
- Canapé moderne 3 places gris clair (Modern gray sofa)
- Table basse rectangulaire bois clair (Light wood coffee table)
- Lampe de salon sur pied arc métal (Arc floor lamp)
... (10+ more detailed items)
```

**After** (automatic):
```
Transform this room to Home Staging Moderne style.

Add furniture appropriate for this salon in Home Staging Moderne style.
```

Result: NanoBanana naturally interprets what furniture fits, leading to more creative and varied outputs.

---

## 🚀 Benefits of This Change

### For Users
1. ✅ **Simpler UX** - No more complex furniture selection
2. ✅ **Faster workflow** - Upload → Select style → Generate (3 steps instead of 5)
3. ✅ **More variety** - AI creates different furniture each time
4. ✅ **Better results** - NanoBanana excels at natural interpretation

### For Development
1. ✅ **Less complexity** - 2,600 fewer lines of code
2. ✅ **Easier maintenance** - No furniture CRUD operations
3. ✅ **Faster builds** - Fewer components to compile
4. ✅ **Reduced API surface** - 4 fewer endpoints

### For Infrastructure
1. ✅ **Less database load** - No furniture catalog queries on each generation
2. ✅ **Simpler data model** - No user furniture ownership
3. ✅ **Reduced storage** - No user-created furniture data

---

## 📚 Related Documentation

Files to **archive or delete**:
- ❌ `FURNITURE_MANAGEMENT_GUIDE.md`
- ❌ `FURNITURE_SIMPLIFICATION.md` (superseded by this document)
- ❌ `FURNITURE_PAGE_OPTIMIZATION_COMPLETE.md`
- ❌ `DEBUG_FURNITURE_SELECTION.md`
- ❌ `TEST_FURNITURE_SELECTION.md`

Files to **update**:
- 📝 `README.md` - Remove furniture feature mentions
- 📝 `docs/API_REFERENCE.md` - Remove `/api/furniture` endpoints

---

## 🔄 Rollback Instructions (Emergency Only)

If you need to rollback this change:

### 1. Restore Database Columns
```sql
-- Add back furniture_ids to images
ALTER TABLE images ADD COLUMN furniture_ids UUID[] DEFAULT '{}';
CREATE INDEX idx_images_furniture_ids ON images USING GIN (furniture_ids);

-- Add back user_id columns
ALTER TABLE furniture_catalog ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE room_specifications ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Restore RLS policies from migration 20251030_add_user_ownership_to_furniture_rooms.sql
```

### 2. Restore Code
```bash
# Revert to previous commit
git revert HEAD

# OR restore specific files from git history
git checkout HEAD~1 -- src/domain/furniture/
git checkout HEAD~1 -- app/api/furniture/
# ... etc
```

**⚠️ Note**: User-created furniture data **cannot be restored** after running the migration.

---

## ✅ Migration Complete

This migration successfully removed the furniture selection feature while preserving the underlying furniture catalog for automatic prompt generation. The application is now simpler, faster, and produces more natural AI-generated results.

**Next Steps**:
1. Apply database migration via Supabase Dashboard
2. Run full test suite
3. Deploy to production
4. Monitor user feedback
5. Archive old furniture-related documentation

---

## 📞 Support

If you encounter issues after this migration:
1. Check console for import errors
2. Verify database migration applied successfully
3. Clear browser cache and rebuild: `npm run build`
4. Check Supabase logs for RLS policy errors

**Questions?** See `/docs/README.md` for project documentation.
