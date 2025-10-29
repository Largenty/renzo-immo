## État de l'application - Renzo Immobilier

Ce guide explique l'architecture de gestion d'état complète de Renzo, combinant **Zustand** pour l'état client et **React Query** pour les données serveur.

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    REACT APPLICATION                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐        ┌───────────────────────┐ │
│  │  ZUSTAND STORES  │        │   REACT QUERY HOOKS   │ │
│  │  (État Client)   │        │   (Données Serveur)   │ │
│  ├──────────────────┤        ├───────────────────────┤ │
│  │ • auth-store     │        │ • useProjects()       │ │
│  │ • styles-store   │        │ • useProjectImages()  │ │
│  │ • upload-store   │        │ • useCreditStats()    │ │
│  └──────────────────┘        └───────────────────────┘ │
│         ↓ localStorage              ↓ Cache 5min       │
│                                                          │
└─────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────┐
                    │  SUPABASE API   │
                    │  (PostgreSQL)   │
                    └─────────────────┘
```

---

## 🗂️ Structure des fichiers

```
src/lib/
├── stores/              # Zustand stores (état client)
│   ├── auth-store.ts    # Authentification + session
│   ├── styles-store.ts  # Styles personnalisés
│   ├── upload-store.ts  # Workflow d'upload
│   └── index.ts         # Exports
│
├── hooks/               # React Query hooks (données serveur)
│   ├── use-projects.ts  # CRUD projets
│   ├── use-images.ts    # CRUD images
│   ├── use-credits.ts   # Transactions crédits
│   └── index.ts         # Exports
│
└── components/providers/
    ├── auth-provider.tsx   # Sync Supabase → Zustand
    └── query-provider.tsx  # QueryClient config
```

---

## 🎯 Zustand Stores (État Client)

### Quand utiliser Zustand ?

✅ **Utilise Zustand pour :**
- État applicatif (auth, préférences utilisateur)
- Workflow UI complexe (stepper upload)
- Données qui ne changent PAS côté serveur
- État partagé entre plusieurs composants
- Besoin de persistance localStorage

❌ **N'utilise PAS Zustand pour :**
- Données venant du serveur (projets, images)
- Cache de requêtes API
- Données modifiées par d'autres users

---

### 1. **Auth Store** (`auth-store.ts`)

Gère l'authentification et la session utilisateur.

**État :**
```typescript
{
  user: UserData | null,
  session: Session | null,
  isLoading: boolean,
  isInitialized: boolean
}
```

**Utilisation :**
```typescript
import { useUser, useIsAuthenticated, useCreditsBalance } from '@/lib/stores'

function MyComponent() {
  const user = useUser()
  const isAuth = useIsAuthenticated()
  const credits = useCreditsBalance()

  return <div>Bonjour {user?.first_name}, {credits} crédits</div>
}
```

**Persistance :** ✅ localStorage (`renzo-auth-storage`)

---

### 2. **Styles Store** (`styles-store.ts`)

Gère les styles personnalisés créés par l'utilisateur.

**Actions :**
- `addStyle(style)` - Ajouter un style
- `updateStyle(id, updates)` - Modifier
- `deleteStyle(id)` - Supprimer
- `getStyleById(id)` - Récupérer par ID

**Utilisation :**
```typescript
import { useStyles, useStylesActions } from '@/lib/stores'

