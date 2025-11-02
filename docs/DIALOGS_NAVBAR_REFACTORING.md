# Refactoring des Dialogs et Navbar

## 📋 Vue d'ensemble

Optimisation et réorganisation des composants de dialogs/modals et du navbar pour améliorer la maintenabilité et réduire la duplication de code.

## 🎯 Objectifs

1. ✅ Éliminer la duplication de code
2. ✅ Améliorer la réutilisabilité
3. ✅ Simplifier le navbar (241L → ~120L)
4. ✅ Créer des composants génériques
5. ✅ Améliorer l'organisation

## 📂 Nouveaux fichiers créés

### 1. Navbar Components

#### `src/components/layout/navbar-auth-menu.tsx`
**Lignes:** ~80
**Responsabilité:** Menu d'authentification desktop (boutons login/signup OU dropdown utilisateur)

**Utilisation:**
```tsx
<NavbarAuthMenu
  user={displayUser}
  isLoading={isLoading}
  onLogout={handleLogout}
/>
```

#### `src/components/layout/navbar-mobile-menu.tsx`
**Lignes:** ~70
**Responsabilité:** Menu mobile avec liens et authentification

**Utilisation:**
```tsx
{mobileMenuOpen && (
  <NavbarMobileMenu
    user={displayUser}
    isLoading={isLoading}
    onLogout={handleLogout}
  />
)}
```

#### `src/components/layout/navbar-refactored.tsx`
**Lignes:** ~120 (vs 241 original)
**Responsabilité:** Composant principal navbar simplifié

**Améliorations:**
- ✅ 50% moins de code
- ✅ Séparation des responsabilités
- ✅ Meilleure lisibilité
- ✅ Pas de duplication logique auth

### 2. Dialog Components

#### `src/components/dialogs/delete-dialog.tsx`
**Lignes:** ~110
**Responsabilité:** Dialog de confirmation de suppression générique et réutilisable

**Remplace:**
- `/components/ui/delete-confirm-dialog.tsx` (61L)
- `/components/projects/molecules/delete-confirm-dialog.tsx` (122L)
- Logique custom dans `delete-project-dialog.tsx`

**Utilisation:**
```tsx
<DeleteDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  onConfirm={handleDelete}
  title="Supprimer le projet"
  entityName="ce projet"
  isLoading={deleteProjectMutation.isPending}
/>
```

**Props configurables:**
- `title` - Titre personnalisé
- `description` - Message personnalisé
- `entityName` - Nom de l'entité à supprimer
- `confirmText` - Texte bouton confirmer
- `cancelText` - Texte bouton annuler
- `isLoading` - État de chargement

#### `src/components/dialogs/index.ts`
**Responsabilité:** Point d'entrée centralisé pour tous les dialogs

**Exports:**
```typescript
// Common
export { DeleteDialog } from './delete-dialog';

// Primitives (re-export from ui)
export { Dialog, DialogContent, ... } from '@/components/ui/dialog';
export { AlertDialog, ... } from '@/components/ui/alert-dialog';
```

## 🔄 Plan de migration

### Phase 1: Navbar (Immédiat)

**Étape 1:** Renommer l'ancien navbar
```bash
mv src/components/layout/navbar.tsx src/components/layout/navbar-old.tsx
```

**Étape 2:** Renommer le nouveau
```bash
mv src/components/layout/navbar-refactored.tsx src/components/layout/navbar.tsx
```

**Étape 3:** Tester
- Page d'accueil (navbar public)
- Dashboard (navbar auth)
- Mobile (menu mobile)
- Logout flow

**Étape 4:** Supprimer l'ancien
```bash
rm src/components/layout/navbar-old.tsx
```

### Phase 2: Delete Dialogs (Progressif)

**Fichiers à migrer:**

1. **delete-project-dialog.tsx**
```diff
- import { AlertDialog, AlertDialogAction, ... } from "@/components/ui/alert-dialog";
+ import { DeleteDialog } from "@/components/dialogs";

- <AlertDialog open={open} onOpenChange={onClose}>
-   <AlertDialogContent>
-     <AlertDialogHeader>
-       {/* ... beaucoup de code ... */}
+ <DeleteDialog
+   open={open}
+   onOpenChange={onClose}
+   onConfirm={handleDelete}
+   title="Supprimer le projet"
+   entityName={`le projet "${project?.name}"`}
+   isLoading={deleteProjectMutation.isPending}
+ />
```

2. **furniture-form-dialog.tsx** (si dialog delete intégré)
3. **room-form-dialog.tsx** (si dialog delete intégré)
4. **style-form-dialog.tsx** (si dialog delete intégré)

