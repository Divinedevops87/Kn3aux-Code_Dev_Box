import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const useGitStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    repositoryConfig: {
      name: '',
      description: '',
      isConfigured: false,
      remoteUrl: '',
      branch: 'main'
    },
    commits: [],
    currentBranch: 'main',
    branches: ['main'],
    isConnected: false,
    lastSync: null,
    pendingChanges: false,

    // Actions
    configureRepository: (config) => {
      set((state) => ({
        repositoryConfig: {
          ...state.repositoryConfig,
          ...config,
          isConfigured: true
        },
        isConnected: true
      }))
    },

    createCommit: (message, components) => {
      const commit = {
        id: Date.now().toString(),
        message: message,
        timestamp: new Date().toISOString(),
        author: 'KN3AUX Builder User',
        components: JSON.parse(JSON.stringify(components)),
        branch: get().currentBranch
      }

      set((state) => ({
        commits: [commit, ...state.commits],
        pendingChanges: false,
        lastSync: new Date().toISOString()
      }))

      return commit
    },

    createBranch: (branchName) => {
      set((state) => {
        if (state.branches.includes(branchName)) {
          return state
        }
        return {
          branches: [...state.branches, branchName]
        }
      })
    },

    switchBranch: (branchName) => {
      set((state) => {
        if (!state.branches.includes(branchName)) {
          return state
        }
        return {
          currentBranch: branchName,
          pendingChanges: false
        }
      })
    },

    setPendingChanges: (hasPendingChanges) => {
      set({ pendingChanges: hasPendingChanges })
    },

    // Simulate push operation
    pushChanges: async () => {
      const state = get()
      if (!state.repositoryConfig.isConfigured) {
        throw new Error('Repository not configured')
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      set({
        lastSync: new Date().toISOString(),
        pendingChanges: false
      })

      return { success: true, message: 'Changes pushed successfully' }
    },

    // Simulate pull operation
    pullChanges: async () => {
      const state = get()
      if (!state.repositoryConfig.isConfigured) {
        throw new Error('Repository not configured')
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      set({
        lastSync: new Date().toISOString()
      })

      return { success: true, message: 'Repository up to date' }
    },

    // Get commit history for current branch
    getBranchCommits: () => {
      const state = get()
      return state.commits.filter(commit => commit.branch === state.currentBranch)
    },

    // Reset repository state
    resetRepository: () => {
      set({
        repositoryConfig: {
          name: '',
          description: '',
          isConfigured: false,
          remoteUrl: '',
          branch: 'main'
        },
        commits: [],
        currentBranch: 'main',
        branches: ['main'],
        isConnected: false,
        lastSync: null,
        pendingChanges: false
      })
    },

    // Auto-configure with project name
    autoConfigureFromProject: (projectName) => {
      const sanitizedName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-')
      const config = {
        name: sanitizedName || 'kn3aux-project',
        description: `KN3AUX-CODE™ project: ${projectName || 'Untitled Project'}`,
        remoteUrl: `https://github.com/user/${sanitizedName}.git`,
        branch: 'main'
      }
      
      get().configureRepository(config)
      return config
    }
  }))
)

// Auto-save git config to localStorage
useGitStore.subscribe(
  (state) => state.repositoryConfig,
  (repositoryConfig) => {
    localStorage.setItem('kn3aux-git-config', JSON.stringify(repositoryConfig))
  }
)

// Load git config from localStorage on init
const savedGitConfig = localStorage.getItem('kn3aux-git-config')
if (savedGitConfig) {
  try {
    const gitConfig = JSON.parse(savedGitConfig)
    if (gitConfig.isConfigured) {
      useGitStore.getState().configureRepository(gitConfig)
    }
  } catch (error) {
    console.error('Failed to load git configuration:', error)
  }
}

export { useGitStore }