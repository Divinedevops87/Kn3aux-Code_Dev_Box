/**
 * MediaScanner - Advanced media file scanning and management system
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const useMediaStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    mediaFiles: [],
    scanningProgress: 0,
    isScanning: false,
    selectedFiles: [],
    filters: {
      type: '', // image, video, audio, document
      size: '', // small, medium, large
      format: '',
      dateRange: null
    },
    
    // Actions
    addMediaFile: (file) => {
      set((state) => ({
        mediaFiles: [...state.mediaFiles, {
          id: Date.now().toString(),
          addedAt: new Date().toISOString(),
          ...file
        }]
      }))
    },
    
    removeMediaFile: (id) => {
      set((state) => ({
        mediaFiles: state.mediaFiles.filter(f => f.id !== id),
        selectedFiles: state.selectedFiles.filter(f => f !== id)
      }))
    },
    
    setScanning: (scanning) => set({ isScanning: scanning }),
    setScanningProgress: (progress) => set({ scanningProgress: progress }),
    
    setFilters: (filters) => {
      set((state) => ({
        filters: { ...state.filters, ...filters }
      }))
    },
    
    selectFile: (id) => {
      set((state) => ({
        selectedFiles: state.selectedFiles.includes(id)
          ? state.selectedFiles.filter(f => f !== id)
          : [...state.selectedFiles, id]
      }))
    },
    
    selectAllFiles: () => {
      const filteredFiles = get().getFilteredFiles()
      set({ selectedFiles: filteredFiles.map(f => f.id) })
    },
    
    clearSelection: () => set({ selectedFiles: [] }),
    
    // Computed
    getFilteredFiles: () => {
      const { mediaFiles, filters } = get()
      
      return mediaFiles.filter(file => {
        if (filters.type && file.type !== filters.type) return false
        if (filters.format && !file.name.toLowerCase().endsWith(filters.format)) return false
        
        if (filters.size) {
          const sizeMB = file.size / (1024 * 1024)
          switch (filters.size) {
            case 'small':
              if (sizeMB > 10) return false
              break
            case 'medium':
              if (sizeMB <= 10 || sizeMB > 100) return false
              break
            case 'large':
              if (sizeMB <= 100) return false
              break
          }
        }
        
        if (filters.dateRange) {
          const fileDate = new Date(file.addedAt)
          const start = new Date(filters.dateRange.start)
          const end = new Date(filters.dateRange.end)
          if (fileDate < start || fileDate > end) return false
        }
        
        return true
      })
    }
  }))
)

// Media Scanner API
export const MediaScanner = {
  // File processing
  scanFiles: async (files) => {
    useMediaStore.getState().setScanning(true)
    useMediaStore.getState().setScanningProgress(0)
    
    const processedFiles = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      try {
        const processedFile = await MediaScanner.processFile(file)
        if (processedFile) {
          processedFiles.push(processedFile)
          useMediaStore.getState().addMediaFile(processedFile)
        }
      } catch (error) {
        console.error(`Failed to process file ${file.name}:`, error)
      }
      
      // Update progress
      const progress = ((i + 1) / files.length) * 100
      useMediaStore.getState().setScanningProgress(progress)
    }
    
    useMediaStore.getState().setScanning(false)
    return processedFiles
  },
  
  processFile: async (file) => {
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: MediaScanner.getFileType(file),
      format: MediaScanner.getFileFormat(file),
      lastModified: file.lastModified,
      url: URL.createObjectURL(file)
    }
    
    // Generate metadata based on file type
    switch (fileInfo.type) {
      case 'image':
        fileInfo.metadata = await MediaScanner.getImageMetadata(file)
        break
      case 'video':
        fileInfo.metadata = await MediaScanner.getVideoMetadata(file)
        break
      case 'audio':
        fileInfo.metadata = await MediaScanner.getAudioMetadata(file)
        break
      case 'document':
        fileInfo.metadata = await MediaScanner.getDocumentMetadata(file)
        break
    }
    
    // Generate thumbnail
    fileInfo.thumbnail = await MediaScanner.generateThumbnail(file, fileInfo.type)
    
    return fileInfo
  },
  
  getFileType: (file) => {
    const mimeType = file.type.toLowerCase()
    
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    if (mimeType.startsWith('text/') || 
        mimeType.includes('pdf') || 
        mimeType.includes('document') ||
        mimeType.includes('spreadsheet') ||
        mimeType.includes('presentation')) return 'document'
    
    return 'other'
  },
  
  getFileFormat: (file) => {
    return file.name.split('.').pop()?.toLowerCase() || 'unknown'
  },
  
  // Metadata extraction
  getImageMetadata: async (file) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const metadata = {
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
          megapixels: (img.width * img.height) / 1000000
        }
        
        // Extract EXIF data if available
        MediaScanner.extractEXIF(file).then(exif => {
          metadata.exif = exif
          resolve(metadata)
        }).catch(() => resolve(metadata))
      }
      img.onerror = () => resolve({ error: 'Failed to load image' })
      img.src = URL.createObjectURL(file)
    })
  },
  
  getVideoMetadata: async (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      
      video.onloadedmetadata = () => {
        const metadata = {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          aspectRatio: video.videoWidth / video.videoHeight
        }
        resolve(metadata)
      }
      
      video.onerror = () => resolve({ error: 'Failed to load video' })
      video.src = URL.createObjectURL(file)
    })
  },
  
  getAudioMetadata: async (file) => {
    return new Promise((resolve) => {
      const audio = document.createElement('audio')
      audio.preload = 'metadata'
      
      audio.onloadedmetadata = () => {
        const metadata = {
          duration: audio.duration
        }
        resolve(metadata)
      }
      
      audio.onerror = () => resolve({ error: 'Failed to load audio' })
      audio.src = URL.createObjectURL(file)
    })
  },
  
  getDocumentMetadata: async (file) => {
    const metadata = {
      pages: null,
      author: null,
      title: null,
      keywords: []
    }
    
    // For PDF files, we could use PDF.js to extract metadata
    if (file.type === 'application/pdf') {
      // This would require PDF.js library
      metadata.type = 'PDF'
    }
    
    return metadata
  },
  
  extractEXIF: async (file) => {
    // This would require an EXIF library like exif-js
    // For now, return mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          make: 'Unknown',
          model: 'Unknown',
          dateTime: null,
          gps: null
        })
      }, 100)
    })
  },
  
  // Thumbnail generation
  generateThumbnail: async (file, type) => {
    switch (type) {
      case 'image':
        return MediaScanner.generateImageThumbnail(file)
      case 'video':
        return MediaScanner.generateVideoThumbnail(file)
      case 'document':
        return MediaScanner.generateDocumentThumbnail(file)
      default:
        return MediaScanner.generateGenericThumbnail(file)
    }
  },
  
  generateImageThumbnail: async (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        const maxSize = 200
        const ratio = Math.min(maxSize / img.width, maxSize / img.height)
        
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      
      img.onerror = () => resolve(null)
      img.src = URL.createObjectURL(file)
    })
  },
  
  generateVideoThumbnail: async (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      video.onloadedmetadata = () => {
        video.currentTime = Math.min(1, video.duration / 2) // Seek to middle
      }
      
      video.onseeked = () => {
        const maxSize = 200
        const ratio = Math.min(maxSize / video.videoWidth, maxSize / video.videoHeight)
        
        canvas.width = video.videoWidth * ratio
        canvas.height = video.videoHeight * ratio
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      
      video.onerror = () => resolve(null)
      video.src = URL.createObjectURL(file)
    })
  },
  
  generateDocumentThumbnail: async (file) => {
    // For now, return a generic document icon
    return null
  },
  
  generateGenericThumbnail: async (file) => {
    // Generate a colored thumbnail with file extension
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    canvas.width = 200
    canvas.height = 200
    
    // Background
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 0, 200, 200)
    
    // File icon
    ctx.fillStyle = '#6b7280'
    ctx.font = '16px sans-serif'
    ctx.textAlign = 'center'
    
    const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE'
    ctx.fillText(ext, 100, 110)
    
    return canvas.toDataURL('image/png')
  },
  
  // File organization
  organizeByDate: (files) => {
    const organized = {}
    
    files.forEach(file => {
      const date = new Date(file.addedAt).toDateString()
      if (!organized[date]) {
        organized[date] = []
      }
      organized[date].push(file)
    })
    
    return organized
  },
  
  organizeByType: (files) => {
    const organized = {
      image: [],
      video: [],
      audio: [],
      document: [],
      other: []
    }
    
    files.forEach(file => {
      organized[file.type].push(file)
    })
    
    return organized
  },
  
  organizeBySize: (files) => {
    const organized = {
      small: [], // < 10MB
      medium: [], // 10MB - 100MB
      large: [] // > 100MB
    }
    
    files.forEach(file => {
      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB < 10) {
        organized.small.push(file)
      } else if (sizeMB < 100) {
        organized.medium.push(file)
      } else {
        organized.large.push(file)
      }
    })
    
    return organized
  },
  
  // Search and filtering
  searchFiles: (query, files) => {
    const lowerQuery = query.toLowerCase()
    
    return files.filter(file => 
      file.name.toLowerCase().includes(lowerQuery) ||
      file.format.toLowerCase().includes(lowerQuery) ||
      file.type.toLowerCase().includes(lowerQuery)
    )
  },
  
  // Batch operations
  batchDelete: (fileIds) => {
    fileIds.forEach(id => {
      useMediaStore.getState().removeMediaFile(id)
    })
  },
  
  batchDownload: async (fileIds) => {
    const files = useMediaStore.getState().mediaFiles.filter(f => fileIds.includes(f.id))
    
    for (const file of files) {
      const link = document.createElement('a')
      link.href = file.url
      link.download = file.name
      link.click()
    }
  },
  
  batchCompress: async (fileIds) => {
    // This would require a compression library
    const files = useMediaStore.getState().mediaFiles.filter(f => fileIds.includes(f.id))
    const compressed = []
    
    for (const file of files) {
      // Mock compression
      const compressedFile = {
        ...file,
        size: Math.floor(file.size * 0.7), // 30% reduction
        name: file.name.replace(/\.[^/.]+$/, '_compressed.$&')
      }
      compressed.push(compressedFile)
    }
    
    return compressed
  },
  
  // Analytics
  getAnalytics: () => {
    const files = useMediaStore.getState().mediaFiles
    
    const analytics = {
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
      typeBreakdown: {},
      formatBreakdown: {},
      sizeBreakdown: { small: 0, medium: 0, large: 0 },
      averageSize: 0
    }
    
    files.forEach(file => {
      // Type breakdown
      analytics.typeBreakdown[file.type] = (analytics.typeBreakdown[file.type] || 0) + 1
      
      // Format breakdown
      analytics.formatBreakdown[file.format] = (analytics.formatBreakdown[file.format] || 0) + 1
      
      // Size breakdown
      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB < 10) {
        analytics.sizeBreakdown.small++
      } else if (sizeMB < 100) {
        analytics.sizeBreakdown.medium++
      } else {
        analytics.sizeBreakdown.large++
      }
    })
    
    analytics.averageSize = analytics.totalSize / (analytics.totalFiles || 1)
    
    return analytics
  },
  
  // Export/Import
  exportMediaList: (format = 'json') => {
    const files = useMediaStore.getState().mediaFiles
    
    switch (format) {
      case 'json':
        return JSON.stringify({
          files: files.map(f => ({
            name: f.name,
            size: f.size,
            type: f.type,
            format: f.format,
            addedAt: f.addedAt,
            metadata: f.metadata
          })),
          exportedAt: new Date().toISOString()
        }, null, 2)
      
      case 'csv':
        const headers = ['name', 'size', 'type', 'format', 'addedAt']
        const rows = files.map(f => [
          f.name,
          f.size,
          f.type,
          f.format,
          f.addedAt
        ])
        return [headers, ...rows].map(row => row.join(',')).join('\n')
      
      default:
        return files
    }
  },
  
  // Cleanup
  cleanupOrphanedUrls: () => {
    const files = useMediaStore.getState().mediaFiles
    files.forEach(file => {
      if (file.url && file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url)
      }
    })
  }
}

export default useMediaStore