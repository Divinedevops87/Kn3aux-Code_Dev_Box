import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Square, RotateCcw, Settings, Layers, Zap, Clock, Repeat, Move3D } from 'lucide-react'

const AnimationStudio = ({ isOpen, onClose, selectedComponent }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(2000)
  const [selectedKeyframe, setSelectedKeyframe] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [animationProperties, setAnimationProperties] = useState({
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
    opacity: 1,
    skewX: 0,
    skewY: 0
  })
  
  const animationRef = useRef(null)
  const timelineRef = useRef(null)

  // Predefined animation presets
  const animationPresets = {
    fadeIn: {
      name: 'Fade In',
      keyframes: [
        { time: 0, opacity: 0 },
        { time: 1000, opacity: 1 }
      ]
    },
    slideInLeft: {
      name: 'Slide In Left',
      keyframes: [
        { time: 0, x: -100, opacity: 0 },
        { time: 1000, x: 0, opacity: 1 }
      ]
    },
    bounce: {
      name: 'Bounce',
      keyframes: [
        { time: 0, scale: 1 },
        { time: 500, scale: 1.2 },
        { time: 1000, scale: 1 },
        { time: 1500, scale: 1.1 },
        { time: 2000, scale: 1 }
      ]
    },
    rotate: {
      name: 'Rotate',
      keyframes: [
        { time: 0, rotation: 0 },
        { time: 2000, rotation: 360 }
      ]
    },
    pulse: {
      name: 'Pulse',
      keyframes: [
        { time: 0, scale: 1, opacity: 1 },
        { time: 500, scale: 1.1, opacity: 0.7 },
        { time: 1000, scale: 1, opacity: 1 }
      ]
    }
  }

  // Easing functions
  const easingFunctions = {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    cubicBezier: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  }

  useEffect(() => {
    let animationId
    
    if (isPlaying) {
      const startTime = Date.now() - currentTime
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        
        if (elapsed >= duration) {
          setCurrentTime(duration)
          setIsPlaying(false)
        } else {
          setCurrentTime(elapsed)
          animationId = requestAnimationFrame(animate)
        }
      }
      
      animationId = requestAnimationFrame(animate)
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isPlaying, currentTime, duration])

  const playAnimation = () => {
    setIsPlaying(true)
  }

  const pauseAnimation = () => {
    setIsPlaying(false)
  }

  const stopAnimation = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const resetAnimation = () => {
    setIsPlaying(false)
    setCurrentTime(0)
    setAnimationProperties({
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      opacity: 1,
      skewX: 0,
      skewY: 0
    })
  }

  const addKeyframe = () => {
    const newKeyframe = {
      id: Date.now(),
      time: currentTime,
      properties: { ...animationProperties },
      easing: 'ease-in-out'
    }
    
    setTimeline([...timeline, newKeyframe].sort((a, b) => a.time - b.time))
  }

  const removeKeyframe = (id) => {
    setTimeline(timeline.filter(kf => kf.id !== id))
  }

  const updateKeyframe = (id, updates) => {
    setTimeline(timeline.map(kf => 
      kf.id === id ? { ...kf, ...updates } : kf
    ))
  }

  const applyPreset = (preset) => {
    const keyframes = preset.keyframes.map((kf, index) => ({
      id: Date.now() + index,
      time: kf.time,
      properties: { ...animationProperties, ...kf },
      easing: 'ease-in-out'
    }))
    
    setTimeline(keyframes)
    setDuration(Math.max(...keyframes.map(kf => kf.time)))
  }

  const generateCSS = () => {
    if (timeline.length === 0) return ''
    
    const keyframeSteps = timeline.map((kf, index) => {
      const percentage = (kf.time / duration) * 100
      const transforms = []
      
      if (kf.properties.x !== 0) transforms.push(`translateX(${kf.properties.x}px)`)
      if (kf.properties.y !== 0) transforms.push(`translateY(${kf.properties.y}px)`)
      if (kf.properties.rotation !== 0) transforms.push(`rotate(${kf.properties.rotation}deg)`)
      if (kf.properties.scale !== 1) transforms.push(`scale(${kf.properties.scale})`)
      if (kf.properties.skewX !== 0) transforms.push(`skewX(${kf.properties.skewX}deg)`)
      if (kf.properties.skewY !== 0) transforms.push(`skewY(${kf.properties.skewY}deg)`)
      
      return `${percentage}% {
        transform: ${transforms.join(' ') || 'none'};
        opacity: ${kf.properties.opacity};
      }`
    }).join('\n  ')
    
    return `@keyframes customAnimation {
  ${keyframeSteps}
}

.animated-element {
  animation: customAnimation ${duration}ms ease-in-out;
}`
  }

  const generateReactSpring = () => {
    if (timeline.length === 0) return ''
    
    const config = timeline.map(kf => ({
      time: kf.time,
      transform: `translateX(${kf.properties.x}px) translateY(${kf.properties.y}px) rotate(${kf.properties.rotation}deg) scale(${kf.properties.scale})`,
      opacity: kf.properties.opacity
    }))
    
    return `import { useSpring, animated } from 'react-spring'

const AnimatedComponent = () => {
  const springs = useSpring({
    to: ${JSON.stringify(config[config.length - 1] || {}, null, 4)},
    config: { duration: ${duration} }
  })
  
  return (
    <animated.div style={springs}>
      {/* Your component content */}
    </animated.div>
  )
}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Animation Studio</h2>
              <p className="text-purple-100">Create stunning animations with visual timeline editing</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Properties */}
          <div className="w-80 bg-gray-50 border-r p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Animation Controls */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Play className="w-4 h-4 mr-2" />
                  Controls
                </h3>
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={playAnimation}
                    disabled={isPlaying}
                    className="flex-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 disabled:opacity-50 flex items-center justify-center"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Play
                  </button>
                  <button
                    onClick={pauseAnimation}
                    disabled={!isPlaying}
                    className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 disabled:opacity-50 flex items-center justify-center"
                  >
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </button>
                  <button
                    onClick={stopAnimation}
                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 flex items-center justify-center"
                  >
                    <Square className="w-4 h-4 mr-1" />
                    Stop
                  </button>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Duration (ms)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded"
                    min="100"
                    step="100"
                  />
                </div>
              </div>

              {/* Animation Properties */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Properties
                </h3>
                <div className="space-y-3">
                  {Object.entries(animationProperties).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium capitalize">{key}</label>
                      <input
                        type="range"
                        min={key === 'opacity' ? 0 : key === 'scale' ? 0.1 : -200}
                        max={key === 'opacity' ? 1 : key === 'scale' ? 3 : key === 'rotation' ? 360 : 200}
                        step={key === 'opacity' ? 0.1 : key === 'scale' ? 0.1 : 1}
                        value={value}
                        onChange={(e) => setAnimationProperties({
                          ...animationProperties,
                          [key]: parseFloat(e.target.value)
                        })}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 text-right">{value}</div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={addKeyframe}
                  className="w-full mt-4 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
                >
                  Add Keyframe
                </button>
              </div>

              {/* Presets */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Presets
                </h3>
                <div className="space-y-2">
                  {Object.entries(animationPresets).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => applyPreset(preset)}
                      className="w-full text-left px-3 py-2 bg-white border rounded hover:bg-gray-50"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel - Preview */}
          <div className="flex-1 flex flex-col">
            {/* Preview Area */}
            <div className="flex-1 bg-gray-100 p-8 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}></div>
              
              <div
                ref={animationRef}
                className="w-32 h-32 bg-blue-500 rounded-lg shadow-lg flex items-center justify-center text-white font-bold transition-all duration-100"
                style={{
                  transform: `translateX(${animationProperties.x}px) translateY(${animationProperties.y}px) rotate(${animationProperties.rotation}deg) scale(${animationProperties.scale}) skewX(${animationProperties.skewX}deg) skewY(${animationProperties.skewY}deg)`,
                  opacity: animationProperties.opacity
                }}
              >
                {selectedComponent?.type || 'Element'}
              </div>
            </div>

            {/* Timeline */}
            <div className="h-48 bg-white border-t">
              <div className="p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Timeline
                </h3>
                
                {/* Timeline ruler */}
                <div className="relative h-8 bg-gray-100 rounded mb-4">
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: 11 }).map((_, i) => (
                      <div key={i} className="flex-1 border-r border-gray-300 text-xs text-center pt-1">
                        {Math.round((i / 10) * duration)}ms
                      </div>
                    ))}
                  </div>
                  
                  {/* Current time indicator */}
                  <div 
                    className="absolute top-0 w-0.5 h-full bg-red-500"
                    style={{ left: `${(currentTime / duration) * 100}%` }}
                  ></div>
                </div>

                {/* Keyframes */}
                <div className="space-y-2">
                  {timeline.map((keyframe) => (
                    <div
                      key={keyframe.id}
                      className={`flex items-center p-2 border rounded cursor-pointer ${
                        selectedKeyframe === keyframe.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedKeyframe(keyframe.id)}
                    >
                      <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{keyframe.time}ms</div>
                        <div className="text-xs text-gray-500">
                          {Object.entries(keyframe.properties)
                            .filter(([key, value]) => value !== (key === 'scale' || key === 'opacity' ? 1 : 0))
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeKeyframe(keyframe.id)
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Export */}
          <div className="w-80 bg-gray-50 border-l p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Export Options */}
              <div>
                <h3 className="font-semibold mb-3">Export</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(generateCSS())}
                    className="w-full text-left px-3 py-2 bg-white border rounded hover:bg-gray-50"
                  >
                    Copy CSS Animation
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(generateReactSpring())}
                    className="w-full text-left px-3 py-2 bg-white border rounded hover:bg-gray-50"
                  >
                    Copy React Spring
                  </button>
                </div>
              </div>

              {/* Generated CSS Preview */}
              <div>
                <h3 className="font-semibold mb-3">Generated CSS</h3>
                <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-auto max-h-64">
                  {generateCSS()}
                </pre>
              </div>

              {/* Animation Settings */}
              <div>
                <h3 className="font-semibold mb-3">Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium">Loop</label>
                    <select className="w-full px-3 py-2 border rounded">
                      <option>No Loop</option>
                      <option>Infinite</option>
                      <option>2 times</option>
                      <option>3 times</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium">Direction</label>
                    <select className="w-full px-3 py-2 border rounded">
                      <option>Normal</option>
                      <option>Reverse</option>
                      <option>Alternate</option>
                      <option>Alternate Reverse</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium">Fill Mode</label>
                    <select className="w-full px-3 py-2 border rounded">
                      <option>None</option>
                      <option>Forwards</option>
                      <option>Backwards</option>
                      <option>Both</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnimationStudio