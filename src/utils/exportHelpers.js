export const exportToReact = (components) => {
  const componentCode = components.map(comp => {
    const { type, props, style, position } = comp
    
    const styleString = Object.entries(style)
      .map(([key, value]) => `${key}: '${value}'`)
      .join(', ')
    
    const positionStyle = `position: 'absolute', left: '${position.x}px', top: '${position.y}px'`
    const fullStyle = `{${positionStyle}, ${styleString}}`
    
    switch (type) {
      case 'text':
        return `    <span style={${fullStyle}}>${props.content}</span>`
      case 'heading':
        return `    <${props.level || 'h2'} style={${fullStyle}}>${props.content}</${props.level || 'h2'}>`
      case 'button':
        return `    <button style={${fullStyle}}>${props.text}</button>`
      case 'image':
        return `    <img src="${props.src}" alt="${props.alt}" style={${fullStyle}} />`
      case 'input':
        return `    <input type="${props.type || 'text'}" placeholder="${props.placeholder}" style={${fullStyle}} />`
      default:
        return `    <div style={${fullStyle}}>/* ${type} component */</div>`
    }
  }).join('\n')

  return `import React from 'react'

const App = () => {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
${componentCode}
    </div>
  )
}

export default App`
}

export const exportToHTML = (components) => {
  const componentHTML = components.map(comp => {
    const { type, props, style, position } = comp
    
    const styleString = Object.entries({
      position: 'absolute',
      left: `${position.x}px`,
      top: `${position.y}px`,
      ...style
    }).map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`).join('; ')
    
    switch (type) {
      case 'text':
        return `    <span style="${styleString}">${props.content}</span>`
      case 'heading':
        return `    <${props.level || 'h2'} style="${styleString}">${props.content}</${props.level || 'h2'}>`
      case 'button':
        return `    <button style="${styleString}">${props.text}</button>`
      case 'image':
        return `    <img src="${props.src}" alt="${props.alt}" style="${styleString}" />`
      case 'input':
        return `    <input type="${props.type || 'text'}" placeholder="${props.placeholder}" style="${styleString}" />`
      default:
        return `    <div style="${styleString}"><!-- ${type} component --></div>`
    }
  }).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KN3AUX-CODE™ App</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background-color: #f9fafb;
        }
        .container {
            position: relative;
            min-height: 100vh;
        }
    </style>
</head>
<body>
    <div class="container">
${componentHTML}
    </div>
</body>
</html>`
}

export const exportToJSON = (components) => {
  return JSON.stringify({
    version: '1.0.0',
    generator: 'KN3AUX-CODE™ Mobile Builder',
    createdAt: new Date().toISOString(),
    components: components
  }, null, 2)
}