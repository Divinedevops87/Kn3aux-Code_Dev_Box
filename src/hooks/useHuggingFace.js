// React Hook for Hugging Face Integration
import { useState, useEffect, useMemo } from 'react';
import HuggingFaceAPI from '../services/huggingface-api';

export function useHuggingFace() {
  const [isConnected, setIsConnected] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [modelMetrics, setModelMetrics] = useState({});
  const [apiKey, setApiKey] = useState('');

  const hfAPI = useMemo(() => {
    const key = apiKey || localStorage.getItem('hf_api_key');
    return key ? new HuggingFaceAPI(key) : null;
  }, [apiKey]);

  useEffect(() => {
    if (hfAPI) {
      setIsConnected(true);
      // Load available models
      setAvailableModels([
        'Qwen/Qwen2.5-Coder-32B-Instruct',
        'Qwen/Qwen2.5-Coder-7B-Instruct',
        'Qwen/Qwen2.5-Coder-1.5B-Instruct'
      ]);
    }
  }, [hfAPI]);

  const initializeAPI = (key) => {
    setApiKey(key);
    localStorage.setItem('hf_api_key', key);
  };

  const sendMessage = async (message, options = {}) => {
    if (!hfAPI) throw new Error('Hugging Face API not initialized');
    return await hfAPI.queryQwenCoder(message, options);
  };

  const generateCode = async (description, options = {}) => {
    if (!hfAPI) throw new Error('Hugging Face API not initialized');
    return await hfAPI.generateCode(description, options);
  };

  const analyzeCode = async (code, options = {}) => {
    if (!hfAPI) throw new Error('Hugging Face API not initialized');
    return await hfAPI.analyzeCode(code, options);
  };

  return {
    sendMessage,
    generateCode,
    analyzeCode,
    isConnected,
    availableModels,
    modelMetrics,
    hfAPI,
    initializeAPI
  };
}

export function useQwenAgent(selectedModel = 'Qwen/Qwen2.5-Coder-7B-Instruct') {
  const [agentStatus, setAgentStatus] = useState({
    tasksCompleted: 0,
    codeGenerated: 0,
    bugsFixed: 0,
    isActive: false
  });

  const { hfAPI } = useHuggingFace();

  const executeAgenticTask = async (task, options = {}) => {
    if (!hfAPI) throw new Error('Hugging Face API not initialized');
    
    setAgentStatus(prev => ({ ...prev, isActive: true }));
    
    try {
      const result = await hfAPI.executeAgenticTask(task, options);
      
      setAgentStatus(prev => ({
        ...prev,
        tasksCompleted: prev.tasksCompleted + 1,
        isActive: false
      }));
      
      return result;
    } catch (error) {
      setAgentStatus(prev => ({ ...prev, isActive: false }));
      throw error;
    }
  };

  const analyzeRepository = async (repoData) => {
    if (!hfAPI) throw new Error('Hugging Face API not initialized');
    return await hfAPI.analyzeRepository(repoData);
  };

  const generateCode = async (description, options = {}) => {
    if (!hfAPI) throw new Error('Hugging Face API not initialized');
    
    const result = await hfAPI.generateCode(description, {
      ...options,
      model: selectedModel
    });
    
    setAgentStatus(prev => ({
      ...prev,
      codeGenerated: prev.codeGenerated + (result.response?.length || 0)
    }));
    
    return result;
  };

  const debugCode = async (code, options = {}) => {
    if (!hfAPI) throw new Error('Hugging Face API not initialized');
    
    const result = await hfAPI.analyzeCode(code, {
      ...options,
      analysisType: 'debugging',
      model: selectedModel
    });
    
    setAgentStatus(prev => ({
      ...prev,
      bugsFixed: prev.bugsFixed + 1
    }));
    
    return result;
  };

  const optimizeCode = async (code, options = {}) => {
    if (!hfAPI) throw new Error('Hugging Face API not initialized');
    
    return await hfAPI.analyzeCode(code, {
      ...options,
      analysisType: 'performance',
      includeRefactoring: true,
      model: selectedModel
    });
  };

  return {
    executeAgenticTask,
    analyzeRepository,
    generateCode,
    debugCode,
    optimizeCode,
    agentStatus
  };
}