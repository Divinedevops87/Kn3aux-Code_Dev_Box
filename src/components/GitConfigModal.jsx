import React, { useState } from 'react'
import { X, GitBranch, Github, Upload, Download, Check, AlertCircle } from 'lucide-react'
import { useGitStore } from '../store/gitStore'

const GitConfigModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    remoteUrl: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const { configureRepository, repositoryConfig } = useGitStore()

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await configureRepository({
        ...formData,
        branch: 'main'
      })
      onClose()
    } catch (error) {
      console.error('Failed to configure repository:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAutoConfig = () => {
    const projectName = 'kn3aux-mobile-app'
    setFormData({
      name: projectName,
      description: `KN3AUX-CODE™ Mobile App Project`,
      remoteUrl: `https://github.com/yourusername/${projectName}.git`
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Git Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">Auto-Configure</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Quickly set up git configuration with default values
                </p>
                <button
                  type="button"
                  onClick={handleAutoConfig}
                  className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                >
                  Auto Configure
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Repository Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              placeholder="my-kn3aux-project"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              rows="3"
              placeholder="Description of your mobile app project..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remote URL (Optional)
            </label>
            <input
              type="url"
              value={formData.remoteUrl}
              onChange={(e) => setFormData({ ...formData, remoteUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              placeholder="https://github.com/yourusername/repository.git"
            />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">What this enables:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Automatic version control for your projects</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Commit tracking with messages</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Project branching and history</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Export with git setup instructions</span>
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Configuring...</span>
                </>
              ) : (
                <>
                  <GitBranch className="w-4 h-4" />
                  <span>Configure Git</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GitConfigModal