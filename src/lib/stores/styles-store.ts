/**
 * Styles Store - Zustand
 * Gère les styles personnalisés de l'utilisateur
 */

import { create } from 'zustand'
import type { CustomStyle } from '@/types/dashboard'

// Mock initial styles (sera remplacé par fetch Supabase)
const initialStyles: CustomStyle[] = [
  {
    id: "1",
    name: "Style Bohème",
    description: "Beaucoup de plantes, coussins colorés, tapis berbère, ambiance chaleureuse",
    iconName: "Flower2",
    createdAt: "2025-01-10T00:00:00.000Z",
    updatedAt: "2025-01-10T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Minimaliste Japonais",
    description: "Lignes épurées, bois naturel, peu de meubles, tons neutres",
    iconName: "Moon",
    createdAt: "2025-01-12T00:00:00.000Z",
    updatedAt: "2025-01-12T00:00:00.000Z",
  },
]

interface StylesState {
  // État
  styles: CustomStyle[]
  isLoading: boolean

  // Actions
  setStyles: (styles: CustomStyle[]) => void
  addStyle: (style: CustomStyle) => void
  updateStyle: (id: string, updates: Partial<CustomStyle>) => void
  deleteStyle: (id: string) => void

  // Utilitaires
  getStyleById: (id: string) => CustomStyle | undefined
  reset: () => void
}

/**
 * Store pour gérer les styles personnalisés
 * Sans persistance localStorage (temporairement désactivé)
 */
export const useStylesStore = create<StylesState>()((set, get) => ({
  // État initial
  styles: initialStyles,
  isLoading: false,

  // Définir la liste complète
  setStyles: (styles) => {
    set({ styles, isLoading: false })
  },

  // Ajouter un nouveau style
  addStyle: (style) => {
    set((state) => ({
      styles: [style, ...state.styles],
    }))
  },

  // Mettre à jour un style existant
  updateStyle: (id, updates) => {
    set((state) => ({
      styles: state.styles.map((style) =>
        style.id === id
          ? { ...style, ...updates, updatedAt: new Date().toISOString() }
          : style
      ),
    }))
  },

  // Supprimer un style
  deleteStyle: (id) => {
    set((state) => ({
      styles: state.styles.filter((style) => style.id !== id),
    }))
  },

  // Récupérer un style par ID
  getStyleById: (id) => {
    return get().styles.find((style) => style.id === id)
  },

  // Réinitialiser le store
  reset: () => {
    set({ styles: initialStyles, isLoading: false })
  },
}))

/**
 * Sélecteurs utiles pour optimiser les re-renders
 */
export const useStyles = () => useStylesStore((state) => state.styles)
export const useStyleById = (id: string) => useStylesStore((state) => state.getStyleById(id))

// Sélecteurs individuels pour éviter les re-renders - plus performant
export const useAddStyle = () => useStylesStore((state) => state.addStyle)
export const useUpdateStyle = () => useStylesStore((state) => state.updateStyle)
export const useDeleteStyle = () => useStylesStore((state) => state.deleteStyle)
