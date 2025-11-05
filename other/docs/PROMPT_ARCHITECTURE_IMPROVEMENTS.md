# 🏗️ Prompt Architecture Improvements

**Date**: 2025-11-02
**Issue**: Generated images show architectural inconsistencies (walls misaligned, floor extending into walls, doorways blocked, perspective distortion)
**Solution**: Reinforced architectural preservation constraints in prompts

---

## 🐛 Problems Identified

### Visual Issues in Generated Images
Based on the "Avant/Après" example provided:

1. **Perspective Distortion**
   - Walls not properly aligned
   - Perspective lines don't match original
   - Room proportions changed

2. **Spatial Incoherence**
   - Floor texture extending up walls
   - Doorways/corridors blocked or mispositioned
   - Wall junctions not aligned correctly

3. **Architectural Changes**
   - Door positions shifted
   - Wall angles modified
   - Room geometry altered

---

## ✅ Improvements Applied

### 1. **Increased Weight on Critical Constraints**

**Before**: `weight: 1.5`
**After**: `weight: 2.0`

Applied to:
- Perspective preservation
- Architecture preservation
- Spatial coherence (new)

### 2. **Added Explicit Spatial Coherence Rules**

New section added to both templates:

```
3. SPATIAL COHERENCE (weight: 1.8)
   • Floor surface ends at walls - no floor climbing walls
   • Doorways lead to actual spaces, not walls
   • Ceiling meets walls at proper angles
   • All architectural elements properly connected
   • No floating or disconnected surfaces
   • Correct depth perception and spatial relationships
```

### 3. **Reinforced Architecture Constraints**

**Before**:
```
• ALL walls, windows, doors remain identical
```

**After**:
```
• ALL walls, windows, doors, doorways, corridors MUST remain identical in position and size
• Wall junctions and corners MUST align correctly
• Doorframes and openings MUST maintain exact shape and position
• Floor MUST NOT extend into walls or doorways
• Walls MUST be vertical and properly aligned
```

### 4. **Enhanced Negative Prompts**

Added specific architectural error patterns to ban:

**New negative prompt keywords**:
- `floor extending into walls`
- `floor climbing walls`
- `walls not vertical`
- `misaligned wall junctions`
- `doorways blocked by walls`
- `incorrect spatial relationships`
- `perspective distortion`
- `warped geometry`
- `disconnected surfaces`
- `architectural inconsistencies`
- `doors in wrong position`
- `windows moved`

### 5. **Strengthened Final Reinforcement**

**Before**:
```
CRITICAL REINFORCEMENT (weight: 1.5):
✓ Same perspective and camera angle as original
✓ Architecture completely unchanged
✓ Style palette accurately applied
```

**After**:
```
CRITICAL REINFORCEMENT (weight: 2.0):
✓ EXACT same perspective and camera angle as original
✓ ALL architectural elements (walls, doors, windows, doorways) completely unchanged in position and alignment
✓ Floor ONLY on floor surface, walls ONLY vertical
✓ Doorways and corridors maintain correct spatial logic
✓ Wall junctions and corners properly aligned
✓ Style palette accurately applied
✓ Professional photorealistic quality with correct depth and spatial coherence
```

---

## 📊 Changes Summary

| Template | Lines Changed | New Constraints Added | Weight Increased |
|----------|---------------|----------------------|------------------|
| `TEMPLATE_WITH_FURNITURE` | ~30 lines | 3. Spatial Coherence | 1.5 → 2.0 |
| `TEMPLATE_WITHOUT_FURNITURE` | ~30 lines | 3. Spatial Coherence | 1.5 → 2.0 |
| `NEGATIVE_PROMPT_WITH_FURNITURE` | +15 keywords | Spatial errors banned | N/A |
| `NEGATIVE_PROMPT_WITHOUT_FURNITURE` | +12 keywords | Spatial errors banned | N/A |

---

## 🎯 Expected Improvements

### What Should Be Better Now

1. **Perspective Accuracy**
   - Camera angle matches exactly
   - Vanishing points preserved
   - No warped or curved lines

2. **Wall Alignment**
   - Vertical walls stay vertical
   - Corners and junctions align properly
   - No shifted or rotated walls

3. **Floor/Wall Boundaries**
   - Floor texture stops at wall base
   - No floor extending up walls
   - Clear separation between surfaces

