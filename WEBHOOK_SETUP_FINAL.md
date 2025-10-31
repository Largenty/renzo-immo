# 🚀 CONFIGURATION WEBHOOK - VERSION FINALE SIMPLIFIÉE

## Solution choisie: Token dans URL

NanoBanana ne veut pas implémenter HMAC? Pas de problème!
On utilise un token secret dans l'URL - **c'est super simple** pour eux.

---

## ⚡ SETUP RAPIDE (3 minutes)

### Étape 1: Générer le token (30 secondes)

```bash
openssl rand -hex 32
```

**Exemple de résultat:**
```
b7e8f3a9c2d1456789abcdef0123456789abcdef0123456789abcdef01234567
```

---

### Étape 2: Configurer dans .env (30 secondes)

Ajouter à votre `.env`:

```bash
NANOBANANA_WEBHOOK_TOKEN=b7e8f3a9c2d1456789abcdef0123456789abcdef0123456789abcdef01234567
```

⚠️ **IMPORTANT:** Remplacer par VOTRE token généré à l'étape 1!

---

### Étape 3: Donner l'URL à NanoBanana (1 minute)

Envoyer cet email:

```
À: support@nanobanana.com
Objet: Configuration Webhook Renzo Immo

Bonjour,

Voici l'URL du webhook à configurer:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Production:
https://renzo-immo.com/api/nanobanana-webhook?token=b7e8f3a9c2d1456789abcdef0123456789abcdef0123456789abcdef01234567

Développement (optionnel):
https://dev.renzo-immo.com/api/nanobanana-webhook?token=b7e8f3a9c2d1456789abcdef0123456789abcdef0123456789abcdef01234567
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Format du payload (JSON):
{
  "requestId": "uuid-v4-de-l-image",
  "status": "processing" | "completed" | "failed",
  "outputUrls": ["https://..."],  // Si completed
  "error": "message"              // Si failed
}

Pas besoin de signature HMAC, le token dans l'URL suffit.

Merci de confirmer la configuration.

Cordialement,
[Votre nom]
```

⚠️ **IMPORTANT:** Remplacer le token par le vôtre!

---

### Étape 4: Tester (1 minute)

Une fois configuré, tester:

```bash
# Test 1: Sans token - doit échouer avec 401
curl -X POST "http://localhost:3000/api/nanobanana-webhook" \
  -H "Content-Type: application/json" \
  -d '{"requestId":"test-uuid","status":"completed"}'

# Attendu: {"error":"Unauthorized"}

# Test 2: Avec mauvais token - doit échouer avec 401
curl -X POST "http://localhost:3000/api/nanobanana-webhook?token=wrong" \
  -H "Content-Type: application/json" \
  -d '{"requestId":"test-uuid","status":"completed"}'

# Attendu: {"error":"Unauthorized"}

# Test 3: Avec bon token - doit réussir (404 = image non trouvée mais token OK)
curl -X POST "http://localhost:3000/api/nanobanana-webhook?token=VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"requestId":"test-uuid","status":"completed","outputUrls":["https://example.com/test.jpg"]}'

# Attendu: {"error":"Image not found"} avec code 404
# (C'est normal, l'image test n'existe pas, mais le token est valide ✅)
```

---

## ✅ Checklist

- [ ] Token généré avec `openssl rand -hex 32`
- [ ] Token ajouté dans `.env` (variable `NANOBANANA_WEBHOOK_TOKEN`)
- [ ] Email envoyé à NanoBanana avec l'URL complète (incluant le token)
- [ ] Test 1 passé (sans token → 401)
- [ ] Test 2 passé (mauvais token → 401)
- [ ] Test 3 passé (bon token → 404 ou 200)
- [ ] Confirmation reçue de NanoBanana

---

## 🔐 Sécurité

### Avantages de cette solution:
- ✅ **Zéro effort pour NanoBanana** (juste copier l'URL)
- ✅ **Simple à configurer** (3 minutes)
- ✅ **Sécurisé** (token aléatoire 64 caractères)
- ✅ **Validation Zod** du payload (protection contre payloads malformés)

### Ce qui protège votre webhook:
1. **Token secret dans URL** → Seul NanoBanana connaît l'URL complète
2. **Validation Zod** → Payloads malformés rejetés
3. **UUID verification** → Seules les images existantes peuvent être mises à jour
4. **Service role key isolé** → Utilisé uniquement pour ce webhook

### Niveau de sécurité:
🟢 **Moyen-Élevé** (suffisant pour 99% des cas)

---

## 🆚 Comparaison des solutions

| Solution | Setup | Effort NanoBanana | Sécurité |
|----------|-------|-------------------|----------|
| ✅ **Token dans URL** (choisi) | 3 min | Aucun | 🟡 Moyen-Élevé |
| HMAC Signature | 10 min | Implémentation code | 🟢 Très Élevée |
| IP Whitelisting | 5 min | Communiquer IPs | 🟢 Élevée |
| Basic Auth | 5 min | Configuration | 🟡 Moyenne |

**Pourquoi Token dans URL?**
- NanoBanana n'a RIEN à coder
- Vous configurez en 3 minutes
- Suffisamment sécurisé pour un webhook

---

## 🚨 Important

### À NE PAS FAIRE:
- ❌ Ne JAMAIS commit le token dans Git
- ❌ Ne JAMAIS partager le token publiquement
- ❌ Ne JAMAIS logger le token complet

### À FAIRE:
- ✅ Garder le token dans `.env` uniquement
- ✅ Le régénérer si compromis
- ✅ Utiliser des tokens différents dev/prod

### Si le token est compromis:

1. Générer un nouveau token:
```bash
openssl rand -hex 32
```

2. Le mettre à jour dans `.env`

3. Envoyer la nouvelle URL à NanoBanana

4. Vérifier dans les logs qu'aucun webhook avec l'ancien token ne passe

---

## 📖 Ressources

- **Guide complet:** [WEBHOOK_ALTERNATIVES.md](WEBHOOK_ALTERNATIVES.md)
- **Setup admin:** [QUICK_SETUP_ADMIN.md](QUICK_SETUP_ADMIN.md)
- **Sécurité générale:** [SECURITY_FIXES_APPLIED.md](SECURITY_FIXES_APPLIED.md)

---

## 💡 Astuce Pro

Pour éviter de partager le token en clair par email, vous pouvez:

1. Générer le token
2. Le donner à NanoBanana via leur portail/dashboard (si disponible)
3. Ou via un partage 1Password/Bitwarden
4. Ou via un message Slack/Discord sécurisé qui s'auto-détruit

---

**Setup terminé! 🎉**

Votre webhook est maintenant sécurisé et prêt à recevoir les notifications de NanoBanana.
