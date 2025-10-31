-- Vérifier les URLs des images de couverture

SELECT
  id,
  name,
  cover_image_url,
  CASE
    WHEN cover_image_url IS NULL THEN '❌ Pas d''image'
    WHEN cover_image_url = '' THEN '⚠️ URL vide'
    ELSE '✅ URL présente'
  END as "Status",
  created_at
FROM projects
ORDER BY created_at DESC
LIMIT 10;
