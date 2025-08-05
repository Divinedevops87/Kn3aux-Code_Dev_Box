import React, { useState, useRef, useEffect } from 'react';
import { Brain, Settings, Send, Copy, Zap, Bug, Code, Lightbulb, Terminal, FileCode } from 'lucide-react';
import { useHuggingFace, useQwenAgent } from '../hooks/useHuggingFace';
import CodeAssistant from './CodeAssistant';
import AgenticTerminal from './AgenticTerminal';

const QwenAIAgent = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [artifacts, setArtifacts] = useState([]);
  const [selectedModel, setSelectedModel] = useState('Qwen/Qwen2.5-Coder-7B-Instruct');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  
  const messagesEndRef = useRef(null);
  
  const { 
    sendMessage, 
    isConnected, 
    availableModels, 
    modelMetrics, 
    initializeAPI 
  } = useHuggingFace();
  
  const { 
    executeAgenticTask, 
    analyzeRepository, 
    generateCode, 
    debugCode, 
    optimizeCode, 
    agentStatus 
  } = useQwenAgent(selectedModel);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleApiKeySubmit = () => {
    if (tempApiKey.trim()) {
      initializeAPI(tempApiKey);
      setShowApiKeyInput(false);
      setTempApiKey('');
    }
  };

  const handleAgenticRequest = async (userInput) => {
    if (!userInput.trim()) return;
    if (!isConnected) {
      setShowApiKeyInput(true);
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      // Determine the type of request and route to appropriate agent function
      const requestType = classifyRequest(userInput);
      let result;

      switch (requestType) {
        case 'code_generation':
          result = await generateCode(userInput, {
            context: messages.slice(-5),
            style: 'production',
            includeTests: true,
            includeDocumentation: true
          });
          break;
        case 'code_analysis':
          result = await analyzeRepository(userInput);
          break;
        case 'debugging':
          result = await debugCode(userInput, {
            includeFixSuggestions: true,
            performStaticAnalysis: true,
            generateTestCases: true
          });
          break;
        case 'optimization':
          result = await optimizeCode(userInput, {
            focusAreas: ['performance', 'readability', 'maintainability'],
            includeMetrics: true
          });
          break;
        case 'agentic_task':
        default:
          result = await executeAgenticTask(userInput, {
            allowToolUse: true,
            maxIterations: 10,
            saveArtifacts: true,
            context: {
              currentProject: 'KN3AUX-CODE Mobile Builder',
              framework: 'React + Vite',
              environment: 'development'
            }
          });
          break;
      }

      // Main agent response
      const agentMessage = {
        id: (Date.now() + 100).toString(),
        type: 'agent',
        content: result.response,
        timestamp: new Date(),
        metadata: {
          model: selectedModel,
          tokens: result.metadata?.tokens || 0,
          confidence: result.metadata?.confidence || 85,
          artifacts: result.artifacts?.map((a) => a.id) || []
        }
      };

      setMessages(prev => [...prev, agentMessage]);

      // Save any generated artifacts
      if (result.artifacts) {
        setArtifacts(prev => [...prev, ...result.artifacts]);
      }
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1000).toString(),
        type: 'system',
        content: `❌ **Error:** ${error.message}\n\nPlease try again or check your API key.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const classifyRequest = (input) => {
    const lower = input.toLowerCase();
    if (lower.includes('generate') || lower.includes('create') || lower.includes('build')) {
      return 'code_generation';
    }
    if (lower.includes('analyze') || lower.includes('review') || lower.includes('explain')) {
      return 'code_analysis';
    }
    if (lower.includes('debug') || lower.includes('fix') || lower.includes('error')) {
      return 'debugging';
    }
    if (lower.includes('optimize') || lower.includes('improve') || lower.includes('refactor')) {
      return 'optimization';
    }
    return 'agentic_task';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header with Tabs */}
      <div className="bg-white bg-opacity-10 backdrop-blur-md m-4 p-4 rounded-xl border border-white border-opacity-20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-8 h-8 text-cyan-400" />
            Qwen AI Agent
          </h2>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedModel} 
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-black bg-opacity-50 border border-cyan-500 rounded px-3 py-1 text-sm text-white"
            >
              {availableModels.map(model => (
                <option key={model} value={model}>
                  {model.split('/')[1]}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowApiKeyInput(true)}
              className="p-2 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-all"
            >
              <Settings className="w-4 h-4 text-white" />
            </button>
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-4">
          {[
            { id: 'chat', label: 'AI Chat', icon: <Brain className="w-4 h-4" /> },
            { id: 'code', label: 'Code Assistant', icon: <FileCode className="w-4 h-4" /> },
            { id: 'terminal', label: 'AI Terminal', icon: <Terminal className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white bg-opacity-20 text-white'
                  : 'bg-white bg-opacity-5 text-gray-300 hover:bg-opacity-10'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Agent Status - only show for chat tab */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-4 gap-4 text-center text-sm">
            <div>
              <div className="text-cyan-400 font-bold">{agentStatus.tasksCompleted}</div>
              <div className="text-gray-300">Tasks Done</div>
            </div>
            <div>
              <div className="text-green-400 font-bold">{agentStatus.codeGenerated}</div>
              <div className="text-gray-300">Characters Generated</div>
            </div>
            <div>
              <div className="text-purple-400 font-bold">{agentStatus.bugsFixed}</div>
              <div className="text-gray-300">Bugs Fixed</div>
            </div>
            <div>
              <div className="text-yellow-400 font-bold">{modelMetrics?.tokensPerSecond || 0}</div>
              <div className="text-gray-300">Tokens/sec</div>
            </div>
          </div>
        )}
      </div>

      {/* API Key Input Modal */}
      {showApiKeyInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-bold mb-4">Enter Hugging Face API Key</h3>
            <input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="hf_..."
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowApiKeyInput(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleApiKeySubmit}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-white mt-12">
                  <div className="text-6xl mb-6">🤖🧠</div>
                  <h3 className="text-2xl font-bold mb-4">Qwen AI Agent Ready</h3>
                  <p className="text-lg mb-6 text-gray-300">
                    Your ultimate coding companion with AI capabilities!
                  </p>
                  <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
                    {[
                      { icon: '🏗️', title: 'Build Complete Apps', desc: 'Generate full-stack applications', action: 'Build a React component for user authentication' },
                      { icon: '🔍', title: 'Analyze Code', desc: 'Deep code analysis and insights', action: 'Analyze this codebase for improvements' },
                      { icon: '🐛', title: 'Debug Issues', desc: 'Intelligent error detection', action: 'Debug this error and provide solutions' },
                      { icon: '⚡', title: 'Optimize Performance', desc: 'Code optimization tips', action: 'Optimize this code for better performance' }
                    ].map((item, index) => (
                      <button
                        key={index}
                        onClick={() => setInput(item.action)}
                        className="bg-white bg-opacity-10 backdrop-blur-md p-4 rounded-lg hover:bg-opacity-20 transition-all text-left border border-white border-opacity-20"
                      >
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <div className="font-bold text-cyan-400">{item.title}</div>
                        <div className="text-sm text-gray-300">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map(message => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-4xl px-6 py-4 rounded-xl ${
                    message.type === 'user' 
                      ? 'bg-cyan-500 text-white' 
                      : message.type === 'agent'
                      ? 'bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 text-white'
                      : 'bg-red-500 bg-opacity-20 border border-red-500 text-white'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                    <div className="flex justify-between items-center mt-3 text-xs opacity-70">
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      {message.metadata && (
                        <div className="flex items-center space-x-2">
                          <span>
                            {message.metadata.model && `Model: ${message.metadata.model.split('/')[1]} | `}
                            {message.metadata.tokens && `Tokens: ${message.metadata.tokens} | `}
                            {message.metadata.confidence && `Confidence: ${message.metadata.confidence}%`}
                          </span>
                          <button
                            onClick={() => copyToClipboard(message.content)}
                            className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-white bg-opacity-10 backdrop-blur-md px-6 py-4 rounded-xl border border-white border-opacity-20">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm text-cyan-400">Qwen is thinking and analyzing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white bg-opacity-10 backdrop-blur-md m-4 p-4 rounded-xl border border-white border-opacity-20">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAgenticRequest(input)}
                  placeholder="Ask Qwen to build, analyze, debug, or optimize anything..."
                  className="flex-1 bg-white bg-opacity-10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm text-white placeholder-gray-300"
                  disabled={isThinking}
                />
                <button
                  onClick={() => handleAgenticRequest(input)}
                  disabled={!input.trim() || isThinking}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg text-white transition-all flex items-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex justify-between items-center text-xs text-gray-300 mt-2">
                <span>⌘ + Enter for agentic execution | Shift + Enter for new line</span>
                <span>{input.length}/2000</span>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  { icon: <Code className="w-3 h-3" />, text: 'Generate React component', action: 'Generate a React component for' },
                  { icon: <Bug className="w-3 h-3" />, text: 'Debug code', action: 'Debug this code:' },
                  { icon: <Zap className="w-3 h-3" />, text: 'Optimize performance', action: 'Optimize this code for performance:' },
                  { icon: <Lightbulb className="w-3 h-3" />, text: 'Get suggestions', action: 'Give me suggestions for' }
                ].map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(item.action)}
                    className="px-3 py-1 bg-white bg-opacity-10 hover:bg-opacity-20 rounded text-xs transition-all flex items-center space-x-1 text-white"
                  >
                    {item.icon}
                    <span>{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && <CodeAssistant />}
        {activeTab === 'terminal' && <AgenticTerminal />}
      </div>

      {/* Artifacts Sidebar (if any) */}
      {artifacts.length > 0 && (
        <div className="absolute right-4 top-4 bottom-4 w-80 bg-white bg-opacity-10 backdrop-blur-md p-4 rounded-xl border border-white border-opacity-20 overflow-y-auto">
          <h3 className="text-lg font-bold text-white mb-4">🎯 Generated Artifacts</h3>
          {artifacts.map(artifact => (
            <div key={artifact.id} className="mb-4 p-3 bg-black bg-opacity-30 rounded">
              <div className="font-bold text-sm text-cyan-400">{artifact.description}</div>
              <div className="text-xs text-gray-300 mb-2">
                {artifact.type} | {artifact.language}
              </div>
              <pre className="text-xs bg-black p-2 rounded overflow-x-auto text-white">
                {artifact.content.substring(0, 200)}...
              </pre>
              <button 
                onClick={() => copyToClipboard(artifact.content)}
                className="text-xs text-cyan-400 hover:text-cyan-300 mt-2 flex items-center space-x-1"
              >
                <Copy className="w-3 h-3" />
                <span>Copy to Clipboard</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QwenAIAgent;