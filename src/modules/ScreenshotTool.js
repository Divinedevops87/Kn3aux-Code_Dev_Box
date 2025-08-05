/**
 * ScreenshotTool - Advanced screenshot and screen recording capabilities
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const useScreenshotStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    screenshots: [],
    recordings: [],
    isCapturing: false,
    isRecording: false,
    captureMode: 'element', // element, viewport, fullpage, selection
    format: 'png', // png, jpeg, webp
    quality: 0.9,
    settings: {
      includeBackground: true,
      pixelRatio: window.devicePixelRatio || 1,
      delay: 0,
      watermark: false,
      annotation: false
    },
    
    // Actions
    addScreenshot: (screenshot) => {
      set((state) => ({
        screenshots: [{
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          ...screenshot
        }, ...state.screenshots].slice(0, 50) // Keep last 50
      }))
    },
    
    addRecording: (recording) => {
      set((state) => ({
        recordings: [{
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          ...recording
        }, ...state.recordings].slice(0, 20) // Keep last 20
      }))
    },
    
    removeScreenshot: (id) => {
      set((state) => ({
        screenshots: state.screenshots.filter(s => s.id !== id)
      }))
    },
    
    removeRecording: (id) => {
      set((state) => ({
        recordings: state.recordings.filter(r => r.id !== id)
      }))
    },
    
    setCapturing: (capturing) => set({ isCapturing: capturing }),
    setRecording: (recording) => set({ isRecording: recording }),
    setCaptureMode: (mode) => set({ captureMode: mode }),
    setFormat: (format) => set({ format }),
    setQuality: (quality) => set({ quality }),
    
    updateSettings: (updates) => {
      set((state) => ({
        settings: { ...state.settings, ...updates }
      }))
    }
  }))
)

// Screenshot Tool API
export const ScreenshotTool = {
  // Element capture
  captureElement: async (element, options = {}) => {
    if (!element) throw new Error('Element not provided')
    
    const store = useScreenshotStore.getState()
    store.setCapturing(true)
    
    try {
      const settings = { ...store.settings, ...options }
      
      // Wait for delay if specified
      if (settings.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, settings.delay))
      }
      
      // Use html2canvas for element capture
      const canvas = await ScreenshotTool.createCanvas(element, settings)
      const dataUrl = canvas.toDataURL(`image/${store.format}`, store.quality)
      
      const screenshot = {
        type: 'element',
        dataUrl,
        width: canvas.width,
        height: canvas.height,
        format: store.format,
        quality: store.quality,
        elementInfo: {
          tagName: element.tagName,
          className: element.className,
          id: element.id
        }
      }
      
      // Add watermark if enabled
      if (settings.watermark) {
        screenshot.dataUrl = await ScreenshotTool.addWatermark(screenshot.dataUrl)
      }
      
      store.addScreenshot(screenshot)
      return screenshot
    } catch (error) {
      console.error('Element capture failed:', error)
      throw error
    } finally {
      store.setCapturing(false)
    }
  },
  
  // Viewport capture
  captureViewport: async (options = {}) => {
    const store = useScreenshotStore.getState()
    store.setCapturing(true)
    
    try {
      const settings = { ...store.settings, ...options }
      
      if (settings.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, settings.delay))
      }
      
      const canvas = await ScreenshotTool.createCanvas(document.body, {
        ...settings,
        width: window.innerWidth,
        height: window.innerHeight
      })
      
      const dataUrl = canvas.toDataURL(`image/${store.format}`, store.quality)
      
      const screenshot = {
        type: 'viewport',
        dataUrl,
        width: canvas.width,
        height: canvas.height,
        format: store.format,
        quality: store.quality,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
      
      if (settings.watermark) {
        screenshot.dataUrl = await ScreenshotTool.addWatermark(screenshot.dataUrl)
      }
      
      store.addScreenshot(screenshot)
      return screenshot
    } catch (error) {
      console.error('Viewport capture failed:', error)
      throw error
    } finally {
      store.setCapturing(false)
    }
  },
  
  // Full page capture
  captureFullPage: async (options = {}) => {
    const store = useScreenshotStore.getState()
    store.setCapturing(true)
    
    try {
      const settings = { ...store.settings, ...options }
      
      if (settings.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, settings.delay))
      }
      
      // Get full page dimensions
      const body = document.body
      const html = document.documentElement
      const height = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      )
      
      const canvas = await ScreenshotTool.createCanvas(document.body, {
        ...settings,
        width: window.innerWidth,
        height: height,
        scrollX: 0,
        scrollY: 0
      })
      
      const dataUrl = canvas.toDataURL(`image/${store.format}`, store.quality)
      
      const screenshot = {
        type: 'fullpage',
        dataUrl,
        width: canvas.width,
        height: canvas.height,
        format: store.format,
        quality: store.quality,
        fullPage: {
          scrollHeight: height,
          viewportHeight: window.innerHeight
        }
      }
      
      if (settings.watermark) {
        screenshot.dataUrl = await ScreenshotTool.addWatermark(screenshot.dataUrl)
      }
      
      store.addScreenshot(screenshot)
      return screenshot
    } catch (error) {
      console.error('Full page capture failed:', error)
      throw error
    } finally {
      store.setCapturing(false)
    }
  },
  
  // Selection capture
  captureSelection: async (x, y, width, height, options = {}) => {
    const store = useScreenshotStore.getState()
    store.setCapturing(true)
    
    try {
      const settings = { ...store.settings, ...options }
      
      if (settings.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, settings.delay))
      }
      
      // Create temporary div to capture selection
      const selectionDiv = document.createElement('div')
      selectionDiv.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: ${width}px;
        height: ${height}px;
        pointer-events: none;
        z-index: 9999;
      `
      
      document.body.appendChild(selectionDiv)
      
      const canvas = await ScreenshotTool.createCanvas(selectionDiv, settings)
      const dataUrl = canvas.toDataURL(`image/${store.format}`, store.quality)
      
      document.body.removeChild(selectionDiv)
      
      const screenshot = {
        type: 'selection',
        dataUrl,
        width: canvas.width,
        height: canvas.height,
        format: store.format,
        quality: store.quality,
        selection: { x, y, width, height }
      }
      
      if (settings.watermark) {
        screenshot.dataUrl = await ScreenshotTool.addWatermark(screenshot.dataUrl)
      }
      
      store.addScreenshot(screenshot)
      return screenshot
    } catch (error) {
      console.error('Selection capture failed:', error)
      throw error
    } finally {
      store.setCapturing(false)
    }
  },
  
  // Canvas creation using html2canvas (mock implementation)
  createCanvas: async (element, options = {}) => {
    // This would use html2canvas in a real implementation
    // For now, create a mock canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    const rect = element.getBoundingClientRect()
    canvas.width = options.width || rect.width
    canvas.height = options.height || rect.height
    
    // Mock capture - fill with gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#f0f0f0')
    gradient.addColorStop(1, '#e0e0e0')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Add some mock content
    ctx.fillStyle = '#333'
    ctx.font = '16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Screenshot Placeholder', canvas.width / 2, canvas.height / 2)
    
    return canvas
  },
  
  // Screen recording
  startRecording: async (options = {}) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      throw new Error('Screen recording not supported in this browser')
    }
    
    const store = useScreenshotStore.getState()
    
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: options.includeAudio || false
      })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      })
      
      const chunks = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        
        const recording = {
          type: 'screen',
          url,
          blob,
          duration: Date.now() - startTime,
          mimeType: 'video/webm',
          size: blob.size
        }
        
        store.addRecording(recording)
        store.setRecording(false)
      }
      
      const startTime = Date.now()
      mediaRecorder.start()
      store.setRecording(true)
      
      // Return control object
      return {
        stop: () => {
          mediaRecorder.stop()
          stream.getTracks().forEach(track => track.stop())
        },
        pause: () => mediaRecorder.pause(),
        resume: () => mediaRecorder.resume(),
        stream
      }
    } catch (error) {
      console.error('Failed to start recording:', error)
      throw error
    }
  },
  
  // Watermark
  addWatermark: async (dataUrl, text = 'KN3AUX-CODE™') => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        canvas.width = img.width
        canvas.height = img.height
        
        // Draw original image
        ctx.drawImage(img, 0, 0)
        
        // Add watermark
        ctx.font = '16px Arial'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.textAlign = 'right'
        ctx.fillText(text, canvas.width - 10, canvas.height - 10)
        
        resolve(canvas.toDataURL())
      }
      img.src = dataUrl
    })
  },
  
  // Annotation
  addAnnotation: async (dataUrl, annotations) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        canvas.width = img.width
        canvas.height = img.height
        
        // Draw original image
        ctx.drawImage(img, 0, 0)
        
        // Add annotations
        annotations.forEach(annotation => {
          ScreenshotTool.drawAnnotation(ctx, annotation)
        })
        
        resolve(canvas.toDataURL())
      }
      img.src = dataUrl
    })
  },
  
  drawAnnotation: (ctx, annotation) => {
    ctx.save()
    
    switch (annotation.type) {
      case 'arrow':
        ScreenshotTool.drawArrow(ctx, annotation)
        break
      case 'rectangle':
        ScreenshotTool.drawRectangle(ctx, annotation)
        break
      case 'circle':
        ScreenshotTool.drawCircle(ctx, annotation)
        break
      case 'text':
        ScreenshotTool.drawText(ctx, annotation)
        break
      case 'line':
        ScreenshotTool.drawLine(ctx, annotation)
        break
    }
    
    ctx.restore()
  },
  
  drawArrow: (ctx, { from, to, color = '#ff0000', width = 3 }) => {
    const headLength = 10
    const angle = Math.atan2(to.y - from.y, to.x - from.x)
    
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    
    // Draw line
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()
    
    // Draw arrowhead
    ctx.beginPath()
    ctx.moveTo(to.x, to.y)
    ctx.lineTo(
      to.x - headLength * Math.cos(angle - Math.PI / 6),
      to.y - headLength * Math.sin(angle - Math.PI / 6)
    )
    ctx.moveTo(to.x, to.y)
    ctx.lineTo(
      to.x - headLength * Math.cos(angle + Math.PI / 6),
      to.y - headLength * Math.sin(angle + Math.PI / 6)
    )
    ctx.stroke()
  },
  
  drawRectangle: (ctx, { x, y, width, height, color = '#ff0000', lineWidth = 3, fill = false }) => {
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    
    if (fill) {
      ctx.fillStyle = color + '33' // Add transparency
      ctx.fillRect(x, y, width, height)
    }
    
    ctx.strokeRect(x, y, width, height)
  },
  
  drawCircle: (ctx, { x, y, radius, color = '#ff0000', lineWidth = 3, fill = false }) => {
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    
    if (fill) {
      ctx.fillStyle = color + '33'
      ctx.fill()
    }
    
    ctx.stroke()
  },
  
  drawText: (ctx, { x, y, text, color = '#ff0000', fontSize = 16, font = 'Arial' }) => {
    ctx.fillStyle = color
    ctx.font = `${fontSize}px ${font}`
    ctx.fillText(text, x, y)
  },
  
  drawLine: (ctx, { from, to, color = '#ff0000', width = 3 }) => {
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()
  },
  
  // Download utilities
  downloadScreenshot: (screenshot, filename) => {
    const link = document.createElement('a')
    link.download = filename || `screenshot-${Date.now()}.${screenshot.format}`
    link.href = screenshot.dataUrl
    link.click()
  },
  
  downloadRecording: (recording, filename) => {
    const link = document.createElement('a')
    link.download = filename || `recording-${Date.now()}.webm`
    link.href = recording.url
    link.click()
  },
  
  // Batch operations
  downloadAllScreenshots: () => {
    const screenshots = useScreenshotStore.getState().screenshots
    screenshots.forEach((screenshot, index) => {
      setTimeout(() => {
        ScreenshotTool.downloadScreenshot(screenshot, `screenshot-${index + 1}.${screenshot.format}`)
      }, index * 500) // Stagger downloads
    })
  },
  
  // Clipboard
  copyToClipboard: async (dataUrl) => {
    try {
      const blob = await fetch(dataUrl).then(r => r.blob())
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ])
      return true
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return false
    }
  },
  
  // Settings
  updateSettings: (settings) => {
    useScreenshotStore.getState().updateSettings(settings)
  },
  
  resetSettings: () => {
    useScreenshotStore.getState().updateSettings({
      includeBackground: true,
      pixelRatio: window.devicePixelRatio || 1,
      delay: 0,
      watermark: false,
      annotation: false
    })
  },
  
  // Cleanup
  cleanup: () => {
    const recordings = useScreenshotStore.getState().recordings
    recordings.forEach(recording => {
      if (recording.url) {
        URL.revokeObjectURL(recording.url)
      }
    })
  }
}

export default useScreenshotStore