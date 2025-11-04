/**
 * Shared - Exports
 * Composants, hooks et utilitaires réutilisables partout
 */

// UI Components (shadcn/ui + custom)
export { Button } from './components/button'
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/card'
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './components/dialog'
export { Input } from './components/input'
export { Label } from './components/label'
export { Textarea } from './components/textarea'
export { Badge } from './components/badge'
export { Separator } from './components/separator'
export { Toaster } from './components/toaster'
export { toast } from './hooks/use-toast'

// Layout Components
export { Navbar } from './components/navbar'
export { Footer } from './components/footer'

// Providers
export { QueryProvider } from './components/query-provider'
export { AuthProvider } from './components/auth-provider'

// Hooks
export { useToast } from './hooks/use-toast'
export { useMediaQuery } from './hooks/use-media-query'

// Utils
export { cn } from './utils/utils'
