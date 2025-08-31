# AI Integration for Workflow Studio

This directory contains the AI integration components for the Auterity Workflow Studio, providing seamless integration with the AI Hub for function calling capabilities.

## 📁 Structure

```
src/
├── nodes/ai/
│   ├── AINodeFactory.ts          # Factory for creating AI nodes
│   ├── TextGenerationNode.ts     # Text generation AI node
│   └── ImageGenerationNode.ts    # Image generation AI node
├── services/
│   └── api.ts                    # API client with AI endpoints
└── types/
    └── auth.ts                   # Authentication types
```

## 🚀 Quick Start

### 1. Authentication Setup

The AI integration requires OIDC authentication with the AI Hub. Ensure your Kong configuration includes:

```yaml
plugins:
  - name: jwt
    service: ai-hub
    config:
      claims_to_verify: ["exp", "nbf", "aud"]
      audience: ["ai-hub"]
```

### 2. Basic Usage

```typescript
import { aiNodeFactory } from './src/nodes/ai/AINodeFactory';

// Discover available AI functions
const functions = await aiNodeFactory.discoverFunctions();

// Create an AI node
const textNode = aiNodeFactory.createNode('text.generate', 'node-1', { x: 100, y: 100 }, {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 1000
});

// Execute the node
const result = await textNode.execute({
  prompt: 'Write a hello world function in Python'
});

console.log(result.generatedText);
```

## 🤖 AI Node Types

### TextGenerationNode

Generates text using advanced language models.

**Properties:**
- `model`: GPT-4, Claude 3, Gemini Pro, GPT-3.5 Turbo
- `temperature`: Controls creativity (0-2)
- `maxTokens`: Maximum output length (1-4096)
- `systemPrompt`: Instructions for the AI model
- `streaming`: Enable real-time streaming
- `outputVariable`: Variable name for output

**Inputs:** `prompt`, `text`

**Outputs:** Generated text, usage stats, cost, model info

### ImageGenerationNode

Generates images using AI models.

**Properties:**
- `model`: DALL-E 3, DALL-E 2, Stable Diffusion, Midjourney
- `size`: Image dimensions (256x256 to 1792x1024)
- `quality`: Standard or HD
- `style`: Natural or vivid (DALL-E models)
- `outputVariable`: Variable name for image URL

**Inputs:** `prompt`, `description`

**Outputs:** Image URL, revised prompt, metadata, usage, cost

## 🔧 AI Node Factory

### Discovery

```typescript
// Get all available AI functions
const functions = await aiNodeFactory.discoverFunctions();

// Get specific function metadata
const textGenMeta = aiNodeFactory.getFunctionMetadata('text.generate');
```

### Node Creation

```typescript
// Create from built-in types
const textNode = aiNodeFactory.createNode('ai.text.generate', 'node-1', position, config);

// Create from discovered functions
const customNode = aiNodeFactory.createNode('custom.analysis', 'node-2', position, config);

// Check if node can be created
if (aiNodeFactory.canCreateNode('text.generate')) {
  // Node is available
}
```

### Dynamic Node Creation

The factory automatically creates nodes for any discovered AI function:

```typescript
// AI Hub returns a function schema
{
  "name": "sentiment.analysis",
  "schema": {
    "input": {
      "properties": {
        "text": {"type": "string"},
        "model": {"type": "string", "enum": ["bert", "roberta"]}
      },
      "required": ["text"]
    },
    "output": {
      "properties": {
        "sentiment": {"type": "string"},
        "confidence": {"type": "number"}
      }
    }
  }
}

// Factory creates a node automatically
const sentimentNode = aiNodeFactory.createNode('sentiment.analysis', 'node-3', position);
```

## 📡 API Integration

### Authentication

All AI API calls are automatically authenticated:

```typescript
// JWT token is automatically included
const response = await apiClient.callAIFunction('text.generate', parameters);
```

### Error Handling

```typescript
try {
  const result = await textNode.execute(inputs);
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Handle rate limit
    console.log(`Retry in ${error.details.retry_after_seconds}s`);
  } else if (error.code === 'QUOTA_EXCEEDED') {
    // Handle quota exceeded
    console.log('Usage quota exceeded');
  }
}
```

### Streaming Support

```typescript
// Enable streaming in node properties
const streamingNode = new TextGenerationNode('node-id', position, {
  streaming: true
});

// Handle streaming response
const result = await streamingNode.execute({ prompt: 'Tell me a story' });
// Result is streamed in real-time
```

## ⚙️ Configuration

### Environment Variables

```bash
# AI Hub API
VITE_AI_HUB_URL=https://api.auterity.com/v1/ai

# Authentication
VITE_AUTH_AUTHORITY=https://auth.auterity.com
VITE_AUTH_CLIENT_ID=workflow-studio
VITE_AUTH_REDIRECT_URI=http://localhost:3000/auth/callback
```

