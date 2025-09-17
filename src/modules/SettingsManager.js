/**
 * SettingsManager - Comprehensive application settings and configuration management
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const useSettingsStore = create(
  subscribeWithSelector((set, get) => ({
    // Settings categories
    general: {
      theme: 'light', // light, dark, auto
      language: 'en',
      autoSave: true,
      autoSaveInterval: 30000,
      confirmBeforeExit: true,
      showTips: true,
      animationsEnabled: true,
      soundEnabled: true
    },
    
    editor: {
      fontSize: 14,
      fontFamily: 'Inter',
      lineHeight: 1.5,
      tabSize: 2,
      wordWrap: true,
      lineNumbers: true,
      minimap: false,
      bracketMatching: true,
      autoIndent: true,
      formatOnSave: true,
      enableSnippets: true
    },
    
    ui: {
      density: 'comfortable', // compact, comfortable, spacious
      sidebarPosition: 'left', // left, right
      sidebarWidth: 280,
      showPropertyPanel: true,
      showComponentLibrary: true,
      showMiniPreview: false,
      gridSize: 8,
      snapToGrid: true,
      showGrid: false,
      showRulers: false
    },
    
    performance: {
      enableVirtualization: true,
      renderQuality: 'high', // low, medium, high
      maxUndoHistory: 50,
      preloadComponents: true,
      enableCaching: true,
      lazyLoadImages: true,
      debounceDelay: 300
    },
    
    privacy: {
      trackAnalytics: false,
      shareErrorReports: true,
      enableTelemetry: false,
      storeDataLocally: true,
      clearDataOnExit: false
    },
    
    shortcuts: {
      save: 'Ctrl+S',
      undo: 'Ctrl+Z',
      redo: 'Ctrl+Y',
      copy: 'Ctrl+C',
      paste: 'Ctrl+V',
      delete: 'Delete',
      selectAll: 'Ctrl+A',
      export: 'Ctrl+E',
      preview: 'Ctrl+P',
      newProject: 'Ctrl+N'
    },
    
    export: {
      defaultFormat: 'react',
      includeComments: true,
      minifyOutput: false,
      generateTypes: true,
      exportStyles: 'inline', // inline, separate, css-modules
      optimizeImages: true,
      generateSourceMaps: false
    },
    
    // Actions
    updateCategory: (category, updates) => {
      set((state) => ({
        [category]: { ...state[category], ...updates }
      }))
    },
    
    updateSetting: (category, key, value) => {
      set((state) => ({
        [category]: { ...state[category], [key]: value }
      }))
    },
    
    resetCategory: (category) => {
      const defaults = get().getDefaults()
      set({ [category]: defaults[category] })
    },
    
    resetAll: () => {
      const defaults = get().getDefaults()
      set(defaults)
    },
    
    exportSettings: () => {
      const state = get()
      const settings = {}
      
      Object.keys(state).forEach(key => {
        if (typeof state[key] === 'object' && !Array.isArray(state[key]) && state[key] !== null) {
          settings[key] = state[key]
        }
      })
      
      return {
        settings,
        version: '1.0.0',
        exportedAt: new Date().toISOString()
      }
    },
    
    importSettings: (settingsData) => {
      if (settingsData.settings) {
        Object.entries(settingsData.settings).forEach(([category, values]) => {
          if (get().hasOwnProperty(category)) {
            get().updateCategory(category, values)
          }
        })
      }
    },
    
    getDefaults: () => ({
      general: {
        theme: 'light',
        language: 'en',
        autoSave: true,
        autoSaveInterval: 30000,
        confirmBeforeExit: true,
        showTips: true,
        animationsEnabled: true,
        soundEnabled: true
      },
      editor: {
        fontSize: 14,
        fontFamily: 'Inter',
        lineHeight: 1.5,
        tabSize: 2,
        wordWrap: true,
        lineNumbers: true,
        minimap: false,
        bracketMatching: true,
        autoIndent: true,
        formatOnSave: true,
        enableSnippets: true
      },
      ui: {
        density: 'comfortable',
        sidebarPosition: 'left',
        sidebarWidth: 280,
        showPropertyPanel: true,
        showComponentLibrary: true,
        showMiniPreview: false,
        gridSize: 8,
        snapToGrid: true,
        showGrid: false,
        showRulers: false
      },
      performance: {
        enableVirtualization: true,
        renderQuality: 'high',
        maxUndoHistory: 50,
        preloadComponents: true,
        enableCaching: true,
        lazyLoadImages: true,
        debounceDelay: 300
      },
      privacy: {
        trackAnalytics: false,
        shareErrorReports: true,
        enableTelemetry: false,
        storeDataLocally: true,
        clearDataOnExit: false
      },
      shortcuts: {
        save: 'Ctrl+S',
        undo: 'Ctrl+Z',
        redo: 'Ctrl+Y',
        copy: 'Ctrl+C',
        paste: 'Ctrl+V',
        delete: 'Delete',
        selectAll: 'Ctrl+A',
        export: 'Ctrl+E',
        preview: 'Ctrl+P',
        newProject: 'Ctrl+N'
      },
      export: {
        defaultFormat: 'react',
        includeComments: true,
        minifyOutput: false,
        generateTypes: true,
        exportStyles: 'inline',
        optimizeImages: true,
        generateSourceMaps: false
      }
    })
  }))
)

// Settings Manager API
export const SettingsManager = {
  // Getters
  get: (category, key = null) => {
    const state = useSettingsStore.getState()
    if (key) {
      return state[category]?.[key]
    }
    return state[category]
  },
  
  getAll: () => {
    return useSettingsStore.getState().exportSettings()
  },
  
  // Setters
  set: (category, key, value = null) => {
    if (typeof key === 'object') {
      // Setting multiple values in category
      useSettingsStore.getState().updateCategory(category, key)
    } else {
      // Setting single value
      useSettingsStore.getState().updateSetting(category, key, value)
    }
  },
  
  // Theme management
  setTheme: (theme) => {
    SettingsManager.set('general', 'theme', theme)
    SettingsManager.applyTheme(theme)
  },
  
  applyTheme: (theme) => {
    if (theme === 'auto') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme = isDark ? 'dark' : 'light'
    }
    
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  },
  
  // Language management
  setLanguage: (language) => {
    SettingsManager.set('general', 'language', language)
    document.documentElement.setAttribute('lang', language)
  },
  
  // Keyboard shortcuts
  updateShortcut: (action, shortcut) => {
    const shortcuts = SettingsManager.get('shortcuts')
    SettingsManager.set('shortcuts', { ...shortcuts, [action]: shortcut })
  },
  
  getShortcutByAction: (action) => {
    return SettingsManager.get('shortcuts', action)
  },
  
  parseShortcut: (shortcut) => {
    const parts = shortcut.split('+')
    return {
      ctrl: parts.includes('Ctrl'),
      alt: parts.includes('Alt'),
      shift: parts.includes('Shift'),
      meta: parts.includes('Cmd') || parts.includes('Meta'),
      key: parts[parts.length - 1]
    }
  },
  
  // Validation
  validateSettings: (category, settings) => {
    const validations = {
      general: {
        theme: (value) => ['light', 'dark', 'auto'].includes(value),
        language: (value) => typeof value === 'string' && value.length === 2,
        autoSaveInterval: (value) => typeof value === 'number' && value >= 1000,
        fontSize: (value) => typeof value === 'number' && value >= 8 && value <= 72
      },
      editor: {
        fontSize: (value) => typeof value === 'number' && value >= 8 && value <= 72,
        lineHeight: (value) => typeof value === 'number' && value >= 1 && value <= 3,
        tabSize: (value) => typeof value === 'number' && value >= 1 && value <= 8
      },
      ui: {
        density: (value) => ['compact', 'comfortable', 'spacious'].includes(value),
        sidebarPosition: (value) => ['left', 'right'].includes(value),
        sidebarWidth: (value) => typeof value === 'number' && value >= 200 && value <= 600,
        gridSize: (value) => typeof value === 'number' && value >= 4 && value <= 32
      },
      performance: {
        renderQuality: (value) => ['low', 'medium', 'high'].includes(value),
        maxUndoHistory: (value) => typeof value === 'number' && value >= 10 && value <= 100,
        debounceDelay: (value) => typeof value === 'number' && value >= 0 && value <= 1000
      },
      export: {
        defaultFormat: (value) => ['react', 'html', 'vue', 'angular'].includes(value),
        exportStyles: (value) => ['inline', 'separate', 'css-modules'].includes(value)
      }
    }
    
    const categoryValidations = validations[category] || {}
    const errors = []
    
    Object.entries(settings).forEach(([key, value]) => {
      const validator = categoryValidations[key]
      if (validator && !validator(value)) {
        errors.push(`Invalid value for ${key}: ${value}`)
      }
    })
    
    return errors
  },
  
  // Persistence
  save: () => {
    try {
      const settings = useSettingsStore.getState().exportSettings()
      localStorage.setItem('kn3aux-settings', JSON.stringify(settings))
      return true
    } catch (error) {
      console.error('Failed to save settings:', error)
      return false
    }
  },
  
  load: () => {
    try {
      const saved = localStorage.getItem('kn3aux-settings')
      if (saved) {
        const settings = JSON.parse(saved)
        useSettingsStore.getState().importSettings(settings)
        
        // Apply loaded settings
        SettingsManager.applyTheme(SettingsManager.get('general', 'theme'))
        SettingsManager.setLanguage(SettingsManager.get('general', 'language'))
        
        return true
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
    return false
  },
  
  // Migration
  migrate: (oldVersion, newVersion) => {
    // Handle settings migrations between versions
    const migrations = {
      '0.9.0': (settings) => {
        // Example migration
        if (settings.ui && settings.ui.showSidebar !== undefined) {
          settings.ui.showComponentLibrary = settings.ui.showSidebar
          delete settings.ui.showSidebar
        }
        return settings
      }
    }
    
    let currentSettings = SettingsManager.getAll().settings
    
    Object.keys(migrations)
      .filter(version => version > oldVersion && version <= newVersion)
      .sort()
      .forEach(version => {
        currentSettings = migrations[version](currentSettings)
      })
    
    useSettingsStore.getState().importSettings({ settings: currentSettings })
  },
  
  // Export/Import
  exportToFile: () => {
    const settings = useSettingsStore.getState().exportSettings()
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `kn3aux-settings-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  },
  
  importFromFile: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        try {
          const settings = JSON.parse(event.target.result)
          useSettingsStore.getState().importSettings(settings)
          SettingsManager.save()
          resolve(settings)
        } catch (error) {
          reject(new Error('Invalid settings file'))
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  },
  
  // Presets
  presets: {
    developer: {
      general: { theme: 'dark', showTips: false },
      editor: { fontSize: 12, lineNumbers: true, minimap: true },
      ui: { density: 'compact', showGrid: true, showRulers: true },
      performance: { renderQuality: 'high', enableCaching: true }
    },
    
    designer: {
      general: { theme: 'light', animationsEnabled: true },
      editor: { fontSize: 16, wordWrap: true },
      ui: { density: 'spacious', showMiniPreview: true, snapToGrid: true },
      performance: { renderQuality: 'high', preloadComponents: true }
    },
    
    minimal: {
      general: { theme: 'light', soundEnabled: false },
      editor: { fontSize: 14, minimap: false, enableSnippets: false },
      ui: { density: 'compact', showPropertyPanel: false, showGrid: false },
      performance: { renderQuality: 'medium', enableVirtualization: false }
    }
  },
  
  applyPreset: (presetName) => {
    const preset = SettingsManager.presets[presetName]
    if (preset) {
      Object.entries(preset).forEach(([category, settings]) => {
        SettingsManager.set(category, settings)
      })
      SettingsManager.save()
    }
  },
  
  // Watchers
  watch: (category, key, callback) => {
    return useSettingsStore.subscribe(
      (state) => state[category]?.[key],
      callback
    )
  },
  
  watchCategory: (category, callback) => {
    return useSettingsStore.subscribe(
      (state) => state[category],
      callback
    )
  },
  
  // Reset
  reset: (category = null) => {
    if (category) {
      useSettingsStore.getState().resetCategory(category)
    } else {
      useSettingsStore.getState().resetAll()
    }
    SettingsManager.save()
  },
  
  // Utilities
  isDark: () => {
    const theme = SettingsManager.get('general', 'theme')
    if (theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return theme === 'dark'
  },
  
  getShortcutString: (action) => {
    const shortcut = SettingsManager.getShortcutByAction(action)
    return shortcut ? shortcut.replace(/Ctrl/g, '⌘').replace(/Alt/g, '⌥').replace(/Shift/g, '⇧') : ''
  },
  
  // Initialization
  init: () => {
    // Load saved settings
    SettingsManager.load()
    
    // Set up auto-save
    useSettingsStore.subscribe(
      (state) => state,
      () => {
        if (SettingsManager.get('general', 'autoSave')) {
          SettingsManager.save()
        }
      }
    )
    
    // Watch for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addListener(() => {
        if (SettingsManager.get('general', 'theme') === 'auto') {
          SettingsManager.applyTheme('auto')
        }
      })
    }
    
    // Apply initial theme
    SettingsManager.applyTheme(SettingsManager.get('general', 'theme'))
  }
}

// Initialize settings on module load
if (typeof window !== 'undefined') {
  SettingsManager.init()
}

export default useSettingsStore