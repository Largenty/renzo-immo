#!/bin/bash

# Architectural Preservation Testing Script
# Date: 2025-11-02
# Purpose: Verify that architectural preservation improvements are in place

echo "🏗️  Testing Architectural Preservation Implementation..."
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check 1: Verify prompt templates have weight 3.0
echo "📝 Check 1: Verifying prompt template weights..."
WEIGHT_3_COUNT=$(grep -c "weight: 3.0" src/lib/prompts/prompt-templates.ts 2>/dev/null)
if [ "$WEIGHT_3_COUNT" -ge 8 ]; then
    echo -e "${GREEN}✅ Found $WEIGHT_3_COUNT instances of 'weight: 3.0' (expected: 8+)${NC}"
else
    echo -e "${RED}❌ Only found $WEIGHT_3_COUNT instances of 'weight: 3.0' (expected: 8+)${NC}"
    ((ERRORS++))
fi
echo ""

# Check 2: Verify strength parameter in API
echo "🔧 Check 2: Verifying strength parameter in NanoBanana API..."
if grep -q "strength: 0.65" app/api/generate-image/route.ts; then
    echo -e "${GREEN}✅ Strength parameter (0.65) found in generate-image API${NC}"
else
    echo -e "${RED}❌ Strength parameter NOT found or incorrect value${NC}"
    echo "Expected: strength: 0.65"
    echo "Found:"
    grep "strength:" app/api/generate-image/route.ts || echo "  (none)"
    ((ERRORS++))
fi
echo ""

# Check 3: Verify enhanced negative prompts
echo "🚫 Check 3: Verifying enhanced negative prompts..."
NEGATIVE_KEYWORDS=(
    "room size changed"
    "expanded room"
    "doors moved"
    "windows moved"
    "removed openings"
    "changed room geometry"
    "perspective distortion"
)

MISSING_KEYWORDS=0
for keyword in "${NEGATIVE_KEYWORDS[@]}"; do
    if ! grep -q "$keyword" src/lib/prompts/prompt-templates.ts; then
        echo -e "${YELLOW}⚠️  Missing negative keyword: '$keyword'${NC}"
        ((MISSING_KEYWORDS++))
    fi
done

if [ $MISSING_KEYWORDS -eq 0 ]; then
    echo -e "${GREEN}✅ All critical negative prompt keywords present${NC}"
else
    echo -e "${YELLOW}⚠️  $MISSING_KEYWORDS negative keywords missing${NC}"
    ((WARNINGS++))
fi
echo ""

# Check 4: Verify "CANNOT change" language
echo "🔒 Check 4: Verifying explicit constraint language..."
CANNOT_COUNT=$(grep -c "CANNOT" src/lib/prompts/prompt-templates.ts 2>/dev/null)
MUST_COUNT=$(grep -c "MUST" src/lib/prompts/prompt-templates.ts 2>/dev/null)

if [ "$CANNOT_COUNT" -ge 5 ] && [ "$MUST_COUNT" -ge 10 ]; then
    echo -e "${GREEN}✅ Explicit constraints present:${NC}"
    echo "   - 'CANNOT': $CANNOT_COUNT instances"
    echo "   - 'MUST': $MUST_COUNT instances"
else
    echo -e "${YELLOW}⚠️  Fewer explicit constraints than expected:${NC}"
    echo "   - 'CANNOT': $CANNOT_COUNT (expected: 5+)"
    echo "   - 'MUST': $MUST_COUNT (expected: 10+)"
    ((WARNINGS++))
fi
echo ""

# Check 5: Verify room dimension preservation instructions
echo "📐 Check 5: Checking room dimension preservation..."
if grep -q "Room size CANNOT change" src/lib/prompts/prompt-templates.ts && \
   grep -q "NO expanding or shrinking" src/lib/prompts/prompt-templates.ts; then
    echo -e "${GREEN}✅ Room dimension preservation instructions present${NC}"
else
    echo -e "${RED}❌ Room dimension instructions missing or incomplete${NC}"
    ((ERRORS++))
fi
echo ""

