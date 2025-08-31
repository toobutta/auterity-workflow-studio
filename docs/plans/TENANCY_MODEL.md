# Shared Workspace/Project Data Model and Tenancy

## Overview

This document defines the shared tenancy model for the Auterity platform, providing consistent multi-tenancy across Workflow Studio, Error IQ, AI Hub, and all backend services. The model ensures proper data isolation, resource management, and cross-service communication.

## 🏗️ Core Data Model

### Organization

The top-level entity representing a company, team, or business unit.

```typescript
interface Organization {
  id: string;                    // UUID
  name: string;                  // Display name
  slug: string;                  // URL-friendly identifier
  domain?: string;               // Primary domain (e.g., company.com)
  logo?: string;                 // Logo URL
  settings: OrganizationSettings;
  billing: BillingInfo;
  created_at: Date;
  updated_at: Date;
}

interface OrganizationSettings {
  default_workspace_role: WorkspaceRole;
  max_workspaces: number;
  max_users: number;
  features: FeatureFlags;
  security: SecuritySettings;
}

interface BillingInfo {
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'past_due' | 'canceled';
  limits: BillingLimits;
}
```

### Workspace

A collaborative environment within an organization, containing multiple projects.

```typescript
interface Workspace {
  id: string;                    // UUID
  organization_id: string;       // Parent organization
  name: string;                  // Display name
  slug: string;                  // URL-friendly identifier
  description?: string;
  avatar?: string;               // Workspace avatar URL
  settings: WorkspaceSettings;
  metadata: Record<string, any>; // Custom metadata
  created_at: Date;
  updated_at: Date;
  created_by: string;            // User ID
}

interface WorkspaceSettings {
  default_project_role: ProjectRole;
  visibility: 'public' | 'private' | 'organization';
  allow_external_collaborators: boolean;
  features: FeatureFlags;
  integrations: IntegrationSettings;
}

type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer' | 'billing';

interface WorkspaceMember {
  user_id: string;
  workspace_id: string;
  role: WorkspaceRole;
  invited_by: string;
  invited_at: Date;
  joined_at?: Date;
}
```

### Project

A specific application, service, or initiative within a workspace.

```typescript
interface Project {
  id: string;                    // UUID
  workspace_id: string;          // Parent workspace
  name: string;                  // Display name
  slug: string;                  // URL-friendly identifier
  description?: string;
  type: ProjectType;             // 'web-app', 'api', 'mobile', 'ai-model', etc.
  settings: ProjectSettings;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  created_by: string;            // User ID
}

type ProjectType =
  | 'web-app'
  | 'api'
  | 'mobile'
  | 'ai-model'
  | 'data-pipeline'
  | 'automation'
  | 'integration'
  | 'other';

interface ProjectSettings {
  default_environment_role: EnvironmentRole;
  deployment: DeploymentSettings;
  monitoring: MonitoringSettings;
  security: SecuritySettings;
}

type ProjectRole = 'owner' | 'admin' | 'developer' | 'viewer';

interface ProjectMember {
  user_id: string;
  project_id: string;
  role: ProjectRole;
  assigned_by: string;
  assigned_at: Date;
}
```

### Environment

Deployment environments within a project (dev, staging, production).

```typescript
interface Environment {
  id: string;                    // UUID
  project_id: string;            // Parent project
  name: string;                  // 'development', 'staging', 'production'
  slug: string;                  // URL-friendly identifier
  type: EnvironmentType;
  settings: EnvironmentSettings;
  status: EnvironmentStatus;
  created_at: Date;
  updated_at: Date;
}

type EnvironmentType = 'development' | 'staging' | 'production' | 'testing' | 'demo';

interface EnvironmentSettings {
  region: string;                // AWS region, GCP zone, etc.
  provider: CloudProvider;       // 'aws', 'gcp', 'azure', 'on-premise'
  resources: ResourceLimits;
  variables: EnvironmentVariables;
}

type EnvironmentRole = 'owner' | 'admin' | 'developer' | 'viewer';

interface EnvironmentMember {
  user_id: string;
  environment_id: string;
  role: EnvironmentRole;
  granted_by: string;
  granted_at: Date;
}
```

## 🔗 Tenancy Propagation

### HTTP Headers

All API requests must include tenancy context via headers:

