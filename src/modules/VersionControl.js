/**
 * VersionControl - Advanced version control system for projects
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const useVersionStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    currentVersion: null,
    versions: [],
    branches: ['main'],
    currentBranch: 'main',
    isCommitting: false,
    conflicts: [],
    
    // Actions
    createVersion: (projectData, message, author = 'User') => {
      const id = `v${Date.now()}`
      const version = {
        id,
        message,
        author,
        timestamp: new Date().toISOString(),
        branch: get().currentBranch,
        projectData: JSON.parse(JSON.stringify(projectData)), // Deep clone
        parent: get().currentVersion?.id || null,
        changes: get().calculateChanges(projectData),
        hash: get().generateHash(projectData)
      }
      
      set((state) => ({
        versions: [...state.versions, version],
        currentVersion: version
      }))
      
      return version
    },
    
    checkoutVersion: (versionId) => {
      const version = get().versions.find(v => v.id === versionId)
      if (version) {
        set({ currentVersion: version })
        return version.projectData
      }
      return null
    },
    
    createBranch: (branchName, fromVersionId = null) => {
      const fromVersion = fromVersionId 
        ? get().versions.find(v => v.id === fromVersionId)
        : get().currentVersion
      
      if (!get().branches.includes(branchName)) {
        set((state) => ({
          branches: [...state.branches, branchName],
          currentBranch: branchName
        }))
        
        if (fromVersion) {
          // Create a copy of the version for the new branch
          get().createVersion(
            fromVersion.projectData,
            `Created branch ${branchName}`,
            fromVersion.author
          )
        }
        
        return true
      }
      return false
    },
    
    switchBranch: (branchName) => {
      if (get().branches.includes(branchName)) {
        set({ currentBranch: branchName })
        
        // Get the latest version from this branch
        const branchVersions = get().versions.filter(v => v.branch === branchName)
        if (branchVersions.length > 0) {
          const latestVersion = branchVersions[branchVersions.length - 1]
          set({ currentVersion: latestVersion })
          return latestVersion.projectData
        }
      }
      return null
    },
    
    mergeBranches: (sourceBranch, targetBranch) => {
      const sourceVersions = get().versions.filter(v => v.branch === sourceBranch)
      const targetVersions = get().versions.filter(v => v.branch === targetBranch)
      
      if (sourceVersions.length === 0 || targetVersions.length === 0) {
        return { success: false, error: 'Invalid branches' }
      }
      
      const sourceLatest = sourceVersions[sourceVersions.length - 1]
      const targetLatest = targetVersions[targetVersions.length - 1]
      
      // Simple merge - in reality, this would involve complex conflict resolution
      const conflicts = get().detectConflicts(sourceLatest.projectData, targetLatest.projectData)
      
      if (conflicts.length > 0) {
        set({ conflicts })
        return { success: false, conflicts }
      }
      
      // Merge successful
      set({ currentBranch: targetBranch })
      const mergedVersion = get().createVersion(
        sourceLatest.projectData,
        `Merged ${sourceBranch} into ${targetBranch}`,
        'System'
      )
      
      return { success: true, version: mergedVersion }
    },
    
    calculateChanges: (newProjectData) => {
      const currentVersion = get().currentVersion
      if (!currentVersion) {
        return {
          added: newProjectData.components?.length || 0,
          modified: 0,
          deleted: 0
        }
      }
      
      const oldComponents = currentVersion.projectData.components || []
      const newComponents = newProjectData.components || []
      
      const oldIds = new Set(oldComponents.map(c => c.id))
      const newIds = new Set(newComponents.map(c => c.id))
      
      const added = newComponents.filter(c => !oldIds.has(c.id)).length
      const deleted = oldComponents.filter(c => !newIds.has(c.id)).length
      const modified = newComponents.filter(c => {
        const oldComponent = oldComponents.find(old => old.id === c.id)
        return oldComponent && JSON.stringify(oldComponent) !== JSON.stringify(c)
      }).length
      
      return { added, modified, deleted }
    },
    
    generateHash: (projectData) => {
      // Simple hash generation - in reality, use proper cryptographic hash
      const str = JSON.stringify(projectData)
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(16)
    },
    
    detectConflicts: (sourceData, targetData) => {
      const conflicts = []
      const sourceComponents = sourceData.components || []
      const targetComponents = targetData.components || []
      
      sourceComponents.forEach(sourceComp => {
        const targetComp = targetComponents.find(t => t.id === sourceComp.id)
        if (targetComp && JSON.stringify(sourceComp) !== JSON.stringify(targetComp)) {
          conflicts.push({
            id: sourceComp.id,
            type: 'component',
            source: sourceComp,
            target: targetComp
          })
        }
      })
      
      return conflicts
    },
    
    resolveConflict: (conflictId, resolution) => {
      set((state) => ({
        conflicts: state.conflicts.filter(c => c.id !== conflictId)
      }))
    },
    
    // Computed getters
    getVersionHistory: (branchName = null) => {
      const targetBranch = branchName || get().currentBranch
      return get().versions
        .filter(v => v.branch === targetBranch)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    },
    
    getVersionDiff: (versionId1, versionId2) => {
      const v1 = get().versions.find(v => v.id === versionId1)
      const v2 = get().versions.find(v => v.id === versionId2)
      
      if (!v1 || !v2) return null
      
      const components1 = v1.projectData.components || []
      const components2 = v2.projectData.components || []
      
      const changes = {
        added: components2.filter(c2 => !components1.find(c1 => c1.id === c2.id)),
        removed: components1.filter(c1 => !components2.find(c2 => c2.id === c1.id)),
        modified: components2.filter(c2 => {
          const c1 = components1.find(c => c.id === c2.id)
          return c1 && JSON.stringify(c1) !== JSON.stringify(c2)
        })
      }
      
      return changes
    }
  }))
)

// Version Control API
export const VersionControl = {
  // Initialize version control for a project
  init: (projectData) => {
    const store = useVersionStore.getState()
    store.createVersion(projectData, 'Initial commit', 'System')
  },
  
  // Commit current changes
  commit: (projectData, message, author = 'User') => {
    if (!message.trim()) {
      throw new Error('Commit message is required')
    }
    
    const store = useVersionStore.getState()
    return store.createVersion(projectData, message, author)
  },
  
  // Get version history
  getHistory: (branchName = null) => {
    return useVersionStore.getState().getVersionHistory(branchName)
  },
  
  // Checkout a specific version
  checkout: (versionId) => {
    return useVersionStore.getState().checkoutVersion(versionId)
  },
  
  // Branch operations
  branch: {
    create: (name, fromVersionId = null) => {
      return useVersionStore.getState().createBranch(name, fromVersionId)
    },
    
    switch: (name) => {
      return useVersionStore.getState().switchBranch(name)
    },
    
    merge: (source, target) => {
      return useVersionStore.getState().mergeBranches(source, target)
    },
    
    list: () => {
      return useVersionStore.getState().branches
    },
    
    current: () => {
      return useVersionStore.getState().currentBranch
    }
  },
  
  // Compare versions
  diff: (versionId1, versionId2) => {
    return useVersionStore.getState().getVersionDiff(versionId1, versionId2)
  },
  
  // Tag operations
  tag: {
    create: (versionId, tagName, message = '') => {
      const store = useVersionStore.getState()
      const version = store.versions.find(v => v.id === versionId)
      
      if (version) {
        version.tags = version.tags || []
        version.tags.push({
          name: tagName,
          message,
          createdAt: new Date().toISOString()
        })
        return true
      }
      return false
    },
    
    list: () => {
      const store = useVersionStore.getState()
      const taggedVersions = store.versions.filter(v => v.tags && v.tags.length > 0)
      return taggedVersions.map(v => ({
        version: v.id,
        tags: v.tags
      }))
    }
  },
  
  // Export version history
  export: (format = 'json') => {
    const store = useVersionStore.getState()
    const data = {
      versions: store.versions.map(v => ({
        id: v.id,
        message: v.message,
        author: v.author,
        timestamp: v.timestamp,
        branch: v.branch,
        changes: v.changes,
        hash: v.hash,
        tags: v.tags || []
      })),
      branches: store.branches,
      currentBranch: store.currentBranch,
      exportedAt: new Date().toISOString()
    }
    
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2)
      case 'csv':
        const headers = ['ID', 'Message', 'Author', 'Timestamp', 'Branch', 'Changes']
        const rows = data.versions.map(v => [
          v.id,
          v.message,
          v.author,
          v.timestamp,
          v.branch,
          `+${v.changes.added} ~${v.changes.modified} -${v.changes.deleted}`
        ])
        return [headers, ...rows].map(row => row.join(',')).join('\n')
      default:
        return data
    }
  },
  
  // Import version history
  import: (data) => {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data
      
      useVersionStore.setState({
        versions: parsed.versions || [],
        branches: parsed.branches || ['main'],
        currentBranch: parsed.currentBranch || 'main'
      })
      
      return true
    } catch (error) {
      console.error('Failed to import version history:', error)
      return false
    }
  },
  
  // Statistics
  getStats: () => {
    const store = useVersionStore.getState()
    const versions = store.versions
    
    const authors = [...new Set(versions.map(v => v.author))]
    const totalCommits = versions.length
    const branches = store.branches.length
    
    const authorStats = authors.map(author => ({
      author,
      commits: versions.filter(v => v.author === author).length,
      firstCommit: versions.find(v => v.author === author)?.timestamp,
      lastCommit: versions.filter(v => v.author === author).pop()?.timestamp
    }))
    
    const branchStats = store.branches.map(branch => ({
      branch,
      commits: versions.filter(v => v.branch === branch).length,
      lastCommit: versions.filter(v => v.branch === branch).pop()?.timestamp
    }))
    
    return {
      totalCommits,
      totalBranches: branches,
      totalAuthors: authors.length,
      authorStats,
      branchStats
    }
  },
  
  // Backup and restore
  backup: () => {
    const store = useVersionStore.getState()
    const backup = {
      versions: store.versions,
      branches: store.branches,
      currentBranch: store.currentBranch,
      currentVersion: store.currentVersion,
      backedUpAt: new Date().toISOString()
    }
    
    localStorage.setItem('kn3aux-version-backup', JSON.stringify(backup))
    return backup
  },
  
  restore: () => {
    try {
      const backup = localStorage.getItem('kn3aux-version-backup')
      if (backup) {
        const data = JSON.parse(backup)
        useVersionStore.setState({
          versions: data.versions || [],
          branches: data.branches || ['main'],
          currentBranch: data.currentBranch || 'main',
          currentVersion: data.currentVersion || null
        })
        return true
      }
    } catch (error) {
      console.error('Failed to restore version backup:', error)
    }
    return false
  },
  
  // Auto-save functionality
  enableAutoCommit: (interval = 300000, messageTemplate = 'Auto-commit') => {
    let lastProjectData = null
    
    return setInterval(() => {
      // This would be called with current project data
      const getCurrentProjectData = () => {
        // In a real implementation, this would get the current project state
        return { components: [], timestamp: Date.now() }
      }
      
      const currentData = getCurrentProjectData()
      
      if (lastProjectData && JSON.stringify(currentData) !== JSON.stringify(lastProjectData)) {
        try {
          VersionControl.commit(
            currentData,
            `${messageTemplate} - ${new Date().toLocaleTimeString()}`,
            'Auto-commit'
          )
          console.log('Auto-commit successful')
        } catch (error) {
          console.error('Auto-commit failed:', error)
        }
      }
      
      lastProjectData = currentData
    }, interval)
  },
  
  // Clean up old versions
  cleanup: (keepVersions = 100) => {
    const store = useVersionStore.getState()
    const sortedVersions = [...store.versions].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    )
    
    if (sortedVersions.length > keepVersions) {
      const versionsToKeep = sortedVersions.slice(0, keepVersions)
      useVersionStore.setState({ versions: versionsToKeep })
      
      console.log(`Cleaned up ${sortedVersions.length - keepVersions} old versions`)
    }
  }
}

export default useVersionStore