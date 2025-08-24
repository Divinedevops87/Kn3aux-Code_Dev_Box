/**
 * DeveloperTools - Advanced development tools and debugging capabilities
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const useDeveloperStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    isOpen: false,
    activePanel: 'console', // console, network, performance, storage, elements
    logs: [],
    networkRequests: [],
    performanceMetrics: [],
    inspectedElement: null,
    breakpoints: [],
    
    // Console
    addLog: (log) => {
      set((state) => ({
        logs: [...state.logs, {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...log
        }].slice(-1000) // Keep last 1000 logs
      }))
    },
    
    clearLogs: () => {
      set({ logs: [] })
    },
    
    // Network monitoring
    addNetworkRequest: (request) => {
      set((state) => ({
        networkRequests: [...state.networkRequests, {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...request
        }].slice(-500) // Keep last 500 requests
      }))
    },
    
    clearNetworkRequests: () => {
      set({ networkRequests: [] })
    },
    
    // Performance monitoring
    addPerformanceMetric: (metric) => {
      set((state) => ({
        performanceMetrics: [...state.performanceMetrics, {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...metric
        }].slice(-200) // Keep last 200 metrics
      }))
    },
    
    clearPerformanceMetrics: () => {
      set({ performanceMetrics: [] })
    },
    
    // UI Controls
    toggle: () => {
      set((state) => ({ isOpen: !state.isOpen }))
    },
    
    setActivePanel: (panel) => {
      set({ activePanel: panel })
    },
    
    setInspectedElement: (element) => {
      set({ inspectedElement: element })
    },
    
    // Breakpoints
    addBreakpoint: (breakpoint) => {
      set((state) => ({
        breakpoints: [...state.breakpoints, {
          id: Date.now(),
          enabled: true,
          ...breakpoint
        }]
      }))
    },
    
    removeBreakpoint: (id) => {
      set((state) => ({
        breakpoints: state.breakpoints.filter(bp => bp.id !== id)
      }))
    },
    
    toggleBreakpoint: (id) => {
      set((state) => ({
        breakpoints: state.breakpoints.map(bp => 
          bp.id === id ? { ...bp, enabled: !bp.enabled } : bp
        )
      }))
    }
  }))
)

// Developer Tools API
export const DeveloperTools = {
  // Console methods
  log: (message, data = null, level = 'info') => {
    useDeveloperStore.getState().addLog({
      message,
      data,
      level,
      type: 'log'
    })
    
    // Also log to browser console
    console[level](message, data)
  },
  
  warn: (message, data = null) => {
    DeveloperTools.log(message, data, 'warn')
  },
  
  error: (message, data = null) => {
    DeveloperTools.log(message, data, 'error')
  },
  
  info: (message, data = null) => {
    DeveloperTools.log(message, data, 'info')
  },
  
  debug: (message, data = null) => {
    DeveloperTools.log(message, data, 'debug')
  },
  
  // Performance monitoring
  measurePerformance: (name, fn) => {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    const duration = end - start
    
    useDeveloperStore.getState().addPerformanceMetric({
      name,
      duration,
      type: 'function',
      start,
      end
    })
    
    return result
  },
  
  measureAsyncPerformance: async (name, fn) => {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    const duration = end - start
    
    useDeveloperStore.getState().addPerformanceMetric({
      name,
      duration,
      type: 'async',
      start,
      end
    })
    
    return result
  },
  
  // Network monitoring
  interceptFetch: () => {
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const start = performance.now()
      const url = typeof args[0] === 'string' ? args[0] : args[0].url
      const method = args[1]?.method || 'GET'
      
      try {
        const response = await originalFetch(...args)
        const end = performance.now()
        
        useDeveloperStore.getState().addNetworkRequest({
          url,
          method,
          status: response.status,
          statusText: response.statusText,
          duration: end - start,
          type: 'fetch',
          success: response.ok
        })
        
        return response
      } catch (error) {
        const end = performance.now()
        
        useDeveloperStore.getState().addNetworkRequest({
          url,
          method,
          status: 0,
          statusText: error.message,
          duration: end - start,
          type: 'fetch',
          success: false,
          error: error.message
        })
        
        throw error
      }
    }
  },
  
  // Element inspection
  inspectElement: (element) => {
    const elementInfo = {
      tagName: element.tagName,
      className: element.className,
      id: element.id,
      attributes: Array.from(element.attributes).map(attr => ({
        name: attr.name,
        value: attr.value
      })),
      computedStyle: window.getComputedStyle(element),
      boundingRect: element.getBoundingClientRect(),
      children: element.children.length,
      textContent: element.textContent?.slice(0, 100)
    }
    
    useDeveloperStore.getState().setInspectedElement(elementInfo)
    return elementInfo
  },
  
  // Storage inspection
  inspectStorage: () => {
    return {
      localStorage: Object.entries(localStorage).map(([key, value]) => ({
        key,
        value,
        size: new Blob([value]).size
      })),
      sessionStorage: Object.entries(sessionStorage).map(([key, value]) => ({
        key,
        value,
        size: new Blob([value]).size
      })),
      cookies: document.cookie.split(';').map(cookie => {
        const [key, value] = cookie.trim().split('=')
        return { key, value }
      })
    }
  },
  
  // Memory usage
  getMemoryUsage: () => {
    if ('memory' in performance) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      }
    }
    return null
  },
  
  // Component tree analysis
  analyzeComponentTree: (rootElement) => {
    const analyze = (element) => {
      return {
        tagName: element.tagName,
        className: element.className,
        id: element.id,
        children: Array.from(element.children).map(analyze),
        depth: element.closest('[data-component]')?.dataset.component || 'unknown'
      }
    }
    
    return analyze(rootElement)
  },
  
  // Error boundary
  setupErrorBoundary: () => {
    window.addEventListener('error', (event) => {
      DeveloperTools.error('Global Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      })
    })
    
    window.addEventListener('unhandledrejection', (event) => {
      DeveloperTools.error('Unhandled Promise Rejection', {
        reason: event.reason
      })
    })
  },
  
  // Hot reload utilities
  enableHotReload: () => {
    if (import.meta.hot) {
      import.meta.hot.on('vite:beforeUpdate', () => {
        DeveloperTools.info('Hot reload triggered')
      })
      
      import.meta.hot.on('vite:afterUpdate', () => {
        DeveloperTools.info('Hot reload completed')
      })
    }
  },
  
  // Code execution
  executeCode: (code) => {
    try {
      const result = eval(code)
      DeveloperTools.log('Code executed successfully', result)
      return result
    } catch (error) {
      DeveloperTools.error('Code execution failed', error)
      throw error
    }
  },
  
  // Keyboard shortcuts for developer tools
  setupKeyboardShortcuts: () => {
    const handleKeyboard = (e) => {
      const { ctrlKey, metaKey, key, shiftKey } = e
      const isCmd = ctrlKey || metaKey
      
      if (isCmd && shiftKey) {
        switch (key) {
          case 'I':
            e.preventDefault()
            useDeveloperStore.getState().toggle()
            break
          case 'C':
            e.preventDefault()
            useDeveloperStore.getState().setActivePanel('console')
            useDeveloperStore.getState().toggle()
            break
          case 'N':
            e.preventDefault()
            useDeveloperStore.getState().setActivePanel('network')
            useDeveloperStore.getState().toggle()
            break
          case 'P':
            e.preventDefault()
            useDeveloperStore.getState().setActivePanel('performance')
            useDeveloperStore.getState().toggle()
            break
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyboard)
    return () => document.removeEventListener('keydown', handleKeyboard)
  }
}

// Initialize developer tools
DeveloperTools.setupErrorBoundary()
DeveloperTools.interceptFetch()
DeveloperTools.enableHotReload()

export default useDeveloperStore