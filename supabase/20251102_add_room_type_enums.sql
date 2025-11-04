-- =====================================================
-- MIGRATION: Add New Room Type ENUM Values
-- =====================================================
-- Date: 2025-11-02
-- Purpose: Add new enum values to room_type
-- IMPORTANT: Run this FIRST, then run the specifications file
-- =====================================================

-- Add new room types to the enum
-- These commands auto-commit and cannot be in a transaction
ALTER TYPE room_type ADD VALUE IF NOT EXISTS 'chambre_enfant';
ALTER TYPE room_type ADD VALUE IF NOT EXISTS 'salle_de_jeux';
ALTER TYPE room_type ADD VALUE IF NOT EXISTS 'toilette';

-- =====================================================
-- SUCCESS! New enum values added:
-- - chambre_enfant
-- - salle_de_jeux
-- - toilette
--
-- NEXT STEP: Run 20251102_add_room_type_specifications.sql
-- =====================================================