### Rate Limiting

AI nodes respect rate limits automatically:

```typescript
// Rate limits are enforced by Kong
// Studio shows user-friendly error messages
```

## 📊 Usage Tracking

### Cost Monitoring

```typescript
const result = await textNode.execute(inputs);
console.log(`Cost: $${result.cost}`);
console.log(`Tokens used: ${result.totalTokens}`);
```

### Usage Analytics

```typescript
// Track usage for billing
const usage = {
  function: 'text.generate',
  tokens: result.totalTokens,
  cost: result.cost,
  timestamp: Date.now()
};
```

## 🔧 Extending AI Nodes

### Creating Custom AI Nodes

```typescript
import { StudioNode, NodeData, NodeStyle } from '../../types/studio';

export class CustomAINode implements StudioNode {
  // Implement StudioNode interface
  async execute(inputs: Record<string, any>): Promise<Record<string, any>> {
    // Call your custom AI function
    const response = await apiClient.callAIFunction('custom.function', inputs);
    return response.result;
  }

  // Register with factory
  AINodeFactory.registerNodeType('custom.ai', CustomAINode);
}
```

### Adding New AI Functions

1. **Define function in AI Hub:**

```json
{
  "name": "custom.analysis",
  "description": "Custom analysis function",
  "schema": {
    "input": {"properties": {"data": {"type": "object"}}},
    "output": {"properties": {"result": {"type": "object"}}}
  }
}
```

2. **Studio discovers automatically:**

```typescript
// Function appears in node palette
const customNode = aiNodeFactory.createNode('custom.analysis', 'node-id', position);
```

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Errors**
   ```bash
   # Check JWT token validity
   curl -H "Authorization: Bearer <token>" https://api.auterity.com/v1/ai/functions
   ```

2. **Rate Limit Errors**
   ```typescript
   // Implement exponential backoff
   const result = await retryWithBackoff(() => node.execute(inputs));
   ```

3. **Function Not Found**
   ```typescript
   // Refresh function discovery
   await aiNodeFactory.discoverFunctions();
   ```

### Debug Mode

```typescript
// Enable debug logging
localStorage.setItem('ai-debug', 'true');

// View API calls in console
// Check browser network tab for AI requests
```

## 📈 Performance Optimization

### Caching

- Function schemas are cached for 1 hour
- Node metadata is cached in memory
- API responses are cached where appropriate

### Batch Processing

```typescript
// Execute multiple AI functions in batch
const batchResult = await apiClient.callBatchAIFunctions([
  { function: 'text.generate', parameters: { prompt: 'Hello' } },
  { function: 'text.sentiment', parameters: { text: 'Hello' } }
]);
```

### Connection Pooling

- HTTP/2 connections are reused
- WebSocket connections for streaming are pooled
- Automatic connection health monitoring

## 🔒 Security Considerations

### Input Validation

- All inputs are validated against JSON schemas
- Malicious prompts are filtered
- File uploads are scanned for malware

### Output Sanitization

- Generated content is sanitized
- URLs are validated
- Sensitive data is redacted

### Audit Logging

- All AI function calls are logged
- Usage patterns are monitored
- Anomalous behavior triggers alerts

## 📚 API Reference

### Core Methods

- `aiNodeFactory.discoverFunctions()`: Get available functions
- `aiNodeFactory.createNode()`: Create AI node instance
- `node.execute()`: Execute AI function
- `apiClient.callAIFunction()`: Direct API call

### Events

```typescript
// Listen for AI events
window.addEventListener('ai-usage', (event) => {
  console.log('AI Usage:', event.detail);
});

window.addEventListener('ai-error', (event) => {
  console.error('AI Error:', event.detail);
});
```

## 🤝 Contributing

### Adding New AI Node Types

1. Create node class implementing `StudioNode`
2. Add property definitions for the node
3. Implement execute method with error handling
4. Register with `AINodeFactory`
5. Add tests and documentation

### Testing AI Nodes

```typescript
// Mock AI responses for testing
jest.mock('../services/api', () => ({
  apiClient: {
    callAIFunction: jest.fn().mockResolvedValue({
      result: { text: 'Mock response' },
      metadata: { cost_usd: 0.01 }
    })
  }
}));
```

## 📞 Support

- **Documentation**: https://docs.auterity.com/ai-integration
- **API Reference**: https://api.auterity.com/docs
- **Issues**: Create GitHub issue in auterity-workflow-studio
- **Security**: security@auterity.com

---

This AI integration provides a robust, scalable, and user-friendly way to incorporate AI capabilities into workflow automation, with comprehensive error handling, performance optimization, and security measures.
