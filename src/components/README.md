# Composants Réutilisables

Ce dossier contient tous les composants UI réutilisables du projet.

## 📦 Composants UI (`/ui`)

### `<EmptyState />`
Affiche un état vide avec icône, titre, description et action optionnelle.

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

### `<StatusBadge />`
Badge de statut avec icône et couleur adaptée.

```tsx
<StatusBadge status="completed" />
<StatusBadge status="pending" />
<StatusBadge status="processing" />
<StatusBadge status="failed" />
```

### `<ImageComparison />`
Affiche une comparaison avant/après d'images.

```tsx
<ImageComparison
  originalUrl="/path/to/original.jpg"
  transformedUrl="/path/to/transformed.jpg"
  status="completed"
/>
```

### `<IconButton />`
Bouton icône avec variantes et tailles.

```tsx
<IconButton
  icon={Edit3}
  variant="outline"
  size="sm"
  tooltip="Modifier"
  onClick={() => handleEdit()}
/>

// Variantes: default, outline, ghost, danger
// Tailles: sm, md, lg
```

### `<PageHeader />`
En-tête de page réutilisable.

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

### `<StatCard />`
Carte de statistique avec icône et changement.

```tsx
<StatCard
  name="Projets actifs"
  value="12"
  icon={FolderOpen}
  change="+3 ce mois"
  changeType="positive"
/>
```

### `<ConfirmDialog />`
Dialogue de confirmation réutilisable.

```tsx
<ConfirmDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Supprimer le projet ?"
  description="Cette action est irréversible"
  confirmLabel="Supprimer"
  confirmVariant="destructive"
  icon={Trash2}
  onConfirm={() => deleteProject()}
>
  <p>Le projet sera définitivement supprimé.</p>
</ConfirmDialog>
```

## 📁 Composants Projets (`/projects`)

### `<ProjectCard />`
Carte de projet avec image de couverture, progression et détails.

```tsx
<ProjectCard
  id={project.id}
  name={project.name}
  address={project.address}
  coverImageUrl={project.cover_image_url}
  totalImages={project.total_images}
  completedImages={project.completed_images}
  updatedAt={project.updated_at}
/>
```

## 🎨 Convention de nommage

- Tous les composants utilisent PascalCase
- Les fichiers sont en kebab-case
- Les props utilisent camelCase
- Les types/interfaces sont exportés quand nécessaire

## 📚 Import centralisé

```tsx
// Au lieu de multiples imports
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

// Utilisez l'import centralisé
import { Button, Card, EmptyState } from "@/components/ui";
```

## ✅ Bonnes pratiques

1. **Toujours utiliser les composants réutilisables** plutôt que de dupliquer le code
2. **Passer les props nécessaires** sans logique métier dans les composants UI
3. **Utiliser TypeScript** pour typer toutes les props
4. **Ajouter des tooltips** sur les boutons icônes pour l'accessibilité
5. **Gérer les états de chargement** avec les props `loading` ou `isLoading`
