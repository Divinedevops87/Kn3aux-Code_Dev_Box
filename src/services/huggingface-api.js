// Hugging Face API Service - Core AI Integration
import { HfInference } from '@huggingface/inference';

export class HuggingFaceAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.hf = apiKey ? new HfInference(apiKey) : null;
    this.baseUrl = 'https://api-inference.huggingface.co';
    this.providers = ['auto', 'fal', 'replicate', 'sambanova', 'together'];
  }

  // Initialize with API key
  init(apiKey) {
    this.apiKey = apiKey;
    this.hf = new HfInference(apiKey);
  }

  // Qwen3-Coder Integration with Multi-Provider Support
  async queryQwenCoder(prompt, options = {}) {
    if (!this.hf) {
      throw new Error('Hugging Face API not initialized. Please set API key.');
    }

    const {
      model = 'Qwen/Qwen2.5-Coder-7B-Instruct',
      maxTokens = 4096,
      temperature = 0.1,
      context = [],
      tools = [],
      enableThinking = false
    } = options;

    // Build messages array with context
    const messages = [
      {
        role: 'system',
        content: `You are Qwen3-Coder, an advanced AI coding assistant. You excel at:
- Code generation, debugging, and optimization
- Repository-level code analysis
- Real-world software engineering tasks
- Mobile-first development guidance

Current context: KN3AUX-CODE™ Mobile App Builder Platform
Environment: React + Vite development environment`
      },
      ...context.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: prompt }
    ];

    try {
      const result = await this.hf.textGeneration({
        model,
        inputs: this.formatMessages(messages),
        parameters: {
          max_new_tokens: maxTokens,
          temperature,
          return_full_text: false,
          do_sample: true
        },
        options: {
          wait_for_model: true,
          use_cache: false
        }
      });

      return {
        response: result.generated_text || '',
        metadata: {
          model,
          tokens: result.generated_text?.length || 0,
          confidence: this.calculateConfidence(result),
          thinking_process: null
        },
        function_calls: [],
        artifacts: this.extractArtifacts(result.generated_text || ''),
        execution_results: []
      };
    } catch (error) {
      console.error('Qwen API Error:', error);
      throw new Error(`Failed to query Qwen3-Coder: ${error.message}`);
    }
  }

  // Format messages for text generation
  formatMessages(messages) {
    return messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
  }

  // Multi-Model Code Generation
  async generateCode(description, options = {}) {
    const {
      language = 'javascript',
      framework = 'react',
      style = 'production',
      includeTests = true,
      includeDocumentation = true
    } = options;

    const prompt = `Generate ${style} quality ${language} code for: ${description}

Requirements:
- Language: ${language}
- Framework: ${framework}
- Style: ${style}
- Include tests: ${includeTests}
- Include documentation: ${includeDocumentation}

Please provide:
1. Main implementation
2. Type definitions (if applicable)
3. Unit tests (if requested)
4. Usage examples
5. Documentation (if requested)

Format your response with clear code blocks and explanations.`;

    return await this.queryQwenCoder(prompt, {
      maxTokens: 8192,
      temperature: 0.2
    });
  }

  // Advanced Code Analysis
  async analyzeCode(code, options = {}) {
    const {
      analysisType = 'comprehensive',
      includeRefactoring = true,
      generateTests = false
    } = options;

    const prompt = `Perform ${analysisType} analysis on this code:

\`\`\`
${code}
\`\`\`

Please analyze:
1. Code quality and best practices
2. Performance optimizations
3. Security considerations
4. Architecture and design patterns
5. Maintainability issues
${includeRefactoring ? '6. Refactoring suggestions with improved code' : ''}
${generateTests ? '7. Generate comprehensive test suite' : ''}

Provide detailed analysis with specific recommendations and code examples.`;

    return await this.queryQwenCoder(prompt, {
      maxTokens: 8192,
      temperature: 0.1
    });
  }

  // Repository-Level Analysis
  async analyzeRepository(repoData) {
    const prompt = `Analyze this repository for:
1. Architecture overview
2. Code quality assessment
3. Security vulnerabilities
4. Performance bottlenecks
5. Technical debt
6. Recommended improvements
7. Migration paths for modern practices

Repository structure:
${JSON.stringify(repoData, null, 2)}

Provide a comprehensive report with actionable insights.`;

    return await this.queryQwenCoder(prompt, {
      maxTokens: 8192,
      temperature: 0.1
    });
  }

  // Agentic Task Execution
  async executeAgenticTask(task, options = {}) {
    const {
      allowToolUse = true,
      maxIterations = 10,
      saveArtifacts = true,
      context = {}
    } = options;

    const prompt = `You are an agentic AI assistant with development expertise.

Task: ${task}

Context: ${JSON.stringify(context)}

Please break down this task into steps and provide a comprehensive solution. 
Think step by step and provide actionable recommendations.

If this involves code generation, provide complete, working examples.
If this involves analysis, provide detailed insights and recommendations.`;

    return await this.queryQwenCoder(prompt, {
      maxTokens: 8192,
      temperature: 0.1,
      enableThinking: true
    });
  }

  // Helper methods
  calculateConfidence(result) {
    // Simple confidence calculation based on response quality
    let confidence = 85; // Base confidence
    
    if (result.generated_text && result.generated_text.length > 100) {
      confidence += 5;
    }
    
    if (result.generated_text && result.generated_text.includes('```')) {
      confidence += 5; // Bonus for code blocks
    }
    
    return Math.min(95, confidence);
  }

  extractArtifacts(text) {
    const artifacts = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    let index = 0;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const language = match[1] || 'text';
      const content = match[2].trim();
      
      if (content.length > 50) { // Only significant code blocks
        artifacts.push({
          id: `artifact_${Date.now()}_${index}`,
          type: this.inferArtifactType(content, language),
          language,
          content,
          description: this.generateArtifactDescription(content, language),
          dependencies: this.extractDependencies(content, language)
        });
        index++;
      }
    }

    return artifacts;
  }

  inferArtifactType(content, language) {
    if (language === 'tsx' || language === 'jsx') return 'component';
    if (content.includes('class ') && content.includes('{')) return 'class';
    if (content.includes('function ') || (content.includes('const ') && content.includes('=>'))) return 'function';
    return 'file';
  }

  generateArtifactDescription(content, language) {
    const lines = content.split('\n');
    const firstLine = lines[0].trim();
    
    // Try to extract description from comments
    if (firstLine.startsWith('//') || firstLine.startsWith('*') || firstLine.startsWith('/*')) {
      return firstLine.replace(/^[\/\*\s]+/, '').replace(/\*\/$/, '');
    }
    
    // Generate description based on content
    if (content.includes('export default function')) {
      const match = content.match(/export default function (\w+)/);
      return match ? `React component: ${match[1]}` : 'React component';
    }
    
    if (content.includes('class ')) {
      const match = content.match(/class (\w+)/);
      return match ? `${language} class: ${match[1]}` : `${language} class`;
    }
    
    return `${language} code`;
  }

  extractDependencies(content, language) {
    const dependencies = [];
    
    // Extract imports
    const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      dependencies.push(match[1]);
    }
    
    // Extract require statements
    const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
      dependencies.push(match[1]);
    }
    
    return [...new Set(dependencies)]; // Remove duplicates
  }
}

export default HuggingFaceAPI;