/**
 * React Query hooks for Custom Styles (Transformation Types)
 *
 * Manages user-created custom transformation styles stored in the transformation_types table
 * where is_system = false and user_id = current user
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { formatErrorForToast, parseSupabaseError } from '@/lib/errors'

// =====================================================
// TYPES
// =====================================================

/**
 * Custom Style (User-created transformation type)
 */
export interface CustomStyle {
  id: string
  user_id: string
  slug: string
  name: string
  description?: string | null
  icon_name?: string | null
  category?: string | null
  prompt_template?: string | null
  example_image_url?: string | null
  allow_furniture_toggle: boolean
  is_system: boolean
  is_active: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}

/**
 * Data for creating a new custom style
 */
export interface CreateCustomStyleData {
  name: string
  description?: string
  icon_name?: string
  prompt_template?: string
  allow_furniture_toggle?: boolean
}

/**
 * Data for updating a custom style
 */
export interface UpdateCustomStyleData {
  id: string
  name?: string
  description?: string
  icon_name?: string
  prompt_template?: string
  allow_furniture_toggle?: boolean
  is_active?: boolean
}

// =====================================================
// QUERY HOOKS
// =====================================================

/**
 * Hook to fetch all custom styles for the current user
 *
 * @param enabled - Whether to enable the query (default: true)
 * @returns Query result with custom styles array
 *
 * @example
 * ```tsx
 * const { data: customStyles, isLoading } = useCustomStyles()
 * ```
 */
export function useCustomStyles(enabled: boolean = true) {
  return useQuery({
    queryKey: ['custom-styles'],
    queryFn: async () => {
      console.log('🎨 Fetching custom styles...')
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('⚠️ No user found, returning empty array')
        return []
      }

      // Fetch user's custom styles from transformation_types table
      const { data, error } = await supabase
        .from('transformation_types')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_system', false)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching custom styles:', error)
        throw error
      }

      console.log('✅ Custom styles loaded:', data?.length || 0, 'styles')
      return data as CustomStyle[]
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes - custom styles change rarely
    retry: 1,
  })
}

/**
 * Hook to fetch a single custom style by ID
 *
 * @param styleId - The ID of the custom style
 * @param enabled - Whether to enable the query (default: true)
 * @returns Query result with custom style
 *
 * @example
 * ```tsx
 * const { data: style } = useCustomStyle(styleId)
 * ```
 */
export function useCustomStyle(styleId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['custom-styles', styleId],
    queryFn: async () => {
      if (!styleId) return null

      console.log('🎨 Fetching custom style:', styleId)
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('⚠️ No user found')
        return null
      }

      const { data, error } = await supabase
        .from('transformation_types')
        .select('*')
        .eq('id', styleId)
        .eq('user_id', user.id)
        .eq('is_system', false)
        .single()

      if (error) {
        console.error('❌ Error fetching custom style:', error)
        throw error
      }

      console.log('✅ Custom style loaded:', data.name)
      return data as CustomStyle
    },
    enabled: !!styleId && enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes - single style rarely changes
  })
}

/**
 * Hook to fetch all transformation types (system + custom)
 * Useful for displaying all available styles in a dropdown
 *
 * @param enabled - Whether to enable the query (default: true)
 * @returns Query result with all transformation types
 *
 * @example
 * ```tsx
 * const { data: allStyles } = useAllTransformationTypes()
 * ```
 */