function StylesPage() {
  const styles = useStyles()
  const { addStyle, deleteStyle } = useStylesActions()

  const handleCreate = () => {
    addStyle({
      id: crypto.randomUUID(),
      name: 'Mon style',
      description: 'Description...',
      iconName: 'Sofa',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  return <div>...</div>
}
```

**Persistance :** ✅ localStorage (`renzo-styles-storage`)

**Migration :** Remplace l'ancien `StylesContext`

---

### 3. **Upload Store** (`upload-store.ts`)

Gère le workflow d'upload multi-étapes.

**État :**
```typescript
{
  files: UploadedFile[],
  step: 'upload' | 'configure',
  bulkMode: boolean,
  bulkTransformationType: TransformationType,
  // ... autres configs
}
```

**Actions principales :**
- `addFiles(files)` - Ajouter des fichiers
- `removeFile(id)` - Retirer un fichier
- `setStep(step)` - Changer d'étape
- `applyBulkConfig()` - Appliquer config à tous
- `reset()` - Réinitialiser

**Utilisation :**
```typescript
import { useUploadStore } from '@/lib/stores'

function UploadWizard() {
  const { files, step, addFiles, setStep, reset } = useUploadStore()

  const handleUpload = (newFiles) => {
    addFiles(newFiles)
    setStep('configure')
  }

  const handleComplete = () => {
    // Upload vers serveur ici
    reset() // Clear après upload
  }

  return <div>...</div>
}
```

**Persistance :** ❌ Pas de persistance (état temporaire)

---

## 🌐 React Query Hooks (Données Serveur)

### Quand utiliser React Query ?

✅ **Utilise React Query pour :**
- Données venant de Supabase/API
- Cache avec invalidation automatique
- Mutations avec rollback optimiste
- Synchronisation background
- Pagination & infinite scroll

---

### 1. **Projects Hooks** (`use-projects.ts`)

#### `useProjects()` - Liste des projets

```typescript
import { useProjects } from '@/lib/hooks'

function ProjectsList() {
  const { data: projects, isLoading, error } = useProjects()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {projects?.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  )
}
```

**Features :**
- ✅ Cache 5 minutes
- ✅ Auto-refetch au focus
- ✅ Invalidation après mutations

#### `useProject(id)` - Projet spécifique

```typescript
const { data: project } = useProject(projectId)
```

#### `useCreateProject()` - Créer un projet

```typescript
import { useCreateProject } from '@/lib/hooks'

function NewProjectForm() {
  const createProject = useCreateProject()

  const handleSubmit = async (data) => {
    await createProject.mutateAsync({
      name: data.name,
      address: data.address,
      description: data.description,
    })
    // Toast success automatique
    // Cache invalidé automatiquement
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

#### `useUpdateProject()` - Mettre à jour

```typescript
const updateProject = useUpdateProject()

updateProject.mutate({
  id: '123',
  updates: { name: 'Nouveau nom' }
})
```

#### `useDeleteProject()` - Supprimer

```typescript
const deleteProject = useDeleteProject()

deleteProject.mutate(projectId)
```

---

### 2. **Images Hooks** (`use-images.ts`)

#### `useProjectImages(projectId)` - Images d'un projet

```typescript
import { useProjectImages } from '@/lib/hooks'

function ProjectGallery({ projectId }: { projectId: string }) {
  const { data: images, isLoading } = useProjectImages(projectId)

  return (
    <div>
      {images?.map(img => (
        <img key={img.id} src={img.transformed_url || img.original_url} />
      ))}
    </div>
  )
}
```

**Features :**
- ✅ Cache 2 minutes
- ✅ Enabled seulement si projectId existe
- ✅ Tri par date desc

#### `useUploadImage()` - Upload une image

```typescript
const uploadImage = useUploadImage()

const handleUpload = async (file: File) => {
  await uploadImage.mutateAsync({
    projectId: '123',
    file,
    transformationType: 'depersonnalisation',
    customPrompt: 'Style moderne',
    withFurniture: true,
  })
}
```

**Process :**
1. Upload fichier vers Storage Supabase
2. Récupère URL publique
3. Crée entrée dans table `images`
4. Invalide cache du projet

#### `useRegenerateImage()` - Régénérer

```typescript
const regenerate = useRegenerateImage()

regenerate.mutate({
  imageId: 'img-123',
  projectId: 'proj-456',
  newType: 'home_staging_moderne',
})
```

#### `useDeleteImage()` - Supprimer

```typescript
const deleteImage = useDeleteImage()

deleteImage.mutate({ imageId: '123', projectId: '456' })
```

---

### 3. **Credits Hooks** (`use-credits.ts`)

#### `useCreditTransactions()` - Historique

```typescript
import { useCreditTransactions } from '@/lib/hooks'

function CreditsHistory() {
  const { data: transactions } = useCreditTransactions(50) // limit 50

  return (
    <div>
      {transactions?.map(tx => (
        <div key={tx.id}>
          {tx.type} : {tx.amount} - {tx.description}
        </div>
      ))}
    </div>
  )
}
```

#### `useCreditStats()` - Statistiques

```typescript
const { data: stats } = useCreditStats()

// stats = {
//   total_purchased: 100,
//   total_used: 52,
//   total_remaining: 48,
//   transactions_count: 23
// }
```

#### `useConsumeCredits()` - Utiliser des crédits

```typescript
const consumeCredits = useConsumeCredits()

// Lors d'une transformation
const handleTransform = async () => {
  await consumeCredits.mutateAsync({
    amount: 1,
    description: 'Dépersonnalisation salon',
    relatedImageId: 'img-123',
  })
  // Le store auth est mis à jour automatiquement
  // Les stats et l'historique sont invalidés
}
```

#### `useAddCredits()` - Ajouter des crédits

```typescript
const addCredits = useAddCredits()

// Après un achat réussi
addCredits.mutate({
  amount: 50,
  type: 'purchase',
  description: 'Pack 50 crédits',
})
```

---

## 🔄 Synchronisation Store ↔ Server

### Scénario : Achat de crédits

```typescript
// 1. User achète 100 crédits via Stripe
const handlePurchase = async () => {
  // 2. Paiement Stripe réussi

  // 3. Ajouter via React Query (DB)
  await addCredits.mutateAsync({
    amount: 100,
    type: 'purchase',
    description: 'Pack 100 crédits',
  })

  // 4. React Query invalide le cache

  // 5. Le hook useCreditStats se refetch automatiquement

  // 6. Dans useAddCredits.onSuccess :
  updateCredits(100) // Met à jour le Zustand store

  // 7. useCreditsBalance() dans la navbar se met à jour
}
```

**Résultat :** DB ✅, Cache ✅, Store ✅, UI ✅

---

## 🛠️ Configuration

### QueryClient (déjà configuré)

```typescript
// src/components/providers/query-provider.tsx
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 10 * 60 * 1000,        // 10 minutes
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
})
```

### DevTools

En mode dev, tu as accès à :

**React Query DevTools :**
- Ouvre automatiquement en bas à gauche
- Voir les queries actives
- Voir le cache
- Forcer un refetch

**Zustand DevTools :**
```javascript
// Dans la console Chrome
window.authStore = useAuthStore
window.authStore.getState()

// Voir l'état
authStore.getState().user

// Modifier manuellement
authStore.getState().updateCredits(10)
```

---

## 📊 Exemples complets

### Exemple 1 : Page projet avec images

```typescript
import { useProject, useProjectImages, useDeleteImage } from '@/lib/hooks'
import { useUser } from '@/lib/stores'

function ProjectPage({ projectId }: { projectId: string }) {
  const user = useUser()
  const { data: project, isLoading } = useProject(projectId)
  const { data: images } = useProjectImages(projectId)
  const deleteImage = useDeleteImage()

  const handleDelete = (imageId: string) => {
    if (confirm('Supprimer ?')) {
      deleteImage.mutate({ imageId, projectId })
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>{project?.name}</h1>
      <p>Propriétaire : {user?.first_name}</p>

      <div className="grid">
        {images?.map(img => (
          <div key={img.id}>
            <img src={img.transformed_url} alt="" />
            <button onClick={() => handleDelete(img.id)}>
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Exemple 2 : Upload avec workflow

```typescript
import { useUploadStore } from '@/lib/stores'
import { useUploadImage } from '@/lib/hooks'

function UploadWorkflow({ projectId }: { projectId: string }) {
  const { files, step, addFiles, setStep, reset } = useUploadStore()
  const uploadImage = useUploadImage()

  const handleFilesAdded = (newFiles: File[]) => {
    const uploadedFiles = newFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }))

    addFiles(uploadedFiles)
    setStep('configure')
  }

  const handleComplete = async () => {
    // Upload chaque fichier vers le serveur
    for (const file of files) {
      await uploadImage.mutateAsync({
        projectId,
        file: file.file,
        transformationType: file.transformationType!,
        customPrompt: file.customPrompt,
      })
    }

    // Clear le store après upload
    reset()
  }

  return (
    <div>
      {step === 'upload' && (
        <FileDropzone onFilesAdded={handleFilesAdded} />
      )}

      {step === 'configure' && (
        <ConfigureFiles files={files} onComplete={handleComplete} />
      )}
    </div>
  )
}
```

---

## 🚀 Migration depuis mock data

### Avant (mock)

```typescript
const [projects, setProjects] = useState(mockProjects)

const handleCreate = (data) => {
  const newProject = { ...data, id: uuid() }
  setProjects([newProject, ...projects])
}
```

### Après (React Query)

```typescript
import { useProjects, useCreateProject } from '@/lib/hooks'

const { data: projects } = useProjects()
const createProject = useCreateProject()

const handleCreate = async (data) => {
  await createProject.mutateAsync(data)
  // Cache invalidé automatiquement
  // Liste refetch automatiquement
  // Toast affiché automatiquement
}
```

---

## 🎓 Bonnes pratiques

### 1. Sélecteurs Zustand

```typescript
// ❌ Mauvais - re-render à chaque changement du store
const { user, session, isLoading } = useAuthStore()

// ✅ Bon - re-render seulement si user change
const user = useUser()
```

### 2. Enabled queries

```typescript
// ✅ Ne fetch que si projectId existe
const { data } = useProject(projectId)
// enabled: !!projectId est déjà géré dans le hook
```

### 3. Optimistic updates

```typescript
const deleteImage = useDeleteImage()

// Retirer de l'UI immédiatement
queryClient.setQueryData(['images', projectId], (old) =>
  old?.filter(img => img.id !== imageId)
)

// Puis supprimer en DB
deleteImage.mutate({ imageId, projectId })
```

### 4. Error handling

```typescript
const { data, error, isError } = useProjects()

if (isError) {
  return <ErrorDisplay error={error.message} />
}
```

---

## 📚 Ressources

- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [React Query Docs](https://tanstack.com/query/latest)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)

---

## ✅ Checklist de migration

- [x] Installer Zustand & React Query
- [x] Créer QueryProvider
- [x] Créer AuthProvider
- [x] Migrer StylesContext → Zustand
- [x] Créer Upload Store
- [x] Créer hooks React Query (projects, images, credits)
- [ ] Migrer pages projets vers React Query
- [ ] Migrer page crédits vers React Query
- [ ] Tester en prod avec vraies données

---

**Dernière mise à jour :** Octobre 2025
