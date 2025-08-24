import React, { useState, useEffect, useRef } from 'react'
import { X, Maximize2, Minimize2, RotateCcw, ExternalLink, Download, Search, Folder, File, Code, Star, GitBranch } from 'lucide-react'
import useRepositoryStore, { RepositoryMirror } from '../modules/RepositoryMirror'

const WebviewPopup = ({ repository, isOpen, onClose }) => {
  const [isMaximized, setIsMaximized] = useState(false)
  const [currentView, setCurrentView] = useState('browser') // browser, files, analysis
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const webviewRef = useRef(null)
  const [analysis, setAnalysis] = useState(null)

  useEffect(() => {
    if (repository && isOpen) {
      const repoAnalysis = RepositoryMirror.analyzeRepository(repository)
      setAnalysis(repoAnalysis)
    }
  }, [repository, isOpen])

  if (!isOpen || !repository) return null

  const handleMaximize = () => {
    setIsMaximized(!isMaximized)
  }

  const handleRefresh = () => {
    if (webviewRef.current) {
      webviewRef.current.reload()
    }
  }

  const handleDownload = async () => {
    try {
      const exported = await RepositoryMirror.exportRepository(repository.id, 'zip')
      // Create download link
      const blob = new Blob([JSON.stringify(exported)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = exported.name
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const renderFileTree = (files, level = 0) => {
    const filteredFiles = files.filter(file => 
      !searchQuery || file.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return filteredFiles.map(file => (
      <div key={file.path} className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer`} 
           style={{ paddingLeft: `${level * 20 + 8}px` }}
           onClick={() => setSelectedFile(file)}>
        {file.type === 'dir' ? (
          <Folder className="w-4 h-4 mr-2 text-blue-500" />
        ) : (
          <File className="w-4 h-4 mr-2 text-gray-500" />
        )}
        <span className="text-sm">{file.name}</span>
        {file.size && (
          <span className="ml-auto text-xs text-gray-400">
            {(file.size / 1024).toFixed(1)}KB
          </span>
        )}
      </div>
    ))
  }

  const renderFileContent = (file) => {
    if (!file.content) {
      return (
        <div className="p-4 text-center text-gray-500">
          <File className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>File content not available offline</p>
          <a 
            href={file.downloadUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline mt-2 inline-block"
          >
            View on GitHub <ExternalLink className="w-4 h-4 inline ml-1" />
          </a>
        </div>
      )
    }

    return (
      <div className="h-full">
        <div className="bg-gray-100 p-2 border-b flex items-center justify-between">
          <div className="flex items-center">
            <Code className="w-4 h-4 mr-2" />
            <span className="font-medium">{file.name}</span>
          </div>
          <span className="text-sm text-gray-500">{file.content.split('\n').length} lines</span>
        </div>
        <pre className="p-4 text-sm overflow-auto h-full bg-gray-50">
          <code>{file.content}</code>
        </pre>
      </div>
    )
  }

  const renderAnalysis = () => (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="font-semibold mb-3 flex items-center">
          <Star className="w-4 h-4 mr-2" />
          Repository Overview
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-2xl font-bold text-blue-600">{analysis?.structure.totalFiles || 0}</div>
            <div className="text-sm text-gray-600">Files</div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="text-2xl font-bold text-green-600">{analysis?.structure.totalDirectories || 0}</div>
            <div className="text-sm text-gray-600">Directories</div>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <div className="text-2xl font-bold text-purple-600">{analysis?.structure.depth || 0}</div>
            <div className="text-sm text-gray-600">Max Depth</div>
          </div>
          <div className="bg-orange-50 p-3 rounded">
            <div className="text-2xl font-bold text-orange-600">{analysis?.codeMetrics.linesOfCode || 0}</div>
            <div className="text-sm text-gray-600">Lines of Code</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">File Types</h3>
        <div className="space-y-2">
          {Object.entries(analysis?.fileTypes || {}).map(([ext, count]) => (
            <div key={ext} className="flex justify-between items-center">
              <span className="text-sm">.{ext}</span>
              <span className="bg-gray-100 px-2 py-1 rounded text-xs">{count} files</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Languages</h3>
        <div className="space-y-2">
          {Object.entries(analysis?.languages || {}).map(([lang, bytes]) => (
            <div key={lang} className="flex justify-between items-center">
              <span className="text-sm">{lang}</span>
              <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                {(bytes / 1024).toFixed(1)}KB
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className={`fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center ${
      isMaximized ? 'p-0' : 'p-4'
    }`}>
      <div className={`bg-white rounded-lg shadow-2xl flex flex-col ${
        isMaximized ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-5/6'
      }`}>
        {/* Header */}
        <div className="bg-gray-100 px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={repository.owner.avatar_url} 
              alt={repository.owner.login}
              className="w-6 h-6 rounded-full"
            />
            <span className="font-semibold">{repository.full_name}</span>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">{repository.stargazers_count}</span>
              <GitBranch className="w-4 h-4 text-gray-500 ml-2" />
              <span className="text-sm">{repository.forks_count}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-gray-200 rounded"
              title="Refresh"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-200 rounded"
              title="Download Repository"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleMaximize}
              className="p-2 hover:bg-gray-200 rounded"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-gray-50 px-4 py-2 border-b">
          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentView('browser')}
              className={`px-3 py-1 rounded text-sm ${
                currentView === 'browser' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
              }`}
            >
              Browser
            </button>
            <button
              onClick={() => setCurrentView('files')}
              className={`px-3 py-1 rounded text-sm ${
                currentView === 'files' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
              }`}
            >
              Files
            </button>
            <button
              onClick={() => setCurrentView('analysis')}
              className={`px-3 py-1 rounded text-sm ${
                currentView === 'analysis' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
              }`}
            >
              Analysis
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {currentView === 'browser' && (
            <div className="w-full h-full">
              <iframe
                ref={webviewRef}
                src={repository.html_url}
                className="w-full h-full border-none"
                title={`${repository.name} on GitHub`}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>
          )}

          {currentView === 'files' && (
            <div className="flex w-full h-full">
              {/* File tree */}
              <div className="w-1/3 border-r bg-gray-50 flex flex-col">
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border rounded text-sm"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-auto">
                  {repository.files && renderFileTree(repository.files)}
                </div>
              </div>

              {/* File content */}
              <div className="flex-1">
                {selectedFile ? (
                  renderFileContent(selectedFile)
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Select a file to view its content</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentView === 'analysis' && analysis && renderAnalysis()}
        </div>

        {/* Status bar */}
        <div className="bg-gray-100 px-4 py-2 border-t text-xs text-gray-600 flex justify-between">
          <span>
            {repository.language && `Primary: ${repository.language}`}
            {repository.size && ` • Size: ${(repository.size / 1024).toFixed(1)}KB`}
          </span>
          <span>
            Last updated: {new Date(repository.updated_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  )
}

export default WebviewPopup