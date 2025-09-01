# Workflow Studio - Visual Designer

## Overview

Workflow Studio is the visual workflow designer component of the Auterity platform, providing a high-performance 2D canvas interface for creating, editing, and managing complex automation workflows. Built with React, TypeScript, and PixiJS, it delivers an enterprise-grade user experience with real-time collaboration capabilities.

## Component Architecture

### Technology Stack

- **Frontend Framework**: React 18 + TypeScript + Vite
- **Canvas Engine**: PixiJS 7+ for high-performance 2D rendering
- **State Management**: Zustand for global state, React Query for server state
- **Collaboration**: YJS + WebRTC for real-time collaborative editing
- **AI Integration**: Vercel AI SDK with multiple provider support
- **Testing**: Vitest + Playwright for unit and E2E testing
- **Build System**: Vite with optimized production builds
- **Styling**: Tailwind CSS with custom design tokens

### Key Dependencies

```json
{
  "@ai-sdk/openai": "^2.0.23",
  "@ai-sdk/anthropic": "^2.0.9",
  "@auterity/workflow-contracts": "file:../auterity-error-iq/packages/workflow-contracts/auterity-workflow-contracts-1.0.0.tgz",
  "pixi.js": "^7.2.3",
  "react": "^18.2.0",
  "yjs": "^13.6.27",
  "y-webrtc": "^10.3.0",
  "zustand": "^5.0.8",
  "framer-motion": "^12.23.12"
}
```

## Core Features

### 1. High-Performance Canvas

#### PixiJS Integration
- **WebGL Acceleration**: Hardware-accelerated rendering for smooth performance
- **Large Workflow Support**: Efficient handling of workflows with 500+ nodes
- **Memory Management**: Automatic object pooling and garbage collection
- **Viewport Management**: Pan, zoom, and minimap navigation
- **Layer System**: Organized rendering layers for nodes, connections, and UI elements

#### Canvas Performance
```typescript
// Canvas optimization configuration
const canvasConfig = {
  renderer: {
    antialias: true,
    resolution: window.devicePixelRatio,
    autoDensity: true,
    backgroundColor: 0xf8fafc,
    clearBeforeRender: true
  },
  performance: {
    objectPooling: true,
    frustumCulling: true,
    batchSize: 2000,
    maxTextures: 16
  }
};
```

### 2. Visual Workflow Builder

#### Node System
- **20+ Node Types**: AI processing, decision logic, data transformation, integrations
- **Custom Node Creation**: Extensible node system for specialized use cases
- **Node Categories**: Organized by function (AI, Logic, Data, Integration, Output)
- **Dynamic Ports**: Automatic input/output port management based on node configuration
- **Node Validation**: Real-time validation with visual error indicators

#### Connection System
- **Smart Routing**: Automatic path finding for node connections
- **Connection Types**: Data flow, control flow, and conditional connections
- **Visual Feedback**: Animated connection states and data flow indicators
- **Validation**: Type checking and circular dependency detection
- **Bezier Curves**: Smooth, visually appealing connection rendering

### 3. Real-Time Collaboration

#### YJS Integration
```typescript
// Collaborative document setup
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

const ydoc = new Y.Doc();
const provider = new WebrtcProvider('workflow-studio', ydoc);
const yWorkflow = ydoc.getMap('workflow');

// Real-time workflow synchronization
yWorkflow.observe((event) => {
  event.changes.keys.forEach((change, key) => {
    if (change.action === 'add' || change.action === 'update') {
      updateWorkflowState(key, yWorkflow.get(key));
    }
  });
});
```

#### Collaboration Features
- **Multi-User Editing**: Simultaneous workflow editing with conflict resolution
- **User Presence**: Real-time cursor and selection indicators
- **Change Tracking**: Visual indicators for recent changes and authors
- **Comment System**: Contextual comments and discussions on workflow elements
- **Version History**: Automatic saving with rollback capabilities

### 4. AI-Powered Assistance

