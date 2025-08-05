import React, { useState, useEffect } from 'react'
import { BarChart3, Activity, Users, Zap, Settings, Code, Palette, Camera, Repository, Brain, 
         Monitor, TrendingUp, Clock, HardDrive, Cpu, Wifi, Globe } from 'lucide-react'
import useActivityStore, { ActivityLogger } from '../modules/ActivityLogger'
import useDeveloperStore, { DeveloperTools } from '../modules/DeveloperTools'
import useRepositoryStore from '../modules/RepositoryMirror'
import useAIStore from '../modules/AIAssistant'
import { UtilityTools } from '../modules/UtilityTools'

const Dashboard = ({ isOpen, onClose }) => {
  const { userStats, activities, analytics } = useActivityStore()
  const { logs, networkRequests, performanceMetrics } = useDeveloperStore()
  const { repositories } = useRepositoryStore()
  const { suggestions, isProcessing } = useAIStore()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [realTimeStats, setRealTimeStats] = useState({
    memory: null,
    fps: 60,
    networkLatency: 0
  })

  useEffect(() => {
    if (isOpen) {
      // Update real-time statistics
      const updateStats = () => {
        const performance = UtilityTools.performance.monitor()
        setRealTimeStats({
          memory: performance.memory,
          fps: performance.fps,
          networkLatency: Math.random() * 100 // Mock latency
        })
      }

      updateStats()
      const interval = setInterval(updateStats, 2000)
      
      return () => clearInterval(interval)
    }
  }, [isOpen])

  if (!isOpen) return null

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue', trend }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          <span className="text-sm text-green-600">{trend}</span>
        </div>
      )}
    </div>
  )

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Code}
          title="Components Created"
          value={userStats.componentsCreated}
          subtitle="This session"
          color="blue"
          trend="+12% from last week"
        />
        <StatCard
          icon={Activity}
          title="Total Actions"
          value={activities.length}
          subtitle="Recent activities"
          color="green"
        />
        <StatCard
          icon={Repository}
          title="Repositories"
          value={repositories.length}
          subtitle="Offline mirrors"
          color="purple"
        />
        <StatCard
          icon={Brain}
          title="AI Suggestions"
          value={suggestions.length}
          subtitle="Available"
          color="orange"
        />
      </div>

      {/* Real-time Performance */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Monitor className="w-5 h-5 mr-2" />
          Real-time Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{realTimeStats.fps}</div>
            <div className="text-sm text-gray-500">FPS</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(realTimeStats.fps / 60) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {realTimeStats.memory ? `${realTimeStats.memory.used}MB` : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Memory Used</div>
            {realTimeStats.memory && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${(realTimeStats.memory.used / realTimeStats.memory.total) * 100}%` }}
                ></div>
              </div>
            )}
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{Math.round(realTimeStats.networkLatency)}ms</div>
            <div className="text-sm text-gray-500">Network Latency</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.max(0, 100 - realTimeStats.networkLatency)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-center py-2 border-b last:border-b-0">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">{activity.type.replace('_', ' ')}</div>
                <div className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const AnalyticsTab = () => (
    <div className="space-y-6">
      {/* Component Usage */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Component Usage</h3>
        <div className="space-y-3">
          {Object.entries(analytics.componentUsage || {}).map(([component, count]) => (
            <div key={component} className="flex items-center justify-between">
              <span className="text-sm font-medium capitalize">{component}</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(count / Math.max(...Object.values(analytics.componentUsage))) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Usage */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Feature Usage</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(analytics.featureUsage || {}).map(([feature, count]) => (
            <div key={feature} className="bg-gray-50 p-3 rounded">
              <div className="text-lg font-bold">{count}</div>
              <div className="text-sm text-gray-600 capitalize">{feature.replace('_', ' ')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
        <div className="h-48 flex items-end justify-between space-x-2">
          {performanceMetrics.slice(-10).map((metric, index) => (
            <div 
              key={index}
              className="bg-blue-500 w-8 rounded-t"
              style={{ height: `${(metric.value / 100) * 100}%` }}
              title={`${metric.metricName}: ${metric.value}ms`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  )

  const DeveloperTab = () => (
    <div className="space-y-6">
      {/* Console Logs */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Recent Console Logs</h3>
        <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-64 overflow-y-auto">
          {logs.slice(-10).map((log) => (
            <div key={log.id} className="mb-1">
              <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span className={`ml-2 ${
                log.level === 'error' ? 'text-red-400' :
                log.level === 'warn' ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {log.level.toUpperCase()}
              </span>
              <span className="ml-2">{log.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Network Requests */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Network Activity</h3>
        <div className="space-y-2">
          {networkRequests.slice(-5).map((request) => (
            <div key={request.id} className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  request.success ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <div className="text-sm font-medium">{request.method} {request.url}</div>
                  <div className="text-xs text-gray-500">{request.duration}ms</div>
                </div>
              </div>
              <div className={`text-sm font-medium ${
                request.status >= 200 && request.status < 300 ? 'text-green-600' : 'text-red-600'
              }`}>
                {request.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'developer', label: 'Developer', icon: Code },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
              <p className="text-blue-100">Comprehensive insights into your KN3AUX-CODE™ workflow</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded"
            >
              ×
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-gray-50 px-6 py-3 border-b">
          <div className="flex space-x-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'developer' && <DeveloperTab />}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t flex justify-between items-center text-sm text-gray-600">
          <div>Last updated: {new Date().toLocaleTimeString()}</div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Wifi className="w-4 h-4 mr-1" />
              <span>Online</span>
            </div>
            <div className="flex items-center">
              <HardDrive className="w-4 h-4 mr-1" />
              <span>{repositories.length} repos cached</span>
            </div>
            <div className="flex items-center">
              <Cpu className="w-4 h-4 mr-1" />
              <span>{realTimeStats.memory ? `${realTimeStats.memory.used}MB used` : 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard