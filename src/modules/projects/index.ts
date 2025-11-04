/**
 * Module Projects - Exports
 * Gestion des projets et de leurs images
 */

// Types
export * from './types'

// Hooks
export * from './hooks/use-projects'

// Components - Main
export { ProjectHeader } from './components/project-header'
export { ProjectForm } from './components/project-form'
export { ProjectStats } from './components/project-stats'
export { ImageCard } from './components/image-card'
export { ImageFilters } from './components/image-filters'
export { ShareProjectDialog } from './components/share-project-dialog'
export { EmptyState } from './components/empty-state'
export { ProjectNotFound } from './components/project-not-found'

// Components - Loading States
export { ProjectsListSkeleton } from './components/projects-list-skeleton'
export { ProjectLoadingSkeleton } from './components/project-loading-skeleton'

// API
export { SupabaseProjectsRepository } from './api/projects-repository.supabase'
export { SupabaseProjectStorage } from './api/project-storage.adapter'