```http
X-Organization-Id: org_12345678-1234-1234-1234-123456789abc
X-Workspace-Id: ws_12345678-1234-1234-1234-123456789abc
X-Project-Id: proj_12345678-1234-1234-1234-123456789abc
X-Environment-Id: env_12345678-1234-1234-1234-123456789abc
X-User-Id: user_12345678-1234-1234-1234-123456789abc
X-Request-Id: req_12345678-1234-1234-1234-123456789abc
```

### Kong Plugin Configuration

```yaml
plugins:
  - name: request-transformer
    config:
      add:
        headers:
          - "X-Organization-Id:$(headers['x-organization-id'] || 'default')"
          - "X-Workspace-Id:$(headers['x-workspace-id'] || 'default')"
          - "X-Project-Id:$(headers['x-project-id'] || 'default')"
          - "X-Environment-Id:$(headers['x-environment-id'] || 'default')"
          - "X-User-Id:$(headers['x-user-id'] || 'default')"
          - "X-Request-Id:$(headers['x-request-id'] || crypto.randomUUID())"
```

### JWT Token Claims

```json
{
  "sub": "user_123",
  "org": "org_456",
  "workspace": "ws_789",
  "project": "proj_101",
  "environment": "env_202",
  "roles": ["workspace:admin", "project:developer"],
  "scopes": ["studio.read", "ai.call"],
  "iat": 1640995200,
  "exp": 1640998800
}
```

## 🗄️ Database Schema

### Multi-Tenant Database Design

```sql
-- Organizations table (separate database or schema)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  domain VARCHAR(255),
  logo_url TEXT,
  settings JSONB,
  billing JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Workspaces table (per-organization schema)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  avatar_url TEXT,
  settings JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),

  UNIQUE(organization_id, slug)
);

-- Projects table (per-workspace schema)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  settings JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),

  UNIQUE(workspace_id, slug)
);

-- Row Level Security (RLS) Policies
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY workspace_isolation ON workspaces
  USING (organization_id = current_org_id());

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY project_isolation ON projects
  USING (workspace_id = current_workspace_id());
```

### Schema Migration Strategy

```typescript
interface Migration {
  id: string;
  version: string;
  description: string;
  up: (db: DatabaseConnection) => Promise<void>;
  down: (db: DatabaseConnection) => Promise<void>;
  tenant_scope: 'global' | 'organization' | 'workspace';
}

// Example migration
const createWorkflowTable: Migration = {
  id: 'create-workflows-table',
  version: '1.0.0',
  description: 'Create workflows table for workspace',
  tenant_scope: 'workspace',
  up: async (db) => {
    await db.execute(`
      CREATE TABLE workflows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID NOT NULL,
        project_id UUID,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        definition JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by UUID REFERENCES users(id),
        version INTEGER DEFAULT 1
      )
    `);
  },
  down: async (db) => {
    await db.execute('DROP TABLE workflows');
  }
};
```

## 🔐 Access Control

### Role-Based Access Control (RBAC)

```typescript
interface Permission {
  resource: string;      // 'workspace', 'project', 'workflow', 'ai-function'
  action: string;        // 'create', 'read', 'update', 'delete', 'execute'
  scope: string;         // 'organization', 'workspace', 'project', 'environment'
}

const WORKSPACE_PERMISSIONS: Permission[] = [
  { resource: 'workspace', action: 'read', scope: 'organization' },
  { resource: 'workspace', action: 'update', scope: 'workspace' },
  { resource: 'project', action: 'create', scope: 'workspace' },
  { resource: 'workflow', action: 'execute', scope: 'project' }
];

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  'workspace:owner': [
    ...WORKSPACE_PERMISSIONS,
    { resource: 'workspace', action: 'delete', scope: 'workspace' },
    { resource: 'billing', action: 'manage', scope: 'organization' }
  ],
  'workspace:admin': WORKSPACE_PERMISSIONS,
  'workspace:member': [
    { resource: 'workspace', action: 'read', scope: 'workspace' },
    { resource: 'project', action: 'read', scope: 'project' },
    { resource: 'workflow', action: 'execute', scope: 'project' }
  ]
};
```

### Attribute-Based Access Control (ABAC)

