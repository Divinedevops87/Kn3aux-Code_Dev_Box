import React from 'react'
import { useDrag } from 'react-dnd'
import { 
  Type, 
  Square, 
  Image, 
  MousePointer, 
  Layout,
  Smartphone,
  Grid3X3,
  AlignLeft,
  Video,
  Star
} from 'lucide-react'

const componentTypes = [
  {
    category: 'Layout',
    items: [
      { type: 'container', label: 'Container', icon: Square, color: 'bg-blue-100 text-blue-600' },
      { type: 'grid', label: 'Grid', icon: Grid3X3, color: 'bg-blue-100 text-blue-600' },
      { type: 'flex', label: 'Flex Box', icon: Layout, color: 'bg-blue-100 text-blue-600' },
    ]
  },
  {
    category: 'Content',
    items: [
      { type: 'text', label: 'Text', icon: Type, color: 'bg-green-100 text-green-600' },
      { type: 'heading', label: 'Heading', icon: AlignLeft, color: 'bg-green-100 text-green-600' },
      { type: 'image', label: 'Image', icon: Image, color: 'bg-green-100 text-green-600' },
      { type: 'video', label: 'Video', icon: Video, color: 'bg-green-100 text-green-600' },
    ]
  },
  {
    category: 'Interactive',
    items: [
      { type: 'button', label: 'Button', icon: MousePointer, color: 'bg-purple-100 text-purple-600' },
      { type: 'input', label: 'Input', icon: Square, color: 'bg-purple-100 text-purple-600' },
      { type: 'card', label: 'Card', icon: Square, color: 'bg-purple-100 text-purple-600' },
    ]
  },
  {
    category: 'Mobile',
    items: [
      { type: 'navbar', label: 'Navigation', icon: Smartphone, color: 'bg-orange-100 text-orange-600' },
      { type: 'tabbar', label: 'Tab Bar', icon: Layout, color: 'bg-orange-100 text-orange-600' },
      { type: 'hero', label: 'Hero Section', icon: Star, color: 'bg-orange-100 text-orange-600' },
    ]
  }
]

const DraggableComponent = ({ type, label, icon: Icon, color }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: { type, label },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag}
      className={`
        p-3 border border-gray-200 rounded-lg cursor-move hover:shadow-md transition-all
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        hover:border-purple-300
      `}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
    </div>
  )
}

const ComponentLibrary = () => {
  return (
    <div className="p-4 space-y-6">
      {componentTypes.map((category) => (
        <div key={category.category}>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {category.category}
          </h3>
          <div className="space-y-2">
            {category.items.map((component) => (
              <DraggableComponent
                key={component.type}
                type={component.type}
                label={component.label}
                icon={component.icon}
                color={component.color}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ComponentLibrary