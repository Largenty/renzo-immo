# Documentation Base de Données - Renzo Immobilier

**Version:** 1.0
**Date:** 2025-01-30
**SGBD:** PostgreSQL (Supabase)

## Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Tables](#tables)
- [Relations](#relations)
- [Types ENUM](#types-enum)
- [Triggers et Fonctions](#triggers-et-fonctions)
- [Vues](#vues)
- [Indexes](#indexes)
- [Storage (Supabase)](#storage-supabase)
- [Row Level Security (RLS)](#row-level-security-rls)
- [Migrations Récentes](#migrations-récentes)

---

## Vue d'ensemble

La base de données Renzo Immobilier est conçue pour gérer une plateforme SaaS de transformation d'images immobilières par IA. Elle gère:

- **Utilisateurs et authentification** (via Supabase Auth)
- **Gestion de crédits** (système de paiement à l'usage)
- **Abonnements** (Stripe integration)
- **Projets immobiliers** (organisation des photos)
- **Transformations IA** (home staging, dépersonnalisation, rénovation)
- **Paiements et facturation** (Stripe)
- **Audit et logs**

**Base de données principale:** PostgreSQL 15+
**Extensions utilisées:**
- `uuid-ossp` - Génération d'UUID
- `pgcrypto` - Hashage de mots de passe

---

## Architecture

### Schéma de la base de données

```
┌─────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION                            │
│  ┌──────────┐       ┌──────────┐       ┌──────────────────┐   │
│  │  users   │───────│ sessions │       │ user_notifications│   │
│  └──────────┘       └──────────┘       │   _preferences    │   │
│       │                                  └──────────────────┘   │
└───────┼──────────────────────────────────────────────────────────┘
        │
        ├─────────────────────────────────────────────────────────┐
        │                    SUBSCRIPTION                          │
        │  ┌─────────────────┐   ┌──────────────┐   ┌─────────┐ │
        ├──│ subscriptions   │───│subscription  │   │invoices │ │
        │  └─────────────────┘   │   _plans     │   └─────────┘ │
        │  ┌─────────────────┐   └──────────────┘               │
        ├──│ payment_methods │                                   │
        │  └─────────────────┘                                   │
        └──────────────────────────────────────────────────────────┘
        │
        ├─────────────────────────────────────────────────────────┐
        │                    CREDITS SYSTEM                        │
        │  ┌──────────────────┐   ┌────────────────┐            │
        ├──│credit_transactions│   │ credit_packs   │            │
        │  └──────────────────┘   └────────────────┘            │
        └──────────────────────────────────────────────────────────┘
        │
        ├─────────────────────────────────────────────────────────┐
        │                    PROJECTS & IMAGES                     │
        │  ┌──────────┐                                           │
        ├──│ projects │                                           │
        │  └─────┬────┘                                           │
        │        │         ┌─────────────────────┐               │
        │        └─────────│      images         │               │
        │                  └──────────┬──────────┘               │
        │                             │                           │
        │                  ┌──────────┴──────────┐               │
        │                  │transformation_types │               │
        │                  └─────────────────────┘               │
        └──────────────────────────────────────────────────────────┘
        │
        └─────────────────────────────────────────────────────────┐
                            AUDIT & LOGS                          │
          ┌────────────┐   ┌──────────────┐   ┌──────────────┐ │
          │ audit_logs │   │stripe_events │   │  contact_    │ │
          └────────────┘   └──────────────┘   │ submissions  │ │
                                               └──────────────┘ │
        ────────────────────────────────────────────────────────────┘
```

---

## Tables

### 1. **users** - Utilisateurs
Stocke les informations des utilisateurs de la plateforme.

**Note:** Supabase Auth gère l'authentification dans `auth.users`, cette table stocke les données métier.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email de l'utilisateur |
| `password_hash` | VARCHAR(255) | NOT NULL | Hash du mot de passe |
| `first_name` | VARCHAR(100) | NOT NULL | Prénom |
| `last_name` | VARCHAR(100) | NOT NULL | Nom |
| `company` | VARCHAR(255) | NULL | Nom de l'entreprise |
| `phone` | VARCHAR(50) | NULL | Téléphone |
| `address` | TEXT | NULL | Adresse complète |
| `avatar_url` | TEXT | NULL | URL de l'avatar |
| `subscription_plan_id` | UUID | FK → subscription_plans | Plan d'abonnement actuel |
| `credits_remaining` | INTEGER | NOT NULL, DEFAULT 0 | Crédits disponibles |
| `two_factor_enabled` | BOOLEAN | NOT NULL, DEFAULT false | 2FA activé |
| `two_factor_secret` | VARCHAR(255) | NULL | Secret TOTP pour 2FA |
| `email_verified` | BOOLEAN | NOT NULL, DEFAULT false | Email vérifié |
| `created_at` | TIMESTAMPTZ | NOT NULL | Date de création |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Date de mise à jour |
| `last_login_at` | TIMESTAMPTZ | NULL | Dernière connexion |

**Indexes:**
- `idx_users_email` sur `email`
- `idx_users_subscription` sur `subscription_plan_id`
- `idx_users_created_at` sur `created_at DESC`

---

### 2. **subscription_plans** - Plans d'abonnement
Plans d'abonnement disponibles (Starter, Pro, Agence).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `name` | VARCHAR(100) | NOT NULL | Nom du plan |
| `slug` | VARCHAR(50) | UNIQUE, NOT NULL | Slug URL-friendly |
| `description` | TEXT | NULL | Description du plan |
| `price_monthly` | DECIMAL(10,2) | NOT NULL | Prix mensuel (€) |
| `price_yearly` | DECIMAL(10,2) | NOT NULL | Prix annuel (€) |
| `credits_per_month` | INTEGER | NOT NULL | Crédits mensuels inclus |
| `features` | JSONB | NULL | Liste des fonctionnalités |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Plan actif |
| `created_at` | TIMESTAMPTZ | NOT NULL | Date de création |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Date de mise à jour |

**Plans par défaut:**
- **Starter:** 19€/mois, 20 crédits/mois
- **Pro:** 79€/mois, 120 crédits/mois
- **Agence:** 249€/mois, 500 crédits/mois

**Indexes:**
- `idx_subscription_plans_slug` sur `slug`
- `idx_subscription_plans_active` sur `is_active`

---

### 3. **subscriptions** - Abonnements utilisateurs
Abonnements actifs des utilisateurs (synchronisés avec Stripe).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `user_id` | UUID | FK → users, NOT NULL | Utilisateur |
| `subscription_plan_id` | UUID | FK → subscription_plans | Plan souscrit |
| `stripe_subscription_id` | VARCHAR(255) | UNIQUE | ID Stripe |
| `stripe_customer_id` | VARCHAR(255) | NULL | ID client Stripe |
| `status` | subscription_status | NOT NULL, DEFAULT 'active' | Statut de l'abonnement |
| `billing_cycle` | billing_cycle | NOT NULL | Cycle de facturation |
| `current_period_start` | DATE | NOT NULL | Début période actuelle |
| `current_period_end` | DATE | NOT NULL | Fin période actuelle |
| `trial_start` | DATE | NULL | Début période d'essai |
| `trial_end` | DATE | NULL | Fin période d'essai |
| `next_billing_date` | DATE | NULL | Prochaine facturation |
| `cancel_at_period_end` | BOOLEAN | NOT NULL, DEFAULT false | Annulation programmée |
| `cancelled_at` | TIMESTAMPTZ | NULL | Date d'annulation |
| `created_at` | TIMESTAMPTZ | NOT NULL | Date de création |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Date de mise à jour |

**Indexes:**
- `idx_subscriptions_user` sur `user_id`
- `idx_subscriptions_status` sur `status`
- `idx_subscriptions_stripe_sub` sur `stripe_subscription_id`
- `idx_subscriptions_stripe_customer` sur `stripe_customer_id`

---

### 4. **payment_methods** - Méthodes de paiement
Méthodes de paiement Stripe des utilisateurs.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `user_id` | UUID | FK → users, NOT NULL | Utilisateur |
| `stripe_payment_method_id` | VARCHAR(255) | UNIQUE, NOT NULL | ID Stripe |
| `stripe_customer_id` | VARCHAR(255) | NOT NULL | ID client Stripe |
| `type` | payment_method_type | NOT NULL | Type (card, sepa_debit) |
| `card_brand` | VARCHAR(50) | NULL | Marque carte (Visa, Mastercard) |
| `card_last4` | VARCHAR(4) | NULL | 4 derniers chiffres |
| `card_exp_month` | INTEGER | NULL | Mois d'expiration |
| `card_exp_year` | INTEGER | NULL | Année d'expiration |
| `card_country` | VARCHAR(2) | NULL | Pays émetteur |
| `billing_email` | VARCHAR(255) | NULL | Email de facturation |
| `is_default` | BOOLEAN | NOT NULL, DEFAULT false | Méthode par défaut |
| `created_at` | TIMESTAMPTZ | NOT NULL | Date de création |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Date de mise à jour |

**Indexes:**
- `idx_payment_methods_user` sur `user_id`
- `idx_payment_methods_stripe_pm` sur `stripe_payment_method_id`
- `idx_payment_methods_stripe_customer` sur `stripe_customer_id`

---

### 5. **invoices** - Factures
Factures générées (synchronisées avec Stripe).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `user_id` | UUID | FK → users, NOT NULL | Utilisateur |
| `stripe_invoice_id` | VARCHAR(255) | UNIQUE | ID facture Stripe |
| `stripe_payment_intent_id` | VARCHAR(255) | NULL | ID intention de paiement |
| `stripe_charge_id` | VARCHAR(255) | NULL | ID charge Stripe |
| `invoice_number` | VARCHAR(50) | UNIQUE, NOT NULL | Numéro de facture |
| `status` | invoice_status | NOT NULL, DEFAULT 'draft' | Statut facture |
| `amount_total` | DECIMAL(10,2) | NOT NULL | Montant total TTC |
| `amount_subtotal` | DECIMAL(10,2) | NOT NULL | Montant HT |
| `amount_tax` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Montant TVA |
| `currency` | VARCHAR(3) | NOT NULL, DEFAULT 'EUR' | Devise |
| `description` | TEXT | NULL | Description |
| `line_items` | JSONB | NULL | Lignes de facture |
| `stripe_hosted_invoice_url` | TEXT | NULL | URL facture Stripe |
| `invoice_pdf_url` | TEXT | NULL | URL PDF facture |
| `paid_at` | TIMESTAMPTZ | NULL | Date de paiement |
| `due_date` | DATE | NULL | Date d'échéance |
| `period_start` | DATE | NULL | Début période |
| `period_end` | DATE | NULL | Fin période |
| `created_at` | TIMESTAMPTZ | NOT NULL | Date de création |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Date de mise à jour |

**Indexes:**
- `idx_invoices_user` sur `user_id`
- `idx_invoices_status` sur `status`
- `idx_invoices_stripe_invoice` sur `stripe_invoice_id`
- `idx_invoices_number` sur `invoice_number`
- `idx_invoices_paid_at` sur `paid_at DESC`

---

### 6. **credit_packs** - Packs de crédits
Packs de crédits disponibles à l'achat unitaire.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `name` | VARCHAR(100) | NOT NULL | Nom du pack |
| `credits` | INTEGER | NOT NULL | Nombre de crédits |
| `price` | DECIMAL(10,2) | NOT NULL | Prix du pack (€) |
| `price_per_credit` | DECIMAL(10,2) | NOT NULL | Prix unitaire (€) |
| `is_popular` | BOOLEAN | NOT NULL, DEFAULT false | Pack populaire |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Pack actif |
| `created_at` | TIMESTAMPTZ | NOT NULL | Date de création |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Date de mise à jour |

**Packs par défaut:**
- **Pack Starter:** 20 crédits - 24€ (1,20€/crédit)
- **Pack Standard:** 50 crédits - 55€ (1,10€/crédit) ⭐
- **Pack Pro:** 100 crédits - 99€ (0,99€/crédit)
- **Pack Agence:** 200 crédits - 180€ (0,90€/crédit)

---

### 7. **credit_transactions** - Transactions de crédits
Historique de toutes les transactions de crédits.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `user_id` | UUID | FK → users, NOT NULL | Utilisateur |
| `type` | transaction_type | NOT NULL | Type de transaction |
| `amount` | INTEGER | NOT NULL | Montant (positif ou négatif) |
| `balance_after` | INTEGER | NOT NULL | Solde après transaction |
| `description` | TEXT | NULL | Description |
| `reference_type` | VARCHAR(50) | NULL | Type référence (image, pack) |
| `reference_id` | UUID | NULL | ID référence |
| `created_at` | TIMESTAMPTZ | NOT NULL | Date de création |

**Types de transactions:**
- `credit` - Ajout de crédits (achat)
- `debit` - Déduction de crédits (génération image)
- `refund` - Remboursement
- `subscription_renewal` - Renouvellement abonnement

**Indexes:**
- `idx_credit_transactions_user` sur `user_id`
- `idx_credit_transactions_type` sur `type`
- `idx_credit_transactions_date` sur `created_at DESC`
- `idx_credit_transactions_user_date` sur `(user_id, created_at DESC)`

---

### 8. **projects** - Projets immobiliers
Projets créés par les utilisateurs pour organiser leurs photos.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `user_id` | UUID | FK → users, NOT NULL | Utilisateur propriétaire |
| `name` | VARCHAR(255) | NOT NULL | Nom du projet |
| `address` | TEXT | NULL | Adresse du bien |
| `description` | TEXT | NULL | Description |
| `cover_image_url` | TEXT | NULL | URL image de couverture |
| `status` | project_status | NOT NULL, DEFAULT 'active' | Statut du projet |
| `total_images` | INTEGER | NOT NULL, DEFAULT 0 | Nombre total d'images |
| `completed_images` | INTEGER | NOT NULL, DEFAULT 0 | Nombre d'images terminées |
| `created_at` | TIMESTAMPTZ | NOT NULL | Date de création |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Date de mise à jour |

**Statuts:**
- `active` - Projet actif
- `archived` - Projet archivé
- `deleted` - Projet supprimé (soft delete)

**Indexes:**
- `idx_projects_user` sur `user_id`
- `idx_projects_status` sur `status`
- `idx_projects_updated` sur `updated_at DESC`
- `idx_projects_user_updated` sur `(user_id, updated_at DESC)`
- `idx_projects_name_fulltext` - Recherche full-text sur `name`
- `idx_projects_address_fulltext` - Recherche full-text sur `address`

---

### 9. **transformation_types** - Types de transformation
Types de transformation disponibles (styles système + styles personnalisés).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `user_id` | UUID | FK → users, NULL | Créateur (NULL si système) |
| `slug` | VARCHAR(100) | NOT NULL | Slug unique |
| `name` | VARCHAR(100) | NOT NULL | Nom du style |
| `description` | TEXT | NULL | Description |
| `icon_name` | VARCHAR(50) | NULL | Nom de l'icône Lucide |
| `category` | VARCHAR(50) | NULL | Catégorie (staging, renovation, etc.) |
| `prompt_template` | TEXT | NULL | Template du prompt IA |
| `example_image_url` | TEXT | NULL | URL image d'exemple |
| `allow_furniture_toggle` | BOOLEAN | NOT NULL, DEFAULT false | Autoriser option meubles |
| `is_system` | BOOLEAN | NOT NULL, DEFAULT false | Style système |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Style actif |
| `is_public` | BOOLEAN | NOT NULL, DEFAULT false | Style public |
| `created_at` | TIMESTAMPTZ | NOT NULL | Date de création |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Date de mise à jour |

**Styles système par défaut:**

| Slug | Nom | Catégorie | Meubles |
|------|-----|-----------|---------|
| `depersonnalisation` | Dépersonnalisation | depersonnalisation | ❌ |
| `depersonnalisation_premium` | Dépersonnalisation Premium | depersonnalisation | ❌ |
| `home_staging_moderne` | Home Staging Moderne | staging | ✅ |
| `home_staging_scandinave` | Home Staging Scandinave | staging | ✅ |
| `home_staging_industriel` | Home Staging Industriel | staging | ✅ |
| `renovation_luxe` | Rénovation Luxe | renovation | ❌ |
| `renovation_contemporaine` | Rénovation Contemporaine | renovation | ❌ |
| `style_personnalise` | Style Personnalisé | custom | ❌ |

**Indexes:**
- `idx_transformation_types_user` sur `user_id`
- `idx_transformation_types_slug` sur `slug`
- `idx_transformation_types_system` sur `is_system`
- `idx_transformation_types_category` sur `category`

---

### 10. **images** - Images transformées
Images uploadées et transformées par l'IA.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `project_id` | UUID | FK → projects, NOT NULL | Projet parent |
| `user_id` | UUID | FK → users, NOT NULL | Utilisateur propriétaire |
| `transformation_type_id` | UUID | FK → transformation_types | Type de transformation |
| `original_url` | TEXT | NOT NULL | URL image originale |
| `original_filename` | VARCHAR(255) | NULL | Nom du fichier |
| `original_width` | INTEGER | NULL | Largeur originale (px) |
| `original_height` | INTEGER | NULL | Hauteur originale (px) |
| `original_size_bytes` | BIGINT | NULL | Taille originale (octets) |
| `transformed_url` | TEXT | NULL | URL image transformée |
| `transformed_width` | INTEGER | NULL | Largeur transformée |
| `transformed_height` | INTEGER | NULL | Hauteur transformée |
| `quality` | image_quality | NOT NULL, DEFAULT 'standard' | Qualité (standard/hd) |
| `credits_used` | INTEGER | NOT NULL, DEFAULT 1 | Crédits utilisés |
| `status` | image_status | NOT NULL, DEFAULT 'pending' | Statut traitement |
| `custom_prompt` | TEXT | NULL | Prompt personnalisé |
| `with_furniture` | BOOLEAN | NULL | Avec meubles |
| `room_type` | VARCHAR(50) | NULL | Type de pièce |
| `custom_room` | VARCHAR(100) | NULL | Pièce personnalisée |
| `metadata` | JSONB | DEFAULT '{}' | Métadonnées flexibles |
| `nano_request_id` | TEXT | NULL | ID requête NanoBanana |
| `processing_started_at` | TIMESTAMPTZ | NULL | Début traitement |
| `processing_completed_at` | TIMESTAMPTZ | NULL | Fin traitement |
| `processing_duration_ms` | INTEGER | NULL | Durée traitement (ms) |
| `error_message` | TEXT | NULL | Message d'erreur |
| `ai_model_version` | VARCHAR(50) | NULL | Version modèle IA |
| `was_regenerated` | BOOLEAN | NOT NULL, DEFAULT false | Image régénérée |
| `regeneration_count` | INTEGER | NOT NULL, DEFAULT 0 | Nombre régénérations |
| `created_at` | TIMESTAMPTZ | NOT NULL | Date de création |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Date de mise à jour |

**Statuts:**
- `pending` - En attente
- `processing` - En cours de traitement
- `completed` - Terminée
- `failed` - Échec

**Qualités:**
- `standard` - Qualité standard (1 crédit)
- `hd` - Haute définition (2 crédits)

**Indexes:**
- `idx_images_project` sur `project_id`
- `idx_images_user` sur `user_id`
- `idx_images_status` sur `status`
- `idx_images_created` sur `created_at DESC`
- `idx_images_project_status` sur `(project_id, status)`
- `idx_images_user_created` sur `(user_id, created_at DESC)`
- `idx_images_nano_request_id` sur `nano_request_id`
- `idx_images_metadata` - Index GIN sur `metadata`

---

### 11. **user_notifications_preferences** - Préférences notifications
Préférences de notifications des utilisateurs.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `user_id` | UUID | FK → users, UNIQUE, NOT NULL | Utilisateur |
| `projects_email` | BOOLEAN | NOT NULL, DEFAULT true | Emails projets |
| `credits_email` | BOOLEAN | NOT NULL, DEFAULT true | Emails crédits |
| `features_email` | BOOLEAN | NOT NULL, DEFAULT true | Emails nouvelles features |
| `tips_email` | BOOLEAN | NOT NULL, DEFAULT false | Emails conseils |
| `push_enabled` | BOOLEAN | NOT NULL, DEFAULT false | Notifications push |
| `created_at` | TIMESTAMPTZ | NOT NULL | Date de création |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Date de mise à jour |

**Note:** Créé automatiquement lors de l'inscription via trigger.

---

### 12. **contact_submissions** - Soumissions contact
Soumissions du formulaire de contact public.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `name` | VARCHAR(255) | NOT NULL | Nom complet |
| `email` | VARCHAR(255) | NOT NULL | Email |
| `message` | TEXT | NOT NULL | Message |
| `status` | contact_status | NOT NULL, DEFAULT 'new' | Statut |
| `ip_address` | VARCHAR(45) | NULL | Adresse IP |
| `user_agent` | TEXT | NULL | User agent |
| `replied_at` | TIMESTAMPTZ | NULL | Date de réponse |
| `created_at` | TIMESTAMPTZ | NOT NULL | Date de création |

**Statuts:**
- `new` - Nouveau message
- `read` - Lu
- `replied` - Répondu
- `archived` - Archivé

---

### 13. **sessions** - Sessions utilisateurs
Sessions d'authentification (gérées par Supabase Auth principalement).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `user_id` | UUID | FK → users, NOT NULL | Utilisateur |
| `token` | VARCHAR(255) | UNIQUE, NOT NULL | Token session |
| `ip_address` | VARCHAR(45) | NULL | Adresse IP |
| `user_agent` | TEXT | NULL | User agent |
| `expires_at` | TIMESTAMPTZ | NOT NULL | Date d'expiration |
| `created_at` | TIMESTAMPTZ | NOT NULL | Date de création |

**Indexes:**
- `idx_sessions_user` sur `user_id`
- `idx_sessions_token` sur `token`
- `idx_sessions_expires` sur `expires_at`

---

### 14. **audit_logs** - Logs d'audit
Journal d'audit des actions importantes.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `user_id` | UUID | FK → users, NULL | Utilisateur (NULL si système) |
| `action` | VARCHAR(100) | NOT NULL | Action effectuée |
| `entity_type` | VARCHAR(50) | NULL | Type d'entité |
| `entity_id` | UUID | NULL | ID de l'entité |
| `old_values` | JSONB | NULL | Valeurs avant |
| `new_values` | JSONB | NULL | Valeurs après |
| `ip_address` | VARCHAR(45) | NULL | Adresse IP |
| `user_agent` | TEXT | NULL | User agent |
| `created_at` | TIMESTAMPTZ | NOT NULL | Date de création |

**Actions typiques:**
- `user.login`, `user.logout`
- `project.create`, `project.update`, `project.delete`
- `image.upload`, `image.transform`, `image.delete`
- `subscription.create`, `subscription.cancel`
- `credits.purchase`, `credits.use`

---

### 15. **stripe_events** - Événements Stripe
Journal des webhooks Stripe.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `stripe_event_id` | VARCHAR(255) | UNIQUE, NOT NULL | ID événement Stripe |
| `type` | VARCHAR(100) | NOT NULL | Type d'événement |
| `api_version` | VARCHAR(50) | NULL | Version API Stripe |
| `data` | JSONB | NOT NULL | Données événement |
| `livemode` | BOOLEAN | NOT NULL | Mode production |
| `processed` | BOOLEAN | NOT NULL, DEFAULT false | Événement traité |
| `processed_at` | TIMESTAMPTZ | NULL | Date de traitement |
| `error` | TEXT | NULL | Message d'erreur |
| `retry_count` | INTEGER | NOT NULL, DEFAULT 0 | Nombre de tentatives |
| `created_at` | TIMESTAMPTZ | NOT NULL | Date de création |

**Types d'événements:**
- `invoice.paid`, `invoice.payment_failed`
- `customer.subscription.created`, `customer.subscription.updated`
- `payment_method.attached`, `payment_method.detached`

---

## Types ENUM

### subscription_status
```sql
('active', 'cancelled', 'expired', 'paused', 'trialing', 'past_due')
```

### billing_cycle
```sql
('monthly', 'yearly')
```

### payment_method_type
```sql
('card', 'sepa_debit')
```

### invoice_status
```sql
('draft', 'open', 'paid', 'uncollectible', 'void')
```

### transaction_type
```sql
('credit', 'debit', 'refund', 'subscription_renewal')
```

### project_status
```sql
('active', 'archived', 'deleted')
```

### image_status
```sql
('pending', 'processing', 'completed', 'failed')
```

### image_quality
```sql
('standard', 'hd')
```

### contact_status
```sql
('new', 'read', 'replied', 'archived')
```

---

## Relations

### Relations principales

```
users (1) ←→ (N) projects
users (1) ←→ (N) images
users (1) ←→ (N) subscriptions
users (1) ←→ (N) credit_transactions
users (1) ←→ (1) user_notifications_preferences

projects (1) ←→ (N) images
transformation_types (1) ←→ (N) images

subscription_plans (1) ←→ (N) subscriptions
subscription_plans (1) ←→ (N) users (via subscription_plan_id)
```

### Cascade DELETE

- **users** → CASCADE sur:
  - projects
  - images
  - subscriptions
  - payment_methods
  - invoices
  - credit_transactions
  - sessions
  - user_notifications_preferences

- **projects** → CASCADE sur:
  - images

- **transformation_types** → RESTRICT (ne peut pas supprimer si images référencées)

---

## Triggers et Fonctions

### 1. **update_updated_at_column()**
Mise à jour automatique de `updated_at` lors d'un UPDATE.

**Appliqué sur:**
- users
- subscription_plans
- subscriptions
- payment_methods
- invoices
- credit_packs
- projects
- transformation_types
- images
- user_notifications_preferences

### 2. **update_project_image_counts()**
Met à jour automatiquement `total_images` et `completed_images` dans projects.

**Trigger:** AFTER INSERT OR UPDATE OR DELETE sur `images`

### 3. **update_user_credits()**
Met à jour automatiquement `credits_remaining` dans users.

**Trigger:** AFTER INSERT sur `credit_transactions`

### 4. **create_default_notification_preferences()**
Crée automatiquement les préférences de notifications lors de l'inscription.

**Trigger:** AFTER INSERT sur `users`

---

## Vues

### v_user_dashboard_stats
Vue pour les statistiques du dashboard utilisateur.

**Colonnes:**
- `user_id`
- `total_projects` - Nombre de projets actifs
- `completed_images` - Nombre d'images terminées
- `processing_images` - Nombre d'images en cours
- `credits_remaining` - Crédits disponibles
- `credits_per_month` - Crédits mensuels du plan
- `next_renewal_date` - Prochaine date de renouvellement

### v_credit_history_summary
Vue pour l'historique des crédits avec références.

**Colonnes:**
- `id`, `user_id`, `type`, `amount`, `balance_after`
- `description`, `created_at`
- `reference_name` - Nom de la référence (image ou pack)

---

## Indexes

### Indexes de performance

**Recherche par utilisateur:**
- Tous les indexes `user_id` pour filtrage rapide par utilisateur
- Index composites `(user_id, created_at DESC)` pour tri chronologique

**Recherche full-text:**
- `idx_projects_name_fulltext` - Recherche dans nom de projet
- `idx_projects_address_fulltext` - Recherche dans adresse

**Recherche par statut:**
- Indexes sur `status` pour filtrage rapide
- Index composites `(project_id, status)` pour images par projet

**Optimisation Stripe:**
- Indexes sur `stripe_*_id` pour réconciliation rapide
- Index sur `stripe_event_id` pour idempotence

**Optimisation NanoBanana:**
- Index sur `nano_request_id` pour callback webhook rapide
- Index GIN sur `metadata` pour recherche JSON

---

## Storage (Supabase)

### Buckets créés

**1. project-images** (Public)
- Stockage images originales et transformées
- Structure: `{user_id}/{project_id}/{image_id}/`
- RLS: Lecture publique si projet public, écriture par propriétaire

**2. avatars** (Public)
- Stockage avatars utilisateurs
- Structure: `{user_id}/avatar.{ext}`
- RLS: Lecture publique, écriture par propriétaire

**3. temp-uploads** (Privé)
- Stockage temporaire avant traitement
- Nettoyage automatique après 24h
- RLS: Accès uniquement par propriétaire

---

## Row Level Security (RLS)

### Politiques RLS activées

**users:**
- ✅ SELECT: Utilisateur peut voir ses propres données
- ✅ UPDATE: Utilisateur peut modifier ses propres données

**projects:**
- ✅ SELECT: Propriétaire + projets publics
- ✅ INSERT: Utilisateurs authentifiés
- ✅ UPDATE: Propriétaire uniquement
- ✅ DELETE: Propriétaire uniquement

**images:**
- ✅ SELECT: Propriétaire + images de projets publics
- ✅ INSERT: Propriétaire du projet
- ✅ UPDATE: Propriétaire uniquement
- ✅ DELETE: Propriétaire uniquement

**transformation_types:**
- ✅ SELECT: Tous (système) + propriétaire (custom)
- ✅ INSERT: Utilisateurs authentifiés (custom only)
- ✅ UPDATE: Propriétaire (custom only)
- ✅ DELETE: Propriétaire (custom only)

**credit_transactions:**
- ✅ SELECT: Propriétaire uniquement
- ❌ INSERT/UPDATE/DELETE: Via trigger uniquement

**subscriptions, invoices, payment_methods:**
- ✅ SELECT: Propriétaire uniquement
- ❌ INSERT/UPDATE/DELETE: Via API backend uniquement

---

## Migrations Récentes

### 2025-01-30

**20250130_add_nano_request_id.sql**
- Ajout colonne `nano_request_id` dans `images`
- Index pour recherche rapide par request ID
- Permet au webhook NanoBanana de retrouver l'image

### 2025-01-29

**Métadonnées et types de pièces:**
- `20250129_add_metadata_to_images.sql` - Colonne JSONB metadata
- `20250129_add_custom_room_to_images.sql` - Colonnes room_type et custom_room

**Prompts et styles:**
- Multiples migrations pour mettre à jour les prompts des styles système
- Ajout de styles professionnels (home staging, rénovation)

**Authentification:**
- `20250129_auto_create_user_profile.sql` - Trigger auto-création profil
- `20250129_sync_email_verification.sql` - Synchronisation email vérifié
- `20250129_fix_users_insert_policy.sql` - Correction politique RLS

---

## Bonnes Pratiques

### 1. **Utilisation des crédits**
```sql
-- TOUJOURS créer une transaction pour débiter des crédits
INSERT INTO credit_transactions (user_id, type, amount, balance_after, description, reference_type, reference_id)
VALUES (
  'user-uuid',
  'debit',
  -1, -- Négatif pour débit
  (SELECT credits_remaining - 1 FROM users WHERE id = 'user-uuid'),
  'Génération image HD',
  'image',
  'image-uuid'
);
-- Le trigger mettra automatiquement à jour users.credits_remaining
```

### 2. **Créer une image**
```sql
-- 1. Uploader l'image dans Storage
-- 2. Créer l'enregistrement image
INSERT INTO images (
  project_id,
  user_id,
  transformation_type_id,
  original_url,
  quality,
  status
) VALUES (
  'project-uuid',
  'user-uuid',
  'transformation-type-uuid',
  'https://storage.url/path',
  'hd',
  'pending'
);
-- 3. Le trigger mettra à jour project.total_images automatiquement
```

### 3. **Recherche full-text**
```sql
-- Rechercher un projet par nom ou adresse
SELECT *
FROM projects
WHERE
  to_tsvector('french', name) @@ plainto_tsquery('french', 'appartement paris')
  OR to_tsvector('french', address) @@ plainto_tsquery('french', 'appartement paris');
```

### 4. **Sécurité RLS**
- ✅ TOUJOURS tester les politiques RLS
- ✅ Utiliser `service_role` uniquement pour opérations admin
- ✅ Utiliser `anon` ou `authenticated` pour opérations utilisateur

---

## Maintenance

### Nettoyage recommandé

**Sessions expirées:**
```sql
DELETE FROM sessions WHERE expires_at < NOW();
```

**Images en échec anciennes:**
```sql
DELETE FROM images
WHERE status = 'failed'
  AND created_at < NOW() - INTERVAL '30 days';
```

**Événements Stripe traités:**
```sql
DELETE FROM stripe_events
WHERE processed = true
  AND created_at < NOW() - INTERVAL '90 days';
```

**Logs d'audit anciens:**
```sql
DELETE FROM audit_logs
WHERE created_at < NOW() - INTERVAL '1 year';
```

---

## Monitoring

### Requêtes importantes à monitorer

**Images en cours depuis trop longtemps:**
```sql
SELECT *
FROM images
WHERE status = 'processing'
  AND processing_started_at < NOW() - INTERVAL '10 minutes';
```

**Utilisateurs avec crédits négatifs:**
```sql
SELECT id, email, credits_remaining
FROM users
WHERE credits_remaining < 0;
```

**Projets avec compteurs incorrects:**
```sql
SELECT
  p.id,
  p.total_images as stored_count,
  COUNT(i.id) as actual_count
FROM projects p
LEFT JOIN images i ON i.project_id = p.id
GROUP BY p.id
HAVING p.total_images != COUNT(i.id);
```

---

## Contact & Support

Pour toute question sur la structure de la base de données:
- 📧 Email: dev@renzo-immobilier.com
- 📖 Documentation: https://docs.renzo-immobilier.com
- 🐛 Issues: https://github.com/renzo-immo/issues

---

**Dernière mise à jour:** 2025-01-30
**Version:** 1.0
**Auteur:** Équipe Renzo Immobilier
