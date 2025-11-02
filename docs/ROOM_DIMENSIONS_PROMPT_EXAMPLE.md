# 📏 Room Dimensions - Example Prompt Output

**Date**: 2025-11-02

This document shows what the final prompt will look like when room dimensions are provided.

---

## Example Input

```typescript
await buildPrompt({
  transformationTypeId: "modern-staging-uuid",
  roomType: "chambre",
  withFurniture: true,
  roomWidth: 3.5,      // 3.5 meters
  roomLength: 4.2,     // 4.2 meters
  roomArea: undefined, // Will be auto-calculated
});
```

---

## Generated Prompt (Excerpt)

```
IMAGE-TO-IMAGE transformation: Apply Modern Staging style to this Bedroom while preserving EXACT spatial structure. Professional architectural photography, wide-angle lens, natural lighting, 8K resolution, photorealistic real estate image.

===== CRITICAL: PRESERVE ORIGINAL IMAGE STRUCTURE (weight: 3.0) =====

⚠️ EXACT ROOM DIMENSIONS - MUST PRESERVE (weight: 3.5) ⚠️
This room measures: 3.5m x 4.2m (14.7m²)
• These dimensions are FIXED and CANNOT change
• Transform style/colors/furniture BUT keep these exact measurements
• Width and length LOCKED to these values
• Total area MUST remain 14.7m²

⚠️ STRICT GEOMETRIC PRESERVATION - NO MODIFICATIONS ALLOWED ⚠️

TRANSFORM ONLY: Colors, materials, furniture, lighting, decorations
PRESERVE 100%: Room size, walls, doors, windows, ceiling, floor layout, perspective

1. EXACT ROOM DIMENSIONS (weight: 3.0)
   • Room size CANNOT change - same width, length, height
   • If room is small, keep it small. If large, keep it large.
   • NO expanding or shrinking the space
   • Wall-to-wall distances LOCKED
   • Ceiling height FIXED

2. PRESERVE EVERY ARCHITECTURAL ELEMENT (weight: 3.0)
   • COUNT all walls/doors/windows in original → MUST match exactly in output
   • Door positions CANNOT move (left/right/center stays same)
   • Window positions LOCKED (same wall, same location)
   • Doorframes, openings, passages: EXACT same shape and position
   • If there's an entrance on the right → MUST remain on the right
   • If there's NO door on a wall → MUST stay empty
   • Radiators, pipes, fixed elements: KEEP in place

[... rest of prompt continues ...]
```

---

## Key Observations

### 1. **Dimension Constraint Appears First**

The room dimensions appear **IMMEDIATELY** after the critical preservation header, with the **HIGHEST weight** (3.5).

This ensures the AI sees it early in the prompt (better attention).

### 2. **Weight Hierarchy**

```
weight: 3.5 → Room dimensions (NEW - HIGHEST PRIORITY)
weight: 3.0 → Architectural preservation
weight: 3.0 → Furniture scale & realism
weight: 2.5 → Spatial coherence
weight: 2.0 → Style application
```

Room dimensions now have **THE HIGHEST PRIORITY** of any constraint.

### 3. **Clear, Explicit Language**

```
✅ "This room measures: 3.5m x 4.2m (14.7m²)"     → Concrete measurement
✅ "These dimensions are FIXED and CANNOT change" → Absolute constraint
✅ "Width and length LOCKED to these values"      → Repetition for emphasis
```

### 4. **Multiple Reinforcement**

The dimensions are mentioned:
1. **At the top** (weight 3.5 section)
2. **In section 1** ("EXACT ROOM DIMENSIONS")
3. **In final instruction** ("maintaining original architecture")

This gives the AI **multiple opportunities** to register the constraint.

---

## Comparison: With vs Without Dimensions

### WITHOUT Dimensions (Current)

```
===== CRITICAL: PRESERVE ORIGINAL IMAGE STRUCTURE (weight: 3.0) =====

⚠️ STRICT GEOMETRIC PRESERVATION - NO MODIFICATIONS ALLOWED ⚠️

TRANSFORM ONLY: Colors, materials, furniture, lighting, decorations
PRESERVE 100%: Room size, walls, doors, windows, ceiling, floor layout, perspective

1. EXACT ROOM DIMENSIONS (weight: 3.0)
   • Room size CANNOT change - same width, length, height
   ...
```

**Problem**: AI doesn't know WHAT the room dimensions are. It must infer from the image, which is unreliable.

### WITH Dimensions (New)

```
===== CRITICAL: PRESERVE ORIGINAL IMAGE STRUCTURE (weight: 3.0) =====

⚠️ EXACT ROOM DIMENSIONS - MUST PRESERVE (weight: 3.5) ⚠️
This room measures: 3.5m x 4.2m (14.7m²)
• These dimensions are FIXED and CANNOT change
• Transform style/colors/furniture BUT keep these exact measurements
• Width and length LOCKED to these values
• Total area MUST remain 14.7m²

⚠️ STRICT GEOMETRIC PRESERVATION - NO MODIFICATIONS ALLOWED ⚠️
...
```

**Solution**: AI knows EXACTLY what dimensions to preserve. No guessing required.

---

## Edge Cases

### Case 1: Only Area Provided

