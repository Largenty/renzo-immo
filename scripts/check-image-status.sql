-- Vérifier le statut des images et leurs metadata
SELECT
  id,
  project_id,
  status,
  metadata->>'nanobanana_task_id' as task_id,
  original_url,
  transformed_url,
  processing_started_at,
  created_at
FROM images
WHERE project_id = '309b3758-d9ab-46cf-a8bc-2775ac24b279'
ORDER BY created_at DESC
LIMIT 10;
