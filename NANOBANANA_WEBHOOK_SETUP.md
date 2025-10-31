# 🔐 Configuration du Webhook NanoBanana

## Le Webhook Secret - Explications

### Comment ça fonctionne?

Le webhook secret est une **clé partagée** entre vous et NanoBanana pour signer/vérifier les webhooks:

```
┌─────────────┐                    ┌─────────────┐
│  NanoBanana │                    │  Votre App  │
│             │                    │             │
│ 1. Génère   │                    │ 3. Vérifie  │
│    webhook  │                    │    avec le  │
│             │                    │    même     │
│ 2. Signe    │  ──── POST ───>   │    secret   │
│    avec     │  + signature       │             │
│    secret   │                    │             │
└─────────────┘                    └─────────────┘
```

### Qui génère le secret?

**VOUS** générez le secret et le communiquez à NanoBanana.

---

## 🎯 Marche à suivre

### Étape 1: Générer un secret sécurisé

Choisissez une méthode:

**Option A: OpenSSL (Recommandé)**
```bash
openssl rand -hex 32
# Exemple de résultat:
# a3f8d9e2c1b4567890abcdef1234567890abcdef1234567890abcdef12345678
```

**Option B: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option C: Python**
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**Option D: Site web**
- Aller sur https://www.random.org/strings/
- Générer une chaîne de 64 caractères hexadécimaux

⚠️ **Important:** Le secret doit être:
- Au moins 32 caractères
- Aléatoire et imprévisible
- Gardé confidentiel (comme un mot de passe)

---

### Étape 2: Configurer dans votre application

Ajouter à `.env`:

```bash
# Webhook NanoBanana Security
NANOBANANA_WEBHOOK_SECRET=a3f8d9e2c1b4567890abcdef1234567890abcdef1234567890abcdef12345678
```

⚠️ **Important:** Ajouter aussi à `.env.example` (sans la vraie valeur):

```bash
# Webhook Security
NANOBANANA_WEBHOOK_SECRET=your_webhook_secret_here
```

🔒 **Sécurité:** Ne JAMAIS commit le vrai secret dans Git!

---

### Étape 3: Communiquer le secret à NanoBanana

Vous devez envoyer 2 informations à NanoBanana:

#### 1. L'URL du webhook

```
https://votre-domaine.com/api/nanobanana-webhook
```

En développement:
```
https://votre-tunnel-ngrok.ngrok.io/api/nanobanana-webhook
```

#### 2. Le secret partagé

```
Secret: a3f8d9e2c1b4567890abcdef1234567890abcdef1234567890abcdef12345678
```

#### Comment leur envoyer?

**Option A: Email sécurisé (Recommandé)**

```
À: support@nanobanana.com
Objet: Configuration Webhook - [Votre Projet]

Bonjour,

Voici les informations pour configurer le webhook:

URL: https://renzo-immo.com/api/nanobanana-webhook
Secret: a3f8d9e2c1b4567890abcdef1234567890abcdef12345678

Le secret doit être utilisé pour signer les webhooks avec HMAC-SHA256.
Le header attendu est: x-nanobanana-signature

Format de signature: sha256=<hmac_hex>

Merci,
[Votre nom]
```

**Option B: Via leur dashboard**

Si NanoBanana a un dashboard/portail client:
1. Se connecter au portail NanoBanana
2. Aller dans "Webhooks" ou "Intégrations"
3. Configurer:
   - Webhook URL: `https://votre-domaine.com/api/nanobanana-webhook`
   - Secret: `votre_secret_généré`
   - Algorithme: `HMAC-SHA256`
   - Header: `x-nanobanana-signature`

**Option C: Slack/Discord sécurisé**

Si vous avez un canal privé avec eux.

---

### Étape 4: Tester le webhook

#### Test 1: Sans signature (doit échouer)

```bash
curl -X POST http://localhost:3000/api/nanobanana-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "test-uuid",
    "status": "completed",
    "outputUrls": ["https://example.com/test.jpg"]
  }'

# Attendu: 401 Unauthorized
# {"error":"Invalid signature"}
```

#### Test 2: Avec signature valide (doit réussir)

```bash
# 1. Générer la signature
SECRET="votre_secret"
PAYLOAD='{"requestId":"test-uuid","status":"completed","outputUrls":["https://example.com/test.jpg"]}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

# 2. Envoyer la requête
curl -X POST http://localhost:3000/api/nanobanana-webhook \
  -H "Content-Type: application/json" \
  -H "x-nanobanana-signature: sha256=$SIGNATURE" \
  -d "$PAYLOAD"

# Attendu: 404 (image non trouvée, mais signature valide)
# {"error":"Image not found"}
```

