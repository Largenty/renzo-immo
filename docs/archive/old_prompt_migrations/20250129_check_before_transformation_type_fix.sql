-- Vérification avant d'appliquer le fix de transformation_type
-- Exécuter CE script d'abord pour voir ce qui va être impacté

-- 1. Compter les images existantes
SELECT
  'Images existantes' as check_type,
  COUNT(*) as total_images,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_images,
  COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_images,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_images
FROM images;

-- 2. Vérifier la structure actuelle
SELECT
  'Structure actuelle' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'images'
  AND column_name IN ('transformation_type_id', 'transformation_type', 'room_type', 'user_id')
ORDER BY column_name;

-- 3. Vérifier les types de transformation utilisés
SELECT
  'Types de transformation utilisés' as info,
  tt.slug,
  tt.name,
  COUNT(i.id) as usage_count
FROM images i
JOIN transformation_types tt ON i.transformation_type_id = tt.id
GROUP BY tt.slug, tt.name
ORDER BY usage_count DESC;

-- RÉSULTAT
SELECT
  '⚠️ IMPORTANT' as warning,
  CASE
    WHEN (SELECT COUNT(*) FROM images) > 0
    THEN '⚠️ Vous avez ' || (SELECT COUNT(*) FROM images) || ' images. Le fix va RÉINITIALISER toutes les images à "depersonnalisation". Sauvegarder si nécessaire!'
    ELSE '✅ Aucune image existante. Le fix peut être appliqué sans problème.'
  END as message;
