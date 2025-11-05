# 🛋️ Furniture Scale & Realism Improvement

**Date**: 2025-11-02
**Status**: ✅ **COMPLETE**
**Issue**: Furniture items are oversized and don't respect realistic room proportions

---

## 🐛 Problem Identified

### User Feedback - Issue Evolution

**First Issue**: User shared an "Avant/Après" example where:
- ✅ Architecture preserved correctly (room size, walls, window position)
- ✅ Style applied successfully (colors, materials, lighting)
- ❌ **Furniture was oversized** - bed too large for the room
- ❌ **No realistic clearances** - furniture filled the entire space

**After First Fix** - User reported opposite problem:
- ❌ **Furniture is now TOO SMALL** - bed appears undersized for the room
- ❌ **Room feels empty** - too much empty space around furniture
- ❌ **Poor proportions** - furniture doesn't anchor the space properly

### Visual Analysis
In the latest "Après" image:
- The bed appears to be a small single or narrow double (~120-140cm)
- Excessive empty space around the bed
- For a bedroom of this size, a larger bed (160-180cm) would be more appropriate
- Room feels sparse and unfurnished despite having furniture

**Root Cause**: Initial constraints were too restrictive, overcorrecting the problem. The AI now generates **too small** furniture to avoid violating "oversized" rules.

---

## ✅ Solution Applied

### 1. **Balanced Furniture Scale Constraints** (weight: 2.5) - REVISED

**File**: `/src/lib/prompts/prompt-templates.ts`

**Updated section** (revised to find optimal balance):
```
⚠️ FURNITURE SCALE & REALISM (weight: 2.5) ⚠️
• Furniture MUST be proportionally sized for the room (not too large, not too small)
• OPTIMAL sizing: furniture fills space appropriately without crowding
• For bedrooms: bed should be centerpiece (140-180cm width for double), leave 60-80cm sides
• For living rooms: sofa proportional to wall length (2/3 of wall max), 50cm from walls
• Balance empty space and furnished areas (room should feel complete, not empty or cramped)
• All furniture items GROUNDED on floor with realistic shadows
• Correct depth and perspective for all furniture pieces
• Furniture placement respects door swing zones and maintains natural circulation
• Interior design principle: furniture should anchor the space, not float in it or overwhelm it
```

**Key principles REVISED**:
- **Optimal sizing**: Not too large, not too small - furniture should "anchor" the space
- **Bedroom-specific**: Double bed 140-180cm (was too restrictive before)
- **Balance**: Room should feel complete, not empty or cramped
- **Interior design approach**: Furniture is the focal point, fills space appropriately
- **Flexibility**: 60-80cm clearances (was too strict at 60-90cm)

### 2. **Revised Verification Checklist**

**Before** (original):
```
✓ Only colors/materials/furniture changed - NOTHING ELSE
```

**After First Fix** (too restrictive):
```
✓ Furniture scaled realistically for the room size
✓ Walking space and clearances maintained around furniture
```

**After Second Fix** (CURRENT - balanced):
```
✓ Furniture proportionally sized (not too large, not too small - fills space well)
✓ For bedrooms: bed is focal point (140-180cm for double bed)
✓ Balanced layout with appropriate clearances (60-80cm around bed)
```

### 3. **Balanced Negative Prompts** - REVISED

**Removed overly restrictive keywords** (caused undersizing):
- ❌ `oversized furniture`, `furniture too large`, `giant furniture`
- ❌ `no walking space`, `furniture cramped`
- ❌ `bed too large`, `sofa too big`, `furniture too big for room`

**Kept general proportion keywords**:
- ✅ `furniture out of proportion`
- ✅ `disproportionate furniture`
- ✅ `furniture blocking doors`
- ✅ `furniture overlapping`

