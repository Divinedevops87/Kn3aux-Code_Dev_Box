import React, { useState, useEffect } from 'react'
import { Search, Filter, Download, Heart, Star, Eye, Zap, Layout, Smartphone, 
         Globe, ShoppingCart, Users, Briefcase, Code, Palette, Clock } from 'lucide-react'

const TemplateMarketplace = ({ isOpen, onClose, onTemplateSelect }) => {
  const [templates, setTemplates] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [viewMode, setViewMode] = useState('grid')
  const [favorites, setFavorites] = useState([])
  const [previewTemplate, setPreviewTemplate] = useState(null)

  const categories = [
    { id: 'all', name: 'All Templates', icon: Layout },
    { id: 'landing', name: 'Landing Pages', icon: Globe },
    { id: 'ecommerce', name: 'E-commerce', icon: ShoppingCart },
    { id: 'portfolio', name: 'Portfolio', icon: Users },
    { id: 'business', name: 'Business', icon: Briefcase },
    { id: 'mobile', name: 'Mobile Apps', icon: Smartphone },
    { id: 'dashboard', name: 'Dashboards', icon: Layout },
    { id: 'blog', name: 'Blogs', icon: Code }
  ]

  // Mock template data
  useEffect(() => {
    const mockTemplates = [
      {
        id: 1,
        name: 'Modern Landing Page',
        description: 'Clean and modern landing page with hero section, features, and CTA',
        category: 'landing',
        tags: ['modern', 'responsive', 'hero', 'clean'],
        author: 'KN3AUX Design Team',
        rating: 4.8,
        downloads: 15420,
        likes: 892,
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
        premium: false,
        components: 12,
        responsive: true,
        darkMode: true,
        animations: true,
        price: 0,
        createdAt: '2024-01-15'
      },
      {
        id: 2,
        name: 'E-commerce Store',
        description: 'Complete e-commerce template with product catalog, cart, and checkout',
        category: 'ecommerce',
        tags: ['shop', 'product', 'cart', 'checkout'],
        author: 'Commerce Pro',
        rating: 4.9,
        downloads: 8320,
        likes: 567,
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
        premium: true,
        components: 24,
        responsive: true,
        darkMode: false,
        animations: true,
        price: 49,
        createdAt: '2024-01-10'
      },
      {
        id: 3,
        name: 'Portfolio Showcase',
        description: 'Creative portfolio template for designers and developers',
        category: 'portfolio',
        tags: ['creative', 'showcase', 'gallery', 'minimal'],
        author: 'Creative Studio',
        rating: 4.7,
        downloads: 12150,
        likes: 734,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
        premium: false,
        components: 16,
        responsive: true,
        darkMode: true,
        animations: true,
        price: 0,
        createdAt: '2024-01-08'
      },
      {
        id: 4,
        name: 'Business Dashboard',
        description: 'Professional dashboard with charts, tables, and analytics',
        category: 'dashboard',
        tags: ['analytics', 'charts', 'data', 'professional'],
        author: 'Data Viz Pro',
        rating: 4.6,
        downloads: 6890,
        likes: 423,
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
        premium: true,
        components: 32,
        responsive: true,
        darkMode: true,
        animations: false,
        price: 79,
        createdAt: '2024-01-05'
      },
      {
        id: 5,
        name: 'Mobile App UI',
        description: 'Modern mobile app interface with smooth animations',
        category: 'mobile',
        tags: ['mobile', 'app', 'ui', 'smooth'],
        author: 'Mobile Masters',
        rating: 4.9,
        downloads: 11230,
        likes: 891,
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
        premium: true,
        components: 20,
        responsive: true,
        darkMode: true,
        animations: true,
        price: 39,
        createdAt: '2024-01-12'
      },
      {
        id: 6,
        name: 'Corporate Website',
        description: 'Professional corporate website with multiple pages',
        category: 'business',
        tags: ['corporate', 'professional', 'multipage', 'formal'],
        author: 'Business Templates Inc',
        rating: 4.5,
        downloads: 9340,
        likes: 512,
        image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop',
        premium: false,
        components: 18,
        responsive: true,
        darkMode: false,
        animations: false,
        price: 0,
        createdAt: '2024-01-03'
      }
    ]
    setTemplates(mockTemplates)
  }, [])

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloads - a.downloads
      case 'rating':
        return b.rating - a.rating
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      default:
        return 0
    }
  })

  const toggleFavorite = (templateId) => {
    setFavorites(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    )
  }

  const downloadTemplate = (template) => {
    // Mock download functionality
    console.log('Downloading template:', template.name)
    
    // In a real implementation, this would:
    // 1. Check if user has access (free vs premium)
    // 2. Download template files
    // 3. Import into the builder
    
    if (onTemplateSelect) {
      onTemplateSelect(template)
    }
  }

  const TemplateCard = ({ template }) => (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="relative">
        <img 
          src={template.image} 
          alt={template.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        {template.premium && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded text-xs font-semibold">
            Premium
          </div>
        )}
        <button
          onClick={() => toggleFavorite(template.id)}
          className={`absolute top-2 right-2 p-2 rounded-full ${
            favorites.includes(template.id) 
              ? 'bg-red-500 text-white' 
              : 'bg-white text-gray-400 hover:text-red-500'
          }`}
        >
          <Heart className="w-4 h-4" fill={favorites.includes(template.id) ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={() => setPreviewTemplate(template)}
          className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg truncate flex-1">{template.name}</h3>
          <div className="flex items-center ml-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">{template.rating}</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{template.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span>By {template.author}</span>
          <span>{template.downloads.toLocaleString()} downloads</span>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.slice(0, 3).map(tag => (
            <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="text-gray-400 text-xs">+{template.tags.length - 3}</span>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex space-x-2">
            {template.responsive && (
              <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center" title="Responsive">
                <Smartphone className="w-3 h-3 text-blue-600" />
              </div>
            )}
            {template.darkMode && (
              <div className="w-5 h-5 bg-gray-800 rounded flex items-center justify-center" title="Dark Mode">
                <Palette className="w-3 h-3 text-white" />
              </div>
            )}
            {template.animations && (
              <div className="w-5 h-5 bg-purple-100 rounded flex items-center justify-center" title="Animations">
                <Zap className="w-3 h-3 text-purple-600" />
              </div>
            )}
          </div>
          <span className="text-sm text-gray-500">{template.components} components</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold">
            {template.price === 0 ? 'Free' : `$${template.price}`}
          </div>
          <button
            onClick={() => downloadTemplate(template)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
          >
            <Download className="w-4 h-4 mr-1" />
            Use Template
          </button>
        </div>
      </div>
    </div>
  )

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-7xl h-5/6 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Template Marketplace</h2>
                <p className="text-blue-100">Discover and use professional templates to jumpstart your projects</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded"
              >
                ×
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {/* Search */}
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              {/* View Mode */}
              <div className="flex border rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                >
                  <Layout className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {category.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 overflow-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {filteredTemplates.length} templates found
              </h3>
              <div className="text-sm text-gray-600">
                Showing {selectedCategory === 'all' ? 'all categories' : categories.find(c => c.id === selectedCategory)?.name}
              </div>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map(template => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTemplates.map(template => (
                  <div key={template.id} className="bg-white rounded-lg shadow-sm border p-4 flex">
                    <img 
                      src={template.image} 
                      alt={template.name}
                      className="w-24 h-24 object-cover rounded-lg mr-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{template.name}</h3>
                          <p className="text-gray-600 text-sm">{template.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {template.price === 0 ? 'Free' : `$${template.price}`}
                          </div>
                          <button
                            onClick={() => downloadTemplate(template)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-2"
                          >
                            Use Template
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <Layout className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or browse different categories</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-60 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-5/6 flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">{previewTemplate.name}</h3>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <img 
                src={previewTemplate.image} 
                alt={previewTemplate.name}
                className="w-full h-auto"
              />
            </div>
            <div className="p-4 border-t flex justify-end space-x-3">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  downloadTemplate(previewTemplate)
                  setPreviewTemplate(null)
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TemplateMarketplace