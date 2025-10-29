-- ============================================
-- Ajouter les colonnes manquantes à la table images
-- ============================================

-- Vérifier d'abord si les colonnes existent déjà
DO $$
BEGIN
    -- Ajouter room_type si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'images'
        AND column_name = 'room_type'
    ) THEN
        ALTER TABLE public.images
        ADD COLUMN room_type VARCHAR(100);

        RAISE NOTICE '✅ Colonne room_type ajoutée';
    ELSE
        RAISE NOTICE '✓ Colonne room_type existe déjà';
    END IF;

    -- Vérifier que user_id existe (normalement oui)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'images'
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.images
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

        -- Créer l'index pour performance
        CREATE INDEX idx_images_user ON public.images(user_id);

        RAISE NOTICE '✅ Colonne user_id ajoutée';
    ELSE
        RAISE NOTICE '✓ Colonne user_id existe déjà';
    END IF;

    -- Vérifier que transformation_type existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'images'
        AND column_name = 'transformation_type'
    ) THEN
        ALTER TABLE public.images
        ADD COLUMN transformation_type VARCHAR(100) NOT NULL DEFAULT 'depersonnalisation';

        RAISE NOTICE '✅ Colonne transformation_type ajoutée';
    ELSE
        RAISE NOTICE '✓ Colonne transformation_type existe déjà';
    END IF;

END $$;

-- ============================================
-- Vérifications
-- ============================================

-- Afficher toutes les colonnes de la table images
SELECT
    '📋 Structure actuelle de la table images' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'images'
ORDER BY ordinal_position;

-- Vérifier que les colonnes requises existent
SELECT
    '✅ Vérification des colonnes requises' as check_type,
    CASE
        WHEN COUNT(*) = 7 THEN '✅ TOUTES les colonnes requises sont présentes'
        ELSE '❌ Il manque ' || (7 - COUNT(*))::text || ' colonnes'
    END as result
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'images'
  AND column_name IN (
    'id',
    'project_id',
    'user_id',
    'original_url',
    'transformation_type',
    'room_type',
    'status'
  );

-- Liste des colonnes manquantes (si il y en a)
SELECT
    '⚠️ Colonnes manquantes' as warning,
    required_column
FROM (
    VALUES
        ('id'),
        ('project_id'),
        ('user_id'),
        ('original_url'),
        ('transformation_type'),
        ('room_type'),
        ('status'),
        ('custom_prompt'),
        ('with_furniture'),
        ('transformed_url'),
        ('created_at')
) AS required(required_column)
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'images'
      AND column_name = required.required_column
);

-- ============================================
-- RÉSULTAT FINAL
-- ============================================

SELECT
    '🎯 RÉSULTAT' as summary,
    CASE
        WHEN room_type_exists AND user_id_exists AND transformation_type_exists
        THEN '✅ TOUT EST PRÊT ! Vous pouvez uploader des images maintenant.'
        WHEN NOT room_type_exists
        THEN '❌ Colonne room_type manquante - Relancez ce script'
        WHEN NOT user_id_exists
        THEN '❌ Colonne user_id manquante - Relancez ce script'
        WHEN NOT transformation_type_exists
        THEN '❌ Colonne transformation_type manquante - Relancez ce script'
        ELSE '⚠️ Problème inconnu'
    END as result
FROM (
    SELECT
        EXISTS(
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'images'
              AND column_name = 'room_type'
        ) as room_type_exists,
        EXISTS(
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'images'
              AND column_name = 'user_id'
        ) as user_id_exists,
        EXISTS(
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'images'
              AND column_name = 'transformation_type'
        ) as transformation_type_exists
) checks;

-- ============================================
-- Instructions
-- ============================================

/*
🚀 COMMENT UTILISER CE SCRIPT :

1. Copier TOUT ce fichier
2. Aller sur Supabase Dashboard → SQL Editor
3. Coller
4. Cliquer sur "RUN"
5. Vérifier le "RÉSULTAT FINAL" en bas

✅ Si vous voyez "TOUT EST PRÊT" :
   → Les colonnes sont maintenant créées
   → Retourner sur l'app
   → Recharger (F5)
   → Uploader une image
   → Ça devrait marcher !

📋 Vous verrez aussi :
   - La structure complète de la table images
   - Quelles colonnes ont été ajoutées
   - Quelles colonnes existaient déjà

❌ Si vous voyez "Colonne XXX manquante" :
   → Il y a eu une erreur SQL
   → Partagez le message d'erreur complet
*/
