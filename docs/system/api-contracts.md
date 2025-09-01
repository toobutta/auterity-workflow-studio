# API Contracts & Integration Specifications

## Overview

This document defines the API contracts, data schemas, and integration specifications for the Auterity Unified AI Platform. It serves as the authoritative reference for all internal and external API interactions, ensuring consistent communication between services and with third-party systems.

## Core API Contracts

### Authentication & Authorization

#### JWT Token Structure
```typescript
interface JWTPayload {
  sub: string;                    // User ID
  email: string;                  // User email
  org_id: string;                 // Organization ID
  role: string;                   // User role
  permissions: string[];          // Granular permissions
  iat: number;                    // Issued at
  exp: number;                    // Expires at
  jti: string;                    // JWT ID for revocation
}

interface AuthTokens {
  access_token: string;           // Short-lived access token (30 min)
  refresh_token: string;          // Long-lived refresh token (7 days)
  token_type: "bearer";
  expires_in: number;
}
```

#### Authentication Endpoints
```yaml
# OpenAPI 3.0 specification
/api/auth/register:
  post:
    summary: Register new user
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [email, password, first_name, last_name]
            properties:
              email:
                type: string
                format: email
              password:
                type: string
                minLength: 8
              first_name:
                type: string
                minLength: 1
              last_name:
                type: string
                minLength: 1
              organization_name:
                type: string
    responses:
      201:
        description: User created successfully
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserResponse'
      400:
        description: Invalid input or email already exists

/api/auth/login:
  post:
    summary: User login
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [email, password]
            properties:
              email:
                type: string
                format: email
              password:
                type: string
    responses:
      200:
        description: Login successful
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AuthTokens'
      401:
        description: Invalid credentials
```

### Workflow Management

#### Workflow Definition Schema
```typescript
interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  version: number;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: WorkflowVariable[];
  triggers: WorkflowTrigger[];
  settings: WorkflowSettings;
}

interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  title: string;
  description?: string;
  config: NodeConfig;
  inputs: NodePort[];
  outputs: NodePort[];
  validation?: ValidationRule[];
}

interface WorkflowEdge {
  id: string;
  source_node_id: string;
  source_port: string;
  target_node_id: string;
  target_port: string;
  type: 'data' | 'control' | 'conditional';
  condition?: string;
}

type NodeType = 
  | 'ai-text-processing'
  | 'ai-image-analysis'
  | 'decision-logic'
  | 'data-transformation'
  | 'api-integration'
  | 'email-sender'
  | 'sms-sender'
  | 'database-query'
  | 'file-processor'
  | 'webhook-trigger'
  | 'schedule-trigger'
  | 'form-input'
  | 'output-formatter';
```

#### Workflow Endpoints
```yaml
/api/workflows:
  get:
    summary: List workflows for organization
    parameters:
      - name: page
        in: query
        schema:
          type: integer
          default: 1
      - name: limit
        in: query
        schema:
          type: integer
          default: 20
      - name: search
        in: query
        schema:
          type: string
      - name: category
        in: query
        schema:
          type: string
    responses:
      200:
        description: Workflows retrieved successfully
        content:
          application/json:
            schema:
              type: object
              properties:
                workflows:
                  type: array
                  items:
                    $ref: '#/components/schemas/WorkflowSummary'
                pagination:
                  $ref: '#/components/schemas/PaginationInfo'

  post:
    summary: Create new workflow
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/WorkflowCreateRequest'
    responses:
      201:
        description: Workflow created successfully
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/WorkflowDefinition'

/api/workflows/{workflow_id}/execute:
  post:
    summary: Execute workflow
    parameters:
      - name: workflow_id
        in: path
        required: true
        schema:
          type: string
          format: uuid
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              inputs:
                type: object
                additionalProperties: true
              context:
                type: object
                additionalProperties: true
    responses:
      202:
        description: Execution started
        content:
          application/json:
            schema:
              type: object
              properties:
                execution_id:
                  type: string
                  format: uuid
                status:
                  type: string
                  enum: [pending, running]
                created_at:
                  type: string
                  format: date-time
```

### Template Management

#### Template Schema
```typescript
interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  version: number;
  is_public: boolean;
  organization_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  definition: WorkflowDefinition;
  parameters: TemplateParameter[];
  preview_image?: string;
  usage_count: number;
  rating: number;
  reviews: TemplateReview[];
}

interface TemplateParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect';
  label: string;
  description?: string;
  required: boolean;
  default_value?: any;
  options?: ParameterOption[];
  validation?: ValidationRule[];
}

interface ParameterOption {
  value: any;
  label: string;
  description?: string;
}
```

#### Template Endpoints
```yaml
/api/templates:
  get:
    summary: List available templates
    parameters:
      - name: category
        in: query
        schema:
          type: string
      - name: public_only
        in: query
        schema:
          type: boolean
          default: false
      - name: search
        in: query
        schema:
          type: string
    responses:
      200:
        description: Templates retrieved successfully

/api/templates/{template_id}/instantiate:
  post:
    summary: Create workflow from template
    parameters:
      - name: template_id
        in: path
        required: true
        schema:
          type: string
          format: uuid
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              name:
                type: string
              parameters:
                type: object
                additionalProperties: true
    responses:
      201:
        description: Workflow created from template
```

