// Enhanced Backend with HF Integration
const express = require('express');
const cors = require('cors');
const { HfInference } = require('@huggingface/inference');

class HuggingFaceProxy {
  constructor(apiKey) {
    this.hf = apiKey ? new HfInference(apiKey) : null;
    this.activeStreams = new Map();
    this.modelMetrics = new Map();
  }

  // Initialize with API key
  init(apiKey) {
    this.hf = new HfInference(apiKey);
  }

  // Multi-provider inference with automatic failover
  async queryWithFailover(model, prompt, options = {}) {
    if (!this.hf) {
      throw new Error('Hugging Face API not initialized');
    }

    try {
      const result = await this.hf.textGeneration({
        model,
        inputs: prompt,
        parameters: {
          max_new_tokens: options.maxTokens || 4096,
          temperature: options.temperature || 0.1,
          return_full_text: false,
          do_sample: true,
          ...options.parameters
        },
        options: {
          wait_for_model: true,
          use_cache: false
        }
      });

      // Track metrics
      this.updateMetrics(model, result);
      
      return {
        ...result,
        success: true
      };
    } catch (error) {
      console.error('HF API Error:', error);
      throw error;
    }
  }

  // Update model metrics
  updateMetrics(model, result) {
    const metrics = this.modelMetrics.get(model) || {
      requests: 0,
      totalTokens: 0,
      averageLatency: 0
    };

    metrics.requests += 1;
    metrics.totalTokens += result.generated_text?.length || 0;
    
    this.modelMetrics.set(model, metrics);
  }

  // Get model metrics
  getMetrics(model) {
    return this.modelMetrics.get(model) || {
      requests: 0,
      totalTokens: 0,
      averageLatency: 0
    };
  }
}

// Create Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize HF Proxy
let hfProxy = new HuggingFaceProxy();

// Routes
app.post('/api/hf/init', (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({ error: 'API key required' });
    }
    
    hfProxy.init(apiKey);
    res.json({ success: true, message: 'API key initialized' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/hf/query', async (req, res) => {
  try {
    const { model, prompt, options = {} } = req.body;
    
    if (!model || !prompt) {
      return res.status(400).json({ error: 'Model and prompt are required' });
    }

    const result = await hfProxy.queryWithFailover(model, prompt, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/hf/metrics/:model', (req, res) => {
  try {
    const { model } = req.params;
    const metrics = hfProxy.getMetrics(model);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'KN3AUX-CODE HF Proxy'
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 KN3AUX-CODE HF Proxy Server running on port ${port}`);
  console.log(`🧠 Hugging Face API integration ready`);
});

module.exports = { HuggingFaceProxy };