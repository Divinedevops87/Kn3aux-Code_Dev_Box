import React from 'react'
import { X } from 'lucide-react'
import { isMobile } from '../utils/deviceDetection'

const Sidebar = ({ isOpen, onClose, children }) => {
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
            <h2 className="font-semibold text-gray-900">Components</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {children}
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
        <h2 className="font-semibold text-gray-900">Components</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

export default Sidebar