-- Migration: Ajouter des colonnes structurées aux transactions de crédits
-- Permet d'éviter le parsing fragile de descriptions avec regex
-- Améliore les performances des requêtes avec des colonnes indexées

-- Ajouter les nouvelles colonnes
ALTER TABLE credit_transactions
ADD COLUMN IF NOT EXISTS image_count INTEGER,
ADD COLUMN IF NOT EXISTS image_quality VARCHAR(20) CHECK (image_quality IN ('standard', 'hd')),
ADD COLUMN IF NOT EXISTS related_project_name VARCHAR(255);

-- Créer des index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at
ON credit_transactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_image_quality
ON credit_transactions(user_id, image_quality)
WHERE image_quality IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_credit_transactions_type_created
ON credit_transactions(user_id, type, created_at DESC);

-- Commentaires pour la documentation
COMMENT ON COLUMN credit_transactions.image_count IS 'Nombre d''images générées dans cette transaction';
COMMENT ON COLUMN credit_transactions.image_quality IS 'Qualité des images générées (standard ou hd)';
COMMENT ON COLUMN credit_transactions.related_project_name IS 'Nom du projet lié à cette transaction';

-- Mettre à jour les données existantes en parsant les descriptions (migration ponctuelle)
-- Cette partie est optionnelle et peut être commentée si les anciennes données ne sont pas critiques

UPDATE credit_transactions
SET image_quality = 'hd'
WHERE description ILIKE '%HD%'
  AND image_quality IS NULL
  AND type = 'usage';

UPDATE credit_transactions
SET image_quality = 'standard'
WHERE description ILIKE '%image%'
  AND description NOT ILIKE '%HD%'
  AND image_quality IS NULL
  AND type = 'usage';

-- Essayer d'extraire le nombre d'images depuis les descriptions existantes
-- Format typique: "Génération de X images" ou "X images générées"
UPDATE credit_transactions
SET image_count = (
  SELECT CASE
    WHEN description ~* '(\d+)\s*image' THEN
      (regexp_match(description, '(\d+)\s*image', 'i'))[1]::INTEGER
    ELSE 1
  END
)
WHERE image_count IS NULL
  AND type = 'usage'
  AND description ~* '\d+\s*image';
