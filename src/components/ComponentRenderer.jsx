import React from 'react'
import { useDrag } from 'react-dnd'
import { useBuilderStore } from '../store/builderStore'

const ComponentRenderer = ({ component, isPreview }) => {
  const { selectComponent, selectedComponent, updateComponent } = useBuilderStore()

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'existing-component',
    item: { id: component.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [component.id])

  const isSelected = selectedComponent?.id === component.id

  const handleClick = (e) => {
    if (!isPreview) {
      e.stopPropagation()
      selectComponent(component)
    }
  }

  const renderComponent = () => {
    const { type, props, style } = component

    switch (type) {
      case 'text':
        return (
          <span style={style}>
            {props.content}
          </span>
        )

      case 'heading':
        const HeadingTag = props.level || 'h2'
        return React.createElement(HeadingTag, { style }, props.content)

      case 'button':
        return (
          <button style={style} className="transition-all hover:opacity-80">
            {props.text}
          </button>
        )

      case 'image':
        return (
          <img 
            src={props.src} 
            alt={props.alt} 
            style={style}
            className="object-cover"
          />
        )

      case 'input':
        return (
          <input 
            type={props.type || 'text'}
            placeholder={props.placeholder}
            style={style}
            className="focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        )

      case 'card':
        return (
          <div style={style}>
            <h3 className="font-semibold text-lg mb-2">{props.title}</h3>
            <p className="text-gray-600">{props.content}</p>
          </div>
        )

      case 'container':
        return (
          <div style={style} className="border-2 border-dashed border-gray-300">
            <p className="text-gray-500 text-center">Container - Drop components here</p>
          </div>
        )

      case 'navbar':
        return (
          <nav style={style} className="flex items-center justify-between">
            {props.showBack && (
              <button className="text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="font-semibold text-lg">{props.title}</h1>
            <div className="w-6"></div>
          </nav>
        )

      case 'tabbar':
        return (
          <div style={style}>
            <div className="flex justify-around">
              {props.tabs?.map((tab, index) => (
                <button key={index} className="py-2 px-4 text-sm font-medium text-gray-600 hover:text-purple-600">
                  {tab}
                </button>
              ))}
            </div>
          </div>
        )

      case 'hero':
        return (
          <div style={style}>
            <h1 className="text-4xl font-bold mb-4">{props.title}</h1>
            <p className="text-xl opacity-90">{props.subtitle}</p>
          </div>
        )

      case 'video':
        return (
          <video 
            style={style}
            poster={props.poster}
            controls
            className="rounded-lg"
          >
            {props.src && <source src={props.src} type="video/mp4" />}
            Your browser does not support the video tag.
          </video>
        )

      default:
        return (
          <div style={style} className="p-4 bg-gray-100 border border-gray-300 rounded">
            <p className="text-gray-600">Unknown component: {type}</p>
          </div>
        )
    }
  }

  return (
    <div
      ref={!isPreview ? drag : null}
      onClick={handleClick}
      className={`
        absolute cursor-pointer transition-all
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        ${isSelected && !isPreview ? 'ring-2 ring-purple-500 ring-offset-2' : ''}
        ${!isPreview ? 'hover:ring-1 hover:ring-purple-300' : ''}
      `}
      style={{
        left: component.position.x,
        top: component.position.y,
      }}
    >
      {renderComponent()}
    </div>
  )
}

export default ComponentRenderer