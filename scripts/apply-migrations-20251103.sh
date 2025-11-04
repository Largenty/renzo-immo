#!/bin/bash

# =====================================================
# Apply Critical & High Priority Bug Fix Migrations
# =====================================================
# Date: 2025-11-03
# Purpose: Apply three migrations to fix race conditions,
#          add automatic triggers, and improve performance
# =====================================================

set -e  # Exit on error

echo "🚀 Starting migration application..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Migrations to apply:${NC}"
echo "  1. 20251103_fix_view_count_race_condition.sql"
echo "  2. 20251103_add_image_counter_triggers.sql"
echo "  3. 20251103_add_missing_indexes.sql"
echo ""

# Check if running in Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Error: Not in a Supabase project directory"
    exit 1
fi

echo -e "${YELLOW}⚠️  Make sure your Supabase database is accessible${NC}"
echo ""

# Method 1: Using Supabase CLI (recommended)
echo -e "${BLUE}Method 1: Supabase CLI (recommended)${NC}"
echo "Run this command:"
echo ""
echo -e "${GREEN}  npx supabase db push${NC}"
echo ""

# Method 2: Using psql directly
echo -e "${BLUE}Method 2: Direct psql (if CLI fails)${NC}"
echo "Run these commands in order:"
echo ""
echo -e "${GREEN}  psql \$DATABASE_URL -f supabase/migrations/20251103_fix_view_count_race_condition.sql${NC}"
echo -e "${GREEN}  psql \$DATABASE_URL -f supabase/migrations/20251103_add_image_counter_triggers.sql${NC}"
echo -e "${GREEN}  psql \$DATABASE_URL -f supabase/migrations/20251103_add_missing_indexes.sql${NC}"
echo ""

# Method 3: Using Supabase Dashboard
echo -e "${BLUE}Method 3: Supabase Dashboard${NC}"
echo "1. Go to https://app.supabase.com"
echo "2. Select your project"
echo "3. Go to 'SQL Editor'"
echo "4. Paste and run each migration file content in order"
echo ""

echo "✅ Choose one method above to apply the migrations"
echo ""
echo "🔍 After applying, verify with:"
echo -e "${GREEN}  npm run dev${NC}"
echo "   Then check that:"
echo "   - View counts are accurate on showcase pages"
echo "   - Image counters stay synchronized"
echo "   - No more polling timeout errors in console"
