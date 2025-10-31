# 🔍 Guide de Configuration Sentry

Ce guide vous explique comment configurer Sentry pour le tracking d'erreurs en production.

## 📋 Table des Matières

1. [Pourquoi Sentry ?](#pourquoi-sentry)
2. [Configuration Rapide (5 minutes)](#configuration-rapide)
3. [Configuration Avancée (Sourcemaps)](#configuration-avancée)
4. [Tester Sentry](#tester-sentry)
5. [Utilisation en Production](#utilisation-en-production)

---

## 🎯 Pourquoi Sentry ?

Sentry vous permet de:
- ✅ **Capturer toutes les erreurs** en production automatiquement
- ✅ **Être alerté** par email/Slack quand des erreurs surviennent
- ✅ **Voir les stack traces** complètes avec le contexte
- ✅ **Identifier les erreurs critiques** qui affectent vos utilisateurs
- ✅ **Tracker les performances** de votre application

**Plan gratuit:** 5,000 erreurs/mois (largement suffisant pour démarrer)

---

## ⚡ Configuration Rapide (5 minutes)

### Étape 1: Créer un Compte Sentry

1. Allez sur **https://sentry.io**
2. Cliquez sur **"Get Started"** ou **"Sign Up"**
3. Créez un compte (gratuit):
   - Via GitHub (recommandé)
   - Via Google
   - Ou avec email/password

### Étape 2: Créer une Organisation

1. Donnez un nom à votre organisation: `renzo-immo` (ou autre)
2. Sélectionnez le plan: **"Developer" (Free)**
3. Cliquez sur **"Continue"**

### Étape 3: Créer un Projet

1. Sélectionnez la plateforme: **"Next.js"**
2. Nom du projet: `renzo-immo-prod`
3. Cliquez sur **"Create Project"**

### Étape 4: Récupérer le DSN

Après la création, Sentry affiche automatiquement votre **DSN**.

Il ressemble à ça:
```
https://abc123def456@o123456.ingest.sentry.io/7891011
           ↑                ↑                 ↑
         token         organisation       project ID
```

**COPIEZ CE DSN!**

### Étape 5: Ajouter le DSN à votre .env

Dans votre fichier `.env`, ajoutez:

```bash
# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://votre-dsn-complet-ici
```

**⚠️ Important:** Le DSN commence par `NEXT_PUBLIC_` car il doit être accessible côté client.

### Étape 6: C'est tout! 🎉

Sentry est maintenant configuré et capturera automatiquement les erreurs en production!

---

## 🚀 Configuration Avancée (Sourcemaps)

Les sourcemaps permettent à Sentry d'afficher le code original (non-minifié) dans les erreurs de production.

### Pourquoi faire ?

Sans sourcemaps:
```javascript
// Stack trace illisible
at r.t (main-abc123.js:1:23456)
```

Avec sourcemaps:
```javascript
// Stack trace claire
at generateImage (app/api/generate-image/route.ts:285:12)
```

### Configuration

#### 1. Créer un Auth Token

1. Dans Sentry, cliquez sur votre avatar → **Settings**
2. Dans le menu de gauche: **Auth Tokens**
3. Cliquez sur **"Create New Token"**
4. Configuration du token:
   - **Name:** `renzo-immo-sourcemaps`
   - **Scopes:** Cochez:
     - ✅ `project:read`
     - ✅ `project:releases`
     - ✅ `project:write`
5. Cliquez sur **"Create Token"**
6. **COPIEZ LE TOKEN** (il ne sera plus visible après!)

#### 2. Ajouter les Variables d'Environnement

Dans votre `.env`:

```bash
# Sentry - Configuration complète
NEXT_PUBLIC_SENTRY_DSN=https://votre-dsn@sentry.io/123456

# Pour l'upload des sourcemaps (optionnel mais recommandé)
SENTRY_AUTH_TOKEN=sntrys_votre_token_ici
SENTRY_ORG=votre-org-slug
SENTRY_PROJECT=renzo-immo-prod
```

**Comment trouver votre SENTRY_ORG?**

Regardez l'URL dans Sentry:
```
https://sentry.io/organizations/votre-org-slug/issues/
                              ↑
                         C'est ici!
```

---

## 🧪 Tester Sentry

### Option 1: Page de Test (Recommandé)

J'ai créé une page de test pour vous:

1. Accédez à: **http://localhost:3000/test-sentry**
2. Cliquez sur les boutons pour générer des erreurs de test
3. Allez dans votre dashboard Sentry pour voir les erreurs

### Option 2: Forcer une Erreur Manuelle

Dans n'importe quel fichier, ajoutez:

```typescript
import * as Sentry from '@sentry/nextjs';

// Capturer une erreur manuelle
try {
  throw new Error('Test Sentry');
} catch (error) {
  Sentry.captureException(error);
}

// Capturer un message
Sentry.captureMessage('Test message from Sentry');
```

### Option 3: Laisser une Vraie Erreur se Produire

Sentry capture automatiquement toutes les erreurs non catchées en production!

---

## 🌐 Utilisation en Production

### Activation Automatique

Sentry est configuré pour **s'activer seulement en production**:

```typescript
// Dans sentry.*.config.ts
enabled: process.env.NODE_ENV === 'production'
```

En développement, les erreurs s'affichent normalement dans la console.

### Build et Déploiement

Quand vous buildez pour la production:

```bash
npm run build
```

Si vous avez configuré les sourcemaps (avec `SENTRY_AUTH_TOKEN`), Next.js uploadera automatiquement les sourcemaps à Sentry pendant le build.

### Vérifier que Sentry Fonctionne

Après le déploiement:

1. Visitez votre site en production
2. Allez sur votre dashboard Sentry: **https://sentry.io**
3. Vérifiez les **Issues** dans votre projet
4. Les erreurs apparaissent en temps réel!

---

## 📊 Dashboard Sentry

### Sections Importantes

1. **Issues**
   - Liste de toutes les erreurs
   - Groupées par type
   - Nombre d'occurrences
   - Utilisateurs affectés

2. **Performance**
   - Temps de réponse des pages
   - Transactions lentes
   - Goulots d'étranglement

3. **Alerts**
   - Configurez des alertes email/Slack
   - Soyez notifié des erreurs critiques
   - Définissez des seuils

### Créer une Alerte Email

1. Dans Sentry → **Alerts** → **Create Alert**
2. Choisissez: "Issues"
3. Condition: "When an issue is first seen"
4. Actions: "Send a notification via Email"
5. Cliquez sur **"Save Rule"**

Vous recevrez maintenant un email à chaque nouvelle erreur!

---

## 🔒 Sécurité et Confidentialité

### Données Sensibles Filtrées

Sentry est configuré pour **filtrer automatiquement**:

✅ **Cookies** - Supprimés des requêtes
✅ **Headers d'authentification** - Supprimés
✅ **Passwords** - Filtrés dans les URLs et breadcrumbs
✅ **Tokens API** - Filtrés dans les URLs

Configuration dans `sentry.server.config.ts`:

```typescript
beforeSend(event) {
  // Supprimer les données sensibles
  if (event.request) {
    delete event.request.cookies;
    delete event.request.headers;

    // Nettoyer les query params
    const url = new URL(event.request.url);
    url.searchParams.delete('token');
    url.searchParams.delete('api_key');
    url.searchParams.delete('password');
    event.request.url = url.toString();
  }

  return event;
}
```

### Erreurs Ignorées

Certaines erreurs courantes sont ignorées automatiquement:

- `ResizeObserver loop limit exceeded` (erreur navigateur)
- `Non-Error promise rejection captured` (warning React)
- `NetworkError` / `Failed to fetch` (erreurs réseau temporaires)

---

## 💰 Coûts et Limites

### Plan Gratuit (Developer)

- ✅ **5,000 erreurs/mois**
- ✅ **1 projet**
- ✅ **Rétention 30 jours**
- ✅ **1 membre d'équipe**
- ✅ **Alertes illimitées**

### Que se passe-t-il si je dépasse?

Si vous dépassez 5,000 erreurs/mois:
1. Sentry arrête de capturer de nouvelles erreurs ce mois-ci
2. Les erreurs existantes restent visibles
3. Le compteur se réinitialise le 1er du mois suivant

**Astuce:** Configurez des filtres pour ignorer les erreurs non-critiques.

### Plans Payants

Si vous avez besoin de plus:
- **Team ($26/mois):** 50,000 erreurs/mois
- **Business ($80/mois):** 100,000 erreurs/mois

---

## 🛠️ Troubleshooting

### "Sentry ne capture aucune erreur"

**1. Vérifiez que NODE_ENV=production:**

Sentry est désactivé en développement par défaut.

```bash
# Dans .env
NODE_ENV=production
```

**2. Vérifiez le DSN:**

```bash
# Doit commencer par NEXT_PUBLIC_
NEXT_PUBLIC_SENTRY_DSN=https://...
```

**3. Testez avec la page de test:**

Allez sur `/test-sentry` et cliquez sur les boutons.

### "Les sourcemaps ne fonctionnent pas"

**1. Vérifiez les variables d'environnement:**

```bash
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=votre-org
SENTRY_PROJECT=votre-projet
```

**2. Vérifiez les permissions du token:**

Le token doit avoir les scopes:
- `project:read`
- `project:releases`
- `project:write`

**3. Regardez les logs du build:**

```bash
npm run build
# Vous devriez voir:
# > Uploading source maps to Sentry...
```

### "Trop d'erreurs envoyées"

Ajoutez des filtres dans `sentry.*.config.ts`:

```typescript
ignoreErrors: [
  'MonErreurNonCritique',
  /regex-pour-filtrer/,
],
```

---

## 📚 Ressources

- **Documentation Sentry Next.js:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Dashboard Sentry:** https://sentry.io
- **Status Sentry:** https://status.sentry.io

---

## ✅ Checklist Finale

Avant de déployer en production, vérifiez:

- [ ] Compte Sentry créé
- [ ] Projet Next.js créé dans Sentry
- [ ] `NEXT_PUBLIC_SENTRY_DSN` ajouté à `.env`
- [ ] (Optionnel) `SENTRY_AUTH_TOKEN` configuré pour sourcemaps
- [ ] Test effectué avec `/test-sentry`
- [ ] Alertes email configurées
- [ ] Build test réussi: `npm run build`

**Vous êtes prêt! 🚀**
