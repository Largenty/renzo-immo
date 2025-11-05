-- =====================================================
-- MIGRATION MODULAR 001: Core Tables for Modular Prompt System
-- =====================================================
-- Description: Système de prompts modulaires avec furniture catalog
-- Risque: FAIBLE (nouvelles tables)
-- =====================================================

BEGIN;

-- =====================================================
-- 1. ENUMS
-- =====================================================

-- Catégories de meubles
DO $$ BEGIN
  CREATE TYPE furniture_category AS ENUM (
    'seating',       -- Canapés, fauteuils, chaises
    'table',         -- Tables (basse, à manger, bureau)
    'storage',       -- Rangements (étagères, commodes, placards)
    'bed',           -- Lits
    'lighting',      -- Lampes, lustres
    'decor',         -- Décorations (plantes, tableaux, tapis)
    'appliance',     -- Électroménager (cuisine, sdb)
    'fixture'        -- Fixtures fixes (robinetterie, etc.)
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE furniture_category IS 'Catégories de meubles et objets';

-- Room type (si pas déjà créé)
DO $$ BEGIN
  CREATE TYPE room_type AS ENUM (
    'salon',
    'chambre',
    'cuisine',
    'salle_a_manger',
    'salle_de_bain',
    'wc',
    'bureau',
    'entree',
    'couloir',
    'terrasse',
    'balcon',
    'jardin',
    'garage',
    'cave',
    'grenier',
    'buanderie',
    'dressing',
    'veranda',
    'mezzanine',
    'autre'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- 2. TABLE: room_specifications
-- =====================================================

CREATE TABLE IF NOT EXISTS public.room_specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identifiant
  room_type room_type NOT NULL UNIQUE,
  display_name_fr VARCHAR(100) NOT NULL,
  display_name_en VARCHAR(100) NOT NULL,

  -- Contraintes architecturales
  constraints_text TEXT NOT NULL,

  -- Dimensions typiques (en m²)
  typical_area_min DECIMAL(5,2) NULL,
  typical_area_max DECIMAL(5,2) NULL,

  -- Zones fonctionnelles (JSON)
  zones JSONB NULL,

  -- Métadonnées
  description TEXT NULL,
  icon_name VARCHAR(50) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.room_specifications IS 'Spécifications et contraintes par type de pièce';
COMMENT ON COLUMN public.room_specifications.constraints_text IS 'Contraintes architecturales à respecter';
COMMENT ON COLUMN public.room_specifications.zones IS 'Zones fonctionnelles en JSON';

CREATE INDEX IF NOT EXISTS idx_room_specifications_type
  ON public.room_specifications (room_type);

-- =====================================================
-- 3. TABLE: style_palettes
-- =====================================================

CREATE TABLE IF NOT EXISTS public.style_palettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Référence au style
  transformation_type_id UUID NOT NULL REFERENCES public.transformation_types(id) ON DELETE CASCADE,

  -- Palette de couleurs
  wall_colors TEXT[] NOT NULL DEFAULT '{}',
  floor_materials TEXT[] NOT NULL DEFAULT '{}',
  accent_colors TEXT[] NOT NULL DEFAULT '{}',

  -- Matériaux et finitions
  materials TEXT[] NOT NULL DEFAULT '{}',
  finishes TEXT[] NOT NULL DEFAULT '{}',

  -- Ambiance
  ambiance_keywords TEXT[] NOT NULL DEFAULT '{}',
  lighting_style TEXT NULL,

  -- Instructions générales
  general_instructions TEXT NULL,

  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Un seul palette par transformation_type
  CONSTRAINT uq_style_palettes_transformation_type UNIQUE (transformation_type_id)
);

COMMENT ON TABLE public.style_palettes IS 'Palette de couleurs et matériaux par style';
COMMENT ON COLUMN public.style_palettes.wall_colors IS 'Couleurs de murs possibles';
COMMENT ON COLUMN public.style_palettes.floor_materials IS 'Matériaux de sol possibles';
COMMENT ON COLUMN public.style_palettes.ambiance_keywords IS 'Mots-clés d''ambiance';

CREATE INDEX IF NOT EXISTS idx_style_palettes_transformation_type
  ON public.style_palettes (transformation_type_id);

-- =====================================================
-- 4. TABLE: furniture_catalog
-- =====================================================

CREATE TABLE IF NOT EXISTS public.furniture_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  category furniture_category NOT NULL,
  room_types room_type[] NOT NULL DEFAULT '{}',

  -- Noms
  name_fr VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,

  -- Description générique
  generic_description TEXT NULL,

  -- Dimensions typiques (cm)
  typical_dimensions JSONB NULL,  -- {"width": 220, "depth": 90, "height": 80}

  -- Importance
  is_essential BOOLEAN NOT NULL DEFAULT FALSE,  -- Meuble essentiel pour la pièce
  priority INTEGER NOT NULL DEFAULT 50,          -- Ordre d'affichage

  -- Métadonnées
  icon_name VARCHAR(50) NULL,
  image_url TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.furniture_catalog IS 'Catalogue global de meubles réutilisables';
COMMENT ON COLUMN public.furniture_catalog.is_essential IS 'Meuble essentiel pour fonctionnalité de la pièce';
COMMENT ON COLUMN public.furniture_catalog.priority IS 'Ordre d''affichage (100 = très important)';

CREATE INDEX IF NOT EXISTS idx_furniture_catalog_category
  ON public.furniture_catalog (category);

CREATE INDEX IF NOT EXISTS idx_furniture_catalog_room_types
  ON public.furniture_catalog USING GIN (room_types);

CREATE INDEX IF NOT EXISTS idx_furniture_catalog_active
  ON public.furniture_catalog (is_active);

-- =====================================================
-- 5. TABLE: style_furniture_variants
-- =====================================================

CREATE TABLE IF NOT EXISTS public.style_furniture_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Références
  transformation_type_id UUID NOT NULL REFERENCES public.transformation_types(id) ON DELETE CASCADE,
  furniture_id UUID NOT NULL REFERENCES public.furniture_catalog(id) ON DELETE CASCADE,

  -- Description adaptée au style
  description TEXT NOT NULL,

  -- Caractéristiques spécifiques au style
  materials TEXT[] NOT NULL DEFAULT '{}',
  colors TEXT[] NOT NULL DEFAULT '{}',
  details TEXT NULL,

  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Une seule variante par meuble par style
  CONSTRAINT uq_style_furniture_variants UNIQUE (transformation_type_id, furniture_id)
);

