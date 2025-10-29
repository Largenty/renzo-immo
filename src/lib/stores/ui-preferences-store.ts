/**
 * UI Preferences Store - Zustand
 * Gère les préférences d'interface utilisateur
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'
export type ViewMode = 'grid' | 'list'
export type DensityMode = 'comfortable' | 'compact' | 'spacious'

interface UIPreferencesState {
  // Apparence
  theme: Theme
  density: DensityMode
  
  // Layout
  sidebarCollapsed: boolean
  projectsViewMode: ViewMode
  imagesViewMode: ViewMode
  
  // Features
  showImagePreviews: boolean
  autoPlayVideos: boolean
  reduceMotion: boolean
  
  // Notifications
  enableSoundNotifications: boolean
  enableDesktopNotifications: boolean
  
  // Actions
  setTheme: (theme: Theme) => void
  setDensity: (density: DensityMode) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setProjectsViewMode: (mode: ViewMode) => void
  setImagesViewMode: (mode: ViewMode) => void
  setShowImagePreviews: (show: boolean) => void
  setAutoPlayVideos: (autoPlay: boolean) => void
  setReduceMotion: (reduce: boolean) => void
  setEnableSoundNotifications: (enable: boolean) => void
  setEnableDesktopNotifications: (enable: boolean) => void
  reset: () => void
}

const initialState = {
  theme: 'system' as Theme,
  density: 'comfortable' as DensityMode,
  sidebarCollapsed: false,
  projectsViewMode: 'grid' as ViewMode,
  imagesViewMode: 'grid' as ViewMode,
  showImagePreviews: true,
  autoPlayVideos: false,
  reduceMotion: false,
  enableSoundNotifications: true,
  enableDesktopNotifications: true,
}

export const useUIPreferencesStore = create<UIPreferencesState>()(
  persist(
    (set) => ({
      ...initialState,

      setTheme: (theme) => set({ theme }),
      setDensity: (density) => set({ density }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setProjectsViewMode: (mode) => set({ projectsViewMode: mode }),
      setImagesViewMode: (mode) => set({ imagesViewMode: mode }),
      setShowImagePreviews: (show) => set({ showImagePreviews: show }),
      setAutoPlayVideos: (autoPlay) => set({ autoPlayVideos: autoPlay }),
      setReduceMotion: (reduce) => set({ reduceMotion: reduce }),
      setEnableSoundNotifications: (enable) => set({ enableSoundNotifications: enable }),
      setEnableDesktopNotifications: (enable) => set({ enableDesktopNotifications: enable }),
      reset: () => set(initialState),
    }),
    {
      name: 'renzo-ui-preferences',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// Sélecteurs
export const useTheme = () => useUIPreferencesStore((state) => state.theme)
export const useDensity = () => useUIPreferencesStore((state) => state.density)
export const useSidebarCollapsed = () => useUIPreferencesStore((state) => state.sidebarCollapsed)
export const useProjectsViewMode = () => useUIPreferencesStore((state) => state.projectsViewMode)
export const useImagesViewMode = () => useUIPreferencesStore((state) => state.imagesViewMode)
