/**
 * Activity Store - Zustand
 * Gère l'historique des activités récentes de l'utilisateur
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type ActivityType =
  | 'project_created'
  | 'project_updated'
  | 'project_deleted'
  | 'image_uploaded'
  | 'image_transformed'
  | 'image_downloaded'
  | 'style_created'
  | 'style_updated'
  | 'style_deleted'
  | 'credits_purchased'
  | 'credits_used'

export interface Activity {
  id: string
  type: ActivityType
  title: string
  description?: string
  timestamp: number
  metadata?: Record<string, unknown>
  projectId?: string
  imageId?: string
}

interface ActivityState {
  activities: Activity[]
  maxActivities: number

  // Actions
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void
  clearActivities: () => void
  removeActivity: (id: string) => void
  getActivitiesByType: (type: ActivityType) => Activity[]
  getActivitiesByProject: (projectId: string) => Activity[]
  getRecentActivities: (limit?: number) => Activity[]
}

const MAX_ACTIVITIES = 100

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      activities: [],
      maxActivities: MAX_ACTIVITIES,

      addActivity: (activity) => {
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(7)
        const newActivity: Activity = {
          ...activity,
          id: `${timestamp}-${randomId}`,
          timestamp,
        }

        set((state) => {
          const updatedActivities = [newActivity, ...state.activities]

          // Limiter le nombre d'activités
          if (updatedActivities.length > MAX_ACTIVITIES) {
            return {
              activities: updatedActivities.slice(0, MAX_ACTIVITIES),
            }
          }

          return { activities: updatedActivities }
        })
      },

      clearActivities: () => {
        set({ activities: [] })
      },

      removeActivity: (id) => {
        set((state) => ({
          activities: state.activities.filter((a) => a.id !== id),
        }))
      },

      getActivitiesByType: (type) => {
        return get().activities.filter((a) => a.type === type)
      },

      getActivitiesByProject: (projectId) => {
        return get().activities.filter((a) => a.projectId === projectId)
      },

      getRecentActivities: (limit = 10) => {
        return get().activities.slice(0, limit)
      },
    }),
    {
      name: 'renzo-activity-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activities: state.activities.slice(0, 50), // Ne persister que les 50 dernières
      }),
    }
  )
)

// Sélecteurs
export const useActivities = () => useActivityStore((state) => state.activities)
export const useRecentActivities = (limit?: number) =>
  useActivityStore((state) => state.getRecentActivities(limit))
export const useActivityActions = () => useActivityStore((state) => ({
  addActivity: state.addActivity,
  clearActivities: state.clearActivities,
  removeActivity: state.removeActivity,
  getActivitiesByType: state.getActivitiesByType,
  getActivitiesByProject: state.getActivitiesByProject,
}))
