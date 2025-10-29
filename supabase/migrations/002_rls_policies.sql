-- Migration 002: Row Level Security Policies
-- Description: Configure les policies RLS pour sécuriser l'accès aux données
-- Created: 2025-10-23

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE transformation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Les tables subscription_plans, credit_packs, contact_submissions, audit_logs, stripe_events
-- ne nécessitent pas de RLS (lecture publique ou admin uniquement)

-- =====================================================
-- NOTE: Utiliser auth.uid() natif de Supabase
-- =====================================================
-- Supabase fournit auth.uid() qui retourne l'UUID de l'utilisateur connecté
-- Pas besoin de créer notre propre fonction

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Les users peuvent lire leur propre profil
CREATE POLICY "Users can read their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Les users peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- L'inscription est gérée par Supabase Auth, pas besoin de policy INSERT
-- La suppression est gérée par API admin uniquement

-- =====================================================
-- SUBSCRIPTIONS TABLE POLICIES
-- =====================================================

-- Les users peuvent lire leurs propres abonnements
CREATE POLICY "Users can read their own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Les insertions/mises à jour sont gérées par webhooks Stripe (service_role)

-- =====================================================
-- PAYMENT METHODS TABLE POLICIES
-- =====================================================

-- Les users peuvent lire leurs propres méthodes de paiement
CREATE POLICY "Users can read their own payment methods"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Les insertions/suppressions sont gérées par API (service_role)

-- =====================================================
-- INVOICES TABLE POLICIES
-- =====================================================

-- Les users peuvent lire leurs propres factures
CREATE POLICY "Users can read their own invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Les insertions/mises à jour sont gérées par webhooks Stripe (service_role)

-- =====================================================
-- CREDIT TRANSACTIONS TABLE POLICIES
-- =====================================================

-- Les users peuvent lire leurs propres transactions
CREATE POLICY "Users can read their own credit transactions"
  ON credit_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Les insertions sont gérées par API (service_role)

-- =====================================================
-- PROJECTS TABLE POLICIES
-- =====================================================

-- Les users peuvent lire leurs propres projets
CREATE POLICY "Users can read their own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Les users peuvent créer des projets
CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Les users peuvent mettre à jour leurs propres projets
CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Les users peuvent supprimer leurs propres projets (soft delete)
CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- =====================================================
-- TRANSFORMATION TYPES TABLE POLICIES
-- =====================================================

-- Tous les users authentifiés peuvent lire les types système
CREATE POLICY "Users can read system transformation types"
  ON transformation_types FOR SELECT
  TO authenticated
  USING (is_system = true OR user_id = auth.uid());

-- Les users peuvent créer leurs propres styles
CREATE POLICY "Users can create their own transformation types"
  ON transformation_types FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND is_system = false);

-- Les users peuvent mettre à jour leurs propres styles (pas les système)
CREATE POLICY "Users can update their own transformation types"
  ON transformation_types FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND is_system = false)
  WITH CHECK (user_id = auth.uid() AND is_system = false);

-- Les users peuvent supprimer leurs propres styles (pas les système)
CREATE POLICY "Users can delete their own transformation types"
  ON transformation_types FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND is_system = false);

-- =====================================================
-- IMAGES TABLE POLICIES
-- =====================================================

-- Les users peuvent lire leurs propres images
CREATE POLICY "Users can read their own images"
  ON images FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Les users peuvent créer des images
CREATE POLICY "Users can create their own images"
  ON images FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Les users peuvent mettre à jour leurs propres images
CREATE POLICY "Users can update their own images"
  ON images FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Les users peuvent supprimer leurs propres images
CREATE POLICY "Users can delete their own images"
  ON images FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- =====================================================
-- USER NOTIFICATIONS PREFERENCES TABLE POLICIES
-- =====================================================

-- Les users peuvent lire leurs propres préférences
CREATE POLICY "Users can read their own notification preferences"
  ON user_notifications_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Les users peuvent mettre à jour leurs propres préférences
CREATE POLICY "Users can update their own notification preferences"
  ON user_notifications_preferences FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- SESSIONS TABLE POLICIES
-- =====================================================

-- Les users peuvent lire leurs propres sessions
CREATE POLICY "Users can read their own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Les insertions/suppressions sont gérées par auth système

-- =====================================================
-- PUBLIC READ POLICIES
-- =====================================================

-- Lecture publique des plans d'abonnement (pour page pricing)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subscription plans are publicly readable"
  ON subscription_plans FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Lecture publique des packs de crédits
ALTER TABLE credit_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Credit packs are publicly readable"
  ON credit_packs FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- =====================================================
-- ADMIN POLICIES (via service_role bypass RLS)
-- =====================================================

-- Les opérations admin utilisent service_role_key qui bypass automatiquement RLS
-- Pas besoin de policies spécifiques

-- =====================================================
-- SECURITY NOTES
-- =====================================================

-- 1. Toutes les tables sensibles ont RLS activé
-- 2. Les users ne peuvent accéder qu'à leurs propres données
-- 3. Les opérations admin (webhooks Stripe, etc.) utilisent service_role
-- 4. Les types de transformation système sont en lecture seule pour tous
-- 5. Les subscription_plans et credit_packs sont publics pour la page pricing

-- Migration completed successfully
