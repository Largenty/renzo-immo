-- Ajouter la colonne metadata pour stocker des données JSON (comme le taskId de NanoBanana)
ALTER TABLE public.images
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Index pour rechercher dans metadata
CREATE INDEX IF NOT EXISTS idx_images_metadata ON public.images USING GIN (metadata);

-- Commentaire
COMMENT ON COLUMN public.images.metadata IS 'Données JSON pour stocker des informations supplémentaires comme nanobanana_task_id';
