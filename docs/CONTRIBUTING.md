# Guide de Contribution

Merci de contribuer à RENZO! Ce guide vous aidera à démarrer.

## Table des Matières

1. [Setup Développement](#setup-développement)
2. [Workflow Git](#workflow-git)
3. [Ajout de Fonctionnalités](#ajout-de-fonctionnalités)
4. [Code Review](#code-review)
5. [Standards de Code](#standards-de-code)
6. [Testing](#testing)
7. [Documentation](#documentation)

## Setup Développement

### Prérequis

- Node.js ≥ 18
- npm ≥ 9
- Git
- Compte Supabase (pour DB locale)
- Compte Stripe (mode test)

### Installation

```bash
# 1. Clone le repo
git clone https://github.com/Largenty/renzo-immo.git
cd renzo-immo

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Edit .env.local with your values

# 4. Run development server
npm run dev
```

### Variables d'Environnement

Copiez `.env.example` vers `.env.local` et remplissez:

```bash
# Supabase (get from Supabase Dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe (get from Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# NanoBanana API (demander au maintainer)
NANOBANANA_API_KEY=...

# Sentry (optionnel)
SENTRY_DSN=...
```

### Database Setup

```bash
# Option 1: Use Supabase Cloud
# → Create project on supabase.com
# → Run migrations from supabase/ folder

# Option 2: Use Supabase Local
npx supabase init
npx supabase start
npx supabase db push
```

### Stripe Setup

1. Créer compte Stripe (mode test)
2. Créer 3 produits: STARTER, PRO, PREMIUM
3. Noter les Price IDs
4. Configurer webhook endpoint: `https://your-url.com/api/stripe/webhook`
5. Noter le webhook secret

Voir [STRIPE_SETUP.md](./STRIPE_SETUP.md) pour détails.

## Workflow Git

### Branches

**Main Branches**:
- `main` - Production (protected)
- `develop` - Development (protected)

**Feature Branches**:
- `feature/nom-feature` - Nouvelles fonctionnalités
- `fix/nom-bug` - Corrections de bugs
- `refactor/nom` - Refactoring
- `docs/nom` - Documentation

### Workflow

```bash
# 1. Créer une branche depuis develop
git checkout develop
git pull origin develop
git checkout -b feature/mon-feature

# 2. Faire vos modifications
git add .
git commit -m "feat(scope): description"

# 3. Push et créer Pull Request
git push origin feature/mon-feature
# → Créer PR sur GitHub: feature/mon-feature → develop
```

### Commit Messages

Format: `<type>(<scope>): <description>`

**Types**:
- `feat` - Nouvelle fonctionnalité
- `fix` - Correction bug
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Refactoring
- `perf` - Performance
- `test` - Tests
- `chore` - Build, deps, config

**Exemples**:

```bash
feat(credits): Add bulk discount for large packs
fix(auth): Prevent session timeout on slow networks
docs(architecture): Update hexagonal architecture diagram
refactor(images): Extract prompt building to separate service
test(credits): Add integration tests for reservation system
```

### Pull Requests

**Title**: Identique au commit principal

**Description Template**:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No console.log or debug code

## Screenshots (if applicable)
![Before](url)
![After](url)

## Related Issues
Closes #42
```

## Ajout de Fonctionnalités

### 1. Architecture Hexagonale

Suivre le pattern Ports & Adapters:

```
src/
├── domain/{feature}/
│   ├── models/           # Entities
│   ├── ports/            # Interfaces
│   ├── business-rules/   # Pure logic
│   ├── services/         # Domain services
│   └── index.ts          # Barrel export
├── infrastructure/
│   └── {adapter}.ts      # Implementation
├── application/{feature}/
│   └── use-{feature}.ts  # React Query hooks
└── presentation/features/{feature}/
    └── organisms/        # UI components
```

### 2. Exemple: Ajouter Feature "Comments"

#### Step 1: Domain Layer

**Create**: `src/domain/comments/models/comment.ts`

```typescript
export interface Comment {
  id: string
  userId: string
  projectId: string
  content: string
  createdAt: Date
}
```

**Create**: `src/domain/comments/ports/comments-repository.ts`

```typescript
export interface ICommentsRepository {
  create(data: CreateCommentData): Promise<Comment>
  getByProjectId(projectId: string): Promise<Comment[]>
  delete(id: string): Promise<void>
}
```

**Create**: `src/domain/comments/index.ts`

```typescript
export type { Comment } from './models/comment'
export type { ICommentsRepository } from './ports/comments-repository'
```

#### Step 2: Infrastructure Layer

**Create**: `src/infrastructure/supabase/comments.repository.ts`

```typescript
import type { ICommentsRepository } from '@/domain/comments/ports/comments-repository'

export class SupabaseCommentsRepository implements ICommentsRepository {
  constructor(private supabase: SupabaseClient) {}

  async create(data: CreateCommentData): Promise<Comment> {
    const { data: comment, error } = await this.supabase
      .from('comments')
      .insert(data)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return comment
  }

  // ... implement other methods
}
```

#### Step 3: Application Layer

**Create**: `src/application/comments/use-comments.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useProjectComments(projectId: string) {
  return useQuery({
    queryKey: ['comments', 'project', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/comments`)
      return response.json()
    },
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCommentData) => {
      const response = await fetch('/api/comments', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', 'project', variables.projectId],
      })
    },
  })
}
```

#### Step 4: API Routes

**Create**: `app/api/comments/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { SupabaseCommentsRepository } from '@/infrastructure/supabase/comments.repository'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export const POST = withAuth(async (request: NextRequest) => {
  const body = await request.json()
  const supabase = createRouteHandlerClient({ cookies })

  const repository = new SupabaseCommentsRepository(supabase)
  const comment = await repository.create({
    ...body,
    userId: request.user.id,
  })

  return NextResponse.json(comment, { status: 201 })
})
```

#### Step 5: Presentation Layer

**Create**: `src/presentation/features/comments/organisms/CommentsList.tsx`

```tsx
'use client'

import { useProjectComments } from '@/application/comments/use-comments'

interface Props {
  projectId: string
}

export function CommentsList({ projectId }: Props) {
  const { data: comments, isLoading } = useProjectComments(projectId)

  if (isLoading) return <Spinner />

  return (
    <div>
      {comments?.map(comment => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
    </div>
  )
}
```

#### Step 6: Database Migration

**Create**: `supabase/migrations/20251104_add_comments.sql`

```sql
-- Create comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_comments_project ON comments(project_id);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view comments on public projects"
ON comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = comments.project_id
    AND projects.is_public = true
  )
);

CREATE POLICY "Users can create comments"
ON comments FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

#### Step 7: Tests

**Create**: `src/domain/comments/__tests__/comments.test.ts`

```typescript
describe('CommentsRepository', () => {
  it('should create comment', async () => {
    const comment = await repository.create({
      userId: 'user-123',
      projectId: 'proj-123',
      content: 'Great work!',
    })

    expect(comment.content).toBe('Great work!')
  })
})
```

#### Step 8: Documentation

**Create**: `src/domain/comments/README.md`

```markdown
# Domain: Comments

## Overview
User comments on projects

## Responsibilities
- Create/read/delete comments
- Thread management (future)
- Moderation (future)

...
```

## Code Review

### En tant que Author

**Avant de créer la PR**:

1. ✅ Self-review du code
2. ✅ Tests ajoutés et passent
3. ✅ Pas de `console.log` ou code debug
4. ✅ Documentation mise à jour
5. ✅ Build réussit (`npm run build`)
6. ✅ Lint passe (`npm run lint`)
7. ✅ Types corrects (`npm run type-check`)

**Après feedback**:

- Répondre à tous les commentaires
- Appliquer les changements demandés
- Marquer les conversations comme résolues
- Re-demander review

### En tant que Reviewer

**Checklist**:

- [ ] Code suit les standards ([CODE_STANDARDS.md](./CODE_STANDARDS.md))
- [ ] Architecture hexagonale respectée
- [ ] Pas de dépendances circulaires
- [ ] Gestion d'erreurs appropriée
- [ ] Tests adéquats
- [ ] Performance acceptable
- [ ] Sécurité vérifiée
- [ ] Documentation claire

**Feedback constructif**:

✅ Good:
```
Je suggère d'extraire cette logique dans un service séparé pour améliorer
la testabilité. Exemple: `src/domain/credits/services/discount.service.ts`
```

❌ Bad:
```
Ce code est nul
```

## Standards de Code

Voir [CODE_STANDARDS.md](./CODE_STANDARDS.md) pour le guide complet.

**Highlights**:

- TypeScript strict mode
- No `any` type
- React Query pour data fetching
- Tailwind CSS pour styling
- Atomic SQL operations pour opérations critiques
- Zod pour validation
- Logger au lieu de console

## Testing

### Unit Tests

**Tester**: Business logic, pure functions

```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

### Integration Tests

**Tester**: API routes, repositories

```bash
npm run test:integration
```

### E2E Tests

**Tester**: Critical user flows

```bash
npm run test:e2e
```

## Documentation

### Quand documenter?

**TOUJOURS documenter**:

1. Nouvelle feature → Domain README
2. API publique → JSDoc
3. Architecture change → ARCHITECTURE.md
4. Setup complexe → Guide séparé

### Format

**Domain README**: Voir [src/domain/credits/README.md](../src/domain/credits/README.md) comme exemple

**JSDoc**: Pour fonctions publiques

```typescript
/**
 * Calculate credit cost for image generation
 *
 * @param quality - 'standard' (2 credits) or 'high' (3 credits)
 * @param count - Number of images
 * @returns Total credit cost
 */
export function calculateImageCost(quality: ImageQuality, count: number): number
```

## Questions?

- **Architecture**: Voir [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Navigation**: Voir [FILE_INDEX.md](./FILE_INDEX.md)
- **Stripe**: Voir [STRIPE_SETUP.md](./STRIPE_SETUP.md)
- **Issues**: GitHub Issues
- **Slack**: #renzo-dev (si applicable)

## Resources

### Documentation Externe

- [Next.js Docs](https://nextjs.org/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Interne

- [Architecture Guide](./ARCHITECTURE.md)
- [Code Standards](./CODE_STANDARDS.md)
- [File Navigation](./FILE_INDEX.md)
- Domain READMEs: [src/domain/*/README.md](../src/domain/)

---

**Merci de contribuer à RENZO!** 🚀

**Maintainer**: Dev Team
**Last Updated**: 2025-11-04
