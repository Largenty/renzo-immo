#!/bin/bash

# Script pour migrer automatiquement les anciens imports vers les nouveaux

echo "🔄 Migration des imports..."

# Trouver tous les fichiers TypeScript/TSX
find /home/ludo/dev/renzo-immo/app /home/ludo/dev/renzo-immo/src/components -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" | while read file; do
  # Vérifier si le fichier contient des anciens imports
  if grep -q "from ['\"]@/lib/hooks" "$file" 2>/dev/null; then
    echo "📝 Migrating: $file"

    # Créer un backup
    cp "$file" "$file.backup"

    # Remplacer les imports
    sed -i "s|from ['\"]*@/lib/hooks/use-projects['\"]*|from '@/domain/projects'|g" "$file"
    sed -i "s|from ['\"]*@/lib/hooks/use-credits['\"]*|from '@/domain/credits'|g" "$file"
    sed -i "s|from ['\"]*@/lib/hooks/use-images['\"]*|from '@/domain/images'|g" "$file"
    sed -i "s|from ['\"]*@/lib/hooks/use-custom-styles['\"]*|from '@/domain/styles'|g" "$file"

    # Remplacer useProjects par les nouveaux hooks
    sed -i "s/useProjects(/useProjects(user?.id || '')/g" "$file"
  fi
done

# Remplacer les imports de stores
find /home/ludo/dev/renzo-immo/app /home/ludo/dev/renzo-immo/src/components -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" | while read file; do
  if grep -q "from ['\"]@/lib/stores" "$file" 2>/dev/null; then
    echo "📝 Migrating stores in: $file"

    # Créer un backup si pas déjà fait
    if [ ! -f "$file.backup" ]; then
      cp "$file" "$file.backup"
    fi

    # Remplacer les imports de stores
    sed -i "s|from ['\"]*@/lib/stores/auth-store['\"]*|from '@/domain/auth'|g" "$file"
    sed -i "s|from ['\"]*@/lib/stores/upload-store['\"]*|// MIGRATION NEEDED: upload-store removed|g" "$file"
    sed -i "s|from ['\"]*@/lib/stores/styles-store['\"]*|from '@/domain/styles'|g" "$file"
  fi
done

echo "✅ Migration terminée!"
echo "⚠️  Les backups sont dans *.backup"
echo "🔍 Vérifiez les fichiers et corrigez manuellement si nécessaire"
