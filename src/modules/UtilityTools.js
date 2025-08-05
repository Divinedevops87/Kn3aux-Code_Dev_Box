/**
 * UtilityTools - Collection of advanced utility tools and helpers
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const useUtilityStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    tools: {
      colorPicker: { active: false, color: '#000000' },
      ruler: { active: false, measurements: [] },
      eyedropper: { active: false, history: [] },
      magnifier: { active: false, zoom: 2 },
      gridOverlay: { active: false, size: 8, opacity: 0.3 },
      pixelPerfect: { active: false, overlayImage: null }
    },
    clipboard: {
      items: [],
      maxItems: 20
    },
    shortcuts: {},
    
    // Actions
    toggleTool: (toolName) => {
      set((state) => ({
        tools: {
          ...state.tools,
          [toolName]: {
            ...state.tools[toolName],
            active: !state.tools[toolName].active
          }
        }
      }))
    },
    
    updateTool: (toolName, updates) => {
      set((state) => ({
        tools: {
          ...state.tools,
          [toolName]: {
            ...state.tools[toolName],
            ...updates
          }
        }
      }))
    },
    
    addToClipboard: (item) => {
      set((state) => ({
        clipboard: {
          ...state.clipboard,
          items: [
            { id: Date.now(), timestamp: new Date().toISOString(), ...item },
            ...state.clipboard.items
          ].slice(0, state.clipboard.maxItems)
        }
      }))
    },
    
    clearClipboard: () => {
      set((state) => ({
        clipboard: { ...state.clipboard, items: [] }
      }))
    }
  }))
)

// Utility Tools API
export const UtilityTools = {
  // Color utilities
  colorPicker: {
    pick: async (x, y) => {
      try {
        // Use EyeDropper API if available
        if ('EyeDropper' in window) {
          const eyeDropper = new EyeDropper()
          const result = await eyeDropper.open()
          
          useUtilityStore.getState().updateTool('colorPicker', {
            color: result.sRGBHex,
            lastPicked: { x, y, color: result.sRGBHex }
          })
          
          return result.sRGBHex
        } else {
          // Fallback: canvas-based color picking
          return UtilityTools.colorPicker.pickFromCanvas(x, y)
        }
      } catch (error) {
        console.error('Color picking failed:', error)
        return null
      }
    },
    
    pickFromCanvas: (x, y) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      
      // This would capture the screen content in a real implementation
      // For now, return a mock color
      const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']
      const color = colors[Math.floor(Math.random() * colors.length)]
      
      useUtilityStore.getState().updateTool('colorPicker', {
        color,
        lastPicked: { x, y, color }
      })
      
      return color
    },
    
    getHistory: () => {
      return useUtilityStore.getState().tools.colorPicker.history || []
    },
    
    addToHistory: (color) => {
      const tool = useUtilityStore.getState().tools.colorPicker
      const history = tool.history || []
      
      if (!history.includes(color)) {
        useUtilityStore.getState().updateTool('colorPicker', {
          history: [color, ...history].slice(0, 20)
        })
      }
    }
  },
  
  // Measurement tools
  ruler: {
    start: (x, y) => {
      useUtilityStore.getState().updateTool('ruler', {
        active: true,
        startPoint: { x, y },
        currentPoint: { x, y },
        measuring: true
      })
    },
    
    update: (x, y) => {
      const tool = useUtilityStore.getState().tools.ruler
      if (tool.measuring) {
        const distance = Math.sqrt(
          Math.pow(x - tool.startPoint.x, 2) + Math.pow(y - tool.startPoint.y, 2)
        )
        
        useUtilityStore.getState().updateTool('ruler', {
          currentPoint: { x, y },
          distance: Math.round(distance)
        })
      }
    },
    
    end: () => {
      const tool = useUtilityStore.getState().tools.ruler
      if (tool.measuring) {
        const measurement = {
          id: Date.now(),
          start: tool.startPoint,
          end: tool.currentPoint,
          distance: tool.distance,
          timestamp: new Date().toISOString()
        }
        
        useUtilityStore.getState().updateTool('ruler', {
          measuring: false,
          measurements: [...(tool.measurements || []), measurement]
        })
      }
    },
    
    clear: () => {
      useUtilityStore.getState().updateTool('ruler', {
        measurements: [],
        measuring: false
      })
    }
  },
  
  // Magnifier tool
  magnifier: {
    setZoom: (zoom) => {
      useUtilityStore.getState().updateTool('magnifier', { zoom })
    },
    
    move: (x, y) => {
      useUtilityStore.getState().updateTool('magnifier', {
        position: { x, y }
      })
    },
    
    capture: (x, y, size = 100) => {
      // Create a magnified view of the area around x, y
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const zoom = useUtilityStore.getState().tools.magnifier.zoom
      
      canvas.width = size
      canvas.height = size
      
      // This would capture and magnify the actual content
      // For now, create a mock magnified view
      ctx.fillStyle = '#f0f0f0'
      ctx.fillRect(0, 0, size, size)
      
      // Draw grid
      ctx.strokeStyle = '#ccc'
      ctx.lineWidth = 1
      const gridSize = zoom
      
      for (let i = 0; i <= size; i += gridSize) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, size)
        ctx.stroke()
        
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(size, i)
        ctx.stroke()
      }
      
      // Center crosshair
      ctx.strokeStyle = '#ff0000'
      ctx.lineWidth = 2
      const center = size / 2
      
      ctx.beginPath()
      ctx.moveTo(center - 10, center)
      ctx.lineTo(center + 10, center)
      ctx.moveTo(center, center - 10)
      ctx.lineTo(center, center + 10)
      ctx.stroke()
      
      return canvas.toDataURL()
    }
  },
  
  // Grid overlay
  gridOverlay: {
    show: (size = 8, opacity = 0.3) => {
      UtilityTools.gridOverlay.remove() // Remove existing
      
      const grid = document.createElement('div')
      grid.id = 'kn3aux-grid-overlay'
      grid.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 9999;
        opacity: ${opacity};
        background-image: 
          linear-gradient(to right, #000 1px, transparent 1px),
          linear-gradient(to bottom, #000 1px, transparent 1px);
        background-size: ${size}px ${size}px;
      `
      
      document.body.appendChild(grid)
      
      useUtilityStore.getState().updateTool('gridOverlay', {
        active: true,
        size,
        opacity
      })
    },
    
    hide: () => {
      UtilityTools.gridOverlay.remove()
      useUtilityStore.getState().updateTool('gridOverlay', { active: false })
    },
    
    remove: () => {
      const existing = document.getElementById('kn3aux-grid-overlay')
      if (existing) {
        existing.remove()
      }
    },
    
    updateSize: (size) => {
      const grid = document.getElementById('kn3aux-grid-overlay')
      if (grid) {
        grid.style.backgroundSize = `${size}px ${size}px`
        useUtilityStore.getState().updateTool('gridOverlay', { size })
      }
    },
    
    updateOpacity: (opacity) => {
      const grid = document.getElementById('kn3aux-grid-overlay')
      if (grid) {
        grid.style.opacity = opacity
        useUtilityStore.getState().updateTool('gridOverlay', { opacity })
      }
    }
  },
  
  // Pixel perfect tool
  pixelPerfect: {
    loadImage: (imageUrl) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        UtilityTools.pixelPerfect.showOverlay(img)
        useUtilityStore.getState().updateTool('pixelPerfect', {
          overlayImage: imageUrl,
          active: true
        })
      }
      img.src = imageUrl
    },
    
    showOverlay: (img) => {
      UtilityTools.pixelPerfect.remove() // Remove existing
      
      const overlay = document.createElement('div')
      overlay.id = 'kn3aux-pixel-perfect-overlay'
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 9998;
        opacity: 0.5;
        background-image: url(${img.src});
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
        mix-blend-mode: difference;
      `
      
      document.body.appendChild(overlay)
    },
    
    hide: () => {
      UtilityTools.pixelPerfect.remove()
      useUtilityStore.getState().updateTool('pixelPerfect', { active: false })
    },
    
    remove: () => {
      const existing = document.getElementById('kn3aux-pixel-perfect-overlay')
      if (existing) {
        existing.remove()
      }
    },
    
    updateOpacity: (opacity) => {
      const overlay = document.getElementById('kn3aux-pixel-perfect-overlay')
      if (overlay) {
        overlay.style.opacity = opacity
      }
    },
    
    updateBlendMode: (mode) => {
      const overlay = document.getElementById('kn3aux-pixel-perfect-overlay')
      if (overlay) {
        overlay.style.mixBlendMode = mode
      }
    }
  },
  
  // Advanced clipboard
  clipboard: {
    copy: (data, type = 'text') => {
      const item = {
        type,
        data,
        preview: UtilityTools.clipboard.generatePreview(data, type)
      }
      
      useUtilityStore.getState().addToClipboard(item)
      
      // Also copy to system clipboard if possible
      if (type === 'text' && navigator.clipboard) {
        navigator.clipboard.writeText(typeof data === 'string' ? data : JSON.stringify(data))
      }
      
      return item
    },
    
    paste: async (index = 0) => {
      const items = useUtilityStore.getState().clipboard.items
      if (items[index]) {
        return items[index]
      }
      
      // Try system clipboard as fallback
      if (navigator.clipboard) {
        try {
          const text = await navigator.clipboard.readText()
          return { type: 'text', data: text, preview: text.slice(0, 50) }
        } catch (error) {
          console.warn('Could not read from clipboard:', error)
        }
      }
      
      return null
    },
    
    generatePreview: (data, type) => {
      switch (type) {
        case 'text':
          return typeof data === 'string' ? data.slice(0, 50) : JSON.stringify(data).slice(0, 50)
        case 'image':
          return data.slice(0, 50) + '...'
        case 'component':
          return `Component: ${data.type || 'Unknown'}`
        default:
          return 'Data item'
      }
    },
    
    clear: () => {
      useUtilityStore.getState().clearClipboard()
    },
    
    getHistory: () => {
      return useUtilityStore.getState().clipboard.items
    }
  },
  
  // Device simulation
  deviceSimulator: {
    devices: {
      'iPhone 14': { width: 390, height: 844, pixelRatio: 3 },
      'iPhone 14 Pro Max': { width: 430, height: 932, pixelRatio: 3 },
      'iPad Air': { width: 820, height: 1180, pixelRatio: 2 },
      'MacBook Air': { width: 1440, height: 900, pixelRatio: 2 },
      'Desktop': { width: 1920, height: 1080, pixelRatio: 1 }
    },
    
    simulate: (deviceName) => {
      const device = UtilityTools.deviceSimulator.devices[deviceName]
      if (!device) return false
      
      // Create viewport simulation
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.content = `width=${device.width}, initial-scale=${1/device.pixelRatio}`
      }
      
      // Simulate screen size (visual only)
      const simulatorFrame = document.createElement('div')
      simulatorFrame.id = 'kn3aux-device-simulator'
      simulatorFrame.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: ${device.width}px;
        height: ${device.height}px;
        border: 2px solid #333;
        border-radius: ${deviceName.includes('iPhone') ? '25px' : '10px'};
        background: white;
        z-index: 10000;
        overflow: hidden;
        box-shadow: 0 10px 50px rgba(0,0,0,0.3);
      `
      
      const iframe = document.createElement('iframe')
      iframe.src = window.location.href
      iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        transform: scale(${1/device.pixelRatio});
        transform-origin: top left;
      `
      
      simulatorFrame.appendChild(iframe)
      document.body.appendChild(simulatorFrame)
      
      return true
    },
    
    stop: () => {
      const simulator = document.getElementById('kn3aux-device-simulator')
      if (simulator) {
        simulator.remove()
      }
      
      // Reset viewport
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=no'
      }
    }
  },
  
  // Performance monitor
  performance: {
    monitor: () => {
      const stats = {
        memory: UtilityTools.performance.getMemoryUsage(),
        timing: UtilityTools.performance.getPageTiming(),
        fps: UtilityTools.performance.getFPS(),
        resources: UtilityTools.performance.getResourceTiming()
      }
      return stats
    },
    
    getMemoryUsage: () => {
      if (performance.memory) {
        return {
          used: Math.round(performance.memory.usedJSHeapSize / 1048576),
          total: Math.round(performance.memory.totalJSHeapSize / 1048576),
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
        }
      }
      return null
    },
    
    getPageTiming: () => {
      const timing = performance.timing
      return {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0
      }
    },
    
    getFPS: () => {
      // Simplified FPS calculation
      return Math.round(1000 / 16.67) // Assuming 60fps target
    },
    
    getResourceTiming: () => {
      return performance.getEntriesByType('resource').map(entry => ({
        name: entry.name.split('/').pop(),
        duration: Math.round(entry.duration),
        size: entry.transferSize || 0,
        type: entry.initiatorType
      }))
    }
  },
  
  // Code formatters
  formatters: {
    html: (html) => {
      // Basic HTML formatting
      return html
        .replace(/></g, '>\n<')
        .replace(/\n\s*\n/g, '\n')
        .split('\n')
        .map((line, index, array) => {
          const depth = line.match(/^(\s*)/)?.[1]?.length || 0
          const isClosing = line.trim().startsWith('</')
          const indent = '  '.repeat(Math.max(0, depth + (isClosing ? -1 : 0)))
          return indent + line.trim()
        })
        .join('\n')
    },
    
    css: (css) => {
      // Basic CSS formatting
      return css
        .replace(/;\s*/g, ';\n  ')
        .replace(/{\s*/g, ' {\n  ')
        .replace(/}\s*/g, '\n}\n\n')
        .replace(/,\s*/g, ',\n')
    },
    
    javascript: (js) => {
      // Basic JS formatting (would use Prettier in real implementation)
      return js
        .replace(/;/g, ';\n')
        .replace(/{/g, ' {\n  ')
        .replace(/}/g, '\n}\n')
    }
  },
  
  // Validators
  validators: {
    html: (html) => {
      const errors = []
      
      // Check for unclosed tags
      const openTags = html.match(/<[^/][^>]*>/g) || []
      const closeTags = html.match(/<\/[^>]*>/g) || []
      
      if (openTags.length !== closeTags.length) {
        errors.push('Mismatched HTML tags detected')
      }
      
      // Check for invalid attributes
      if (html.includes('onclick=') || html.includes('onload=')) {
        errors.push('Inline event handlers detected (security risk)')
      }
      
      return errors
    },
    
    css: (css) => {
      const errors = []
      
      // Check for syntax errors
      if ((css.match(/{/g) || []).length !== (css.match(/}/g) || []).length) {
        errors.push('Mismatched CSS braces')
      }
      
      // Check for invalid properties
      const invalidProps = css.match(/[^-a-z]color\s*:\s*[^;]+/gi)
      if (invalidProps) {
        errors.push('Potentially invalid CSS color values')
      }
      
      return errors
    }
  },
  
  // Cleanup
  cleanup: () => {
    UtilityTools.gridOverlay.remove()
    UtilityTools.pixelPerfect.remove()
    UtilityTools.deviceSimulator.stop()
  },
  
  // Initialization
  init: () => {
    // Set up keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'g':
            e.preventDefault()
            UtilityTools.gridOverlay.show()
            break
          case 'm':
            e.preventDefault()
            useUtilityStore.getState().toggleTool('magnifier')
            break
        }
      }
    })
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', UtilityTools.cleanup)
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  UtilityTools.init()
}

export default useUtilityStore