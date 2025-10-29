-- ============================================
-- Fix: Remplacer transformation_type_id par transformation_type
-- ============================================

-- 1. Supprimer la contrainte de foreign key si elle existe
DO $$
BEGIN
    -- Trouver et supprimer la contrainte FK
    EXECUTE (
        SELECT 'ALTER TABLE public.images DROP CONSTRAINT ' || constraint_name || ';'
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'images'
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name LIKE '%transformation_type%'
        LIMIT 1
    );
    RAISE NOTICE '✅ Contrainte FK transformation_type supprimée';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '✓ Aucune contrainte FK à supprimer';
END $$;

-- 2. Supprimer l'ancienne colonne transformation_type_id si elle existe
ALTER TABLE public.images DROP COLUMN IF EXISTS transformation_type_id;

-- 3. Ajouter la nouvelle colonne transformation_type (string)
DO $$
BEGIN
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

-- 4. Ajouter room_type si elle n'existe pas
DO $$
BEGIN
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
END $$;

-- 5. Ajouter user_id si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'images'
          AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.images
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

        CREATE INDEX IF NOT EXISTS idx_images_user ON public.images(user_id);

        RAISE NOTICE '✅ Colonne user_id ajoutée';
    ELSE
        RAISE NOTICE '✓ Colonne user_id existe déjà';
    END IF;
END $$;

-- ============================================
-- Vérifications
-- ============================================

-- Afficher la structure de la table images
SELECT
    '📋 Structure table images' as info,
    column_name,
    data_type,
    is_nullable,
    CASE
        WHEN column_default IS NOT NULL THEN column_default::text
        ELSE 'NULL'
    END as default_value
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'images'
ORDER BY ordinal_position;

-- Vérifier les colonnes requises
SELECT
    '✅ Colonnes requises' as check_type,
    CASE
        WHEN transformation_type AND room_type AND user_id
        THEN '✅ TOUTES les colonnes requises sont présentes'
        ELSE '❌ Il manque des colonnes'
    END as result
FROM (
    SELECT
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'images' AND column_name = 'transformation_type') as transformation_type,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'images' AND column_name = 'room_type') as room_type,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'images' AND column_name = 'user_id') as user_id
) checks;

-- Vérifier qu'il n'y a plus de transformation_type_id
SELECT
    '⚠️ Anciennes colonnes' as warning,
    CASE
        WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'images' AND column_name = 'transformation_type_id')
        THEN '⚠️ transformation_type_id existe encore (relancez le script)'
        ELSE '✅ transformation_type_id a été supprimée'
    END as result;

-- ============================================
-- RÉSULTAT FINAL
-- ============================================

SELECT
    '🎯 RÉSULTAT FINAL' as summary,
    CASE
        WHEN has_transformation_type AND has_room_type AND has_user_id AND NOT has_old_column
        THEN '✅ TOUT EST PRÊT ! Vous pouvez uploader des images maintenant.'
        WHEN has_old_column
        THEN '❌ L''ancienne colonne transformation_type_id existe encore - Relancez ce script'
        WHEN NOT has_transformation_type
        THEN '❌ Colonne transformation_type manquante - Relancez ce script'
        WHEN NOT has_room_type
        THEN '❌ Colonne room_type manquante - Relancez ce script'
        WHEN NOT has_user_id
        THEN '❌ Colonne user_id manquante - Relancez ce script'
        ELSE '⚠️ Problème inconnu'
    END as result
FROM (
    SELECT
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'images' AND column_name = 'transformation_type') as has_transformation_type,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'images' AND column_name = 'room_type') as has_room_type,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'images' AND column_name = 'user_id') as has_user_id,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'images' AND column_name = 'transformation_type_id') as has_old_column
) checks;

-- ============================================
-- Instructions
-- ============================================

/*
🚀 COMMENT UTILISER :

1. Copier TOUT ce fichier
2. Aller sur Supabase SQL Editor
3. Coller et cliquer "RUN"
4. Vérifier le "RÉSULTAT FINAL"

✅ Si "TOUT EST PRÊT" :
   → Recharger l'app (F5)
   → Uploader une image
   → Ça devrait marcher !

❌ Si erreur :
   → Partager le message d'erreur complet

Ce script :
- Supprime transformation_type_id (FK vers transformation_types)
- Ajoute transformation_type (VARCHAR simple)
- Ajoute room_type
- Ajoute user_id
*/
