import React, { useState, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Canvas from './components/Canvas'
import PropertyPanel from './components/PropertyPanel'
import ComponentLibrary from './components/ComponentLibrary'
import GitPanel from './components/GitPanel'
import ExportModal from './components/ExportModal'
import { useBuilderStore } from './store/builderStore'
import { useGitStore } from './store/gitStore'
import { isMobile } from './utils/deviceDetection'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile())
  const [propertyPanelOpen, setPropertyPanelOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [sidebarTab, setSidebarTab] = useState('components')
  const { selectedComponent, components } = useBuilderStore()
  const { setPendingChanges } = useGitStore()

  // Auto-open property panel when component is selected
  useEffect(() => {
    if (selectedComponent && isMobile()) {
      setPropertyPanelOpen(true)
    }
  }, [selectedComponent])

  // Track pending changes for git
  useEffect(() => {
    setPendingChanges(components.length > 0)
  }, [components, setPendingChanges])

  const backend = isMobile() ? TouchBackend : HTML5Backend

  return (
    <DndProvider backend={backend}>
      <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onExport={() => setExportModalOpen(true)}
          sidebarOpen={sidebarOpen}
        />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Component Library & Git */}
          <Sidebar 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            activeTab={sidebarTab}
            onTabChange={setSidebarTab}
          >
            {sidebarTab === 'components' ? <ComponentLibrary /> : <GitPanel />}
          </Sidebar>

          {/* Canvas Area */}
          <div className="flex-1 flex flex-col">
            <Canvas />
          </div>

          {/* Property Panel */}
          {selectedComponent && (
            <div className={`
              ${isMobile() 
                ? `fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ${
                    propertyPanelOpen ? 'translate-y-0' : 'translate-y-full'
                  }`
                : 'w-80 border-l border-gray-200'
              }
              bg-white
            `}>
              <PropertyPanel 
                isOpen={propertyPanelOpen}
                onClose={() => setPropertyPanelOpen(false)}
              />
            </div>
          )}
        </div>

        {/* Export Modal */}
        <ExportModal 
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
        />

        {/* Mobile Property Panel Toggle */}
        {isMobile() && selectedComponent && (
          <button
            onClick={() => setPropertyPanelOpen(!propertyPanelOpen)}
            className="fixed bottom-4 right-4 z-40 bg-purple-600 text-white p-3 rounded-full shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </button>
        )}
      </div>
    </DndProvider>
  )
}

export default App