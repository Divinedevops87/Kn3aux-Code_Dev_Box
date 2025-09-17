import React, { useState, useEffect } from 'react'
import { Search, Plus, Download, Trash2, Eye, Star, GitBranch, Clock, Filter, Grid, List, Globe, HardDrive } from 'lucide-react'
import useRepositoryStore, { RepositoryMirror } from '../modules/RepositoryMirror'
import WebviewPopup from './WebviewPopup'

const RepositoryManager = ({ isOpen, onClose }) => {
  const {
    repositories,
    searchQuery,
    filters,
    isLoading,
    setSearchQuery,
    setFilters,
    getFilteredRepositories
  } = useRepositoryStore()

  const [showAddRepo, setShowAddRepo] = useState(false)
  const [newRepoUrl, setNewRepoUrl] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedRepo, setSelectedRepo] = useState(null)
  const [showWebview, setShowWebview] = useState(false)
  const [githubSearchQuery, setGithubSearchQuery] = useState('')
  const [githubResults, setGithubResults] = useState([])

  const filteredRepos = getFilteredRepositories()

  const handleAddRepository = async () => {
    if (!newRepoUrl.trim()) return

    try {
      // Parse GitHub URL
      const match = newRepoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
      if (!match) {
        alert('Please enter a valid GitHub repository URL')
        return
      }

      const [, owner, repo] = match
      await RepositoryMirror.mirrorRepository(owner, repo)
      setNewRepoUrl('')
      setShowAddRepo(false)
    } catch (error) {
      console.error('Failed to add repository:', error)
      alert('Failed to add repository. Please check the URL and try again.')
    }
  }

  const handleSearchGitHub = async () => {
    if (!githubSearchQuery.trim()) return

    try {
      const results = await RepositoryMirror.searchRepositories(githubSearchQuery)
      setGithubResults(results)
    } catch (error) {
      console.error('GitHub search failed:', error)
    }
  }

  const handleMirrorFromSearch = async (repo) => {
    try {
      await RepositoryMirror.mirrorRepository(repo.owner.login, repo.name)
      setGithubResults(githubResults.filter(r => r.id !== repo.id))
    } catch (error) {
      console.error('Failed to mirror repository:', error)
    }
  }

  const handleRemoveRepository = async (repoId) => {
    if (confirm('Are you sure you want to remove this repository from local storage?')) {
      useRepositoryStore.getState().removeRepository(repoId)
    }
  }

  const handleViewRepository = (repo) => {
    setSelectedRepo(repo)
    setShowWebview(true)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-6xl h-5/6 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Repository Manager</h2>
                <p className="text-purple-100">Manage your offline repository mirrors</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded"
              >
                ×
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {/* Search */}
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search repositories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Filters */}
              <select
                value={filters.language}
                onChange={(e) => setFilters({ language: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="">All Languages</option>
                <option value="JavaScript">JavaScript</option>
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="TypeScript">TypeScript</option>
                <option value="Go">Go</option>
                <option value="Rust">Rust</option>
              </select>

              <select
                value={filters.size}
                onChange={(e) => setFilters({ size: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="">All Sizes</option>
                <option value="small">Small (&lt; 10MB)</option>
                <option value="medium">Medium (10-100MB)</option>
                <option value="large">Large (&gt; 100MB)</option>
              </select>

              {/* View Mode */}
              <div className="flex border rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Add Repository */}
              <button
                onClick={() => setShowAddRepo(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Repository
              </button>
            </div>

            {/* Stats */}
            <div className="flex space-x-6 text-sm text-gray-600">
              <span>Total: {repositories.length} repositories</span>
              <span>Filtered: {filteredRepos.length} showing</span>
              <span>
                Storage: {formatSize(repositories.reduce((total, repo) => total + (repo.size || 0), 0))}
              </span>
            </div>
          </div>

          {/* Repository List */}
          <div className="flex-1 overflow-auto p-4">
            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-600">Loading repositories...</p>
              </div>
            )}

            {!isLoading && filteredRepos.length === 0 && (
              <div className="text-center py-8">
                <HardDrive className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No repositories found</h3>
                <p className="text-gray-500 mb-4">Start by adding some repositories to your offline collection</p>
                <button
                  onClick={() => setShowAddRepo(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Add Your First Repository
                </button>
              </div>
            )}

            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRepos.map(repo => (
                  <div key={repo.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <img
                          src={repo.owner.avatar_url}
                          alt={repo.owner.login}
                          className="w-8 h-8 rounded-full mr-3"
                        />
                        <div>
                          <h3 className="font-semibold text-sm">{repo.name}</h3>
                          <p className="text-xs text-gray-500">{repo.owner.login}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        repo.status === 'synced' ? 'bg-green-100 text-green-800' :
                        repo.status === 'syncing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {repo.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {repo.description || 'No description available'}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span className="flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        {repo.stargazers_count}
                      </span>
                      <span className="flex items-center">
                        <GitBranch className="w-3 h-3 mr-1" />
                        {repo.forks_count}
                      </span>
                      <span>{repo.language}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(repo.mirroredAt)}
                      </span>
                      <span>{formatSize(repo.size || 0)}</span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewRepository(repo)}
                        className="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 flex items-center justify-center"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleRemoveRepository(repo.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-2">
                {filteredRepos.map(repo => (
                  <div key={repo.id} className="border rounded-lg p-3 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center flex-1">
                      <img
                        src={repo.owner.avatar_url}
                        alt={repo.owner.login}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="font-semibold">{repo.full_name}</h3>
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            repo.status === 'synced' ? 'bg-green-100 text-green-800' :
                            repo.status === 'syncing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {repo.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{repo.description}</p>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          {repo.stargazers_count}
                        </span>
                        <span>{repo.language}</span>
                        <span>{formatSize(repo.size || 0)}</span>
                        <span>{formatDate(repo.mirroredAt)}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleViewRepository(repo)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleRemoveRepository(repo.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Repository Modal */}
      {showAddRepo && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Add Repository</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Repository URL</label>
                  <input
                    type="text"
                    value={newRepoUrl}
                    onChange={(e) => setNewRepoUrl(e.target.value)}
                    placeholder="https://github.com/owner/repository"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Or search GitHub</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={githubSearchQuery}
                      onChange={(e) => setGithubSearchQuery(e.target.value)}
                      placeholder="Search repositories..."
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <button
                      onClick={handleSearchGitHub}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {githubResults.length > 0 && (
                  <div className="max-h-64 overflow-auto border rounded-lg">
                    {githubResults.map(repo => (
                      <div key={repo.id} className="p-3 border-b last:border-b-0 flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{repo.full_name}</h4>
                          <p className="text-sm text-gray-600">{repo.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span className="flex items-center">
                              <Star className="w-3 h-3 mr-1" />
                              {repo.stargazers_count}
                            </span>
                            <span>{repo.language}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleMirrorFromSearch(repo)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                        >
                          Mirror
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t flex justify-end space-x-2">
              <button
                onClick={() => setShowAddRepo(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRepository}
                disabled={!newRepoUrl.trim()}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                Add Repository
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Webview Popup */}
      <WebviewPopup
        repository={selectedRepo}
        isOpen={showWebview}
        onClose={() => setShowWebview(false)}
      />
    </>
  )
}

export default RepositoryManager