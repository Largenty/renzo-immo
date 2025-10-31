# 🛡️ Recommandations de Sécurité

**Date:** 2025-10-30
**Score actuel:** 7.5/10
**Objectif:** 9/10

---

## ✅ Ce qui est déjà bien sécurisé

- Authentication Supabase (JWT + RLS)
- Admin authorization sur routes critiques
- Rate limiting (60 req/min)
- Email verification
- Zod validation partout
- Ownership checks
- SQL injection impossible (PostgREST)
- Secrets dans .env (non committé)

---

## 🚀 Améliorations recommandées (par priorité)

### 1. **[PROD] Ajouter un WAF** - Priorité HAUTE 🔴

**Pourquoi:**
- Protection DDoS
- Blocage des IPs malveillantes
- Protection contre les scanners automatiques

**Solution:**
```bash
# Option 1: Cloudflare (gratuit)
1. Pointer ton domaine vers Cloudflare
2. Activer "Under Attack Mode" si nécessaire
3. Configurer les rate limits additionnels

# Option 2: Vercel WAF (si hébergé sur Vercel)
1. Activer dans settings > Security
2. Configurer les règles custom
```

**Coût:** Gratuit (Cloudflare) ou inclus (Vercel Pro)
**Temps:** 30 minutes
**Impact sécurité:** +1 point

---

### 2. **[PROD] Utiliser un Vault pour les secrets** - Priorité HAUTE 🔴

**Pourquoi:**
- Si le serveur est compromis, `.env` est lisible
- Service Role Key bypass RLS → accès total DB

**Solution:**

#### Option A: AWS Secrets Manager
```bash
# 1. Créer le secret
aws secretsmanager create-secret \
  --name renzo-immo/prod/supabase \
  --secret-string '{"service_role_key":"xxx","nanobanana_key":"yyy"}'

# 2. Modifier le code pour fetch au runtime
# /src/lib/secrets.ts
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager"

const client = new SecretsManagerClient({ region: "eu-west-1" })

export async function getSecret(secretName: string) {
  const command = new GetSecretValueCommand({ SecretId: secretName })
  const response = await client.send(command)
  return JSON.parse(response.SecretString!)
}
```

#### Option B: Vercel Environment Variables
```bash
# 1. Dans Vercel Dashboard > Settings > Environment Variables
# 2. Marquer comme "Encrypted" et "Production only"
# 3. Ne jamais les exposer côté client
```

**Coût:** $0.40/mois pour 1 secret (AWS) ou gratuit (Vercel)
**Temps:** 1 heure
**Impact sécurité:** +0.5 point

---

### 3. **Ajouter un audit log des actions admin** - Priorité MOYENNE 🟡

**Pourquoi:**
- Tracer qui a fait quoi et quand
- Détecter les comptes admin compromis
- Conformité RGPD (si applicable)

**Solution:**

```sql
-- Migration: create_admin_audit_log.sql
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL, -- 'create_furniture', 'delete_room', etc.
  resource_type VARCHAR(50) NOT NULL, -- 'furniture', 'room', etc.
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_admin_audit_admin ON admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_created ON admin_audit_log(created_at DESC);

-- RLS: Admins peuvent lire leur propre log
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY policy_admin_audit_read
  ON admin_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

```typescript
// /src/lib/audit/log-admin-action.ts
import { createClient } from '@/lib/supabase/server'

export async function logAdminAction({
  adminId,
  action,
  resourceType,
  resourceId,
  metadata,
  request,
}: {
  adminId: string
  action: string
  resourceType: string
  resourceId?: string
  metadata?: Record<string, any>
  request: Request
}) {
  const supabase = await createClient()

  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown'
  const userAgent = request.headers.get('user-agent')

  await supabase.from('admin_audit_log').insert({
    admin_id: adminId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    metadata,
    ip_address: ip,
    user_agent: userAgent,
  })
}
```

```typescript
// Utilisation dans /app/api/furniture/route.ts
import { logAdminAction } from '@/lib/audit/log-admin-action'

export async function POST(request: NextRequest) {
  // ... après avoir créé le furniture

  await logAdminAction({
    adminId: user.id,
    action: 'create_furniture',
    resourceType: 'furniture',
    resourceId: furniture.id,
    metadata: {
      category: furniture.category,
      name: furniture.name_fr
    },
    request,
  })
}
```

**Coût:** Gratuit
**Temps:** 2 heures
**Impact sécurité:** +0.5 point

---

### 4. **Ajouter 2FA (Two-Factor Authentication)** - Priorité MOYENNE 🟡

**Pourquoi:**
- Protection contre phishing
- Protection contre vol de password
- Crucial pour les comptes admin

**Solution:**

Supabase supporte nativement 2FA avec TOTP :

```typescript
// Activer 2FA pour un user
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp',
  friendlyName: 'Renzo Immo Admin',
})

// Le user scanne le QR code avec Google Authenticator
console.log(data.totp.qr_code)

