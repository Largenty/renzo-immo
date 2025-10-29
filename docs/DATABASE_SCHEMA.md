# Schéma de Base de Données - Renzo Immobilier

## Vue d'ensemble

Ce document décrit le schéma de base de données complet pour l'application Renzo Immobilier, déduit de toutes les fonctionnalités et actions disponibles dans le projet.

---

## Tables

### 1. `users`
Stocke les informations des utilisateurs de la plateforme.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email de l'utilisateur |
| `password_hash` | VARCHAR(255) | NOT NULL | Hash du mot de passe |
| `first_name` | VARCHAR(100) | NOT NULL | Prénom |
| `last_name` | VARCHAR(100) | NOT NULL | Nom |
| `company` | VARCHAR(255) | NULL | Nom de la société (optionnel) |
| `phone` | VARCHAR(50) | NULL | Numéro de téléphone |
| `address` | TEXT | NULL | Adresse complète |
| `avatar_url` | TEXT | NULL | URL de la photo de profil |
| `subscription_plan_id` | UUID | FOREIGN KEY | Référence vers `subscription_plans` |
| `credits_remaining` | INTEGER | DEFAULT 0 | Crédits disponibles |
| `two_factor_enabled` | BOOLEAN | DEFAULT false | 2FA activé |
| `email_verified` | BOOLEAN | DEFAULT false | Email vérifié |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date de création |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Dernière mise à jour |
| `last_login_at` | TIMESTAMP | NULL | Dernière connexion |

**Indexes:**
- `idx_users_email` sur `email`
- `idx_users_subscription` sur `subscription_plan_id`

**Actions associées:**
- Inscription (`/auth/signup`)
- Connexion (`/auth/login`)
- Déconnexion
- Modification du profil (`/dashboard/settings`)
- Changement de mot de passe
- Activation 2FA
- Suppression de compte

---

### 2. `subscription_plans`
Définit les différents forfaits d'abonnement.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `name` | VARCHAR(100) | NOT NULL | Nom du plan (Starter, Pro, Agence) |
| `slug` | VARCHAR(50) | UNIQUE, NOT NULL | Identifiant URL-friendly |
| `description` | TEXT | NULL | Description du plan |
| `price_monthly` | DECIMAL(10,2) | NOT NULL | Prix mensuel en euros |
| `price_yearly` | DECIMAL(10,2) | NOT NULL | Prix annuel en euros |
| `credits_per_month` | INTEGER | NOT NULL | Crédits inclus par mois |
| `overage_price` | DECIMAL(10,2) | NOT NULL | Prix du crédit supplémentaire |
| `features` | JSONB | NULL | Liste des fonctionnalités |
| `is_active` | BOOLEAN | DEFAULT true | Plan actif |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date de création |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Dernière mise à jour |

**Données initiales:**
- Starter: 19€/mois, 20 crédits
- Pro: 79€/mois, 120 crédits
- Agence: 249€/mois, 500 crédits

**Actions associées:**
- Affichage des tarifs (`/dashboard/credits`)
- Changement de forfait
- Annulation d'abonnement

---

### 3. `subscriptions`
Historique et état des abonnements des utilisateurs (synchronisés avec Stripe Billing).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `user_id` | UUID | FOREIGN KEY | Référence vers `users` |
| `subscription_plan_id` | UUID | FOREIGN KEY | Référence vers `subscription_plans` |
| `stripe_subscription_id` | VARCHAR(255) | UNIQUE, NULL | Stripe Subscription ID (sub_xxx) |
| `stripe_customer_id` | VARCHAR(255) | NULL | Stripe Customer ID (cus_xxx) |
| `status` | ENUM | NOT NULL | active, cancelled, expired, paused, trialing, past_due |
| `billing_cycle` | ENUM | NOT NULL | monthly, yearly |
| `current_period_start` | DATE | NOT NULL | Début de la période actuelle |
| `current_period_end` | DATE | NOT NULL | Fin de la période actuelle |
| `trial_start` | DATE | NULL | Début de la période d'essai |
| `trial_end` | DATE | NULL | Fin de la période d'essai |
| `next_billing_date` | DATE | NULL | Prochaine date de facturation |
| `cancel_at_period_end` | BOOLEAN | DEFAULT false | Annulation à la fin de la période |
| `cancelled_at` | TIMESTAMP | NULL | Date d'annulation |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date de création |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Dernière mise à jour |

**Indexes:**
- `idx_subscriptions_user` sur `user_id`
- `idx_subscriptions_status` sur `status`
- `idx_subscriptions_stripe_sub` sur `stripe_subscription_id`
- `idx_subscriptions_stripe_customer` sur `stripe_customer_id`

