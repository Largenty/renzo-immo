/**
 * Module Projects - Exports
 * Gestion des projets et de leurs images
 */

// Types
export * from './types'

// Hooks
export * from './ui/hooks/use-projects'

// Components - Main
export { ProjectHeader } from './ui/components/project-header'
export { ProjectStats as ProjectStatsComponent } from './ui/components/project-stats'
export { ProjectCard } from './ui/components/project-card'
export { ImageCard } from './ui/components/image-card'
export { ImageFilters } from './ui/components/image-filters'
export { ShareProjectDialog } from './ui/components/share-project-dialog'
export { ProjectNotFound } from './ui/components/project-not-found'
export { EditProjectHeader } from './ui/components/edit-project-header'
export { EditProjectLoadingState } from './ui/components/edit-project-loading-state'
export { ProjectCoverBanner } from './ui/components/project-cover-banner'

// Forms - New (React Hook Form)
export { NewProjectForm } from './ui/forms/NewProjectForm'
export { EditProjectForm } from './ui/forms/EditProjectForm'

// Components - Loading States
export { ProjectsListSkeleton } from './ui/components/projects-list-skeleton'
export { ProjectLoadingSkeleton } from './ui/components/project-loading-skeleton'

// API
export { SupabaseProjectsRepository } from './api/projects.repository'
export { SupabaseProjectStorage } from './api/project-storage.adapter'

// Services
export { ManageProjectsService } from './services/manage-projects'
export { GetProjectStatsService } from './services/get-project-stats'

// Utils
export * from './utils/validate-project'

// Additional Components
export { ImageGridCard } from './ui/components/image-grid-card'
export { ImageViewerDialog } from './ui/components/image-viewer-dialog'
export { ImageDeleteDialog } from './ui/components/image-delete-dialog'
export { DeleteProjectDialog } from './ui/components/delete-project-dialog'

// Components from shared moved here
export { ImageComparison } from './ui/components/image-comparison'
export { ImageComparisonSlider } from './ui/components/image-comparison-slider'
export { ImageHistory } from './ui/components/image-history'
export { ShareDialog } from './ui/components/share-dialog'
export { StatusBadge, type StatusType } from './ui/components/status-badge'