---

## 📋 Template Email pour NanoBanana

```
Objet: Configuration Webhook Renzo Immo - Génération d'images

Bonjour l'équipe NanoBanana,

Nous mettons en place l'intégration webhook pour recevoir les notifications
de génération d'images. Voici notre configuration:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 CONFIGURATION WEBHOOK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Production:
  URL: https://renzo-immo.com/api/nanobanana-webhook

Développement (optionnel):
  URL: https://dev.renzo-immo.com/api/nanobanana-webhook

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 SÉCURITÉ HMAC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Secret: a3f8d9e2c1b4567890abcdef1234567890abcdef1234567890abcdef12345678

Algorithme: HMAC-SHA256
Header attendu: x-nanobanana-signature
Format: sha256=<signature_hex>

Exemple de calcul de signature:
```
signature = HMAC_SHA256(webhook_secret, request_body)
header_value = "sha256=" + hex(signature)
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 FORMAT PAYLOAD ATTENDU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "requestId": "uuid-v4",
  "status": "processing" | "completed" | "failed",
  "outputUrls": ["https://..."],  // Si status=completed
  "error": "message d'erreur"      // Si status=failed
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 CODES RETOUR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

200: Webhook traité avec succès
400: Payload invalide
401: Signature invalide
404: Image non trouvée (requestId inconnu)
500: Erreur serveur

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Merci de confirmer la configuration et nous notifier une fois les webhooks activés.

Cordialement,
[Votre nom]
[Votre projet: Renzo Immo]
```

---

## 🔧 Troubleshooting

### "Comment NanoBanana signe les webhooks?"

Ils doivent:
```javascript
// Côté NanoBanana
const crypto = require('crypto');

function signWebhook(payload, secret) {
  const payloadString = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payloadString);
  const signature = hmac.digest('hex');
  return `sha256=${signature}`;
}

// Envoyer le webhook avec le header
fetch('https://votre-domaine.com/api/nanobanana-webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-nanobanana-signature': signWebhook(payload, secret)
  },
  body: JSON.stringify(payload)
});
```

### "Que faire si NanoBanana utilise un autre algorithme?"

Si NanoBanana utilise:
- **SHA-1**: Modifier `webhook-security.ts` pour utiliser `sha1` au lieu de `sha256`
- **Autre header**: Modifier le nom du header dans `nanobanana-webhook/route.ts`
- **Autre format**: Adapter le code selon leur documentation

### "NanoBanana n'a pas de système de signature?"

Si NanoBanana ne supporte pas HMAC:

**Option 1: Désactiver temporairement** (DANGEREUX - dev uniquement)

Dans `/app/api/nanobanana-webhook/route.ts`:
```typescript
// ⚠️ DÉVELOPPEMENT UNIQUEMENT - RETIRER EN PROD
const isDev = process.env.NODE_ENV === 'development';
if (!isDev) {
  if (!verifyNanoBananaWebhook(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
}
```

**Option 2: IP Whitelisting**

Limiter les webhooks aux IPs de NanoBanana:
```typescript
const allowedIPs = ['1.2.3.4', '5.6.7.8']; // IPs de NanoBanana
const clientIP = request.headers.get('x-forwarded-for') ||
                 request.headers.get('x-real-ip');

if (!allowedIPs.includes(clientIP)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

**Option 3: Token simple**

Utiliser un token dans l'URL:
```typescript
// URL webhook: https://votre-domaine.com/api/nanobanana-webhook?token=SECRET
const token = request.nextUrl.searchParams.get('token');
if (token !== process.env.NANOBANANA_WEBHOOK_TOKEN) {
  return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
}
```

---

## 📝 Checklist

Configuration du webhook:

- [ ] Secret généré (32+ caractères aléatoires)
- [ ] Secret ajouté dans `.env`
- [ ] `.env.example` mis à jour (sans le vrai secret)
- [ ] Email envoyé à NanoBanana avec URL + Secret
- [ ] Confirmation reçue de NanoBanana
- [ ] Test du webhook réussi
- [ ] Vérifier les logs pour la première vraie génération

---

## 🔗 Ressources

- **Votre webhook:** `/app/api/nanobanana-webhook/route.ts`
- **Validation:** `/src/lib/webhook-security.ts`
- **Test local:** Utiliser ngrok: `ngrok http 3000`

---

**Temps estimé:** 10 minutes
**Contact NanoBanana:** [Leur email/Slack de support]

Une fois configuré, vos webhooks seront sécurisés! 🔒
