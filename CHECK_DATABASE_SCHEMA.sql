-- 🔍 VÉRIFICATION: Quelle est la vraie structure de la table images?

-- 1. Voir toutes les colonnes de la table images
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'images'
ORDER BY ordinal_position;

-- 2. Vérifier spécifiquement la colonne transformation
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'images'
AND column_name LIKE '%transformation%';

-- 3. Vérifier si furniture_ids existe
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'images'
AND column_name = 'furniture_ids';
