-- Script pour réparer les images en statut "processing" sans metadata
-- Ces images sont bloquées car elles n'ont pas de taskId pour vérifier leur statut

-- 1. D'abord, ajouter la colonne metadata si elle n'existe pas déjà
ALTER TABLE images
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Réinitialiser les images en "processing" sans taskId vers "pending"
-- pour qu'elles puissent être régénérées
UPDATE images
SET
  status = 'pending',
  processing_started_at = NULL,
  error_message = 'Reset: No taskId found - ready to regenerate'
WHERE status = 'processing'
  AND (metadata IS NULL OR metadata->>'nanobanana_task_id' IS NULL);

-- 3. Afficher le résultat
SELECT
  COUNT(*) as images_reset,
  'Images réinitialisées de processing vers pending' as message
FROM images
WHERE status = 'pending'
  AND error_message = 'Reset: No taskId found - ready to regenerate';

-- 4. Réinitialiser également les images "failed" pour qu'elles puissent être retentées
UPDATE images
SET
  status = 'pending',
  processing_started_at = NULL,
  processing_completed_at = NULL,
  error_message = NULL
WHERE status = 'failed'
  AND project_id = '309b3758-d9ab-46cf-a8bc-2775ac24b279';

-- 5. Afficher toutes les images du projet après le fix
SELECT
  id,
  status,
  metadata->>'nanobanana_task_id' as task_id,
  created_at
FROM images
WHERE project_id = '309b3758-d9ab-46cf-a8bc-2775ac24b279'
ORDER BY created_at DESC;
