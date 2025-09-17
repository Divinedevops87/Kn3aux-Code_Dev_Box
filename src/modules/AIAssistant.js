/**
 * AIAssistant - AI-powered design suggestions and code generation
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const useAIStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    isEnabled: false,
    suggestions: [],
    currentContext: null,
    chatHistory: [],
    isProcessing: false,
    models: {
      design: 'gpt-4-vision',
      code: 'gpt-4',
      optimization: 'claude-3'
    },
    preferences: {
      suggestionLevel: 'medium', // low, medium, high
      autoApply: false,
      contextAware: true
    },
    
    // Actions
    enable: () => set({ isEnabled: true }),
    disable: () => set({ isEnabled: false }),
    
    setProcessing: (processing) => set({ isProcessing: processing }),
    
    addSuggestion: (suggestion) => {
      set((state) => ({
        suggestions: [...state.suggestions, {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...suggestion
        }].slice(-50) // Keep last 50 suggestions
      }))
    },
    
    removeSuggestion: (id) => {
      set((state) => ({
        suggestions: state.suggestions.filter(s => s.id !== id)
      }))
    },
    
    addChatMessage: (message) => {
      set((state) => ({
        chatHistory: [...state.chatHistory, {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...message
        }].slice(-100) // Keep last 100 messages
      }))
    },
    
    setContext: (context) => set({ currentContext: context }),
    
    updatePreferences: (updates) => {
      set((state) => ({
        preferences: { ...state.preferences, ...updates }
      }))
    },
    
    clearSuggestions: () => set({ suggestions: [] }),
    clearChat: () => set({ chatHistory: [] })
  }))
)

// AI Assistant API
export const AIAssistant = {
  // Mock AI API - In production, this would connect to actual AI services
  apiClient: {
    async generateSuggestions(context) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const suggestions = []
      
      // Component-specific suggestions
      if (context.type === 'component') {
        suggestions.push({
          type: 'improvement',
          title: 'Accessibility Enhancement',
          description: 'Add aria-label for better screen reader support',
          code: `aria-label="${context.component.type} component"`,
          confidence: 0.9
        })
        
        if (context.component.type === 'button') {
          suggestions.push({
            type: 'style',
            title: 'Modern Button Design',
            description: 'Apply rounded corners and hover effects',
            code: 'className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"',
            confidence: 0.8
          })
        }
      }
      
      // Layout suggestions
      if (context.type === 'layout') {
        suggestions.push({
          type: 'optimization',
          title: 'Responsive Grid',
          description: 'Use CSS Grid for better responsive layout',
          code: 'display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));',
          confidence: 0.85
        })
      }
      
      // Performance suggestions
      suggestions.push({
        type: 'performance',
        title: 'Image Optimization',
        description: 'Add lazy loading to images',
        code: 'loading="lazy"',
        confidence: 0.75
      })
      
      return suggestions
    },
    
    async generateCode(prompt, context) {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock code generation based on prompt
      const templates = {
        'create button': `<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
  Click me
</button>`,
        'create card': `<div className="bg-white rounded-lg shadow-md p-6">
  <h3 className="text-lg font-semibold mb-2">Card Title</h3>
  <p className="text-gray-600">Card content goes here...</p>
</div>`,
        'create form': `<form className="space-y-4">
  <div>
    <label className="block text-sm font-medium mb-1">Name</label>
    <input 
      type="text" 
      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      placeholder="Enter your name"
    />
  </div>
  <button 
    type="submit"
    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
  >
    Submit
  </button>
</form>`,
        'create navigation': `<nav className="bg-white shadow-sm">
  <div className="max-w-7xl mx-auto px-4">
    <div className="flex justify-between items-center h-16">
      <div className="font-bold text-xl">Logo</div>
      <div className="hidden md:flex space-x-6">
        <a href="#" className="text-gray-600 hover:text-gray-900">Home</a>
        <a href="#" className="text-gray-600 hover:text-gray-900">About</a>
        <a href="#" className="text-gray-600 hover:text-gray-900">Contact</a>
      </div>
    </div>
  </div>
</nav>`
      }
      
      const lowerPrompt = prompt.toLowerCase()
      const matchedTemplate = Object.keys(templates).find(key => 
        lowerPrompt.includes(key)
      )
      
      if (matchedTemplate) {
        return {
          code: templates[matchedTemplate],
          explanation: `Generated a ${matchedTemplate.replace('create ', '')} component with modern styling and responsive design.`
        }
      }
      
      return {
        code: `// Generated code for: ${prompt}
const Component = () => {
  return (
    <div className="p-4">
      <h2>Generated Component</h2>
      <p>This is a placeholder for your ${prompt}</p>
    </div>
  )
}`,
        explanation: `Created a basic component structure for: ${prompt}`
      }
    },
    
    async optimizeComponent(component) {
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      const optimizations = []
      
      // Performance optimizations
      if (!component.props?.loading) {
        optimizations.push({
          type: 'performance',
          suggestion: 'Add lazy loading attribute',
          before: component.code,
          after: component.code.replace('<img', '<img loading="lazy"'),
          impact: 'Improves page load speed'
        })
      }
      
      // Accessibility optimizations
      if (!component.props?.['aria-label']) {
        optimizations.push({
          type: 'accessibility',
          suggestion: 'Add ARIA label',
          before: component.code,
          after: component.code.replace('>', ` aria-label="${component.type} component">`),
          impact: 'Better screen reader support'
        })
      }
      
      // SEO optimizations
      if (component.type === 'image' && !component.props?.alt) {
        optimizations.push({
          type: 'seo',
          suggestion: 'Add descriptive alt text',
          before: component.code,
          after: component.code.replace('<img', '<img alt="Descriptive image text"'),
          impact: 'Improved SEO and accessibility'
        })
      }
      
      return optimizations
    },
    
    async generateDesignSystem(components) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      return {
        colors: {
          primary: '#3B82F6',
          secondary: '#6B7280',
          accent: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444'
        },
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          sizes: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem'
          }
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
          '2xl': '3rem'
        },
        components: {
          button: {
            base: 'px-4 py-2 rounded-lg font-medium transition-colors',
            variants: {
              primary: 'bg-blue-500 text-white hover:bg-blue-600',
              secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
              outline: 'border border-blue-500 text-blue-500 hover:bg-blue-50'
            }
          },
          card: {
            base: 'bg-white rounded-lg shadow-sm border',
            variants: {
              elevated: 'shadow-lg',
              flat: 'shadow-none border-2'
            }
          }
        }
      }
    }
  },
  
  // Suggestion engine
  analyzePage: async (components, layout) => {
    useAIStore.getState().setProcessing(true)
    
    try {
      const context = {
        type: 'page',
        components,
        layout,
        timestamp: Date.now()
      }
      
      useAIStore.getState().setContext(context)
      
      // Generate suggestions
      const suggestions = await AIAssistant.apiClient.generateSuggestions(context)
      
      suggestions.forEach(suggestion => {
        useAIStore.getState().addSuggestion(suggestion)
      })
      
      return suggestions
    } catch (error) {
      console.error('Page analysis failed:', error)
      return []
    } finally {
      useAIStore.getState().setProcessing(false)
    }
  },
  
  analyzeComponent: async (component) => {
    useAIStore.getState().setProcessing(true)
    
    try {
      const context = {
        type: 'component',
        component,
        timestamp: Date.now()
      }
      
      const suggestions = await AIAssistant.apiClient.generateSuggestions(context)
      
      suggestions.forEach(suggestion => {
        useAIStore.getState().addSuggestion({
          ...suggestion,
          targetComponent: component.id
        })
      })
      
      return suggestions
    } catch (error) {
      console.error('Component analysis failed:', error)
      return []
    } finally {
      useAIStore.getState().setProcessing(false)
    }
  },
  
  // Code generation
  generateFromPrompt: async (prompt) => {
    useAIStore.getState().setProcessing(true)
    
    try {
      const context = useAIStore.getState().currentContext
      const result = await AIAssistant.apiClient.generateCode(prompt, context)
      
      useAIStore.getState().addChatMessage({
        type: 'user',
        content: prompt
      })
      
      useAIStore.getState().addChatMessage({
        type: 'assistant',
        content: result.explanation,
        code: result.code
      })
      
      return result
    } catch (error) {
      console.error('Code generation failed:', error)
      useAIStore.getState().addChatMessage({
        type: 'error',
        content: 'Failed to generate code. Please try again.'
      })
      throw error
    } finally {
      useAIStore.getState().setProcessing(false)
    }
  },
  
  // Optimization
  optimizeComponent: async (component) => {
    useAIStore.getState().setProcessing(true)
    
    try {
      const optimizations = await AIAssistant.apiClient.optimizeComponent(component)
      
      optimizations.forEach(optimization => {
        useAIStore.getState().addSuggestion({
          type: 'optimization',
          title: optimization.suggestion,
          description: optimization.impact,
          code: optimization.after,
          confidence: 0.9,
          targetComponent: component.id
        })
      })
      
      return optimizations
    } catch (error) {
      console.error('Component optimization failed:', error)
      return []
    } finally {
      useAIStore.getState().setProcessing(false)
    }
  },
  
  // Design system generation
  generateDesignSystem: async (components) => {
    useAIStore.getState().setProcessing(true)
    
    try {
      const designSystem = await AIAssistant.apiClient.generateDesignSystem(components)
      
      useAIStore.getState().addSuggestion({
        type: 'design_system',
        title: 'Generated Design System',
        description: 'Consistent styling system based on your components',
        data: designSystem,
        confidence: 0.95
      })
      
      return designSystem
    } catch (error) {
      console.error('Design system generation failed:', error)
      return null
    } finally {
      useAIStore.getState().setProcessing(false)
    }
  },
  
  // Smart suggestions based on user behavior
  generateContextualSuggestions: (userAction, component) => {
    const suggestions = []
    
    switch (userAction) {
      case 'component_selected':
        if (component.type === 'button') {
          suggestions.push({
            type: 'enhancement',
            title: 'Add Loading State',
            description: 'Include loading spinner for better UX',
            confidence: 0.8
          })
        }
        break
        
      case 'component_moved':
        suggestions.push({
          type: 'layout',
          title: 'Alignment Helper',
          description: 'Use CSS Grid or Flexbox for precise alignment',
          confidence: 0.7
        })
        break
        
      case 'style_changed':
        suggestions.push({
          type: 'consistency',
          title: 'Apply to Similar Components',
          description: 'Maintain design consistency across similar elements',
          confidence: 0.85
        })
        break
    }
    
    suggestions.forEach(suggestion => {
      useAIStore.getState().addSuggestion(suggestion)
    })
    
    return suggestions
  },
  
  // Auto-completion for properties
  getPropertySuggestions: (componentType, currentProps) => {
    const commonProps = {
      button: ['onClick', 'disabled', 'type', 'aria-label', 'className'],
      input: ['type', 'placeholder', 'value', 'onChange', 'required', 'aria-label'],
      image: ['src', 'alt', 'loading', 'width', 'height', 'className'],
      div: ['className', 'id', 'role', 'aria-label']
    }
    
    const suggested = commonProps[componentType] || []
    const missing = suggested.filter(prop => !currentProps.hasOwnProperty(prop))
    
    return missing.map(prop => ({
      property: prop,
      description: `Recommended property for ${componentType} components`,
      example: AIAssistant.getPropertyExample(prop, componentType)
    }))
  },
  
  getPropertyExample: (property, componentType) => {
    const examples = {
      onClick: '() => console.log("clicked")',
      className: '"px-4 py-2 bg-blue-500 text-white rounded"',
      'aria-label': `"${componentType} component"`,
      placeholder: '"Enter text here..."',
      alt: '"Descriptive image text"',
      loading: '"lazy"'
    }
    
    return examples[property] || '""'
  },
  
  // Template suggestions
  suggestTemplates: (componentType) => {
    const templates = {
      button: [
        {
          name: 'Primary Button',
          code: '<button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Click me</button>'
        },
        {
          name: 'Icon Button',
          code: '<button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><Icon className="w-5 h-5" /></button>'
        }
      ],
      card: [
        {
          name: 'Basic Card',
          code: '<div className="bg-white p-6 rounded-lg shadow-md"><h3>Title</h3><p>Content</p></div>'
        },
        {
          name: 'Product Card',
          code: '<div className="bg-white rounded-lg shadow-md overflow-hidden"><img src="" alt="" className="w-full h-48 object-cover" /><div className="p-4"><h3>Product Name</h3><p className="text-gray-600">$99.99</p></div></div>'
        }
      ]
    }
    
    return templates[componentType] || []
  },
  
  // Learning and adaptation
  learnFromUserAction: (action, component, outcome) => {
    // Store user preferences and patterns
    const learningData = {
      action,
      component: {
        type: component.type,
        props: Object.keys(component.props || {})
      },
      outcome,
      timestamp: Date.now()
    }
    
    // In a real implementation, this would be sent to a learning service
    console.log('Learning from user action:', learningData)
  },
  
  // Export/Import AI settings
  exportSettings: () => {
    const state = useAIStore.getState()
    return {
      preferences: state.preferences,
      models: state.models,
      exportedAt: new Date().toISOString()
    }
  },
  
  importSettings: (settings) => {
    useAIStore.setState((state) => ({
      preferences: { ...state.preferences, ...settings.preferences },
      models: { ...state.models, ...settings.models }
    }))
  }
}

export default useAIStore