4. **Doorway Integrity**
   - Doors stay in same position
   - Doorframes maintain shape
   - Openings lead to logical spaces

5. **Spatial Logic**
   - All architectural elements connected properly
   - Correct depth perception
   - Realistic spatial relationships

---

## 🧪 Testing

### How to Verify Improvements

1. **Upload the same "Avant" image** used in the example
2. **Generate with same style** (likely "Home Staging Moderne")
3. **Check for improvements**:
   - [ ] Walls are vertical and aligned
   - [ ] Floor doesn't extend into walls
   - [ ] Doorways maintain position and shape
   - [ ] Perspective matches original
   - [ ] Wall junctions are clean
   - [ ] Overall spatial coherence

### Comparison Metrics

**Before** (with old prompts):
- Perspective: ❌ Distorted
- Wall alignment: ❌ Misaligned
- Floor boundaries: ❌ Extends into walls
- Doorways: ❌ Blocked/shifted
- Spatial coherence: ❌ Inconsistent

**After** (with new prompts):
- Perspective: ✅ Should match exactly
- Wall alignment: ✅ Should be correct
- Floor boundaries: ✅ Should end at walls
- Doorways: ✅ Should maintain position
- Spatial coherence: ✅ Should be logical

---

## 📝 Technical Details

### Files Modified

**Single file**: `/src/lib/prompts/prompt-templates.ts`

### Changes by Section

1. **Lines 30-53**: Enhanced `TEMPLATE_WITH_FURNITURE` constraints
2. **Lines 83-90**: Strengthened final reinforcement (WITH furniture)
3. **Lines 99-122**: Enhanced `TEMPLATE_WITHOUT_FURNITURE` constraints
4. **Lines 166-174**: Strengthened final reinforcement (WITHOUT furniture)
5. **Line 180**: Expanded `NEGATIVE_PROMPT_WITH_FURNITURE`
6. **Line 182**: Expanded `NEGATIVE_PROMPT_WITHOUT_FURNITURE`

### Total Impact

- **Lines changed**: ~60 lines
- **New keywords**: ~27 architectural terms
- **Weight adjustments**: 4 sections (1.5 → 2.0)
- **New constraint section**: Spatial Coherence (weight: 1.8)

---

## 🚀 Deployment

No special deployment needed:
- ✅ Changes are in prompt templates (code)
- ✅ No database migration required
- ✅ No API changes needed
- ✅ Takes effect immediately on next image generation

**To Apply**:
1. Code already updated in `prompt-templates.ts`
2. Restart dev server: `npm run dev`
3. Test with new image generation

---

## 💡 Future Improvements

If issues persist, consider:

1. **ControlNet Integration**
   - Use depth maps to enforce perspective
   - Use edge detection to preserve walls
   - Use segmentation masks for spatial coherence

2. **Multi-Pass Generation**
   - First pass: preserve architecture only
   - Second pass: apply style and add furniture
   - Reduces chance of architectural drift

3. **Reference Image Weighting**
   - Increase influence of original image
   - Use img2img with higher denoising strength
   - Better preservation of structure

4. **Custom Fine-Tuning**
   - Train LoRA specifically for architectural preservation
   - Dataset of "good" transformations
   - Penalize spatial inconsistencies

---

## 📞 Support

If architectural issues persist after these improvements:

1. **Check NanoBanana API settings**
   - Ensure using latest model version
   - Verify image size and aspect ratio match
   - Check denoising strength (should be ~0.7-0.8)

2. **Provide feedback with examples**
   - Save "Avant" and "Après" images
   - Note specific issues (walls, floors, doors)
   - Share in `docs/issues/` for analysis

3. **Consider alternative approaches**
   - Different transformation types
   - Multiple generations + best selection
   - Manual touch-ups in post-processing

---

## ✅ Summary

Prompts have been **significantly strengthened** to enforce architectural preservation and spatial coherence. The key improvements are:

- 🔺 **Increased weights** (1.5 → 2.0) on critical constraints
- 📐 **New spatial coherence rules** to prevent geometric errors
- 🚫 **Expanded negative prompts** to ban specific architectural mistakes
- 📝 **More explicit instructions** using MUST/CRITICAL keywords
- ✅ **Detailed final reinforcement** covering all potential issues

These changes should dramatically reduce architectural inconsistencies like misaligned walls, floor extending into walls, and blocked doorways.
