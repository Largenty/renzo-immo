# 📏 Room Dimensions Feature - Implementation Status

**Date**: 2025-11-02
**Your Suggestion**: "est ce que si on donne largeur de la piece et m² ça aiderait ?"
**Status**: ✅ **Backend Complete** | ⏳ **Database Migration Ready** | ❌ **UI Pending**

---

## 🎯 What You Suggested

After multiple attempts to preserve room dimensions with strength adjustments (0.65 → 0.55 → 0.58 → 0.50), you proposed:

> "What if we provide the room width and m²? Would that help?"

**This is a GREAT idea!** Instead of forcing the AI to guess proportions from the image, we give it explicit measurements like "3.5m × 4.2m (14.7m²)".

---

## ✅ What's Been Implemented (Backend)

### 1. **Domain Model Updated**

The `Image` interface now supports room dimensions:

```typescript
export interface Image {
  // ... existing fields
  roomWidth?: number   // Largeur en mètres (ex: 3.5)
  roomLength?: number  // Longueur en mètres (ex: 4.2)
  roomArea?: number    // Surface en m² (ex: 14.7)
}
```

### 2. **Prompt Builder Enhanced**

The AI prompt now includes explicit dimension constraints with **HIGHEST PRIORITY** (weight: 3.5):

**Example prompt text** when dimensions provided:
```
⚠️ EXACT ROOM DIMENSIONS - MUST PRESERVE (weight: 3.5) ⚠️
This room measures: 3.5m x 4.2m (14.7m²)
• These dimensions are FIXED and CANNOT change
• Transform style/colors/furniture BUT keep these exact measurements
• Width and length LOCKED to these values
• Total area MUST remain 14.7m²
```

**Smart behavior**:
- If `width + length` provided → Shows "3.5m x 4.2m (14.7m²)" (area auto-calculated)
- If only `area` provided → Shows "14.7m²"
- If nothing provided → No constraint (backward compatible)

### 3. **Database Migration Created**

File: `supabase/migrations/20251102_add_room_dimensions_to_images.sql`

Ready to run! Adds:
- `room_width` column (DECIMAL, optional)
- `room_length` column (DECIMAL, optional)
- `room_area` column (DECIMAL, optional)
- Validation constraints (must be > 0, max 100m/10000m²)
- Index for queries

---

## ⏳ What's Next (Required Steps)

### Step 1: Run Database Migration

**Command** (you need to run this):
```bash
npx supabase db push
```

Or manually apply the migration file in Supabase dashboard.

### Step 2: Update API Endpoint

**File**: `/app/api/generate-image/route.ts`

**Needs**:
1. Accept `roomWidth`, `roomLength`, `roomArea` from request body
2. Validate with Zod
3. Pass to `buildPrompt()` function
4. Store in database

**Example code needed**:
```typescript
// In the Zod schema
const bodySchema = z.object({
  // ... existing fields
  roomWidth: z.number().positive().max(100).optional(),
  roomLength: z.number().positive().max(100).optional(),
  roomArea: z.number().positive().max(10000).optional(),
});

// Pass to buildPrompt
const { prompt, negativePrompt } = await buildPrompt({
  transformationTypeId,
  roomType,
  withFurniture,
  customPrompt,
  roomWidth: validatedData.roomWidth,    // NEW
  roomLength: validatedData.roomLength,  // NEW
  roomArea: validatedData.roomArea,      // NEW
});
```

### Step 3: Create UI Component

**Where**: New project creation page or edit page

**UI Design** (proposal):
```
┌──────────────────────────────────────────────┐
│ 📏 Dimensions de la pièce (optionnel)       │
│                                              │
│ Fournir les dimensions aide l'IA à         │
│ respecter les proportions exactes.          │
│                                              │
│ Largeur:  [_____] m                         │
│ Longueur: [_____] m                         │
│ Surface:  [_____] m² (calculé auto)        │
│                                              │
│ [Effacer]                                   │
└──────────────────────────────────────────────┘
```

**Features**:
- Two number inputs (width, length)
- Auto-calculate area when both filled: `area = width × length`
- Optional manual area override
- Clear button to reset
- Help text explaining benefit

**Validation**:
- If one of width/length provided, require BOTH
- Must be positive numbers
- Reasonable range: 1-100m for dimensions, 1-10000m² for area

---

## 🧪 Testing Plan

Once everything is implemented:

### Test Case 1: Without Dimensions (Baseline)
- Generate image with NO dimensions provided
- Should work exactly as before
- Prompt will NOT include dimension constraint

