# AI Hub Function Calling Contract

## Overview

This document defines the API contract between the Workflow Studio frontend and the Auterity AI Hub backend for AI function calling capabilities. The contract ensures secure, reliable, and efficient communication between the visual workflow builder and AI processing services.

## 🎯 Core Principles

- **Function-First**: All AI interactions are modeled as function calls with defined inputs/outputs
- **Streaming Support**: Real-time streaming of AI responses for interactive experiences
- **Security by Design**: JWT-based authentication with granular scopes
- **Observability**: Comprehensive logging, metrics, and tracing
- **Fault Tolerance**: Circuit breakers, retries, and graceful degradation

## 📡 API Endpoints

### Base URL
```
https://api.auterity.com/v1/ai
```

All requests must include:
- `Authorization: Bearer <jwt_token>`
- `X-Workspace-Id: <workspace_id>`
- `X-Project-Id: <project_id>`

### 1. Function Discovery
**GET** `/functions`

Discover available AI functions and their schemas.

**Response:**
```json
{
  "functions": [
    {
      "name": "text.generate",
      "description": "Generate text using advanced language models",
      "category": "text-processing",
      "version": "1.0.0",
      "schema": {
        "input": {
          "type": "object",
          "properties": {
            "prompt": {"type": "string", "maxLength": 4000},
            "model": {"type": "string", "enum": ["gpt-4", "claude-3", "gemini-pro"]},
            "temperature": {"type": "number", "minimum": 0, "maximum": 2},
            "max_tokens": {"type": "integer", "minimum": 1, "maximum": 4096}
          },
          "required": ["prompt"]
        },
        "output": {
          "type": "object",
          "properties": {
            "text": {"type": "string"},
            "usage": {
              "type": "object",
              "properties": {
                "input_tokens": {"type": "integer"},
                "output_tokens": {"type": "integer"},
                "total_tokens": {"type": "integer"}
              }
            }
          }
        }
      },
      "capabilities": ["streaming", "async"],
      "rate_limits": {
        "requests_per_minute": 60,
        "tokens_per_hour": 10000
      },
      "cost_per_token": 0.00002
    }
  ],
  "categories": ["text-processing", "image-generation", "code-analysis", "data-analysis"]
}
```

### 2. Function Execution
**POST** `/functions/{function_name}/execute`

Execute an AI function with specified parameters.

**Request:**
```json
{
  "parameters": {
    "prompt": "Write a Python function to calculate fibonacci numbers",
    "model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 1000
  },
  "options": {
    "stream": true,
    "timeout": 30000,
    "idempotency_key": "unique-request-id-123"
  }
}
```

**Success Response:**
```json
{
  "execution_id": "exec_abc123",
  "status": "completed",
  "result": {
    "text": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)",
    "usage": {
      "input_tokens": 15,
      "output_tokens": 45,
      "total_tokens": 60
    }
  },
  "metadata": {
    "model": "gpt-4",
    "processing_time_ms": 1250,
    "cost_usd": 0.0012
  }
}
```

### 3. Streaming Execution
**POST** `/functions/{function_name}/execute?stream=true`

Stream AI function results in real-time.

**Streaming Response (SSE):**
```
data: {"type": "start", "execution_id": "exec_abc123"}

data: {"type": "chunk", "delta": "def", "usage": {"input_tokens": 15, "output_tokens": 1}}

data: {"type": "chunk", "delta": " fibonacci", "usage": {"output_tokens": 2}}

data: {"type": "chunk", "delta": "(n):\n", "usage": {"output_tokens": 5}}

...

data: {"type": "complete", "usage": {"total_tokens": 60}, "cost_usd": 0.0012}
```

### 4. Execution Status
**GET** `/executions/{execution_id}`

Check the status of an async AI function execution.

**Response:**
```json
{
  "execution_id": "exec_abc123",
  "status": "running",
  "progress": 0.75,
  "estimated_completion": "2024-01-15T10:30:00Z",
  "usage_so_far": {
    "input_tokens": 15,
    "output_tokens": 30
  }
}
```

### 5. Batch Execution
**POST** `/functions/batch`

Execute multiple AI functions in a single request.

**Request:**
```json
{
  "executions": [
    {
      "function": "text.generate",
      "parameters": {"prompt": "Summarize this text...", "model": "gpt-4"},
      "idempotency_key": "batch-1"
    },
    {
      "function": "text.sentiment",
      "parameters": {"text": "This product is amazing!", "model": "bert"},
      "idempotency_key": "batch-2"
    }
  ],
  "options": {
    "parallel": true,
    "timeout": 60000
  }
}
```

## 🔐 Authentication & Authorization

### JWT Scopes Required

| Endpoint | Required Scopes |
|----------|-----------------|
| `GET /functions` | `ai.read` |
| `POST /functions/*/execute` | `ai.call` |
| `GET /executions/*` | `ai.read` |
| `POST /functions/batch` | `ai.call` |

### Token Validation

- **Algorithm**: RS256 (RSA Signature)
- **Issuer**: `https://auth.auterity.com`
- **Audience**: `ai-hub`
- **Expiration**: Maximum 1 hour for AI calls
- **Claims**:
  ```json
  {
    "sub": "user-123",
    "scopes": ["ai.call", "ai.read"],
    "workspace": "workspace-456",
    "project": "project-789",
    "iat": 1640995200,
    "exp": 1640998800
  }
  ```

## ⚡ Rate Limiting & Quotas

### Per-Function Limits

```json
{
  "text.generate": {
    "requests_per_minute": 60,
    "requests_per_hour": 1000,
    "tokens_per_hour": 10000,
    "concurrent_requests": 5
  },
  "image.generate": {
    "requests_per_minute": 10,
    "requests_per_hour": 100,
    "images_per_hour": 50,
    "concurrent_requests": 2
  }
}
```

