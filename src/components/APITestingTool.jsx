import React, { useState, useRef } from 'react'
import { Send, Plus, Trash2, Copy, Download, Globe, Lock, Eye, EyeOff, 
         Clock, Database, FileText, Code, Settings } from 'lucide-react'

const APITestingTool = ({ isOpen, onClose }) => {
  const [requests, setRequests] = useState([
    {
      id: 1,
      name: 'Get Users',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/users',
      headers: {},
      body: '',
      response: null,
      loading: false
    }
  ])
  
  const [activeRequest, setActiveRequest] = useState(1)
  const [showHeaders, setShowHeaders] = useState(false)
  const [showBody, setShowBody] = useState(false)
  const [environments, setEnvironments] = useState({
    development: {
      baseUrl: 'http://localhost:3000',
      apiKey: 'dev-key-123'
    },
    staging: {
      baseUrl: 'https://staging-api.example.com',
      apiKey: 'staging-key-456'
    },
    production: {
      baseUrl: 'https://api.example.com',
      apiKey: 'prod-key-789'
    }
  })
  const [activeEnvironment, setActiveEnvironment] = useState('development')
  const [collections, setCollections] = useState([
    {
      id: 1,
      name: 'User Management',
      requests: [1]
    }
  ])

  const getCurrentRequest = () => {
    return requests.find(r => r.id === activeRequest)
  }

  const updateRequest = (updates) => {
    setRequests(requests.map(r => 
      r.id === activeRequest ? { ...r, ...updates } : r
    ))
  }

  const addRequest = () => {
    const newRequest = {
      id: Date.now(),
      name: 'New Request',
      method: 'GET',
      url: '',
      headers: {},
      body: '',
      response: null,
      loading: false
    }
    setRequests([...requests, newRequest])
    setActiveRequest(newRequest.id)
  }

  const duplicateRequest = (id) => {
    const original = requests.find(r => r.id === id)
    if (original) {
      const duplicate = {
        ...original,
        id: Date.now(),
        name: original.name + ' Copy',
        response: null,
        loading: false
      }
      setRequests([...requests, duplicate])
    }
  }

  const deleteRequest = (id) => {
    setRequests(requests.filter(r => r.id !== id))
    if (activeRequest === id) {
      const remaining = requests.filter(r => r.id !== id)
      setActiveRequest(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  const sendRequest = async () => {
    const request = getCurrentRequest()
    if (!request) return

    updateRequest({ loading: true, response: null })

    try {
      const startTime = Date.now()
      
      // Replace environment variables
      let url = request.url
      const env = environments[activeEnvironment]
      if (env) {
        url = url.replace('{{baseUrl}}', env.baseUrl)
        url = url.replace('{{apiKey}}', env.apiKey)
      }

      const options = {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          ...request.headers
        }
      }

      if (request.method !== 'GET' && request.body) {
        options.body = request.body
      }

      const response = await fetch(url, options)
      const endTime = Date.now()
      const responseTime = endTime - startTime

      let responseData
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }

      const responseInfo = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        responseTime,
        size: JSON.stringify(responseData).length
      }

      updateRequest({ 
        loading: false, 
        response: responseInfo,
        lastRun: new Date().toISOString()
      })

    } catch (error) {
      updateRequest({ 
        loading: false, 
        response: {
          error: error.message,
          status: 0,
          responseTime: 0
        }
      })
    }
  }

  const formatResponse = (response) => {
    if (!response) return ''
    
    if (typeof response === 'object') {
      return JSON.stringify(response, null, 2)
    }
    return response
  }

  const exportCollection = () => {
    const exportData = {
      name: 'KN3AUX API Collection',
      requests: requests.map(r => ({
        name: r.name,
        method: r.method,
        url: r.url,
        headers: r.headers,
        body: r.body
      })),
      environments,
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'kn3aux-api-collection.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const generateCode = (language = 'javascript') => {
    const request = getCurrentRequest()
    if (!request) return ''

    const templates = {
      javascript: `fetch('${request.url}', {
  method: '${request.method}',
  headers: ${JSON.stringify(request.headers, null, 2)},${request.body ? `\n  body: ${JSON.stringify(request.body)}` : ''}
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error))`,

      curl: `curl -X ${request.method} \\
  '${request.url}' \\${Object.entries(request.headers).map(([key, value]) => `\n  -H '${key}: ${value}' \\`).join('')}${request.body ? `\n  -d '${request.body}'` : ''}`,

      python: `import requests

url = '${request.url}'
headers = ${JSON.stringify(request.headers, null, 2).replace(/"/g, "'")}${request.body ? `\ndata = ${JSON.stringify(request.body, null, 2).replace(/"/g, "'")}` : ''}

response = requests.${request.method.toLowerCase()}(url, headers=headers${request.body ? ', json=data' : ''})
print(response.json())`,

      php: `<?php
$url = '${request.url}';
$headers = ${JSON.stringify(Object.entries(request.headers).map(([key, value]) => `${key}: ${value}`), null, 2).replace(/"/g, "'")};\n
$options = [
    'http' => [
        'header' => implode("\\r\\n", $headers),
        'method' => '${request.method}',${request.body ? `\n        'content' => '${request.body}'` : ''}
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);
echo $result;
?>`
    }

    return templates[language] || templates.javascript
  }

  if (!isOpen) return null

  const currentRequest = getCurrentRequest()

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">API Testing Tool</h2>
              <p className="text-green-100">Test and debug APIs with advanced features</p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={activeEnvironment}
                onChange={(e) => setActiveEnvironment(e.target.value)}
                className="bg-white bg-opacity-20 text-white border border-white border-opacity-30 rounded px-3 py-1"
              >
                {Object.keys(environments).map(env => (
                  <option key={env} value={env} className="text-gray-900">{env}</option>
                ))}
              </select>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Request List */}
          <div className="w-80 bg-gray-50 border-r flex flex-col">
            <div className="p-4 border-b">
              <button
                onClick={addRequest}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {collections.map(collection => (
                <div key={collection.id} className="p-4">
                  <h3 className="font-medium text-gray-700 mb-2">{collection.name}</h3>
                  <div className="space-y-1">
                    {requests
                      .filter(r => collection.requests.includes(r.id))
                      .map(request => (
                        <div
                          key={request.id}
                          className={`flex items-center p-2 rounded cursor-pointer group ${
                            activeRequest === request.id ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-100'
                          }`}
                          onClick={() => setActiveRequest(request.id)}
                        >
                          <span className={`text-xs font-bold px-2 py-1 rounded mr-2 ${
                            request.method === 'GET' ? 'bg-green-100 text-green-800' :
                            request.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                            request.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                            request.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {request.method}
                          </span>
                          <span className="flex-1 text-sm truncate">{request.name}</span>
                          <div className="hidden group-hover:flex space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                duplicateRequest(request.id)
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteRequest(request.id)
                              }}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t">
              <button
                onClick={exportCollection}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Collection
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {currentRequest ? (
              <>
                {/* Request Configuration */}
                <div className="p-4 border-b bg-white">
                  <div className="space-y-4">
                    {/* Request Name */}
                    <input
                      type="text"
                      value={currentRequest.name}
                      onChange={(e) => updateRequest({ name: e.target.value })}
                      className="text-lg font-semibold bg-transparent border-none outline-none w-full"
                      placeholder="Request Name"
                    />

                    {/* URL and Method */}
                    <div className="flex space-x-2">
                      <select
                        value={currentRequest.method}
                        onChange={(e) => updateRequest({ method: e.target.value })}
                        className="px-3 py-2 border rounded"
                      >
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>PATCH</option>
                        <option>DELETE</option>
                      </select>
                      <input
                        type="text"
                        value={currentRequest.url}
                        onChange={(e) => updateRequest({ url: e.target.value })}
                        placeholder="Enter request URL"
                        className="flex-1 px-3 py-2 border rounded"
                      />
                      <button
                        onClick={sendRequest}
                        disabled={currentRequest.loading}
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
                      >
                        {currentRequest.loading ? (
                          <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span className="ml-2">Send</span>
                      </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-4 border-b">
                      <button
                        onClick={() => setShowHeaders(!showHeaders)}
                        className={`pb-2 px-1 ${showHeaders ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                      >
                        Headers
                      </button>
                      <button
                        onClick={() => setShowBody(!showBody)}
                        className={`pb-2 px-1 ${showBody ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                      >
                        Body
                      </button>
                    </div>

                    {/* Headers */}
                    {showHeaders && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Headers</h4>
                        <textarea
                          value={JSON.stringify(currentRequest.headers, null, 2)}
                          onChange={(e) => {
                            try {
                              updateRequest({ headers: JSON.parse(e.target.value) })
                            } catch {} // Ignore invalid JSON while typing
                          }}
                          placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                          className="w-full h-24 p-3 border rounded font-mono text-sm"
                        />
                      </div>
                    )}

                    {/* Body */}
                    {showBody && currentRequest.method !== 'GET' && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Request Body</h4>
                        <textarea
                          value={currentRequest.body}
                          onChange={(e) => updateRequest({ body: e.target.value })}
                          placeholder='{"key": "value"}'
                          className="w-full h-32 p-3 border rounded font-mono text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Response */}
                <div className="flex-1 p-4 bg-gray-50">
                  <div className="h-full bg-white rounded border">
                    {currentRequest.response ? (
                      <div className="h-full flex flex-col">
                        {/* Response Status */}
                        <div className="p-4 border-b flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 rounded text-sm font-medium ${
                              currentRequest.response.status >= 200 && currentRequest.response.status < 300
                                ? 'bg-green-100 text-green-800'
                                : currentRequest.response.status >= 400
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {currentRequest.response.status} {currentRequest.response.statusText}
                            </span>
                            <span className="text-sm text-gray-600 flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {currentRequest.response.responseTime}ms
                            </span>
                            <span className="text-sm text-gray-600 flex items-center">
                              <Database className="w-4 h-4 mr-1" />
                              {(currentRequest.response.size / 1024).toFixed(2)}KB
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => navigator.clipboard.writeText(formatResponse(currentRequest.response.data))}
                              className="text-sm px-3 py-1 border rounded hover:bg-gray-50"
                            >
                              Copy Response
                            </button>
                            <button
                              onClick={() => {
                                const code = generateCode('javascript')
                                navigator.clipboard.writeText(code)
                              }}
                              className="text-sm px-3 py-1 border rounded hover:bg-gray-50"
                            >
                              Copy Code
                            </button>
                          </div>
                        </div>

                        {/* Response Body */}
                        <div className="flex-1 p-4">
                          <pre className="h-full overflow-auto text-sm bg-gray-50 p-4 rounded">
                            {currentRequest.response.error 
                              ? currentRequest.response.error
                              : formatResponse(currentRequest.response.data)
                            }
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Send a request to see the response</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a request or create a new one</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Code Generation */}
          <div className="w-80 bg-white border-l">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Code Generation</h3>
            </div>
            <div className="p-4 space-y-4">
              {['javascript', 'curl', 'python', 'php'].map(lang => (
                <div key={lang}>
                  <h4 className="font-medium capitalize mb-2">{lang}</h4>
                  <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-auto max-h-32">
                    {generateCode(lang)}
                  </pre>
                  <button
                    onClick={() => navigator.clipboard.writeText(generateCode(lang))}
                    className="w-full mt-2 text-sm px-3 py-1 border rounded hover:bg-gray-50"
                  >
                    Copy {lang.toUpperCase()}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default APITestingTool