#!/bin/bash

# Furniture Removal Verification Script
# Date: 2025-11-02
# Purpose: Verify that all furniture-related code has been removed

echo "🔍 Verifying Furniture Feature Removal..."
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check 1: Deleted files should not exist
echo "📁 Check 1: Verifying deleted files..."
DELETED_FILES=(
    "app/api/furniture/route.ts"
    "app/api/furniture/[id]/route.ts"
    "app/api/furniture/catalog/route.ts"
    "app/api/furniture/preset/route.ts"
    "src/domain/furniture"
    "src/repositories/furniture.repository.ts"
    "src/components/furniture"
    "src/lib/stores/furniture-store.ts"
    "app/dashboard/furniture"
)

for file in "${DELETED_FILES[@]}"; do
    if [ -e "$file" ]; then
        echo -e "${RED}❌ FOUND: $file (should be deleted)${NC}"
        ((ERRORS++))
    else
        echo -e "${GREEN}✅ OK: $file (deleted)${NC}"
    fi
done
echo ""

# Check 2: No furniture imports
echo "🔍 Check 2: Checking for furniture imports..."
FURNITURE_IMPORTS=$(grep -r "from.*furniture" --include="*.ts" --include="*.tsx" src/ app/ 2>/dev/null | grep -v "prompt-builder-old" | wc -l)
if [ "$FURNITURE_IMPORTS" -gt 0 ]; then
    echo -e "${RED}❌ Found $FURNITURE_IMPORTS furniture imports:${NC}"
    grep -r "from.*furniture" --include="*.ts" --include="*.tsx" src/ app/ 2>/dev/null | grep -v "prompt-builder-old"
    ((ERRORS++))
else
    echo -e "${GREEN}✅ No furniture imports found${NC}"
fi
echo ""

# Check 3: No furniture references in active code
echo "🔍 Check 3: Checking for furniture references..."
FURNITURE_REFS=$(grep -ri "furniture" --include="*.ts" --include="*.tsx" src/ app/ 2>/dev/null | \
    grep -v "prompt-builder-old" | \
    grep -v "// .*furniture" | \
    grep -v "FURNITURE" | \
    grep -v "node_modules" | \
    wc -l)
if [ "$FURNITURE_REFS" -gt 5 ]; then
    echo -e "${YELLOW}⚠️  Found $FURNITURE_REFS furniture references (check if they're in comments):${NC}"
    grep -ri "furniture" --include="*.ts" --include="*.tsx" src/ app/ 2>/dev/null | \
        grep -v "prompt-builder-old" | \
        grep -v "node_modules" | \
        head -10
    ((WARNINGS++))
else
    echo -e "${GREEN}✅ Minimal furniture references ($FURNITURE_REFS)${NC}"
fi
echo ""

# Check 4: Modified files exist and are valid
echo "📝 Check 4: Checking modified files..."
MODIFIED_FILES=(
    "src/repositories/index.ts"
    "src/lib/stores/index.ts"
    "src/components/upload/image-uploader.tsx"
    "app/dashboard/layout.tsx"
    "src/lib/prompts/prompt-builder.ts"
)

for file in "${MODIFIED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ MISSING: $file${NC}"
        ((ERRORS++))
    else
        echo -e "${GREEN}✅ EXISTS: $file${NC}"
    fi
done
echo ""

# Check 5: Database migration exists
echo "🗄️  Check 5: Checking database migration..."
MIGRATION_FILE="supabase/migrations/20251102_remove_furniture_user_features.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}❌ MISSING: $MIGRATION_FILE${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✅ EXISTS: $MIGRATION_FILE${NC}"

    # Check migration content
    if grep -q "DROP COLUMN.*furniture_ids" "$MIGRATION_FILE" && \
       grep -q "DROP COLUMN.*user_id" "$MIGRATION_FILE"; then
        echo -e "${GREEN}✅ Migration looks correct${NC}"
    else
        echo -e "${YELLOW}⚠️  Migration might be incomplete${NC}"
        ((WARNINGS++))
    fi
fi
echo ""

# Check 6: Documentation exists
echo "📚 Check 6: Checking documentation..."
DOC_FILES=(
    "docs/FURNITURE_FEATURE_REMOVAL_COMPLETE.md"
    "docs/FURNITURE_REMOVAL_SUMMARY.md"
    "docs/FURNITURE_DELETED_FILES.txt"
)

for file in "${DOC_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}⚠️  MISSING: $file${NC}"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✅ EXISTS: $file${NC}"
    fi
done
echo ""

# Check 7: TypeScript compilation (furniture-related errors only)
echo "🔧 Check 7: Checking TypeScript for furniture errors..."
if command -v npx &> /dev/null; then
    FURNITURE_TS_ERRORS=$(npx tsc --noEmit 2>&1 | grep -i furniture | grep -v "prompt-builder-old" | wc -l)
    if [ "$FURNITURE_TS_ERRORS" -gt 0 ]; then
        echo -e "${RED}❌ Found $FURNITURE_TS_ERRORS furniture-related TypeScript errors${NC}"
        npx tsc --noEmit 2>&1 | grep -i furniture | grep -v "prompt-builder-old"
        ((ERRORS++))
    else
        echo -e "${GREEN}✅ No furniture-related TypeScript errors${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  npx not found, skipping TypeScript check${NC}"
    ((WARNINGS++))
fi
echo ""

# Summary
echo "========================================"
echo "📊 Verification Summary"
echo "========================================"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "🎉 Furniture feature has been successfully removed!"
    echo ""
    echo "Next steps:"
    echo "  1. Apply database migration via Supabase Dashboard"
    echo "  2. Run: npm run build"
    echo "  3. Test image generation"
    echo "  4. Deploy to production"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  PASSED WITH WARNINGS${NC}"
    echo "Warnings: $WARNINGS"
    echo ""
    echo "Review the warnings above, but the removal is mostly complete."
    exit 0
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "Errors: $ERRORS"
    echo "Warnings: $WARNINGS"
    echo ""
    echo "Please fix the errors above before proceeding."
    exit 1
fi
