# Domain: Projects

## Vue d'ensemble

Le domaine **Projects** gère l'organisation des images en projets. Un projet est un conteneur logique pour grouper des images liées (ex: appartement, maison).

## Responsabilités

- Création/modification/suppression de projets
- Gestion des images d'un projet
- Métadonnées projet (nom, description, couverture)
- Projets publics/privés (showcase)
- Partage de projets

## Structure

```
projects/
├── models/
│   └── project.ts               # Project entity
├── ports/
│   ├── projects-repository.ts   # IProjectsRepository
│   └── project-storage.ts       # IProjectStorage
├── services/
│   └── project.service.ts       # Project business logic
└── index.ts
```

## Models

### Project

```typescript
interface Project {
  id: string
  userId: string
  name: string
  description?: string | null
  coverImageUrl?: string | null
  imageCount: number            // Computed
  isPublic: boolean             // For showcase
  slug?: string                 // For public URLs
  createdAt: Date
  updatedAt: Date
}
```

## Ports

### IProjectsRepository

```typescript
interface IProjectsRepository {
  // CRUD
  create(data: CreateProjectData): Promise<Project>
  getById(id: string): Promise<Project | null>
  getAll(userId: string): Promise<Project[]>
  update(id: string, data: Partial<Project>): Promise<Project>
  delete(id: string): Promise<void>

  // Public projects
  getPublicProjects(): Promise<Project[]>
  getBySlug(slug: string): Promise<Project | null>
  togglePublic(id: string): Promise<Project>
}
```

### IProjectStorage

```typescript
interface IProjectStorage {
  uploadCoverImage(file: File): Promise<string>
  deleteCoverImage(imageUrl: string): Promise<void>
  uploadProjectImage(projectId: string, file: File): Promise<string>
  deleteProjectImages(projectId: string): Promise<void>
}
```

## Implementation

### Repository

**Fichier**: [src/infrastructure/supabase/projects.repository.ts](../../../infrastructure/supabase/projects.repository.ts)

### Storage Adapter

**Fichier**: [src/infrastructure/supabase/project-storage.adapter.ts](../../../infrastructure/supabase/project-storage.adapter.ts)

Gère l'upload/suppression de fichiers dans Supabase Storage:
- Bucket `projects`: Cover images
- Bucket `images`: Project images

### Hooks

**Fichier**: [src/application/projects/use-projects.ts](../../../application/projects/use-projects.ts)

```typescript
// List user projects
const { data: projects } = useProjects()

// Create project
const create = useCreateProject()
create.mutate({ name, description, coverImage })

// Update project
const update = useUpdateProject()
update.mutate({ id, name, description })

// Delete project
const remove = useDeleteProject()
remove.mutate(projectId)

// Toggle public
const togglePublic = useToggleProjectPublic()
togglePublic.mutate(projectId)
```

## API Routes

- `GET /api/projects` - List user projects
- `POST /api/projects` - Create project
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project
- `POST /api/projects/[id]/toggle-public` - Toggle public visibility

## UI Components

**Files**:
- [src/presentation/features/projects/organisms/project-list.tsx](../../../presentation/features/projects/organisms/project-list.tsx)
- [src/presentation/features/projects/organisms/project-card.tsx](../../../presentation/features/projects/organisms/project-card.tsx)
- [src/presentation/features/projects/organisms/create-project-dialog.tsx](../../../presentation/features/projects/organisms/create-project-dialog.tsx)

## Business Rules

- Project name: 1-100 characters
- Description: Optional, max 500 characters
- Cover image: Optional, max 5MB, JPEG/PNG/WebP
- User can have max 50 projects (free tier)
- Slug auto-generated from name for public projects

## Security

### Row Level Security

```sql
-- Users can only view their own projects
CREATE POLICY "Users view own projects"
ON projects FOR SELECT
USING (auth.uid() = user_id);

-- Anyone can view public projects
CREATE POLICY "Anyone view public projects"
ON projects FOR SELECT
USING (is_public = true);
```

## Showcase Feature

Public projects appear on:
- `GET /api/showcase` - All public projects
- `GET /api/showcase/[username]` - User's public projects
- `GET /api/showcase/[username]/[slug]` - Specific project

**Pages**:
- `/showcase` - Public gallery
- `/showcase/@username` - User portfolio
- `/showcase/@username/project-slug` - Project details

## Testing

```typescript
describe('ProjectsRepository', () => {
  it('should create project', async () => {
    const project = await repository.create({
      userId: 'user-123',
      name: 'My Project',
    })

    expect(project.name).toBe('My Project')
    expect(project.imageCount).toBe(0)
  })

  it('should increment image count', async () => {
    // Test trigger: images.insert → projects.image_count++
  })
})
```

---

**Maintainer**: Dev Team
**Last Updated**: 2025-11-04