**Added new balanced keywords** (prevent undersizing):
```typescript
export const NEGATIVE_PROMPT_WITH_FURNITURE = `
  ...(previous keywords)...,
  empty room with tiny furniture,   // ✅ NEW - prevents undersizing
  miniature furniture,              // ✅ NEW - prevents dollhouse effect
  dollhouse scale,                  // ✅ NEW - prevents miniature look
  furniture too far apart,          // ✅ NEW - prevents sparse layout
  sparse furniture,                 // ✅ NEW - room should feel complete
  room feels empty despite furniture, // ✅ NEW - balance check
  ...
```

**Strategy**: Ban both extremes (too large AND too small) for optimal balance.

---

## 📊 Changes Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Furniture Scale Constraints** | None | ✅ New section (weight: 2.5) |
| **Clearance Rules** | Not specified | ✅ 60-90cm bed, 50cm sofa |
| **Proportional Sizing** | Not enforced | ✅ "Small room → smaller furniture" |
| **Verification Checks** | 8 items | **10 items** (+2 furniture scale) |
| **Negative Prompt Keywords** | 40 keywords | **54 keywords** (+14 furniture-related) |

---

## 🎯 Expected Improvements

### Before (Old Prompts)
- ❌ Bed takes up 80-90% of room width
- ❌ No walking space around furniture
- ❌ Furniture cramped against walls
- ❌ Nightstands too large
- ❌ No circulation paths
- ⚠️ Room architecture preserved (this was working)

### After (New Prompts)
- ✅ Bed sized proportionally (leaves 60-90cm clearance on sides)
- ✅ Walking space maintained around all furniture
- ✅ Furniture scaled to room dimensions
- ✅ Realistic furniture placement
- ✅ Proper circulation paths
- ✅ Room architecture preserved (unchanged)

---

## 🧪 Testing Guide

### Test Case: Small Bedroom with Window

**Original Image**: Empty bedroom with single window (like user's example)

**Expected Result After Generation**:
- ✅ Bed centered but not oversized (max 160-180cm width in a 300cm room)
- ✅ 60-90cm clearance on each side of bed
- ✅ Nightstands proportional to room size
- ✅ Walking space to window maintained
- ✅ No furniture blocking door (if visible)

### Verification Checklist

```
Furniture Scale & Placement:
□ Bed size realistic for room (not 80%+ of width)
□ 60-90cm clearance on sides of bed
□ Nightstands proportional and not cramped
□ Walking path to window clear (min 70cm)
□ Furniture doesn't touch walls (50cm minimum)
□ No furniture blocking door swing
□ All furniture grounded on floor (not floating)
□ Perspective consistent across all furniture items

Architecture (Should NOT Change):
□ Room dimensions unchanged
□ Window position identical
□ Walls aligned correctly
□ Floor-wall boundaries clean

