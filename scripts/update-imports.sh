#!/bin/bash

# Script de migration des imports vers la nouvelle architecture modules/

echo "🔄 Mise à jour des imports vers l'architecture modules/"
echo "=================================================="

SRC_DIR="/home/ludo/dev/renzo-immo"

# Fonction pour remplacer les imports
replace_imports() {
  local old_pattern=$1
  local new_pattern=$2
  local description=$3

  echo ""
  echo "📝 $description"
  echo "   $old_pattern → $new_pattern"

  # Compter les occurrences avant
  local count=$(find "$SRC_DIR/src" "$SRC_DIR/app" -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "$old_pattern" {} \; 2>/dev/null | wc -l)

  if [ "$count" -gt 0 ]; then
    echo "   Fichiers à modifier: $count"

    # Remplacer
    find "$SRC_DIR/src" "$SRC_DIR/app" -type f \( -name "*.ts" -o -name "*.tsx" \) \
      -exec sed -i "s|$old_pattern|$new_pattern|g" {} \;

    echo "   ✅ Fait!"
  else
    echo "   ⏭️  Aucune occurrence trouvée"
  fi
}

# ============================================
# MODULE AUTH
# ============================================
echo ""
echo "🔐 Module AUTH"
replace_imports "@/domain/auth" "@/modules/auth" "Domain auth → Module auth"
replace_imports "@/application/auth" "@/modules/auth" "Application auth → Module auth"
replace_imports "@/infrastructure/supabase/auth" "@/modules/auth" "Infrastructure auth → Module auth"
replace_imports "@/presentation/features/auth" "@/modules/auth" "Presentation auth → Module auth"

# ============================================
# MODULE CREDITS
# ============================================
echo ""
echo "💳 Module CREDITS"
replace_imports "@/domain/credits" "@/modules/credits" "Domain credits → Module credits"
replace_imports "@/application/credits" "@/modules/credits" "Application credits → Module credits"
replace_imports "@/infrastructure/supabase/credits" "@/modules/credits" "Infrastructure credits → Module credits"
replace_imports "@/presentation/features/credits" "@/modules/credits" "Presentation credits → Module credits"

# ============================================
# MODULE PROJECTS
# ============================================
echo ""
echo "📁 Module PROJECTS"
replace_imports "@/domain/projects" "@/modules/projects" "Domain projects → Module projects"
replace_imports "@/application/projects" "@/modules/projects" "Application projects → Module projects"
replace_imports "@/infrastructure/supabase/project" "@/modules/projects" "Infrastructure projects → Module projects"
replace_imports "@/presentation/features/projects" "@/modules/projects" "Presentation projects → Module projects"

# ============================================
# MODULE IMAGES
# ============================================
echo ""
echo "🖼️  Module IMAGES"
replace_imports "@/domain/images" "@/modules/images" "Domain images → Module images"
replace_imports "@/application/images" "@/modules/images" "Application images → Module images"
replace_imports "@/infrastructure/ai" "@/modules/images" "Infrastructure AI → Module images"
replace_imports "@/presentation/features/images" "@/modules/images" "Presentation images → Module images"
replace_imports "@/presentation/features/upload" "@/modules/images" "Presentation upload → Module images"

# ============================================
# MODULE ROOMS
# ============================================
echo ""
echo "🏠 Module ROOMS"
replace_imports "@/domain/rooms" "@/modules/rooms" "Domain rooms → Module rooms"
replace_imports "@/presentation/features/rooms" "@/modules/rooms" "Presentation rooms → Module rooms"

# ============================================
# MODULE STYLES
# ============================================
echo ""
echo "🎨 Module STYLES"
replace_imports "@/domain/styles" "@/modules/styles" "Domain styles → Module styles"
replace_imports "@/application/styles" "@/modules/styles" "Application styles → Module styles"

# ============================================
# SHARED COMPONENTS
# ============================================
echo ""
echo "🔧 Shared Components"
replace_imports "@/presentation/shared/ui" "@/shared" "UI components → Shared"
replace_imports "@/presentation/shared/layout" "@/shared" "Layout → Shared"
replace_imports "@/presentation/shared/providers" "@/shared" "Providers → Shared"
replace_imports "@/hooks/use-toast" "@/shared" "Hooks → Shared"
replace_imports "from '@/lib/utils'" "from '@/shared'" "Utils → Shared"

echo ""
echo "=================================================="
echo "✅ Migration des imports terminée!"
echo ""
echo "Prochaines étapes:"
echo "1. Vérifier le build: npm run build"
echo "2. Corriger les imports qui posent problème"
echo "3. Supprimer les anciens dossiers (domain/, application/, etc.)"
echo ""