#### AI Integration
```typescript
// AI service configuration
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';

const aiProviders = {
  openai: openai('gpt-4-turbo'),
  anthropic: anthropic('claude-3-sonnet-20240229'),
};

// Workflow generation from natural language
async function generateWorkflowFromPrompt(prompt: string) {
  const { object } = await generateObject({
    model: aiProviders.openai,
    schema: workflowSchema,
    prompt: `Create a workflow based on: ${prompt}`
  });
  return object;
}
```

#### AI Features
- **Natural Language Workflow Creation**: Generate workflows from text descriptions
- **Smart Node Suggestions**: Context-aware node recommendations
- **Workflow Optimization**: AI-powered performance and logic improvements
- **Error Detection**: Intelligent identification of workflow issues
- **Documentation Generation**: Automatic workflow documentation and comments

### 5. Advanced Canvas Features

#### Viewport Management
```typescript
// Viewport controller
class ViewportController {
  private viewport: Viewport;
  
  constructor(app: Application) {
    this.viewport = new Viewport({
      screenWidth: app.view.width,
      screenHeight: app.view.height,
      worldWidth: 10000,
      worldHeight: 10000,
      interaction: app.renderer.plugins.interaction
    });
    
    this.setupViewportFeatures();
  }
  
  private setupViewportFeatures() {
    this.viewport
      .drag()
      .pinch()
      .wheel()
      .decelerate()
      .clampZoom({ minScale: 0.1, maxScale: 3 });
  }
}
```

#### Minimap Navigation
- **Viewport Overview**: Bird's-eye view of entire workflow
- **Navigation Control**: Click-to-navigate and drag viewport
- **Visible Area Indicator**: Current viewport boundaries
- **Zoom Controls**: Integrated zoom and fit-to-screen options

## State Management

### Zustand Store Architecture

```typescript
// Main workflow store
interface WorkflowStore {
  // Workflow data
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedItems: string[];
  
  // UI state
  canvasMode: 'select' | 'pan' | 'connect';
  zoomLevel: number;
  viewportPosition: { x: number; y: number };
  
  // Collaboration state
  collaborators: Collaborator[];
  currentUser: User;
  
  // Actions
  addNode: (node: WorkflowNode) => void;
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: WorkflowEdge) => void;
  deleteEdge: (id: string) => void;
  setSelected: (ids: string[]) => void;
}

const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  // Initial state and actions implementation
}));
```

### Performance Optimization

#### Virtualization
```typescript
// Large workflow virtualization
const useVirtualizedNodes = (nodes: WorkflowNode[], viewport: Rectangle) => {
  return useMemo(() => {
    return nodes.filter(node => {
      return rectangleIntersection(node.bounds, viewport);
    });
  }, [nodes, viewport]);
};
```

#### Memoization
```typescript
// React performance optimizations
const WorkflowCanvas = memo(({ nodes, edges }: WorkflowCanvasProps) => {
  const memoizedNodes = useMemo(() => 
    nodes.map(node => <WorkflowNode key={node.id} {...node} />), 
    [nodes]
  );
  
  const memoizedEdges = useMemo(() =>
    edges.map(edge => <WorkflowEdge key={edge.id} {...edge} />),
    [edges]
  );
  
  return (
    <Stage>
      {memoizedNodes}
      {memoizedEdges}
    </Stage>
  );
});
```

## API Integration

### Workflow Contracts
```typescript
// Shared type definitions
import { 
  WorkflowDefinition, 
  WorkflowNode, 
  WorkflowEdge,
  ExecutionResult 
} from '@auterity/workflow-contracts';

// API client configuration
const apiClient = createApiClient({
  baseURL: 'http://localhost:5055/api',
  timeout: 30000,
  retries: 3
});

// Workflow operations
export const workflowApi = {
  async saveWorkflow(workflow: WorkflowDefinition): Promise<void> {
    return apiClient.post('/workflows', workflow);
  },
  
  async loadWorkflow(id: string): Promise<WorkflowDefinition> {
    return apiClient.get(`/workflows/${id}`);
  },
  
  async executeWorkflow(id: string, inputs: Record<string, any>): Promise<ExecutionResult> {
    return apiClient.post(`/workflows/${id}/execute`, { inputs });
  }
};
```

