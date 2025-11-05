# Code Standards & Best Practices

## Vue d'ensemble

Ce document définit les standards de code et les meilleures pratiques pour le projet RENZO.

## Table des Matières

1. [TypeScript](#typescript)
2. [React & Next.js](#react--nextjs)
3. [Architecture](#architecture)
4. [State Management](#state-management)
5. [API Routes](#api-routes)
6. [Database](#database)
7. [Error Handling](#error-handling)
8. [Testing](#testing)
9. [Styling](#styling)
10. [Performance](#performance)

## TypeScript

### Strictness

**Configuration**: `tsconfig.json` avec `strict: true`

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

### Type vs Interface

**✅ Utiliser `interface` pour**:
- Définir des objets et des contrats
- Quand l'extension est probable

```typescript
// ✅ Good
interface User {
  id: string
  email: string
}

interface AdminUser extends User {
  permissions: string[]
}
```

**✅ Utiliser `type` pour**:
- Unions, intersections, primitives
- Types complexes et mapped types

```typescript
// ✅ Good
type Status = 'pending' | 'completed' | 'failed'
type Result<T> = { success: true; data: T } | { success: false; error: string }
```

### Any is Forbidden

**❌ Never use `any`**:

```typescript
// ❌ Bad
function process(data: any) { ... }

// ✅ Good
function process<T extends Record<string, unknown>>(data: T) { ... }
// or
function process(data: unknown) { ... }
```

### Naming Conventions

**Interfaces & Types**: PascalCase

```typescript
interface CreditTransaction { ... }
type ImageStatus = 'pending' | 'completed'
```

**Functions & Variables**: camelCase

```typescript
const getUserBalance = (userId: string) => { ... }
let creditBalance = 0
```

**Constants**: UPPER_SNAKE_CASE

```typescript
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const API_BASE_URL = process.env.API_URL
```

**Components**: PascalCase

```typescript
function ImageUploader() { ... }
const ProjectCard = ({ project }: Props) => { ... }
```

**Files**:
- Components: `PascalCase.tsx` (ex: `ImageUploader.tsx`)
- Utilities: `kebab-case.ts` (ex: `credit-calculator.ts`)
- Hooks: `use-*.ts` (ex: `use-projects.ts`)

## React & Next.js

### Component Structure

**Ordre des éléments**:

```typescript
'use client' // Si client component

// 1. Imports
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Types
interface Props {
  projectId: string
}

// 3. Constants
const MAX_RETRIES = 3

// 4. Component
export function ComponentName({ projectId }: Props) {
  // 4.1. Hooks
  const [isOpen, setIsOpen] = useState(false)
  const { data } = useQuery({ ... })

  // 4.2. Handlers
  const handleClick = () => { ... }

  // 4.3. Effects
  useEffect(() => { ... }, [])

  // 4.4. Render
  return (
    <div>...</div>
  )
}

// 5. Sub-components (if any)
function SubComponent() { ... }
```

### Client vs Server Components

**✅ Server Components (default)**:
- No state, no effects, no browser APIs
- Can directly query database
- Better performance, less JS

```typescript
// ✅ Server Component (no 'use client')
async function ProjectsList() {
  const projects = await getProjects() // Direct DB call

  return (
    <div>
      {projects.map(p => <ProjectCard key={p.id} project={p} />)}
    </div>
  )
}
```

**✅ Client Components**:
- Need state, effects, event handlers
- Use browser APIs
- Interactive components

```typescript
'use client'

function ImageUploader() {
  const [file, setFile] = useState<File | null>(null)

  return (
    <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
  )
}
```

### Hooks Rules

**Always use React Query for data fetching**:

```typescript
// ❌ Bad
const [data, setData] = useState([])
useEffect(() => {
  fetch('/api/projects').then(r => r.json()).then(setData)
}, [])

// ✅ Good
const { data } = useQuery({
  queryKey: ['projects'],
  queryFn: () => fetch('/api/projects').then(r => r.json()),
})
```

**Custom hooks naming**: Start with `use`

```typescript
// ✅ Good
function useProjectImages(projectId: string) {
  return useQuery({
    queryKey: ['images', 'project', projectId],
    queryFn: () => fetchProjectImages(projectId),
  })
}
```

### Props Destructuring

**✅ Always destructure props**:

```typescript
// ❌ Bad
function Component(props) {
  return <div>{props.title}</div>
}

// ✅ Good
function Component({ title }: { title: string }) {
  return <div>{title}</div>
}

// ✅ Even better (with interface)
interface Props {
  title: string
  description?: string
}

function Component({ title, description }: Props) {
  return (
    <div>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  )
}
```

## Architecture

### Hexagonal Architecture (Ports & Adapters)

**Dependency Rule**: Inner layers NEVER depend on outer layers

```
Domain → Application → Infrastructure
  ↑         ↑              ↑
  NO        NO           YES (can import from inner)
```

**✅ Good**:

```typescript
// domain/credits/ports/credits-repository.ts
export interface ICreditsRepository {
  getBalance(userId: string): Promise<number>
}

// infrastructure/supabase/credits.repository.ts
import type { ICreditsRepository } from '@/domain/credits/ports/credits-repository'

export class SupabaseCreditsRepository implements ICreditsRepository {
  async getBalance(userId: string): Promise<number> {
    // Supabase implementation
  }
}
```

**❌ Bad**:

```typescript
// domain/credits/models/credit.ts
import { supabase } from '@/lib/supabase' // ❌ Domain importing infrastructure!
```

### Barrel Exports

**✅ Always use index.ts** for domain exports:

```typescript
// domain/credits/index.ts
export type { CreditPack, CreditTransaction } from './models/credit-pack'
export type { ICreditsRepository } from './ports/credits-repository'
export { calculateImageCost } from './business-rules/credit-cost'
```

**Usage**:

```typescript
// ✅ Good
import { CreditPack, calculateImageCost } from '@/domain/credits'

// ❌ Bad
import { CreditPack } from '@/domain/credits/models/credit-pack'
import { calculateImageCost } from '@/domain/credits/business-rules/credit-cost'
```

## State Management

### React Query ONLY

**We use React Query for ALL state management**:
- Server state: React Query
- UI state: useState, useReducer
- Form state: React Hook Form (if needed)

**✅ DO NOT use**:
- ❌ Zustand
- ❌ Redux
- ❌ Jotai
- ❌ Recoil

### Query Keys Convention

**Structure**: `['domain', 'entity', ...params]`

```typescript
// ✅ Good
queryKey: ['credits', 'balance', userId]
queryKey: ['projects', 'list']
queryKey: ['images', 'project', projectId]
queryKey: ['images', 'status', imageId]

// ❌ Bad
queryKey: ['balance'] // Too generic
queryKey: [userId, 'balance'] // Wrong order
queryKey: 'balance' // Should be array
```

### Mutations & Invalidation

**Always invalidate related queries**:

```typescript
const createProject = useMutation({
  mutationFn: createProjectApi,
  onSuccess: () => {
    // Invalidate projects list
    queryClient.invalidateQueries({ queryKey: ['projects', 'list'] })
  },
})
```

## API Routes

### Middleware Composition

**Always use middleware for cross-cutting concerns**:

```typescript
// ✅ Good
export const POST = withAuth(
  withCredits(
    async (request) => {
      // Handler logic
    },
    { creditCost: 2, operation: 'Image generation' }
  )
)

// ❌ Bad
export const POST = async (request: NextRequest) => {
  // Manual auth check
  const user = await getUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Manual credit check
  const balance = await getBalance(user.id)
  if (balance < 2) return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })

  // Handler logic
}
```

### Error Responses

**Consistent error format**:

```typescript
// ✅ Good
return NextResponse.json(
  {
    error: 'Error type',
    message: 'User-friendly message',
    details: { ... }, // Optional
  },
  { status: 400 }
)

// ❌ Bad
return NextResponse.json('Error', { status: 400 }) // String response
return NextResponse.json({ msg: 'Error' }, { status: 400 }) // Inconsistent key
```

### Status Codes

Use appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `402` - Payment Required (insufficient credits)
- `403` - Forbidden (authenticated but not authorized)
- `404` - Not Found
- `409` - Conflict (duplicate)
- `422` - Unprocessable Entity (semantic error)
- `500` - Internal Server Error

### Validation

**Always validate input with Zod**:

```typescript
import { z } from 'zod'

const schema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1).max(100),
  imageUrl: z.string().url(),
})

export const POST = withAuth(async (request) => {
  const body = await request.json()

  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: result.error.issues,
      },
      { status: 400 }
    )
  }

  // Use validated data
  const { projectId, name, imageUrl } = result.data
})
```

## Database

### Supabase Patterns

**Always use RLS (Row Level Security)**:

```sql
-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own projects
CREATE POLICY "Users view own projects"
ON projects FOR SELECT
USING (auth.uid() = user_id);
```

### Atomic Operations

**Use SQL functions for critical operations**:

```typescript
// ✅ Good: Atomic credit deduction
const { data, error } = await supabase.rpc('deduct_user_credits', {
  p_user_id: userId,
  p_amount: amount,
})

// ❌ Bad: Race condition
const balance = await getBalance(userId)
if (balance >= amount) {
  await updateBalance(userId, balance - amount) // ⚠️ Race condition!
}
```

### Migrations

**Always use migrations** (never modify DB manually):

```sql
-- supabase/migrations/20251104_add_feature.sql
ALTER TABLE users ADD COLUMN new_field VARCHAR(100);

-- Create index
CREATE INDEX idx_users_new_field ON users(new_field);
```

## Error Handling

### Try-Catch Pattern

```typescript
try {
  const result = await someOperation()
  return NextResponse.json(result)
} catch (error) {
  // Log error
  logger.error('Operation failed', { error, context: { userId } })

  // Return user-friendly error
  return NextResponse.json(
    {
      error: 'Operation failed',
      message: 'Une erreur est survenue. Veuillez réessayer.',
    },
    { status: 500 }
  )
}
```

### Error Logging

**Always use logger, never console**:

```typescript
// ✅ Good
import { logger } from '@/lib/logger'

logger.error('Failed to generate image', { error, userId, projectId })
logger.warn('Slow query detected', { duration: 5000 })
logger.info('User logged in', { userId })
logger.debug('Debug info', { data })

// ❌ Bad
console.log('Error:', error) // Use logger instead
console.error(error) // Use logger.error instead
```

### Sentry Integration

**Capture errors for monitoring**:

```typescript
import * as Sentry from '@sentry/nextjs'

try {
  // operation
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'image-generation' },
    user: { id: userId },
    extra: { projectId, imageId },
  })

  throw error
}
```

## Testing

### Unit Tests

**Test business logic in domain layer**:

```typescript
// domain/credits/business-rules/credit-cost.test.ts
import { calculateImageCost } from './credit-cost'

describe('calculateImageCost', () => {
  it('should calculate standard quality cost', () => {
    expect(calculateImageCost('standard', 1)).toBe(2)
  })

  it('should calculate high quality cost', () => {
    expect(calculateImageCost('high', 1)).toBe(3)
  })

  it('should multiply by count', () => {
    expect(calculateImageCost('standard', 5)).toBe(10)
  })
})
```

### Integration Tests

**Test API routes**:

```typescript
describe('POST /api/generate-image', () => {
  it('should require authentication', async () => {
    const response = await POST({ ... })
    expect(response.status).toBe(401)
  })

  it('should reject insufficient credits', async () => {
    // Mock user with 0 credits
    const response = await POST({ ... })
    expect(response.status).toBe(402)
  })

  it('should generate image with valid input', async () => {
    const response = await POST({ ... })
    expect(response.status).toBe(200)
  })
})
```

## Styling

### Tailwind CSS

**Use Tailwind utility classes**:

```tsx
// ✅ Good
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-900">Title</h2>
</div>

// ❌ Bad (custom CSS)
<div className="custom-card">
  <h2 className="custom-title">Title</h2>
</div>
```

### Class Organization

**Use `cn()` helper for conditional classes**:

```typescript
import { cn } from '@/lib/utils'

<button
  className={cn(
    "px-4 py-2 rounded-md font-medium", // Base styles
    "hover:bg-opacity-90 transition-colors", // Hover & transitions
    isActive && "bg-blue-500 text-white", // Conditional
    isPending && "opacity-50 cursor-not-allowed", // State
    className // Allow override
  )}
>
```

### Responsive Design

**Mobile-first approach**:

```tsx
<div className="
  flex flex-col        // Mobile: stack
  md:flex-row          // Tablet+: row
  gap-4                // Mobile: 1rem gap
  md:gap-6             // Tablet+: 1.5rem gap
">
```

## Performance

### Image Optimization

**Always use Next.js Image component**:

```tsx
import Image from 'next/image'

// ✅ Good
<Image
  src={imageUrl}
  alt="Description"
  width={1920}
  height={1080}
  loading="lazy"
  quality={85}
/>

// ❌ Bad
<img src={imageUrl} alt="Description" />
```

### Code Splitting

**Use dynamic imports for heavy components**:

```typescript
import dynamic from 'next/dynamic'

// ✅ Good: Load heavy component only when needed
const ImageEditor = dynamic(() => import('./ImageEditor'), {
  loading: () => <Spinner />,
  ssr: false, // If client-only
})
```

### React Query Optimization

**Configure stale time and cache time**:

```typescript
useQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  staleTime: 5 * 60 * 1000,    // 5min - data considered fresh
  gcTime: 10 * 60 * 1000,      // 10min - keep in cache
  refetchOnWindowFocus: false,  // Don't refetch on every focus
})
```

### Memoization

**Use useMemo for expensive computations**:

```typescript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])

// ❌ Bad: Recomputed every render
const expensiveValue = computeExpensiveValue(data)
```

## Comments

### When to Comment

**✅ DO comment**:
- Complex business logic
- Non-obvious code
- Workarounds
- TODOs

```typescript
// ✅ Good
// Apply 10% discount for bulk orders (business rule BR-042)
if (quantity >= 10) {
  total *= 0.9
}

// Workaround: NanoBanana API requires presigned URLs (expires in 24h)
const presignedUrl = await generatePresignedUrl(imageUrl, 24 * 60 * 60)
```

**❌ DON'T comment**:
- Obvious code
- What the code does (code should be self-documenting)

```typescript
// ❌ Bad
// Increment counter by 1
counter += 1

// Set user name to the name
user.name = name
```

### JSDoc for Public APIs

**Document exported functions**:

```typescript
/**
 * Calculate the cost of generating images
 *
 * @param quality - Image quality: 'standard' (2 credits) or 'high' (3 credits)
 * @param count - Number of images to generate
 * @returns Total credit cost
 *
 * @example
 * calculateImageCost('high', 5) // Returns 15
 */
export function calculateImageCost(
  quality: 'standard' | 'high',
  count: number = 1
): number {
  const baseCost = quality === 'high' ? 3 : 2
  return baseCost * count
}
```

## Git Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Refactoring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Build, dependencies, tooling

### Examples

```
feat(credits): Add reservation system for atomic credit deduction

Implement reserve/confirm/cancel pattern to prevent race conditions
and ensure automatic refunds on failures.

Closes #42
```

```
fix(auth): Prevent session expiry on page refresh

Store refresh token in HTTP-only cookie and automatically
refresh expired sessions.

Fixes #38
```

## Security Checklist

- [ ] Never commit secrets (.env in .gitignore)
- [ ] Always validate user input (Zod schemas)
- [ ] Use RLS for database access control
- [ ] Sanitize prompts (remove blocked words)
- [ ] Rate limit API endpoints
- [ ] Use HTTPS only
- [ ] Set secure cookie flags (httpOnly, secure, sameSite)
- [ ] Validate file uploads (type, size)
- [ ] Use atomic SQL operations for critical data

---

**Maintainer**: Dev Team
**Last Updated**: 2025-11-04
