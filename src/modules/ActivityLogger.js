/**
 * ActivityLogger - Comprehensive activity tracking and analytics system
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const useActivityStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    activities: [],
    sessionStart: Date.now(),
    userStats: {
      totalSessions: 0,
      totalTime: 0,
      componentsCreated: 0,
      projectsCreated: 0,
      exportCount: 0
    },
    analytics: {
      componentUsage: {},
      featureUsage: {},
      performanceMetrics: [],
      errorLogs: []
    },
    
    // Actions
    logActivity: (activity) => {
      const activityLog = {
        id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        sessionId: get().sessionStart,
        ...activity
      }
      
      set((state) => ({
        activities: [activityLog, ...state.activities].slice(0, 1000) // Keep last 1000 activities
      }))
      
      // Update analytics
      get().updateAnalytics(activityLog)
    },
    
    updateAnalytics: (activity) => {
      set((state) => {
        const newAnalytics = { ...state.analytics }
        
        // Update component usage
        if (activity.type === 'component_added') {
          const componentType = activity.data?.componentType
          if (componentType) {
            newAnalytics.componentUsage[componentType] = (newAnalytics.componentUsage[componentType] || 0) + 1
          }
        }
        
        // Update feature usage
        if (activity.type === 'feature_used') {
          const feature = activity.data?.feature
          if (feature) {
            newAnalytics.featureUsage[feature] = (newAnalytics.featureUsage[feature] || 0) + 1
          }
        }
        
        // Add performance metrics
        if (activity.type === 'performance_metric') {
          newAnalytics.performanceMetrics.push(activity.data)
          // Keep only last 500 metrics
          if (newAnalytics.performanceMetrics.length > 500) {
            newAnalytics.performanceMetrics = newAnalytics.performanceMetrics.slice(-500)
          }
        }
        
        // Add error logs
        if (activity.type === 'error') {
          newAnalytics.errorLogs.push(activity.data)
          // Keep only last 100 errors
          if (newAnalytics.errorLogs.length > 100) {
            newAnalytics.errorLogs = newAnalytics.errorLogs.slice(-100)
          }
        }
        
        return { analytics: newAnalytics }
      })
    },
    
    updateUserStats: (updates) => {
      set((state) => ({
        userStats: { ...state.userStats, ...updates }
      }))
    },
    
    startNewSession: () => {
      const sessionStart = Date.now()
      set({ sessionStart })
      
      get().logActivity({
        type: 'session_start',
        data: { sessionId: sessionStart }
      })
      
      // Update session count
      get().updateUserStats({
        totalSessions: get().userStats.totalSessions + 1
      })
    },
    
    endSession: () => {
      const sessionDuration = Date.now() - get().sessionStart
      
      get().logActivity({
        type: 'session_end',
        data: { 
          sessionId: get().sessionStart,
          duration: sessionDuration
        }
      })
      
      // Update total time
      get().updateUserStats({
        totalTime: get().userStats.totalTime + sessionDuration
      })
    },
    
    clearActivities: () => {
      set({ activities: [] })
    },
    
    clearAnalytics: () => {
      set({
        analytics: {
          componentUsage: {},
          featureUsage: {},
          performanceMetrics: [],
          errorLogs: []
        }
      })
    },
    
    // Computed getters
    getActivitiesByType: (type) => {
      return get().activities.filter(activity => activity.type === type)
    },
    
    getActivitiesByDateRange: (startDate, endDate) => {
      const start = new Date(startDate).getTime()
      const end = new Date(endDate).getTime()
      
      return get().activities.filter(activity => {
        const activityTime = new Date(activity.timestamp).getTime()
        return activityTime >= start && activityTime <= end
      })
    },
    
    getSessionActivities: (sessionId) => {
      return get().activities.filter(activity => activity.sessionId === sessionId)
    },
    
    getCurrentSessionDuration: () => {
      return Date.now() - get().sessionStart
    }
  }))
)

// Activity Logger API
export const ActivityLogger = {
  // User actions
  logComponentAdded: (componentType, componentData) => {
    useActivityStore.getState().logActivity({
      type: 'component_added',
      category: 'user_action',
      data: {
        componentType,
        componentData
      }
    })
    
    // Update component count
    const stats = useActivityStore.getState().userStats
    useActivityStore.getState().updateUserStats({
      componentsCreated: stats.componentsCreated + 1
    })
  },
  
  logComponentUpdated: (componentId, changes) => {
    useActivityStore.getState().logActivity({
      type: 'component_updated',
      category: 'user_action',
      data: {
        componentId,
        changes
      }
    })
  },
  
  logComponentDeleted: (componentId, componentType) => {
    useActivityStore.getState().logActivity({
      type: 'component_deleted',
      category: 'user_action',
      data: {
        componentId,
        componentType
      }
    })
  },
  
  logProjectCreated: (projectData) => {
    useActivityStore.getState().logActivity({
      type: 'project_created',
      category: 'user_action',
      data: projectData
    })
    
    // Update project count
    const stats = useActivityStore.getState().userStats
    useActivityStore.getState().updateUserStats({
      projectsCreated: stats.projectsCreated + 1
    })
  },
  
  logProjectExported: (exportFormat, projectData) => {
    useActivityStore.getState().logActivity({
      type: 'project_exported',
      category: 'user_action',
      data: {
        exportFormat,
        projectData
      }
    })
    
    // Update export count
    const stats = useActivityStore.getState().userStats
    useActivityStore.getState().updateUserStats({
      exportCount: stats.exportCount + 1
    })
  },
  
  // Feature usage
  logFeatureUsed: (feature, context = {}) => {
    useActivityStore.getState().logActivity({
      type: 'feature_used',
      category: 'feature_usage',
      data: {
        feature,
        context
      }
    })
  },
  
  logModalOpened: (modalType) => {
    ActivityLogger.logFeatureUsed('modal_opened', { modalType })
  },
  
  logTabSwitched: (fromTab, toTab) => {
    ActivityLogger.logFeatureUsed('tab_switched', { fromTab, toTab })
  },
  
  logToolUsed: (toolName, toolData = {}) => {
    ActivityLogger.logFeatureUsed('tool_used', { toolName, ...toolData })
  },
  
  // Performance tracking
  logPerformanceMetric: (metricName, value, unit = 'ms') => {
    useActivityStore.getState().logActivity({
      type: 'performance_metric',
      category: 'performance',
      data: {
        metricName,
        value,
        unit,
        timestamp: Date.now()
      }
    })
  },
  
  measureFunction: (functionName, fn) => {
    const start = performance.now()
    const result = fn()
    const duration = performance.now() - start
    
    ActivityLogger.logPerformanceMetric(`function_${functionName}`, duration)
    return result
  },
  
  measureAsyncFunction: async (functionName, fn) => {
    const start = performance.now()
    const result = await fn()
    const duration = performance.now() - start
    
    ActivityLogger.logPerformanceMetric(`async_function_${functionName}`, duration)
    return result
  },
  
  // Error tracking
  logError: (error, context = {}) => {
    useActivityStore.getState().logActivity({
      type: 'error',
      category: 'error',
      data: {
        message: error.message,
        stack: error.stack,
        name: error.name,
        context
      }
    })
  },
  
  logWarning: (message, context = {}) => {
    useActivityStore.getState().logActivity({
      type: 'warning',
      category: 'warning',
      data: {
        message,
        context
      }
    })
  },
  
  // User interaction tracking
  logClick: (element, context = {}) => {
    useActivityStore.getState().logActivity({
      type: 'click',
      category: 'interaction',
      data: {
        element,
        context
      }
    })
  },
  
  logPageView: (page, context = {}) => {
    useActivityStore.getState().logActivity({
      type: 'page_view',
      category: 'navigation',
      data: {
        page,
        context
      }
    })
  },
  
  logSearch: (query, results = null) => {
    useActivityStore.getState().logActivity({
      type: 'search',
      category: 'interaction',
      data: {
        query,
        resultsCount: results ? results.length : null
      }
    })
  },
  
  // Session management
  startTracking: () => {
    useActivityStore.getState().startNewSession()
    
    // Set up event listeners
    ActivityLogger.setupEventListeners()
    
    // Set up periodic saves
    ActivityLogger.setupPeriodicSave()
    
    // Track page visibility changes
    ActivityLogger.setupVisibilityTracking()
  },
  
  setupEventListeners: () => {
    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target.closest('[data-track]')
      if (target) {
        ActivityLogger.logClick(target.dataset.track, {
          tagName: target.tagName,
          className: target.className
        })
      }
    })
    
    // Track keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey || event.metaKey) {
        ActivityLogger.logFeatureUsed('keyboard_shortcut', {
          key: event.key,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          shiftKey: event.shiftKey
        })
      }
    })
    
    // Track errors
    window.addEventListener('error', (event) => {
      ActivityLogger.logError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    })
    
    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      ActivityLogger.logError(new Error('Unhandled Promise Rejection'), {
        reason: event.reason
      })
    })
  },
  
  setupPeriodicSave: () => {
    // Save activities to localStorage every 30 seconds
    setInterval(() => {
      const activities = useActivityStore.getState().activities
      const userStats = useActivityStore.getState().userStats
      const analytics = useActivityStore.getState().analytics
      
      localStorage.setItem('kn3aux-activities', JSON.stringify({
        activities: activities.slice(0, 500), // Save only last 500
        userStats,
        analytics,
        savedAt: new Date().toISOString()
      }))
    }, 30000)
  },
  
  setupVisibilityTracking: () => {
    let visibilityStart = Date.now()
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page became hidden
        const visibleDuration = Date.now() - visibilityStart
        ActivityLogger.logPerformanceMetric('page_visible_duration', visibleDuration)
      } else {
        // Page became visible
        visibilityStart = Date.now()
        ActivityLogger.logFeatureUsed('page_visible')
      }
    })
  },
  
  // Analytics and reporting
  generateReport: (dateRange = null) => {
    const activities = dateRange 
      ? useActivityStore.getState().getActivitiesByDateRange(dateRange.start, dateRange.end)
      : useActivityStore.getState().activities
    
    const analytics = useActivityStore.getState().analytics
    const userStats = useActivityStore.getState().userStats
    
    return {
      summary: {
        totalActivities: activities.length,
        dateRange: dateRange || {
          start: activities[activities.length - 1]?.timestamp,
          end: activities[0]?.timestamp
        },
        userStats
      },
      activityBreakdown: activities.reduce((acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1
        return acc
      }, {}),
      componentUsage: analytics.componentUsage,
      featureUsage: analytics.featureUsage,
      performanceMetrics: {
        average: analytics.performanceMetrics.reduce((sum, metric) => sum + metric.value, 0) / analytics.performanceMetrics.length,
        min: Math.min(...analytics.performanceMetrics.map(m => m.value)),
        max: Math.max(...analytics.performanceMetrics.map(m => m.value))
      },
      errors: analytics.errorLogs,
      sessionStats: {
        currentSessionDuration: useActivityStore.getState().getCurrentSessionDuration(),
        totalSessions: userStats.totalSessions,
        averageSessionLength: userStats.totalTime / userStats.totalSessions
      }
    }
  },
  
  exportData: (format = 'json') => {
    const data = {
      activities: useActivityStore.getState().activities,
      userStats: useActivityStore.getState().userStats,
      analytics: useActivityStore.getState().analytics,
      exportedAt: new Date().toISOString()
    }
    
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2)
      case 'csv':
        return ActivityLogger.convertToCSV(data.activities)
      default:
        return data
    }
  },
  
  convertToCSV: (activities) => {
    if (activities.length === 0) return ''
    
    const headers = ['timestamp', 'type', 'category', 'data']
    const rows = activities.map(activity => [
      activity.timestamp,
      activity.type,
      activity.category,
      JSON.stringify(activity.data)
    ])
    
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  },
  
  // Data restoration
  loadSavedData: () => {
    try {
      const saved = localStorage.getItem('kn3aux-activities')
      if (saved) {
        const data = JSON.parse(saved)
        
        // Merge with current state
        useActivityStore.setState((state) => ({
          activities: [...(data.activities || []), ...state.activities].slice(0, 1000),
          userStats: { ...state.userStats, ...data.userStats },
          analytics: {
            componentUsage: { ...state.analytics.componentUsage, ...data.analytics?.componentUsage },
            featureUsage: { ...state.analytics.featureUsage, ...data.analytics?.featureUsage },
            performanceMetrics: [...(data.analytics?.performanceMetrics || []), ...state.analytics.performanceMetrics].slice(-500),
            errorLogs: [...(data.analytics?.errorLogs || []), ...state.analytics.errorLogs].slice(-100)
          }
        }))
        
        return true
      }
    } catch (error) {
      console.error('Failed to load saved activity data:', error)
    }
    return false
  }
}

// Initialize activity tracking
ActivityLogger.loadSavedData()

// Start tracking when module loads
if (typeof window !== 'undefined') {
  ActivityLogger.startTracking()
  
  // End session when page unloads
  window.addEventListener('beforeunload', () => {
    useActivityStore.getState().endSession()
  })
}

export default useActivityStore