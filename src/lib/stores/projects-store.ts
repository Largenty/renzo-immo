import { create } from 'zustand';
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

  // Actions
  fetchProjects: (userId: string) => Promise<void>;
  createProject: (data: { name: string; description?: string; userId: string }) => Promise<Project | null>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  clearProjects: () => void;
}

export const useProjectsStore = create<ProjectsStore>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchProjects: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const supabase = createClient();

      // Récupérer les projets
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Pour chaque projet, compter les images
      const projectsWithCounts = await Promise.all(
        projectsData.map(async (p) => {
          const { count: totalCount } = await supabase
            .from('images')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', p.id);

          const { count: completedCount } = await supabase
            .from('images')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', p.id)
            .eq('status', 'completed');

          return {
            id: p.id,
            name: p.name,
            address: p.address,
            description: p.description,
            coverImageUrl: p.cover_image_url,
            userId: p.user_id,
            totalImages: totalCount || 0,
            completedImages: completedCount || 0,
            createdAt: new Date(p.created_at),
            updatedAt: new Date(p.updated_at),
          };
        })
      );

      set({
        projects: projectsWithCounts,
        isLoading: false,
      });
    } catch (error: any) {
      logger.error('[ProjectsStore] Error fetching projects:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  createProject: async (data) => {
    set({ isLoading: true, error: null });

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

      set({
        projects: [newProject, ...get().projects],
        isLoading: false,
      });

      return newProject;
    } catch (error: any) {
      logger.error('[ProjectsStore] Error creating project:', error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  updateProject: async (id, data) => {
    set({ isLoading: true, error: null });

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

      set({
        projects: get().projects.map(p =>
          p.id === id ? { ...p, ...data, updatedAt: new Date() } : p
        ),
        isLoading: false,
      });
    } catch (error: any) {
      logger.error('[ProjectsStore] Error updating project:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set({
        projects: get().projects.filter(p => p.id !== id),
        isLoading: false,
      });
    } catch (error: any) {
      logger.error('[ProjectsStore] Error deleting project:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  clearProjects: () => {
    set({ projects: [], isLoading: false, error: null });
  },
}));
