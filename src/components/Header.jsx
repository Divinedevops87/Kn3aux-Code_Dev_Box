import React, { useState } from 'react'
import { Menu, Download, Smartphone, Undo, Redo, Play, GitBranch } from 'lucide-react'
import { useBuilderStore } from '../store/builderStore'
import { useGitStore } from '../store/gitStore'
import GitConfigModal from './GitConfigModal'

const Header = ({ onToggleSidebar, onExport, sidebarOpen }) => {
  const [gitConfigOpen, setGitConfigOpen] = useState(false)
  const { undo, redo, canUndo, canRedo, previewMode, setPreviewMode } = useBuilderStore()
  const { repositoryConfig } = useGitStore()

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 text-sm">KN3AUX-CODE™</h1>
            <p className="text-xs text-gray-500">Mobile Builder</p>
          </div>
        </div>
      </div>

      {/* Center Section - Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        <button
          onClick={() => setPreviewMode(!previewMode)}
          className={`p-2 rounded-lg transition-colors ${
            previewMode ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100'
          }`}
          title="Preview Mode"
        >
          <Play className="w-4 h-4" />
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setGitConfigOpen(true)}
          className={`p-2 rounded-lg transition-colors flex items-center space-x-1 ${
            repositoryConfig.isConfigured 
              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
          title={repositoryConfig.isConfigured ? 'Git Configured' : 'Configure Git'}
        >
          <GitBranch className="w-4 h-4" />
          {repositoryConfig.isConfigured && (
            <span className="hidden sm:inline text-xs">
              {repositoryConfig.name}
            </span>
          )}
        </button>
        
        <button
          onClick={onExport}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      <GitConfigModal 
        isOpen={gitConfigOpen}
        onClose={() => setGitConfigOpen(false)}
      />
    </header>
  )
}

export default Header