**Fichiers à supprimer après migration:**
```bash
rm src/components/ui/delete-confirm-dialog.tsx
rm src/components/projects/molecules/delete-confirm-dialog.tsx
```

### Phase 3: Réorganisation complète (Optionnel)

```
src/components/dialogs/
├── index.ts                 # ✅ Créé
├── delete-dialog.tsx        # ✅ Créé
├── auth/
│   └── logout-dialog.tsx    # Déplacer de /modals
├── furniture/
│   ├── furniture-form-dialog.tsx      # Déplacer
│   └── furniture-selector-dialog.tsx  # Déplacer
├── rooms/
│   └── room-form-dialog.tsx          # Déplacer
├── projects/
│   └── image-viewer-dialog.tsx       # Déplacer
└── common/
    └── share-dialog.tsx              # Déplacer de /ui
```

## 📊 Gains attendus

### Réduction de code
```
Avant:
- navbar.tsx: 241L
- delete-confirm-dialog.tsx (ui): 61L
- delete-confirm-dialog.tsx (projects): 122L
Total: 424L

Après:
- navbar.tsx: 120L
- navbar-auth-menu.tsx: 80L
- navbar-mobile-menu.tsx: 70L
- delete-dialog.tsx: 110L
Total: 380L

Économie: 44 lignes + meilleure réutilisabilité
```

### Duplication éliminée
- ✅ Logique auth navbar (desktop vs mobile)
- ✅ Delete confirmation dialogs (2 composants → 1)
- ✅ Styling et layout consistants

### Maintenabilité
- ✅ Composants plus petits et focalisés
- ✅ Props explicites et documentées
- ✅ Import centralisé via `/dialogs`
- ✅ Tests plus faciles

## 🧪 Tests recommandés

### Navbar
- [ ] Navigation publique (non-auth)
- [ ] Navigation auth (dropdown utilisateur)
- [ ] Menu mobile (ouverture/fermeture)
- [ ] Logout flow complet
- [ ] Responsive (desktop ↔ mobile)
- [ ] Hydration (pas d'erreur SSR)

### Delete Dialog
- [ ] Ouverture/fermeture
- [ ] Bouton annuler
- [ ] Bouton confirmer
- [ ] État loading
- [ ] Textes personnalisés
- [ ] Accessibilité (keyboard, screen readers)

## 📝 Notes de migration

### Breaking Changes
Aucun! Les changements sont rétro-compatibles:
- Les anciens fichiers restent en place jusqu'à migration complète
- Les nouveaux composants peuvent coexister
- Migration progressive possible

### Points d'attention
1. **Imports:** Vérifier les imports après déplacement de fichiers
2. **Types:** S'assurer que les types `User` sont bien exportés
3. **Dependencies:** Vérifier que tous les composants UI sont disponibles

## 🚀 Prochaines optimisations possibles

1. **Lazy loading des dialogs**
```tsx
const DeleteDialog = dynamic(() => import('@/components/dialogs/delete-dialog'));
```

2. **Context pour les dialogs globaux**
```tsx
const { openDeleteDialog } = useDialogs();
openDeleteDialog({ entityName: 'project', onConfirm: ... });
```

3. **Animation améliorée**
```tsx
// Utiliser Framer Motion pour des transitions plus smooth
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
```

## 📚 Ressources

- [Radix UI Dialog](https://www.radix-ui.com/primitives/docs/components/dialog)
- [Radix UI Alert Dialog](https://www.radix-ui.com/primitives/docs/components/alert-dialog)
- [Shadcn/ui Dialog](https://ui.shadcn.com/docs/components/dialog)

## ✅ Checklist de migration

### Phase 1: Navbar
- [x] Créer navbar-auth-menu.tsx
- [x] Créer navbar-mobile-menu.tsx
- [x] Créer navbar-refactored.tsx
- [ ] Tester sur toutes les pages
- [ ] Remplacer navbar.tsx
- [ ] Supprimer l'ancien fichier

### Phase 2: Dialogs
- [x] Créer delete-dialog.tsx générique
- [x] Créer dialogs/index.ts
- [ ] Migrer delete-project-dialog.tsx
- [ ] Migrer autres delete dialogs
- [ ] Supprimer les anciens fichiers
- [ ] Tester tous les flows de suppression

### Phase 3: Réorganisation (Optionnel)
- [ ] Créer structure dialogs/
- [ ] Déplacer logout-dialog
- [ ] Déplacer furniture dialogs
- [ ] Déplacer rooms dialogs
- [ ] Déplacer projects dialogs
- [ ] Mettre à jour tous les imports
