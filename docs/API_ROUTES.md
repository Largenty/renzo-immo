# Documentation des Routes API - Renzo Immobilier

## Vue d'ensemble

Ce document décrit l'ensemble des routes API nécessaires pour l'application Renzo Immobilier, organisées par domaine fonctionnel.

**Base URL:** `https://api.renzo-immo.com` ou `/api` en Next.js

**Format de réponse:** JSON

**Authentification:** JWT Token via header `Authorization: Bearer {token}`

---

## Table des matières

1. [Authentification](#1-authentification)
2. [Utilisateurs](#2-utilisateurs)
3. [Projets](#3-projets)
4. [Images](#4-images)
5. [Transformations / Styles](#5-transformations--styles)
6. [Crédits](#6-crédits)
7. [Abonnements](#7-abonnements)
8. [Paiements (Stripe)](#8-paiements-stripe)
9. [Factures](#9-factures)
10. [Notifications](#10-notifications)
11. [Contact](#11-contact)
12. [Admin](#12-admin)

---

## 1. Authentification

### POST `/api/auth/register`
Inscription d'un nouvel utilisateur.

**Public:** Oui

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "Jean",
  "lastName": "Dupont",
  "company": "Agence Immobilière" // Optionnel
}
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Compte créé avec succès. Veuillez vérifier votre email.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Jean",
    "lastName": "Dupont"
  },
  "token": "jwt_token"
}
```

**Erreurs:**
- `400` - Email déjà utilisé
- `400` - Mot de passe trop faible
- `422` - Validation échouée

---

### POST `/api/auth/login`
Connexion d'un utilisateur.

**Public:** Oui

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Jean",
    "lastName": "Dupont",
    "avatar_url": "https://...",
    "credits_remaining": 48,
    "subscription_plan": {
      "name": "Pro",
      "slug": "pro"
    }
  },
  "token": "jwt_token"
}
```

**Erreurs:**
- `401` - Email ou mot de passe incorrect
- `403` - Email non vérifié
- `403` - Compte désactivé

---

### POST `/api/auth/logout`
Déconnexion (invalide le token).

**Auth:** Requise

**Réponse (200):**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

---

### POST `/api/auth/forgot-password`
Demande de réinitialisation de mot de passe.

**Public:** Oui

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Email de réinitialisation envoyé"
}
```

---

### POST `/api/auth/reset-password`
Réinitialisation du mot de passe.

**Public:** Oui

**Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "NewSecurePass123!"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Mot de passe réinitialisé avec succès"
}
```

**Erreurs:**
- `400` - Token invalide ou expiré

---

### POST `/api/auth/verify-email`
Vérification de l'email.

**Public:** Oui

**Body:**
```json
{
  "token": "verification_token_from_email"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Email vérifié avec succès"
}
```

---

### POST `/api/auth/resend-verification`
Renvoyer l'email de vérification.

**Auth:** Requise

**Réponse (200):**
```json
{
  "success": true,
  "message": "Email de vérification renvoyé"
}
```

---

### POST `/api/auth/enable-2fa`
Activer la 2FA.

**Auth:** Requise

**Réponse (200):**
```json
{
  "success": true,
  "qrCode": "data:image/png;base64,...",
  "secret": "JBSWY3DPEHPK3PXP"
}
```

---

### POST `/api/auth/verify-2fa`
Vérifier le code 2FA.

**Auth:** Requise

**Body:**
```json
{
  "code": "123456"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "2FA activée avec succès"
}
```

---

### POST `/api/auth/disable-2fa`
Désactiver la 2FA.

**Auth:** Requise

**Body:**
```json
{
  "password": "current_password"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "2FA désactivée"
}
```

---

## 2. Utilisateurs

### GET `/api/users/me`
Récupérer le profil de l'utilisateur connecté.

**Auth:** Requise

**Réponse (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Jean",
    "lastName": "Dupont",
    "company": "Agence Immobilière",
    "phone": "+33612345678",
    "address": "123 Rue de Paris, 75001 Paris",
    "avatar_url": "https://...",
    "credits_remaining": 48,
    "two_factor_enabled": true,
    "email_verified": true,
    "subscription_plan": {
      "id": "uuid",
      "name": "Pro",
      "slug": "pro",
      "credits_per_month": 120
    },
    "subscription": {
      "status": "active",
      "current_period_end": "2025-11-23",
      "cancel_at_period_end": false
    },
    "created_at": "2025-01-15T10:00:00Z",
    "last_login_at": "2025-10-23T08:30:00Z"
  }
}
```

---

### PATCH `/api/users/me`
Mettre à jour le profil.

**Auth:** Requise

**Body:**
```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "company": "Nouvelle Agence",
  "phone": "+33612345678",
  "address": "123 Rue de Paris, 75001 Paris"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Profil mis à jour",
  "user": { /* user object */ }
}
```

---

### POST `/api/users/me/avatar`
Uploader une photo de profil.

**Auth:** Requise

**Content-Type:** `multipart/form-data`

**Body:**
```
avatar: File (image/jpeg, image/png, max 5MB)
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Photo de profil mise à jour",
  "avatar_url": "https://cdn.renzo-immo.com/avatars/uuid.jpg"
}
```

---

### DELETE `/api/users/me/avatar`
Supprimer la photo de profil.

**Auth:** Requise

**Réponse (200):**
```json
{
  "success": true,
  "message": "Photo de profil supprimée"
}
```

---

### POST `/api/users/me/change-password`
Changer le mot de passe.

**Auth:** Requise

**Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Mot de passe modifié avec succès"
}
```

**Erreurs:**
- `401` - Mot de passe actuel incorrect

---

### DELETE `/api/users/me`
Supprimer le compte (RGPD).

**Auth:** Requise

**Body:**
```json
{
  "password": "current_password",
  "confirmation": "DELETE"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Compte supprimé avec succès"
}
```

---

### GET `/api/users/me/stats`
Statistiques du dashboard.

**Auth:** Requise

**Réponse (200):**
```json
{
  "success": true,
  "stats": {
    "total_projects": 12,
    "total_images": 48,
    "completed_images": 42,
    "processing_images": 6,
    "credits_remaining": 48,
    "credits_used_this_month": 72,
    "subscription": {
      "plan_name": "Pro",
      "credits_per_month": 120,
      "next_renewal": "2025-11-23"
    }
  }
}
```

---

## 3. Projets

### GET `/api/projects`
Liste des projets de l'utilisateur.

**Auth:** Requise

**Query params:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `status` (active, archived, deleted)
- `search` (recherche par nom/adresse)
- `sort` (created_at, updated_at, name)
- `order` (asc, desc)

**Réponse (200):**
```json
{
  "success": true,
  "projects": [
    {
      "id": "uuid",
      "name": "Villa Moderne - Cannes",
      "address": "Cannes, 06400",
      "description": "Villa 4 pièces",
      "cover_image_url": "https://...",
      "status": "active",
      "total_images": 8,
      "completed_images": 6,
      "created_at": "2025-10-01T10:00:00Z",
      "updated_at": "2025-10-20T15:30:00Z"
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

---

### POST `/api/projects`
Créer un nouveau projet.

**Auth:** Requise

**Body:**
```json
{
  "name": "Villa Moderne - Cannes",
  "address": "Cannes, 06400",
  "description": "Villa 4 pièces avec piscine"
}
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Projet créé avec succès",
  "project": {
    "id": "uuid",
    "name": "Villa Moderne - Cannes",
    "address": "Cannes, 06400",
    "description": "Villa 4 pièces avec piscine",
    "status": "active",
    "total_images": 0,
    "completed_images": 0,
    "created_at": "2025-10-23T10:00:00Z"
  }
}
```

---

### GET `/api/projects/:id`
Détails d'un projet.

**Auth:** Requise

**Réponse (200):**
```json
{
  "success": true,
  "project": {
    "id": "uuid",
    "name": "Villa Moderne - Cannes",
    "address": "Cannes, 06400",
    "description": "Villa 4 pièces",
    "cover_image_url": "https://...",
    "status": "active",
    "total_images": 8,
    "completed_images": 6,
    "created_at": "2025-10-01T10:00:00Z",
    "updated_at": "2025-10-20T15:30:00Z",
    "images": [
      {
        "id": "uuid",
        "original_url": "https://...",
        "transformed_url": "https://...",
        "status": "completed",
        "quality": "hd",
        "credits_used": 2,
        "transformation_type": {
          "id": "uuid",
          "name": "Home Staging Moderne"
        },
        "created_at": "2025-10-20T10:00:00Z"
      }
    ]
  }
}
```

---

### PATCH `/api/projects/:id`
Mettre à jour un projet.

**Auth:** Requise

**Body:**
```json
{
  "name": "Villa Moderne - Cannes (VENDU)",
  "description": "Nouvelle description"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Projet mis à jour",
  "project": { /* project object */ }
}
```

---

### DELETE `/api/projects/:id`
Supprimer un projet (soft delete).

**Auth:** Requise

**Réponse (200):**
```json
{
  "success": true,
  "message": "Projet supprimé"
}
```

---

### POST `/api/projects/:id/archive`
Archiver un projet.

**Auth:** Requise

**Réponse (200):**
```json
{
  "success": true,
  "message": "Projet archivé"
}
```

---

### POST `/api/projects/:id/restore`
Restaurer un projet archivé.

**Auth:** Requise

**Réponse (200):**
```json
{
  "success": true,
  "message": "Projet restauré"
}
```

---

## 4. Images

### GET `/api/images`
Liste des images de l'utilisateur.

**Auth:** Requise

**Query params:**
- `page` (default: 1)
- `limit` (default: 20)
- `project_id` (filter par projet)
- `status` (pending, processing, completed, failed)
- `quality` (standard, hd)
- `transformation_type_id`
- `sort` (created_at, status)
- `order` (asc, desc)

**Réponse (200):**
```json
{
  "success": true,
  "images": [
    {
      "id": "uuid",
      "project_id": "uuid",
      "project_name": "Villa Moderne - Cannes",
      "original_url": "https://...",
      "original_filename": "salon.jpg",
      "transformed_url": "https://...",
      "status": "completed",
      "quality": "hd",
      "credits_used": 2,
      "transformation_type": {
        "id": "uuid",
        "name": "Home Staging Moderne",
        "slug": "home_staging_moderne"
      },
      "processing_duration_ms": 15000,
      "created_at": "2025-10-20T10:00:00Z",
      "processing_completed_at": "2025-10-20T10:00:15Z"
    }
  ],
  "pagination": {
    "total": 48,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

---

### POST `/api/images/upload`
Uploader et traiter une image.

**Auth:** Requise

**Content-Type:** `multipart/form-data`

**Body:**
```
image: File (image/jpeg, image/png, max 50MB)
project_id: uuid
transformation_type_id: uuid
quality: "standard" | "hd"
with_furniture: boolean (optionnel)
custom_prompt: string (optionnel)
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Image uploadée avec succès. Traitement en cours...",
  "image": {
    "id": "uuid",
    "status": "processing",
    "credits_used": 2,
    "estimated_duration_seconds": 20
  }
}
```

**Erreurs:**
- `400` - Format de fichier non supporté
- `400` - Fichier trop volumineux
- `402` - Crédits insuffisants
- `404` - Projet non trouvé

---

### GET `/api/images/:id`
Détails d'une image.

**Auth:** Requise

**Réponse (200):**
```json
{
  "success": true,
  "image": {
    "id": "uuid",
    "project_id": "uuid",
    "project_name": "Villa Moderne - Cannes",
    "original_url": "https://...",
    "original_filename": "salon.jpg",
    "original_width": 3840,
    "original_height": 2160,
    "original_size_bytes": 5242880,
    "transformed_url": "https://...",
    "transformed_width": 3840,
    "transformed_height": 2160,
    "status": "completed",
    "quality": "hd",
    "credits_used": 2,
    "transformation_type": {
      "id": "uuid",
      "name": "Home Staging Moderne",
      "slug": "home_staging_moderne",
      "category": "staging"
    },
    "custom_prompt": null,
    "with_furniture": true,
    "processing_started_at": "2025-10-20T10:00:00Z",
    "processing_completed_at": "2025-10-20T10:00:15Z",
    "processing_duration_ms": 15000,
    "ai_model_version": "v2.1.0",
    "was_regenerated": false,
    "regeneration_count": 0,
    "created_at": "2025-10-20T10:00:00Z"
  }
}
```

---

### POST `/api/images/:id/regenerate`
Régénérer une image (consomme des crédits).

**Auth:** Requise

**Body:**
```json
{
  "transformation_type_id": "uuid", // Optionnel, pour changer de style
  "quality": "hd", // Optionnel
  "with_furniture": true, // Optionnel
  "custom_prompt": "Style Art Déco" // Optionnel
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Régénération en cours...",
  "image": {
    "id": "uuid",
    "status": "processing",
    "credits_used": 2,
    "regeneration_count": 1
  }
}
```

**Erreurs:**
- `402` - Crédits insuffisants

---

### DELETE `/api/images/:id`
Supprimer une image.

**Auth:** Requise

**Réponse (200):**
```json
{
  "success": true,
  "message": "Image supprimée"
}
```

---

### GET `/api/images/:id/download`
Télécharger une image (originale ou transformée).

**Auth:** Requise

**Query params:**
- `type` (original, transformed)

**Réponse (200):**
Redirect vers l'URL signée du fichier (S3/Cloudinary)

---

## 5. Transformations / Styles

### GET `/api/transformation-types`
Liste des types de transformation (styles système + styles utilisateur).

**Auth:** Requise

**Query params:**
- `category` (depersonnalisation, staging, renovation, custom)
- `is_system` (true, false)
- `search` (recherche par nom)

**Réponse (200):**
```json
{
  "success": true,
  "transformationTypes": [
    {
      "id": "uuid",
      "slug": "home_staging_moderne",
      "name": "Home Staging Moderne",
      "description": "Mobilier contemporain épuré",
      "icon_name": "Home",
      "category": "staging",
      "allow_furniture_toggle": true,
      "is_system": true,
      "is_active": true,
      "example_image_url": "https://..."
    },
    {
      "id": "uuid",
      "slug": "user-style-art-deco",
      "name": "Mon Style Art Déco",
      "description": "Style personnalisé",
      "category": "custom",
      "allow_furniture_toggle": false,
      "is_system": false,
      "is_active": true,
      "example_image_url": "https://...",
      "prompt_template": "Art Deco interior design with geometric patterns...",
      "created_at": "2025-10-15T10:00:00Z"
    }
  ]
}
```

---

### POST `/api/transformation-types`
Créer un style personnalisé.

**Auth:** Requise

**Body:**
```json
{
  "name": "Mon Style Art Déco",
  "description": "Style Art Déco avec motifs géométriques",
  "category": "custom",
  "prompt_template": "Art Deco interior design with geometric patterns and gold accents",
  "allow_furniture_toggle": false
}
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Style créé avec succès",
  "transformationType": {
    "id": "uuid",
    "slug": "user-style-art-deco",
    "name": "Mon Style Art Déco",
    "is_system": false,
    "is_active": true
  }
}
```

---

### GET `/api/transformation-types/:id`
Détails d'un style.

**Auth:** Requise

**Réponse (200):**
```json
{
  "success": true,
  "transformationType": {
    "id": "uuid",
    "slug": "home_staging_moderne",
    "name": "Home Staging Moderne",
    "description": "Mobilier contemporain épuré",
    "icon_name": "Home",
    "category": "staging",
    "prompt_template": "Modern home staging with contemporary furniture...",
    "example_image_url": "https://...",
    "allow_furniture_toggle": true,
    "is_system": true,
    "is_active": true,
    "usage_count": 156 // Nombre d'utilisations par l'utilisateur
  }
}
```

---

### PATCH `/api/transformation-types/:id`
Modifier un style personnalisé.

**Auth:** Requise

**Body:**
```json
{
  "name": "Mon Style Art Déco V2",
  "description": "Nouvelle description",
  "prompt_template": "Nouveau prompt..."
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Style mis à jour",
  "transformationType": { /* transformation type object */ }
}
```

**Erreurs:**
- `403` - Impossible de modifier un style système
- `404` - Style non trouvé

---

### DELETE `/api/transformation-types/:id`
Supprimer un style personnalisé.

**Auth:** Requise

**Réponse (200):**
```json
{
  "success": true,
  "message": "Style supprimé"
}
```

**Erreurs:**
- `403` - Impossible de supprimer un style système
- `409` - Style utilisé dans des images existantes

---

### POST `/api/transformation-types/:id/example-image`
Uploader une image exemple pour un style personnalisé.

**Auth:** Requise

**Content-Type:** `multipart/form-data`

**Body:**
```
image: File (image/jpeg, image/png, max 5MB)
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Image exemple mise à jour",
  "example_image_url": "https://..."
}
```

---

## 6. Crédits

### GET `/api/credits/balance`
Solde de crédits de l'utilisateur.

**Auth:** Requise

**Réponse (200):**
```json
{
  "success": true,
  "credits": {
    "remaining": 48,
    "total_this_month": 120,
    "used_this_month": 72,
    "percentage_used": 60,
    "subscription_plan": {
      "name": "Pro",
      "credits_per_month": 120,
      "next_renewal": "2025-11-23"
    }
  }
}
```

---

### GET `/api/credits/transactions`
Historique des transactions de crédits.

**Auth:** Requise

**Query params:**
- `page` (default: 1)
- `limit` (default: 15)
- `type` (credit, debit, refund, subscription_renewal)
- `start_date` (YYYY-MM-DD)
- `end_date` (YYYY-MM-DD)
- `search` (recherche dans description)

**Réponse (200):**
```json
{
  "success": true,
  "transactions": [
    {
      "id": "uuid",
      "type": "debit",
      "amount": -2,
      "balance_after": 48,
      "description": "Génération HD - Villa Moderne - Cannes",
      "reference_type": "image",
      "reference_id": "uuid",
      "created_at": "2025-10-20T10:00:15Z"
    },
    {
      "id": "uuid",
      "type": "credit",
      "amount": 50,
      "balance_after": 98,
      "description": "Achat Pack Standard - 50 crédits",
      "reference_type": "pack",
      "reference_id": "uuid",
      "created_at": "2025-10-15T14:30:00Z"
    },
    {
      "id": "uuid",
      "type": "subscription_renewal",
      "amount": 120,
      "balance_after": 120,
      "description": "Renouvellement mensuel - Plan Pro",
      "reference_type": "subscription",
      "reference_id": "uuid",
      "created_at": "2025-10-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 156,
    "page": 1,
    "limit": 15,
    "pages": 11
  },
  "stats": {
    "total_credits_earned": 340,
    "total_credits_used": 292,
    "total_images_generated": 146
  }
}
```

---

### GET `/api/credits/transactions/export`
Exporter l'historique en CSV.

**Auth:** Requise

**Query params:**
- `start_date` (YYYY-MM-DD)
- `end_date` (YYYY-MM-DD)

**Réponse (200):**
CSV file download

---

### GET `/api/credits/packs`
Liste des packs de crédits disponibles.

**Auth:** Requise

**Réponse (200):**
```json
{
  "success": true,
  "packs": [
    {
      "id": "uuid",
      "name": "Pack Standard",
      "credits": 50,
      "price": 55.00,
      "price_per_credit": 1.10,
      "is_popular": true,
      "is_active": true
    },
    {
      "id": "uuid",
      "name": "Pack Pro",
      "credits": 100,
      "price": 99.00,
      "price_per_credit": 0.99,
      "is_popular": false,
      "is_active": true
    }
  ]
}
```

---

## 7. Abonnements

### GET `/api/subscription-plans`
Liste des forfaits d'abonnement.

**Public:** Oui

**Query params:**
- `billing_cycle` (monthly, yearly)

**Réponse (200):**
```json
{
  "success": true,
  "plans": [
    {
      "id": "uuid",
      "name": "Starter",
      "slug": "starter",
      "description": "Parfait pour débuter",
      "price_monthly": 19.00,
      "price_yearly": 190.00,
      "credits_per_month": 20,
      "features": [
        "20 crédits/mois",
        "Qualité Standard & HD",
        "Tous les styles",
        "Support email"
      ],
      "is_active": true
    },
    {
      "id": "uuid",
      "name": "Pro",
      "slug": "pro",
      "description": "Pour les professionnels",
      "price_monthly": 79.00,
      "price_yearly": 790.00,
      "credits_per_month": 120,
      "features": [
        "120 crédits/mois",
        "Qualité Standard & HD",
        "Tous les styles",
        "Styles personnalisés",
        "Support prioritaire"
      ],
      "is_active": true
    },
    {
      "id": "uuid",
      "name": "Agence",
      "slug": "agence",
      "description": "Pour les agences",
      "price_monthly": 249.00,
      "price_yearly": 2490.00,
      "credits_per_month": 500,
      "features": [
        "500 crédits/mois",
        "Qualité Standard & HD",
        "Tous les styles",
        "Styles personnalisés illimités",
        "API access",
        "Support dédié"
      ],
      "is_active": true
    }
  ]
}
```

---

### GET `/api/subscriptions/me`
Détails de l'abonnement de l'utilisateur.

**Auth:** Requise

**Réponse (200):**
```json
{
  "success": true,
  "subscription": {
    "id": "uuid",
    "plan": {
      "id": "uuid",
      "name": "Pro",
      "slug": "pro",
      "price_monthly": 79.00,
      "credits_per_month": 120
    },
    "status": "active",
    "billing_cycle": "monthly",
    "current_period_start": "2025-10-01",
    "current_period_end": "2025-11-01",
    "trial_start": null,
    "trial_end": null,
    "next_billing_date": "2025-11-01",
    "cancel_at_period_end": false,
    "stripe_subscription_id": "sub_xxx",
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

**Réponse si pas d'abonnement (200):**
```json
{
  "success": true,
  "subscription": null
}
```

---

### POST `/api/subscriptions/change-plan`
Changer de forfait (upgrade/downgrade).

**Auth:** Requise

**Body:**
```json
{
  "plan_id": "uuid",
  "billing_cycle": "monthly"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Forfait changé avec succès",
  "subscription": { /* subscription object */ }
}
```

**Erreurs:**
- `400` - Déjà sur ce plan
- `402` - Paiement requis

---

### POST `/api/subscriptions/cancel`
Annuler l'abonnement (à la fin de la période).

**Auth:** Requise

**Body:**
```json
{
  "reason": "Trop cher", // Optionnel
  "feedback": "..." // Optionnel
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Abonnement annulé. Actif jusqu'au 2025-11-01",
  "subscription": {
    "status": "active",
    "cancel_at_period_end": true,
    "current_period_end": "2025-11-01"
  }
}
```

---

### POST `/api/subscriptions/reactivate`
Réactiver un abonnement annulé.

**Auth:** Requise

**Réponse (200):**
```json
{
  "success": true,
  "message": "Abonnement réactivé",
  "subscription": {
    "status": "active",
    "cancel_at_period_end": false
  }
}
```

---

## 8. Paiements (Stripe)

### POST `/api/stripe/create-checkout-session`
Créer une session Stripe Checkout (abonnement ou pack de crédits).

**Auth:** Requise

**Body (Abonnement):**
```json
{
  "type": "subscription",
  "plan_id": "uuid",
  "billing_cycle": "monthly",
  "success_url": "https://app.renzo-immo.com/dashboard/credits?success=true",
  "cancel_url": "https://app.renzo-immo.com/pricing"
}
```

**Body (Pack de crédits):**
```json
{
  "type": "credit_pack",
  "pack_id": "uuid",
  "success_url": "https://app.renzo-immo.com/dashboard/credits?success=true",
  "cancel_url": "https://app.renzo-immo.com/dashboard/credits"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_xxx"
}
```

**Erreurs:**
- `400` - Paramètres invalides
- `404` - Plan ou pack non trouvé

---

### POST `/api/stripe/create-portal-session`
Créer une session Stripe Customer Portal (gestion abonnement/cartes).

**Auth:** Requise

**Body:**
```json
{
  "return_url": "https://app.renzo-immo.com/dashboard/settings"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "portal_url": "https://billing.stripe.com/p/session/test_xxx"
}
```

**Erreurs:**
- `400` - Pas de client Stripe

---

### POST `/api/stripe/webhook`
Endpoint pour les webhooks Stripe.

**Public:** Oui (mais vérifie signature Stripe)

**Headers:**
- `stripe-signature`: Signature Stripe

**Body:** Raw JSON de Stripe

**Événements traités:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`
- `charge.succeeded`
- `charge.failed`
- `payment_method.attached`
- `payment_method.detached`

**Réponse (200):**
```json
{
  "received": true
}
```

**Erreurs:**
- `400` - Signature invalide
- `500` - Erreur de traitement

---

## 9. Factures

### GET `/api/invoices`
Liste des factures de l'utilisateur.

**Auth:** Requise

**Query params:**
- `page` (default: 1)
- `limit` (default: 10)
- `status` (paid, open, draft, uncollectible, void)
- `start_date` (YYYY-MM-DD)
- `end_date` (YYYY-MM-DD)

**Réponse (200):**
```json
{
  "success": true,
  "invoices": [
    {
      "id": "uuid",
      "invoice_number": "INV-2025-10-001",
      "status": "paid",
      "amount_total": 79.00,
      "amount_subtotal": 65.83,
      "amount_tax": 13.17,
      "currency": "EUR",
      "description": "Abonnement Pro - Octobre 2025",
      "stripe_hosted_invoice_url": "https://invoice.stripe.com/i/acct_xxx/test_xxx",
      "invoice_pdf_url": "https://invoice.stripe.com/i/acct_xxx/test_xxx/pdf",
      "paid_at": "2025-10-01T00:05:23Z",
      "period_start": "2025-10-01",
      "period_end": "2025-11-01",
      "created_at": "2025-10-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

### GET `/api/invoices/:id`
Détails d'une facture.

**Auth:** Requise

**Réponse (200):**
```json
{
  "success": true,
  "invoice": {
    "id": "uuid",
    "invoice_number": "INV-2025-10-001",
    "status": "paid",
    "amount_total": 79.00,
    "amount_subtotal": 65.83,
    "amount_tax": 13.17,
    "currency": "EUR",
    "description": "Abonnement Pro - Octobre 2025",
    "line_items": [
      {
        "description": "Plan Pro (01/10/2025 - 01/11/2025)",
        "quantity": 1,
        "unit_amount": 79.00,
        "amount": 79.00
      }
    ],
    "stripe_hosted_invoice_url": "https://invoice.stripe.com/i/acct_xxx/test_xxx",
    "invoice_pdf_url": "https://invoice.stripe.com/i/acct_xxx/test_xxx/pdf",
    "paid_at": "2025-10-01T00:05:23Z",
    "due_date": null,
    "period_start": "2025-10-01",
    "period_end": "2025-11-01",
    "created_at": "2025-10-01T00:00:00Z"
  }
}
```

---

### GET `/api/invoices/:id/download`
Télécharger une facture en PDF.

**Auth:** Requise

**Réponse (302):**
Redirect vers `invoice_pdf_url` Stripe

---

## 10. Notifications

### GET `/api/notifications/preferences`
Récupérer les préférences de notifications.

**Auth:** Requise

**Réponse (200):**
```json
{
  "success": true,
  "preferences": {
    "projects_email": true,
    "credits_email": true,
    "features_email": true,
    "tips_email": false,
    "push_enabled": false
  }
}
```

---

### PATCH `/api/notifications/preferences`
Mettre à jour les préférences.

**Auth:** Requise

**Body:**
```json
{
  "projects_email": false,
  "credits_email": true,
  "features_email": true,
  "tips_email": true,
  "push_enabled": true
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Préférences mises à jour",
  "preferences": { /* preferences object */ }
}
```

---

## 11. Contact

### POST `/api/contact`
Envoyer un message via le formulaire de contact.

**Public:** Oui

**Body:**
```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "message": "Bonjour, j'ai une question..."
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Message envoyé avec succès. Nous vous répondrons sous 24h."
}
```

**Erreurs:**
- `429` - Trop de requêtes (rate limiting)

---

## 12. Admin

### GET `/api/admin/stats`
Statistiques globales de la plateforme.

**Auth:** Admin uniquement

**Réponse (200):**
```json
{
  "success": true,
  "stats": {
    "total_users": 1542,
    "active_subscriptions": 893,
    "total_projects": 8234,
    "total_images_generated": 45678,
    "total_revenue_this_month": 56780.00,
    "new_users_this_month": 234
  }
}
```

---

### GET `/api/admin/users`
Liste des utilisateurs (admin).

**Auth:** Admin uniquement

**Query params:**
- `page`, `limit`, `search`, `status`, `subscription_plan`

**Réponse (200):**
```json
{
  "success": true,
  "users": [ /* users array */ ],
  "pagination": { /* pagination */ }
}
```

---

### GET `/api/admin/contact-submissions`
Liste des soumissions de contact.

**Auth:** Admin uniquement

**Query params:**
- `page`, `limit`, `status` (new, read, replied, archived)

**Réponse (200):**
```json
{
  "success": true,
  "submissions": [
    {
      "id": "uuid",
      "name": "Jean Dupont",
      "email": "jean@example.com",
      "message": "Bonjour...",
      "status": "new",
      "ip_address": "192.168.1.1",
      "created_at": "2025-10-23T10:00:00Z"
    }
  ],
  "pagination": { /* pagination */ }
}
```

---

### PATCH `/api/admin/contact-submissions/:id`
Mettre à jour le statut d'une soumission.

**Auth:** Admin uniquement

**Body:**
```json
{
  "status": "replied"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Statut mis à jour"
}
```

---

## Codes d'erreur HTTP

- `200` - OK
- `201` - Created
- `400` - Bad Request (validation échouée)
- `401` - Unauthorized (non authentifié)
- `402` - Payment Required (crédits insuffisants)
- `403` - Forbidden (pas les permissions)
- `404` - Not Found
- `409` - Conflict (ressource en conflit)
- `422` - Unprocessable Entity (erreur de validation)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## Format des erreurs

Toutes les erreurs suivent ce format :

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Les données fournies sont invalides",
    "details": [
      {
        "field": "email",
        "message": "Email invalide"
      }
    ]
  }
}
```

**Codes d'erreur courants :**
- `VALIDATION_ERROR` - Erreur de validation
- `UNAUTHORIZED` - Non authentifié
- `FORBIDDEN` - Accès interdit
- `NOT_FOUND` - Ressource non trouvée
- `INSUFFICIENT_CREDITS` - Crédits insuffisants
- `RATE_LIMIT_EXCEEDED` - Limite de requêtes dépassée
- `STRIPE_ERROR` - Erreur de paiement Stripe
- `UPLOAD_ERROR` - Erreur d'upload de fichier
- `PROCESSING_ERROR` - Erreur de traitement IA

---

## Rate Limiting

**Limites par défaut :**
- Authentification : 5 requêtes/minute
- Upload d'images : 10 requêtes/minute
- API générale : 100 requêtes/minute
- Contact public : 3 requêtes/heure

**Headers de réponse :**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1729671234
```

---

## Authentification JWT

**Header :**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Payload JWT :**
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "role": "user",
  "iat": 1729671234,
  "exp": 1729757634
}
```

**Expiration :** 24 heures

**Refresh token :** À implémenter via `/api/auth/refresh`

---

## Webhooks sortants (à implémenter)

Pour notifier des systèmes externes (optionnel) :

### POST `{user_webhook_url}`
Notifications d'événements vers URLs configurées par l'utilisateur.

**Événements disponibles :**
- `image.completed` - Image traitée avec succès
- `image.failed` - Échec de traitement
- `credits.low` - Crédits faibles (< 10)
- `subscription.renewed` - Abonnement renouvelé

**Payload exemple :**
```json
{
  "event": "image.completed",
  "timestamp": "2025-10-23T10:00:00Z",
  "data": {
    "image_id": "uuid",
    "project_id": "uuid",
    "status": "completed",
    "transformed_url": "https://..."
  }
}
```

---

## Versioning de l'API

**Version actuelle :** v1

**Format :** `/api/v1/...` ou header `Accept: application/vnd.renzo.v1+json`

**Versions supportées :** v1 uniquement pour le moment

---

## Environnements

**Production :** `https://api.renzo-immo.com`
**Staging :** `https://api-staging.renzo-immo.com`
**Development :** `http://localhost:3000/api`

---

## Prochaines améliorations

- [ ] Endpoint `/api/auth/refresh` pour refresh token
- [ ] Endpoint `/api/images/batch-upload` pour upload multiple
- [ ] Endpoint `/api/projects/:id/duplicate` pour dupliquer un projet
- [ ] WebSockets pour notifications temps réel
- [ ] GraphQL API en complément du REST
- [ ] Webhooks sortants configurables
- [ ] API Key pour intégrations tierces

---

**Dernière mise à jour :** 23 octobre 2025
**Version :** 1.0.0