**Note Stripe:**
- Les abonnements sont gérés via Stripe Billing
- Les webhooks Stripe synchronisent les statuts (`customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`)
- Le `stripe_subscription_id` permet de récupérer l'abonnement depuis Stripe API
- États possibles: `trialing` (période d'essai), `past_due` (paiement échoué)

**Actions associées:**
- Souscription à un plan → Crée un Stripe Subscription
- Changement de plan → Mise à jour via `stripe.subscriptions.update()`
- Annulation d'abonnement → `stripe.subscriptions.update({ cancel_at_period_end: true })`
- Renouvellement automatique → Géré par Stripe, synchronisé via webhooks

---

### 4. `payment_methods`
Méthodes de paiement enregistrées par les utilisateurs (via Stripe).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `user_id` | UUID | FOREIGN KEY | Référence vers `users` |
| `stripe_payment_method_id` | VARCHAR(255) | UNIQUE, NOT NULL | Stripe PaymentMethod ID (pm_xxx) |
| `stripe_customer_id` | VARCHAR(255) | NOT NULL | Stripe Customer ID (cus_xxx) |
| `type` | ENUM | NOT NULL | card, sepa_debit |
| `card_brand` | VARCHAR(50) | NULL | visa, mastercard, amex, etc. |
| `card_last4` | VARCHAR(4) | NULL | 4 derniers chiffres |
| `card_exp_month` | INTEGER | NULL | Mois d'expiration (1-12) |
| `card_exp_year` | INTEGER | NULL | Année d'expiration (YYYY) |
| `card_country` | VARCHAR(2) | NULL | Code pays ISO (FR, US, etc.) |
| `billing_email` | VARCHAR(255) | NULL | Email de facturation |
| `is_default` | BOOLEAN | DEFAULT false | Méthode par défaut |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date de création |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Dernière mise à jour |

**Indexes:**
- `idx_payment_methods_user` sur `user_id`
- `idx_payment_methods_stripe_pm` sur `stripe_payment_method_id`
- `idx_payment_methods_stripe_customer` sur `stripe_customer_id`

**Note Stripe:**
- Un `stripe_customer_id` est créé pour chaque utilisateur lors du premier paiement
- Les `stripe_payment_method_id` sont attachés au customer Stripe
- Stripe gère la sécurité PCI-DSS, nous ne stockons JAMAIS les numéros de carte complets

**Actions associées:**
- Ajout d'une carte (`/dashboard/settings`) → Crée un PaymentMethod via Stripe Elements
- Modification d'une carte → Détache l'ancien PM, attache le nouveau
- Suppression d'une carte → Détache le PaymentMethod de Stripe

---

### 5. `invoices`
Factures générées pour les paiements (synchronisées avec Stripe).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `user_id` | UUID | FOREIGN KEY | Référence vers `users` |
| `stripe_invoice_id` | VARCHAR(255) | UNIQUE, NULL | Stripe Invoice ID (in_xxx) |
| `stripe_payment_intent_id` | VARCHAR(255) | NULL | Stripe PaymentIntent ID (pi_xxx) |
| `stripe_charge_id` | VARCHAR(255) | NULL | Stripe Charge ID (ch_xxx) |
| `invoice_number` | VARCHAR(50) | UNIQUE, NOT NULL | Numéro de facture (INV-YYYY-MM-XXX) |
| `status` | ENUM | NOT NULL | draft, open, paid, uncollectible, void |
| `amount_total` | DECIMAL(10,2) | NOT NULL | Montant total TTC |
| `amount_subtotal` | DECIMAL(10,2) | NOT NULL | Montant HT |
| `amount_tax` | DECIMAL(10,2) | DEFAULT 0 | Montant TVA |
| `currency` | VARCHAR(3) | DEFAULT 'EUR' | Devise (EUR, USD, etc.) |
| `description` | TEXT | NULL | Description de la facture |
| `line_items` | JSONB | NULL | Détails des lignes (plan, crédits, etc.) |
| `stripe_hosted_invoice_url` | TEXT | NULL | URL de la facture hébergée par Stripe |
| `invoice_pdf_url` | TEXT | NULL | URL du PDF Stripe |
| `paid_at` | TIMESTAMP | NULL | Date de paiement |
| `due_date` | DATE | NULL | Date d'échéance |
| `period_start` | DATE | NULL | Début de la période facturée |
| `period_end` | DATE | NULL | Fin de la période facturée |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date de création |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Dernière mise à jour |

**Indexes:**
- `idx_invoices_user` sur `user_id`
- `idx_invoices_status` sur `status`
- `idx_invoices_stripe_invoice` sur `stripe_invoice_id`
- `idx_invoices_number` sur `invoice_number`
- `idx_invoices_paid_at` sur `paid_at`

**Note Stripe:**
- Les factures sont créées automatiquement via Stripe Billing
- Stripe gère la génération des PDFs
- Les webhooks Stripe synchronisent les statuts (`invoice.paid`, `invoice.payment_failed`)
- Le `invoice_number` est généré côté app, le `stripe_invoice_id` vient de Stripe

**Actions associées:**
- Consultation de l'historique (`/dashboard/credits`)
- Téléchargement de facture (redirect vers `stripe_hosted_invoice_url` ou `invoice_pdf_url`)
- Webhooks Stripe pour synchronisation

---

### 6. `credit_packs`
Packs de crédits supplémentaires disponibles à l'achat.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `name` | VARCHAR(100) | NOT NULL | Nom du pack |
| `credits` | INTEGER | NOT NULL | Nombre de crédits |
| `price` | DECIMAL(10,2) | NOT NULL | Prix du pack |
| `price_per_credit` | DECIMAL(10,2) | NOT NULL | Prix unitaire |
| `is_popular` | BOOLEAN | DEFAULT false | Pack populaire (badge) |
| `is_active` | BOOLEAN | DEFAULT true | Pack actif |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date de création |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Dernière mise à jour |

**Données initiales:**
- Pack Starter: 20 crédits, 24€
- Pack Standard: 50 crédits, 55€ (populaire)
- Pack Pro: 100 crédits, 99€
- Pack Agence: 200 crédits, 180€

**Actions associées:**
- Achat de pack de crédits (`/dashboard/credits`)

---

### 7. `credit_transactions`
Historique de toutes les transactions de crédits.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `user_id` | UUID | FOREIGN KEY | Référence vers `users` |
| `type` | ENUM | NOT NULL | credit, debit, refund, subscription_renewal |
| `amount` | INTEGER | NOT NULL | Nombre de crédits (+/-) |
| `balance_after` | INTEGER | NOT NULL | Solde après transaction |
| `description` | TEXT | NULL | Description |
| `reference_type` | VARCHAR(50) | NULL | Type de référence (image, pack, etc.) |
| `reference_id` | UUID | NULL | ID de la référence |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date de création |

**Indexes:**
- `idx_credit_transactions_user` sur `user_id`
- `idx_credit_transactions_type` sur `type`
- `idx_credit_transactions_date` sur `created_at`

**Actions associées:**
- Consultation de l'historique (`/dashboard/credits/history`)
- Export CSV
- Filtrage par type/date

---

### 8. `projects`
Projets immobiliers créés par les utilisateurs.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `user_id` | UUID | FOREIGN KEY | Référence vers `users` |
| `name` | VARCHAR(255) | NOT NULL | Nom du projet |
| `address` | TEXT | NULL | Adresse du bien |
| `description` | TEXT | NULL | Description |
| `cover_image_url` | TEXT | NULL | Image de couverture |
| `status` | ENUM | DEFAULT 'active' | active, archived, deleted |
| `total_images` | INTEGER | DEFAULT 0 | Nombre total d'images |
| `completed_images` | INTEGER | DEFAULT 0 | Images terminées |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date de création |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Dernière mise à jour |

**Indexes:**
- `idx_projects_user` sur `user_id`
- `idx_projects_status` sur `status`
- `idx_projects_updated` sur `updated_at`

**Actions associées:**
- Création de projet (`/dashboard/projects/new`)
- Liste des projets (`/dashboard/projects`)
- Détails d'un projet (`/dashboard/projects/[id]`)
- Recherche de projets
- Suppression de projet

---

### 9. `transformation_types`
Types de transformations disponibles (styles système prédéfinis + styles personnalisés créés par les utilisateurs).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `user_id` | UUID | FOREIGN KEY | NULL pour types système, UUID pour styles personnalisés |
| `slug` | VARCHAR(100) | NOT NULL | Identifiant technique |
| `name` | VARCHAR(100) | NOT NULL | Nom affiché |
| `description` | TEXT | NULL | Description |
| `icon_name` | VARCHAR(50) | NULL | Nom de l'icône Lucide |
| `category` | VARCHAR(50) | NULL | depersonnalisation, staging, renovation, custom |
| `prompt_template` | TEXT | NULL | Template de prompt IA pour ce style |
| `example_image_url` | TEXT | NULL | Image exemple du style |
| `allow_furniture_toggle` | BOOLEAN | DEFAULT false | Option meubles oui/non |
| `is_system` | BOOLEAN | DEFAULT false | Type système (non supprimable, visible par tous) |
| `is_active` | BOOLEAN | DEFAULT true | Type actif |
| `is_public` | BOOLEAN | DEFAULT false | Style partageable avec d'autres utilisateurs |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date de création |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Dernière mise à jour |

**Types système (is_system = true, user_id = NULL):**
- depersonnalisation
- depersonnalisation_premium
- home_staging_moderne
- home_staging_scandinave
- home_staging_industriel
- renovation_luxe
- renovation_contemporaine
- style_personnalise

**Styles personnalisés (is_system = false, user_id = UUID):**
- Les utilisateurs peuvent créer leurs propres styles avec des prompts IA personnalisés
- Exemples : "Style Art Déco", "Minimaliste Japonais", "Industriel Vintage", etc.
- Chaque utilisateur ne voit que ses propres styles + les styles système
- Les styles peuvent être marqués comme `is_public = true` pour être partagés (fonctionnalité future)

**Indexes:**
- `idx_transformation_types_user` sur `user_id`
- `idx_transformation_types_slug` sur `slug`
- `idx_transformation_types_system` sur `is_system`
- `idx_transformation_types_category` sur `category`

**Requête SQL pour récupérer les styles disponibles pour un utilisateur:**
```sql
SELECT * FROM transformation_types
WHERE (is_system = true OR user_id = :current_user_id)
  AND is_active = true
ORDER BY is_system DESC, name ASC;
```

**Actions associées:**
- Création de style personnalisé (`/dashboard/styles/new`)
  - Nom du style
  - Prompt IA personnalisé
  - Upload d'image exemple (optionnel)
  - Catégorie
- Modification de style personnalisé (`/dashboard/styles/[id]`)
- Suppression de style personnalisé (uniquement si user_id = current_user)
- Liste des styles (`/dashboard/styles`) → Affiche styles système + styles utilisateur
- Recherche de styles

---

### 10. `images`
Images uploadées et transformées par les utilisateurs.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `project_id` | UUID | FOREIGN KEY | Référence vers `projects` |
| `user_id` | UUID | FOREIGN KEY | Référence vers `users` |
| `transformation_type_id` | UUID | FOREIGN KEY | Référence vers `transformation_types` |
| `original_url` | TEXT | NOT NULL | URL de l'image originale |
| `original_filename` | VARCHAR(255) | NULL | Nom du fichier original |
| `original_width` | INTEGER | NULL | Largeur originale |
| `original_height` | INTEGER | NULL | Hauteur originale |
| `original_size_bytes` | BIGINT | NULL | Taille du fichier |
| `transformed_url` | TEXT | NULL | URL de l'image transformée |
| `transformed_width` | INTEGER | NULL | Largeur transformée |
| `transformed_height` | INTEGER | NULL | Hauteur transformée |
| `quality` | ENUM | NOT NULL | standard, hd |
| `credits_used` | INTEGER | DEFAULT 1 | Crédits consommés |
| `status` | ENUM | DEFAULT 'pending' | pending, processing, completed, failed |
| `custom_prompt` | TEXT | NULL | Prompt personnalisé |
| `with_furniture` | BOOLEAN | NULL | Avec/sans meubles |
| `processing_started_at` | TIMESTAMP | NULL | Début du traitement |
| `processing_completed_at` | TIMESTAMP | NULL | Fin du traitement |
| `processing_duration_ms` | INTEGER | NULL | Durée en millisecondes |
| `error_message` | TEXT | NULL | Message d'erreur |
| `ai_model_version` | VARCHAR(50) | NULL | Version du modèle IA |
| `was_regenerated` | BOOLEAN | DEFAULT false | Image régénérée |
| `regeneration_count` | INTEGER | DEFAULT 0 | Nombre de régénérations |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date de création |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Dernière mise à jour |

**Indexes:**
- `idx_images_project` sur `project_id`
- `idx_images_user` sur `user_id`
- `idx_images_status` sur `status`
- `idx_images_created` sur `created_at`

**Actions associées:**
- Upload d'images (`/dashboard/projects/[id]`)
- Génération d'image (consomme crédits)
- Régénération d'image
- Modification du type de transformation
- Téléchargement d'image (originale/transformée)
- Suppression d'image
- Visualisation avant/après
- Filtrage par statut (toutes, terminées, en attente)

---

### 11. `user_notifications_preferences`
Préférences de notifications des utilisateurs.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `user_id` | UUID | FOREIGN KEY | Référence vers `users` |
| `projects_email` | BOOLEAN | DEFAULT true | Notifications projets |
| `credits_email` | BOOLEAN | DEFAULT true | Notifications crédits |
| `features_email` | BOOLEAN | DEFAULT true | Nouvelles fonctionnalités |
| `tips_email` | BOOLEAN | DEFAULT false | Conseils et astuces |
| `push_enabled` | BOOLEAN | DEFAULT false | Notifications push |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date de création |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Dernière mise à jour |

**Actions associées:**
- Configuration des notifications (`/dashboard/settings`)

---

### 12. `contact_submissions`
Soumissions du formulaire de contact (landing page).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `name` | VARCHAR(255) | NOT NULL | Nom |
| `email` | VARCHAR(255) | NOT NULL | Email |
| `message` | TEXT | NOT NULL | Message |
| `status` | ENUM | DEFAULT 'new' | new, read, replied, archived |
| `ip_address` | VARCHAR(45) | NULL | Adresse IP |
| `user_agent` | TEXT | NULL | User agent |
| `replied_at` | TIMESTAMP | NULL | Date de réponse |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date de soumission |

**Indexes:**
- `idx_contact_status` sur `status`
- `idx_contact_created` sur `created_at`

**Actions associées:**
- Soumission du formulaire de contact (landing page)

---

### 13. `sessions`
Sessions utilisateurs pour la gestion de l'authentification.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `user_id` | UUID | FOREIGN KEY | Référence vers `users` |
| `token` | VARCHAR(255) | UNIQUE, NOT NULL | Token de session |
| `ip_address` | VARCHAR(45) | NULL | Adresse IP |
| `user_agent` | TEXT | NULL | User agent |
| `expires_at` | TIMESTAMP | NOT NULL | Date d'expiration |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date de création |

**Indexes:**
- `idx_sessions_user` sur `user_id`
- `idx_sessions_token` sur `token`
- `idx_sessions_expires` sur `expires_at`

**Actions associées:**
- Connexion (création de session)
- Déconnexion (suppression de session)
- Vérification de session

---

### 14. `audit_logs`
Journal d'audit pour tracer les actions importantes.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `user_id` | UUID | FOREIGN KEY | Référence vers `users` (nullable) |
| `action` | VARCHAR(100) | NOT NULL | Type d'action |
| `entity_type` | VARCHAR(50) | NULL | Type d'entité affectée |
| `entity_id` | UUID | NULL | ID de l'entité |
| `old_values` | JSONB | NULL | Anciennes valeurs |
| `new_values` | JSONB | NULL | Nouvelles valeurs |
| `ip_address` | VARCHAR(45) | NULL | Adresse IP |
| `user_agent` | TEXT | NULL | User agent |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date de l'action |

**Indexes:**
- `idx_audit_user` sur `user_id`
- `idx_audit_action` sur `action`
- `idx_audit_created` sur `created_at`

**Actions tracées:**
- Connexion/Déconnexion
- Changement de mot de passe
- Modification de profil
- Achat de crédits
- Génération d'images
- Suppression de compte

---

### 15. `stripe_events`
Journal des événements Stripe pour audit et debugging (Stripe Webhooks).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `stripe_event_id` | VARCHAR(255) | UNIQUE, NOT NULL | Stripe Event ID (evt_xxx) |
| `type` | VARCHAR(100) | NOT NULL | Type d'événement Stripe |
| `api_version` | VARCHAR(50) | NULL | Version API Stripe |
| `data` | JSONB | NOT NULL | Données complètes de l'événement |
| `livemode` | BOOLEAN | NOT NULL | Mode production (true) ou test (false) |
| `processed` | BOOLEAN | DEFAULT false | Événement traité |
| `processed_at` | TIMESTAMP | NULL | Date de traitement |
| `error` | TEXT | NULL | Message d'erreur si échec |
| `retry_count` | INTEGER | DEFAULT 0 | Nombre de tentatives |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date de réception |

**Indexes:**
- `idx_stripe_events_event_id` sur `stripe_event_id`
- `idx_stripe_events_type` sur `type`
- `idx_stripe_events_processed` sur `processed`
- `idx_stripe_events_created` sur `created_at`

**Types d'événements Stripe à gérer:**

**Abonnements:**
- `customer.subscription.created` - Nouvel abonnement créé
- `customer.subscription.updated` - Abonnement modifié (changement de plan, statut)
- `customer.subscription.deleted` - Abonnement annulé
- `customer.subscription.trial_will_end` - Fin de période d'essai dans 3 jours

**Paiements:**
- `invoice.paid` - Facture payée avec succès
- `invoice.payment_failed` - Échec de paiement
- `invoice.payment_action_required` - Action requise (3D Secure)
- `charge.succeeded` - Paiement réussi
- `charge.failed` - Paiement échoué
- `charge.refunded` - Remboursement effectué

**Méthodes de paiement:**
- `payment_method.attached` - Carte ajoutée
- `payment_method.detached` - Carte supprimée
- `payment_method.updated` - Carte mise à jour

**Clients:**
- `customer.created` - Nouveau client Stripe
- `customer.updated` - Client mis à jour
- `customer.deleted` - Client supprimé

**Note importante:**
- Cette table permet de garantir l'idempotence (évite le traitement multiple du même événement)
- Stripe peut renvoyer plusieurs fois le même webhook, on utilise `stripe_event_id` pour déduplication
- Le champ `data` contient l'événement complet pour debugging
- Les événements non traités peuvent être retraités via un job

**Actions associées:**
- Réception de webhook Stripe → Insertion dans `stripe_events`
- Traitement asynchrone → Mise à jour de `processed = true`
- Retry en cas d'erreur → Incrémentation de `retry_count`

---

## Relations

```
users (1) ----< (N) projects
users (1) ----< (N) images
users (1) ----< (N) subscriptions
users (1) ----< (N) payment_methods
users (1) ----< (N) invoices
users (1) ----< (N) credit_transactions
users (1) ----< (N) transformation_types (custom styles)
users (1) ----< (N) sessions
users (1) ----< (N) audit_logs
users (N) ----< (1) subscription_plans

projects (1) ----< (N) images

transformation_types (1) ----< (N) images

subscriptions (N) ----< (1) subscription_plans
```

---

## Intégration Stripe - Architecture et Flux

### Configuration Stripe

**Produits Stripe à créer:**

1. **Abonnements mensuels/annuels:**
   - Starter (19€/mois ou 190€/an) - 20 crédits/mois
   - Pro (79€/mois ou 790€/an) - 120 crédits/mois
   - Agence (249€/mois ou 2490€/an) - 500 crédits/mois

2. **Packs de crédits (paiements uniques):**
   - Pack Starter: 20 crédits - 24€
   - Pack Standard: 50 crédits - 55€
   - Pack Pro: 100 crédits - 99€
   - Pack Agence: 200 crédits - 180€

**Stripe Customer:**
- Un `stripe_customer_id` est créé pour chaque utilisateur lors de son premier paiement
- Stocké dans `payment_methods.stripe_customer_id` et `subscriptions.stripe_customer_id`

### Endpoints API à implémenter

**1. POST /api/stripe/create-checkout-session**
- Créer une session Checkout pour abonnement ou achat de pack
- Paramètres: `type` (subscription ou credit_pack), `plan_id` ou `pack_id`
- Retourne: URL de redirection vers Stripe Checkout

**2. POST /api/stripe/create-portal-session**
- Créer une session Customer Portal pour gérer abonnement/cartes
- Retourne: URL de redirection vers Stripe Portal

**3. POST /api/stripe/webhook**
- Endpoint pour recevoir les webhooks Stripe
- Vérifie la signature avec `stripe.webhooks.constructEvent()`
- Traite les événements et met à jour la base de données

### Webhooks Stripe à configurer

**URL:** `https://votre-domaine.com/api/stripe/webhook`

**Événements à écouter:**

```
# Abonnements
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
customer.subscription.trial_will_end

# Factures
invoice.paid
invoice.payment_failed
invoice.payment_action_required

# Paiements
charge.succeeded
charge.failed
charge.refunded

# Méthodes de paiement
payment_method.attached
payment_method.detached

# Clients
customer.created
customer.updated
```

### Flux de paiement

**1. Souscription à un abonnement:**
```
1. User clique sur "S'abonner au plan Pro"
2. Frontend → POST /api/stripe/create-checkout-session { type: "subscription", plan_id: "pro" }
3. Backend crée Stripe Checkout Session avec mode: "subscription"
4. User redirigé vers Stripe Checkout
5. User entre ses infos de paiement
6. Stripe traite le paiement
7. Webhook `customer.subscription.created` → Insertion dans `subscriptions`
8. Webhook `invoice.paid` → Insertion dans `invoices`, ajout de crédits via `credit_transactions`
9. User redirigé vers success_url (/dashboard/credits?success=true)
```

**2. Achat de pack de crédits:**
```
1. User clique sur "Acheter 50 crédits - 55€"
2. Frontend → POST /api/stripe/create-checkout-session { type: "credit_pack", pack_id: "pack-50" }
3. Backend crée Stripe Checkout Session avec mode: "payment"
4. User redirigé vers Stripe Checkout (carte existante pré-sélectionnée)
5. Paiement traité
6. Webhook `charge.succeeded` → Insertion dans `invoices`, ajout de crédits via `credit_transactions`
7. User redirigé vers success_url (/dashboard/credits?success=true)
```

**3. Gestion de l'abonnement:**
```
1. User va dans /dashboard/settings (onglet Facturation)
2. Clique sur "Gérer mon abonnement"
3. Frontend → POST /api/stripe/create-portal-session
4. User redirigé vers Stripe Customer Portal
5. User peut : changer de plan, annuler, mettre à jour carte
6. Webhooks synchronisent automatiquement les changements
7. User redirigé vers return_url (/dashboard/settings)
```

### Exemple de traitement de webhook

```typescript
// /app/api/stripe/webhook/route.ts
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  // Log l'événement dans stripe_events
  await db.stripe_events.create({
    stripe_event_id: event.id,
    type: event.type,
    data: event,
    livemode: event.livemode,
  });

  // Traiter selon le type
  switch (event.type) {
    case 'invoice.paid':
      const invoice = event.data.object;
      await handleInvoicePaid(invoice);
      break;

    case 'customer.subscription.updated':
      const subscription = event.data.object;
      await handleSubscriptionUpdated(subscription);
      break;

    // ... autres événements
  }

  return new Response('OK', { status: 200 });
}
```

### Sécurité

**Variables d'environnement:**
```
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

**Important:**
- Ne JAMAIS exposer `STRIPE_SECRET_KEY` côté client
- Toujours vérifier la signature des webhooks
- Utiliser Stripe Elements pour la saisie de carte (PCI compliance)
- Stocker uniquement les IDs Stripe, jamais les données de carte

---

## Vues SQL Utiles

### `v_user_dashboard_stats`
Vue pour les statistiques du dashboard utilisateur.

```sql
CREATE VIEW v_user_dashboard_stats AS
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
```

### `v_credit_history_summary`
Vue pour l'historique des crédits avec détails.

```sql
CREATE VIEW v_credit_history_summary AS
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
```

---

## Indexes Recommandés Supplémentaires

```sql
-- Performance pour les requêtes fréquentes
CREATE INDEX idx_images_project_status ON images(project_id, status);
CREATE INDEX idx_images_user_created ON images(user_id, created_at DESC);
CREATE INDEX idx_projects_user_updated ON projects(user_id, updated_at DESC);
CREATE INDEX idx_credit_transactions_user_date ON credit_transactions(user_id, created_at DESC);

-- Full-text search sur les projets
CREATE INDEX idx_projects_name_fulltext ON projects USING GIN(to_tsvector('french', name));
CREATE INDEX idx_projects_address_fulltext ON projects USING GIN(to_tsvector('french', address));
```

---

## Triggers Recommandés

### Mise à jour automatique du compteur d'images dans projects

```sql
CREATE OR REPLACE FUNCTION update_project_image_counts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects
  SET
    total_images = (
      SELECT COUNT(*) FROM images WHERE project_id = NEW.project_id
    ),
    completed_images = (
      SELECT COUNT(*) FROM images
      WHERE project_id = NEW.project_id AND status = 'completed'
    ),
    updated_at = NOW()
  WHERE id = NEW.project_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_counts
AFTER INSERT OR UPDATE ON images
FOR EACH ROW
EXECUTE FUNCTION update_project_image_counts();
```

### Mise à jour automatique des crédits

```sql
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
```

---

## Actions et Flux de Données

### Flux d'inscription et authentification

1. **Inscription** (`/auth/signup`)
   - Insertion dans `users`
   - Création de `user_notifications_preferences` par défaut
   - Envoi d'email de vérification
   - Création de `sessions`

2. **Connexion** (`/auth/login`)
   - Vérification des credentials dans `users`
   - Création de `sessions`
   - Enregistrement dans `audit_logs`

3. **Déconnexion**
   - Suppression de `sessions`
   - Enregistrement dans `audit_logs`

### Flux de gestion des crédits

1. **Achat de pack de crédits** (`/dashboard/credits`)
   - Création de `invoices` (status: pending)
   - Traitement du paiement
   - Mise à jour de `invoices` (status: paid)
   - Création de `credit_transactions` (type: credit)
   - Mise à jour de `users.credits_remaining`

2. **Génération d'image**
   - Vérification de `users.credits_remaining`
   - Création de `images` (status: pending)
   - Mise à jour de `images` (status: processing)
   - Déduction des crédits via `credit_transactions` (type: debit)
   - Traitement IA
   - Mise à jour de `images` (status: completed)

3. **Renouvellement mensuel**
   - Cron job vérifie `subscriptions.next_billing_date`
   - Création de `invoices`
   - Traitement du paiement
   - Création de `credit_transactions` (type: subscription_renewal)
   - Mise à jour de `subscriptions.current_period_end`

### Flux de gestion des projets

1. **Création de projet** (`/dashboard/projects/new`)
   - Insertion dans `projects`

2. **Upload d'images** (`/dashboard/projects/[id]`)
   - Upload vers storage (S3/Cloudinary)
   - Insertion dans `images` (status: pending)
   - Mise à jour de `projects` (total_images)

3. **Génération** (`/dashboard/projects/[id]`)
   - Vérification des crédits
   - Mise à jour de `images` (status: processing)
   - Appel API IA
   - Upload résultat vers storage
   - Mise à jour de `images` (status: completed, transformed_url)
   - Création de `credit_transactions`

4. **Suppression d'image**
   - Suppression de `images`
   - Suppression des fichiers du storage
   - Mise à jour de `projects` (total_images, completed_images)

---

## Considérations de Sécurité

### Row Level Security (RLS) - PostgreSQL

```sql
-- Les utilisateurs ne voient que leurs propres données
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY projects_user_isolation ON projects
  USING (user_id = current_user_id());

ALTER TABLE images ENABLE ROW LEVEL SECURITY;
CREATE POLICY images_user_isolation ON images
  USING (user_id = current_user_id());

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY credits_user_isolation ON credit_transactions
  USING (user_id = current_user_id());
```

### Données sensibles

- **Mots de passe**: Toujours hashés (bcrypt, argon2)
- **Tokens de session**: Stockés de manière sécurisée
- **Informations de paiement**: Jamais stockées en clair (utiliser Stripe, PayPal)
- **Données personnelles**: Conformité RGPD

---

## Migration et Versioning

### Stratégie recommandée

1. Utiliser un outil de migration (Prisma, TypeORM, Drizzle)
2. Versioning des schémas
3. Migrations incrémentales
4. Rollback automatique en cas d'erreur

### Exemple de migration initiale (SQL)

```sql
-- Migration 001: Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  -- ... autres colonnes
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Migration 002: Add indexes
CREATE INDEX idx_users_email ON users(email);

-- Migration 003: Create projects table
-- ... etc.
```

---

## Volumétrie et Performance

### Estimations

| Table | Volume estimé (1 an) | Croissance |
|-------|---------------------|------------|
| users | 10,000 | +1,000/mois |
| projects | 50,000 | +5,000/mois |
| images | 500,000 | +50,000/mois |
| credit_transactions | 1,000,000 | +100,000/mois |
| invoices | 120,000 | +10,000/mois |

### Optimisations

1. **Partitionnement** des tables volumineuses par date
2. **Archivage** des données anciennes (> 1 an)
3. **Cache** (Redis) pour les données fréquemment accédées
4. **CDN** pour les images
5. **Compression** des images
6. **Lazy loading** et pagination

---

## Sauvegarde et Disaster Recovery

### Stratégie

1. **Sauvegarde complète** quotidienne
2. **Sauvegarde incrémentale** toutes les 6 heures
3. **Réplication** master-slave pour haute disponibilité
4. **Rétention** : 30 jours de sauvegardes
5. **Tests de restauration** mensuels

---

## Conclusion

Ce schéma de base de données couvre l'ensemble des fonctionnalités de l'application Renzo Immobilier :

**✅ Gestion des utilisateurs et authentification**
- Table `users` avec profils complets
- Table `sessions` pour l'authentification
- Support de la 2FA
- Vérification d'email

**✅ Abonnements et facturation (Stripe)**
- Table `subscription_plans` avec 3 tiers (Starter, Pro, Agence)
- Table `subscriptions` synchronisée avec Stripe Billing
- Table `payment_methods` avec intégration Stripe PaymentMethods
- Table `invoices` synchronisée avec Stripe Invoices
- Table `stripe_events` pour audit et idempotence des webhooks

**✅ Gestion des crédits**
- Table `credit_packs` pour achats ponctuels
- Table `credit_transactions` pour historique complet
- Système de débit/crédit avec balance tracking
- Renouvellement automatique via abonnements

**✅ Projets et images**
- Table `projects` pour organisation par bien immobilier
- Table `images` avec tracking complet (original, transformée, statuts)
- Support qualité Standard (1 crédit) et HD (2 crédits)
- Tracking des durées de traitement et versions IA

**✅ Transformations IA et styles personnalisés**
- Table `transformation_types` pour styles système ET utilisateur
- Les utilisateurs peuvent créer leurs propres styles avec prompts IA personnalisés
- Système de partage de styles (fonctionnalité future avec `is_public`)
- Support de templates de prompts et images exemples

**✅ Historique et audit**
- Table `audit_logs` pour actions utilisateurs
- Table `stripe_events` pour événements Stripe
- Filtrage et export CSV
- Pagination et recherche avancée

**✅ Notifications et préférences**
- Table `user_notifications_preferences`
- Contrôle granulaire (projets, crédits, features, tips)
- Support email + push

**✅ Contact et support**
- Table `contact_submissions` pour formulaire landing page

---

### Architecture Technique

**15 tables principales** couvrant tous les besoins fonctionnels et techniques.

**Intégration Stripe complète:**
- Stripe Checkout pour paiements (abonnements + packs)
- Stripe Customer Portal pour gestion utilisateur
- Webhooks avec idempotence et retry logic
- Conformité PCI-DSS (aucune donnée de carte stockée)

**Scalabilité:**
- Indexes optimisés pour requêtes fréquentes
- Partitionnement recommandé pour tables volumineuses
- Vues SQL pour agrégations complexes
- Triggers pour cohérence automatique

**Sécurité:**
- Row Level Security (RLS) pour isolation utilisateurs
- Conformité RGPD (données personnelles, droit à l'oubli)
- Audit complet des actions sensibles
- Hashing des mots de passe (bcrypt/argon2)

**Performance:**
- CDN pour images
- Cache Redis pour données fréquentes
- Lazy loading et pagination
- Compression des images

Le schéma est **production-ready** et conçu pour supporter une croissance importante tout en maintenant performance et sécurité.
