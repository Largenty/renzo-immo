# 📏 Room Dimensions Feature - Implementation Complete

**Date**: 2025-11-02
**Status**: ✅ **BACKEND COMPLETE** - UI & Database Pending
**Critical User Request**: "est ce que si on donne largeur de la piece et m² ça aiderait ?"

---

## 🎯 Problem Statement

After 4 iterations of strength parameter adjustments (0.65 → 0.55 → 0.58 → 0.50), room dimensions are still not being preserved accurately. The user suggested a new approach:

**User's Idea**: "What if we provide the room width and m²? Would that help?"

**Hypothesis**: Providing concrete measurements (e.g., "3.5m x 4.2m, 14.7m²") gives the AI explicit targets instead of forcing it to infer proportions from visual cues alone.

---

## ✅ What's Been Implemented

### 1. Domain Model Updated

**File**: `/src/domain/images/models/image.ts` (Lines 37-39)

```typescript
export interface Image {
  // ... existing fields
  roomWidth?: number  // Largeur de la pièce en mètres
  roomLength?: number // Longueur de la pièce en mètres
  roomArea?: number   // Surface en m²
  // ... other fields
}
```

### 2. PromptBuilder Interface Updated

**File**: `/src/lib/prompts/prompt-builder.ts` (Lines 45-53)

```typescript
export interface PromptBuilderParams {
  transformationTypeId: string;
  roomType: RoomType;
  withFurniture?: boolean;
  customPrompt?: string | null;
  roomWidth?: number;  // NEW - Largeur de la pièce en mètres (optionnel mais recommandé)
  roomLength?: number; // NEW - Longueur de la pièce en mètres (optionnel mais recommandé)
  roomArea?: number;   // NEW - Surface en m² (optionnel, calculé si width/length fournis)
}
```

### 3. Prompt Assembly Logic Updated

**File**: `/src/lib/prompts/prompt-builder.ts` (Lines 316-331)

**Logic**:
- If `roomWidth` AND `roomLength` provided → Display "3.5m x 4.2m (14.7m²)"
- If only `roomArea` provided → Display "14.7m²"
- If nothing provided → Empty string (no dimension constraint)
- Area auto-calculated if not provided: `width * length`

**Generated prompt text**:
```
⚠️ EXACT ROOM DIMENSIONS - MUST PRESERVE (weight: 3.5) ⚠️
This room measures: 3.5m x 4.2m (14.7m²)
• These dimensions are FIXED and CANNOT change
• Transform style/colors/furniture BUT keep these exact measurements
• Width and length LOCKED to these values
• Total area MUST remain 14.7m²
```

**Key Innovation**: Weight increased to **3.5** (highest priority, above even architectural preservation at 3.0)

### 4. Templates Updated

**Files**: `/src/lib/prompts/prompt-templates.ts`

**Both templates** (`TEMPLATE_WITH_FURNITURE` and `TEMPLATE_WITHOUT_FURNITURE`) now include:
```
===== CRITICAL: PRESERVE ORIGINAL IMAGE STRUCTURE (weight: 3.0) =====
{{room_dimensions}}
⚠️ STRICT GEOMETRIC PRESERVATION - NO MODIFICATIONS ALLOWED ⚠️
```

**Documentation updated** (Line 14):
```typescript
 * Variables disponibles :
 * - {{room_dimensions}} : Dimensions exactes de la pièce (largeur x longueur, m²) - NOUVEAU
```

---

## 🔄 How It Works

### Data Flow

```
User Input (UI)
    ↓
  roomWidth: 3.5m
  roomLength: 4.2m
  roomArea: 14.7m²
    ↓
Image Creation API
    ↓
PromptBuilder.build()
    ↓
assemblePrompt()
    ↓
  Generates constraint text:
  "⚠️ EXACT ROOM DIMENSIONS - MUST PRESERVE (weight: 3.5) ⚠️
   This room measures: 3.5m x 4.2m (14.7m²)
   • These dimensions are FIXED and CANNOT change
   • Transform style/colors/furniture BUT keep these exact measurements
   • Width and length LOCKED to these values
   • Total area MUST remain 14.7m²"
    ↓
fillTemplate()
    ↓
Final prompt with {{room_dimensions}} replaced
    ↓
NanoBanana API
    ↓
Generated image (hopefully with correct dimensions!)
```

