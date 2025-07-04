import React from 'react'
import { useDrop } from 'react-dnd'
import { useBuilderStore } from '../store/builderStore'
import ComponentRenderer from './ComponentRenderer'
import { generateId } from '../utils/helpers'

const Canvas = () => {
  const { components, addComponent, previewMode } = useBuilderStore()

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'component',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset()
      const canvasRect = document.getElementById('canvas').getBoundingClientRect()
      
      const x = offset.x - canvasRect.left
      const y = offset.y - canvasRect.top

      addComponent({
        id: generateId(),
        type: item.type,
        label: item.label,
        position: { x, y },
        props: getDefaultProps(item.type),
        style: getDefaultStyle(item.type)
      })
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  const getDefaultProps = (type) => {
    const defaults = {
      text: { content: 'Sample Text' },
      heading: { content: 'Heading', level: 'h2' },
      button: { text: 'Click Me', variant: 'primary' },
      image: { src: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Sample Image' },
      input: { placeholder: 'Enter text...', type: 'text' },
      card: { title: 'Card Title', content: 'Card content goes here' },
      container: { padding: '20px' },
      navbar: { title: 'App Name', showBack: false },
      tabbar: { tabs: ['Home', 'Search', 'Profile'] },
      hero: { title: 'Welcome', subtitle: 'Build amazing apps' },
      video: { src: '', poster: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400' }
    }
    return defaults[type] || {}
  }

  const getDefaultStyle = (type) => {
    const defaults = {
      text: { fontSize: '16px', color: '#374151' },
      heading: { fontSize: '24px', fontWeight: 'bold', color: '#111827' },
      button: { 
        backgroundColor: '#8B5CF6', 
        color: 'white', 
        padding: '12px 24px', 
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer'
      },
      image: { width: '200px', height: '150px', objectFit: 'cover', borderRadius: '8px' },
      input: { 
        padding: '12px', 
        border: '1px solid #D1D5DB', 
        borderRadius: '8px',
        width: '200px'
      },
      card: { 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        width: '300px'
      },
      container: { 
        backgroundColor: '#F9FAFB', 
        padding: '20px', 
        borderRadius: '8px',
        minHeight: '100px',
        width: '100%'
      },
      navbar: {
        backgroundColor: '#8B5CF6',
        color: 'white',
        padding: '16px',
        width: '100%'
      },
      tabbar: {
        backgroundColor: 'white',
        borderTop: '1px solid #E5E7EB',
        padding: '12px',
        width: '100%'
      },
      hero: {
        backgroundColor: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
        color: 'white',
        padding: '60px 20px',
        textAlign: 'center',
        width: '100%'
      }
    }
    return defaults[type] || {}
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-100">
      <div
        id="canvas"
        ref={drop}
        className={`
          min-h-full relative p-4
          ${isOver ? 'bg-purple-50 border-2 border-dashed border-purple-300' : ''}
          ${previewMode ? 'bg-white' : ''}
        `}
      >
        {components.length === 0 && !previewMode && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building</h3>
              <p className="text-gray-500 max-w-sm">
                Drag components from the sidebar to start building your mobile app
              </p>
            </div>
          </div>
        )}

        {components.map((component) => (
          <ComponentRenderer
            key={component.id}
            component={component}
            isPreview={previewMode}
          />
        ))}
      </div>
    </div>
  )
}

export default Canvas