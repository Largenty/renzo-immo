import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';

interface Project {
  id: string;
  name: string;
  address?: string;
  description?: string;
  coverImageUrl?: string;
  userId: string;
  totalImages: number;
  completedImages: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectsStore {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;

  // Actions
  fetchProjects: (userId: string, force?: boolean) => Promise<void>;
  createProject: (data: { name: string; description?: string; userId: string }) => Promise<Project | null>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  clearProjects: () => void;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

export const useProjectsStore = create<ProjectsStore>()(
  persist(
    immer((set, get) => ({
      projects: [],
      isLoading: false,
      error: null,
      lastFetch: null,

  fetchProjects: async (userId: string, force = false) => {
    const now = Date.now();
    const { lastFetch, projects } = get();

    // ✅ Cache TTL: ne re-fetch que si > 5 minutes ou force
    if (!force && lastFetch && projects.length > 0 && now - lastFetch < CACHE_TTL) {
      logger.debug('[ProjectsStore] Using cached data, skipping fetch');
      return;
    }

    set((state) => {
      state.isLoading = true;
      state.error = null;
    });

    try {
      const supabase = createClient();

      // ✅ UNE SEULE QUERY - Utilise les colonnes dénormalisées (total_images, completed_images)
      // Ces colonnes sont automatiquement maintenues par des triggers DB
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, address, description, cover_image_url, user_id, total_images, completed_images, created_at, updated_at, status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('updated_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Mapper directement les données dénormalisées (pas besoin de compter!)
      const fetchedProjects = projectsData.map(p => ({
        id: p.id,
        name: p.name,
        address: p.address,
        description: p.description,
        coverImageUrl: p.cover_image_url,
        userId: p.user_id,
        totalImages: p.total_images || 0,        // ✅ Déjà calculé par trigger!
        completedImages: p.completed_images || 0, // ✅ Déjà calculé par trigger!
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at),
      }));

      set((state) => {
        state.projects = fetchedProjects;
        state.isLoading = false;
        state.lastFetch = now;
      });

      logger.debug(`[ProjectsStore] Fetched ${fetchedProjects.length} projects (1 query, was N+1)`);
    } catch (error: any) {
      logger.error('[ProjectsStore] Error fetching projects:', error);
      set((state) => {
        state.error = error.message;
        state.isLoading = false;
      });
    }
  },

  createProject: async (data) => {
    set((state) => {
      state.isLoading = true;
      state.error = null;
    });

    try {
      const supabase = createClient();
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          name: data.name,
          description: data.description || null,
          user_id: data.userId,
        })
        .select()
        .single();

      if (error) throw error;

      const newProject: Project = {
        id: project.id,
        name: project.name,
        address: project.address,
        description: project.description,
        coverImageUrl: project.cover_image_url,
        userId: project.user_id,
        totalImages: 0,
        completedImages: 0,
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at),
      };

      // ✅ Immer: mutation directe, plus simple
      set((state) => {
        state.projects.unshift(newProject);
        state.isLoading = false;
      });

      return newProject;
    } catch (error: any) {
      logger.error('[ProjectsStore] Error creating project:', error);
      set((state) => {
        state.error = error.message;
        state.isLoading = false;
      });
      return null;
    }
  },

  updateProject: async (id, data) => {
    set((state) => {
      state.isLoading = true;
      state.error = null;
    });

    try {
      const supabase = createClient();
      const updateData: any = {};

      if (data.name) updateData.name = data.name;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.coverImageUrl !== undefined) updateData.cover_image_url = data.coverImageUrl;

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // ✅ Immer: mutation directe du projet trouvé
      set((state) => {
        const project = state.projects.find(p => p.id === id);
        if (project) {
          Object.assign(project, data);
          project.updatedAt = new Date();
        }
        state.isLoading = false;
      });
    } catch (error: any) {
      logger.error('[ProjectsStore] Error updating project:', error);
      set((state) => {
        state.error = error.message;
        state.isLoading = false;
      });
    }
  },

  deleteProject: async (id) => {
    set((state) => {
      state.isLoading = true;
      state.error = null;
    });

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // ✅ Immer: filter plus simple
      set((state) => {
        state.projects = state.projects.filter(p => p.id !== id);
        state.isLoading = false;
      });
    } catch (error: any) {
      logger.error('[ProjectsStore] Error deleting project:', error);
      set((state) => {
        state.error = error.message;
        state.isLoading = false;
      });
    }
  },

  clearProjects: () => {
    set((state) => {
      state.projects = [];
      state.isLoading = false;
      state.error = null;
      state.lastFetch = null;
    });
  },
    })),
    {
      name: 'renzo-projects-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        projects: state.projects,
        lastFetch: state.lastFetch,
      }),
    }
  )
);
