/**
 * Dialogs centralisés
 *
 * Organisation:
 * - Primitives: Wrappers Radix UI de base
 * - Common: Composants réutilisables (delete, confirm, share)
 * - Feature-specific: Dans leurs dossiers respectifs
 */

// Common dialogs
export { DeleteDialog } from './delete-dialog';

// Re-export primitives from UI
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
