import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Play, Square, RotateCcw } from 'lucide-react';
import { useQwenAgent } from '../hooks/useHuggingFace';

const AgenticTerminal = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const terminalRef = useRef(null);
  const { executeAgenticTask } = useQwenAgent();

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const executeCommand = async (command) => {
    if (!command.trim()) return;

    // Add command to history
    setHistory(prev => [...prev, command]);
    setHistoryIndex(-1);

    // Add command to output
    setOutput(prev => [...prev, { type: 'command', content: `$ ${command}`, timestamp: new Date() }]);
    setInput('');
    setIsRunning(true);

    try {
      // Use AI agent to interpret and execute the command
      const result = await executeAgenticTask(`Execute this terminal command or provide guidance: ${command}`, {
        allowToolUse: true,
        context: {
          type: 'terminal_command',
          command,
          environment: 'KN3AUX-CODE development environment'
        }
      });

      // Add AI response to output
      setOutput(prev => [...prev, { 
        type: 'output', 
        content: result.response,
        timestamp: new Date(),
        artifacts: result.artifacts
      }]);

    } catch (error) {
      setOutput(prev => [...prev, { 
        type: 'error', 
        content: `Error: ${error.message}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex + 1;
        if (newIndex < history.length) {
          setHistoryIndex(newIndex);
          setInput(history[history.length - 1 - newIndex]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const clearTerminal = () => {
    setOutput([]);
  };

  const stopExecution = () => {
    setIsRunning(false);
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour12: false });
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-green-400 font-mono">
      {/* Terminal Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5" />
          <span className="text-sm font-medium">Agentic Terminal</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearTerminal}
            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
            title="Clear terminal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {isRunning && (
            <button
              onClick={stopExecution}
              className="p-1 hover:bg-gray-700 rounded text-red-400 hover:text-red-300"
              title="Stop execution"
            >
              <Square className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Output */}
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 text-sm"
      >
        {/* Welcome message */}
        {output.length === 0 && (
          <div className="text-green-300 mb-4">
            <div>KN3AUX-CODE™ Agentic Terminal v1.0.0</div>
            <div className="text-gray-500">AI-powered command execution and development assistance</div>
            <div className="text-gray-500 mt-2">
              Try commands like: "help", "create component", "analyze project", "npm install", etc.
            </div>
          </div>
        )}

        {/* Output history */}
        {output.map((entry, index) => (
          <div key={index} className="mb-2">
            <div className={`flex items-start gap-2 ${
              entry.type === 'command' ? 'text-cyan-400' : 
              entry.type === 'error' ? 'text-red-400' : 'text-green-300'
            }`}>
              <span className="text-gray-500 text-xs min-w-[60px]">
                {formatTimestamp(entry.timestamp)}
              </span>
              <div className="flex-1">
                <div className="whitespace-pre-wrap">{entry.content}</div>
                {entry.artifacts && entry.artifacts.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {entry.artifacts.map((artifact, i) => (
                      <div key={i} className="bg-gray-800 p-2 rounded text-xs">
                        <div className="text-yellow-400 mb-1">{artifact.description}</div>
                        <div className="text-gray-400">{artifact.type} • {artifact.language}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isRunning && (
          <div className="flex items-center gap-2 text-yellow-400">
            <span className="text-gray-500 text-xs min-w-[60px]">
              {formatTimestamp(new Date())}
            </span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <span className="ml-2">AI processing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Command Input */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter command or ask AI for help..."
            className="flex-1 bg-transparent border-none outline-none text-green-400 placeholder-gray-500"
            disabled={isRunning}
          />
          <button
            onClick={() => executeCommand(input)}
            disabled={!input.trim() || isRunning}
            className="p-2 hover:bg-gray-700 rounded text-green-400 hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          Press Enter to execute • ↑/↓ for history • Powered by Qwen AI
        </div>
      </div>
    </div>
  );
};

export default AgenticTerminal;