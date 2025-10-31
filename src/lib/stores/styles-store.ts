import { create } from 'zustand';
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

  // Actions
  fetchStyles: (userId: string) => Promise<void>;
  createStyle: (data: CreateStyleData) => Promise<CustomStyle | null>;
  updateStyle: (id: string, data: UpdateStyleData) => Promise<void>;
  deleteStyle: (id: string) => Promise<void>;
  clearStyles: () => void;
}

export const useStylesStore = create<StylesStore>((set, get) => ({
  styles: [],
  isLoading: false,
  error: null,

  fetchStyles: async (userId: string) => {
    set({ isLoading: true, error: null });

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

      set({
        styles: data.map(s => ({
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
        })),
        isLoading: false,
      });
    } catch (error: any) {
      logger.error('[StylesStore] Error fetching styles:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  createStyle: async (data) => {
    set({ isLoading: true, error: null });

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

      set({
        styles: [newStyle, ...get().styles],
        isLoading: false,
      });

      return newStyle;
    } catch (error: any) {
      logger.error('[StylesStore] Error creating style:', error);
      set({ error: error.message, isLoading: false });
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

      set({
        styles: get().styles.map(s =>
          s.id === id ? { ...s, ...data, updatedAt: new Date() } : s
        ),
        isLoading: false,
      });
    } catch (error: any) {
      logger.error('[StylesStore] Error updating style:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  deleteStyle: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('transformation_types')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set({
        styles: get().styles.filter(s => s.id !== id),
        isLoading: false,
      });
    } catch (error: any) {
      logger.error('[StylesStore] Error deleting style:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  clearStyles: () => {
    set({ styles: [], isLoading: false, error: null });
  },
}));
