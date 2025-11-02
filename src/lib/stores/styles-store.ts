import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createClient } from '@/lib/supabase/client';
import { generateStyleSlug } from '@/domain/styles/business-rules/generate-slug';
import { logger } from '@/lib/logger';

interface CustomStyle {
  id: string;
  userId: string;
  slug: string;
  name: string;
  description?: string | null;
  iconName?: string | null;
  category?: string | null;
  promptTemplate?: string | null;
  exampleImageUrl?: string | null;
  allowFurnitureToggle: boolean;
  isSystem: boolean;
  isActive: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateStyleData {
  name: string;
  description?: string;
  iconName?: string;
  promptTemplate?: string;
  allowFurnitureToggle?: boolean;
  userId: string;
}

interface UpdateStyleData {
  name?: string;
  description?: string | null;
  iconName?: string | null;
  promptTemplate?: string | null;
  allowFurnitureToggle?: boolean;
  isActive?: boolean;
}

interface StylesStore {
  styles: CustomStyle[];
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;

  // Actions
  fetchStyles: (userId: string, force?: boolean) => Promise<void>;
  createStyle: (data: CreateStyleData) => Promise<CustomStyle | null>;
  updateStyle: (id: string, data: UpdateStyleData) => Promise<void>;
  deleteStyle: (id: string) => Promise<void>;
  clearStyles: () => void;
}

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes (styles changent rarement)

export const useStylesStore = create<StylesStore>()(
  persist(
    immer((set, get) => ({
      styles: [],
      isLoading: false,
      error: null,
      lastFetch: null,

      fetchStyles: async (userId: string, force = false) => {
        const now = Date.now();
        const { lastFetch, styles } = get();

        // ✅ Cache check
        if (!force && lastFetch && styles.length > 0 && now - lastFetch < CACHE_TTL) {
          logger.debug('[StylesStore] Using cached data');
          return;
        }

        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('transformation_types')
        .select('*')
        .eq('user_id', userId)
        .eq('is_system', false)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // ✅ Immer: set avec timestamp
      set((state) => {
        state.styles = data.map(s => ({
          id: s.id,
          userId: s.user_id,
          slug: s.slug,
          name: s.name,
          description: s.description,
          iconName: s.icon_name,
          category: s.category,
          promptTemplate: s.prompt_template,
          exampleImageUrl: s.example_image_url,
          allowFurnitureToggle: s.allow_furniture_toggle,
          isSystem: s.is_system,
          isActive: s.is_active,
          isPublic: s.is_public,
          createdAt: new Date(s.created_at),
          updatedAt: new Date(s.updated_at),
        }));
        state.isLoading = false;
        state.lastFetch = now;
      });
    } catch (error: any) {
      logger.error('[StylesStore] Error fetching styles:', error);
      set((state) => {
        state.error = error.message;
        state.isLoading = false;
      });
    }
  },

  createStyle: async (data) => {
    set((state) => {
      state.isLoading = true;
      state.error = null;
    });

    try {
      const supabase = createClient();

      // Générer le slug à partir du nom
      const slug = generateStyleSlug(data.name);

      const { data: style, error } = await supabase
        .from('transformation_types')
        .insert({
          user_id: data.userId,
          slug,
          name: data.name,
          description: data.description || null,
          icon_name: data.iconName || null,
          prompt_template: data.promptTemplate || null,
          allow_furniture_toggle: data.allowFurnitureToggle ?? false,
          is_system: false,
          is_active: true,
          is_public: false,
        })
        .select()
        .single();

      if (error) throw error;

      const newStyle: CustomStyle = {
        id: style.id,
        userId: style.user_id,
        slug: style.slug,
        name: style.name,
        description: style.description,
        iconName: style.icon_name,
        category: style.category,
        promptTemplate: style.prompt_template,
        exampleImageUrl: style.example_image_url,
        allowFurnitureToggle: style.allow_furniture_toggle,
        isSystem: style.is_system,
        isActive: style.is_active,
        isPublic: style.is_public,
        createdAt: new Date(style.created_at),
        updatedAt: new Date(style.updated_at),
      };

      // ✅ Immer: unshift
      set((state) => {
        state.styles.unshift(newStyle);
        state.isLoading = false;
      });

      return newStyle;
    } catch (error: any) {
      logger.error('[StylesStore] Error creating style:', error);
      set((state) => {
        state.error = error.message;
        state.isLoading = false;
      });
      return null;
    }
  },

  updateStyle: async (id, data) => {
    set({ isLoading: true, error: null });

    try {
      const supabase = createClient();
      const updateData: any = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.iconName !== undefined) updateData.icon_name = data.iconName;
      if (data.promptTemplate !== undefined) updateData.prompt_template = data.promptTemplate;
      if (data.allowFurnitureToggle !== undefined) updateData.allow_furniture_toggle = data.allowFurnitureToggle;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;

      const { error } = await supabase
        .from('transformation_types')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // ✅ Immer: mutation directe
      set((state) => {
        const style = state.styles.find(s => s.id === id);
        if (style) {
          Object.assign(style, data);
          style.updatedAt = new Date();
        }
        state.isLoading = false;
      });
    } catch (error: any) {
      logger.error('[StylesStore] Error updating style:', error);
      set((state) => {
        state.error = error.message;
        state.isLoading = false;
      });
    }
  },

  deleteStyle: async (id) => {
    set((state) => {
      state.isLoading = true;
      state.error = null;
    });

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('transformation_types')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // ✅ Immer: filter
      set((state) => {
        state.styles = state.styles.filter(s => s.id !== id);
        state.isLoading = false;
      });
    } catch (error: any) {
      logger.error('[StylesStore] Error deleting style:', error);
      set((state) => {
        state.error = error.message;
        state.isLoading = false;
      });
    }
  },

  clearStyles: () => {
    set((state) => {
      state.styles = [];
      state.isLoading = false;
      state.error = null;
      state.lastFetch = null;
    });
  },
    })),
    {
      name: 'renzo-styles-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        styles: state.styles,
        lastFetch: state.lastFetch,
      }),
    }
  )
);
