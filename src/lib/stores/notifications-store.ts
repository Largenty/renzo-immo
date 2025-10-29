/**
 * Notifications Store - Zustand
 * Gère les notifications et toasts de manière centralisée
 */

import { create } from 'zustand'
import { toast } from 'sonner'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'
export type NotificationPosition = 
  | 'top-left' 
  | 'top-center' 
  | 'top-right' 
  | 'bottom-left' 
  | 'bottom-center' 
  | 'bottom-right'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  description?: string
  timestamp: number
  read: boolean
  actionLabel?: string
  actionCallback?: () => void
}

interface NotificationsState {
  // État
  notifications: Notification[]
  unreadCount: number
  position: NotificationPosition
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
  setPosition: (position: NotificationPosition) => void
  
  // Toast helpers
  showSuccess: (title: string, description?: string) => void
  showError: (title: string, description?: string) => void
  showInfo: (title: string, description?: string) => void
  showWarning: (title: string, description?: string) => void
  showLoading: (title: string, description?: string) => string
  dismissToast: (id: string) => void
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  position: 'bottom-right',

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      read: false,
    }
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))
    
    // Afficher aussi un toast
    const toastFn = toast[notification.type] || toast
    toastFn(notification.title, {
      description: notification.description,
    })
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },

  removeNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id)
      const wasUnread = notification && !notification.read
      
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      }
    })
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 })
  },

  setPosition: (position) => {
    set({ position })
  },

  // Toast helpers
  showSuccess: (title, description) => {
    toast.success(title, { description })
    get().addNotification({ type: 'success', title, description })
  },

  showError: (title, description) => {
    toast.error(title, { description })
    get().addNotification({ type: 'error', title, description })
  },

  showInfo: (title, description) => {
    toast.info(title, { description })
    get().addNotification({ type: 'info', title, description })
  },

  showWarning: (title, description) => {
    toast.warning(title, { description })
    get().addNotification({ type: 'warning', title, description })
  },

  showLoading: (title, description) => {
    return toast.loading(title, { description })
  },

  dismissToast: (id) => {
    toast.dismiss(id)
  },
}))

// Sélecteurs
export const useNotifications = () => useNotificationsStore((state) => state.notifications)
export const useUnreadCount = () => useNotificationsStore((state) => state.unreadCount)
export const useNotificationActions = () => useNotificationsStore((state) => ({
  addNotification: state.addNotification,
  markAsRead: state.markAsRead,
  markAllAsRead: state.markAllAsRead,
  removeNotification: state.removeNotification,
  clearAll: state.clearAll,
  showSuccess: state.showSuccess,
  showError: state.showError,
  showInfo: state.showInfo,
  showWarning: state.showWarning,
  showLoading: state.showLoading,
  dismissToast: state.dismissToast,
}))