### Dimension Calculation Logic

**Case 1**: Width + Length provided
```typescript
roomWidth: 3.5, roomLength: 4.2, roomArea: undefined
→ Output: "3.5m x 4.2m (14.7m²)"
   Area calculated: 3.5 * 4.2 = 14.7m²
```

**Case 2**: Width + Length + Area provided
```typescript
roomWidth: 3.5, roomLength: 4.2, roomArea: 15.0
→ Output: "3.5m x 4.2m (15.0m²)"
   Uses provided area (doesn't override with calculation)
```

**Case 3**: Only Area provided
```typescript
roomWidth: undefined, roomLength: undefined, roomArea: 15.0
→ Output: "15.0m²"
   No dimensions shown, just area
```

**Case 4**: Nothing provided
```typescript
roomWidth: undefined, roomLength: undefined, roomArea: undefined
→ Output: "" (empty string)
   No dimension constraint added to prompt
```

---

## ⚠️ What's NOT Yet Done

### 1. Database Schema Update

**Needed**: Migration to add columns to `images` table

```sql
-- Migration needed
ALTER TABLE images
  ADD COLUMN room_width DECIMAL(4,2),
  ADD COLUMN room_length DECIMAL(4,2),
  ADD COLUMN room_area DECIMAL(6,2);

-- Add indexes for potential queries
CREATE INDEX idx_images_room_dimensions ON images(room_width, room_length, room_area);
```

**File to create**: `supabase/migrations/YYYYMMDD_add_room_dimensions.sql`

### 2. API Endpoint Update

**File**: `/app/api/generate-image/route.ts`

**Need to**:
1. Accept `roomWidth`, `roomLength`, `roomArea` from request body
2. Validate dimensions (e.g., width > 0, length > 0, area > 0)
3. Pass to `buildPrompt()` function
4. Store dimensions in database when creating image record

**Example validation**:
```typescript
const bodySchema = z.object({
  // ... existing fields
  roomWidth: z.number().positive().optional(),
  roomLength: z.number().positive().optional(),
  roomArea: z.number().positive().optional(),
});
```

### 3. UI Components

**Need to add** dimension input fields to:

#### A. New Project Page
**File**: `/app/dashboard/projects/[id]/edit/page.tsx` or create new component

**UI mockup**:
```
┌─────────────────────────────────────────┐
│ Dimensions de la pièce (optionnel)     │
├─────────────────────────────────────────┤
│ Largeur: [____] m                       │
│ Longueur: [____] m                      │
│ Surface: [____] m² (calculé auto)      │
│                                         │
│ ℹ️ Fournir les dimensions réelles aide │
│    l'IA à respecter les proportions    │
└─────────────────────────────────────────┘
```

**Features needed**:
- Two number inputs (width, length)
- Auto-calculate area when both filled
- Optional manual area override
- Clear button to reset
- Help tooltip explaining benefit

#### B. Validation & UX

**Client-side validation**:
```typescript
const schema = z.object({
  roomWidth: z.number().min(1).max(50).optional(), // 1-50m reasonable range
  roomLength: z.number().min(1).max(50).optional(),
  roomArea: z.number().min(1).max(2500).optional(), // 1-2500m² reasonable range
});
```

