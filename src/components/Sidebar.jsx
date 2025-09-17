import React, { useState, useEffect } from 'react'
import { X, Package, GitBranch } from 'lucide-react'
import { isMobile } from '../utils/deviceDetection'

const Sidebar = ({ isOpen, onClose, children, activeTab: propActiveTab, onTabChange }) => {
  const [activeTab, setActiveTab] = useState(propActiveTab || 'components')

  // Update local state when prop changes
  useEffect(() => {
    if (propActiveTab) {
      setActiveTab(propActiveTab)
    }
  }, [propActiveTab])

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    if (onTabChange) {
      onTabChange(tabId)
    }
  }

  const tabs = [
    { id: 'components', label: 'Components', icon: Package },
    { id: 'git', label: 'Git', icon: GitBranch }
  ]

  const renderContent = () => {
    return children
  }

  if (isMobile()) {
    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
        )}
        
        {/* Mobile Sidebar */}
        <div className={`
          fixed left-0 top-0 h-full w-80 bg-white z-50 transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-3 py-1 rounded-lg text-sm flex items-center space-x-1 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {renderContent()}
          </div>
        </div>
      </>
    )
  }

  // Desktop Sidebar
  return (
    <div className={`
      w-80 bg-white border-r border-gray-200 flex flex-col transition-all duration-300
      ${isOpen ? 'translate-x-0' : '-translate-x-full absolute z-30'}
    `}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3 py-1 rounded-lg text-sm flex items-center space-x-1 transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  )
}

export default Sidebar