```typescript
interface AccessRequest {
  subject: {
    user_id: string;
    roles: string[];
    attributes: Record<string, any>;
  };
  resource: {
    type: string;
    id: string;
    attributes: Record<string, any>;
  };
  action: string;
  context: {
    organization_id: string;
    workspace_id: string;
    project_id?: string;
    environment?: string;
    time: Date;
    ip_address: string;
  };
}

function evaluateAccess(request: AccessRequest): boolean {
  // Check basic RBAC
  if (!hasRequiredRole(request.subject.roles, request.action)) {
    return false;
  }

  // Check resource ownership
  if (request.resource.attributes.owner_id !== request.subject.user_id) {
    // Check if user has access through workspace/project membership
    return hasMembershipAccess(request);
  }

  // Check time-based restrictions
  if (isOutsideBusinessHours(request.context.time)) {
    return request.subject.attributes.clearance_level === 'high';
  }

  return true;
}
```

## 🌐 API Patterns

### Tenancy-Aware API Design

```typescript
// Service interface with tenancy context
interface TenancyAwareService {
  getWorkspaceResources(workspaceId: string): Promise<Resource[]>;
  createProjectResource(workspaceId: string, projectId: string, data: any): Promise<Resource>;
  executeWorkflow(workspaceId: string, workflowId: string, inputs: any): Promise<Result>;
}

// API endpoint patterns
GET  /api/v1/organizations/{orgId}/workspaces
GET  /api/v1/workspaces/{workspaceId}/projects
GET  /api/v1/projects/{projectId}/workflows
POST /api/v1/workspaces/{workspaceId}/projects/{projectId}/workflows

// Tenancy validation middleware
async function validateTenancy(req: Request, res: Response, next: NextFunction) {
  const { organizationId, workspaceId, projectId } = req.headers;

  // Verify user has access to the requested tenancy context
  const hasAccess = await tenancyService.validateAccess({
    userId: req.user.id,
    organizationId,
    workspaceId,
    projectId,
    action: req.method.toLowerCase(),
    resource: req.baseUrl
  });

  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }

  next();
}
```

### Cross-Service Communication

```typescript
// Service mesh communication with tenancy context
interface ServiceRequest {
  service: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  body?: any;
  tenancy: {
    organization_id: string;
    workspace_id: string;
    project_id?: string;
    environment?: string;
  };
}

// Example: Workflow Studio calling AI Hub
const aiRequest: ServiceRequest = {
  service: 'ai-hub',
  endpoint: '/v1/ai/functions/text.generate/execute',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  },
  body: {
    prompt: 'Generate a summary',
    model: 'gpt-4'
  },
  tenancy: {
    organization_id: currentOrg.id,
    workspace_id: currentWorkspace.id,
    project_id: currentProject?.id
  }
};
```

## 📊 Resource Management

### Quotas and Limits

```typescript
interface ResourceQuotas {
  organization: {
    workspaces: { current: number; limit: number };
    users: { current: number; limit: number };
    storage_gb: { current: number; limit: number };
  };
  workspace: {
    projects: { current: number; limit: number };
    workflows: { current: number; limit: number };
    executions_per_month: { current: number; limit: number };
  };
  project: {
    environments: { current: number; limit: number };
    deployments_per_month: { current: number; limit: number };
  };
}

// Quota enforcement
async function checkQuota(
  type: keyof ResourceQuotas,
  resource: string,
  organizationId: string,
  workspaceId?: string,
  projectId?: string
): Promise<boolean> {
  const current = await quotaService.getCurrentUsage(type, resource, {
    organizationId,
    workspaceId,
    projectId
  });

  const limit = await quotaService.getLimit(type, resource, organizationId);

  return current < limit;
}
```

### Cost Allocation

```typescript
interface CostCenter {
  organization_id: string;
  workspace_id: string;
  project_id?: string;
  resource_type: 'compute' | 'storage' | 'ai-tokens' | 'bandwidth';
  cost_per_unit: number;
  attribution_rules: AttributionRule[];
}

interface AttributionRule {
  condition: string;  // e.g., "environment == 'production'"
  percentage: number; // e.g., 100 for production, 0 for development
}

// Cost tracking
async function trackResourceUsage(
  tenancy: TenancyContext,
  resourceType: string,
  usage: number,
  metadata: Record<string, any>
): Promise<void> {
  const costCenter = await costService.getCostCenter(tenancy, resourceType);
  const cost = usage * costCenter.cost_per_unit;

  await billingService.recordUsage({
    organization_id: tenancy.organization_id,
    workspace_id: tenancy.workspace_id,
    project_id: tenancy.project_id,
    resource_type: resourceType,
    usage,
    cost,
    metadata,
    timestamp: new Date()
  });
}
```

## 🔄 Data Synchronization

### Change Data Capture (CDC)