### Real-Time Updates
```typescript
// WebSocket integration for live execution monitoring
class WorkflowExecutionMonitor {
  private ws: WebSocket;
  private listeners: Map<string, (status: ExecutionStatus) => void> = new Map();
  
  constructor() {
    this.ws = new WebSocket('ws://localhost:5055/ws/executions');
    this.setupEventHandlers();
  }
  
  subscribeToExecution(executionId: string, callback: (status: ExecutionStatus) => void) {
    this.listeners.set(executionId, callback);
    this.ws.send(JSON.stringify({ type: 'subscribe', executionId }));
  }
  
  private setupEventHandlers() {
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const callback = this.listeners.get(data.executionId);
      if (callback) {
        callback(data.status);
      }
    };
  }
}
```

## User Interface Components

### Node Types Implementation

```typescript
// Base node component
interface NodeComponentProps {
  node: WorkflowNode;
  selected: boolean;
  onUpdate: (updates: Partial<WorkflowNode>) => void;
  onConnect: (sourcePort: string, targetPort: string) => void;
}

const BaseNodeComponent = ({ node, selected, onUpdate }: NodeComponentProps) => {
  return (
    <div 
      className={`node-component ${selected ? 'selected' : ''}`}
      style={{ 
        transform: `translate(${node.position.x}px, ${node.position.y}px)` 
      }}
    >
      <NodeHeader title={node.title} type={node.type} />
      <NodePorts inputs={node.inputs} outputs={node.outputs} />
      <NodeContent config={node.config} onUpdate={onUpdate} />
    </div>
  );
};

// Specialized node types
const AIProcessingNode = (props: NodeComponentProps) => (
  <BaseNodeComponent {...props}>
    <AIModelSelector value={props.node.config.model} />
    <PromptEditor value={props.node.config.prompt} />
    <ParameterControls parameters={props.node.config.parameters} />
  </BaseNodeComponent>
);
```

### Toolbar & Panels

```typescript
// Toolbar component with node palette
const WorkflowToolbar = () => {
  const nodeTypes = [
    { type: 'ai-text', label: 'AI Text Processing', icon: Brain },
    { type: 'decision', label: 'Decision Logic', icon: GitBranch },
    { type: 'data-transform', label: 'Data Transform', icon: Transform },
    { type: 'integration', label: 'API Integration', icon: Link }
  ];
  
  return (
    <div className="workflow-toolbar">
      {nodeTypes.map(nodeType => (
        <ToolbarButton
          key={nodeType.type}
          label={nodeType.label}
          icon={nodeType.icon}
          onDragStart={() => startNodeDrag(nodeType.type)}
        />
      ))}
    </div>
  );
};

// Properties panel for selected nodes
const PropertiesPanel = ({ selectedNode }: { selectedNode: WorkflowNode | null }) => {
  if (!selectedNode) return <EmptyState />;
  
  return (
    <div className="properties-panel">
      <NodePropertyEditor node={selectedNode} />
      <NodeDocumentation nodeType={selectedNode.type} />
      <NodeValidation node={selectedNode} />
    </div>
  );
};
```

## Testing Strategy

### Unit Tests
```typescript
// Component testing with Vitest
import { render, fireEvent } from '@testing-library/react';
import { WorkflowCanvas } from '../WorkflowCanvas';

describe('WorkflowCanvas', () => {
  test('renders nodes and edges correctly', () => {
    const mockWorkflow = {
      nodes: [{ id: '1', type: 'ai-text', position: { x: 100, y: 100 } }],
      edges: []
    };
    
    const { getByTestId } = render(
      <WorkflowCanvas workflow={mockWorkflow} />
    );
    
    expect(getByTestId('workflow-node-1')).toBeInTheDocument();
  });
  
  test('handles node selection', async () => {
    const onSelectionChange = vi.fn();
    const { getByTestId } = render(
      <WorkflowCanvas 
        workflow={mockWorkflow} 
        onSelectionChange={onSelectionChange}
      />
    );
    
    fireEvent.click(getByTestId('workflow-node-1'));
    expect(onSelectionChange).toHaveBeenCalledWith(['1']);
  });
});
```

