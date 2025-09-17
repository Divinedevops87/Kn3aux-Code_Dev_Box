/**
 * InternationalizationManager - Comprehensive multi-language support system
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const useI18nStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    currentLanguage: 'en',
    supportedLanguages: {
      en: { 
        name: 'English', 
        nativeName: 'English', 
        flag: '🇺🇸', 
        rtl: false,
        loaded: true 
      },
      es: { 
        name: 'Spanish', 
        nativeName: 'Español', 
        flag: '🇪🇸', 
        rtl: false,
        loaded: false 
      },
      fr: { 
        name: 'French', 
        nativeName: 'Français', 
        flag: '🇫🇷', 
        rtl: false,
        loaded: false 
      },
      de: { 
        name: 'German', 
        nativeName: 'Deutsch', 
        flag: '🇩🇪', 
        rtl: false,
        loaded: false 
      },
      zh: { 
        name: 'Chinese', 
        nativeName: '中文', 
        flag: '🇨🇳', 
        rtl: false,
        loaded: false 
      },
      ja: { 
        name: 'Japanese', 
        nativeName: '日本語', 
        flag: '🇯🇵', 
        rtl: false,
        loaded: false 
      },
      ar: { 
        name: 'Arabic', 
        nativeName: 'العربية', 
        flag: '🇸🇦', 
        rtl: true,
        loaded: false 
      },
      pt: { 
        name: 'Portuguese', 
        nativeName: 'Português', 
        flag: '🇧🇷', 
        rtl: false,
        loaded: false 
      },
      ru: { 
        name: 'Russian', 
        nativeName: 'Русский', 
        flag: '🇷🇺', 
        rtl: false,
        loaded: false 
      },
      hi: { 
        name: 'Hindi', 
        nativeName: 'हिन्दी', 
        flag: '🇮🇳', 
        rtl: false,
        loaded: false 
      }
    },
    translations: {
      en: {} // Will be populated with translations
    },
    missingKeys: [],
    
    // Actions
    setLanguage: (language) => {
      if (get().supportedLanguages[language]) {
        set({ currentLanguage: language })
        get().loadLanguage(language)
      }
    },
    
    loadLanguage: async (language) => {
      const state = get()
      if (state.translations[language] || language === 'en') {
        return // Already loaded or is base language
      }
      
      try {
        // In a real implementation, this would fetch from API or import language files
        const translations = await I18nManager.loadTranslations(language)
        
        set((state) => ({
          translations: {
            ...state.translations,
            [language]: translations
          },
          supportedLanguages: {
            ...state.supportedLanguages,
            [language]: {
              ...state.supportedLanguages[language],
              loaded: true
            }
          }
        }))
      } catch (error) {
        console.error(`Failed to load language ${language}:`, error)
      }
    },
    
    addMissingKey: (key) => {
      set((state) => ({
        missingKeys: [...new Set([...state.missingKeys, key])]
      }))
    },
    
    updateTranslations: (language, translations) => {
      set((state) => ({
        translations: {
          ...state.translations,
          [language]: {
            ...state.translations[language],
            ...translations
          }
        }
      }))
    }
  }))
)

// Base translations for English
const baseTranslations = {
  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    open: 'Open',
    create: 'Create',
    update: 'Update',
    confirm: 'Confirm',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    export: 'Export',
    import: 'Import',
    download: 'Download',
    upload: 'Upload',
    copy: 'Copy',
    paste: 'Paste',
    cut: 'Cut',
    undo: 'Undo',
    redo: 'Redo',
    settings: 'Settings',
    help: 'Help',
    about: 'About'
  },
  
  // Application specific
  app: {
    title: 'KN3AUX-CODE™ Mobile Builder',
    subtitle: 'Mobile-first visual app builder',
    welcome: 'Welcome to KN3AUX-CODE™',
    getStarted: 'Get Started',
    newProject: 'New Project',
    openProject: 'Open Project',
    saveProject: 'Save Project',
    exportProject: 'Export Project',
    projectName: 'Project Name',
    componentLibrary: 'Component Library',
    propertyPanel: 'Property Panel',
    canvas: 'Canvas',
    preview: 'Preview'
  },
  
  // Components
  components: {
    button: 'Button',
    input: 'Input',
    text: 'Text',
    image: 'Image',
    video: 'Video',
    container: 'Container',
    grid: 'Grid',
    flex: 'Flex Box',
    card: 'Card',
    navbar: 'Navigation',
    tabbar: 'Tab Bar',
    hero: 'Hero Section',
    heading: 'Heading'
  },
  
  // Properties
  properties: {
    width: 'Width',
    height: 'Height',
    padding: 'Padding',
    margin: 'Margin',
    backgroundColor: 'Background Color',
    textColor: 'Text Color',
    fontSize: 'Font Size',
    fontWeight: 'Font Weight',
    textAlign: 'Text Alignment',
    borderRadius: 'Border Radius',
    borderWidth: 'Border Width',
    borderColor: 'Border Color',
    opacity: 'Opacity',
    position: 'Position',
    display: 'Display',
    flexDirection: 'Flex Direction',
    justifyContent: 'Justify Content',
    alignItems: 'Align Items'
  },
  
  // Menu items
  menu: {
    file: 'File',
    edit: 'Edit',
    view: 'View',
    tools: 'Tools',
    window: 'Window',
    help: 'Help'
  },
  
  // Dialog messages
  dialogs: {
    confirmDelete: 'Are you sure you want to delete this component?',
    unsavedChanges: 'You have unsaved changes. Do you want to save before closing?',
    exportSuccess: 'Project exported successfully!',
    saveSuccess: 'Project saved successfully!',
    loadError: 'Failed to load project. Please try again.',
    saveError: 'Failed to save project. Please try again.',
    invalidProject: 'Invalid project file format.'
  },
  
  // Validation messages
  validation: {
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    minLength: 'Minimum length is {min} characters',
    maxLength: 'Maximum length is {max} characters',
    invalidUrl: 'Please enter a valid URL',
    invalidNumber: 'Please enter a valid number',
    minValue: 'Minimum value is {min}',
    maxValue: 'Maximum value is {max}'
  },
  
  // Time and dates
  time: {
    now: 'Now',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    lastWeek: 'Last Week',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    minute: 'minute',
    minutes: 'minutes',
    hour: 'hour',
    hours: 'hours',
    day: 'day',
    days: 'days',
    week: 'week',
    weeks: 'weeks',
    month: 'month',
    months: 'months',
    year: 'year',
    years: 'years',
    ago: 'ago'
  }
}

// Internationalization Manager API
export const I18nManager = {
  // Translation loading
  loadTranslations: async (language) => {
    // Mock translation data - in production this would fetch from API or language files
    const mockTranslations = {
      es: {
        common: {
          save: 'Guardar',
          cancel: 'Cancelar',
          delete: 'Eliminar',
          edit: 'Editar',
          close: 'Cerrar',
          create: 'Crear',
          loading: 'Cargando...',
          error: 'Error',
          success: 'Éxito',
          search: 'Buscar'
        },
        app: {
          title: 'KN3AUX-CODE™ Constructor Móvil',
          subtitle: 'Constructor de aplicaciones visual móvil-primero',
          welcome: 'Bienvenido a KN3AUX-CODE™',
          newProject: 'Nuevo Proyecto',
          componentLibrary: 'Biblioteca de Componentes'
        }
      },
      fr: {
        common: {
          save: 'Enregistrer',
          cancel: 'Annuler',
          delete: 'Supprimer',
          edit: 'Modifier',
          close: 'Fermer',
          create: 'Créer',
          loading: 'Chargement...',
          error: 'Erreur',
          success: 'Succès',
          search: 'Rechercher'
        },
        app: {
          title: 'KN3AUX-CODE™ Constructeur Mobile',
          subtitle: 'Constructeur d\'applications visuel mobile-first',
          welcome: 'Bienvenue dans KN3AUX-CODE™',
          newProject: 'Nouveau Projet',
          componentLibrary: 'Bibliothèque de Composants'
        }
      },
      de: {
        common: {
          save: 'Speichern',
          cancel: 'Abbrechen',
          delete: 'Löschen',
          edit: 'Bearbeiten',
          close: 'Schließen',
          create: 'Erstellen',
          loading: 'Laden...',
          error: 'Fehler',
          success: 'Erfolg',
          search: 'Suchen'
        },
        app: {
          title: 'KN3AUX-CODE™ Mobile Builder',
          subtitle: 'Mobile-first visueller App-Builder',
          welcome: 'Willkommen bei KN3AUX-CODE™',
          newProject: 'Neues Projekt',
          componentLibrary: 'Komponenten-Bibliothek'
        }
      }
    }
    
    return mockTranslations[language] || {}
  },
  
  // Translation function
  t: (key, params = {}) => {
    const state = useI18nStore.getState()
    const translations = state.translations[state.currentLanguage] || state.translations.en || baseTranslations
    
    // Navigate through nested keys (e.g., 'common.save')
    const keys = key.split('.')
    let value = translations
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Fallback to base translations
        value = baseTranslations
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey]
          } else {
            value = key // Return key if not found
            break
          }
        }
        break
      }
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation key not found: ${key}`)
      state.addMissingKey(key)
      return key
    }
    
    // Replace parameters in the translation
    return I18nManager.interpolate(value, params)
  },
  
  // Parameter interpolation
  interpolate: (text, params) => {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match
    })
  },
  
  // Pluralization
  plural: (key, count, params = {}) => {
    const pluralKey = count === 1 ? key : `${key}_plural`
    return I18nManager.t(pluralKey, { count, ...params })
  },
  
  // Date formatting
  formatDate: (date, format = 'short') => {
    const state = useI18nStore.getState()
    const locale = I18nManager.getLocale(state.currentLanguage)
    
    const options = {
      short: { dateStyle: 'short' },
      medium: { dateStyle: 'medium' },
      long: { dateStyle: 'long' },
      full: { dateStyle: 'full' }
    }
    
    return new Intl.DateTimeFormat(locale, options[format]).format(new Date(date))
  },
  
  // Time formatting
  formatTime: (date, format = 'short') => {
    const state = useI18nStore.getState()
    const locale = I18nManager.getLocale(state.currentLanguage)
    
    const options = {
      short: { timeStyle: 'short' },
      medium: { timeStyle: 'medium' },
      long: { timeStyle: 'long' }
    }
    
    return new Intl.DateTimeFormat(locale, options[format]).format(new Date(date))
  },
  
  // Number formatting
  formatNumber: (number, options = {}) => {
    const state = useI18nStore.getState()
    const locale = I18nManager.getLocale(state.currentLanguage)
    
    return new Intl.NumberFormat(locale, options).format(number)
  },
  
  // Currency formatting
  formatCurrency: (amount, currency = 'USD') => {
    const state = useI18nStore.getState()
    const locale = I18nManager.getLocale(state.currentLanguage)
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(amount)
  },
  
  // Relative time formatting
  formatRelativeTime: (date) => {
    const state = useI18nStore.getState()
    const locale = I18nManager.getLocale(state.currentLanguage)
    
    const now = new Date()
    const target = new Date(date)
    const diffInSeconds = (target - now) / 1000
    
    const units = [
      { unit: 'year', seconds: 31536000 },
      { unit: 'month', seconds: 2592000 },
      { unit: 'week', seconds: 604800 },
      { unit: 'day', seconds: 86400 },
      { unit: 'hour', seconds: 3600 },
      { unit: 'minute', seconds: 60 }
    ]
    
    for (const { unit, seconds } of units) {
      const value = Math.floor(Math.abs(diffInSeconds) / seconds)
      if (value >= 1) {
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
        return rtf.format(diffInSeconds < 0 ? -value : value, unit)
      }
    }
    
    return I18nManager.t('time.now')
  },
  
  // Get locale from language code
  getLocale: (language) => {
    const localeMap = {
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      zh: 'zh-CN',
      ja: 'ja-JP',
      ar: 'ar-SA',
      pt: 'pt-BR',
      ru: 'ru-RU',
      hi: 'hi-IN'
    }
    
    return localeMap[language] || 'en-US'
  },
  
  // Language detection
  detectLanguage: () => {
    // Check browser language
    const browserLang = navigator.language || navigator.languages[0]
    const langCode = browserLang.split('-')[0]
    
    const supportedLanguages = useI18nStore.getState().supportedLanguages
    return supportedLanguages[langCode] ? langCode : 'en'
  },
  
  // RTL support
  isRTL: (language = null) => {
    const state = useI18nStore.getState()
    const lang = language || state.currentLanguage
    return state.supportedLanguages[lang]?.rtl || false
  },
  
  // Apply RTL styles
  applyDirection: () => {
    const isRTL = I18nManager.isRTL()
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.classList.toggle('rtl', isRTL)
  },
  
  // Export translations for editing
  exportTranslations: (language) => {
    const state = useI18nStore.getState()
    const translations = state.translations[language]
    
    if (!translations) {
      console.error(`No translations found for language: ${language}`)
      return null
    }
    
    return {
      language,
      translations,
      exportedAt: new Date().toISOString()
    }
  },
  
  // Import translations
  importTranslations: (data) => {
    const state = useI18nStore.getState()
    
    if (data.language && data.translations) {
      state.updateTranslations(data.language, data.translations)
      return true
    }
    
    return false
  },
  
  // Get missing translation keys
  getMissingKeys: () => {
    return useI18nStore.getState().missingKeys
  },
  
  // Clear missing keys
  clearMissingKeys: () => {
    useI18nStore.setState({ missingKeys: [] })
  },
  
  // Language switching with persistence
  changeLanguage: (language) => {
    const state = useI18nStore.getState()
    
    if (state.supportedLanguages[language]) {
      state.setLanguage(language)
      
      // Persist language choice
      localStorage.setItem('kn3aux-language', language)
      
      // Apply RTL if needed
      I18nManager.applyDirection()
      
      // Update HTML lang attribute
      document.documentElement.lang = language
      
      return true
    }
    
    return false
  },
  
  // Initialize i18n
  init: () => {
    // Load saved language or detect from browser
    const savedLanguage = localStorage.getItem('kn3aux-language')
    const detectedLanguage = I18nManager.detectLanguage()
    const initialLanguage = savedLanguage || detectedLanguage
    
    // Set base translations
    useI18nStore.setState({
      translations: { en: baseTranslations }
    })
    
    // Change to initial language
    I18nManager.changeLanguage(initialLanguage)
  }
}

// React hook for translations
export const useTranslation = () => {
  const { currentLanguage, supportedLanguages } = useI18nStore()
  
  return {
    t: I18nManager.t,
    currentLanguage,
    supportedLanguages,
    changeLanguage: I18nManager.changeLanguage,
    isRTL: I18nManager.isRTL(),
    formatDate: I18nManager.formatDate,
    formatTime: I18nManager.formatTime,
    formatNumber: I18nManager.formatNumber,
    formatCurrency: I18nManager.formatCurrency,
    formatRelativeTime: I18nManager.formatRelativeTime
  }
}

// Initialize i18n on module load
if (typeof window !== 'undefined') {
  I18nManager.init()
}

export default useI18nStore