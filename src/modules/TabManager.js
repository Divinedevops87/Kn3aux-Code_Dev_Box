/**
 * TabManager - Advanced tab management for multi-project workflow
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const useTabStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    tabs: [],
    activeTabId: null,
    maxTabs: 10,
    
    // Actions
    createTab: (tabData) => {
      const id = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newTab = {
        id,
        title: tabData.title || 'Untitled Project',
        type: tabData.type || 'project', // project, preview, code, repo
        content: tabData.content || {},
        isDirty: false,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        ...tabData
      }
      
      set((state) => {
        const tabs = state.tabs.length >= state.maxTabs 
          ? [...state.tabs.slice(1), newTab]
          : [...state.tabs, newTab]
        
        return {
          tabs,
          activeTabId: id
        }
      })
      
      return id
    },
    
    closeTab: (tabId) => {
      set((state) => {
        const tabs = state.tabs.filter(tab => tab.id !== tabId)
        const activeTabId = state.activeTabId === tabId 
          ? (tabs.length > 0 ? tabs[tabs.length - 1].id : null)
          : state.activeTabId
        
        return { tabs, activeTabId }
      })
    },
    
    setActiveTab: (tabId) => {
      set({ activeTabId: tabId })
    },
    
    updateTab: (tabId, updates) => {
      set((state) => ({
        tabs: state.tabs.map(tab => 
          tab.id === tabId 
            ? { ...tab, ...updates, lastModified: new Date().toISOString() }
            : tab
        )
      }))
    },
    
    markTabDirty: (tabId, isDirty = true) => {
      set((state) => ({
        tabs: state.tabs.map(tab => 
          tab.id === tabId ? { ...tab, isDirty } : tab
        )
      }))
    },
    
    duplicateTab: (tabId) => {
      const tab = get().tabs.find(t => t.id === tabId)
      if (!tab) return null
      
      return get().createTab({
        ...tab,
        title: `${tab.title} (Copy)`,
        id: undefined
      })
    },
    
    reorderTabs: (fromIndex, toIndex) => {
      set((state) => {
        const tabs = [...state.tabs]
        const [movedTab] = tabs.splice(fromIndex, 1)
        tabs.splice(toIndex, 0, movedTab)
        return { tabs }
      })
    },
    
    closeAllTabs: () => {
      set({ tabs: [], activeTabId: null })
    },
    
    closeOtherTabs: (keepTabId) => {
      set((state) => ({
        tabs: state.tabs.filter(tab => tab.id === keepTabId),
        activeTabId: keepTabId
      }))
    },
    
    // Getters
    getActiveTab: () => {
      const state = get()
      return state.tabs.find(tab => tab.id === state.activeTabId) || null
    },
    
    getTab: (tabId) => {
      return get().tabs.find(tab => tab.id === tabId) || null
    },
    
    getDirtyTabs: () => {
      return get().tabs.filter(tab => tab.isDirty)
    },
    
    getTabsByType: (type) => {
      return get().tabs.filter(tab => tab.type === type)
    }
  }))
)

// Tab management utilities
export const TabManager = {
  // Auto-save functionality
  enableAutoSave: (interval = 30000) => {
    return setInterval(() => {
      const dirtyTabs = useTabStore.getState().getDirtyTabs()
      dirtyTabs.forEach(tab => {
        // Auto-save logic here
        localStorage.setItem(`tab-autosave-${tab.id}`, JSON.stringify(tab))
        useTabStore.getState().markTabDirty(tab.id, false)
      })
    }, interval)
  },
  
  // Session management
  saveSession: () => {
    const state = useTabStore.getState()
    const session = {
      tabs: state.tabs,
      activeTabId: state.activeTabId,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('kn3aux-tab-session', JSON.stringify(session))
    return session
  },
  
  loadSession: () => {
    try {
      const saved = localStorage.getItem('kn3aux-tab-session')
      if (saved) {
        const session = JSON.parse(saved)
        useTabStore.setState({
          tabs: session.tabs || [],
          activeTabId: session.activeTabId || null
        })
        return true
      }
    } catch (error) {
      console.error('Failed to load tab session:', error)
    }
    return false
  },
  
  // Keyboard shortcuts
  setupKeyboardShortcuts: () => {
    const handleKeyboard = (e) => {
      const { ctrlKey, metaKey, key, shiftKey } = e
      const isCmd = ctrlKey || metaKey
      
      if (isCmd) {
        switch (key) {
          case 't':
            e.preventDefault()
            useTabStore.getState().createTab({ title: 'New Project' })
            break
          case 'w':
            e.preventDefault()
            const activeTab = useTabStore.getState().getActiveTab()
            if (activeTab) {
              useTabStore.getState().closeTab(activeTab.id)
            }
            break
          case 'Tab':
            e.preventDefault()
            const tabs = useTabStore.getState().tabs
            const currentIndex = tabs.findIndex(tab => tab.id === useTabStore.getState().activeTabId)
            const nextIndex = shiftKey 
              ? (currentIndex - 1 + tabs.length) % tabs.length
              : (currentIndex + 1) % tabs.length
            if (tabs[nextIndex]) {
              useTabStore.getState().setActiveTab(tabs[nextIndex].id)
            }
            break
        }
      }
      
      // Number keys (1-9) to switch tabs
      if (isCmd && /^[1-9]$/.test(key)) {
        e.preventDefault()
        const tabIndex = parseInt(key) - 1
        const tabs = useTabStore.getState().tabs
        if (tabs[tabIndex]) {
          useTabStore.getState().setActiveTab(tabs[tabIndex].id)
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyboard)
    return () => document.removeEventListener('keydown', handleKeyboard)
  }
}

export default useTabStore