### Execution Management

#### Execution Status Schema
```typescript
interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: ExecutionStatus;
  input_data: Record<string, any>;
  output_data?: Record<string, any>;
  error_message?: string;
  progress: number;              // 0-100
  started_at?: string;
  completed_at?: string;
  created_by: string;
  created_at: string;
  steps: ExecutionStep[];
  metrics: ExecutionMetrics;
}

type ExecutionStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'timeout';

interface ExecutionStep {
  node_id: string;
  node_name: string;
  status: ExecutionStatus;
  input_data?: Record<string, any>;
  output_data?: Record<string, any>;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
}

interface ExecutionMetrics {
  total_duration_ms: number;
  ai_processing_time_ms: number;
  api_calls_count: number;
  tokens_used: number;
  cost_estimate: number;
}
```

## AI Service Integration

### OpenAI API Integration
```typescript
interface AIProcessingRequest {
  model: string;                 // gpt-3.5-turbo, gpt-4, etc.
  prompt: string;
  max_tokens?: number;
  temperature?: number;
  functions?: AIFunction[];
  function_call?: string | { name: string };
  context?: string[];
}

interface AIProcessingResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: AIChoice[];
  usage: TokenUsage;
  cost_estimate: number;
}

interface AIFunction {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}
```

### Custom AI Model Integration
```typescript
interface CustomModelRequest {
  model_id: string;
  version?: string;
  input: Record<string, any>;
  parameters?: Record<string, any>;
}

interface CustomModelResponse {
  model_id: string;
  version: string;
  output: Record<string, any>;
  confidence_score?: number;
  processing_time_ms: number;
  metadata?: Record<string, any>;
}
```

## WebSocket Protocols

### Real-Time Updates
```typescript
// WebSocket message types
type WebSocketMessage = 
  | ExecutionStatusUpdate
  | WorkflowCollaboration
  | UserNotification
  | SystemAnnouncement;

interface ExecutionStatusUpdate {
  type: 'execution_status';
  execution_id: string;
  status: ExecutionStatus;
  progress?: number;
  current_step?: string;
  timestamp: string;
}

interface WorkflowCollaboration {
  type: 'workflow_collaboration';
  workflow_id: string;
  user_id: string;
  operation: CollaborationOperation;
  data: any;
  timestamp: string;
}

type CollaborationOperation =
  | 'node_added'
  | 'node_updated'
  | 'node_deleted'
  | 'edge_added'
  | 'edge_deleted'
  | 'selection_changed'
  | 'cursor_moved';
```

### WebSocket Endpoints
```yaml
# WebSocket connections
/ws/executions/{execution_id}:
  description: Subscribe to execution status updates
  messages:
    execution_status:
      payload:
        $ref: '#/components/schemas/ExecutionStatusUpdate'

/ws/workflows/{workflow_id}/collaboration:
  description: Real-time workflow collaboration
  messages:
    collaboration_event:
      payload:
        $ref: '#/components/schemas/WorkflowCollaboration'

/ws/notifications:
  description: User notifications and system announcements
  messages:
    notification:
      payload:
        $ref: '#/components/schemas/UserNotification'
```

## External Integration Contracts

### Dealership Management Systems

#### Common DMS Integration Pattern
```typescript
interface DMSIntegration {
  provider: 'CDK' | 'Reynolds' | 'DealerSocket' | 'Custom';
  configuration: DMSConfiguration;
  authentication: DMSAuthentication;
  endpoints: DMSEndpoints;
}

interface DMSConfiguration {
  base_url: string;
  api_version: string;
  timeout_ms: number;
  retry_attempts: number;
  rate_limit: {
    requests_per_minute: number;
    burst_size: number;
  };
}

interface DMSAuthentication {
  type: 'api_key' | 'oauth2' | 'basic_auth';
  credentials: Record<string, string>;
  refresh_configuration?: OAuth2RefreshConfig;
}

interface DMSEndpoints {
  customers: string;
  vehicles: string;
  service_appointments: string;
  sales_opportunities: string;
  inventory: string;
}
```

#### Customer Data Synchronization
```typescript
interface CustomerData {
  dms_customer_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: Address;
  vehicles?: Vehicle[];
  preferences?: CustomerPreferences;
  last_updated: string;
}

interface Vehicle {
  dms_vehicle_id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileage?: number;
  purchase_date?: string;
  last_service_date?: string;
}
```

### Communication Providers

#### Email Service Integration
```typescript
interface EmailRequest {
  provider: 'sendgrid' | 'aws_ses' | 'mailgun';
  to: string[];
  cc?: string[];
  bcc?: string[];
  from: string;
  subject: string;
  content: {
    text?: string;
    html?: string;
  };
  template_id?: string;
  template_data?: Record<string, any>;
  attachments?: EmailAttachment[];
}

interface EmailResponse {
  message_id: string;
  status: 'sent' | 'queued' | 'failed';
  provider_response: any;
  timestamp: string;
}
```

#### SMS Service Integration
```typescript
interface SMSRequest {
  provider: 'twilio' | 'aws_sns' | 'messagebird';
  to: string;
  from: string;
  message: string;
  media_urls?: string[];
}

interface SMSResponse {
  message_id: string;
  status: 'sent' | 'queued' | 'failed' | 'delivered';
  provider_response: any;
  cost?: number;
  timestamp: string;
}
```

## Error Handling Specifications

### Standard Error Response Format
```typescript
interface APIError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    trace_id?: string;
    timestamp: string;
  };
}

// Standard error codes
const ErrorCodes = {
  // Authentication & Authorization
  INVALID_CREDENTIALS: 'AUTH_001',
  TOKEN_EXPIRED: 'AUTH_002',
  INSUFFICIENT_PERMISSIONS: 'AUTH_003',
  
  // Validation
  INVALID_INPUT: 'VAL_001',
  REQUIRED_FIELD_MISSING: 'VAL_002',
  INVALID_FORMAT: 'VAL_003',
  
  // Business Logic
  WORKFLOW_NOT_FOUND: 'WF_001',
  WORKFLOW_EXECUTION_FAILED: 'WF_002',
  TEMPLATE_NOT_FOUND: 'TPL_001',
  
  // External Services
  AI_SERVICE_UNAVAILABLE: 'AI_001',
  AI_QUOTA_EXCEEDED: 'AI_002',
  DMS_CONNECTION_FAILED: 'DMS_001',
  
  // System
  INTERNAL_SERVER_ERROR: 'SYS_001',
  SERVICE_UNAVAILABLE: 'SYS_002',
  RATE_LIMIT_EXCEEDED: 'SYS_003'
} as const;
```

### Error Response Examples
```yaml
# 400 Bad Request
{
  "error": {
    "code": "VAL_001",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    },
    "trace_id": "abc123-def456-ghi789",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}

# 401 Unauthorized
{
  "error": {
    "code": "AUTH_002",
    "message": "Access token has expired",
    "details": {
      "expired_at": "2024-01-15T10:00:00Z"
    },
    "timestamp": "2024-01-15T10:30:00Z"
  }
}

# 503 Service Unavailable
{
  "error": {
    "code": "AI_001",
    "message": "AI service temporarily unavailable",
    "details": {
      "provider": "openai",
      "retry_after": 300
    },
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Rate Limiting & Quotas

### Rate Limiting Configuration
```typescript
interface RateLimitConfig {
  endpoint_patterns: {
    [pattern: string]: {
      requests_per_minute: number;
      burst_size: number;
      scope: 'user' | 'organization' | 'global';
    };
  };
}

const defaultRateLimits: RateLimitConfig = {
  endpoint_patterns: {
    '/api/auth/*': {
      requests_per_minute: 10,
      burst_size: 5,
      scope: 'user'
    },
    '/api/workflows/*/execute': {
      requests_per_minute: 60,
      burst_size: 10,
      scope: 'organization'
    },
    '/api/ai/*': {
      requests_per_minute: 30,
      burst_size: 5,
      scope: 'organization'
    }
  }
};
```

### Usage Quotas
```typescript
interface UsageQuota {
  organization_id: string;
  period: 'daily' | 'monthly' | 'yearly';
  limits: {
    workflow_executions: number;
    ai_api_calls: number;
    ai_tokens: number;
    storage_mb: number;
    collaborators: number;
  };
  current_usage: {
    workflow_executions: number;
    ai_api_calls: number;
    ai_tokens: number;
    storage_mb: number;
    collaborators: number;
  };
  reset_date: string;
}
```

## API Versioning Strategy

### Version Headers
```yaml
# API version specification
headers:
  API-Version:
    description: API version to use
    schema:
      type: string
      enum: ["2024-01-15", "2023-12-01"]
      default: "2024-01-15"
  
  Accept:
    description: Response format
    schema:
      type: string
      enum: ["application/json", "application/vnd.auterity.v1+json"]
      default: "application/json"
```

### Backward Compatibility
```typescript
// Version-specific response transformers
interface APIVersionTransformer {
  version: string;
  transformResponse: (data: any) => any;
  transformRequest: (data: any) => any;
}

const versionTransformers: APIVersionTransformer[] = [
  {
    version: "2023-12-01",
    transformResponse: (data) => {
      // Transform new response format to old format
      return legacyResponseTransform(data);
    },
    transformRequest: (data) => {
      // Transform old request format to new format
      return modernRequestTransform(data);
    }
  }
];
```

---

*This API contract documentation serves as the definitive reference for all API interactions within the Auterity platform. Updates to this document should be coordinated with all consuming services and external integrations.*