export function useAllTransformationTypes(enabled: boolean = true) {
  return useQuery({
    queryKey: ['transformation-types'],
    queryFn: async () => {
      console.log('🎨 Fetching all transformation types...')
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('⚠️ No user found, returning empty array')
        return []
      }

      // Fetch both system types and user's custom types
      const { data, error } = await supabase
        .from('transformation_types')
        .select('*')
        .or(`is_system.eq.true,user_id.eq.${user.id}`)
        .eq('is_active', true)
        .order('is_system', { ascending: false }) // System first
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching transformation types:', error)
        throw error
      }

      console.log('✅ Transformation types loaded:', data?.length || 0, 'types')
      return data as CustomStyle[]
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// =====================================================
// MUTATION HOOKS
// =====================================================

/**
 * Hook to create a new custom style
 *
 * @returns Mutation function and state
 *
 * @example
 * ```tsx
 * const createStyle = useCreateCustomStyle()
 *
 * await createStyle.mutateAsync({
 *   name: 'Mon Style',
 *   description: 'Un style personnalisé',
 *   icon_name: 'Palette',
 *   prompt_template: 'Transform this image...',
 * })
 * ```
 */
export function useCreateCustomStyle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCustomStyleData) => {
      console.log('🎨 Creating custom style:', data.name)
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Generate slug from name
      const slug = data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '_') // Replace non-alphanumeric with underscore
        .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores

      // Create custom style
      const { data: newStyle, error } = await supabase
        .from('transformation_types')
        .insert({
          user_id: user.id,
          slug: `custom_${slug}_${Date.now()}`, // Make unique with timestamp
          name: data.name,
          description: data.description || null,
          icon_name: data.icon_name || 'Sparkles',
          category: 'custom',
          prompt_template: data.prompt_template || null,
          allow_furniture_toggle: data.allow_furniture_toggle ?? false,
          is_system: false,
          is_active: true,
          is_public: false,
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating custom style:', error)
        throw error
      }

      console.log('✅ Custom style created:', newStyle.id)
      return newStyle as CustomStyle
    },
    onSuccess: (data) => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['custom-styles'] })
      queryClient.invalidateQueries({ queryKey: ['transformation-types'] })

      toast.success('Style créé avec succès', {
        description: `Le style "${data.name}" a été créé`,
      })
    },
    onError: (error) => {
      console.error('❌ Error creating custom style:', error)
      const { title, description } = formatErrorForToast(parseSupabaseError(error))
      toast.error(title, { description })
    },
  })
}

/**
 * Hook to update a custom style
 *
 * @returns Mutation function and state
 *
 * @example
 * ```tsx
 * const updateStyle = useUpdateCustomStyle()
 *
 * await updateStyle.mutateAsync({
 *   id: 'style-id',
 *   name: 'Nouveau nom',
 *   description: 'Nouvelle description',
 * })
 * ```
 */
export function useUpdateCustomStyle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateCustomStyleData) => {
      console.log('🎨 Updating custom style:', id)
      const supabase = createClient()

      // Update custom style
      const { data, error } = await supabase
        .from('transformation_types')
        .update(updates)
        .eq('id', id)
        .eq('is_system', false) // Safety: only update non-system types
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating custom style:', error)
        throw error
      }

      console.log('✅ Custom style updated:', id)
      return data as CustomStyle
    },
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['custom-styles'] })
      queryClient.invalidateQueries({ queryKey: ['custom-styles', data.id] })
      queryClient.invalidateQueries({ queryKey: ['transformation-types'] })

      toast.success('Style mis à jour', {
        description: `Le style "${data.name}" a été mis à jour`,
      })
    },
    onError: (error) => {
      console.error('❌ Error updating custom style:', error)
      const { title, description } = formatErrorForToast(parseSupabaseError(error))
      toast.error(title, { description })
    },
  })
}

/**
 * Hook to delete a custom style
 *
 * @returns Mutation function and state
 *
 * @example
 * ```tsx
 * const deleteStyle = useDeleteCustomStyle()
 *
 * await deleteStyle.mutateAsync('style-id')
 * ```
 */
export function useDeleteCustomStyle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (styleId: string) => {
      console.log('🎨 Deleting custom style:', styleId)
      const supabase = createClient()

      // Delete custom style
      const { error } = await supabase
        .from('transformation_types')
        .delete()
        .eq('id', styleId)
        .eq('is_system', false) // Safety: only delete non-system types

      if (error) {
        console.error('❌ Error deleting custom style:', error)
        throw error
      }

      console.log('✅ Custom style deleted:', styleId)
      return styleId
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['custom-styles'] })
      queryClient.invalidateQueries({ queryKey: ['transformation-types'] })

      toast.success('Style supprimé', {
        description: 'Le style personnalisé a été supprimé',
      })
    },
    onError: (error) => {
      console.error('❌ Error deleting custom style:', error)
      const { title, description } = formatErrorForToast(parseSupabaseError(error))
      toast.error(title, { description })
    },
  })
}