### Test Case 2: With Dimensions (New Approach)
- Generate SAME image WITH dimensions (e.g., 3.5m × 4.2m)
- Compare output with baseline
- **Expected**: Better dimensional preservation

### Comparison Metrics
```
✓ Room width preserved? (measure wall-to-wall)
✓ Room length preserved?
✓ Wall spacing correct? (window to closet distance)
✓ Furniture properly sized?
✓ Overall proportions accurate?
```

---

## 💡 Why This Should Work

### Current Problem

With `strength: 0.50` and strong prompts, the AI STILL changes room dimensions because:
- It infers scale from visual cues (unreliable)
- Perspective distortion makes measurement impossible
- No "ruler" to measure pixel distances

### Solution with Explicit Dimensions

**Before** (AI guessing):
```
AI: "This looks like a room... maybe 4m wide? Or 5m? Hard to tell..."
→ Generates room at arbitrary scale
→ Dimensions drift
```

**After** (AI given measurements):
```
AI: "This is EXACTLY 3.5m × 4.2m (14.7m²)"
→ Constraint with HIGHEST weight (3.5)
→ AI must respect these exact measurements
→ Dimensions locked
```

### Real-World Analogy

**Interior designer receives brief**:
- ❌ Bad: "Here's a photo, style it modern" → Designer guesses scale
- ✅ Good: "3.5m × 4.2m bedroom, style it modern" → Designer knows exact measurements

**Same principle for AI**: Give measurements → Better results

---

## 📊 Expected Impact

### Best Case ✅
- Room dimensions **perfectly preserved** (3.5m × 4.2m exactly)
- Furniture sized **proportionally** to actual measurements
- Wall spacing **correct** (window to closet distance accurate)
- **User satisfied**: "Vraiment garder les dimensions" ✅

### Moderate Case ⚠️
- Dimensions **significantly better** than before
- Some minor drift, but acceptable
- Combined with strength 0.50, good enough for production

### Worst Case ❌
- **No improvement** despite explicit constraint
- AI ignores dimension constraint even at weight 3.5
- **Next step**: Try ControlNet or alternative AI service

---

## 🔧 Fallback Options (If This Fails)

### Option 1: ControlNet Depth Map
- Extract depth map from input
- Use depth ControlNet to FORCE spatial structure
- Guaranteed architecture preservation
- **Requires**: NanoBanana ControlNet support

### Option 2: Multi-Pass Generation
- **Pass 1** (strength 0.40): Lock architecture
- **Pass 2** (strength 0.60): Apply style
- **Trade-off**: 2x cost, 2x time

### Option 3: Contact NanoBanana Support
- Ask about architecture preservation parameters
- Request real estate / interior design specific features
- Check if there are undocumented options

---

## 📝 Summary

**What's been done**:
1. ✅ Backend code complete (PromptBuilder handles dimensions)
2. ✅ Database migration created (ready to run)
3. ✅ Documentation complete

**What you need to do**:
1. ⏳ **Run migration**: `npx supabase db push`
2. ⏳ **Update API endpoint**: Add dimension parameters
3. ⏳ **Create UI**: Dimension input component
4. ⏳ **Test**: Compare with/without dimensions

**Expected result**:
Your suggestion to provide explicit room measurements should give the AI concrete targets instead of forcing it to guess from visual cues. Combined with strength 0.50 and weight 3.5 (highest priority), this is our **best chance** to finally preserve dimensions accurately.

**Timeline**:
- Backend: ✅ **COMPLETE** (30 minutes)
- Migration: ⏳ **5 minutes** (just run the command)
- API update: ⏳ **15 minutes** (add parameters + validation)
- UI component: ⏳ **1-2 hours** (create form, styling, validation)
- Testing: ⏳ **30 minutes** (A/B comparison)

**Total remaining**: ~2-3 hours of work to fully deploy this feature.

---

**Files Created/Modified**:
1. `/src/domain/images/models/image.ts` - Added dimension fields
2. `/src/lib/prompts/prompt-builder.ts` - Dimension handling logic
3. `/src/lib/prompts/prompt-templates.ts` - Template placeholders
4. `/supabase/migrations/20251102_add_room_dimensions_to_images.sql` - Database schema
5. `/docs/ROOM_DIMENSIONS_FEATURE.md` - Complete technical documentation
6. `/docs/ROOM_DIMENSIONS_IMPLEMENTATION_STATUS.md` - This summary

**Last Updated**: 2025-11-02
