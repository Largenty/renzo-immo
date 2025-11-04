# 🔷 Guide d'installation Stripe

Ce guide vous explique comment configurer Stripe pour l'application Renzo.

## ✅ Prérequis

- Compte Stripe créé (https://dashboard.stripe.com/register)
- Node.js 18+ installé
- Accès au Supabase Dashboard

---

## 📝 Étape 1: Récupérer vos clés API Stripe

### Mode TEST (Développement)

1. Allez sur https://dashboard.stripe.com/test/apikeys
2. Copiez les deux clés :
   - **Publishable key** (commence par `pk_test_...`)
   - **Secret key** (commence par `sk_test_...`)

### Mode LIVE (Production)

⚠️ **Attendez que tout fonctionne en TEST avant de passer en LIVE !**

1. Allez sur https://dashboard.stripe.com/apikeys
2. Copiez les deux clés :
   - **Publishable key** (commence par `pk_live_...`)
   - **Secret key** (commence par `sk_live_...`)

---

## 🔧 Étape 2: Configurer les variables d'environnement

Vos clés sont déjà dans `.env`, mais vérifie qu'elles sont à jour :

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Ta clé publique
STRIPE_SECRET_KEY=sk_test_...                   # Ta clé secrète
STRIPE_WEBHOOK_SECRET=whsec_...                 # On va l'obtenir à l'étape 4
```

---

## 🗄️ Étape 3: Appliquer les migrations de base de données

### Option A: Via Supabase Dashboard (Recommandé)

1. Va sur https://app.supabase.com
2. Sélectionne ton projet
3. Va dans **SQL Editor**
4. Copie le contenu de `supabase/migrations/20251103_create_credits_system.sql`
5. Colle dans l'éditeur et clique sur **Run**

### Option B: Via Supabase CLI (si configuré)

```bash
npx supabase db push
```

---

## 🎯 Étape 4: Créer les produits Stripe

Lance le script automatique qui va créer les 4 packs de crédits dans Stripe :

```bash
npx tsx scripts/setup-stripe-products.ts
```

Ce script va :
- ✅ Créer 4 produits dans Stripe (Starter, Standard, Premium, Enterprise)
- ✅ Créer les prix associés
- ✅ Enregistrer tout dans ta base de données Supabase

Vérifie que tout est créé : https://dashboard.stripe.com/test/products

---

## 🔔 Étape 5: Configurer les Webhooks

Les webhooks permettent à Stripe de notifier ton application quand un paiement est effectué.

### Option A: Développement local avec Stripe CLI (Recommandé)

#### 1. Installer Stripe CLI

**Linux/WSL:**
```bash
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe
```

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

#### 2. Se connecter à Stripe

```bash
stripe login
```

Suis les instructions pour autoriser la CLI.

#### 3. Obtenir le webhook secret

Lance cette commande et **LAISSE-LA TOURNER** pendant que tu développes :

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Tu verras une ligne comme celle-ci :

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
```

#### 4. Copier le webhook secret

Copie le secret qui commence par `whsec_` et mets-le dans ton `.env` :

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

#### 5. Redémarrer ton serveur

```bash
# Arrête le serveur (Ctrl+C) et relance :
npm run dev
```

⚠️ **Important:** Garde le terminal avec `stripe listen` ouvert pendant le développement !

---

### Option B: Production avec webhook URL publique

Pour la production, tu auras besoin d'une URL publique.

#### 1. Configurer le webhook

1. Va sur https://dashboard.stripe.com/test/webhooks
2. Clique sur **Add endpoint**
3. Entre l'URL : `https://ton-domaine.com/api/stripe/webhook`
4. Sélectionne les événements :
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Clique sur **Add endpoint**

#### 2. Récupérer le signing secret

1. Clique sur le webhook que tu viens de créer
2. Dans la section **Signing secret**, clique sur **Reveal**
3. Copie le secret (commence par `whsec_`)
4. Ajoute-le dans ton `.env` :

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

---

## 🧪 Étape 6: Tester le paiement

### 1. Lance l'application

```bash
npm run dev
```

### 2. Va sur la page crédits

```
http://localhost:3000/dashboard/credits
```

### 3. Choisis un pack et clique sur "Acheter"

Tu seras redirigé vers la page de paiement Stripe.

### 4. Utilise une carte de test

**Paiement réussi:**
```
Numéro: 4242 4242 4242 4242
Date: 12/34 (n'importe quelle date future)
CVC: 123 (n'importe quel 3 chiffres)
```

**Paiement refusé:**
```
Numéro: 4000 0000 0000 9995
```

**Authentification 3D Secure:**
```
Numéro: 4000 0025 0000 3155
```

### 5. Vérifier que ça fonctionne

Après avoir payé avec succès :
- ✅ Tu es redirigé vers `/dashboard/credits/success`
- ✅ Tes crédits sont ajoutés à ton compte
- ✅ Tu vois le nouveau solde

---

## 🔍 Déboguer les problèmes

### Le webhook ne reçoit rien

**Vérifier que Stripe CLI écoute:**
```bash
# Dans un terminal séparé :
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Vérifier les logs du webhook:**
```bash
# Dans le terminal où tourne stripe listen, tu verras :
✔ webhook received: checkout.session.completed
```

### Les crédits ne s'ajoutent pas

**1. Vérifier que le webhook est traité:**

Va dans Supabase Dashboard > Table Editor > `stripe_events` et vérifie que l'événement est marqué `processed = true`.

**2. Vérifier les logs de l'application:**

Regarde les logs dans ton terminal où tourne `npm run dev`.

**3. Vérifier les crédits en base:**

```sql
-- Dans Supabase SQL Editor :
SELECT * FROM users WHERE id = 'ton-user-id';
SELECT * FROM credit_transactions WHERE user_id = 'ton-user-id' ORDER BY created_at DESC;
```

### Le paiement échoue immédiatement

**Vérifier que STRIPE_SECRET_KEY est défini:**
```bash
echo $STRIPE_SECRET_KEY
```

**Vérifier les logs Stripe:**

Va sur https://dashboard.stripe.com/test/logs et cherche les erreurs.

---

## 📊 Monitorer les paiements

### Dashboard Stripe

- **Paiements:** https://dashboard.stripe.com/test/payments
- **Clients:** https://dashboard.stripe.com/test/customers
- **Produits:** https://dashboard.stripe.com/test/products
- **Webhooks:** https://dashboard.stripe.com/test/webhooks
- **Logs:** https://dashboard.stripe.com/test/logs

### Dans Supabase

```sql
-- Voir tous les achats de crédits
SELECT
  u.email,
  ct.amount,
  ct.description,
  ct.created_at
FROM credit_transactions ct
JOIN users u ON u.id = ct.user_id
WHERE ct.transaction_type = 'purchase'
ORDER BY ct.created_at DESC;

-- Voir le solde de tous les utilisateurs
SELECT
  email,
  credits,
  created_at
FROM users
WHERE credits > 0
ORDER BY credits DESC;
```

---

## 🚀 Passer en production

Quand tu es prêt à accepter de vrais paiements :

### 1. Activer le compte Stripe

1. Va sur https://dashboard.stripe.com/account/onboarding
2. Remplis toutes les informations requises (SIRET, RIB, etc.)
3. Attends la validation de Stripe

### 2. Changer les clés dans l'environnement de production

Remplace les clés **test** par les clés **live** :

```bash
# Production .env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... # Nouveau secret pour production
```

### 3. Créer les produits en production

Relance le script avec les clés live :

```bash
npx tsx scripts/setup-stripe-products.ts
```

### 4. Configurer le webhook de production

Va sur https://dashboard.stripe.com/webhooks (sans /test) et configure un nouveau webhook avec ton URL de production.

---

## 📚 Ressources

- **Documentation Stripe:** https://stripe.com/docs
- **Stripe CLI:** https://stripe.com/docs/stripe-cli
- **Cartes de test:** https://stripe.com/docs/testing
- **Webhooks:** https://stripe.com/docs/webhooks
- **Support Stripe:** https://support.stripe.com

---

## ✅ Checklist finale

Avant de considérer l'intégration terminée :

- [ ] Clés API Stripe configurées dans `.env`
- [ ] Migrations de base de données appliquées
- [ ] Produits Stripe créés (4 packs)
- [ ] Webhook configuré (Stripe CLI ou URL publique)
- [ ] Paiement test réussi avec carte 4242...
- [ ] Crédits ajoutés après paiement
- [ ] Page de succès affiche le nouveau solde
- [ ] Webhooks marqués comme `processed` dans la DB

---

**🎉 Félicitations ! Ton intégration Stripe est complète !**
