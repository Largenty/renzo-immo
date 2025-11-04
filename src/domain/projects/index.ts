/**
 * Domaine Projects - Point d'entrée
 */

// Models
export * from './models/project'

// Business Rules
export * from './business-rules/validate-project'

// Ports
export type { IProjectsRepository } from './ports/projects-repository'

// Services
export { ManageProjectsService } from './services/manage-projects'

// Hooks (React) - Re-export from application layer
export {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from '@/application/projects/use-projects'