```typescript
interface EntityChange {
  entity_type: 'organization' | 'workspace' | 'project' | 'environment';
  entity_id: string;
  operation: 'create' | 'update' | 'delete';
  before?: any;
  after?: any;
  changed_by: string;
  changed_at: Date;
  tenancy_context: TenancyContext;
}

// CDC handler for cross-service sync
async function handleEntityChange(change: EntityChange): Promise<void> {
  // Update search indices
  await searchService.updateIndex(change);

  // Sync to data warehouse
  await warehouseService.syncEntity(change);

  // Update cache
  await cacheService.invalidateEntity(change);

  // Send notifications
  await notificationService.sendEntityChangeNotification(change);
}
```

### Cache Invalidation Strategy

```typescript
interface CacheKey {
  pattern: string;
  tenancy: {
    organization_id?: string;
    workspace_id?: string;
    project_id?: string;
  };
}

const CACHE_KEYS: Record<string, CacheKey> = {
  'workspace:list': {
    pattern: 'workspaces:org:{organization_id}',
    tenancy: { organization_id: true }
  },
  'project:list': {
    pattern: 'projects:workspace:{workspace_id}',
    tenancy: { workspace_id: true }
  },
  'workflow:list': {
    pattern: 'workflows:project:{project_id}',
    tenancy: { project_id: true }
  }
};
```

## 🚨 Error Handling

### Tenancy-Related Errors

```typescript
enum TenancyErrorCode {
  ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND',
  WORKSPACE_ACCESS_DENIED = 'WORKSPACE_ACCESS_DENIED',
  PROJECT_QUOTA_EXCEEDED = 'PROJECT_QUOTA_EXCEEDED',
  ENVIRONMENT_SUSPENDED = 'ENVIRONMENT_SUSPENDED',
  INVALID_TENANCY_CONTEXT = 'INVALID_TENANCY_CONTEXT'
}

interface TenancyError extends Error {
  code: TenancyErrorCode;
  tenancy_context: TenancyContext;
  details?: Record<string, any>;
}

// Error handler middleware
function handleTenancyError(error: TenancyError, req: Request, res: Response) {
  const statusMap = {
    [TenancyErrorCode.ORGANIZATION_NOT_FOUND]: 404,
    [TenancyErrorCode.WORKSPACE_ACCESS_DENIED]: 403,
    [TenancyErrorCode.PROJECT_QUOTA_EXCEEDED]: 429,
    [TenancyErrorCode.ENVIRONMENT_SUSPENDED]: 503,
    [TenancyErrorCode.INVALID_TENANCY_CONTEXT]: 400
  };

  res.status(statusMap[error.code] || 500).json({
    error: {
      code: error.code,
      message: error.message,
      tenancy_context: error.tenancy_context,
      details: error.details
    },
    request_id: req.headers['x-request-id']
  });
}
```

## 📈 Monitoring and Observability

### Tenancy Metrics

```typescript
// Prometheus metrics
const tenancyMetrics = {
  active_organizations: new Gauge({
    name: 'auterity_active_organizations_total',
    help: 'Number of active organizations'
  }),

  workspace_count: new Gauge({
    name: 'auterity_workspace_count',
    help: 'Number of workspaces per organization',
    labelNames: ['organization_id']
  }),

  api_requests_by_tenancy: new Counter({
    name: 'auterity_api_requests_by_tenancy_total',
    help: 'API requests by tenancy context',
    labelNames: ['organization_id', 'workspace_id', 'project_id', 'endpoint']
  }),

  tenancy_errors: new Counter({
    name: 'auterity_tenancy_errors_total',
    help: 'Tenancy-related errors',
    labelNames: ['error_code', 'organization_id']
  })
};
```

### Audit Logging

```typescript
interface AuditLogEntry {
  id: string;
  timestamp: Date;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  tenancy_context: TenancyContext;
  changes?: {
    before: any;
    after: any;
  };
  metadata: Record<string, any>;
}

// Audit log service
class AuditService {
  async log(entry: AuditLogEntry): Promise<void> {
    // Store in audit database
    await auditDb.insert('audit_logs', entry);

    // Send to security monitoring
    await securityService.processAuditEntry(entry);

    // Update real-time dashboards
    await dashboardService.updateAuditMetrics(entry);
  }
}
```

This tenancy model provides a solid foundation for multi-tenant operation across the entire Auterity platform, ensuring proper data isolation, access control, and cross-service communication.