### Global Limits

- **Requests per minute**: 1000
- **Concurrent executions**: 20
- **Total tokens per hour**: 50000

### Rate Limit Headers

```http
X-RateLimit-Limit-Requests: 60
X-RateLimit-Remaining-Requests: 45
X-RateLimit-Reset-Requests: 1640995260
X-RateLimit-Limit-Tokens: 10000
X-RateLimit-Remaining-Tokens: 8750
```

## 🚨 Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "details": {
      "retry_after_seconds": 30,
      "limit": 60,
      "remaining": 0
    }
  },
  "request_id": "req_abc123",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Malformed request |
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Function or execution not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded |
| `QUOTA_EXCEEDED` | 429 | Usage quota exceeded |
| `FUNCTION_ERROR` | 500 | AI function execution failed |
| `SERVICE_UNAVAILABLE` | 503 | AI service temporarily unavailable |

## 📊 Observability

### Metrics

- **Request Count**: `ai_requests_total{function="text.generate", status="success"}`
- **Latency**: `ai_request_duration_seconds{function="text.generate", quantile="0.95"}`
- **Token Usage**: `ai_tokens_used_total{function="text.generate", type="input"}`
- **Error Rate**: `ai_errors_total{function="text.generate", code="RATE_LIMIT_EXCEEDED"}`
- **Cost**: `ai_cost_usd_total{function="text.generate"}`

### Tracing

All requests include distributed tracing headers:
- `X-B3-TraceId`: Unique trace identifier
- `X-B3-SpanId`: Current span identifier
- `X-B3-ParentSpanId`: Parent span identifier
- `X-B3-Sampled`: Whether this trace is sampled

### Logging

Structured logs include:
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "service": "ai-hub",
  "request_id": "req_abc123",
  "user_id": "user-456",
  "workspace_id": "workspace-789",
  "function": "text.generate",
  "execution_time_ms": 1250,
  "tokens_used": 60,
  "cost_usd": 0.0012,
  "status": "success"
}
```

## 💰 Billing & Cost Tracking

### Cost Calculation

```javascript
const cost = (inputTokens * inputCost) + (outputTokens * outputCost);
```

### Cost Examples

| Function | Input Tokens | Output Tokens | Cost (USD) |
|----------|--------------|----------------|------------|
| text.generate (GPT-4) | 100 | 200 | $0.007 |
| image.generate (DALL-E) | 50 | 1 | $0.020 |
| code.analyze (CodeLlama) | 500 | 100 | $0.003 |

### Billing Events

```json
{
  "event": "ai_usage",
  "user_id": "user-123",
  "workspace_id": "workspace-456",
  "function": "text.generate",
  "tokens": 300,
  "cost_usd": 0.006,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🔧 Studio Integration Examples

### AI Node Configuration

```typescript
interface AINodeConfig {
  function: string;
  parameters: Record<string, any>;
  outputMapping: {
    [outputKey: string]: string; // Maps AI output to workflow variables
  };
  errorHandling: {
    onError: 'fail' | 'retry' | 'continue';
    maxRetries: number;
    fallbackValue?: any;
  };
}
```

### Studio AI Node Implementation

```typescript
class AITextGenerateNode extends StudioNode {
  async execute(inputs: any): Promise<any> {
    const response = await apiClient.callAIFunction('text.generate', {
      prompt: inputs.prompt,
      model: this.properties.model,
      temperature: this.properties.temperature,
      max_tokens: this.properties.maxTokens
    });

    return {
      generatedText: response.result.text,
      usage: response.result.usage,
      cost: response.metadata.cost_usd
    };
  }
}
```

### Error Handling in Studio

```typescript
class AINodeExecutor {
  async execute(node: AINode, inputs: any): Promise<any> {
    try {
      const result = await node.execute(inputs);
      this.trackUsage(node.function, result.usage);
      return result;
    } catch (error) {
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        await this.handleRateLimit(error);
      } else if (error.code === 'QUOTA_EXCEEDED') {
        this.notifyUserQuotaExceeded();
      }
      throw error;
    }
  }
}
```

## 📈 Performance Expectations

### Latency Targets

- **Function Discovery**: < 100ms (cached)
- **Simple Function Call**: < 2s (GPT-3.5)
- **Complex Function Call**: < 10s (GPT-4)
- **Image Generation**: < 30s (DALL-E)
- **Streaming First Token**: < 500ms

### Throughput Targets

- **Requests per second**: 100
- **Concurrent executions**: 1000
- **Data transfer**: 10 Gbps

## 🔄 Versioning & Compatibility

### API Versioning

- **URL Path**: `/v1/ai/...`
- **Header**: `Accept: application/vnd.auterity.ai.v1+json`
- **Breaking Changes**: New major version
- **Additive Changes**: Backward compatible within major version

### Function Versioning

```json
{
  "name": "text.generate",
  "version": "1.0.0",
  "compatibility": ["1.0.x"],
  "deprecated": false,
  "sunset_date": null
}
```

## 🚀 Future Extensions

### Planned Features

1. **Function Composition**: Chain multiple AI functions
2. **Custom Models**: User-trained model deployment
3. **Real-time Collaboration**: Shared AI function sessions
4. **Cost Optimization**: Automatic model selection
5. **Batch Processing**: Large-scale AI operations
6. **Model Fine-tuning**: Custom model training workflows

### Extension Points

```json
{
  "extensions": {
    "custom_functions": "/api/v1/ai/extensions/functions",
    "webhooks": "/api/v1/ai/extensions/webhooks",
    "plugins": "/api/v1/ai/extensions/plugins"
  }
}
```

This contract provides a solid foundation for secure, scalable, and user-friendly AI integration within the Auterity Workflow Studio ecosystem.
