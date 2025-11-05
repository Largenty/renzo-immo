-- ============================================
-- RLS Policies pour room_specifications
-- ============================================
-- Ajoute les politiques manquantes pour permettre aux utilisateurs
-- de créer, modifier et supprimer leurs propres room specifications

-- ============================================
-- 1. INSERT Policy - Permettre aux users de créer leurs propres rooms
-- ============================================
CREATE POLICY IF NOT EXISTS policy_room_specifications_insert
  ON room_specifications FOR INSERT TO authenticated
  WITH CHECK (
    -- Les utilisateurs peuvent créer des rooms personnalisées (user_id = leur ID)
    user_id = auth.uid() AND is_active = TRUE
  );

-- ============================================
-- 2. UPDATE Policy - Permettre aux users de modifier leurs propres rooms
-- ============================================
CREATE POLICY IF NOT EXISTS policy_room_specifications_update
  ON room_specifications FOR UPDATE TO authenticated
  USING (
    -- Les utilisateurs peuvent modifier leurs propres rooms
    user_id = auth.uid()
  )
  WITH CHECK (
    -- Et ne peuvent modifier que leurs propres rooms
    user_id = auth.uid()
  );

-- ============================================
-- 3. DELETE Policy - Permettre aux users de supprimer leurs propres rooms
-- ============================================
CREATE POLICY IF NOT EXISTS policy_room_specifications_delete
  ON room_specifications FOR DELETE TO authenticated
  USING (
    -- Les utilisateurs peuvent supprimer leurs propres rooms
    user_id = auth.uid()
  );

-- ============================================
-- Note: La policy SELECT existe déjà et permet de voir:
-- - Les rooms par défaut (user_id IS NULL)
-- - Les rooms personnalisées de l'utilisateur (user_id = auth.uid())
-- ============================================