# Check 6: Verify door/window counting instructions
echo "🚪 Check 6: Checking door/window tracking..."
if grep -q "COUNT all walls/doors/windows" src/lib/prompts/prompt-templates.ts; then
    echo -e "${GREEN}✅ Door/window counting instructions present${NC}"
else
    echo -e "${RED}❌ Door/window counting instructions missing${NC}"
    ((ERRORS++))
fi
echo ""

# Check 7: Verify IMAGE-TO-IMAGE framing
echo "🖼️  Check 7: Verifying IMAGE-TO-IMAGE framing..."
if grep -q "IMAGE-TO-IMAGE transformation" src/lib/prompts/prompt-templates.ts; then
    echo -e "${GREEN}✅ IMAGE-TO-IMAGE framing present${NC}"
else
    echo -e "${YELLOW}⚠️  IMAGE-TO-IMAGE framing not found${NC}"
    ((WARNINGS++))
fi
echo ""

# Check 8: Verify verification checklist
echo "✅ Check 8: Checking pre-generation verification..."
if grep -q "BEFORE generating, verify:" src/lib/prompts/prompt-templates.ts; then
    echo -e "${GREEN}✅ Pre-generation verification checklist present${NC}"
else
    echo -e "${YELLOW}⚠️  Pre-generation verification checklist not found${NC}"
    ((WARNINGS++))
fi
echo ""

# Check 9: Documentation exists
echo "📚 Check 9: Checking documentation..."
if [ -f "docs/ARCHITECTURAL_PRESERVATION_FINAL.md" ]; then
    echo -e "${GREEN}✅ Documentation exists: ARCHITECTURAL_PRESERVATION_FINAL.md${NC}"
else
    echo -e "${YELLOW}⚠️  Documentation missing: ARCHITECTURAL_PRESERVATION_FINAL.md${NC}"
    ((WARNINGS++))
fi
echo ""

# Check 10: TypeScript compilation (architectural-related errors)
echo "🔧 Check 10: Checking TypeScript compilation..."
if command -v npx &> /dev/null; then
    ARCH_TS_ERRORS=$(npx tsc --noEmit 2>&1 | grep -E "(generate-image|prompt-template)" | wc -l)
    if [ "$ARCH_TS_ERRORS" -eq 0 ]; then
        echo -e "${GREEN}✅ No TypeScript errors in modified files${NC}"
    else
        echo -e "${RED}❌ Found $ARCH_TS_ERRORS TypeScript errors in modified files${NC}"
        npx tsc --noEmit 2>&1 | grep -E "(generate-image|prompt-template)"
        ((ERRORS++))
    fi
else
    echo -e "${YELLOW}⚠️  npx not found, skipping TypeScript check${NC}"
    ((WARNINGS++))
fi
echo ""

# Summary
echo "=========================================="
echo "📊 Test Summary"
echo "=========================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "🎉 Architectural preservation improvements are in place!"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "  1. ⏳ USER TESTING REQUIRED"
    echo "     - Upload a problematic 'Avant' image"
    echo "     - Generate with same style/room type"
    echo "     - Compare architectural preservation"
    echo ""
    echo "  2. Test checklist:"
    echo "     □ Room dimensions preserved"
    echo "     □ Doors stay in same position"
    echo "     □ Windows stay in same position"
    echo "     □ No new openings created"
    echo "     □ Walls stay vertical"
    echo "     □ Floor doesn't extend into walls"
    echo "     □ Perspective matches original"
    echo ""
    echo "  3. If tests pass:"
    echo "     - Apply database migration (if not done)"
    echo "     - Deploy to production"
    echo ""
    echo "  4. If tests fail:"
    echo "     - Adjust strength parameter (try 0.55 or 0.60)"
    echo "     - Share comparison images for analysis"
    echo ""
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  PASSED WITH WARNINGS${NC}"
    echo "Warnings: $WARNINGS"
    echo ""
    echo "The implementation is mostly complete, but review warnings above."
    exit 0
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "Errors: $ERRORS"
    echo "Warnings: $WARNINGS"
    echo ""
    echo "Please fix the errors above before testing."
    exit 1
fi