// Vérifier le code 2FA
const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
  factorId: data.id,
  challengeId: challenge.id,
  code: '123456', // Code de l'app
})
```

**Interface UI:**
```tsx
// /app/dashboard/settings/security/page.tsx
export default function SecuritySettings() {
  const [totpQR, setTotpQR] = useState<string | null>(null)

  const enableTOTP = async () => {
    const { data } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
    })
    setTotpQR(data.totp.qr_code)
  }

  return (
    <div>
      <Button onClick={enableTOTP}>
        Activer l'authentification à deux facteurs
      </Button>
      {totpQR && (
        <div>
          <QRCode value={totpQR} />
          <p>Scannez ce QR code avec Google Authenticator</p>
        </div>
      )}
    </div>
  )
}
```

**Coût:** Gratuit (inclus dans Supabase)
**Temps:** 3 heures
**Impact sécurité:** +0.5 point

---

### 5. **Ajouter Content Security Policy (CSP)** - Priorité BASSE 🟢

**Pourquoi:**
- Protection XSS additionnelle
- Empêche le chargement de scripts malveillants

**Solution:**

```typescript
// /middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js needs these
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://api.nanobananaapi.ai",
      "frame-ancestors 'none'",
    ].join('; ')
  )

  // Autres headers de sécurité
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
}
```

**Coût:** Gratuit
**Temps:** 1 heure
**Impact sécurité:** +0.3 point

---

### 6. **Implémenter rate limiting progressif** - Priorité BASSE 🟢

**Pourquoi:**
- Actuellement: rate limit fixe (60 req/min)
- Mieux: augmenter progressivement si détection d'abus

**Solution:**

```typescript
// /src/lib/rate-limit.ts (ajout)
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

// Rate limit progressif
export async function checkProgressiveRateLimit(
  userId: string,
  action: string
): Promise<{ success: boolean; penalty?: number }> {
  const key = `suspicious:${userId}:${action}`

  // Compter les échecs récents
  const failures = await redis.get<number>(key) || 0

  // Calculer le rate limit basé sur les échecs
  let limit = 60 // Normal
  if (failures > 5) limit = 30  // Suspicious
  if (failures > 10) limit = 10 // Very suspicious
  if (failures > 20) limit = 1  // Blocked

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, '1 m'),
  })

  const { success } = await limiter.limit(userId)

  // Si échec, incrémenter le compteur
  if (!success) {
    await redis.incr(key)
    await redis.expire(key, 3600) // Reset après 1h
  }

  return { success, penalty: failures }
}
```

**Coût:** Gratuit
**Temps:** 1 heure
**Impact sécurité:** +0.2 point

---

### 7. **Monitoring et alertes** - Priorité BASSE 🟢

**Pourquoi:**
- Détecter les tentatives d'attaque en temps réel
- Réagir rapidement aux incidents

**Solution:**

Tu as déjà Sentry configuré ! Ajoute des alertes custom :

```typescript
// /src/lib/monitoring/alerts.ts
import * as Sentry from '@sentry/nextjs'

export function alertSuspiciousActivity(
  userId: string,
  activity: string,
  details: Record<string, any>
) {
  Sentry.captureMessage(`Suspicious activity detected`, {
    level: 'warning',
    tags: {
      type: 'security',
      activity,
    },
    user: { id: userId },
    extra: details,
  })
}

// Utilisation
if (failures > 10) {
  alertSuspiciousActivity(userId, 'rate_limit_abuse', {
    failures,
    endpoint: '/api/generate-image',
  })
}
```

**Intégration Slack/Email:**
```bash
# Dans Sentry Dashboard
# Alerts > Create Alert Rule
# - Condition: "Message contains 'Suspicious activity'"
# - Action: Send to Slack channel #security
```

**Coût:** Gratuit (Sentry free tier)
**Temps:** 30 minutes
**Impact sécurité:** +0.2 point

---

## 📊 Roadmap de sécurité

### Phase 1: Pré-production (2-3 jours) 🔴
- [ ] Ajouter WAF (Cloudflare)
- [ ] Migrer secrets vers Vault/Vercel
- [ ] Ajouter CSP headers
- [ ] Tester tous les endpoints avec OWASP ZAP

### Phase 2: Post-lancement (1 semaine) 🟡
- [ ] Implémenter audit log admin
- [ ] Ajouter 2FA pour admins
- [ ] Configurer alertes Sentry
- [ ] Rate limiting progressif

### Phase 3: Amélioration continue (mensuel) 🟢
- [ ] Audit de sécurité mensuel
- [ ] Review des logs d'audit
- [ ] Mise à jour des dépendances
- [ ] Penetration testing (annuel)

---

## 🎯 Score projeté après implémentation

| Amélioration | Impact | Score cumulé |
|--------------|--------|--------------|
| État actuel | - | 7.5/10 |
| + WAF | +1.0 | 8.5/10 |
| + Vault secrets | +0.5 | 9.0/10 |
| + Audit log | +0.5 | 9.5/10 |
| + 2FA | +0.5 | 10.0/10 |

---

## 🛡️ Checklist de sécurité avant production

- [ ] WAF configuré (Cloudflare/Vercel)
- [ ] Secrets dans vault (pas de .env en prod)
- [ ] HTTPS uniquement (HTTP redirect)
- [ ] CSP headers configurés
- [ ] Rate limiting testé
- [ ] RLS policies vérifiées
- [ ] Admin checks sur toutes les routes CRUD
- [ ] Logs d'audit activés
- [ ] Monitoring/alertes configurés
- [ ] Backup DB automatique (Supabase)
- [ ] Plan de réponse aux incidents
- [ ] Contact sécurité public (security@renzo-immo.com)

---

## 📚 Ressources

- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **Supabase Security:** https://supabase.com/docs/guides/auth/managing-user-data
- **Next.js Security:** https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
- **Cloudflare WAF:** https://www.cloudflare.com/waf/

---

**Dernière mise à jour:** 2025-10-30
