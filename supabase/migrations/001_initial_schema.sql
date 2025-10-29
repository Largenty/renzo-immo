-- Migration 001: Initial Schema - Renzo Immobilier
-- Description: Creates all tables, indexes, triggers, and functions for the application
-- Created: 2025-10-23

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  company VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  avatar_url TEXT,
  subscription_plan_id UUID,
  credits_remaining INTEGER DEFAULT 0 NOT NULL,
  two_factor_enabled BOOLEAN DEFAULT false NOT NULL,
  two_factor_secret VARCHAR(255),
  email_verified BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription_plan_id);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- =====================================================
-- 2. SUBSCRIPTION PLANS TABLE
-- =====================================================
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2) NOT NULL,
  credits_per_month INTEGER NOT NULL,
  features JSONB,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index for subscription plans
CREATE INDEX idx_subscription_plans_slug ON subscription_plans(slug);
CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, credits_per_month, features) VALUES
('Starter', 'starter', 'Parfait pour débuter', 19.00, 190.00, 20, '["20 crédits/mois", "Qualité Standard & HD", "Tous les styles", "Support email"]'::jsonb),
('Pro', 'pro', 'Pour les professionnels', 79.00, 790.00, 120, '["120 crédits/mois", "Qualité Standard & HD", "Tous les styles", "Styles personnalisés", "Support prioritaire"]'::jsonb),
('Agence', 'agence', 'Pour les agences immobilières', 249.00, 2490.00, 500, '["500 crédits/mois", "Qualité Standard & HD", "Tous les styles", "Styles personnalisés illimités", "API access", "Support dédié"]'::jsonb);

-- =====================================================
-- 3. SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'paused', 'trialing', 'past_due');
CREATE TYPE billing_cycle AS ENUM ('monthly', 'yearly');

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  status subscription_status NOT NULL DEFAULT 'active',
  billing_cycle billing_cycle NOT NULL,
  current_period_start DATE NOT NULL,
  current_period_end DATE NOT NULL,
  trial_start DATE,
  trial_end DATE,
  next_billing_date DATE,
  cancel_at_period_end BOOLEAN DEFAULT false NOT NULL,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for subscriptions
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- Foreign key for users table
ALTER TABLE users ADD CONSTRAINT fk_users_subscription_plan
  FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id);

-- =====================================================
-- 4. PAYMENT METHODS TABLE
-- =====================================================
CREATE TYPE payment_method_type AS ENUM ('card', 'sepa_debit');

CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_method_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255) NOT NULL,
  type payment_method_type NOT NULL,
  card_brand VARCHAR(50),
  card_last4 VARCHAR(4),
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  card_country VARCHAR(2),
  billing_email VARCHAR(255),
  is_default BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for payment methods
CREATE INDEX idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_stripe_pm ON payment_methods(stripe_payment_method_id);
CREATE INDEX idx_payment_methods_stripe_customer ON payment_methods(stripe_customer_id);

-- =====================================================
-- 5. INVOICES TABLE
-- =====================================================
CREATE TYPE invoice_status AS ENUM ('draft', 'open', 'paid', 'uncollectible', 'void');

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_invoice_id VARCHAR(255) UNIQUE,
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  status invoice_status NOT NULL DEFAULT 'draft',
  amount_total DECIMAL(10,2) NOT NULL,
  amount_subtotal DECIMAL(10,2) NOT NULL,
  amount_tax DECIMAL(10,2) DEFAULT 0 NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR' NOT NULL,
  description TEXT,
  line_items JSONB,
  stripe_hosted_invoice_url TEXT,
  invoice_pdf_url TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  due_date DATE,
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for invoices
CREATE INDEX idx_invoices_user ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_stripe_invoice ON invoices(stripe_invoice_id);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_paid_at ON invoices(paid_at DESC);

-- =====================================================
-- 6. CREDIT PACKS TABLE
-- =====================================================
CREATE TABLE credit_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  credits INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  price_per_credit DECIMAL(10,2) NOT NULL,
  is_popular BOOLEAN DEFAULT false NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Insert default credit packs
INSERT INTO credit_packs (name, credits, price, price_per_credit, is_popular) VALUES
('Pack Starter', 20, 24.00, 1.20, false),
('Pack Standard', 50, 55.00, 1.10, true),
('Pack Pro', 100, 99.00, 0.99, false),
('Pack Agence', 200, 180.00, 0.90, false);

-- =====================================================
-- 7. CREDIT TRANSACTIONS TABLE
-- =====================================================
CREATE TYPE transaction_type AS ENUM ('credit', 'debit', 'refund', 'subscription_renewal');

CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  reference_type VARCHAR(50),
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for credit transactions
CREATE INDEX idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX idx_credit_transactions_date ON credit_transactions(created_at DESC);
CREATE INDEX idx_credit_transactions_user_date ON credit_transactions(user_id, created_at DESC);

-- =====================================================
-- 8. PROJECTS TABLE
-- =====================================================
CREATE TYPE project_status AS ENUM ('active', 'archived', 'deleted');

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  description TEXT,
  cover_image_url TEXT,
  status project_status DEFAULT 'active' NOT NULL,
  total_images INTEGER DEFAULT 0 NOT NULL,
  completed_images INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for projects
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_updated ON projects(updated_at DESC);
CREATE INDEX idx_projects_user_updated ON projects(user_id, updated_at DESC);

