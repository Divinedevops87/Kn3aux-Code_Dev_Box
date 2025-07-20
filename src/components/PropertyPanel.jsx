import React from 'react'
import { X, Trash2, Copy } from 'lucide-react'
import { useBuilderStore } from '../store/builderStore'
import { isMobile } from '../utils/deviceDetection'

const PropertyPanel = ({ isOpen, onClose }) => {
  const { selectedComponent, updateComponent, deleteComponent, duplicateComponent } = useBuilderStore()

  if (!selectedComponent) return null

  const handlePropertyChange = (property, value) => {
    updateComponent(selectedComponent.id, {
      ...selectedComponent,
      props: {
        ...selectedComponent.props,
        [property]: value
      }
    })
  }

  const handleStyleChange = (property, value) => {
    updateComponent(selectedComponent.id, {
      ...selectedComponent,
      style: {
        ...selectedComponent.style,
        [property]: value
      }
    })
  }

  const handleDelete = () => {
    deleteComponent(selectedComponent.id)
    if (isMobile()) {
      onClose()
    }
  }

  const handleDuplicate = () => {
    duplicateComponent(selectedComponent.id)
  }

  const renderPropertyInputs = () => {
    const { type, props, style } = selectedComponent

    switch (type) {
      case 'text':
        return (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                value={props.content || ''}
                onChange={(e) => handlePropertyChange('content', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md resize-none"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Font Size</label>
              <input
                type="text"
                value={style.fontSize || '16px'}
                onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Color</label>
              <input
                type="color"
                value={style.color || '#000000'}
                onChange={(e) => handleStyleChange('color', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>
          </>
        )

      case 'heading':
        return (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <input
                type="text"
                value={props.content || ''}
                onChange={(e) => handlePropertyChange('content', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Level</label>
              <select
                value={props.level || 'h2'}
                onChange={(e) => handlePropertyChange('level', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="h1">H1</option>
                <option value="h2">H2</option>
                <option value="h3">H3</option>
                <option value="h4">H4</option>
                <option value="h5">H5</option>
                <option value="h6">H6</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Color</label>
              <input
                type="color"
                value={style.color || '#000000'}
                onChange={(e) => handleStyleChange('color', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>
          </>
        )

      case 'button':
        return (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Text</label>
              <input
                type="text"
                value={props.text || ''}
                onChange={(e) => handlePropertyChange('text', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Background Color</label>
              <input
                type="color"
                value={style.backgroundColor || '#8B5CF6'}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Text Color</label>
              <input
                type="color"
                value={style.color || '#ffffff'}
                onChange={(e) => handleStyleChange('color', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>
          </>
        )

      case 'image':
        return (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Image URL</label>
              <input
                type="url"
                value={props.src || ''}
                onChange={(e) => handlePropertyChange('src', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Alt Text</label>
              <input
                type="text"
                value={props.alt || ''}
                onChange={(e) => handlePropertyChange('alt', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Width</label>
              <input
                type="text"
                value={style.width || '200px'}
                onChange={(e) => handleStyleChange('width', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Height</label>
              <input
                type="text"
                value={style.height || '150px'}
                onChange={(e) => handleStyleChange('height', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </>
        )

      default:
        return (
          <div className="text-gray-500 text-center py-8">
            <p>No properties available for this component</p>
          </div>
        )
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Properties</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDuplicate}
            className="p-1 text-purple-600 hover:bg-purple-50 rounded"
            title="Duplicate Component (Ctrl+D)"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete Component"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {isMobile() && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Component Type</label>
          <div className="p-2 bg-gray-50 rounded-md text-sm text-gray-600 capitalize">
            {selectedComponent.type}
          </div>
        </div>

        {renderPropertyInputs()}
      </div>
    </div>
  )
}

export default PropertyPanel