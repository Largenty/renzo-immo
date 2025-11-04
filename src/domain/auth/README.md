# Domain: Authentication

## Vue d'ensemble

Le domaine **Auth** gère tout ce qui concerne l'authentification et les utilisateurs de l'application.

## Responsabilités

- Authentification des utilisateurs (email/password, OAuth)
- Gestion des sessions
- Profils utilisateurs
- Rôles et permissions
- Changement de mot de passe

## Structure

```
auth/
├── models/
│   └── user.ts              # User entity
├── ports/
│   └── auth-provider.ts     # IAuthProvider interface
├── services/
│   └── auth.service.ts      # Authentication business logic
├── business-rules/
│   └── (empty)
└── index.ts                 # Barrel export
```

## Models

### User

```typescript
interface User {
  id: string
  email: string
  displayName?: string
  avatarUrl?: string
  role: 'user' | 'admin'
  creditsBalance: number
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}
```

**Règles métier**:
- Email unique et valide
- Display name optionnel (max 100 caractères)
- Role par défaut: 'user'
- Credits balance initialisé à 0
- Email verification requise pour certaines actions

## Ports (Interfaces)

### IAuthProvider

Interface abstraite pour l'authentification. Permet de changer de provider (Supabase → Auth0, Firebase, etc.) sans impacter le domaine.

```typescript
interface IAuthProvider {
  // Session management
  getCurrentUser(): Promise<User | null>
  getSession(): Promise<Session | null>

  // Email/Password
  signUp(email: string, password: string): Promise<User>
  signIn(email: string, password: string): Promise<Session>
  signOut(): Promise<void>

  // OAuth
  signInWithGoogle(): Promise<Session>

  // Password management
  resetPassword(email: string): Promise<void>
  updatePassword(newPassword: string): Promise<void>

  // Profile
  updateProfile(userId: string, data: Partial<User>): Promise<User>
}
```

## Services

### AuthService

Contient la logique métier autour de l'authentification.

**Méthodes**:
- `validateEmail(email: string): boolean` - Validation format email
- `validatePassword(password: string): { valid: boolean, errors: string[] }` - Validation force mot de passe
- `canAccessResource(user: User, resource: Resource): boolean` - Vérification permissions

## Implémentation

### Adapter Supabase

**Fichier**: [src/infrastructure/supabase/auth-provider.supabase.ts](../../../infrastructure/supabase/auth-provider.supabase.ts)

Implémente `IAuthProvider` avec Supabase Auth.

### Hooks React Query

**Fichier**: [src/application/auth/use-auth.ts](../../../application/auth/use-auth.ts)

Hooks pour consommer l'authentification dans les composants React:

```typescript
// Récupérer l'utilisateur courant
const { data: user, isLoading } = useCurrentUser()

// Login
const login = useLogin()
login.mutate({ email, password })

// Logout
const logout = useLogout()
logout.mutate()

// Signup
const signup = useSignup()
signup.mutate({ email, password, displayName })

// Google OAuth
const googleAuth = useGoogleAuth()
googleAuth.signInWithGoogle()
```

## API Routes

**Fichiers**:
- [app/api/auth/change-password/route.ts](../../../../app/api/auth/change-password/route.ts)
- [app/api/auth/logout/route.ts](../../../../app/api/auth/logout/route.ts)
- [app/api/auth/verify-password/route.ts](../../../../app/api/auth/verify-password/route.ts)

**Middleware**: Utilise `withAuth` pour protéger certaines routes.

## UI Components

**Fichiers**:
- [src/presentation/features/auth/organisms/login-form.tsx](../../../presentation/features/auth/organisms/login-form.tsx)
- [src/presentation/features/auth/organisms/signup-form.tsx](../../../presentation/features/auth/organisms/signup-form.tsx)
- [src/presentation/features/auth/molecules/password-input.tsx](../../../presentation/features/auth/molecules/password-input.tsx)

## Sécurité

### Password Requirements

- Minimum 8 caractères
- Au moins 1 majuscule
- Au moins 1 minuscule
- Au moins 1 chiffre
- Au moins 1 caractère spécial

**Validator**: [src/lib/validators/password-validator.ts](../../../lib/validators/password-validator.ts)

### Session Management

- JWT tokens stockés dans cookies HTTP-only
- Refresh automatique des tokens
- Expiration après 24h d'inactivité

### Row Level Security (RLS)

Supabase RLS garantit que:
- Users can only read/update their own profile
- Only admins can access other users' data

```sql
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);
```

## Flows

### Sign Up Flow

```
1. User submits form
2. Validate email/password format
3. Call authProvider.signUp()
4. Send verification email
5. User confirms email
6. Auto-login
7. Redirect to dashboard
```

### Sign In Flow

```
1. User submits credentials
2. Call authProvider.signIn()
3. Receive session + user
4. Store session in cookies
5. Invalidate React Query cache
6. Redirect to dashboard
```

### Password Reset Flow

```
1. User requests reset
2. Call authProvider.resetPassword(email)
3. Receive reset link by email
4. User clicks link
5. Redirect to reset page
6. User enters new password
7. Call authProvider.updatePassword()
8. Auto-login
```

## Testing

### Unit Tests

```typescript
describe('AuthService', () => {
  describe('validateEmail', () => {
    it('should accept valid emails', () => {
      expect(validateEmail('user@example.com')).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false)
    })
  })
})
```

### Integration Tests

```typescript
describe('POST /api/auth/change-password', () => {
  it('should require authentication', async () => {
    const response = await POST({ password: 'newpass' })
    expect(response.status).toBe(401)
  })

  it('should update password when authenticated', async () => {
    // Mock authenticated user
    const response = await POST({ password: 'NewPass123!' })
    expect(response.status).toBe(200)
  })
})
```

## Common Pitfalls

### ❌ Bad: Checking auth in component

```typescript
const user = supabase.auth.getUser() // Direct call
```

### ✅ Good: Use React Query hook

```typescript
const { data: user } = useCurrentUser() // Cached, reactive
```

### ❌ Bad: Storing password in state

```typescript
const [password, setPassword] = useState('') // Insecure
```

### ✅ Good: Use form library

```typescript
const { register } = useForm() // Secure, no state
<input {...register('password')} type="password" />
```

## Troubleshooting

### "User not found" après signup

**Cause**: Email non vérifié

**Solution**: Vérifier email ou désactiver email verification en dev

### Session expired trop rapidement

**Cause**: Configuration Supabase

**Solution**: Augmenter JWT expiry dans Supabase Dashboard

### OAuth redirect ne fonctionne pas

**Cause**: URL de callback non configurée

**Solution**: Ajouter callback URL dans Supabase OAuth settings

## Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js Auth Best Practices](https://nextjs.org/docs/authentication)
- [OWASP Auth Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Maintainer**: Dev Team
**Last Updated**: 2025-11-04
