import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Mock API handlers
export const handlers = [
  // Health endpoint
  http.get('http://localhost:5055/health', () => {
    return HttpResponse.json({ status: 'OK', timestamp: new Date().toISOString() })
  }),

  // Workflow CRUD Operations
  http.post('http://localhost:5055/v1/workflows', async ({ request }) => {
    const body = await request.json() as any

    // Simulate server error for empty name
    if (!body.name || body.name.trim() === '') {
      return HttpResponse.json(
        { error: 'Validation Error', message: 'Workflow name is required' },
        { status: 500 }
      )
    }

    return HttpResponse.json({
      id: body.id || 'created-workflow-id',
      canonical: body,
      etag: 'created-etag-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }),

  http.get('http://localhost:5055/v1/workflows/:id', ({ params }) => {
    const { id } = params

    // Simulate 404 for non-existent workflows
    if (id === 'non-existent-id') {
      return HttpResponse.json(
        { error: 'Not Found', message: 'Workflow not found' },
        { status: 404 }
      )
    }

    // Simulate malformed JSON
    if (id === 'malformed-json') {
      return HttpResponse.text('invalid json', { status: 200 })
    }

    // Simulate timeout
    if (id === 'timeout-test') {
      return new Promise(() => {}) // Never resolves
    }

    // Large workflow response
    if (id === 'large-workflow') {
      const largeNodes = Array.from({ length: 100 }, (_, i) => ({
        id: `node-${i}`,
        type: 'action',
        position: { x: i * 20, y: i * 20 },
        data: { label: `Node ${i}` }
      }))

      return HttpResponse.json({
        id,
        name: `Large Workflow ${id}`,
        canonical: {
          id,
          name: `Large Workflow ${id}`,
          nodes: largeNodes,
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 }
        },
        etag: `etag-${id}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }

    // Concurrent test responses
    if (typeof id === 'string' && id.startsWith('concurrent-test-')) {
      return HttpResponse.json({
        id,
        name: `Concurrent Workflow ${id}`,
        canonical: {
          id,
          name: `Concurrent Workflow ${id}`,
          nodes: [{
            id: 'node-1',
            type: 'start',
            position: { x: 100, y: 100 },
            data: { label: 'Start' }
          }],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 }
        },
        etag: `etag-${id}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }

    // Legacy test response
    if (id === 'legacy-test') {
      return HttpResponse.json({
        id,
        name: `Legacy Workflow ${id}`,
        canonical: {
          id,
          name: `Legacy Workflow ${id}`,
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 }
        },
        etag: `etag-${id}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }

    return HttpResponse.json({
      id,
      name: `Workflow ${id}`,
      canonical: {
        id,
        name: `Workflow ${id}`,
        nodes: [{
          id: 'node-1',
          type: 'start',
          position: { x: 100, y: 100 },
          data: { label: 'Start' }
        }],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 }
      },
      etag: `etag-${id}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }),

  http.put('http://localhost:5055/v1/workflows/:id', async ({ request, params }) => {
    const { id } = params
    const body = await request.json() as any

    return HttpResponse.json({
      id,
      canonical: body,
      etag: 'updated-etag-456',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }),

  http.delete('http://localhost:5055/v1/workflows/:id', () => {
    return HttpResponse.json({ success: true })
  }),

  http.get('http://localhost:5055/v1/workflows', ({ request }) => {
    const url = new URL(request.url)
    const workspace = url.searchParams.get('workspace')
    const project = url.searchParams.get('project')

    const workflows = [
      {
        id: 'workflow-1',
        name: 'Sample Workflow 1',
        workspaceId: workspace || 'workspace-1',
        projectId: project || 'project-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'workflow-2',
        name: 'Sample Workflow 2',
        workspaceId: workspace || 'workspace-1',
        projectId: project || 'project-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    return HttpResponse.json(workflows)
  }),

  // Workflow Execution
  http.post('http://localhost:5055/v1/workflows/:id/execute', async ({ request, params }) => {
    const { id } = params
    const body = await request.json() as any

    return HttpResponse.json({
      executionId: `exec-${Date.now()}`,
      workflowId: id,
      status: 'running',
      inputs: body?.inputs || {},
      startedAt: new Date().toISOString()
    })
  }),

  http.get('http://localhost:5055/v1/executions/:id', ({ params }) => {
    const { id } = params

    return HttpResponse.json({
      id,
      workflowId: 'test-workflow-id',
      status: 'completed',
      result: { output: 'Execution completed successfully' },
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    })
  }),

  // Templates
  http.get('http://localhost:5055/v1/templates', ({ request }) => {
    const url = new URL(request.url)
    const category = url.searchParams.get('category')

    const templates = [
      {
        id: 'template-1',
        name: 'Basic Workflow',
        category: 'general',
        description: 'A simple workflow template',
        nodes: [],
        edges: []
      },
      {
        id: 'template-2',
        name: 'AI Workflow',
        category: 'ai',
        description: 'An AI-powered workflow template',
        nodes: [],
        edges: []
      },
      {
        id: 'template-3',
        name: 'Data Processing',
        category: 'data',
        description: 'Data processing workflow template',
        nodes: [],
        edges: []
      }
    ]

    const filteredTemplates = category
      ? templates.filter(t => t.category === category)
      : templates

    return HttpResponse.json(filteredTemplates)
  }),

  // Import/Export
  http.post('http://localhost:5055/v1/workflows/import', async ({ request }) => {
    const body = await request.json() as any

    return HttpResponse.json({
      id: 'imported-workflow-id',
      canonical: body,
      etag: 'imported-etag-456',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }),

  http.get('http://localhost:5055/v1/workflows/:id/export', ({ params, request }) => {
    const { id } = params
    const url = new URL(request.url)
    const format = url.searchParams.get('format') || 'json'

    if (format === 'json') {
      return HttpResponse.json({
        id,
        canonical: {
          id,
          name: `Exported Workflow ${id}`,
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 }
        },
        exportedAt: new Date().toISOString()
      })
    } else {
      // Return a mock blob for PNG/SVG exports
      return HttpResponse.text('mock-image-data', {
        headers: {
          'Content-Type': format === 'png' ? 'image/png' : 'image/svg+xml'
        }
      })
    }
  }),

  // AI Functions
  http.post('http://localhost:5055/v1/ai/functions/:name', async ({ request, params }) => {
    const { name } = params
    const body = await request.json() as any

    return HttpResponse.json({
      function: name,
      result: `Mock result for ${name}`,
      executionTime: 150,
      parameters: body
    })
  }),

  http.get('http://localhost:5055/v1/ai/functions', () => {
    return HttpResponse.json([
      {
        name: 'text-generation',
        description: 'Generate text using AI',
        parameters: {
          prompt: { type: 'string', required: true },
          maxTokens: { type: 'number', default: 100 }
        }
      },
      {
        name: 'image-generation',
        description: 'Generate images using AI',
        parameters: {
          prompt: { type: 'string', required: true },
          size: { type: 'string', default: '512x512' }
        }
      }
    ])
  }),

  // Workspace & Project Management
  http.get('http://localhost:5055/v1/workspaces', () => {
    return HttpResponse.json([
      {
        id: 'workspace-1',
        name: 'Default Workspace',
        description: 'Main workspace',
        createdAt: new Date().toISOString()
      },
      {
        id: 'workspace-2',
        name: 'Test Workspace',
        description: 'Testing workspace',
        createdAt: new Date().toISOString()
      }
    ])
  }),

  http.get('http://localhost:5055/v1/workspaces/:id/projects', ({ params }) => {
    const { id } = params

    return HttpResponse.json([
      {
        id: 'project-1',
        name: 'Development Project',
        workspaceId: id,
        environment: 'development',
        createdAt: new Date().toISOString()
      },
      {
        id: 'project-2',
        name: 'Production Project',
        workspaceId: id,
        environment: 'production',
        createdAt: new Date().toISOString()
      }
    ])
  }),

  http.post('http://localhost:5055/v1/workspaces', async ({ request }) => {
    const body = await request.json() as any

    return HttpResponse.json({
      id: 'new-workspace-id',
      name: body.name,
      description: body.description || '',
      createdAt: new Date().toISOString()
    })
  }),

  http.post('http://localhost:5055/v1/workspaces/:workspaceId/projects', async ({ request, params }) => {
    const { workspaceId } = params
    const body = await request.json() as any

    return HttpResponse.json({
      id: 'new-project-id',
      name: body.name,
      workspaceId,
      environment: body.environment,
      createdAt: new Date().toISOString()
    })
  }),

  // Legacy endpoints for backward compatibility
  http.post('http://localhost:5055/v1/workflows/export', async ({ request }) => {
    const body = await request.json() as any

    return HttpResponse.json({
      id: body.id || 'test-workflow-id',
      canonical: {
        id: body.id || 'test-workflow-id',
        name: body.name || 'Test Workflow',
        nodes: body.nodes || [],
        edges: body.edges || [],
        viewport: body.viewport || { x: 0, y: 0, zoom: 1 }
      },
      etag: 'test-etag-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }),

  // Error simulation endpoints
  http.get('http://localhost:5055/error', () => {
    return HttpResponse.json(
      { error: 'Internal Server Error', message: 'Something went wrong' },
      { status: 500 }
    )
  }),

  http.get('http://localhost:5055/network-error', () => {
    return HttpResponse.error()
  })
]

// Setup server
export const server = setupServer(...handlers)
