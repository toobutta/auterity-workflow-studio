# Data Dictionary & Definitions

## Overview

This data dictionary provides comprehensive documentation of all data entities, fields, relationships, and business rules used across the Auterity platform. It serves as the authoritative reference for data structure, validation rules, and usage patterns.

## 📋 Table of Contents

- [Core Entities](#core-entities)
- [User Management](#user-management)
- [Workflow Management](#workflow-management)
- [AI Processing](#ai-processing)
- [Analytics & Metrics](#analytics--metrics)
- [Integration Data](#integration-data)
- [System Configuration](#system-configuration)

---

## 🏗️ Core Entities

### Organization

**Description:** Represents a dealership or business entity using the platform.

| Field | Type | Required | Description | Validation | Example |
|-------|------|----------|-------------|------------|---------|
| `id` | UUID | ✓ | Unique organization identifier | Auto-generated | `550e8400-e29b-41d4-a716-446655440000` |
| `name` | String(100) | ✓ | Organization display name | 3-100 characters | `Premier Auto Group` |
| `domain` | String(255) | ✓ | Organization domain | Valid domain format | `premierauto.com` |
| `industry` | String(50) | ✓ | Industry classification | Predefined values | `automotive_dealership` |
| `size` | String(20) |  | Organization size | Predefined values | `enterprise`, `large`, `medium`, `small` |
| `timezone` | String(50) | ✓ | Organization timezone | Valid timezone | `America/New_York` |
| `currency` | String(3) | ✓ | Default currency | ISO 4217 | `USD` |
| `created_at` | Timestamp | ✓ | Creation timestamp | Auto-generated | `2024-01-15T10:30:00Z` |
| `updated_at` | Timestamp | ✓ | Last update timestamp | Auto-generated | `2024-01-15T14:20:00Z` |
| `status` | String(20) | ✓ | Organization status | `active`, `suspended`, `inactive` | `active` |

**Relationships:**
- One-to-many with Users
- One-to-many with Workflows
- One-to-many with Templates

**Business Rules:**
- Domain must be unique across platform
- Status changes trigger notifications
- Currency affects all financial calculations

---

## 👥 User Management

### User

**Description:** Represents a user account in the system.

| Field | Type | Required | Description | Validation | Example |
|-------|------|----------|-------------|------------|---------|
| `id` | UUID | ✓ | Unique user identifier | Auto-generated | `550e8400-e29b-41d4-a716-446655440001` |
| `organization_id` | UUID | ✓ | Parent organization | Valid organization | `550e8400-e29b-41d4-a716-446655440000` |
| `email` | String(254) | ✓ | User email address | Valid email format | `john.doe@premierauto.com` |
| `username` | String(150) | ✓ | Unique username | Alphanumeric + special chars | `john_doe` |
| `first_name` | String(30) | ✓ | User's first name | 1-30 characters | `John` |
| `last_name` | String(150) | ✓ | User's last name | 1-150 characters | `Doe` |
| `role` | String(20) | ✓ | User role | Predefined roles | `workflow_manager` |
| `department` | String(100) |  | User's department | Free text | `Service Department` |
| `phone` | String(20) |  | Phone number | Valid phone format | `+1-555-0123` |
| `is_active` | Boolean | ✓ | Account active status | Default: true | `true` |
| `is_staff` | Boolean | ✓ | Administrative access | Default: false | `false` |
| `date_joined` | Timestamp | ✓ | Account creation date | Auto-generated | `2024-01-15T10:30:00Z` |
| `last_login` | Timestamp |  | Last login timestamp | Auto-updated | `2024-01-15T14:20:00Z` |
| `password_hash` | String(128) | ✓ | Password hash | bcrypt hash | `$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjkuS` |

**Relationships:**
- Many-to-one with Organization
- One-to-many with Sessions
- One-to-many with Workflow Executions

**Business Rules:**
- Email must be unique within organization
- Username must be unique globally
- Role determines permission levels
- Account deactivation preserves data integrity

### User Session

**Description:** Tracks user authentication sessions.

| Field | Type | Required | Description | Validation | Example |
|-------|------|----------|-------------|------------|---------|
| `id` | UUID | ✓ | Unique session identifier | Auto-generated | `550e8400-e29b-41d4-a716-446655440002` |
| `user_id` | UUID | ✓ | Associated user | Valid user ID | `550e8400-e29b-41d4-a716-446655440001` |
| `session_key` | String(64) | ✓ | Session identifier | Auto-generated | `abc123def456ghi789` |
| `ip_address` | String(45) | ✓ | Client IP address | Valid IP format | `192.168.1.100` |
| `user_agent` | String(500) | ✓ | Browser/client info | Free text | `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36` |
| `created_at` | Timestamp | ✓ | Session start time | Auto-generated | `2024-01-15T10:30:00Z` |
| `expires_at` | Timestamp | ✓ | Session expiration | Calculated | `2024-01-15T22:30:00Z` |
| `is_active` | Boolean | ✓ | Session active status | Default: true | `true` |

**Business Rules:**
- Sessions expire after 12 hours of inactivity
- Maximum 5 concurrent sessions per user
- IP address changes trigger security alerts
- Session data used for security monitoring

---

## 🔄 Workflow Management

### Workflow

**Description:** Core entity representing an automated workflow.

| Field | Type | Required | Description | Validation | Example |
|-------|------|----------|-------------|------------|---------|
| `id` | UUID | ✓ | Unique workflow identifier | Auto-generated | `550e8400-e29b-41d4-a716-446655440003` |
| `organization_id` | UUID | ✓ | Owning organization | Valid organization | `550e8400-e29b-41d4-a716-446655440000` |
| `created_by` | UUID | ✓ | Creator user ID | Valid user ID | `550e8400-e29b-41d4-a716-446655440001` |
| `name` | String(100) | ✓ | Workflow display name | 3-100 characters | `Service Request Processor` |
| `description` | Text |  | Workflow description | Max 500 characters | `Automated processing of customer service requests` |
| `category` | String(50) | ✓ | Workflow category | Predefined values | `service`, `sales`, `parts` |
| `version` | Integer | ✓ | Workflow version number | Auto-incremented | `1` |
| `status` | String(20) | ✓ | Workflow status | `draft`, `active`, `inactive`, `archived` | `active` |
| `is_template` | Boolean | ✓ | Template flag | Default: false | `false` |
| `is_public` | Boolean | ✓ | Public visibility | Default: false | `false` |
| `definition` | JSONB | ✓ | Workflow definition | Valid JSON schema | Complex workflow structure |
| `variables` | JSONB |  | Workflow variables | Valid JSON schema | Variable definitions |
| `settings` | JSONB |  | Workflow settings | Valid JSON schema | Configuration settings |
| `created_at` | Timestamp | ✓ | Creation timestamp | Auto-generated | `2024-01-15T10:30:00Z` |
| `updated_at` | Timestamp | ✓ | Last update timestamp | Auto-generated | `2024-01-15T14:20:00Z` |

**Relationships:**
- Many-to-one with Organization
- Many-to-one with User (creator)
- One-to-many with Workflow Executions
- Many-to-many with Tags

**Business Rules:**
- Version increments on every save
- Status changes trigger notifications
- Definition must validate against schema
- Templates can be cloned but not directly executed

### Workflow Execution

**Description:** Records individual workflow execution instances.

| Field | Type | Required | Description | Validation | Example |
|-------|------|----------|-------------|------------|---------|
| `id` | UUID | ✓ | Unique execution identifier | Auto-generated | `550e8400-e29b-41d4-a716-446655440004` |
| `workflow_id` | UUID | ✓ | Associated workflow | Valid workflow ID | `550e8400-e29b-41d4-a716-446655440003` |
| `triggered_by` | UUID | ✓ | User who triggered execution | Valid user ID | `550e8400-e29b-41d4-a716-446655440001` |
| `status` | String(20) | ✓ | Execution status | `pending`, `running`, `completed`, `failed`, `cancelled` | `completed` |
| `input_data` | JSONB |  | Execution input data | Valid JSON | Customer service request data |
| `output_data` | JSONB |  | Execution output data | Valid JSON | Processing results |
| `error_message` | Text |  | Error details if failed | Max 1000 characters | `AI processing timeout after 30 seconds` |
| `progress` | Decimal(5,2) | ✓ | Completion percentage | 0.00-100.00 | `85.50` |
| `started_at` | Timestamp |  | Execution start time | Auto-generated | `2024-01-15T10:30:00Z` |
| `completed_at` | Timestamp |  | Execution completion time | Auto-generated | `2024-01-15T10:32:15Z` |
| `duration_ms` | BigInteger |  | Execution duration in milliseconds | Calculated | `105000` |

**Relationships:**
- Many-to-one with Workflow
- Many-to-one with User (triggered by)
- One-to-many with Execution Steps

**Business Rules:**
- Progress must be between 0 and 100
- Completed executions cannot be modified
- Failed executions retain error details
- Duration calculated automatically

### Workflow Node

**Description:** Individual components within a workflow.

| Field | Type | Required | Description | Validation | Example |
|-------|------|----------|-------------|------------|---------|
| `id` | UUID | ✓ | Unique node identifier | Auto-generated | `550e8400-e29b-41d4-a716-446655440005` |
| `workflow_id` | UUID | ✓ | Parent workflow | Valid workflow ID | `550e8400-e29b-41d4-a716-446655440003` |
| `type` | String(50) | ✓ | Node type | Predefined types | `ai_text_analysis`, `email_sender` |
| `title` | String(100) | ✓ | Node display title | 1-100 characters | `Analyze Customer Request` |
| `description` | Text |  | Node description | Max 500 characters | `Extract customer information from service request` |
| `position_x` | Integer | ✓ | Canvas X position | >= 0 | `300` |
| `position_y` | Integer | ✓ | Canvas Y position | >= 0 | `200` |
| `config` | JSONB | ✓ | Node configuration | Type-specific schema | AI model settings |
| `input_ports` | JSONB | ✓ | Input port definitions | Valid JSON schema | Port configurations |
| `output_ports` | JSONB | ✓ | Output port definitions | Valid JSON schema | Port configurations |

---

## 🤖 AI Processing

### AI Model

**Description:** Available AI models and their configurations.

| Field | Type | Required | Description | Validation | Example |
|-------|------|----------|-------------|------------|---------|
| `id` | UUID | ✓ | Unique model identifier | Auto-generated | `550e8400-e29b-41d4-a716-446655440006` |
| `provider` | String(50) | ✓ | AI provider | `openai`, `anthropic`, `azure` | `openai` |
| `model_name` | String(100) | ✓ | Model identifier | Provider-specific | `gpt-4-turbo` |
| `display_name` | String(100) | ✓ | Human-readable name | 3-100 characters | `GPT-4 Turbo` |
| `version` | String(20) | ✓ | Model version | Provider-specific | `2024-04-09` |
| `capabilities` | JSONB | ✓ | Model capabilities | Valid JSON | `["text_generation", "analysis"]` |
| `context_window` | Integer | ✓ | Token context limit | > 0 | `128000` |
| `max_tokens` | Integer | ✓ | Maximum output tokens | > 0 | `4096` |
| `pricing_per_token` | Decimal(10,6) | ✓ | Cost per token | > 0 | `0.000030` |
| `is_active` | Boolean | ✓ | Model availability | Default: true | `true` |
| `rate_limits` | JSONB | ✓ | Usage limits | Valid JSON | Rate limit configurations |

**Business Rules:**
- Pricing updates automatically from providers
- Rate limits enforced per organization
- Inactive models cannot be used in new workflows

### AI Processing Request

**Description:** Records AI processing requests and responses.

| Field | Type | Required | Description | Validation | Example |
|-------|------|----------|-------------|------------|---------|
| `id` | UUID | ✓ | Unique request identifier | Auto-generated | `550e8400-e29b-41d4-a716-446655440007` |
| `workflow_id` | UUID | ✓ | Associated workflow | Valid workflow ID | `550e8400-e29b-41d4-a716-446655440003` |
| `execution_id` | UUID | ✓ | Workflow execution | Valid execution ID | `550e8400-e29b-41d4-a716-446655440004` |
| `model_id` | UUID | ✓ | AI model used | Valid model ID | `550e8400-e29b-41d4-a716-446655440006` |
| `input_text` | Text | ✓ | Input prompt/text | Max 100,000 characters | User prompt and context |
| `output_text` | Text |  | Generated response | Max 100,000 characters | AI model response |
| `tokens_used` | Integer | ✓ | Total tokens consumed | > 0 | `1250` |
| `processing_time_ms` | Integer | ✓ | Processing duration | > 0 | `2500` |
| `cost_usd` | Decimal(10,6) | ✓ | Processing cost | >= 0 | `0.037500` |
| `status` | String(20) | ✓ | Request status | `pending`, `processing`, `completed`, `failed` | `completed` |
| `error_message` | Text |  | Error details | Max 1000 characters | `Rate limit exceeded` |
| `created_at` | Timestamp | ✓ | Request timestamp | Auto-generated | `2024-01-15T10:30:00Z` |
| `completed_at` | Timestamp |  | Completion timestamp | Auto-generated | `2024-01-15T10:30:02Z` |

---

## 📊 Analytics & Metrics

### Event

**Description:** Tracks user and system events for analytics.

| Field | Type | Required | Description | Validation | Example |
|-------|------|----------|-------------|------------|---------|
| `id` | UUID | ✓ | Unique event identifier | Auto-generated | `550e8400-e29b-41d4-a716-446655440008` |
| `organization_id` | UUID | ✓ | Associated organization | Valid organization | `550e8400-e29b-41d4-a716-446655440000` |
| `user_id` | UUID |  | Associated user | Valid user ID | `550e8400-e29b-41d4-a716-446655440001` |
| `event_type` | String(100) | ✓ | Event category | Predefined types | `workflow_execution_started` |
| `event_name` | String(100) | ✓ | Specific event name | Event-specific | `service_request_processed` |
| `properties` | JSONB | ✓ | Event properties | Valid JSON | Event-specific data |
| `timestamp` | Timestamp | ✓ | Event timestamp | Auto-generated | `2024-01-15T10:30:00Z` |
| `session_id` | String(64) |  | User session | Valid session ID | `abc123def456ghi789` |
| `ip_address` | String(45) |  | Client IP | Valid IP format | `192.168.1.100` |
| `user_agent` | String(500) |  | Client info | Free text | Browser/client details |

**Business Rules:**
- Events retained for 2 years for analytics
- Personally identifiable information anonymized
- Event schema validated before storage
- Real-time processing for critical events

### Metric

**Description:** Aggregated performance and usage metrics.

| Field | Type | Required | Description | Validation | Example |
|-------|------|----------|-------------|------------|---------|
| `id` | UUID | ✓ | Unique metric identifier | Auto-generated | `550e8400-e29b-41d4-a716-446655440009` |
| `organization_id` | UUID | ✓ | Associated organization | Valid organization | `550e8400-e29b-41d4-a716-446655440000` |
| `metric_type` | String(50) | ✓ | Metric category | Predefined types | `workflow_performance` |
| `metric_name` | String(100) | ✓ | Specific metric name | Metric-specific | `average_execution_time` |
| `value` | Decimal(15,6) | ✓ | Metric value | >= 0 | `1250.500000` |
| `unit` | String(20) | ✓ | Value unit | Predefined units | `milliseconds`, `count`, `percentage` |
| `dimensions` | JSONB |  | Metric dimensions | Valid JSON | `{"workflow_id": "...", "department": "service"}` |
| `timestamp` | Timestamp | ✓ | Metric timestamp | Auto-generated | `2024-01-15T10:30:00Z` |
| `aggregation_period` | String(20) | ✓ | Time granularity | `1m`, `5m`, `1h`, `1d` | `5m` |

---

## 🔗 Integration Data

### Integration

**Description:** Third-party system integrations.

| Field | Type | Required | Description | Validation | Example |
|-------|------|----------|-------------|------------|---------|
| `id` | UUID | ✓ | Unique integration identifier | Auto-generated | `550e8400-e29b-41d4-a716-446655440010` |
| `organization_id` | UUID | ✓ | Owning organization | Valid organization | `550e8400-e29b-41d4-a716-446655440000` |
| `name` | String(100) | ✓ | Integration display name | 3-100 characters | `CDK Global Integration` |
| `provider` | String(50) | ✓ | Integration provider | Predefined providers | `cdk_global` |
| `type` | String(20) | ✓ | Integration type | `dms`, `crm`, `communication` | `dms` |
| `status` | String(20) | ✓ | Integration status | `active`, `inactive`, `error`, `maintenance` | `active` |
| `config` | JSONB | ✓ | Integration configuration | Provider-specific schema | API credentials and settings |
| `last_sync` | Timestamp |  | Last successful sync | Auto-updated | `2024-01-15T14:20:00Z` |
| `sync_status` | String(20) | ✓ | Current sync status | `idle`, `running`, `failed`, `success` | `success` |
| `error_message` | Text |  | Last error details | Max 1000 characters | API authentication failed |
| `created_at` | Timestamp | ✓ | Creation timestamp | Auto-generated | `2024-01-15T10:30:00Z` |
| `updated_at` | Timestamp | ✓ | Last update timestamp | Auto-generated | `2024-01-15T14:20:00Z` |

**Business Rules:**
- Configuration encrypted before storage
- Status changes trigger notifications
- Failed integrations automatically retry
- Sync schedules configurable per integration

### Integration Log

**Description:** Records integration activities and data transfers.

| Field | Type | Required | Description | Validation | Example |
|-------|------|----------|-------------|------------|---------|
| `id` | UUID | ✓ | Unique log entry identifier | Auto-generated | `550e8400-e29b-41d4-a716-446655440011` |
| `integration_id` | UUID | ✓ | Associated integration | Valid integration ID | `550e8400-e29b-41d4-a716-446655440010` |
| `operation` | String(50) | ✓ | Operation type | `sync`, `import`, `export`, `webhook` | `sync` |
| `direction` | String(10) | ✓ | Data direction | `inbound`, `outbound` | `inbound` |
| `status` | String(20) | ✓ | Operation status | `success`, `failed`, `partial` | `success` |
| `records_processed` | Integer | ✓ | Number of records | >= 0 | `150` |
| `data_volume_bytes` | BigInteger |  | Data size in bytes | >= 0 | `5242880` |
| `duration_ms` | Integer | ✓ | Operation duration | > 0 | `2500` |
| `error_message` | Text |  | Error details | Max 1000 characters | Connection timeout |
| `created_at` | Timestamp | ✓ | Operation timestamp | Auto-generated | `2024-01-15T10:30:00Z` |

---

## ⚙️ System Configuration

### API Key

**Description:** API authentication credentials.

| Field | Type | Required | Description | Validation | Example |
|-------|------|----------|-------------|------------|---------|
| `id` | UUID | ✓ | Unique API key identifier | Auto-generated | `550e8400-e29b-41d4-a716-446655440012` |
| `organization_id` | UUID | ✓ | Owning organization | Valid organization | `550e8400-e29b-41d4-a716-446655440000` |
| `name` | String(100) | ✓ | API key display name | 3-100 characters | `Production API Key` |
| `key_hash` | String(128) | ✓ | Hashed API key | bcrypt hash | `$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjkuS` |
| `permissions` | JSONB | ✓ | API permissions | Valid JSON schema | `["workflows:read", "executions:create"]` |
| `rate_limit` | Integer | ✓ | Requests per minute | > 0 | `60` |
| `is_active` | Boolean | ✓ | API key active status | Default: true | `true` |
| `expires_at` | Timestamp |  | Expiration date | Future date | `2024-12-31T23:59:59Z` |
| `last_used_at` | Timestamp |  | Last usage timestamp | Auto-updated | `2024-01-15T14:20:00Z` |
| `created_at` | Timestamp | ✓ | Creation timestamp | Auto-generated | `2024-01-15T10:30:00Z` |

**Business Rules:**
- API keys expire after 1 year by default
- Rate limits enforced per key
- Inactive keys cannot authenticate requests
- Usage tracked for security monitoring

### System Setting

**Description:** Platform-wide configuration settings.

| Field | Type | Required | Description | Validation | Example |
|-------|------|----------|-------------|------------|---------|
| `id` | UUID | ✓ | Unique setting identifier | Auto-generated | `550e8400-e29b-41d4-a716-446655440013` |
| `category` | String(50) | ✓ | Setting category | Predefined categories | `security`, `performance`, `features` |
| `key` | String(100) | ✓ | Setting key | Unique within category | `max_workflow_executions` |
| `value` | JSONB | ✓ | Setting value | Type-specific validation | `1000` |
| `value_type` | String(20) | ✓ | Value data type | `string`, `number`, `boolean`, `json` | `number` |
| `description` | Text | ✓ | Setting description | 10-500 characters | `Maximum concurrent workflow executions per organization` |
| `is_system` | Boolean | ✓ | System vs organization setting | Default: true | `true` |
| `is_editable` | Boolean | ✓ | User-editable setting | Default: false | `false` |
| `created_at` | Timestamp | ✓ | Creation timestamp | Auto-generated | `2024-01-15T10:30:00Z` |
| `updated_at` | Timestamp | ✓ | Last update timestamp | Auto-generated | `2024-01-15T14:20:00Z` |

---

## 📋 Data Validation Rules

### Global Validation Patterns

```typescript
// Email validation
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Phone number validation (E.164 format)
const phonePattern = /^\+[1-9]\d{1,14}$/;

// UUID validation
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Domain validation
const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Currency validation (ISO 4217)
const currencyCodes = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
```

### Business Rule Validation

```typescript
// Organization validation
const validateOrganization = (org: Organization) => {
  if (!emailPattern.test(org.domain)) {
    throw new Error('Invalid domain format');
  }
  
  if (org.currency && !currencyCodes.includes(org.currency)) {
    throw new Error('Invalid currency code');
  }
  
  if (org.name.length < 3 || org.name.length > 100) {
    throw new Error('Organization name must be 3-100 characters');
  }
};

// Workflow validation
const validateWorkflow = (workflow: Workflow) => {
  if (workflow.name.length < 3 || workflow.name.length > 100) {
    throw new Error('Workflow name must be 3-100 characters');
  }
  
  if (!['draft', 'active', 'inactive', 'archived'].includes(workflow.status)) {
    throw new Error('Invalid workflow status');
  }
  
  if (workflow.version < 1) {
    throw new Error('Workflow version must be positive');
  }
};

// User validation
const validateUser = (user: User) => {
  if (!emailPattern.test(user.email)) {
    throw new Error('Invalid email format');
  }
  
  if (user.first_name.length < 1 || user.first_name.length > 30) {
    throw new Error('First name must be 1-30 characters');
  }
  
  if (user.last_name.length < 1 || user.last_name.length > 150) {
    throw new Error('Last name must be 1-150 characters');
  }
  
  if (!['admin', 'manager', 'user', 'viewer'].includes(user.role)) {
    throw new Error('Invalid user role');
  }
};
```

---

*This data dictionary serves as the authoritative reference for all data structures used in the Auterity platform. All development and integration work should reference this document to ensure data consistency and integrity.*

*Last Updated: [Current Date] | Version: 1.2.3*
