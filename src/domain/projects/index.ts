/**
 * Domaine Projects - Point d'entrée
 * Export tous les éléments publics du domaine
 */

// Models
export * from './models/project'

// Business Rules
export * from './business-rules/validate-project'

// Ports
export type { IProjectsRepository } from './ports/projects-repository'
export type { IProjectStorage } from './ports/project-storage'

// Services
export { ManageProjectsService } from './services/manage-projects'
export { GetProjectStatsService } from './services/get-project-stats'

// Hooks (React)
export {
  useProjects,
  useProject,
  useProjectStats,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useUserProjectsStats,
} from './hooks/use-projects'
