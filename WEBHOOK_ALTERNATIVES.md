# 🔐 Alternatives de Sécurité Webhook (Sans HMAC)

## Si NanoBanana ne veut pas implémenter HMAC

Pas de panique! Voici 4 alternatives de sécurité, classées de la plus sécurisée à la moins sécurisée.

---

## ✅ Solution 1: Token dans l'URL (RECOMMANDÉ)

### Principe
Ajouter un token secret dans l'URL du webhook que seul NanoBanana connaît.

### Avantages
- ✅ Simple à implémenter des deux côtés
- ✅ Aucun code côté NanoBanana (juste configurer l'URL)
- ✅ Relativement sécurisé

### Inconvénients
- ⚠️ Le token apparaît dans les logs serveur
- ⚠️ Moins sécurisé que HMAC (pas de vérification du payload)

### Implémentation

**1. Générer un token:**
```bash
openssl rand -hex 32
# Exemple: b7e8f3a9c2d1456789abcdef0123456789abcdef0123456789abcdef01234567
```

**2. Donner l'URL à NanoBanana:**
```
https://renzo-immo.com/api/nanobanana-webhook?token=b7e8f3a9c2d1456789abcdef0123456789abcdef0123456789abcdef01234567
```

**3. Modifier le webhook pour vérifier le token:**

```typescript
// app/api/nanobanana-webhook/route.ts

export async function POST(request: NextRequest) {
  try {
    // 🔒 SÉCURITÉ: Vérifier le token dans l'URL
    const token = request.nextUrl.searchParams.get('token');
    const expectedToken = process.env.NANOBANANA_WEBHOOK_TOKEN;

    if (!expectedToken) {
      logger.error('[NanoBanana Webhook] NANOBANANA_WEBHOOK_TOKEN not configured');
      return NextResponse.json(
        { error: 'Server misconfiguration' },
        { status: 500 }
      );
    }

    if (token !== expectedToken) {
      logger.error('[NanoBanana Webhook] Invalid token', {
        hasToken: !!token,
        tokenMatch: token === expectedToken
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Reste du code...
    const payload = await request.json();

    // Validation Zod
    const validationResult = nanoBananaWebhookSchema.safeParse(payload);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // ... traitement normal
  } catch (error) {
    // ...
  }
}
```

**4. Configuration `.env`:**
```bash
NANOBANANA_WEBHOOK_TOKEN=b7e8f3a9c2d1456789abcdef0123456789abcdef0123456789abcdef01234567
```

---

## ✅ Solution 2: IP Whitelisting

### Principe
N'accepter les webhooks que depuis les adresses IP de NanoBanana.

### Avantages
- ✅ Très sécurisé si les IPs sont fixes
- ✅ Aucun code côté NanoBanana
- ✅ Transparent pour l'utilisateur

### Inconvénients
- ⚠️ Nécessite que NanoBanana ait des IPs fixes
- ⚠️ Maintenance si les IPs changent
- ⚠️ Ne fonctionne pas si NanoBanana utilise un CDN/proxy

### Implémentation

**1. Demander les IPs à NanoBanana:**
```
Email à NanoBanana:
"Quelles sont vos IPs sortantes pour les webhooks?
Nous avons besoin de whitelister vos serveurs."

Réponse attendue:
"Nos webhooks viennent de: 1.2.3.4 et 5.6.7.8"
```

**2. Modifier le webhook:**

```typescript
// app/api/nanobanana-webhook/route.ts

export async function POST(request: NextRequest) {
  try {
    // 🔒 SÉCURITÉ: Vérifier l'IP source
    const allowedIPs = process.env.NANOBANANA_ALLOWED_IPS?.split(',') || [];

    // Récupérer l'IP du client (gérer les proxies)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const clientIP = forwardedFor?.split(',')[0].trim() || realIP;

    if (!clientIP) {
      logger.error('[NanoBanana Webhook] Cannot determine client IP');
      return NextResponse.json(
        { error: 'Cannot determine client IP' },
        { status: 400 }
      );
    }

    if (!allowedIPs.includes(clientIP)) {
      logger.error('[NanoBanana Webhook] IP not whitelisted', {
        clientIP,
        allowedIPs
      });
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    logger.info('[NanoBanana Webhook] IP verified', { clientIP });

    // Reste du code...
  } catch (error) {
    // ...
  }
}
```

**3. Configuration `.env`:**
```bash
# Séparer les IPs par des virgules
NANOBANANA_ALLOWED_IPS=1.2.3.4,5.6.7.8,10.20.30.40
```

---

## ✅ Solution 3: Token dans un Header Custom

### Principe
NanoBanana envoie un token dans un header HTTP custom.

### Avantages
- ✅ Plus propre que dans l'URL
- ✅ N'apparaît pas dans les logs URL
- ✅ Standard pour les APIs

### Inconvénients
- ⚠️ Nécessite un petit changement côté NanoBanana
- ⚠️ Moins sécurisé que HMAC

### Implémentation

**1. Demander à NanoBanana:**
```
Email:
"Pouvez-vous ajouter un header custom à vos webhooks?
Header: X-NanoBanana-Token
Valeur: [le token que vous leur donnez]"
```

**2. Générer un token:**
```bash
openssl rand -hex 32
```

**3. Modifier le webhook:**

```typescript
// app/api/nanobanana-webhook/route.ts

export async function POST(request: NextRequest) {
  try {
    // 🔒 SÉCURITÉ: Vérifier le token dans le header
    const token = request.headers.get('x-nanobanana-token');
    const expectedToken = process.env.NANOBANANA_WEBHOOK_TOKEN;

    if (!expectedToken) {
      logger.error('[NanoBanana Webhook] NANOBANANA_WEBHOOK_TOKEN not configured');
      return NextResponse.json(
        { error: 'Server misconfiguration' },
        { status: 500 }
      );
    }

    if (token !== expectedToken) {
      logger.error('[NanoBanana Webhook] Invalid token', {
        hasToken: !!token,
        headerPresent: !!token
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Reste du code...
  } catch (error) {
    // ...
  }
}
```

**4. Configuration `.env`:**
```bash
NANOBANANA_WEBHOOK_TOKEN=votre_token_ici
```

---

## ✅ Solution 4: Basic Authentication

### Principe
Utiliser l'authentification HTTP Basic standard.

### Avantages
- ✅ Standard HTTP
- ✅ Supporté nativement par la plupart des plateformes
- ✅ Simple

### Inconvénients
- ⚠️ Nécessite configuration côté NanoBanana
- ⚠️ Credentials en base64 (facilement décodable)

### Implémentation

**1. Générer username et password:**
```bash
# Username
echo "nanobanana-webhook"

# Password
openssl rand -hex 16
# Exemple: a1b2c3d4e5f6789012345678
```

**2. Donner à NanoBanana:**
```
URL: https://nanobanana-webhook:a1b2c3d4e5f6789012345678@renzo-immo.com/api/nanobanana-webhook

Ou séparément:
URL: https://renzo-immo.com/api/nanobanana-webhook
Username: nanobanana-webhook
Password: a1b2c3d4e5f6789012345678
```

**3. Modifier le webhook:**

```typescript
// app/api/nanobanana-webhook/route.ts

export async function POST(request: NextRequest) {
  try {
    // 🔒 SÉCURITÉ: Vérifier Basic Auth
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      logger.error('[NanoBanana Webhook] Missing or invalid Authorization header');
      return NextResponse.json(
        { error: 'Unauthorized' },
        {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="NanoBanana Webhook"'
          }
        }
      );
    }

    // Décoder les credentials
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    // Vérifier
    const expectedUsername = process.env.NANOBANANA_WEBHOOK_USERNAME;
    const expectedPassword = process.env.NANOBANANA_WEBHOOK_PASSWORD;

    if (username !== expectedUsername || password !== expectedPassword) {
      logger.error('[NanoBanana Webhook] Invalid credentials');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Reste du code...
  } catch (error) {
    // ...
  }
}
```

**4. Configuration `.env`:**
```bash
NANOBANANA_WEBHOOK_USERNAME=nanobanana-webhook
NANOBANANA_WEBHOOK_PASSWORD=a1b2c3d4e5f6789012345678
```

---

## 🎯 Quelle solution choisir?

| Solution | Effort NanoBanana | Sécurité | Recommandation |
|----------|-------------------|----------|----------------|
| Token dans URL | ⭐ Aucun | 🟡 Moyenne | ✅ **MEILLEUR CHOIX** |
| IP Whitelisting | ⭐ Aucun | 🟢 Haute | ✅ Si IPs fixes |
| Token dans Header | ⭐⭐ Minimal | 🟡 Moyenne | ✅ Alternative propre |
| Basic Auth | ⭐⭐ Minimal | 🟡 Moyenne | ⚠️ Moins recommandé |

### Ma recommandation:

**1ère option:** Token dans URL (le plus simple pour NanoBanana)

**2ème option:** IP Whitelisting (si NanoBanana a des IPs fixes)

**3ème option:** Token dans Header (si NanoBanana accepte un petit changement)

---

## 🔧 Code à utiliser - Token dans URL (Recommandé)

Remplacer le contenu de `/app/api/nanobanana-webhook/route.ts`:

```typescript
/**
 * Webhook NanoBanana
 * Reçoit les notifications quand une image est générée
 *
 * 🔒 SÉCURITÉ: Token dans URL (alternative à HMAC)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { nanoBananaWebhookSchema } from '@/lib/validators/webhook-validators';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    // 🔒 SÉCURITÉ: Vérifier le token dans l'URL
    const token = request.nextUrl.searchParams.get('token');
    const expectedToken = process.env.NANOBANANA_WEBHOOK_TOKEN;

    if (!expectedToken) {
      logger.error('[NanoBanana Webhook] NANOBANANA_WEBHOOK_TOKEN not configured');
      return NextResponse.json(
        { error: 'Server misconfiguration' },
        { status: 500 }
      );
    }

    if (!token || token !== expectedToken) {
      logger.error('[NanoBanana Webhook] Invalid or missing token', {
        hasToken: !!token,
        tokenLength: token?.length
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.debug('[NanoBanana Webhook] Token verified');

    // Parser le payload
    const payload = await request.json();

    logger.debug('[NanoBanana Webhook] Received:', JSON.stringify(payload, null, 2));

    // 🔒 Validation Zod du payload
    const validationResult = nanoBananaWebhookSchema.safeParse(payload);

    if (!validationResult.success) {
      logger.error('[NanoBanana Webhook] Invalid payload', {
        errors: validationResult.error.errors
      });
      return NextResponse.json(
        {
          error: 'Invalid payload',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { requestId, status, outputUrls, error } = validationResult.data;

    // Trouver l'image dans notre DB
    const { data: images, error: fetchError } = await supabaseAdmin
      .from('images')
      .select('*')
      .eq('nano_request_id', requestId)
      .limit(1);

    if (fetchError || !images || images.length === 0) {
      logger.error('[NanoBanana Webhook] Image not found for requestId:', requestId);
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    const image = images[0];

    // Mettre à jour le statut
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (status === 'completed' && outputUrls && outputUrls.length > 0) {
      updateData.status = 'completed';
      updateData.transformed_url = outputUrls[0];
      updateData.processing_completed_at = new Date().toISOString();
    } else if (status === 'failed' || error) {
      updateData.status = 'failed';
      updateData.error_message = error || 'Generation failed';
    } else if (status === 'processing') {
      updateData.status = 'processing';
    }

    const { error: updateError } = await supabaseAdmin
      .from('images')
      .update(updateData)
      .eq('id', image.id);

    if (updateError) {
      logger.error('[NanoBanana Webhook] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update image' },
        { status: 500 }
      );
    }

    logger.info('[NanoBanana Webhook] Image updated successfully:', {
      imageId: image.id,
      status: updateData.status,
      requestId,
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    logger.error('[NanoBanana Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 📋 Configuration rapide - Token dans URL

**1. Générer le token:**
```bash
openssl rand -hex 32
```

**2. Ajouter à `.env`:**
```bash
NANOBANANA_WEBHOOK_TOKEN=votre_token_généré_ici
```

**3. Donner l'URL à NanoBanana:**
```
https://renzo-immo.com/api/nanobanana-webhook?token=votre_token_généré_ici
```

**4. Tester:**
```bash
# Sans token - doit échouer
curl -X POST "http://localhost:3000/api/nanobanana-webhook" \
  -H "Content-Type: application/json" \
  -d '{"requestId":"test","status":"completed"}'
# Attendu: 401

# Avec mauvais token - doit échouer
curl -X POST "http://localhost:3000/api/nanobanana-webhook?token=wrong" \
  -H "Content-Type: application/json" \
  -d '{"requestId":"test","status":"completed"}'
# Attendu: 401

# Avec bon token - doit réussir
curl -X POST "http://localhost:3000/api/nanobanana-webhook?token=votre_token_généré_ici" \
  -H "Content-Type: application/json" \
  -d '{"requestId":"test","status":"completed"}'
# Attendu: 404 (image non trouvée, mais token valide)
```

✅ C'est prêt!

---

## 📝 Template Email pour NanoBanana (Version Simple)

```
Objet: Configuration Webhook - Version Simplifiée

Bonjour,

Nous avons simplifié la configuration du webhook:

URL complète (avec token):
https://renzo-immo.com/api/nanobanana-webhook?token=VOTRE_TOKEN_ICI

Format du payload (JSON):
{
  "requestId": "uuid-v4",
  "status": "processing" | "completed" | "failed",
  "outputUrls": ["https://..."],
  "error": "message"
}

Aucune signature HMAC n'est nécessaire, le token dans l'URL suffit.

Merci,
[Votre nom]
```

---

**Temps de mise en place:** 5 minutes
**Niveau de sécurité:** Moyen (suffisant pour la plupart des cas)
**Effort NanoBanana:** Aucun (juste copier l'URL)

C'est la solution la plus simple! 🎯
