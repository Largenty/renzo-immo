# Renzo Immobilier — Landing Page IA

Landing page de conversion pour **Renzo Immobilier**, solution IA de rénovation virtuelle photoréaliste.

**Stack** : Next.js 14 • TypeScript • Tailwind CSS • shadcn/ui • GSAP

---

## 🎯 Concept

**Produit** : Renzo Immobilier - IA de rénovation virtuelle
**Promesse** : "Montrez le potentiel. Avant/Après en minutes, +32% de clics, +18% de visites"
**Cibles** : Agences, promoteurs, particuliers vendeurs

---

## 🚀 Démarrage

```bash
npm install
npm run dev
```

Site sur : **http://localhost:3001**

---

## 📂 Structure

```
├── app/
│   ├── layout.tsx              # Layout + SEO + JSON-LD
│   ├── page.tsx                # Landing principale
│   └── globals.css             # Tailwind + variables
├── src/
│   ├── components/
│   │   ├── sections/           # 9 sections landing
│   │   ├── layout/             # Navbar + Footer
│   │   └── ui/                 # shadcn/ui components
│   ├── config/
│   │   ├── pricing.ts          # Forfaits (modifiable)
│   │   └── seo.ts              # SEO & JSON-LD
│   └── lib/
│       ├── utils.ts
│       └── gsap-utils.ts
```

---

## 💰 Pricing (Modifiable)

Fichier : `src/config/pricing.ts`

| Plan | Mensuel | Annuel | Crédits |
|------|---------|--------|---------|
| Starter | 19€ | 182€ | 20 |
| Pro | 79€ | 758€ | 120 |
| Agence | 249€ | 2388€ | 500 |

---

## 🎨 Sections Landing

1. **Hero** - Titre + 2 CTAs (Essai gratuit / Démo)
2. **LogosMarquee** - Clients/partenaires
3. **HowItWorks** - 4 étapes process
4. **BeforeAfter** - Slider interactif
5. **ShowcaseGrid** - 6 cas d'usage
6. **ResultsKPIs** - 4 KPIs (+32% clics, etc.)
7. **ForWhom** - 3 cibles (Agences/Promoteurs/Particuliers)
8. **PricingSales** - Toggle Mensuel/Annuel + 3 plans
9. **ContactForm** - Formulaire simple

---

## 🔧 shadcn/ui

Composants installés : Button, Card, Dialog, Input, Label, Textarea, Separator, Toast

Ajouter un composant :
```bash
npx shadcn@latest add [component-name]
```

---

## 🔍 SEO & JSON-LD

Configuration centralisée dans `src/config/seo.ts`

Deux schemas Schema.org injectés :
- **Organization** (entreprise)
- **Product** (offre + pricing)

---

## 📱 Responsive & A11y

- Mobile-first (≥360px)
- Contrastes AA
- prefers-reduced-motion
- Focus states visibles
- ARIA labels

---

## ⚡ Performance

Objectif Lighthouse : **≥ 90** partout

- next/image
- Lazy-loading
- AVIF/WebP
- Bundle optimisé

---

## 📄 Pages

- `/` - Landing principale
- `/legal` - Mentions légales (à créer)
- `/privacy` - RGPD (à créer)

---

## 🚢 Déploiement

```bash
npm run build
vercel
```

---

## ✅ État Actuel

- [x] Structure projet
- [x] Config pricing/SEO
- [x] 9 sections landing
- [x] Layout + Navbar + Footer
- [x] shadcn/ui intégré
- [ ] Animations GSAP
- [ ] Before/After slider
- [ ] ROI Calculator
- [ ] Sticky Order Bar
- [ ] Pages légales
- [ ] Stripe integration

---

**Site fonctionnel sur http://localhost:3001** 🎉
