/**
 * Projects Store - Zustand
 * Gère les projets de l'utilisateur
 */

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface Project {
  id: string
  user_id: string
  name: string
  address?: string
  description?: string
  cover_image_url?: string
  total_images?: number
  completed_images?: number
  created_at: string
  updated_at: string
}

interface ProjectsState {
  // État
  projects: Project[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchProjects: () => Promise<void>
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => Promise<void>
  getProjectById: (id: string) => Project | undefined
  reset: () => void
}

/**
 * Store pour gérer les projets
 */
export const useProjectsStore = create<ProjectsState>()((set, get) => ({
  // État initial
  projects: [],
  isLoading: false,
  error: null,

  // Récupérer tous les projets depuis Supabase
  fetchProjects: async () => {
    set({ isLoading: true, error: null })

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ projects: data || [], isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      toast.error('Erreur lors du chargement des projets')
    }
  },

  // Ajouter un projet localement (après création)
  addProject: (project) => {
    set((state) => ({
      projects: [project, ...state.projects],
    }))
  },

  // Mettre à jour un projet localement
  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id
          ? { ...project, ...updates, updated_at: new Date().toISOString() }
          : project
      ),
    }))
  },

  // Supprimer un projet
  deleteProject: async (id) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        projects: state.projects.filter((project) => project.id !== id),
      }))

      toast.success('Projet supprimé')
    } catch (error: any) {
      toast.error('Erreur lors de la suppression')
      throw error
    }
  },

  // Récupérer un projet par ID
  getProjectById: (id) => {
    return get().projects.find((project) => project.id === id)
  },

  // Réinitialiser le store
  reset: () => {
    set({ projects: [], isLoading: false, error: null })
  },
}))

/**
 * Sélecteurs utiles
 */
export const useProjects = () => useProjectsStore((state) => ({
  projects: state.projects,
  isLoading: state.isLoading,
  error: state.error,
}))

export const useProjectById = (id: string | null) => {
  return useProjectsStore((state) =>
    id ? state.getProjectById(id) : null
  )
}

export const useProjectsActions = () => useProjectsStore((state) => ({
  addProject: state.addProject,
  updateProject: state.updateProject,
  deleteProject: state.deleteProject,
  fetchProjects: state.fetchProjects,
}))
