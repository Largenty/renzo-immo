# 📦 Composants Réutilisables - Documentation Complète

## Vue d'ensemble

Ce projet utilise une architecture de composants réutilisables pour éviter la duplication de code et maintenir une cohérence visuelle à travers toute l'application.

## 🎯 Philosophie

- **DRY (Don't Repeat Yourself)** : Un composant = une responsabilité
- **Composition** : Combiner des petits composants pour créer des fonctionnalités complexes
- **Type-safe** : Tous les composants sont typés avec TypeScript
- **Accessible** : Tooltips, aria-labels, et gestion du clavier

## 📁 Structure

```
src/components/
├── ui/                    # Composants UI génériques
│   ├── button.tsx
│   ├── card.tsx
│   ├── empty-state.tsx   # ✨ Nouveau
│   ├── status-badge.tsx  # ✨ Nouveau
│   ├── image-comparison.tsx # ✨ Nouveau
│   ├── icon-button.tsx   # ✨ Nouveau
│   ├── page-header.tsx   # ✨ Nouveau
│   ├── stat-card.tsx     # ✨ Nouveau
│   ├── confirm-dialog.tsx # ✨ Nouveau
│   └── index.ts          # Export centralisé
├── projects/              # Composants métier
│   ├── project-card.tsx  # ✨ Nouveau
│   └── index.ts
└── README.md             # Documentation développeur
```

## 🧩 Composants créés

### 1. `<EmptyState />`
**Fichier** : `src/components/ui/empty-state.tsx`

État vide élégant avec icône, titre, description et action.

**Props** :
- `icon` : LucideIcon - Icône à afficher
- `title` : string - Titre principal
- `description` : string - Description
- `action?` : { label: string, onClick: () => void } - Action optionnelle
- `className?` : string - Classes CSS additionnelles

**Exemple** :
```tsx
<EmptyState
  icon={FolderOpen}
  title="Aucun projet"
  description="Créez votre premier projet pour commencer"
  action={{
    label: "Créer un projet",
    onClick: () => router.push('/dashboard/projects/new')
  }}
/>
```

---

### 2. `<StatusBadge />`
**Fichier** : `src/components/ui/status-badge.tsx`

Badge de statut avec couleur et icône automatiques.

**Props** :
- `status` : "completed" | "pending" | "processing" | "failed"
- `className?` : string

**Variantes** :
- ✅ `completed` : Vert avec icône Check
- ⏰ `pending` : Gris avec icône Clock
- ⚡ `processing` : Bleu avec icône Loader animée
- ❌ `failed` : Rouge avec icône AlertCircle

**Exemple** :
```tsx
<StatusBadge status="completed" />
```

---

### 3. `<ImageComparison />`
**Fichier** : `src/components/ui/image-comparison.tsx`

Comparaison avant/après avec gestion intelligente des états.

**Props** :
- `originalUrl` : string - URL de l'image originale
- `transformedUrl?` : string - URL de l'image transformée
- `status` : StatusType - Statut de la transformation
- `altOriginal?` : string - Alt text original
- `altTransformed?` : string - Alt text transformé

**États gérés** :
- Image transformée disponible → Affiche les deux images
- `processing` → Loader animé avec temps estimé
- `failed` → Message d'erreur visuel
- `pending` → Icône d'horloge

**Exemple** :
```tsx
<ImageComparison
  originalUrl="/uploads/original.jpg"
  transformedUrl="/uploads/transformed.jpg"
  status="completed"
/>
```

---

### 4. `<IconButton />`
**Fichier** : `src/components/ui/icon-button.tsx`

Bouton icône avec variantes et tailles configurables.

**Props** :
- `icon` : LucideIcon - Icône à afficher
- `variant?` : "default" | "outline" | "ghost" | "danger"
- `size?` : "sm" | "md" | "lg"
- `tooltip?` : string - Tooltip au survol
- Toutes les props HTML de `<button>`

**Tailles** :
- `sm` : 32px (icône 16px)
- `md` : 40px (icône 20px)
- `lg` : 48px (icône 24px)

**Exemple** :
```tsx
<IconButton
  icon={Edit3}
  variant="outline"
  size="sm"
  tooltip="Modifier"
  onClick={() => handleEdit()}
/>

<IconButton
  icon={Trash2}
  variant="danger"
  size="sm"
  tooltip="Supprimer"
  onClick={() => handleDelete()}
/>
```

---

### 5. `<PageHeader />`
**Fichier** : `src/components/ui/page-header.tsx`

En-tête de page cohérent avec titre, description et action.

**Props** :
- `title` : string - Titre de la page
- `description?` : string - Description optionnelle
- `action?` : ReactNode - Bouton ou action dans le header

**Exemple** :
```tsx
<PageHeader
  title="Mes projets"
  description="Gérez tous vos projets de transformation"
  action={
    <Button onClick={() => createProject()}>
      <Plus size={20} className="mr-2" />
      Nouveau projet
    </Button>
  }
/>
```

---

### 6. `<StatCard />`
**Fichier** : `src/components/ui/stat-card.tsx`

Carte de statistique élégante avec icône gradient et indicateur de changement.

**Props** :
- `name` : string - Nom de la statistique
- `value` : string | number - Valeur à afficher
- `icon` : LucideIcon - Icône
- `change?` : string - Texte de changement
- `changeType?` : "positive" | "negative" | "neutral"
- `loading?` : boolean - Affiche un skeleton

**Exemple** :
```tsx
<StatCard
  name="Projets actifs"
  value="12"
  icon={FolderOpen}
  change="+3 ce mois"
  changeType="positive"
/>
```

---

### 7. `<ConfirmDialog />`
**Fichier** : `src/components/ui/confirm-dialog.tsx`

Dialogue de confirmation réutilisable et personnalisable.

**Props** :
- `open` : boolean
- `onOpenChange` : (open: boolean) => void
- `title` : string
- `description?` : string
- `icon?` : LucideIcon
- `children?` : ReactNode - Contenu personnalisé
- `confirmLabel?` : string (défaut: "Confirmer")
- `cancelLabel?` : string (défaut: "Annuler")
- `onConfirm` : () => void
- `onCancel?` : () => void
- `confirmVariant?` : "default" | "destructive"
- `isLoading?` : boolean

**Exemple** :
```tsx
<ConfirmDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Supprimer le projet ?"
  description="Cette action est irréversible"
  confirmLabel="Supprimer"
  confirmVariant="destructive"
  icon={Trash2}
  onConfirm={handleDelete}
  isLoading={isDeleting}
>
  <p className="text-sm text-red-900">
    Le projet "{projectName}" sera définitivement supprimé.
  </p>
</ConfirmDialog>
```

---

### 8. `<ProjectCard />`
**Fichier** : `src/components/projects/project-card.tsx`

Carte de projet avec image de couverture, progression et métadonnées.

**Props** :
- `id` : string
- `name` : string
- `address?` : string
- `coverImageUrl?` : string
- `totalImages` : number
- `completedImages` : number
- `updatedAt` : string

**Features** :
- Image de couverture avec fallback
- Barre de progression animée
- Badge de progression
- Hover effect avec scale
- Link vers la page du projet

**Exemple** :
```tsx
<ProjectCard
  id={project.id}
  name={project.name}
  address={project.address}
  coverImageUrl={project.cover_image_url}
  totalImages={12}
  completedImages={8}
  updatedAt={project.updated_at}
/>
```

---

## 📦 Import centralisé

Tous les composants UI peuvent être importés depuis un seul point :

```tsx
import {
  Button,
  Card,
  EmptyState,
  StatusBadge,
  ImageComparison,
  IconButton,
  PageHeader,
  StatCard,
  ConfirmDialog,
} from "@/components/ui";

import { ProjectCard } from "@/components/projects";
```

## 🎨 Design System

### Couleurs

- **Primary** : Gradient bleu/indigo (`from-blue-600 to-indigo-600`)
- **Success** : Vert (`green-600`)
- **Danger** : Rouge (`red-600`)
- **Warning** : Orange (`orange-600`)
- **Neutral** : Slate (`slate-600`)

### Espacements

- **Cards** : `p-6` (24px)
- **Sections** : `space-y-8` (32px)
- **Éléments** : `gap-4` (16px)
- **Boutons** : `gap-2` (8px)

### Bordures

- **Radius** : `rounded-sm` (2px) - Style architectural
- **Cards** : `modern-card` classe custom

## ✅ Checklist d'utilisation

Avant de créer un nouveau composant, vérifiez :

- [ ] Le composant existe-t-il déjà ?
- [ ] Peut-on composer avec les composants existants ?
- [ ] Le composant sera-t-il réutilisé 3+ fois ?
- [ ] Les props sont-elles bien typées ?
- [ ] Le composant gère-t-il les états de chargement ?
- [ ] Les tooltips sont-ils présents sur les boutons icônes ?

## 🚀 Prochaines étapes

Composants à créer selon les besoins :

- `<ImageUploadZone />` - Zone de drag & drop
- `<PricingCard />` - Carte de tarification
- `<Timeline />` - Timeline d'événements
- `<SearchBar />` - Barre de recherche avec filtres
- `<Tabs />` - Système d'onglets
- `<Pagination />` - Pagination réutilisable

## 📚 Ressources

- [shadcn/ui](https://ui.shadcn.com/) - Composants de base
- [Lucide Icons](https://lucide.dev/) - Icônes
- [Tailwind CSS](https://tailwindcss.com/) - Styles
