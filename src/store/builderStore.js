import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const useBuilderStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    components: [],
    selectedComponent: null,
    history: [],
    historyIndex: -1,
    previewMode: false,
    autoCommitEnabled: true,

    // Actions
    addComponent: (component) => {
      set((state) => {
        const newComponents = [...state.components, component]
        return {
          components: newComponents,
          selectedComponent: component,
          ...addToHistory(state, { components: newComponents })
        }
      })
    },

    updateComponent: (id, updatedComponent) => {
      set((state) => {
        const newComponents = state.components.map(comp =>
          comp.id === id ? updatedComponent : comp
        )
        return {
          components: newComponents,
          selectedComponent: updatedComponent,
          ...addToHistory(state, { components: newComponents })
        }
      })
    },

    deleteComponent: (id) => {
      set((state) => {
        const newComponents = state.components.filter(comp => comp.id !== id)
        return {
          components: newComponents,
          selectedComponent: null,
          ...addToHistory(state, { components: newComponents })
        }
      })
    },

    selectComponent: (component) => {
      set({ selectedComponent: component })
    },

    clearSelection: () => {
      set({ selectedComponent: null })
    },

    setPreviewMode: (previewMode) => {
      set({ previewMode, selectedComponent: previewMode ? null : get().selectedComponent })
    },

    // History management
    undo: () => {
      set((state) => {
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1
          const historyState = state.history[newIndex]
          return {
            ...historyState,
            historyIndex: newIndex,
            selectedComponent: null
          }
        }
        return state
      })
    },

    redo: () => {
      set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          const newIndex = state.historyIndex + 1
          const historyState = state.history[newIndex]
          return {
            ...historyState,
            historyIndex: newIndex,
            selectedComponent: null
          }
        }
        return state
      })
    },

    // Computed values
    get canUndo() {
      return get().historyIndex > 0
    },

    get canRedo() {
      return get().historyIndex < get().history.length - 1
    },

    // Load/Save project
    loadProject: (projectData) => {
      set({
        components: projectData.components || [],
        selectedComponent: null,
        history: [{ components: projectData.components || [] }],
        historyIndex: 0
      })
    },

    saveProject: () => {
      const state = get()
      return {
        components: state.components,
        version: '1.0.0',
        createdAt: new Date().toISOString()
      }
    },

    // Git integration
    setAutoCommitEnabled: (enabled) => {
      set({ autoCommitEnabled: enabled })
    },

    // Manual save trigger for git integration
    triggerSave: () => {
      // This will trigger the auto-save subscription
      set((state) => ({ components: [...state.components] }))
    }
  }))
)

// Helper function to add state to history
const addToHistory = (currentState, newState) => {
  const newHistory = currentState.history.slice(0, currentState.historyIndex + 1)
  newHistory.push(newState)
  
  // Limit history to 50 entries
  if (newHistory.length > 50) {
    newHistory.shift()
  }
  
  return {
    history: newHistory,
    historyIndex: newHistory.length - 1
  }
}

// Auto-save to localStorage
useBuilderStore.subscribe(
  (state) => state.components,
  (components) => {
    localStorage.setItem('kn3aux-builder-project', JSON.stringify({
      components,
      savedAt: new Date().toISOString()
    }))
  }
)

// Load from localStorage on init
const savedProject = localStorage.getItem('kn3aux-builder-project')
if (savedProject) {
  try {
    const projectData = JSON.parse(savedProject)
    useBuilderStore.getState().loadProject(projectData)
  } catch (error) {
    console.error('Failed to load saved project:', error)
  }
}

export { useBuilderStore }