**Input**:
```typescript
roomWidth: undefined,
roomLength: undefined,
roomArea: 15.0,
```

**Output**:
```
⚠️ EXACT ROOM DIMENSIONS - MUST PRESERVE (weight: 3.5) ⚠️
This room measures: 15.0m²
• These dimensions are FIXED and CANNOT change
• Transform style/colors/furniture BUT keep these exact measurements
• Total area MUST remain 15.0m²
```

### Case 2: Width + Length + Manual Area

**Input**:
```typescript
roomWidth: 3.5,
roomLength: 4.2,
roomArea: 15.0,  // Manually set (doesn't match calculated 14.7)
```

**Output**:
```
⚠️ EXACT ROOM DIMENSIONS - MUST PRESERVE (weight: 3.5) ⚠️
This room measures: 3.5m x 4.2m (15.0m²)
• These dimensions are FIXED and CANNOT change
• Transform style/colors/furniture BUT keep these exact measurements
• Width and length LOCKED to these values
• Total area MUST remain 15.0m²
```

**Note**: Uses provided area (15.0) instead of calculated (14.7).

### Case 3: No Dimensions Provided

**Input**:
```typescript
roomWidth: undefined,
roomLength: undefined,
roomArea: undefined,
```

**Output**:
```
===== CRITICAL: PRESERVE ORIGINAL IMAGE STRUCTURE (weight: 3.0) =====

⚠️ STRICT GEOMETRIC PRESERVATION - NO MODIFICATIONS ALLOWED ⚠️

TRANSFORM ONLY: Colors, materials, furniture, lighting, decorations
PRESERVE 100%: Room size, walls, doors, windows, ceiling, floor layout, perspective
...
```

**Note**: Empty `{{room_dimensions}}` variable → No dimension constraint added. Works exactly as before (backward compatible).

---

## Technical Details

### Template Variable Replacement

**Template** (prompt-templates.ts):
```typescript
===== CRITICAL: PRESERVE ORIGINAL IMAGE STRUCTURE (weight: 3.0) =====
{{room_dimensions}}
⚠️ STRICT GEOMETRIC PRESERVATION - NO MODIFICATIONS ALLOWED ⚠️
```

**Variable** (prompt-builder.ts):
```typescript
if (dimensionParts.length > 0) {
  variables.room_dimensions = `
⚠️ EXACT ROOM DIMENSIONS - MUST PRESERVE (weight: 3.5) ⚠️
This room measures: ${dimensionParts.join(' ')}
• These dimensions are FIXED and CANNOT change
• Transform style/colors/furniture BUT keep these exact measurements
• Width and length LOCKED to these values
• Total area MUST remain ${dimensionParts[dimensionParts.length - 1]}
`;
} else {
  variables.room_dimensions = ''; // Empty string if no dimensions
}
```

**Result**: `fillTemplate(template, variables)` replaces `{{room_dimensions}}` with the generated constraint text.

---

## Expected AI Behavior

### With Explicit Dimensions

**AI reasoning** (hypothetical):
```
1. Reads prompt: "This room measures: 3.5m x 4.2m (14.7m²)"
2. Notes weight 3.5 (highest priority)
3. Generates image while respecting these exact measurements
4. Validates output: "Is this 3.5m × 4.2m?" → Yes → Success
```

### Without Explicit Dimensions

**AI reasoning** (hypothetical):
```
1. Reads prompt: "Room size CANNOT change"
2. Tries to infer dimensions from image (unreliable)
3. Generates image with approximate dimensions
4. No validation possible (doesn't know target measurements)
```

---

## Why Weight 3.5 (Not 3.0)?

**Weight hierarchy**:
- 3.5 → **Room dimensions** (new, highest)
- 3.0 → Architectural preservation
- 3.0 → Furniture scale
- 2.5 → Spatial coherence
- 2.0 → Style application

**Rationale**:
- User requirement: "vraiment de chez vraiment garder les dimensions"
- This is THE #1 priority, above all else
- Weight 3.5 ensures AI prioritizes dimensions over architecture, furniture, and style
- If there's a conflict, dimensions win

**Example conflict resolution**:
```
Scenario: AI wants to place a 2m sofa, but that would make the room look 5m wide (should be 3.5m)

Weight 3.5: "Room is 3.5m wide" → AI adjusts sofa or placement to respect 3.5m width
Weight 3.0: "Preserve architecture" → Might compromise dimensions for better architecture
```

With weight 3.5, **dimensions always win**.

---

## Summary

**Key Innovation**: Providing explicit room measurements (3.5m × 4.2m) with the **HIGHEST weight** (3.5) gives the AI concrete targets instead of forcing it to guess from visual cues.

**Prompt Engineering**:
- Dimensions appear **first** (better attention)
- Weight **3.5** (highest priority)
- **Multiple reinforcement** (appears 3 times in prompt)
- **Clear, explicit language** ("FIXED", "LOCKED", "CANNOT change")

**Expected Result**:
Finally preserve room dimensions accurately, satisfying the user's critical requirement: "vraiment de chez vraiment garder les dimensions".

**Fallback**: If this doesn't work, we know the problem is NOT in the prompts—it's in the AI model or API limitations. Would then try ControlNet or alternative service.

---

**Last Updated**: 2025-11-02
