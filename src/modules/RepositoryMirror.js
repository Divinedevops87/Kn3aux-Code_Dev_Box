/**
 * RepositoryMirror - Offline GitHub repository mirroring with webview popups
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const useRepositoryStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    repositories: [],
    activeRepo: null,
    webviewOpen: false,
    isLoading: false,
    searchQuery: '',
    filters: {
      language: '',
      size: '',
      updated: ''
    },
    
    // Actions
    addRepository: (repoData) => {
      set((state) => {
        const exists = state.repositories.find(r => r.id === repoData.id)
        if (exists) return state
        
        const repo = {
          ...repoData,
          mirroredAt: new Date().toISOString(),
          size: 0,
          files: [],
          commits: [],
          branches: [],
          status: 'syncing'
        }
        
        return {
          repositories: [...state.repositories, repo]
        }
      })
    },
    
    updateRepository: (id, updates) => {
      set((state) => ({
        repositories: state.repositories.map(repo =>
          repo.id === id ? { ...repo, ...updates, lastUpdated: new Date().toISOString() } : repo
        )
      }))
    },
    
    removeRepository: (id) => {
      set((state) => ({
        repositories: state.repositories.filter(repo => repo.id !== id),
        activeRepo: state.activeRepo?.id === id ? null : state.activeRepo
      }))
    },
    
    setActiveRepo: (repo) => {
      set({ activeRepo: repo })
    },
    
    setWebviewOpen: (open) => {
      set({ webviewOpen: open })
    },
    
    setLoading: (loading) => {
      set({ isLoading: loading })
    },
    
    setSearchQuery: (query) => {
      set({ searchQuery: query })
    },
    
    setFilters: (filters) => {
      set((state) => ({
        filters: { ...state.filters, ...filters }
      }))
    },
    
    // Computed
    getFilteredRepositories: () => {
      const { repositories, searchQuery, filters } = get()
      
      return repositories.filter(repo => {
        // Search filter
        if (searchQuery && !repo.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !repo.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false
        }
        
        // Language filter
        if (filters.language && repo.language !== filters.language) {
          return false
        }
        
        // Size filter
        if (filters.size) {
          const sizeInMB = repo.size / (1024 * 1024)
          switch (filters.size) {
            case 'small':
              if (sizeInMB > 10) return false
              break
            case 'medium':
              if (sizeInMB <= 10 || sizeInMB > 100) return false
              break
            case 'large':
              if (sizeInMB <= 100) return false
              break
          }
        }
        
        return true
      })
    }
  }))
)

// Repository Mirror API
export const RepositoryMirror = {
  // GitHub API client
  apiClient: {
    baseURL: 'https://api.github.com',
    token: null,
    
    setToken: (token) => {
      RepositoryMirror.apiClient.token = token
    },
    
    request: async (endpoint, options = {}) => {
      const url = `${RepositoryMirror.apiClient.baseURL}${endpoint}`
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers
      }
      
      if (RepositoryMirror.apiClient.token) {
        headers.Authorization = `token ${RepositoryMirror.apiClient.token}`
      }
      
      const response = await fetch(url, {
        ...options,
        headers
      })
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
      }
      
      return response.json()
    }
  },
  
  // Repository operations
  searchRepositories: async (query, options = {}) => {
    try {
      useRepositoryStore.getState().setLoading(true)
      
      const params = new URLSearchParams({
        q: query,
        sort: options.sort || 'stars',
        order: options.order || 'desc',
        per_page: options.perPage || 30,
        page: options.page || 1
      })
      
      const data = await RepositoryMirror.apiClient.request(`/search/repositories?${params}`)
      return data.items
    } catch (error) {
      console.error('Repository search failed:', error)
      throw error
    } finally {
      useRepositoryStore.getState().setLoading(false)
    }
  },
  
  getRepository: async (owner, repo) => {
    try {
      const data = await RepositoryMirror.apiClient.request(`/repos/${owner}/${repo}`)
      return data
    } catch (error) {
      console.error('Failed to fetch repository:', error)
      throw error
    }
  },
  
  getRepositoryContents: async (owner, repo, path = '') => {
    try {
      const data = await RepositoryMirror.apiClient.request(`/repos/${owner}/${repo}/contents/${path}`)
      return Array.isArray(data) ? data : [data]
    } catch (error) {
      console.error('Failed to fetch repository contents:', error)
      throw error
    }
  },
  
  getFileContent: async (owner, repo, path) => {
    try {
      const data = await RepositoryMirror.apiClient.request(`/repos/${owner}/${repo}/contents/${path}`)
      if (data.content) {
        return atob(data.content)
      }
      return null
    } catch (error) {
      console.error('Failed to fetch file content:', error)
      throw error
    }
  },
  
  // Mirror repository to local storage
  mirrorRepository: async (owner, repo) => {
    try {
      useRepositoryStore.getState().setLoading(true)
      
      // Get repository metadata
      const repoData = await RepositoryMirror.getRepository(owner, repo)
      
      // Add to store
      useRepositoryStore.getState().addRepository(repoData)
      
      // Mirror file structure recursively
      const files = await RepositoryMirror.mirrorDirectoryRecursive(owner, repo, '')
      
      // Update repository with files
      useRepositoryStore.getState().updateRepository(repoData.id, {
        files,
        status: 'synced',
        size: files.reduce((total, file) => total + (file.size || 0), 0)
      })
      
      // Store in IndexedDB for offline access
      await RepositoryMirror.storeOffline(repoData.id, { ...repoData, files })
      
      return repoData
    } catch (error) {
      console.error('Repository mirroring failed:', error)
      throw error
    } finally {
      useRepositoryStore.getState().setLoading(false)
    }
  },
  
  mirrorDirectoryRecursive: async (owner, repo, path = '', maxDepth = 5, currentDepth = 0) => {
    if (currentDepth >= maxDepth) return []
    
    try {
      const contents = await RepositoryMirror.getRepositoryContents(owner, repo, path)
      const files = []
      
      for (const item of contents) {
        if (item.type === 'file') {
          // Store file metadata
          files.push({
            name: item.name,
            path: item.path,
            size: item.size,
            type: 'file',
            sha: item.sha,
            downloadUrl: item.download_url
          })
          
          // For text files under 1MB, store content
          if (item.size < 1024 * 1024 && RepositoryMirror.isTextFile(item.name)) {
            try {
              const content = await RepositoryMirror.getFileContent(owner, repo, item.path)
              files[files.length - 1].content = content
            } catch (error) {
              console.warn(`Failed to fetch content for ${item.path}:`, error)
            }
          }
        } else if (item.type === 'dir') {
          // Recursively mirror subdirectories
          const subFiles = await RepositoryMirror.mirrorDirectoryRecursive(
            owner, repo, item.path, maxDepth, currentDepth + 1
          )
          files.push({
            name: item.name,
            path: item.path,
            type: 'dir',
            children: subFiles
          })
          files.push(...subFiles)
        }
      }
      
      return files
    } catch (error) {
      console.error(`Failed to mirror directory ${path}:`, error)
      return []
    }
  },
  
  isTextFile: (filename) => {
    const textExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.scss',
      '.md', '.txt', '.yml', '.yaml', '.xml', '.py', '.java', '.c',
      '.cpp', '.h', '.php', '.rb', '.go', '.rs', '.swift', '.kt'
    ]
    return textExtensions.some(ext => filename.toLowerCase().endsWith(ext))
  },
  
  // IndexedDB storage for offline access
  dbName: 'kn3aux-repo-mirror',
  dbVersion: 1,
  
  openDB: () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(RepositoryMirror.dbName, RepositoryMirror.dbVersion)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        
        // Create repositories store
        if (!db.objectStoreNames.contains('repositories')) {
          const repoStore = db.createObjectStore('repositories', { keyPath: 'id' })
          repoStore.createIndex('name', 'name', { unique: false })
          repoStore.createIndex('owner', 'owner.login', { unique: false })
        }
        
        // Create files store
        if (!db.objectStoreNames.contains('files')) {
          const filesStore = db.createObjectStore('files', { keyPath: ['repoId', 'path'] })
          filesStore.createIndex('repoId', 'repoId', { unique: false })
        }
      }
    })
  },
  
  storeOffline: async (repoId, repoData) => {
    try {
      const db = await RepositoryMirror.openDB()
      const transaction = db.transaction(['repositories', 'files'], 'readwrite')
      
      // Store repository metadata
      const repoStore = transaction.objectStore('repositories')
      await repoStore.put(repoData)
      
      // Store files separately for better performance
      const filesStore = transaction.objectStore('files')
      for (const file of repoData.files || []) {
        await filesStore.put({
          repoId,
          ...file
        })
      }
      
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve(true)
        transaction.onerror = () => reject(transaction.error)
      })
    } catch (error) {
      console.error('Failed to store repository offline:', error)
      throw error
    }
  },
  
  loadOffline: async (repoId) => {
    try {
      const db = await RepositoryMirror.openDB()
      const transaction = db.transaction(['repositories', 'files'], 'readonly')
      
      // Load repository metadata
      const repoStore = transaction.objectStore('repositories')
      const repo = await repoStore.get(repoId)
      
      if (!repo) return null
      
      // Load files
      const filesStore = transaction.objectStore('files')
      const filesIndex = filesStore.index('repoId')
      const files = await filesIndex.getAll(repoId)
      
      repo.files = files
      return repo
    } catch (error) {
      console.error('Failed to load repository from offline storage:', error)
      return null
    }
  },
  
  // Webview utilities
  createWebview: (repository) => {
    const webview = document.createElement('webview')
    webview.src = repository.html_url
    webview.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      background: white;
    `
    
    // Add security attributes
    webview.setAttribute('allowpopups', 'false')
    webview.setAttribute('disablewebsecurity', 'false')
    
    return webview
  },
  
  // Repository analysis
  analyzeRepository: (repository) => {
    const analysis = {
      languages: {},
      fileTypes: {},
      structure: {
        depth: 0,
        totalFiles: 0,
        totalDirectories: 0
      },
      codeMetrics: {
        linesOfCode: 0,
        complexity: 0
      }
    }
    
    const analyzeFile = (file, depth = 0) => {
      if (file.type === 'dir') {
        analysis.structure.totalDirectories++
        analysis.structure.depth = Math.max(analysis.structure.depth, depth)
        file.children?.forEach(child => analyzeFile(child, depth + 1))
      } else {
        analysis.structure.totalFiles++
        
        // File type analysis
        const ext = file.name.split('.').pop()?.toLowerCase()
        if (ext) {
          analysis.fileTypes[ext] = (analysis.fileTypes[ext] || 0) + 1
        }
        
        // Language detection
        if (repository.language) {
          analysis.languages[repository.language] = (analysis.languages[repository.language] || 0) + file.size
        }
        
        // Code metrics (if content is available)
        if (file.content && RepositoryMirror.isTextFile(file.name)) {
          const lines = file.content.split('\n').length
          analysis.codeMetrics.linesOfCode += lines
        }
      }
    }
    
    repository.files?.forEach(file => analyzeFile(file))
    
    return analysis
  },
  
  // Export utilities
  exportRepository: async (repoId, format = 'zip') => {
    const repo = await RepositoryMirror.loadOffline(repoId)
    if (!repo) throw new Error('Repository not found in offline storage')
    
    switch (format) {
      case 'zip':
        return RepositoryMirror.exportAsZip(repo)
      case 'json':
        return RepositoryMirror.exportAsJSON(repo)
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  },
  
  exportAsZip: async (repo) => {
    // This would require a zip library like JSZip
    // For now, return a simple implementation
    const files = {}
    
    repo.files?.forEach(file => {
      if (file.type === 'file' && file.content) {
        files[file.path] = file.content
      }
    })
    
    return {
      name: `${repo.name}.zip`,
      files,
      metadata: {
        name: repo.name,
        description: repo.description,
        exportedAt: new Date().toISOString()
      }
    }
  },
  
  exportAsJSON: (repo) => {
    return {
      repository: repo,
      exportedAt: new Date().toISOString(),
      format: 'json'
    }
  }
}

// Initialize offline storage
RepositoryMirror.openDB().catch(console.error)

export default useRepositoryStore