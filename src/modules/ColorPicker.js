/**
 * ColorPicker - Advanced color management and palette system
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const useColorStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    currentColor: '#3B82F6',
    colorHistory: [],
    palettes: [
      {
        id: 'default',
        name: 'Default',
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280']
      },
      {
        id: 'warm',
        name: 'Warm',
        colors: ['#F97316', '#EF4444', '#F59E0B', '#DC2626', '#EA580C', '#B91C1C']
      },
      {
        id: 'cool',
        name: 'Cool',
        colors: ['#3B82F6', '#0EA5E9', '#06B6D4', '#10B981', '#059669', '#0891B2']
      },
      {
        id: 'pastel',
        name: 'Pastel',
        colors: ['#BFDBFE', '#A7F3D0', '#FEF3C7', '#FECACA', '#DDD6FE', '#D1D5DB']
      }
    ],
    customPalettes: [],
    gradients: [
      { id: 1, name: 'Ocean', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { id: 2, name: 'Sunset', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
      { id: 3, name: 'Forest', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
      { id: 4, name: 'Fire', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' }
    ],
    colorFormat: 'hex', // hex, rgb, hsl, hsv
    
    // Actions
    setCurrentColor: (color) => {
      set((state) => ({
        currentColor: color,
        colorHistory: [color, ...state.colorHistory.filter(c => c !== color)].slice(0, 20)
      }))
    },
    
    addCustomPalette: (palette) => {
      set((state) => ({
        customPalettes: [...state.customPalettes, {
          ...palette,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        }]
      }))
    },
    
    removeCustomPalette: (id) => {
      set((state) => ({
        customPalettes: state.customPalettes.filter(p => p.id !== id)
      }))
    },
    
    setColorFormat: (format) => set({ colorFormat: format }),
    
    clearHistory: () => set({ colorHistory: [] })
  }))
)

// Color utilities
export const ColorUtils = {
  // Color conversion functions
  hexToRgb: (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  },
  
  rgbToHex: (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  },
  
  hexToHsl: (hex) => {
    const rgb = ColorUtils.hexToRgb(hex)
    if (!rgb) return null
    
    const r = rgb.r / 255
    const g = rgb.g / 255
    const b = rgb.b / 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min
    const sum = max + min
    const l = sum / 2
    
    let h, s
    
    if (diff === 0) {
      h = s = 0
    } else {
      s = l > 0.5 ? diff / (2 - sum) : diff / sum
      
      switch (max) {
        case r:
          h = (g - b) / diff + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / diff + 2
          break
        case b:
          h = (r - g) / diff + 4
          break
      }
      h /= 6
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  },
  
  hslToHex: (h, s, l) => {
    s /= 100
    l /= 100
    
    const k = (n) => (n + h / 30) % 12
    const a = s * Math.min(l, 1 - l)
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
    
    const r = Math.round(255 * f(0))
    const g = Math.round(255 * f(8))
    const b = Math.round(255 * f(4))
    
    return ColorUtils.rgbToHex(r, g, b)
  },
  
  // Color manipulation
  lighten: (hex, amount) => {
    const hsl = ColorUtils.hexToHsl(hex)
    if (!hsl) return hex
    
    hsl.l = Math.min(100, hsl.l + amount)
    return ColorUtils.hslToHex(hsl.h, hsl.s, hsl.l)
  },
  
  darken: (hex, amount) => {
    const hsl = ColorUtils.hexToHsl(hex)
    if (!hsl) return hex
    
    hsl.l = Math.max(0, hsl.l - amount)
    return ColorUtils.hslToHex(hsl.h, hsl.s, hsl.l)
  },
  
  saturate: (hex, amount) => {
    const hsl = ColorUtils.hexToHsl(hex)
    if (!hsl) return hex
    
    hsl.s = Math.min(100, hsl.s + amount)
    return ColorUtils.hslToHex(hsl.h, hsl.s, hsl.l)
  },
  
  desaturate: (hex, amount) => {
    const hsl = ColorUtils.hexToHsl(hex)
    if (!hsl) return hex
    
    hsl.s = Math.max(0, hsl.s - amount)
    return ColorUtils.hslToHex(hsl.h, hsl.s, hsl.l)
  },
  
  // Color harmony
  getComplementary: (hex) => {
    const hsl = ColorUtils.hexToHsl(hex)
    if (!hsl) return hex
    
    const complementaryH = (hsl.h + 180) % 360
    return ColorUtils.hslToHex(complementaryH, hsl.s, hsl.l)
  },
  
  getTriadic: (hex) => {
    const hsl = ColorUtils.hexToHsl(hex)
    if (!hsl) return [hex]
    
    return [
      hex,
      ColorUtils.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
      ColorUtils.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)
    ]
  },
  
  getAnalogous: (hex) => {
    const hsl = ColorUtils.hexToHsl(hex)
    if (!hsl) return [hex]
    
    return [
      ColorUtils.hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
      hex,
      ColorUtils.hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l)
    ]
  },
  
  getMonochromatic: (hex, count = 5) => {
    const hsl = ColorUtils.hexToHsl(hex)
    if (!hsl) return [hex]
    
    const colors = []
    const lightnesStep = 80 / (count - 1)
    
    for (let i = 0; i < count; i++) {
      const lightness = 10 + (i * lightnesStep)
      colors.push(ColorUtils.hslToHex(hsl.h, hsl.s, lightness))
    }
    
    return colors
  },
  
  // Accessibility
  getContrast: (color1, color2) => {
    const getLuminance = (hex) => {
      const rgb = ColorUtils.hexToRgb(hex)
      if (!rgb) return 0
      
      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    
    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  },
  
  isAccessible: (foreground, background, level = 'AA') => {
    const contrast = ColorUtils.getContrast(foreground, background)
    const requirements = {
      'AAA': 7,
      'AA': 4.5,
      'AA-large': 3
    }
    
    return contrast >= requirements[level]
  },
  
  findAccessibleColor: (baseColor, background, level = 'AA') => {
    let testColor = baseColor
    let lightness = 50
    let direction = 1
    
    for (let i = 0; i < 100; i++) {
      if (ColorUtils.isAccessible(testColor, background, level)) {
        return testColor
      }
      
      lightness += direction * 5
      
      if (lightness >= 100 || lightness <= 0) {
        direction *= -1
        lightness = 50 + (direction * 5)
      }
      
      const hsl = ColorUtils.hexToHsl(baseColor)
      if (hsl) {
        testColor = ColorUtils.hslToHex(hsl.h, hsl.s, lightness)
      }
    }
    
    return baseColor
  },
  
  // Color naming
  getColorName: (hex) => {
    const colorNames = {
      '#FF0000': 'Red',
      '#00FF00': 'Green',
      '#0000FF': 'Blue',
      '#FFFF00': 'Yellow',
      '#FF00FF': 'Magenta',
      '#00FFFF': 'Cyan',
      '#000000': 'Black',
      '#FFFFFF': 'White',
      '#808080': 'Gray',
      '#FFA500': 'Orange',
      '#800080': 'Purple',
      '#FFC0CB': 'Pink',
      '#A52A2A': 'Brown',
      '#008000': 'Dark Green',
      '#000080': 'Navy'
    }
    
    // Find closest color name
    let closestColor = hex
    let minDistance = Infinity
    
    Object.keys(colorNames).forEach(color => {
      const distance = ColorUtils.colorDistance(hex, color)
      if (distance < minDistance) {
        minDistance = distance
        closestColor = color
      }
    })
    
    return colorNames[closestColor] || 'Unknown'
  },
  
  colorDistance: (color1, color2) => {
    const rgb1 = ColorUtils.hexToRgb(color1)
    const rgb2 = ColorUtils.hexToRgb(color2)
    
    if (!rgb1 || !rgb2) return Infinity
    
    return Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    )
  },
  
  // Gradient utilities
  createGradient: (colors, direction = 'to right') => {
    const colorStops = colors.map((color, index) => {
      const percent = (index / (colors.length - 1)) * 100
      return `${color} ${percent}%`
    }).join(', ')
    
    return `linear-gradient(${direction}, ${colorStops})`
  },
  
  extractGradientColors: (gradient) => {
    const colorRegex = /#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)/g
    return gradient.match(colorRegex) || []
  },
  
  // Color palette generation
  generatePalette: (baseColor, type = 'monochromatic') => {
    switch (type) {
      case 'monochromatic':
        return ColorUtils.getMonochromatic(baseColor)
      case 'analogous':
        return ColorUtils.getAnalogous(baseColor)
      case 'triadic':
        return ColorUtils.getTriadic(baseColor)
      case 'complementary':
        return [baseColor, ColorUtils.getComplementary(baseColor)]
      default:
        return [baseColor]
    }
  },
  
  // Export/Import
  exportPalette: (palette, format = 'hex') => {
    const colors = palette.colors.map(color => {
      switch (format) {
        case 'rgb':
          const rgb = ColorUtils.hexToRgb(color)
          return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : color
        case 'hsl':
          const hsl = ColorUtils.hexToHsl(color)
          return hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : color
        default:
          return color
      }
    })
    
    return {
      name: palette.name,
      colors,
      format
    }
  },
  
  importPalette: (paletteData) => {
    const colors = paletteData.colors.map(color => {
      // Convert to hex if needed
      if (color.startsWith('rgb')) {
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
        if (match) {
          return ColorUtils.rgbToHex(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]))
        }
      } else if (color.startsWith('hsl')) {
        const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
        if (match) {
          return ColorUtils.hslToHex(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]))
        }
      }
      return color
    })
    
    return {
      name: paletteData.name,
      colors
    }
  }
}

export default useColorStore