# 📚 Documentation Renzo Immobilier

## 🎯 Documentation Principale

### Système de Prompts (NOUVEAU)
- **[MODULAR_PROMPTS_GUIDE.md](./MODULAR_PROMPTS_GUIDE.md)** - Guide complet du système modulaire
- **[MODULAR_SYSTEM_TODO.md](./MODULAR_SYSTEM_TODO.md)** - Étapes d'implémentation et TODO

### Base de données
- **[DATABASE_DOCUMENTATION.md](./DATABASE_DOCUMENTATION.md)** - Documentation complète de la BDD

### Production & Sécurité
- **[PRODUCTION_READINESS_SUMMARY.md](./PRODUCTION_READINESS_SUMMARY.md)** - Checklist production
- **[SECURITY_IMPLEMENTATION_REPORT.md](./SECURITY_IMPLEMENTATION_REPORT.md)** - Rapport sécurité
- **[SENTRY_SETUP_GUIDE.md](./SENTRY_SETUP_GUIDE.md)** - Configuration Sentry
- **[UPSTASH_SETUP.md](./UPSTASH_SETUP.md)** - Configuration Upstash Redis
- **[WEBHOOK_MIGRATION_GUIDE.md](./WEBHOOK_MIGRATION_GUIDE.md)** - Guide webhooks NanoBanana

---

## 📦 Archive

Le dossier `archive/` contient les anciens documents de debug et migration qui ne sont plus nécessaires mais conservés pour référence historique.

---

## 🚀 Quick Start

### Pour développer
1. Lire [MODULAR_SYSTEM_TODO.md](./MODULAR_SYSTEM_TODO.md) pour les prochaines étapes
2. Consulter [DATABASE_DOCUMENTATION.md](./DATABASE_DOCUMENTATION.md) pour le schéma BDD

### Pour déployer
1. Suivre [PRODUCTION_READINESS_SUMMARY.md](./PRODUCTION_READINESS_SUMMARY.md)
2. Configurer selon [SENTRY_SETUP_GUIDE.md](./SENTRY_SETUP_GUIDE.md)

### Pour comprendre le système de prompts
1. Lire [MODULAR_PROMPTS_GUIDE.md](./MODULAR_PROMPTS_GUIDE.md)
2. Appliquer les migrations dans `supabase/migrations/MODULAR_*.sql`