COMMENT ON TABLE public.style_furniture_variants IS 'Variantes de meubles adaptées à chaque style';
COMMENT ON COLUMN public.style_furniture_variants.description IS 'Description du meuble dans ce style';

CREATE INDEX IF NOT EXISTS idx_style_furniture_variants_transformation_type
  ON public.style_furniture_variants (transformation_type_id);

CREATE INDEX IF NOT EXISTS idx_style_furniture_variants_furniture
  ON public.style_furniture_variants (furniture_id);

-- =====================================================
-- 6. TABLE: room_furniture_presets
-- =====================================================

CREATE TABLE IF NOT EXISTS public.room_furniture_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Références
  transformation_type_id UUID NOT NULL REFERENCES public.transformation_types(id) ON DELETE CASCADE,
  room_type room_type NOT NULL,

  -- Ownership
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE CASCADE,  -- NULL = preset système

  -- Identification
  name VARCHAR(200) NOT NULL,
  description TEXT NULL,

  -- Liste des meubles
  furniture_ids UUID[] NOT NULL DEFAULT '{}',

  -- Flags
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Métadonnées
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.room_furniture_presets IS 'Presets de sélection de meubles par style et pièce';
COMMENT ON COLUMN public.room_furniture_presets.is_system IS 'Preset système (par défaut) ou user custom';
COMMENT ON COLUMN public.room_furniture_presets.is_public IS 'Partageable avec autres users';

CREATE INDEX IF NOT EXISTS idx_room_furniture_presets_transformation_type
  ON public.room_furniture_presets (transformation_type_id);

CREATE INDEX IF NOT EXISTS idx_room_furniture_presets_room_type
  ON public.room_furniture_presets (room_type);

CREATE INDEX IF NOT EXISTS idx_room_furniture_presets_user
  ON public.room_furniture_presets (user_id);

CREATE INDEX IF NOT EXISTS idx_room_furniture_presets_system
  ON public.room_furniture_presets (is_system);

-- =====================================================
-- 7. TRIGGERS: Updated_at automatique
-- =====================================================

CREATE OR REPLACE FUNCTION public.fn_update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- room_specifications
DROP TRIGGER IF EXISTS trg_room_specifications_updated_at ON public.room_specifications;
CREATE TRIGGER trg_room_specifications_updated_at
  BEFORE UPDATE ON public.room_specifications
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_update_updated_at();