Style Application (Should Change):
□ Colors match selected style
□ Materials updated correctly
□ Lighting appropriate
□ Overall aesthetic cohesive
```

---

## 📝 Technical Details

### Furniture Scale Guidelines (Real-World Standards)

These are the **standard clearances** now enforced in the prompts:

| Furniture Type | Minimum Clearances |
|----------------|-------------------|
| **Bed** (double) | 60-90cm on sides, 90cm at foot |
| **Bed** (king) | 70-100cm on sides, 90cm at foot |
| **Sofa** | 50cm from wall, 70cm for TV viewing |
| **Dining table** | 90cm around table (chair + passage) |
| **Nightstand** | Max 50cm wide, 60cm from foot of bed |
| **Walking path** | Minimum 70cm, optimal 90cm |
| **Door swing zone** | 100cm arc from hinge, keep clear |

### Prompt Engineering Strategy

1. **Weight: 2.5** - High priority but below architectural preservation (3.0)
   - Ensures architecture is preserved first
   - Then enforces realistic furniture scaling

2. **Explicit Measurements** - Concrete numbers instead of vague guidance
   - "60-90cm around bed" vs "leave space"
   - Gives AI specific targets to aim for

3. **Negative Prompts** - Ban specific failure patterns
   - "oversized furniture", "furniture too large", "bed too large"
   - Prevents common AI mistakes

4. **Verification Checklist** - AI self-checks before output
   - Forces verification of clearances
   - Reduces likelihood of oversized furniture

---

## 🔧 Troubleshooting

### If Furniture Still Too Large

**Option 1: Increase Weight**
Change weight from 2.5 to 2.8 or 3.0:
```typescript
⚠️ FURNITURE SCALE & REALISM (weight: 3.0) ⚠️
```

**Option 2: Add More Explicit Size Limits**
Add maximum dimensions:
```
• Bed width MAX 50% of room width
• Sofa depth MAX 100cm from wall
• All furniture leaves 70cm+ walking paths
```

**Option 3: Adjust Strength Parameter**
If furniture scale issues persist, try reducing strength for more structure preservation:
```typescript
// In app/api/generate-image/route.ts
strength: 0.60  // More preservation (currently 0.65)
```

### If Furniture Too Small

If the AI overcorrects and furniture becomes too small:
- Reduce weight from 2.5 to 2.0
- Adjust clearance minimums (e.g., 50-70cm instead of 60-90cm)
- Add "appropriately sized" to positive prompt

---

## 📈 Integration with Previous Improvements

This improvement **complements** the architectural preservation work:

1. **Architectural Preservation** (weight: 3.0) - HIGHEST priority
   - Room size unchanged
   - Doors/windows in same positions
   - Perspective locked

2. **Furniture Scale** (weight: 2.5) - HIGH priority
   - Realistic furniture sizing
   - Proper clearances and spacing
   - Grounded and proportional

3. **Style Application** (weight: 2.0) - NORMAL priority
   - Colors and materials
   - Lighting and atmosphere
   - Aesthetic coherence

**Result**: Architecture preserved → Furniture sized realistically → Style applied beautifully

---

## 🚀 Deployment Status

- [x] ✅ Code changes applied
- [x] ✅ Furniture scale constraints added (weight: 2.5)
- [x] ✅ Verification checklist updated
- [x] ✅ Negative prompts enhanced (+14 keywords)
- [ ] ⏳ **USER TESTING REQUIRED**
- [ ] ⏳ Verify furniture now sized realistically
- [ ] ⏳ Deploy to production if tests pass

---

## 💡 Future Enhancements

If furniture placement/scale issues persist, consider:

1. **Room Type-Specific Furniture Sizes**
   ```typescript
   // In prompt builder
   if (roomType === "chambre") {
     furnitureGuidelines = "Bed max 180cm wide, nightstands 40-50cm"
   } else if (roomType === "salon") {
     furnitureGuidelines = "Sofa max 220cm long, coffee table 60cm from sofa"
   }
   ```

2. **Furniture Segmentation Masks**
   - Pre-define furniture placement zones
   - Use ControlNet segmentation to enforce zones
   - Guarantees furniture stays within designated areas

3. **Multi-Pass Generation**
   - Pass 1: Preserve architecture only
   - Pass 2: Add furniture with scale constraints
   - Pass 3: Apply final style refinements

4. **A/B Testing Different Clearances**
   - Test 60-90cm vs 70-100cm clearances
   - Measure user satisfaction
   - Find optimal balance for room types

---

## ✅ Summary

**Problem**: Furniture items were oversized and didn't respect realistic room proportions (bed too large, no walking space).

**Solution**: Added comprehensive furniture scale constraints with:
- New section (weight: 2.5) with explicit clearance rules
- 14 new negative prompt keywords banning oversized furniture
- Updated verification checklist with furniture scale checks

**Expected Result**: Furniture now sized proportionally to room dimensions, with realistic clearances (60-90cm around bed, 50cm from walls) and proper circulation paths.

**Status**: ✅ Code complete, ⏳ **Awaiting user testing**

---

**Files Modified**:
- `/src/lib/prompts/prompt-templates.ts` - Lines 80-88, 113-114, 248

**Related Documentation**:
- [ARCHITECTURAL_PRESERVATION_FINAL.md](./ARCHITECTURAL_PRESERVATION_FINAL.md) - Structural preservation
- [READY_FOR_TESTING.md](./READY_FOR_TESTING.md) - Testing guide

**Last Updated**: 2025-11-02