### E2E Tests
```typescript
// Playwright end-to-end tests
import { test, expect } from '@playwright/test';

test.describe('Workflow Studio', () => {
  test('can create a new workflow', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Create new workflow
    await page.click('[data-testid="new-workflow-button"]');
    await page.fill('[data-testid="workflow-name-input"]', 'Test Workflow');
    await page.click('[data-testid="create-button"]');
    
    // Add AI processing node
    await page.dragAndDrop(
      '[data-testid="ai-text-node-button"]',
      '[data-testid="workflow-canvas"]'
    );
    
    // Verify node was added
    await expect(page.locator('[data-testid^="workflow-node-"]')).toBeVisible();
  });
  
  test('supports real-time collaboration', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Both users join the same workflow
    await page1.goto('http://localhost:5173/workflow/test-collaboration');
    await page2.goto('http://localhost:5173/workflow/test-collaboration');
    
    // User 1 adds a node
    await page1.dragAndDrop(
      '[data-testid="ai-text-node-button"]',
      '[data-testid="workflow-canvas"]'
    );
    
    // User 2 should see the node appear
    await expect(page2.locator('[data-testid^="workflow-node-"]')).toBeVisible();
  });
});
```

### Performance Tests
```typescript
// Performance benchmarking
import { performance } from 'perf_hooks';

describe('Canvas Performance', () => {
  test('handles large workflows efficiently', async () => {
    const largeWorkflow = generateWorkflowWithNodes(1000);
    
    const startTime = performance.now();
    render(<WorkflowCanvas workflow={largeWorkflow} />);
    const renderTime = performance.now() - startTime;
    
    expect(renderTime).toBeLessThan(100); // 100ms render time threshold
  });
  
  test('maintains 60fps during interaction', async () => {
    const { getByTestId } = render(<WorkflowCanvas workflow={complexWorkflow} />);
    const canvas = getByTestId('workflow-canvas');
    
    const frameRates: number[] = [];
    const startTracking = performance.now();
    
    // Simulate pan and zoom interactions
    fireEvent.wheel(canvas, { deltaY: -100 });
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(canvas, { clientX: 200, clientY: 200 });
    
    const averageFrameRate = frameRates.reduce((a, b) => a + b) / frameRates.length;
    expect(averageFrameRate).toBeGreaterThan(55); // Near 60fps threshold
  });
});
```

## Build & Deployment

### Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils')
    }
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          pixi: ['pixi.js'],
          collaboration: ['yjs', 'y-webrtc'],
          ai: ['@ai-sdk/openai', '@ai-sdk/anthropic']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['@auterity/workflow-contracts']
  }
});
```

### Docker Configuration
```dockerfile
# Multi-stage build for production
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Performance Monitoring

### Metrics Collection
```typescript
// Performance monitoring setup
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Web Vitals monitoring
function sendToAnalytics(metric: any) {
  console.log(metric);
  // Send to your analytics service
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);

// Custom metrics for workflow operations
export const workflowMetrics = {
  trackCanvasRender: (nodeCount: number, renderTime: number) => {
    console.log(`Canvas rendered ${nodeCount} nodes in ${renderTime}ms`);
  },
  
  trackWorkflowSave: (workflow: WorkflowDefinition, saveTime: number) => {
    console.log(`Workflow saved in ${saveTime}ms`);
  },
  
  trackCollaborationLatency: (operationType: string, latency: number) => {
    console.log(`${operationType} collaboration latency: ${latency}ms`);
  }
};
```

### Error Tracking
```typescript
// Error boundary with reporting
class WorkflowErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Workflow Studio Error:', error, errorInfo);
    
    // Report to error tracking service
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: errorInfo
        }
      });
    }
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => this.setState({ hasError: false })} />;
    }
    
    return this.props.children;
  }
}
```

---

*This component documentation provides comprehensive coverage of the Workflow Studio visual designer. Updates should accompany feature additions, performance improvements, or architectural changes.*
