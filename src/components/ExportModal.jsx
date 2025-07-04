import React, { useState } from 'react'
import { X, Download, Code, Smartphone, Globe } from 'lucide-react'
import { useBuilderStore } from '../store/builderStore'
import { exportToReact, exportToHTML, exportToJSON } from '../utils/exportHelpers'

const ExportModal = ({ isOpen, onClose }) => {
  const [exportType, setExportType] = useState('react')
  const [isExporting, setIsExporting] = useState(false)
  const { components } = useBuilderStore()

  if (!isOpen) return null

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      let content, filename, mimeType

      switch (exportType) {
        case 'react':
          content = exportToReact(components)
          filename = 'App.jsx'
          mimeType = 'text/javascript'
          break
        case 'html':
          content = exportToHTML(components)
          filename = 'index.html'
          mimeType = 'text/html'
          break
        case 'json':
          content = exportToJSON(components)
          filename = 'project.json'
          mimeType = 'application/json'
          break
        default:
          throw new Error('Unknown export type')
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const exportOptions = [
    {
      id: 'react',
      title: 'React Component',
      description: 'Export as a React JSX component',
      icon: Code,
      color: 'text-blue-600'
    },
    {
      id: 'html',
      title: 'HTML/CSS',
      description: 'Export as static HTML with inline CSS',
      icon: Globe,
      color: 'text-green-600'
    },
    {
      id: 'json',
      title: 'JSON Project',
      description: 'Export project data as JSON',
      icon: Download,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Export Project</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600 text-sm">
            Choose how you'd like to export your project:
          </p>

          <div className="space-y-3">
            {exportOptions.map((option) => (
              <label
                key={option.id}
                className={`
                  flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-all
                  ${exportType === option.id 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <input
                  type="radio"
                  name="exportType"
                  value={option.id}
                  checked={exportType === option.id}
                  onChange={(e) => setExportType(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <option.icon className={`w-5 h-5 ${option.color}`} />
                    <h3 className="font-medium text-gray-900">{option.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                </div>
              </label>
            ))}
          </div>

          {components.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                Your canvas is empty. Add some components before exporting.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || components.length === 0}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExportModal