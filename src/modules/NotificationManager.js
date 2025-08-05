/**
 * NotificationManager - Advanced notification system with multiple channels
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const useNotificationStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    notifications: [],
    settings: {
      enabled: true,
      sound: true,
      desktop: true,
      duration: 5000,
      position: 'top-right',
      maxNotifications: 10
    },
    channels: {
      system: { enabled: true, priority: 'high' },
      user: { enabled: true, priority: 'medium' },
      warning: { enabled: true, priority: 'high' },
      error: { enabled: true, priority: 'critical' },
      success: { enabled: true, priority: 'medium' },
      info: { enabled: true, priority: 'low' }
    },
    queue: [],
    
    // Actions
    addNotification: (notification) => {
      const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newNotification = {
        id,
        timestamp: new Date().toISOString(),
        read: false,
        persistent: false,
        ...notification
      }
      
      set((state) => {
        let notifications = [newNotification, ...state.notifications]
        
        // Limit notifications
        if (notifications.length > state.settings.maxNotifications) {
          notifications = notifications.slice(0, state.settings.maxNotifications)
        }
        
        return { notifications }
      })
      
      return id
    },
    
    removeNotification: (id) => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }))
    },
    
    markAsRead: (id) => {
      set((state) => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        )
      }))
    },
    
    markAllAsRead: () => {
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      }))
    },
    
    clearAll: () => {
      set({ notifications: [] })
    },
    
    clearRead: () => {
      set((state) => ({
        notifications: state.notifications.filter(n => !n.read)
      }))
    },
    
    updateSettings: (updates) => {
      set((state) => ({
        settings: { ...state.settings, ...updates }
      }))
    },
    
    updateChannelSettings: (channel, settings) => {
      set((state) => ({
        channels: {
          ...state.channels,
          [channel]: { ...state.channels[channel], ...settings }
        }
      }))
    },
    
    addToQueue: (notification) => {
      set((state) => ({
        queue: [...state.queue, notification]
      }))
    },
    
    processQueue: () => {
      const { queue } = get()
      if (queue.length > 0) {
        const notification = queue[0]
        get().addNotification(notification)
        set((state) => ({
          queue: state.queue.slice(1)
        }))
      }
    },
    
    // Computed
    getUnreadCount: () => {
      return get().notifications.filter(n => !n.read).length
    },
    
    getNotificationsByChannel: (channel) => {
      return get().notifications.filter(n => n.channel === channel)
    },
    
    getNotificationsByType: (type) => {
      return get().notifications.filter(n => n.type === type)
    }
  }))
)

// Notification Manager API
export const NotificationManager = {
  // Basic notification methods
  show: (message, options = {}) => {
    const notification = {
      message,
      type: 'info',
      channel: 'user',
      ...options
    }
    
    return NotificationManager.addNotification(notification)
  },
  
  success: (message, options = {}) => {
    return NotificationManager.show(message, {
      ...options,
      type: 'success',
      channel: 'success',
      icon: '✅'
    })
  },
  
  error: (message, options = {}) => {
    return NotificationManager.show(message, {
      ...options,
      type: 'error',
      channel: 'error',
      icon: '❌',
      persistent: true
    })
  },
  
  warning: (message, options = {}) => {
    return NotificationManager.show(message, {
      ...options,
      type: 'warning',
      channel: 'warning',
      icon: '⚠️'
    })
  },
  
  info: (message, options = {}) => {
    return NotificationManager.show(message, {
      ...options,
      type: 'info',
      channel: 'info',
      icon: 'ℹ️'
    })
  },
  
  // Advanced notification methods
  progress: (message, progress = 0, options = {}) => {
    return NotificationManager.show(message, {
      ...options,
      type: 'progress',
      progress,
      persistent: true,
      showProgress: true
    })
  },
  
  updateProgress: (id, progress, message = null) => {
    const notifications = useNotificationStore.getState().notifications
    const notification = notifications.find(n => n.id === id)
    
    if (notification) {
      const updated = {
        ...notification,
        progress,
        ...(message && { message })
      }
      
      useNotificationStore.setState((state) => ({
        notifications: state.notifications.map(n =>
          n.id === id ? updated : n
        )
      }))
    }
  },
  
  loading: (message, options = {}) => {
    return NotificationManager.show(message, {
      ...options,
      type: 'loading',
      icon: '⏳',
      persistent: true,
      showSpinner: true
    })
  },
  
  // System notifications
  system: (message, options = {}) => {
    return NotificationManager.show(message, {
      ...options,
      channel: 'system',
      type: 'system',
      icon: '🔧'
    })
  },
  
  // Rich notifications
  rich: (title, content, options = {}) => {
    return NotificationManager.show(title, {
      ...options,
      type: 'rich',
      content,
      expandable: true
    })
  },
  
  // Action notifications
  action: (message, actions = [], options = {}) => {
    return NotificationManager.show(message, {
      ...options,
      type: 'action',
      actions,
      persistent: true
    })
  },
  
  // Core notification handling
  addNotification: (notification) => {
    const settings = useNotificationStore.getState().settings
    const channelSettings = useNotificationStore.getState().channels[notification.channel]
    
    // Check if notifications are enabled
    if (!settings.enabled || !channelSettings?.enabled) {
      return null
    }
    
    // Add to store
    const id = useNotificationStore.getState().addNotification(notification)
    
    // Handle desktop notifications
    if (settings.desktop && notification.type !== 'progress' && notification.type !== 'loading') {
      NotificationManager.showDesktopNotification(notification)
    }
    
    // Play sound
    if (settings.sound && channelSettings.priority !== 'low') {
      NotificationManager.playNotificationSound(notification.type)
    }
    
    // Auto-dismiss
    if (!notification.persistent) {
      setTimeout(() => {
        NotificationManager.dismiss(id)
      }, options.duration || settings.duration)
    }
    
    return id
  },
  
  dismiss: (id) => {
    useNotificationStore.getState().removeNotification(id)
  },
  
  dismissAll: () => {
    useNotificationStore.getState().clearAll()
  },
  
  // Desktop notifications
  requestPermission: async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  },
  
  showDesktopNotification: (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const desktopNotification = new Notification(notification.message, {
        body: notification.content || '',
        icon: notification.image || '/favicon.svg',
        badge: '/favicon.svg',
        tag: notification.id,
        requireInteraction: notification.persistent
      })
      
      desktopNotification.onclick = () => {
        window.focus()
        if (notification.onClick) {
          notification.onClick()
        }
        desktopNotification.close()
      }
      
      // Auto-close
      if (!notification.persistent) {
        setTimeout(() => {
          desktopNotification.close()
        }, useNotificationStore.getState().settings.duration)
      }
    }
  },
  
  // Sound management
  playNotificationSound: (type) => {
    const soundMap = {
      error: 'error.mp3',
      warning: 'warning.mp3',
      success: 'success.mp3',
      info: 'info.mp3'
    }
    
    const soundFile = soundMap[type] || soundMap.info
    
    try {
      const audio = new Audio(`/sounds/${soundFile}`)
      audio.volume = 0.3
      audio.play().catch(() => {
        // Ignore errors (user hasn't interacted with page yet)
      })
    } catch (error) {
      console.warn('Failed to play notification sound:', error)
    }
  },
  
  // Batch operations
  showBatch: (notifications) => {
    const ids = []
    notifications.forEach(notification => {
      const id = NotificationManager.addNotification(notification)
      if (id) ids.push(id)
    })
    return ids
  },
  
  dismissBatch: (ids) => {
    ids.forEach(id => NotificationManager.dismiss(id))
  },
  
  // Template notifications
  templates: {
    save: (filename) => NotificationManager.success(`Saved ${filename}`, {
      icon: '💾',
      actions: [
        { label: 'Undo', action: 'undo' },
        { label: 'View', action: 'view' }
      ]
    }),
    
    upload: (filename, progress = 0) => NotificationManager.progress(`Uploading ${filename}`, progress, {
      icon: '📤'
    }),
    
    download: (filename) => NotificationManager.info(`Downloading ${filename}`, {
      icon: '📥',
      type: 'loading'
    }),
    
    connectionLost: () => NotificationManager.warning('Connection lost. Trying to reconnect...', {
      icon: '📡',
      persistent: true,
      id: 'connection-lost'
    }),
    
    connectionRestored: () => {
      NotificationManager.dismiss('connection-lost')
      return NotificationManager.success('Connection restored', {
        icon: '✅'
      })
    },
    
    updateAvailable: (version) => NotificationManager.action(
      `Update available (v${version})`,
      [
        { label: 'Update Now', action: 'update', primary: true },
        { label: 'Later', action: 'dismiss' }
      ],
      {
        icon: '🔄',
        persistent: true
      }
    ),
    
    lowStorage: () => NotificationManager.warning('Storage space is running low', {
      icon: '💾',
      actions: [
        { label: 'Clean Up', action: 'cleanup' },
        { label: 'Ignore', action: 'dismiss' }
      ]
    })
  },
  
  // Queue management
  enableQueue: () => {
    // Process queue every 500ms
    setInterval(() => {
      useNotificationStore.getState().processQueue()
    }, 500)
  },
  
  // Analytics
  getAnalytics: () => {
    const notifications = useNotificationStore.getState().notifications
    
    const analytics = {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      byType: {},
      byChannel: {},
      averageReadTime: 0
    }
    
    notifications.forEach(notification => {
      // Type breakdown
      analytics.byType[notification.type] = (analytics.byType[notification.type] || 0) + 1
      
      // Channel breakdown
      analytics.byChannel[notification.channel] = (analytics.byChannel[notification.channel] || 0) + 1
    })
    
    return analytics
  },
  
  // Settings management
  getSettings: () => {
    return useNotificationStore.getState().settings
  },
  
  updateSettings: (updates) => {
    useNotificationStore.getState().updateSettings(updates)
  },
  
  resetSettings: () => {
    useNotificationStore.getState().updateSettings({
      enabled: true,
      sound: true,
      desktop: true,
      duration: 5000,
      position: 'top-right',
      maxNotifications: 10
    })
  },
  
  // Export/Import
  exportNotifications: (format = 'json') => {
    const notifications = useNotificationStore.getState().notifications
    
    switch (format) {
      case 'json':
        return JSON.stringify({
          notifications,
          exportedAt: new Date().toISOString()
        }, null, 2)
      
      case 'csv':
        const headers = ['timestamp', 'type', 'channel', 'message', 'read']
        const rows = notifications.map(n => [
          n.timestamp,
          n.type,
          n.channel,
          n.message.replace(/,/g, ';'),
          n.read
        ])
        return [headers, ...rows].map(row => row.join(',')).join('\n')
      
      default:
        return notifications
    }
  },
  
  // Cleanup
  cleanup: () => {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    
    useNotificationStore.setState((state) => ({
      notifications: state.notifications.filter(n => 
        new Date(n.timestamp) > cutoff || !n.read
      )
    }))
  },
  
  // Initialization
  init: () => {
    // Request desktop notification permission
    NotificationManager.requestPermission()
    
    // Enable queue processing
    NotificationManager.enableQueue()
    
    // Set up cleanup interval
    setInterval(() => {
      NotificationManager.cleanup()
    }, 24 * 60 * 60 * 1000) // Daily cleanup
    
    // Load saved settings
    try {
      const saved = localStorage.getItem('kn3aux-notification-settings')
      if (saved) {
        const settings = JSON.parse(saved)
        NotificationManager.updateSettings(settings)
      }
    } catch (error) {
      console.warn('Failed to load notification settings:', error)
    }
    
    // Save settings on change
    useNotificationStore.subscribe(
      (state) => state.settings,
      (settings) => {
        localStorage.setItem('kn3aux-notification-settings', JSON.stringify(settings))
      }
    )
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  NotificationManager.init()
}

export default useNotificationStore