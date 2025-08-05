import React, { useState, useEffect } from 'react'
import { Menu, X, Play, Download, Undo, Redo, Eye, EyeOff, Settings, BarChart3, 
         Palette, Zap, Globe, TestTube, GitBranch, Languages, Shield, 
         Database, Briefcase, Search } from 'lucide-react'
import { useBuilderStore } from '../store/builderStore'
import { isMobile } from '../utils/deviceDetection'
import Dashboard from './Dashboard'
import AnimationStudio from './AnimationStudio'
import APITestingTool from './APITestingTool'
import TemplateMarketplace from './TemplateMarketplace'
import AccessibilityChecker from './AccessibilityChecker'
import RepositoryManager from './RepositoryManager'
import { useTranslation } from '../modules/InternationalizationManager'
import { NotificationManager } from '../modules/NotificationManager'
import { ActivityLogger } from '../modules/ActivityLogger'

const Header = ({ onToggleSidebar, onExport, sidebarOpen }) => {
  const { 
    canUndo, 
    canRedo, 
    undo, 
    redo, 
    previewMode, 
    setPreviewMode,
    components,
    selectedComponent
  } = useBuilderStore()

  const { t, currentLanguage, changeLanguage, supportedLanguages } = useTranslation()
  
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeModal, setActiveModal] = useState(null)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    if (isFullscreen) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }

  const openModal = (modalName) => {
    setActiveModal(modalName)
    ActivityLogger.logFeatureUsed('modal_opened', { modalType: modalName })
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode)
    setShowLanguageMenu(false)
    NotificationManager.info(`Language changed to ${supportedLanguages[languageCode].name}`)
  }

  const toolButtons = [
    {
      id: 'dashboard',
      icon: BarChart3,
      label: 'Analytics Dashboard',
      color: 'text-blue-600 hover:bg-blue-50',
      action: () => openModal('dashboard')
    },
    {
      id: 'animation',
      icon: Zap,
      label: 'Animation Studio',
      color: 'text-purple-600 hover:bg-purple-50',
      action: () => openModal('animation')
    },
    {
      id: 'api',
      icon: TestTube,
      label: 'API Testing',
      color: 'text-green-600 hover:bg-green-50',
      action: () => openModal('api')
    },
    {
      id: 'templates',
      icon: Briefcase,
      label: 'Template Marketplace',
      color: 'text-orange-600 hover:bg-orange-50',
      action: () => openModal('templates')
    },
    {
      id: 'accessibility',
      icon: Shield,
      label: 'Accessibility Checker',
      color: 'text-teal-600 hover:bg-teal-50',
      action: () => openModal('accessibility')
    },
    {
      id: 'repository',
      icon: Database,
      label: 'Repository Mirror',
      color: 'text-indigo-600 hover:bg-indigo-50',
      action: () => openModal('repository')
    }
  ]

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="ml-2 font-bold text-gray-900 hidden sm:block">
              KN3AUX-CODE™
            </span>
          </div>
        </div>

        {/* Center - Actions and Tools */}
        <div className="flex items-center space-x-2">
          {!isMobile() && (
            <>
              <button
                onClick={undo}
                disabled={!canUndo}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('common.undo')}
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('common.redo')}
              >
                <Redo className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-2" />
            </>
          )}

          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`p-2 rounded-lg ${
              previewMode 
                ? 'bg-blue-100 text-blue-600' 
                : 'hover:bg-gray-100'
            }`}
            title={previewMode ? 'Exit Preview' : t('app.preview')}
          >
            {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Advanced Tools */}
          {!isMobile() && (
            <div className="flex items-center space-x-1 ml-2">
              {toolButtons.map((tool) => {
                const Icon = tool.icon
                return (
                  <button
                    key={tool.id}
                    onClick={tool.action}
                    className={`p-2 rounded-lg transition-colors ${tool.color}`}
                    title={tool.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                )
              })}
            </div>
          )}

          {!isMobile() && (
            <button
              onClick={onExport}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center ml-2"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('common.export')}
            </button>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500 hidden sm:block">
            {components.length} {t('app.componentLibrary').toLowerCase()}{components.length !== 1 ? 's' : ''}
          </div>
          
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg flex items-center"
              title="Change Language"
            >
              <Languages className="w-4 h-4 mr-1" />
              <span className="text-sm hidden sm:inline">
                {supportedLanguages[currentLanguage]?.flag}
              </span>
            </button>

            {showLanguageMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-48">
                {Object.entries(supportedLanguages).map(([code, language]) => (
                  <button
                    key={code}
                    onClick={() => handleLanguageChange(code)}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center space-x-2 ${
                      currentLanguage === code ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    <span>{language.flag}</span>
                    <span>{language.nativeName}</span>
                    {currentLanguage === code && <span className="ml-auto">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Modals */}
      <Dashboard 
        isOpen={activeModal === 'dashboard'} 
        onClose={closeModal} 
      />
      
      <AnimationStudio 
        isOpen={activeModal === 'animation'} 
        onClose={closeModal}
        selectedComponent={selectedComponent}
      />
      
      <APITestingTool 
        isOpen={activeModal === 'api'} 
        onClose={closeModal} 
      />
      
      <TemplateMarketplace 
        isOpen={activeModal === 'templates'} 
        onClose={closeModal}
        onTemplateSelect={(template) => {
          NotificationManager.success(`Template "${template.name}" loaded successfully`)
          closeModal()
        }}
      />
      
      <AccessibilityChecker 
        isOpen={activeModal === 'accessibility'} 
        onClose={closeModal}
        components={components}
      />
      
      <RepositoryManager 
        isOpen={activeModal === 'repository'} 
        onClose={closeModal} 
      />

      {/* Click outside to close language menu */}
      {showLanguageMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowLanguageMenu(false)}
        />
      )}
    </>
  )
}

export default Header