-- style_palettes
DROP TRIGGER IF EXISTS trg_style_palettes_updated_at ON public.style_palettes;
CREATE TRIGGER trg_style_palettes_updated_at
  BEFORE UPDATE ON public.style_palettes
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_update_updated_at();

-- furniture_catalog
DROP TRIGGER IF EXISTS trg_furniture_catalog_updated_at ON public.furniture_catalog;
CREATE TRIGGER trg_furniture_catalog_updated_at
  BEFORE UPDATE ON public.furniture_catalog
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_update_updated_at();

-- style_furniture_variants
DROP TRIGGER IF EXISTS trg_style_furniture_variants_updated_at ON public.style_furniture_variants;
CREATE TRIGGER trg_style_furniture_variants_updated_at
  BEFORE UPDATE ON public.style_furniture_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_update_updated_at();

-- room_furniture_presets
DROP TRIGGER IF EXISTS trg_room_furniture_presets_updated_at ON public.room_furniture_presets;
CREATE TRIGGER trg_room_furniture_presets_updated_at
  BEFORE UPDATE ON public.room_furniture_presets
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_update_updated_at();

-- =====================================================
-- 8. RLS (Row Level Security)
-- =====================================================

-- room_specifications: lecture publique
ALTER TABLE public.room_specifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS policy_room_specifications_read ON public.room_specifications;
CREATE POLICY policy_room_specifications_read
  ON public.room_specifications
  FOR SELECT
  TO authenticated, anon
  USING (is_active = TRUE);

-- style_palettes: lecture publique
ALTER TABLE public.style_palettes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS policy_style_palettes_read ON public.style_palettes;
CREATE POLICY policy_style_palettes_read
  ON public.style_palettes
  FOR SELECT
  TO authenticated, anon
  USING (TRUE);

-- furniture_catalog: lecture publique
ALTER TABLE public.furniture_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS policy_furniture_catalog_read ON public.furniture_catalog;
CREATE POLICY policy_furniture_catalog_read
  ON public.furniture_catalog
  FOR SELECT
  TO authenticated, anon
  USING (is_active = TRUE);

-- style_furniture_variants: lecture publique
ALTER TABLE public.style_furniture_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS policy_style_furniture_variants_read ON public.style_furniture_variants;
CREATE POLICY policy_style_furniture_variants_read
  ON public.style_furniture_variants
  FOR SELECT
  TO authenticated, anon
  USING (TRUE);

-- room_furniture_presets: lecture selon ownership
ALTER TABLE public.room_furniture_presets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS policy_room_furniture_presets_read ON public.room_furniture_presets;
CREATE POLICY policy_room_furniture_presets_read
  ON public.room_furniture_presets
  FOR SELECT
  TO authenticated, anon
  USING (
    is_active = TRUE
    AND (
      is_system = TRUE           -- Presets système
      OR is_public = TRUE        -- Presets publics
      OR user_id = auth.uid()    -- Presets user
    )
  );

-- Écriture: user peut créer ses propres presets
DROP POLICY IF EXISTS policy_room_furniture_presets_insert ON public.room_furniture_presets;
CREATE POLICY policy_room_furniture_presets_insert
  ON public.room_furniture_presets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND is_system = FALSE);

DROP POLICY IF EXISTS policy_room_furniture_presets_update ON public.room_furniture_presets;
CREATE POLICY policy_room_furniture_presets_update
  ON public.room_furniture_presets
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND is_system = FALSE)
  WITH CHECK (user_id = auth.uid() AND is_system = FALSE);

DROP POLICY IF EXISTS policy_room_furniture_presets_delete ON public.room_furniture_presets;
CREATE POLICY policy_room_furniture_presets_delete
  ON public.room_furniture_presets
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND is_system = FALSE);

COMMIT;

-- =====================================================
-- VÉRIFICATIONS POST-MIGRATION
-- =====================================================

-- 1) Vérifier que les tables existent
-- SELECT tablename FROM pg_tables
-- WHERE schemaname = 'public'
--   AND tablename IN ('room_specifications', 'style_palettes', 'furniture_catalog', 'style_furniture_variants', 'room_furniture_presets');

-- 2) Vérifier l'ENUM furniture_category
-- SELECT enumlabel FROM pg_enum WHERE enumtypid = 'furniture_category'::regtype ORDER BY enumsortorder;