-- Full-text search index
CREATE INDEX idx_projects_name_fulltext ON projects USING GIN(to_tsvector('french', name));
CREATE INDEX idx_projects_address_fulltext ON projects USING GIN(to_tsvector('french', COALESCE(address, '')));

-- =====================================================
-- 9. TRANSFORMATION TYPES TABLE
-- =====================================================
CREATE TABLE transformation_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  slug VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_name VARCHAR(50),
  category VARCHAR(50),
  prompt_template TEXT,
  example_image_url TEXT,
  allow_furniture_toggle BOOLEAN DEFAULT false NOT NULL,
  is_system BOOLEAN DEFAULT false NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_public BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for transformation types
CREATE INDEX idx_transformation_types_user ON transformation_types(user_id);
CREATE INDEX idx_transformation_types_slug ON transformation_types(slug);
CREATE INDEX idx_transformation_types_system ON transformation_types(is_system);
CREATE INDEX idx_transformation_types_category ON transformation_types(category);

-- Insert system transformation types
INSERT INTO transformation_types (slug, name, description, icon_name, category, allow_furniture_toggle, is_system, is_active) VALUES
('depersonnalisation', 'Dépersonnalisation', 'Retire les éléments personnels pour une présentation neutre', 'Home', 'depersonnalisation', false, true, true),
('depersonnalisation_premium', 'Dépersonnalisation Premium', 'Dépersonnalisation avancée avec optimisation lumière', 'Sparkles', 'depersonnalisation', false, true, true),
('home_staging_moderne', 'Home Staging Moderne', 'Mobilier contemporain épuré', 'Sofa', 'staging', true, true, true),
('home_staging_scandinave', 'Home Staging Scandinave', 'Style scandinave chaleureux', 'Coffee', 'staging', true, true, true),
('home_staging_industriel', 'Home Staging Industriel', 'Style industriel avec matériaux bruts', 'Factory', 'staging', true, true, true),
('renovation_luxe', 'Rénovation Luxe', 'Transformation haut de gamme', 'Crown', 'renovation', false, true, true),
('renovation_contemporaine', 'Rénovation Contemporaine', 'Rénovation moderne et épurée', 'Paintbrush', 'renovation', false, true, true),
('style_personnalise', 'Style Personnalisé', 'Créez votre propre style', 'Wand', 'custom', false, true, true);

-- =====================================================
-- 10. IMAGES TABLE
-- =====================================================
CREATE TYPE image_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE image_quality AS ENUM ('standard', 'hd');

CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transformation_type_id UUID NOT NULL REFERENCES transformation_types(id),
  original_url TEXT NOT NULL,
  original_filename VARCHAR(255),
  original_width INTEGER,
  original_height INTEGER,
  original_size_bytes BIGINT,
  transformed_url TEXT,
  transformed_width INTEGER,
  transformed_height INTEGER,
  quality image_quality NOT NULL DEFAULT 'standard',
  credits_used INTEGER DEFAULT 1 NOT NULL,
  status image_status DEFAULT 'pending' NOT NULL,
  custom_prompt TEXT,
  with_furniture BOOLEAN,
  processing_started_at TIMESTAMP WITH TIME ZONE,
  processing_completed_at TIMESTAMP WITH TIME ZONE,
  processing_duration_ms INTEGER,
  error_message TEXT,
  ai_model_version VARCHAR(50),
  was_regenerated BOOLEAN DEFAULT false NOT NULL,
  regeneration_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for images
CREATE INDEX idx_images_project ON images(project_id);
CREATE INDEX idx_images_user ON images(user_id);
CREATE INDEX idx_images_status ON images(status);
CREATE INDEX idx_images_created ON images(created_at DESC);
CREATE INDEX idx_images_project_status ON images(project_id, status);
CREATE INDEX idx_images_user_created ON images(user_id, created_at DESC);

-- =====================================================
-- 11. USER NOTIFICATIONS PREFERENCES TABLE
-- =====================================================
CREATE TABLE user_notifications_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  projects_email BOOLEAN DEFAULT true NOT NULL,
  credits_email BOOLEAN DEFAULT true NOT NULL,
  features_email BOOLEAN DEFAULT true NOT NULL,
  tips_email BOOLEAN DEFAULT false NOT NULL,
  push_enabled BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index for user notifications preferences
CREATE INDEX idx_user_notifications_preferences_user ON user_notifications_preferences(user_id);

-- =====================================================
-- 12. CONTACT SUBMISSIONS TABLE
-- =====================================================
CREATE TYPE contact_status AS ENUM ('new', 'read', 'replied', 'archived');

CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status contact_status DEFAULT 'new' NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for contact submissions
CREATE INDEX idx_contact_status ON contact_submissions(status);
CREATE INDEX idx_contact_created ON contact_submissions(created_at DESC);

