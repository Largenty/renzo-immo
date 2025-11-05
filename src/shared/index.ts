/**
 * Shared - Exports
 * Design system et composants réutilisables
 */

// ============================================================================
// UI PRIMITIVES (shadcn/ui + custom)
// ============================================================================

// Forms
export { Button, buttonVariants } from './ui/button'
export { Input } from './ui/input'
export { Textarea } from './ui/textarea'
export { Label } from './ui/label'
export { Checkbox } from './ui/checkbox'
export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'
export { Slider } from './ui/slider'
export { Switch } from './ui/switch'

// Overlays
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog'
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from './ui/alert-dialog'
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from './ui/dropdown-menu'

// Feedback
export { toast } from './hooks/use-toast'
export { Toaster } from './ui/toaster'

// Data Display
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card'
export { Badge } from './ui/badge'
export { Separator } from './ui/separator'
export { Skeleton } from './ui/skeleton'

// Utility Components
export { IconButton } from './ui/icon-button'
export { ConfirmDialog } from './ui/confirm-dialog'
export { DeleteConfirmDialog } from './ui/delete-confirm-dialog'
export { EmptyState } from './ui/empty-state'
export { ErrorBoundary } from './ui/error-boundary'
export { LogoutModal } from './ui/logout-modal'
export { InfoCard } from './ui/info-card'
export { TipsList } from './ui/tips-list'
export { BeforeAfter } from './ui/before-after'

// Settings Components
export { SettingsTabs } from './ui/settings-tabs'
export { ProfileSettingsSection, type ProfileFormData } from './ui/profile-settings-section'
export { AccountSettingsSection } from './ui/account-settings-section'
export { BillingSettingsSection } from './ui/billing-settings-section'

// Landing Page Sections
export { Hero } from './ui/sections/hero'
export { HowItWorks } from './ui/sections/how-it-works'
export { Solutions } from './ui/sections/solutions'
export { Pricing } from './ui/sections/pricing'
export { ContactCTA } from './ui/sections/contact-cta'
export { Showcase } from './ui/sections/showcase'

// ============================================================================
// LAYOUT
// ============================================================================
export { Navbar } from './layout/navbar'
export { Footer } from './layout/footer'
export { ConditionalLayout } from './layout/conditional-layout'
export { PageHeader } from './layout/page-header'
export { StatCard } from './layout/stat-card'

// ============================================================================
// PROVIDERS
// ============================================================================
export { QueryProvider } from './providers/query-provider'
export { AuthProvider } from './providers/auth-provider'

// ============================================================================
// HOOKS
// ============================================================================
export { useToast } from './hooks/use-toast'

// ============================================================================
// UTILS
// ============================================================================
export { cn } from './utils/utils'
