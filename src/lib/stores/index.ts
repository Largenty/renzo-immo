/**
 * Barrel export pour tous les Zustand stores
 */

// Auth Store
export {
  useAuthStore,
  useUser,
  useSession,
  useIsAuthenticated,
  useCreditsBalance,
} from './auth-store'
export type { UserData } from './auth-store'

// Styles Store
export {
  useStylesStore,
  useStyles,
  useStyleById,
  useStylesActions,
} from './styles-store'

// Upload Store
export {
  useUploadStore,
  useUploadFiles,
  useUploadStep,
  useUploadBulkMode,
  useUploadActions,
} from './upload-store'
export type { UploadedFile } from './upload-store'

// UI Preferences Store
export {
  useUIPreferencesStore,
  useTheme,
  useDensity,
  useSidebarCollapsed,
  useProjectsViewMode,
  useImagesViewMode,
} from './ui-preferences-store'
export type { Theme, ViewMode, DensityMode } from './ui-preferences-store'

// Notifications Store
export {
  useNotificationsStore,
  useNotifications,
  useUnreadCount,
  useNotificationActions,
} from './notifications-store'
export type { Notification, NotificationType, NotificationPosition } from './notifications-store'

// Activity Store
export {
  useActivityStore,
  useActivities,
  useRecentActivities,
  useActivityActions,
} from './activity-store'
export type { Activity, ActivityType } from './activity-store'
