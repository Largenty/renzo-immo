/**
 * Upload Store - Zustand
 * Gère l'état d'upload d'images et leur configuration
 */

import { create } from 'zustand'
import type { TransformationType, RoomType } from '@/types/dashboard'

export interface UploadedFile {
  id: string
  file: File
  preview: string
  transformationType?: TransformationType
  withFurniture?: boolean
  customPrompt?: string
  roomType?: RoomType
  customRoom?: string
}

interface UploadState {
  // État
  files: UploadedFile[]
  step: 'upload' | 'configure'
  bulkMode: boolean
  isDragging: boolean

  // Configuration bulk
  bulkTransformationType: TransformationType | null
  bulkWithFurniture: boolean | undefined
  bulkCustomPrompt: string
  bulkRoomType: RoomType | undefined
  bulkCustomRoom: string

  // Actions - Fichiers
  addFiles: (newFiles: UploadedFile[]) => void
  removeFile: (id: string) => void
  updateFile: (id: string, updates: Partial<UploadedFile>) => void
  clearFiles: () => void

  // Actions - Workflow
  setStep: (step: 'upload' | 'configure') => void
  setBulkMode: (bulkMode: boolean) => void
  setIsDragging: (isDragging: boolean) => void

  // Actions - Configuration bulk
  setBulkTransformationType: (type: TransformationType | null) => void
  setBulkWithFurniture: (withFurniture: boolean | undefined) => void
  setBulkCustomPrompt: (prompt: string) => void
  setBulkRoomType: (roomType: RoomType | undefined) => void
  setBulkCustomRoom: (room: string) => void

  // Actions - Bulk apply
  applyBulkConfig: () => void

  // Reset
  reset: () => void
}

/**
 * Store pour gérer l'upload et configuration d'images
 * Pas de persistance (état temporaire)
 */
export const useUploadStore = create<UploadState>((set, get) => ({
  // État initial
  files: [],
  step: 'upload',
  bulkMode: true,
  isDragging: false,

  // Configuration bulk initiale
  bulkTransformationType: null,
  bulkWithFurniture: undefined,
  bulkCustomPrompt: '',
  bulkRoomType: undefined,
  bulkCustomRoom: '',

  // Ajouter des fichiers
  addFiles: (newFiles) => {
    set((state) => ({
      files: [...state.files, ...newFiles],
    }))
  },

  // Supprimer un fichier
  removeFile: (id) => {
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
    }))
  },

  // Mettre à jour un fichier
  updateFile: (id, updates) => {
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }))
  },

  // Effacer tous les fichiers
  clearFiles: () => {
    set({ files: [] })
  },

  // Définir l'étape du workflow
  setStep: (step) => {
    set({ step })
  },

  // Définir le mode bulk/individuel
  setBulkMode: (bulkMode) => {
    set({ bulkMode })
  },

  // Définir l'état de drag
  setIsDragging: (isDragging) => {
    set({ isDragging })
  },

  // Configuration bulk
  setBulkTransformationType: (type) => {
    set({ bulkTransformationType: type })
  },

  setBulkWithFurniture: (withFurniture) => {
    set({ bulkWithFurniture: withFurniture })
  },

  setBulkCustomPrompt: (prompt) => {
    set({ bulkCustomPrompt: prompt })
  },

  setBulkRoomType: (roomType) => {
    set({ bulkRoomType: roomType })
  },

  setBulkCustomRoom: (room) => {
    set({ bulkCustomRoom: room })
  },

  // Appliquer la configuration bulk à tous les fichiers
  applyBulkConfig: () => {
    const {
      bulkTransformationType,
      bulkWithFurniture,
      bulkCustomPrompt,
      bulkRoomType,
      bulkCustomRoom,
    } = get()

    set((state) => ({
      files: state.files.map((file) => ({
        ...file,
        transformationType: bulkTransformationType || file.transformationType,
        withFurniture: bulkWithFurniture !== undefined ? bulkWithFurniture : file.withFurniture,
        customPrompt: bulkCustomPrompt || file.customPrompt,
        roomType: bulkRoomType || file.roomType,
        customRoom: bulkCustomRoom || file.customRoom,
      })),
    }))
  },

  // Réinitialiser le store
  reset: () => {
    set({
      files: [],
      step: 'upload',
      bulkMode: true,
      isDragging: false,
      bulkTransformationType: null,
      bulkWithFurniture: undefined,
      bulkCustomPrompt: '',
      bulkRoomType: undefined,
      bulkCustomRoom: '',
    })
  },
}))

/**
 * Sélecteurs utiles
 */
export const useUploadFiles = () => useUploadStore((state) => state.files)
export const useUploadStep = () => useUploadStore((state) => state.step)
export const useUploadBulkMode = () => useUploadStore((state) => state.bulkMode)
export const useUploadActions = () =>
  useUploadStore((state) => ({
    addFiles: state.addFiles,
    removeFile: state.removeFile,
    updateFile: state.updateFile,
    clearFiles: state.clearFiles,
    setStep: state.setStep,
    setBulkMode: state.setBulkMode,
    applyBulkConfig: state.applyBulkConfig,
    reset: state.reset,
  }))
