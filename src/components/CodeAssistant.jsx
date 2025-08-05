import React, { useState } from 'react';
import { Code, Terminal, FileText, Zap } from 'lucide-react';
import { useQwenAgent } from '../hooks/useHuggingFace';

const CodeAssistant = () => {
  const [code, setCode] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { analyzeCode, generateCode, debugCode, optimizeCode } = useQwenAgent();

  const handleAnalyzeCode = async () => {
    if (!code.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeCode(code, {
        analysisType: 'comprehensive',
        includeRefactoring: true,
        generateTests: true
      });
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateCode = async (description) => {
    setIsAnalyzing(true);
    try {
      const result = await generateCode(description, {
        language: 'javascript',
        framework: 'react',
        style: 'production',
        includeTests: true
      });
      setCode(result.response);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Code className="w-5 h-5 text-blue-600" />
          Code Assistant
        </h2>
      </div>

      <div className="flex-1 flex">
        {/* Code Input */}
        <div className="w-1/2 p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code Input
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here for analysis..."
              className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAnalyzeCode}
              disabled={!code.trim() || isAnalyzing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Analyze Code
            </button>
            
            <button
              onClick={() => handleGenerateCode('React component with state management')}
              disabled={isAnalyzing}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Code className="w-4 h-4" />
              Generate Component
            </button>
            
            <button
              onClick={() => handleGenerateCode('Optimized utility functions')}
              disabled={isAnalyzing}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Optimize
            </button>
          </div>
        </div>

        {/* Analysis Results */}
        <div className="w-1/2 p-4 bg-white border-l">
          <h3 className="text-lg font-medium mb-4">Analysis Results</h3>
          
          {isAnalyzing && (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {analysis && !isAnalyzing && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">AI Analysis</h4>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {analysis.response}
                </div>
              </div>
              
              {analysis.artifacts && analysis.artifacts.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Generated Artifacts</h4>
                  {analysis.artifacts.map((artifact, index) => (
                    <div key={index} className="bg-blue-50 p-3 rounded-lg mb-2">
                      <div className="font-medium text-blue-900">{artifact.description}</div>
                      <div className="text-xs text-blue-700 mt-1">
                        {artifact.type} • {artifact.language}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {!analysis && !isAnalyzing && (
            <div className="text-center text-gray-500 mt-12">
              <Code className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Paste code above and click "Analyze Code" to get AI insights</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeAssistant;