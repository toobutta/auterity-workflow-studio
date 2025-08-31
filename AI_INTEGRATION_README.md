# AI Integration - Workflow Studio

## 🚀 Overview

The Auterity Workflow Studio now includes comprehensive AI capabilities through a multi-provider SDK integration. This enables intelligent workflow optimization, cost-effective local AI processing, and enhanced user productivity.

## ✨ Features

### 🔧 AI Provider Management
- **Multi-Provider Support**: OpenAI, Anthropic (Claude), Google (Gemini), Azure OpenAI, Cohere
- **Local AI with Ollama**: Cost-free processing for development and testing
- **Dynamic Provider Switching**: Real-time switching between providers
- **Health Monitoring**: Automatic provider status checking

### 💰 Cost Optimization
- **Real-time Cost Tracking**: Monitor AI usage costs across all providers
- **Savings Calculator**: Track money saved using Ollama vs. commercial APIs
- **Usage Analytics**: Detailed breakdown by operation and provider
- **Budget Alerts**: Visual indicators for cost optimization

### 🤖 AI Assistant
- **Workflow Optimization**: AI-powered suggestions for workflow improvements
- **Streaming Chat Interface**: Real-time conversations with AI
- **Context-Aware Suggestions**: AI understands your current workflow context
- **Smart Recommendations**: Intelligent suggestions for workflow enhancement

## 🛠️ Setup Guide

### 1. Environment Configuration

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env
```

Configure your AI providers in `.env`:

```bash
# Commercial AI Providers (Optional)
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
VITE_GOOGLE_API_KEY=your_google_api_key_here

# Local AI with Ollama (Recommended for development)
VITE_OLLAMA_ENDPOINT=http://localhost:11434
VITE_OLLAMA_MODEL=llama3.2:3b

# AI Features
VITE_ENABLE_AI_ASSISTANT=true
VITE_ENABLE_COST_TRACKING=true
VITE_DEFAULT_AI_PROVIDER=ollama
```

### 2. Install Ollama (Recommended)

For cost-free local AI processing:

**Windows:**
```bash
# Download and install from https://ollama.ai
# Or use winget
winget install Ollama.Ollama
```

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 3. Setup Ollama Models

```bash
# Install recommended model (3B parameters, fast and efficient)
ollama pull llama3.2:3b

# Optional: Install larger models for better quality
ollama pull llama3.2:8b
ollama pull llama3.2:70b
```

### 4. Start Development

```bash
# Start Ollama service (if not running as service)
ollama serve

# Start the workflow studio
npm run dev
```

## 🎯 Usage Guide

### Accessing the AI Dashboard

1. **Toggle AI Dashboard**: Click the AI button (🔧) in the toolbar
2. **Switch Tabs**: Navigate between Provider Status, Cost Monitor, and AI Assistant
3. **Resize Panel**: Drag the left edge to resize the AI dashboard

### Provider Management

**Status Tab:**
- View real-time status of all AI providers
- Switch between providers with one click
- Monitor response times and health status
- See configuration status for each provider

**Cost Monitor Tab:**
- Track spending across all AI providers
- View savings from using Ollama
- Get optimization recommendations
- Monitor monthly usage trends

**AI Assistant Tab:**
- Chat with AI about workflow optimization
- Get suggestions for improving your workflows
- Ask questions about best practices
- Receive context-aware recommendations

### Best Practices

1. **Start with Ollama**: Use local AI for development and testing
2. **Commercial APIs for Production**: Switch to commercial providers for production workflows
3. **Monitor Costs**: Keep track of API usage and optimize based on recommendations
4. **Provider Selection**: Choose providers based on your specific use case:
   - **Ollama**: Free, fast, good for development
   - **Claude (Anthropic)**: Excellent reasoning, cost-effective
   - **GPT-4 (OpenAI)**: Versatile, good general performance
   - **Gemini (Google)**: Strong multimodal capabilities

## 🔧 Configuration Options

### Provider Configuration

```typescript
// Provider priorities and models
const PROVIDERS = {
  ollama: 'llama3.2:3b',        // Local, free
  anthropic: 'claude-3-5-sonnet', // Best reasoning
  openai: 'gpt-4o',             // Most versatile
  google: 'gemini-1.5-pro',     // Multimodal
  cohere: 'command-r-plus'      // Good for specific tasks
};
```

### Feature Toggles

```bash
# Enable/disable specific features
VITE_ENABLE_AI_ASSISTANT=true
VITE_ENABLE_COST_TRACKING=true
VITE_ENABLE_PROVIDER_HEALTH_CHECK=true

# Performance settings
VITE_AI_REQUEST_TIMEOUT=30000
VITE_AI_MAX_RETRIES=3
VITE_AI_BATCH_SIZE=10
```

## 🚨 Troubleshooting

### Common Issues

**Ollama Not Connecting:**
```bash
# Check if Ollama is running
ollama list

# Start Ollama service
ollama serve

# Test connection
curl http://localhost:11434/api/tags
```

**API Key Issues:**
- Verify API keys are correctly set in `.env`
- Check provider dashboards for key validity
- Ensure sufficient API credits/quota

**Build Errors:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf dist .vite
npm run build
```

### Performance Optimization

1. **Use Ollama for Development**: Faster iteration, no API costs
2. **Batch Requests**: Group multiple AI operations when possible
3. **Choose Appropriate Models**: Smaller models for simple tasks
4. **Monitor Response Times**: Switch providers if experiencing slowdowns

## 📚 API Reference

### AI Service Methods

```typescript
// Provider management
aiSDKService.setProvider('ollama')
aiSDKService.getAvailableProviders()
aiSDKService.isOllamaAvailable()

// Cost tracking
aiSDKService.getCostSummary()
aiSDKService.resetCostTracking()

// AI operations
aiSDKService.generateWorkflowSuggestion(context)
aiSDKService.optimizeWorkflow(workflow)
aiSDKService.chatWithAI(message)
```

### Configuration API

```typescript
// Feature checks
aiSDKService.isAIFeaturesEnabled()
aiSDKService.isCostTrackingEnabled()
aiSDKService.isHealthCheckEnabled()

// Provider info
aiSDKService.getDefaultProvider()
aiSDKService.getAvailableProviders()
```

## 🎉 Benefits

### Cost Savings
- **$0 Development Costs**: Use Ollama for all development work
- **Smart Provider Selection**: Automatically choose cost-effective providers
- **Usage Tracking**: Monitor and optimize AI spending

### Productivity Gains
- **Intelligent Suggestions**: AI-powered workflow optimization
- **Real-time Help**: Instant AI assistance while building workflows
- **Context Awareness**: AI understands your current work

### Flexibility
- **Multi-Provider**: Never locked into one AI provider
- **Local Processing**: Work offline with Ollama
- **Scalable**: Seamlessly scale from development to production

## 🔄 Next Steps

This implementation represents **Phase 1** of the AI integration. Future phases will include:

- **Phase 2**: Vector database integration (Chroma, Qdrant)
- **Phase 3**: Advanced ML model training and deployment
- **Phase 4**: Automated workflow generation from natural language
- **Phase 5**: Collaborative AI features and team optimization

---

For questions or issues, please refer to the troubleshooting section or create an issue in the repository.
