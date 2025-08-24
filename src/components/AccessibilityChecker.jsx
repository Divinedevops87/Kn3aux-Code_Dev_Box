import React, { useState, useEffect } from 'react'
import { Eye, AlertTriangle, CheckCircle, XCircle, Search, Settings, Download, 
         FileText, Contrast, Type, MousePointer, Keyboard, Volume2 } from 'lucide-react'

const AccessibilityChecker = ({ isOpen, onClose, components = [] }) => {
  const [scanResults, setScanResults] = useState([])
  const [isScanning, setIsScanning] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [severity, setSeverity] = useState('all')
  const [autoFix, setAutoFix] = useState(false)

  const categories = [
    { id: 'all', name: 'All Issues', icon: Search },
    { id: 'color', name: 'Color & Contrast', icon: Contrast },
    { id: 'text', name: 'Text & Typography', icon: Type },
    { id: 'interaction', name: 'Interaction', icon: MousePointer },
    { id: 'keyboard', name: 'Keyboard Navigation', icon: Keyboard },
    { id: 'media', name: 'Media & Content', icon: Volume2 },
    { id: 'structure', name: 'Structure & Semantics', icon: FileText }
  ]

  const accessibilityRules = {
    // Color and Contrast
    colorContrast: {
      id: 'color-contrast',
      name: 'Color Contrast',
      category: 'color',
      description: 'Text must have sufficient contrast against background',
      wcagLevel: 'AA',
      severity: 'error',
      check: (component) => {
        // Mock contrast checking
        const hasLowContrast = Math.random() < 0.3
        return {
          passed: !hasLowContrast,
          message: hasLowContrast 
            ? 'Text color does not meet WCAG AA contrast requirements'
            : 'Color contrast is sufficient',
          element: component,
          suggestion: 'Use darker text color or lighter background color'
        }
      }
    },
    
    colorOnly: {
      id: 'color-only',
      name: 'Color as Sole Indicator',
      category: 'color',
      description: 'Information should not be conveyed by color alone',
      wcagLevel: 'A',
      severity: 'warning',
      check: (component) => {
        const usesColorOnly = component.type === 'button' && Math.random() < 0.2
        return {
          passed: !usesColorOnly,
          message: usesColorOnly 
            ? 'Color should not be the only way to convey information'
            : 'Information is not conveyed by color alone',
          element: component,
          suggestion: 'Add text labels, icons, or other visual indicators'
        }
      }
    },

    // Text and Typography
    altText: {
      id: 'alt-text',
      name: 'Alternative Text',
      category: 'text',
      description: 'Images must have alternative text',
      wcagLevel: 'A',
      severity: 'error',
      check: (component) => {
        if (component.type === 'image') {
          const hasAlt = component.props?.alt
          return {
            passed: !!hasAlt,
            message: hasAlt 
              ? 'Image has alternative text'
              : 'Image is missing alternative text',
            element: component,
            suggestion: 'Add descriptive alt text that explains the image content'
          }
        }
        return { passed: true, message: 'Not applicable', element: component }
      }
    },

    headingStructure: {
      id: 'heading-structure',
      name: 'Heading Structure',
      category: 'structure',
      description: 'Headings should follow a logical hierarchy',
      wcagLevel: 'AA',
      severity: 'warning',
      check: (component) => {
        if (component.type === 'heading') {
          const level = component.props?.level || 1
          const isLogical = level <= 3 // Simplified check
          return {
            passed: isLogical,
            message: isLogical 
              ? 'Heading follows logical structure'
              : 'Heading may skip levels or be out of order',
            element: component,
            suggestion: 'Ensure headings follow h1, h2, h3 hierarchy'
          }
        }
        return { passed: true, message: 'Not applicable', element: component }
      }
    },

    // Interaction
    buttonLabel: {
      id: 'button-label',
      name: 'Button Labels',
      category: 'interaction',
      description: 'Buttons must have accessible labels',
      wcagLevel: 'A',
      severity: 'error',
      check: (component) => {
        if (component.type === 'button') {
          const hasLabel = component.props?.children || component.props?.['aria-label']
          return {
            passed: !!hasLabel,
            message: hasLabel 
              ? 'Button has accessible label'
              : 'Button is missing accessible label',
            element: component,
            suggestion: 'Add text content or aria-label attribute'
          }
        }
        return { passed: true, message: 'Not applicable', element: component }
      }
    },

    clickableArea: {
      id: 'clickable-area',
      name: 'Touch Target Size',
      category: 'interaction',
      description: 'Interactive elements should be at least 44x44 pixels',
      wcagLevel: 'AAA',
      severity: 'warning',
      check: (component) => {
        if (['button', 'input'].includes(component.type)) {
          const width = component.props?.width || 32
          const height = component.props?.height || 32
          const isLargeEnough = width >= 44 && height >= 44
          return {
            passed: isLargeEnough,
            message: isLargeEnough 
              ? 'Touch target is adequately sized'
              : 'Touch target may be too small for easy interaction',
            element: component,
            suggestion: 'Increase button size to at least 44x44 pixels'
          }
        }
        return { passed: true, message: 'Not applicable', element: component }
      }
    },

    // Keyboard Navigation
    focusable: {
      id: 'focusable',
      name: 'Keyboard Focusable',
      category: 'keyboard',
      description: 'Interactive elements must be keyboard focusable',
      wcagLevel: 'A',
      severity: 'error',
      check: (component) => {
        if (['button', 'input'].includes(component.type)) {
          const isFocusable = component.props?.tabIndex !== -1
          return {
            passed: isFocusable,
            message: isFocusable 
              ? 'Element is keyboard focusable'
              : 'Interactive element is not keyboard focusable',
            element: component,
            suggestion: 'Remove tabindex="-1" or add tabindex="0"'
          }
        }
        return { passed: true, message: 'Not applicable', element: component }
      }
    },

    skipLinks: {
      id: 'skip-links',
      name: 'Skip Navigation',
      category: 'keyboard',
      description: 'Pages should have skip navigation links',
      wcagLevel: 'A',
      severity: 'info',
      check: (component) => {
        // This would check the overall page structure
        return {
          passed: true,
          message: 'Consider adding skip navigation links',
          element: component,
          suggestion: 'Add "Skip to main content" link at the beginning of the page'
        }
      }
    },

    // Media and Content
    videoCaption: {
      id: 'video-caption',
      name: 'Video Captions',
      category: 'media',
      description: 'Videos should have captions or transcripts',
      wcagLevel: 'A',
      severity: 'error',
      check: (component) => {
        if (component.type === 'video') {
          const hasCaptions = component.props?.captions
          return {
            passed: !!hasCaptions,
            message: hasCaptions 
              ? 'Video has captions'
              : 'Video is missing captions or transcript',
            element: component,
            suggestion: 'Add captions or provide a transcript'
          }
        }
        return { passed: true, message: 'Not applicable', element: component }
      }
    },

    // Structure and Semantics
    landmarks: {
      id: 'landmarks',
      name: 'Page Landmarks',
      category: 'structure',
      description: 'Page should use semantic landmarks',
      wcagLevel: 'AA',
      severity: 'info',
      check: (component) => {
        const hasLandmarks = ['header', 'nav', 'main', 'aside', 'footer'].includes(component.type)
        return {
          passed: hasLandmarks,
          message: hasLandmarks 
            ? 'Semantic landmark element'
            : 'Consider using semantic HTML elements',
          element: component,
          suggestion: 'Use header, nav, main, aside, footer elements for page structure'
        }
      }
    },

    listStructure: {
      id: 'list-structure',
      name: 'List Structure',
      category: 'structure',
      description: 'Lists should use proper HTML structure',
      wcagLevel: 'A',
      severity: 'warning',
      check: (component) => {
        // Check if component looks like a list but isn't structured as one
        const looksLikeList = component.children?.length > 2
        const isProperList = ['ul', 'ol', 'dl'].includes(component.type)
        
        if (looksLikeList && !isProperList) {
          return {
            passed: false,
            message: 'Content appears to be a list but lacks proper HTML structure',
            element: component,
            suggestion: 'Use ul/ol elements with li children for list content'
          }
        }
        
        return { passed: true, message: 'List structure is appropriate', element: component }
      }
    }
  }

  const runAccessibilityCheck = () => {
    setIsScanning(true)
    setScanResults([])

    // Simulate scanning delay
    setTimeout(() => {
      const results = []

      components.forEach(component => {
        Object.values(accessibilityRules).forEach(rule => {
          const result = rule.check(component)
          if (!result.passed) {
            results.push({
              id: `${rule.id}-${component.id}`,
              rule: rule.id,
              name: rule.name,
              category: rule.category,
              severity: rule.severity,
              wcagLevel: rule.wcagLevel,
              message: result.message,
              element: result.element,
              suggestion: result.suggestion,
              canAutoFix: ['alt-text', 'button-label'].includes(rule.id)
            })
          }
        })
      })

      setScanResults(results)
      setIsScanning(false)
    }, 2000)
  }

  const filteredResults = scanResults.filter(result => {
    const categoryMatch = selectedCategory === 'all' || result.category === selectedCategory
    const severityMatch = severity === 'all' || result.severity === severity
    return categoryMatch && severityMatch
  })

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <CheckCircle className="w-5 h-5 text-blue-500" />
      default:
        return <CheckCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'border-l-red-500 bg-red-50'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'info':
        return 'border-l-blue-500 bg-blue-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: scanResults.length,
        errors: scanResults.filter(r => r.severity === 'error').length,
        warnings: scanResults.filter(r => r.severity === 'warning').length,
        info: scanResults.filter(r => r.severity === 'info').length
      },
      results: scanResults.map(result => ({
        rule: result.name,
        severity: result.severity,
        wcagLevel: result.wcagLevel,
        message: result.message,
        suggestion: result.suggestion,
        element: {
          type: result.element.type,
          id: result.element.id
        }
      }))
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `accessibility-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const autoFixIssues = () => {
    const fixableIssues = scanResults.filter(result => result.canAutoFix)
    
    fixableIssues.forEach(issue => {
      // Mock auto-fix implementation
      console.log(`Auto-fixing: ${issue.name} for element ${issue.element.id}`)
    })

    // Re-run scan after fixes
    runAccessibilityCheck()
  }

  useEffect(() => {
    if (isOpen && components.length > 0) {
      runAccessibilityCheck()
    }
  }, [isOpen, components])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Accessibility Checker</h2>
              <p className="text-green-100">Ensure your app is accessible to all users</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={runAccessibilityCheck}
                disabled={isScanning}
                className="bg-white bg-opacity-20 text-white px-4 py-2 rounded hover:bg-opacity-30 disabled:opacity-50"
              >
                {isScanning ? 'Scanning...' : 'Run Scan'}
              </button>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>

              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="px-3 py-2 border rounded"
              >
                <option value="all">All Severities</option>
                <option value="error">Errors</option>
                <option value="warning">Warnings</option>
                <option value="info">Info</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoFix}
                  onChange={(e) => setAutoFix(e.target.checked)}
                  className="mr-2"
                />
                Auto-fix when possible
              </label>
              
              {scanResults.some(r => r.canAutoFix) && (
                <button
                  onClick={autoFixIssues}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Auto-fix Issues
                </button>
              )}

              <button
                onClick={exportReport}
                disabled={scanResults.length === 0}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>

          {/* Summary */}
          {scanResults.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded border">
                <div className="text-2xl font-bold text-gray-900">{filteredResults.length}</div>
                <div className="text-sm text-gray-600">Total Issues</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-2xl font-bold text-red-600">
                  {filteredResults.filter(r => r.severity === 'error').length}
                </div>
                <div className="text-sm text-gray-600">Errors</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredResults.filter(r => r.severity === 'warning').length}
                </div>
                <div className="text-sm text-gray-600">Warnings</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredResults.filter(r => r.severity === 'info').length}
                </div>
                <div className="text-sm text-gray-600">Info</div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-auto p-4">
          {isScanning ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 animate-spin border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Scanning components for accessibility issues...</p>
              </div>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="space-y-4">
              {filteredResults.map((result) => (
                <div
                  key={result.id}
                  className={`border-l-4 ${getSeverityColor(result.severity)} border rounded p-4`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getSeverityIcon(result.severity)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">{result.name}</h3>
                          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                            WCAG {result.wcagLevel}
                          </span>
                          {result.canAutoFix && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                              Auto-fixable
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2">{result.message}</p>
                        <div className="text-sm">
                          <span className="font-medium">Element:</span> {result.element.type} (ID: {result.element.id})
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Suggestion:</span> {result.suggestion}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 capitalize">
                      {result.severity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : scanResults.length === 0 && !isScanning ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Great job!</h3>
                <p className="text-gray-600">No accessibility issues found in your components.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Eye className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to scan</h3>
                <p className="text-gray-600">Click "Run Scan" to check your components for accessibility issues.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            <p>
              This accessibility checker follows{' '}
              <a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noopener noreferrer" 
                 className="text-blue-500 hover:underline">
                WCAG 2.1 Guidelines
              </a>
              {' '}to help ensure your app is accessible to users with disabilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccessibilityChecker