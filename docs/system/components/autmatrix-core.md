# AutoMatrix Core - Workflow Engine

## Overview

AutoMatrix is the core workflow automation engine of the Auterity platform, designed specifically for automotive dealerships. Built with FastAPI and Python, it provides a robust, scalable foundation for creating, executing, and monitoring intelligent workflows.

## Component Architecture

### Technology Stack

- **Backend Framework**: FastAPI + Python 3.11
- **Database**: PostgreSQL 14+ with SQLAlchemy ORM
- **Cache Layer**: Redis 7+ for session management and caching
- **Message Queue**: RabbitMQ for asynchronous task processing
- **Authentication**: JWT-based with role-based access control
- **AI Integration**: OpenAI API, Azure OpenAI, custom models
- **Testing**: Pytest with async support and test fixtures
- **Documentation**: Automatic OpenAPI/Swagger generation

### Service Dependencies

```mermaid
graph TD
    AM[AutoMatrix API] --> PG[(PostgreSQL)]
    AM --> RD[(Redis)]
    AM --> MQ[RabbitMQ]
    AM --> AI[AI Services]
    AM --> WS[WebSocket Manager]
    AM --> AU[Auth Service]
    AM --> WE[Workflow Engine]
    AM --> TE[Template Engine]
    AM --> ME[Metrics Engine]
```

## Core Features

### 1. Workflow Management

#### Workflow Definition
- **Visual Builder Integration**: Seamless integration with Workflow Studio canvas
- **Node Types**: 20+ predefined node types (AI processing, decision logic, integrations)
- **Custom Logic**: JavaScript/Python expression evaluation in workflow steps
- **Version Control**: Workflow versioning with rollback capabilities
- **Template System**: Reusable workflow templates with parameter substitution

#### Workflow Execution
- **Async Processing**: Non-blocking execution with real-time status updates
- **Error Handling**: Comprehensive retry mechanisms and failure recovery
- **Parallel Execution**: Multi-threaded execution for independent workflow branches
- **State Management**: Persistent workflow state with checkpoint recovery
- **Resource Limits**: Configurable timeouts and resource constraints

### 2. User Management & Authentication

#### Authentication System
- **JWT Tokens**: Secure token-based authentication with refresh rotation
- **Multi-Factor Authentication**: TOTP and SMS-based MFA support
- **SSO Integration**: OAuth2/OIDC for enterprise directory integration
- **Session Management**: Redis-based session storage with configurable expiration

#### Authorization & Access Control
- **Role-Based Access Control**: Hierarchical role system with granular permissions
- **Organization Management**: Multi-tenant architecture with data isolation
- **API Key Management**: Service-to-service authentication with quota limits
- **Audit Logging**: Comprehensive activity tracking for compliance

### 3. AI Service Integration

#### OpenAI Integration
- **Model Support**: GPT-3.5-turbo, GPT-4, GPT-4-turbo with fallback chains
- **Function Calling**: Structured AI responses with tool integration
- **Context Management**: Conversation context preservation across workflow steps
- **Cost Optimization**: Token usage tracking and budget controls

#### Custom AI Models
- **Model Registry**: Integration with NeuroWeaver for custom model deployment
- **A/B Testing**: Split testing for model performance comparison
- **Performance Monitoring**: Response time and quality metrics tracking
- **Fallback Strategies**: Graceful degradation when AI services are unavailable

### 4. Template Library

#### Template Management
- **Template Creation**: Visual template builder with parameter definition
- **Categorization**: Industry-specific template organization and tagging
- **Version Control**: Template versioning with change tracking
- **Sharing & Marketplace**: Community-driven template sharing platform

#### Template Features
- **Parameterization**: Dynamic template customization with user inputs
- **Conditional Logic**: Template variations based on business rules
- **Integration Points**: Pre-configured third-party system connections
- **Best Practices**: Built-in compliance and optimization recommendations

## API Specifications

### Core Endpoints

#### Authentication Endpoints
```python
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/change-password
```

#### Workflow Endpoints
```python
GET    /api/workflows                 # List workflows
POST   /api/workflows                 # Create workflow
GET    /api/workflows/{id}            # Get workflow details
PUT    /api/workflows/{id}            # Update workflow
DELETE /api/workflows/{id}            # Delete workflow
POST   /api/workflows/{id}/execute    # Execute workflow
GET    /api/workflows/{id}/executions # List executions
```

#### Template Endpoints
```python
GET    /api/templates                 # List templates
POST   /api/templates                 # Create template
GET    /api/templates/{id}            # Get template details
PUT    /api/templates/{id}            # Update template
DELETE /api/templates/{id}            # Delete template
POST   /api/templates/{id}/instantiate # Create workflow from template
```

#### Execution Endpoints
```python
GET    /api/executions               # List all executions
GET    /api/executions/{id}          # Get execution details
POST   /api/executions/{id}/cancel   # Cancel execution
GET    /api/executions/{id}/logs     # Get execution logs
POST   /api/executions/{id}/retry    # Retry failed execution
```

### WebSocket Endpoints

#### Real-Time Updates
```python
WS /ws/workflows/{id}/status         # Workflow execution status
WS /ws/notifications                 # User notifications
WS /ws/collaboration/{workflow_id}   # Collaborative editing
WS /ws/metrics                       # Real-time metrics
```

## Database Schema

### Core Tables

#### Users & Organizations
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    organization_id UUID REFERENCES organizations(id),
    role_id UUID REFERENCES roles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Workflows & Templates
```sql
-- Workflows table
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    definition JSONB NOT NULL,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    organization_id UUID REFERENCES organizations(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    definition JSONB NOT NULL,
    parameters JSONB DEFAULT '[]',
    is_public BOOLEAN DEFAULT false,
    organization_id UUID REFERENCES organizations(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Executions & Logs
```sql
-- Workflow executions
CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflows(id),
    status VARCHAR(50) DEFAULT 'pending',
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Execution logs
CREATE TABLE execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES workflow_executions(id),
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Configuration Management

### Environment Variables

#### Core Settings
```python
# Application settings
APP_NAME = "AutoMatrix API"
VERSION = "1.0.0"
ENVIRONMENT = "production"  # development, staging, production
DEBUG = False
SECRET_KEY = "your-secret-key-here"

# Database configuration
DATABASE_URL = "postgresql://user:password@localhost:5432/autmatrix"
DATABASE_ECHO = False
DATABASE_POOL_SIZE = 10
DATABASE_MAX_OVERFLOW = 20

# Redis configuration
REDIS_URL = "redis://localhost:6379/0"
REDIS_TTL = 3600

# Security settings
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7
PASSWORD_MIN_LENGTH = 8
```

#### AI Service Configuration
```python
# OpenAI settings
OPENAI_API_KEY = "your-openai-api-key"
OPENAI_MODEL = "gpt-3.5-turbo"
OPENAI_MAX_TOKENS = 4000
OPENAI_TEMPERATURE = 0.7

# Azure OpenAI settings
AZURE_OPENAI_API_KEY = "your-azure-openai-key"
AZURE_OPENAI_ENDPOINT = "https://your-resource.openai.azure.com/"
AZURE_OPENAI_API_VERSION = "2023-12-01-preview"

# Custom model settings
CUSTOM_MODEL_ENDPOINT = "http://neuroweaver:3002/api/models"
MODEL_TIMEOUT = 30
```

## Performance Optimization

### Database Optimization

#### Indexing Strategy
```sql
-- Performance indexes
CREATE INDEX idx_workflows_organization_id ON workflows(organization_id);
CREATE INDEX idx_workflows_created_by ON workflows(created_by);
CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_workflow_executions_created_at ON workflow_executions(created_at);
CREATE INDEX idx_execution_logs_execution_id ON execution_logs(execution_id);

-- Composite indexes for common queries
CREATE INDEX idx_workflows_org_active ON workflows(organization_id, is_active);
CREATE INDEX idx_executions_workflow_status ON workflow_executions(workflow_id, status);
```

#### Connection Pooling
```python
# SQLAlchemy engine configuration
engine = create_async_engine(
    DATABASE_URL,
    echo=DATABASE_ECHO,
    pool_size=DATABASE_POOL_SIZE,
    max_overflow=DATABASE_MAX_OVERFLOW,
    pool_pre_ping=True,
    pool_recycle=3600
)
```

### Caching Strategy

#### Redis Cache Configuration
```python
# Cache keys and TTL
CACHE_KEYS = {
    "user_session": "session:{user_id}",
    "workflow_definition": "workflow:def:{workflow_id}",
    "template_list": "templates:org:{org_id}",
    "execution_status": "execution:status:{execution_id}"
}

CACHE_TTL = {
    "user_session": 3600,
    "workflow_definition": 1800,
    "template_list": 900,
    "execution_status": 300
}
```

### Async Processing
```python
# Async workflow execution
@router.post("/workflows/{workflow_id}/execute")
async def execute_workflow(
    workflow_id: UUID,
    input_data: dict = None,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user: User = Depends(get_current_user)
):
    execution = await create_execution(workflow_id, input_data, current_user.id)
    background_tasks.add_task(process_workflow_execution, execution.id)
    return {"execution_id": execution.id, "status": "started"}
```

## Monitoring & Observability

### Health Checks
```python
@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": VERSION,
        "database": await check_database_health(),
        "redis": await check_redis_health(),
        "rabbitmq": await check_rabbitmq_health()
    }
```

### Metrics Collection
```python
# Prometheus metrics
REQUEST_COUNT = Counter('autmatrix_requests_total', 'Total requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('autmatrix_request_duration_seconds', 'Request duration')
WORKFLOW_EXECUTIONS = Counter('autmatrix_workflow_executions_total', 'Workflow executions', ['status'])
ACTIVE_USERS = Gauge('autmatrix_active_users', 'Currently active users')
```

## Security Implementation

### Input Validation
```python
# Pydantic models for request validation
class WorkflowCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    definition: Dict[str, Any] = Field(...)
    
    @validator('definition')
    def validate_definition(cls, v):
        # Custom validation for workflow definition structure
        required_fields = ['nodes', 'edges']
        if not all(field in v for field in required_fields):
            raise ValueError('Workflow definition must contain nodes and edges')
        return v
```

### API Rate Limiting
```python
# Rate limiting with Redis
@router.post("/workflows/{workflow_id}/execute")
@limiter.limit("10/minute")
async def execute_workflow(request: Request, ...):
    # Endpoint implementation
    pass
```

## Error Handling & Logging

### Exception Handling
```python
# Global exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.error(f"HTTP {exc.status_code}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "timestamp": datetime.utcnow().isoformat()}
    )
```

### Logging Configuration
```python
# Structured logging with correlation IDs
logging.config.dictConfig({
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        },
        "json": {
            "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
            "format": "%(asctime)s %(name)s %(levelname)s %(message)s"
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "json",
            "level": "INFO"
        }
    },
    "root": {
        "level": "INFO",
        "handlers": ["console"]
    }
})
```

## Testing Strategy

### Unit Tests
```python
# Pytest configuration and fixtures
@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def authenticated_client(client):
    # Create test user and login
    user_data = {"email": "test@example.com", "password": "testpass123"}
    await client.post("/api/auth/register", json=user_data)
    login_response = await client.post("/api/auth/login", json=user_data)
    token = login_response.json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {token}"})
    return client
```

### Integration Tests
```python
# Database integration tests
async def test_workflow_execution_integration(authenticated_client):
    # Create workflow
    workflow_data = {
        "name": "Test Workflow",
        "definition": {"nodes": [], "edges": []}
    }
    workflow_response = await authenticated_client.post("/api/workflows", json=workflow_data)
    workflow_id = workflow_response.json()["id"]
    
    # Execute workflow
    execution_response = await authenticated_client.post(f"/api/workflows/{workflow_id}/execute")
    assert execution_response.status_code == 200
    
    # Verify execution was created
    execution_id = execution_response.json()["execution_id"]
    execution_details = await authenticated_client.get(f"/api/executions/{execution_id}")
    assert execution_details.json()["status"] in ["pending", "running", "completed"]
```

## Deployment & Operations

### Docker Configuration
```dockerfile
# Dockerfile for AutoMatrix API
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash autmatrix
USER autmatrix

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### Health Monitoring
```python
# Kubernetes liveness and readiness probes
@router.get("/health/live")
async def liveness_probe():
    return {"status": "alive"}

@router.get("/health/ready")
async def readiness_probe():
    checks = {
        "database": await check_database_connection(),
        "redis": await check_redis_connection(),
        "rabbitmq": await check_rabbitmq_connection()
    }
    
    if all(checks.values()):
        return {"status": "ready", "checks": checks}
    else:
        raise HTTPException(status_code=503, detail="Service not ready")
```

---

*This component documentation provides comprehensive coverage of the AutoMatrix core engine. Regular updates should accompany feature additions, architectural changes, or configuration modifications.*
