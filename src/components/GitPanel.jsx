import React, { useState } from 'react'
import { GitBranch, Upload, Download, Clock, Check, AlertCircle, MessageSquare } from 'lucide-react'
import { useGitStore } from '../store/gitStore'
import { useBuilderStore } from '../store/builderStore'

const GitPanel = () => {
  const [commitMessage, setCommitMessage] = useState('')
  const [isCommitting, setIsCommitting] = useState(false)
  const [isPushing, setIsPushing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const [showCommitForm, setShowCommitForm] = useState(false)

  const {
    repositoryConfig,
    currentBranch,
    branches,
    commits,
    pendingChanges,
    lastSync,
    createCommit,
    pushChanges,
    pullChanges,
    switchBranch,
    getBranchCommits
  } = useGitStore()

  const { components } = useBuilderStore()

  const handleCommit = async () => {
    if (!commitMessage.trim()) return

    setIsCommitting(true)
    try {
      await createCommit(commitMessage, components)
      setCommitMessage('')
      setShowCommitForm(false)
    } catch (error) {
      console.error('Commit failed:', error)
    } finally {
      setIsCommitting(false)
    }
  }

  const handlePush = async () => {
    setIsPushing(true)
    try {
      await pushChanges()
    } catch (error) {
      console.error('Push failed:', error)
    } finally {
      setIsPushing(false)
    }
  }

  const handlePull = async () => {
    setIsPulling(true)
    try {
      await pullChanges()
    } catch (error) {
      console.error('Pull failed:', error)
    } finally {
      setIsPulling(false)
    }
  }

  const branchCommits = getBranchCommits()

  if (!repositoryConfig.isConfigured) {
    return (
      <div className="p-4 text-center">
        <GitBranch className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">Git not configured</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Repository Info */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-2 mb-2">
          <GitBranch className="w-4 h-4 text-purple-600" />
          <span className="font-medium text-sm">{repositoryConfig.name}</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <span>Branch: {currentBranch}</span>
          {lastSync && (
            <>
              <span>•</span>
              <span>Last sync: {new Date(lastSync).toLocaleTimeString()}</span>
            </>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          {pendingChanges ? (
            <>
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-orange-700">Uncommitted changes</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-700">Working tree clean</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {/* Commit */}
        {!showCommitForm ? (
          <button
            onClick={() => setShowCommitForm(true)}
            disabled={!pendingChanges}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Commit Changes</span>
          </button>
        ) : (
          <div className="space-y-2">
            <textarea
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Enter commit message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
              rows="2"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleCommit}
                disabled={!commitMessage.trim() || isCommitting}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isCommitting ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
                <span>Commit</span>
              </button>
              <button
                onClick={() => {
                  setShowCommitForm(false)
                  setCommitMessage('')
                }}
                className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Push/Pull */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handlePush}
            disabled={isPushing || branchCommits.length === 0}
            className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isPushing ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-3 h-3" />
            )}
            <span>Push</span>
          </button>
          <button
            onClick={handlePull}
            disabled={isPulling}
            className="flex items-center justify-center space-x-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isPulling ? (
              <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-3 h-3" />
            )}
            <span>Pull</span>
          </button>
        </div>
      </div>

      {/* Recent Commits */}
      {branchCommits.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Commits</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {branchCommits.slice(0, 5).map((commit) => (
              <div key={commit.id} className="border border-gray-200 rounded-lg p-2">
                <div className="flex items-start space-x-2">
                  <Clock className="w-3 h-3 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {commit.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(commit.timestamp).toLocaleDateString()} at{' '}
                      {new Date(commit.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default GitPanel