**UX considerations**:
- If width OR length provided, require BOTH (can't have just one)
- If area calculated from width×length, show in gray (read-only)
- If user manually overrides area, show in black (editable)
- Store in local state until image generation

### 4. Image List Display

**Optional enhancement**: Show dimensions in image cards

```typescript
// In ImageCard component
{image.roomWidth && image.roomLength && (
  <div className="text-xs text-muted-foreground">
    📏 {image.roomWidth}m × {image.roomLength}m ({image.roomArea?.toFixed(1)}m²)
  </div>
)}
```

---

## 🧪 Testing Plan

### Manual Testing Checklist

Once UI is complete:

```
□ Generate image WITHOUT dimensions
  → Should work as before (no {{room_dimensions}} in prompt)

□ Generate image with width + length ONLY
  → Area should auto-calculate
  → Prompt should include "3.5m x 4.2m (14.7m²)"

□ Generate image with width + length + manual area
  → Should use manual area, not calculated
  → Prompt should include "3.5m x 4.2m (15.0m²)"

□ Generate image with area ONLY
  → Prompt should include just "14.7m²"

□ Edge cases:
  □ Width = 0 → Should reject
  □ Negative dimensions → Should reject
  □ Width provided but no length → Should require both
  □ Very large dimensions (100m+) → Should warn or limit
```

### A/B Testing Strategy

**Goal**: Verify if providing dimensions actually improves accuracy

**Test groups**:
1. **Control**: Same image, no dimensions, strength 0.50
2. **Test**: Same image, WITH dimensions, strength 0.50

**Metrics to compare**:
- Room size preservation (measure wall-to-wall in output)
- User satisfaction ("Did it preserve dimensions?")
- Furniture sizing (improved or same?)
- Style application (weaker or same?)

**Hypothesis**:
- ✅ **Expected**: Dimensions better preserved with explicit measurements
- ⚠️ **Risk**: Style application might weaken if AI focuses too much on dimensions
- ⚠️ **Risk**: Prompt might become too long/complex

---

## 💡 Why This Approach Makes Sense

### Theoretical Basis

**Problem with visual inference**:
- AI must infer scale from visual cues (furniture, doors, windows)
- Perspective distortion makes accurate measurement impossible
- AI has no "ruler" to measure distances in pixels

**Solution with explicit dimensions**:
- Provides a concrete target: "This room is 3.5m × 4.2m"
- AI can use this as a constraint during generation
- Acts as a "sanity check" for spatial relationships

### Analogy to Human Interior Design

When a real interior designer receives a project:
- ❌ **Bad brief**: "Here's a photo, make it look modern"
- ✅ **Good brief**: "Here's a photo of a 3.5m × 4.2m bedroom, make it look modern"

The dimensions help the designer:
1. Choose appropriately sized furniture
2. Plan layout with correct scale
3. Avoid spatial impossibilities (e.g., 2m sofa in 2m wall)

**Same principle applies to AI**: Give it the measurements, and it can respect them.

---

## 🔧 Alternative Approaches (If This Fails)

### Option 1: ControlNet Depth Map

**How it works**:
1. Extract depth map from input image
2. Use depth ControlNet during generation
3. Depth map FORCES spatial preservation absolutely
4. Can then use higher strength (0.60-0.70) safely

**Pros**:
- Guarantees spatial structure preservation
- Proven technique for architecture retention

**Cons**:
- Requires ControlNet support from NanoBanana
- More complex implementation
- Additional API cost possible

### Option 2: Multi-Pass Generation

**How it works**:
1. **Pass 1** (strength 0.40): Lock architecture, minimal style
2. **Pass 2** (strength 0.60): Apply style to Pass 1 output

**Pros**:
- Architecture locked in Pass 1
- Style can be stronger in Pass 2

**Cons**:
- 2x API calls = 2x cost + 2x time
- May introduce artifacts between passes

### Option 3: Segmentation Masks

**How it works**:
1. Segment input image (walls, floor, ceiling, furniture zones)
2. Send masks to API with prompt
3. API respects mask boundaries

**Pros**:
- Precise control over what changes
- Furniture zones can be strictly defined

**Cons**:
- Requires segmentation model
- Complex implementation
- May not be supported by NanoBanana

---

## 📊 Expected Impact

### Best Case Scenario ✅

**Dimensions provided**: 3.5m × 4.2m (14.7m²)

**Prompt includes**:
```
⚠️ EXACT ROOM DIMENSIONS - MUST PRESERVE (weight: 3.5) ⚠️
This room measures: 3.5m x 4.2m (14.7m²)
• These dimensions are FIXED and CANNOT change
...
```

**Result**:
- Room dimensions preserved accurately (width, length, area)
- Furniture sized proportionally to actual measurements
- Wall spacing correct (e.g., window to closet distance)
- User satisfied: "Vraiment de chez vraiment garder les dimensions" ✅

### Moderate Case ⚠️

**Result**:
- Dimensions BETTER preserved than before
- Still some drift, but significantly less
- Combined with strength 0.50, acceptable accuracy
- User satisfied enough to deploy

### Worst Case ❌

**Result**:
- No improvement over previous approach
- Dimensions still wrong despite explicit constraint
- Prompt weight 3.5 not enough to override AI behavior

**Next steps if this happens**:
1. Try ControlNet approach (Option 1)
2. Contact NanoBanana support for architecture-specific parameters
3. Consider alternative AI service with better structure preservation

---

## 🚀 Implementation Roadmap

### Phase 1: Backend ✅ **COMPLETE**
- ✅ Domain model updated
- ✅ PromptBuilder interface updated
- ✅ Prompt assembly logic implemented
- ✅ Templates updated
- ✅ TypeScript compilation verified

### Phase 2: Database (NEXT)
- ❌ Create migration file
- ❌ Add columns to `images` table
- ❌ Run migration on Supabase
- ❌ Verify columns exist

### Phase 3: API Integration
- ❌ Update `/app/api/generate-image/route.ts`
- ❌ Accept dimension parameters from request
- ❌ Add validation with Zod schema
- ❌ Pass to `buildPrompt()`
- ❌ Store dimensions in database
- ❌ Test with Postman/curl

### Phase 4: UI Development
- ❌ Create dimension input component
- ❌ Add to project creation/edit page
- ❌ Implement auto-calculation (width × length = area)
- ❌ Add validation and error messages
- ❌ Add help tooltip
- ❌ Style with Tailwind/shadcn

### Phase 5: Testing & Refinement
- ❌ Manual testing with real images
- ❌ A/B comparison (with vs without dimensions)
- ❌ User feedback collection
- ❌ Adjust prompt weight if needed (3.5 → 4.0?)
- ❌ Iterate on UI/UX based on feedback

---

## 📝 Files Modified So Far

### Backend Implementation
1. `/src/domain/images/models/image.ts`
   - Added `roomWidth`, `roomLength`, `roomArea` fields

2. `/src/lib/prompts/prompt-builder.ts`
   - Updated `PromptBuilderParams` interface
   - Added dimension handling in `assemblePrompt()`
   - Generates high-priority dimension constraint text

3. `/src/lib/prompts/prompt-templates.ts`
   - Added `{{room_dimensions}}` placeholder to both templates
   - Updated documentation comments

### Documentation
1. `/docs/ROOM_DIMENSIONS_FEATURE.md` (this file)

---

## 💬 User Feedback History

**Evolution of the problem**:
1. "améliore le prompts d'un point de vue perspective" → Prompt improvements (FAILED)
2. "la taille des meubles n'est toujours pas bonne" → Furniture sizing issues
3. "dimension des mur entre fenetre et placard ne marche pas" → Architecture distorted
4. "vraiment de chez vraiment garder les dimensions" → CRITICAL emphasis on dimensions
5. **"est ce que si on donne largeur de la piece et m² ça aiderait ?"** → NEW APPROACH ⭐

**This is the user's idea** - they suggested providing explicit dimensions as a potential solution after multiple iterations failed.

---

## ✅ Summary

**Status**: Backend implementation **COMPLETE** ✅

**What works now**:
- PromptBuilder accepts room dimensions
- Dimensions injected into prompt with weight 3.5
- Falls back gracefully if no dimensions provided

**What's needed next**:
1. Database migration
2. API endpoint update
3. UI component for dimension input
4. Testing with real images

**Expected outcome**:
- Providing concrete measurements ("3.5m × 4.2m") gives AI explicit targets
- Weight 3.5 (highest) prioritizes dimensional accuracy
- Combined with strength 0.50, should finally preserve room dimensions
- User requirement satisfied: "vraiment garder les dimensions" ✅

**Risk assessment**:
- 🟢 **Low risk**: Backend implementation is clean and backward-compatible
- 🟡 **Medium risk**: UI needs careful UX design (optional but recommended)
- 🔴 **High risk**: No guarantee this approach will work (needs testing)

**Fallback plan**: If dimensions don't help, try ControlNet or multi-pass generation

---

**Last Updated**: 2025-11-02
**Next Step**: Create database migration for room dimension columns