-- =====================================================
-- 13. SESSIONS TABLE
-- =====================================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for sessions
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- =====================================================
-- 14. AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for audit logs
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- =====================================================
-- 15. STRIPE EVENTS TABLE
-- =====================================================
CREATE TABLE stripe_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(100) NOT NULL,
  api_version VARCHAR(50),
  data JSONB NOT NULL,
  livemode BOOLEAN NOT NULL,
  processed BOOLEAN DEFAULT false NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  error TEXT,
  retry_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for stripe events
CREATE INDEX idx_stripe_events_event_id ON stripe_events(stripe_event_id);
CREATE INDEX idx_stripe_events_type ON stripe_events(type);
CREATE INDEX idx_stripe_events_processed ON stripe_events(processed);
CREATE INDEX idx_stripe_events_created ON stripe_events(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_payment_methods_updated_at BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_credit_packs_updated_at BEFORE UPDATE ON credit_packs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_transformation_types_updated_at BEFORE UPDATE ON transformation_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_images_updated_at BEFORE UPDATE ON images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_notifications_preferences_updated_at BEFORE UPDATE ON user_notifications_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update project image counts
CREATE OR REPLACE FUNCTION update_project_image_counts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects
  SET
    total_images = (
      SELECT COUNT(*) FROM images WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
    ),
    completed_images = (
      SELECT COUNT(*) FROM images
      WHERE project_id = COALESCE(NEW.project_id, OLD.project_id) AND status = 'completed'
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_counts
AFTER INSERT OR UPDATE OR DELETE ON images
FOR EACH ROW
EXECUTE FUNCTION update_project_image_counts();

-- Trigger: Update user credits
CREATE OR REPLACE FUNCTION update_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET credits_remaining = NEW.balance_after
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_credits
AFTER INSERT ON credit_transactions
FOR EACH ROW
EXECUTE FUNCTION update_user_credits();

-- Trigger: Create default notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_notifications_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_notification_preferences
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_default_notification_preferences();

-- =====================================================
-- VIEWS
-- =====================================================

-- View: User dashboard stats
CREATE OR REPLACE VIEW v_user_dashboard_stats AS
SELECT
  u.id as user_id,
  COUNT(DISTINCT p.id) as total_projects,
  COUNT(DISTINCT CASE WHEN i.status = 'completed' THEN i.id END) as completed_images,
  COUNT(DISTINCT CASE WHEN i.status = 'processing' THEN i.id END) as processing_images,
  u.credits_remaining,
  sp.credits_per_month,
  s.current_period_end as next_renewal_date
FROM users u
LEFT JOIN projects p ON p.user_id = u.id AND p.status = 'active'
LEFT JOIN images i ON i.user_id = u.id
LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
LEFT JOIN subscription_plans sp ON sp.id = u.subscription_plan_id
GROUP BY u.id, sp.credits_per_month, s.current_period_end;

-- View: Credit history summary
CREATE OR REPLACE VIEW v_credit_history_summary AS
SELECT
  ct.id,
  ct.user_id,
  ct.type,
  ct.amount,
  ct.balance_after,
  ct.description,
  ct.created_at,
  CASE
    WHEN ct.reference_type = 'image' THEN i.original_filename
    WHEN ct.reference_type = 'pack' THEN cp.name
    ELSE NULL
  END as reference_name
FROM credit_transactions ct
LEFT JOIN images i ON ct.reference_type = 'image' AND ct.reference_id = i.id
LEFT JOIN credit_packs cp ON ct.reference_type = 'pack' AND ct.reference_id = cp.id
ORDER BY ct.created_at DESC;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE users IS 'Table des utilisateurs de la plateforme';
COMMENT ON TABLE subscription_plans IS 'Plans d''abonnement disponibles (Starter, Pro, Agence)';
COMMENT ON TABLE subscriptions IS 'Abonnements des utilisateurs synchronisés avec Stripe';
COMMENT ON TABLE payment_methods IS 'Méthodes de paiement Stripe des utilisateurs';
COMMENT ON TABLE invoices IS 'Factures synchronisées avec Stripe';
COMMENT ON TABLE credit_packs IS 'Packs de crédits disponibles à l''achat';
COMMENT ON TABLE credit_transactions IS 'Historique des transactions de crédits';
COMMENT ON TABLE projects IS 'Projets immobiliers créés par les utilisateurs';
COMMENT ON TABLE transformation_types IS 'Types de transformation (styles système + styles utilisateur)';
COMMENT ON TABLE images IS 'Images uploadées et transformées';
COMMENT ON TABLE user_notifications_preferences IS 'Préférences de notifications des utilisateurs';
COMMENT ON TABLE contact_submissions IS 'Soumissions du formulaire de contact';
COMMENT ON TABLE sessions IS 'Sessions utilisateurs pour l''authentification';
COMMENT ON TABLE audit_logs IS 'Journal d''audit des actions importantes';
COMMENT ON TABLE stripe_events IS 'Journal des événements Stripe (webhooks)';

-- =====================================================
-- GRANT PERMISSIONS (pour Supabase)
-- =====================================================
-- Note: Supabase gère automatiquement les permissions via RLS
-- Ces grants sont pour l'accès service_role

-- Migration completed successfully
