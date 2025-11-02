# Guide d'utilisation des API Helpers

Ce document explique comment utiliser les helpers réutilisables pour simplifier le code de vos routes API.

## 📚 Helpers disponibles

### 1. `requireAuth(supabase)`

Vérifie l'authentification et retourne l'utilisateur authentifié.

**Avant :**
```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Après :**
```typescript
import { requireAuth, withErrorHandling } from '@/lib/api/helpers';

const user = await requireAuth(supabase); // Throw ApiError si non authentifié
```

---

### 2. `requireEmailVerification(user)`

Vérifie que l'email de l'utilisateur est confirmé.

```typescript
const user = await requireAuth(supabase);
await requireEmailVerification(user); // Throw ApiError 403 si email non vérifié
```

---

### 3. `withErrorHandling(handler, routeName)`

Wrapper pour gérer automatiquement les erreurs.

**Avant :**
```typescript
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ... logique métier

    return NextResponse.json({ data });
  } catch (error) {
    logger.error('[GET /api/furniture] Unexpected error', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Après :**
```typescript
import { withErrorHandling, requireAuth } from '@/lib/api/helpers';
import { createClient } from '@/lib/supabase/server';

export const GET = withErrorHandling(async (request: NextRequest) => {
  const supabase = await createClient();
  const user = await requireAuth(supabase); // Throw ApiError si non authentifié

  // ... logique métier

  return NextResponse.json({ data });
}, 'GET /api/furniture');
```

---

### 4. `getPagination(searchParams)` et `formatPaginationResponse()`

Helpers pour la pagination.

```typescript
import { getPagination, formatPaginationResponse, withErrorHandling, requireAuth } from '@/lib/api/helpers';

export const GET = withErrorHandling(async (request: NextRequest) => {
  const supabase = await createClient();
  const user = await requireAuth(supabase);

  // Parser les paramètres de pagination
  const { page, limit, offset } = getPagination(request.nextUrl.searchParams);

  // Requête avec pagination
  const { data, count, error } = await supabase
    .from('furniture_catalog')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .range(offset, offset + limit - 1);

  if (error) throw new ApiError('Database error', 500);

  return NextResponse.json({
    furniture: data,
    pagination: formatPaginationResponse(page, limit, count),
  });
}, 'GET /api/furniture');
```

**Réponse :**
```json
{
  "furniture": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3,
    "hasMore": true
  }
}
```

---

### 5. `requireOwnership(supabase, tableName, resourceId, userId)`

Vérifie que la ressource appartient à l'utilisateur.

```typescript
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const supabase = await createClient();
  const user = await requireAuth(supabase);

  // Vérifier que l'utilisateur est propriétaire
  await requireOwnership(
    supabase,
    'furniture_catalog',
    params.id,
    user.id,
    'Furniture'
  );

  // Supprimer la ressource
  const { error } = await supabase
    .from('furniture_catalog')
    .delete()
    .eq('id', params.id);

  if (error) throw new ApiError('Failed to delete furniture', 500);

  return NextResponse.json({ success: true });
}, 'DELETE /api/furniture/:id');
```

---

### 6. `isValidRedirectPath(path)`

Valide qu'un chemin de redirection est sûr (protection contre Open Redirect).

```typescript
import { isValidRedirectPath } from '@/lib/api/helpers';

const rawNext = searchParams.get('next') || '/dashboard';
const next = isValidRedirectPath(rawNext) ? rawNext : '/dashboard';

return NextResponse.redirect(`${origin}${next}`);
```

**Exemples de validation :**
- ✅ `/dashboard` → Valide
- ✅ `/projects/123` → Valide
- ❌ `//evil.com` → Invalide (bloqué)
- ❌ `https://evil.com` → Invalide (bloqué)
- ❌ `\\evil.com` → Invalide (bloqué)

---

### 7. `requireEmail(email)`

Valide qu'un email est présent et valide.

```typescript
import { requireEmail } from '@/lib/api/helpers';

const email = requireEmail(data.user.email); // Throw ApiError si invalide
```

---

## 🎯 Exemple complet : Route CRUD optimisée

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  withErrorHandling,
  requireAuth,
  getPagination,
  formatPaginationResponse,
  requireOwnership,
  ApiError,
} from '@/lib/api/helpers';

// GET /api/furniture - Liste avec pagination
export const GET = withErrorHandling(async (request: NextRequest) => {
  const supabase = await createClient();
  const user = await requireAuth(supabase);

  const { page, limit, offset } = getPagination(request.nextUrl.searchParams);

  const { data, count, error } = await supabase
    .from('furniture_catalog')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .range(offset, offset + limit - 1);

  if (error) throw new ApiError('Database error', 500);

  return NextResponse.json({
    furniture: data,
    pagination: formatPaginationResponse(page, limit, count),
  });
}, 'GET /api/furniture');

// DELETE /api/furniture/:id - Suppression avec vérification ownership
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const supabase = await createClient();
  const user = await requireAuth(supabase);

  // Vérifier l'ownership
  await requireOwnership(
    supabase,
    'furniture_catalog',
    params.id,
    user.id,
    'Furniture'
  );

  const { error } = await supabase
    .from('furniture_catalog')
    .delete()
    .eq('id', params.id);

  if (error) throw new ApiError('Failed to delete furniture', 500);

  return NextResponse.json({ success: true });
}, 'DELETE /api/furniture/:id');
```

---

## 📊 Bénéfices

| Aspect | Avant | Après |
|--------|-------|-------|
| **Lignes de code** | ~15 lignes pour auth + error handling | ~3 lignes |
| **Duplication** | Code répété dans chaque route | Helpers réutilisables |
| **Sécurité** | Facile d'oublier des validations | Validations systématiques |
| **Lisibilité** | Try/catch verbeux | Code métier clair |
| **Maintenance** | Changements dans N fichiers | Changement centralisé |

---

## 🚀 Migration progressive

Vous n'avez pas besoin de tout migrer d'un coup :

1. **Commencez par les nouvelles routes** : Utilisez les helpers dès maintenant
2. **Migrez les routes critiques** : Auth, paiements, données sensibles
3. **Migrez progressivement** : Route par route selon vos besoins

---

## ⚠️ Notes importantes

- Les helpers utilisent `ApiError` qui est automatiquement gérée par `withErrorHandling`
- Ne pas utiliser `try/catch` autour des helpers dans une route avec `withErrorHandling`
- Les `ApiError` sont loggées automatiquement avec le bon niveau (warn pour 4xx, error pour 5xx)
