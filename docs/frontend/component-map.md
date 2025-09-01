# Frontend Component Architecture & Feature Mapping

## Overview

This document provides a comprehensive mapping of Auterity's frontend components to product features, detailing the component architecture, relationships, and implementation patterns. It serves as a bridge between product features and their frontend implementation.

## 🏗️ Component Architecture Overview

### Core Architecture Principles

**Modular Design**
- **Atomic Components**: Small, reusable UI building blocks
- **Composite Components**: Complex components built from atomic ones
- **Feature Modules**: Self-contained feature implementations
- **Shared Libraries**: Cross-cutting concerns and utilities

**State Management**
- **Local State**: Component-level state using React hooks
- **Global State**: Application state using Zustand stores
- **Server State**: API data using React Query
- **Real-time State**: Collaborative features using YJS

**Performance Optimization**
- **Code Splitting**: Route-based and component-based splitting
- **Lazy Loading**: Components loaded on demand
- **Memoization**: Expensive computations cached
- **Virtualization**: Large lists rendered efficiently

---

## 📦 Core Component Library

### Atomic Components (`/components/ui/`)

#### Form Components
```typescript
// Button Component
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

// Input Component
interface InputProps {
  type: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

// Select Component
interface SelectProps {
  options: Array<{value: string, label: string}>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiple?: boolean;
  disabled?: boolean;
}
```

#### Layout Components
```typescript
// Container Component
interface ContainerProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  centerContent?: boolean;
  children: React.ReactNode;
}

// Grid Component
interface GridProps {
  columns: number | {sm: number, md: number, lg: number};
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
  children: React.ReactNode;
}

// Flex Component
interface FlexProps {
  direction?: 'row' | 'column';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  align?: 'start' | 'center' | 'end' | 'stretch';
  wrap?: boolean;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}
```

#### Feedback Components
```typescript
// Alert Component
interface AlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

// Loading Component
interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  overlay?: boolean;
  inline?: boolean;
}

// Toast Component
interface ToastProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
}
```

---

## 🔗 Feature-to-Component Mapping

### 1. Authentication & User Management

#### Login/Register Flow
```
Feature: User Authentication
├── Components:
│   ├── LoginForm (/components/auth/LoginForm)
│   ├── RegisterForm (/components/auth/RegisterForm)
│   ├── ForgotPassword (/components/auth/ForgotPassword)
│   ├── MFASetup (/components/auth/MFASetup)
│   └── SocialLogin (/components/auth/SocialLogin)
├── Pages:
│   ├── /login → LoginPage
│   ├── /register → RegisterPage
│   └── /forgot-password → ForgotPasswordPage
└── State Management:
    ├── authStore (Zustand)
    └── useAuth hook
```

#### User Profile Management
```
Feature: User Profile
├── Components:
│   ├── ProfileEditor (/components/profile/ProfileEditor)
│   ├── AvatarUpload (/components/profile/AvatarUpload)
│   ├── PasswordChange (/components/profile/PasswordChange)
│   └── NotificationSettings (/components/profile/NotificationSettings)
├── Pages:
│   └── /profile → ProfilePage
└── Integration:
    ├── API: /api/users/{id}
    └── Storage: Local storage for preferences
```

### 2. Workflow Studio (High-Performance Canvas)

#### Visual Workflow Builder
```
Feature: Visual Workflow Builder
├── Core Components:
│   ├── WorkflowCanvas (/components/workflow/WorkflowCanvas)
│   ├── NodePalette (/components/workflow/NodePalette)
│   ├── PropertyPanel (/components/workflow/PropertyPanel)
│   └── Toolbar (/components/workflow/Toolbar)
├── Node Components:
│   ├── BaseNode (/components/workflow/nodes/BaseNode)
│   ├── AINode (/components/workflow/nodes/AINode)
│   ├── DataNode (/components/workflow/nodes/DataNode)
│   ├── LogicNode (/components/workflow/nodes/LogicNode)
│   └── IntegrationNode (/components/workflow/nodes/IntegrationNode)
└── Libraries:
    ├── PixiJS for rendering
    ├── YJS for real-time collaboration
    └── D3.js for graph algorithms
```

#### Node Configuration System
```typescript
// Node Configuration Interface
interface NodeConfig {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: Record<string, any>;
  connections: {
    inputs: string[];
    outputs: string[];
  };
  validation: {
    required: string[];
    schema: JSONSchema;
  };
}

// Node Type Definitions
enum NodeType {
  AI_TEXT_ANALYSIS = 'ai_text_analysis',
  EMAIL_SENDER = 'email_sender',
  WEBHOOK_TRIGGER = 'webhook_trigger',
  DATA_TRANSFORM = 'data_transform',
  CONDITIONAL_LOGIC = 'conditional_logic',
  API_INTEGRATION = 'api_integration'
}
```

### 3. AI Processing Interface

#### AI Service Integration
```
Feature: AI Processing
├── Components:
│   ├── AIAssistant (/components/ai/AIAssistant)
│   ├── PromptBuilder (/components/ai/PromptBuilder)
│   ├── ModelSelector (/components/ai/ModelSelector)
│   ├── ResponseViewer (/components/ai/ResponseViewer)
│   └── CostTracker (/components/ai/CostTracker)
├── Services:
│   ├── aiService (/services/ai/aiService)
│   ├── modelManager (/services/ai/modelManager)
│   └── promptLibrary (/services/ai/promptLibrary)
└── Providers:
    ├── OpenAI (/providers/openai)
    ├── Anthropic (/providers/anthropic)
    └── Azure OpenAI (/providers/azure)
```

#### AI Response Processing
```typescript
// AI Processing Pipeline
interface AIProcessingPipeline {
  input: {
    text: string;
    context?: Record<string, any>;
    attachments?: File[];
  };
  processing: {
    model: AIModel;
    temperature: number;
    maxTokens: number;
    promptTemplate: string;
  };
  output: {
    text: string;
    confidence: number;
    metadata: {
      tokensUsed: number;
      processingTime: number;
      cost: number;
    };
  };
}
```

### 4. Real-time Collaboration

#### Collaborative Workspace
```
Feature: Real-time Collaboration
├── Components:
│   ├── CollaborationPanel (/components/collaboration/CollaborationPanel)
│   ├── UserPresence (/components/collaboration/UserPresence)
│   ├── CommentSystem (/components/collaboration/CommentSystem)
│   └── VersionHistory (/components/collaboration/VersionHistory)
├── Libraries:
│   ├── YJS for CRDTs
│   ├── WebRTC for real-time communication
│   └── Socket.IO for signaling
└── State Management:
    ├── collaborationStore (Zustand)
    └── useCollaboration hook
```

#### User Presence System
```typescript
// User Presence Interface
interface UserPresence {
  userId: string;
  username: string;
  avatar?: string;
  cursor: {
    x: number;
    y: number;
    visible: boolean;
  };
  selection: {
    nodeId?: string;
    region?: { x: number; y: number; width: number; height: number };
  };
  lastActivity: Date;
  status: 'online' | 'away' | 'offline';
}
```

### 5. Template Library & Marketplace

#### Template Management
```
Feature: Template Library
├── Components:
│   ├── TemplateBrowser (/components/templates/TemplateBrowser)
│   ├── TemplateCard (/components/templates/TemplateCard)
│   ├── TemplateImporter (/components/templates/TemplateImporter)
│   ├── TemplateExporter (/components/templates/TemplateExporter)
│   └── TemplateEditor (/components/templates/TemplateEditor)
├── Pages:
│   ├── /templates → TemplateLibraryPage
│   ├── /templates/{id} → TemplateDetailPage
│   └── /templates/create → TemplateCreatePage
└── State Management:
    ├── templateStore (Zustand)
    └── useTemplates hook
```

#### Marketplace Features
```typescript
// Template Marketplace Interface
interface TemplateMarketplace {
  templates: Template[];
  categories: TemplateCategory[];
  filters: {
    category?: string;
    tags?: string[];
    author?: string;
    rating?: number;
    price?: 'free' | 'paid';
  };
  sorting: {
    field: 'name' | 'rating' | 'downloads' | 'updated';
    direction: 'asc' | 'desc';
  };
}
```

### 6. Analytics & Monitoring Dashboard

#### Dashboard Components
```
Feature: Analytics Dashboard
├── Components:
│   ├── DashboardLayout (/components/dashboard/DashboardLayout)
│   ├── MetricCard (/components/dashboard/MetricCard)
│   ├── ChartContainer (/components/dashboard/ChartContainer)
│   ├── FilterPanel (/components/dashboard/FilterPanel)
│   └── ExportPanel (/components/dashboard/ExportPanel)
├── Charts:
│   ├── LineChart (/components/charts/LineChart)
│   ├── BarChart (/components/charts/BarChart)
│   ├── PieChart (/components/charts/PieChart)
│   ├── AreaChart (/components/charts/AreaChart)
│   └── GaugeChart (/components/charts/GaugeChart)
└── Libraries:
    ├── Chart.js for rendering
    ├── D3.js for advanced visualizations
    └── date-fns for date manipulation
```

#### Real-time Updates
```typescript
// Real-time Dashboard Interface
interface RealTimeDashboard {
  metrics: {
    [metricName: string]: {
      value: number;
      change: number;
      trend: 'up' | 'down' | 'stable';
      lastUpdated: Date;
    };
  };
  alerts: DashboardAlert[];
  refresh: {
    interval: number; // milliseconds
    lastRefresh: Date;
    nextRefresh: Date;
  };
}
```

---

## 🔧 Component State Management

### Zustand Stores Architecture

#### Global State Structure
```typescript
// Auth Store
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

// Workflow Store
interface WorkflowStore {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  createWorkflow: (data: WorkflowData) => Promise<void>;
  updateWorkflow: (id: string, data: Partial<WorkflowData>) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  addNode: (node: WorkflowNode) => void;
  removeNode: (nodeId: string) => void;
}

// UI Store
interface UIStore {
  theme: 'light' | 'dark' | 'auto';
  sidebar: {
    open: boolean;
    width: number;
  };
  modals: {
    [modalId: string]: boolean;
  };
  notifications: Notification[];
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
}
```

### React Query for Server State

#### API Integration Pattern
```typescript
// Workflow Queries
const useWorkflows = () => {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: () => api.getWorkflows(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

const useWorkflow = (id: string) => {
  return useQuery({
    queryKey: ['workflow', id],
    queryFn: () => api.getWorkflow(id),
    enabled: !!id,
  });
};

// Workflow Mutations
const useCreateWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WorkflowData) => api.createWorkflow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
};
```

---

## 📱 Responsive Design System

### Breakpoint System
```typescript
// Breakpoint Definitions
const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

// Responsive Utility
const useBreakpoint = () => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: width < breakpoints.tablet,
    isTablet: width >= breakpoints.tablet && width < breakpoints.desktop,
    isDesktop: width >= breakpoints.desktop,
    isWide: width >= breakpoints.wide,
    current: width,
  };
};
```

### Responsive Component Patterns
```typescript
// Responsive Grid Component
const ResponsiveGrid = ({ children, columns = { mobile: 1, tablet: 2, desktop: 3 } }) => {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  const getColumns = () => {
    if (isMobile) return columns.mobile;
    if (isTablet) return columns.tablet;
    return columns.desktop;
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${getColumns()}, 1fr)`,
        gap: '1rem',
      }}
    >
      {children}
    </div>
  );
};
```

---

## 🔄 Component Lifecycle & Performance

### Component Performance Optimization

#### Memoization Patterns
```typescript
// Component Memoization
const WorkflowNode = memo(({
  node,
  selected,
  onSelect,
  onDrag,
  onConnect
}) => {
  return (
    <div
      className={`workflow-node ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(node.id)}
      draggable
      onDragStart={(e) => onDrag(e, node)}
    >
      <NodeContent node={node} />
      <ConnectionPoints
        node={node}
        onConnect={onConnect}
      />
    </div>
  );
});

// Callback Memoization
const WorkflowCanvas = ({ workflowId }) => {
  const handleNodeSelect = useCallback((nodeId) => {
    dispatch({ type: 'SELECT_NODE', payload: nodeId });
  }, []);

  const handleNodeDrag = useCallback((e, node) => {
    // Drag logic
  }, []);

  return (
    <Canvas
      onNodeSelect={handleNodeSelect}
      onNodeDrag={handleNodeDrag}
    />
  );
};
```

#### Lazy Loading Strategy
```typescript
// Route-based Code Splitting
const WorkflowRoutes = () => (
  <Routes>
    <Route
      path="/workflows"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <WorkflowList />
        </Suspense>
      }
    />
    <Route
      path="/workflows/:id"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <WorkflowEditor />
        </Suspense>
      }
    />
  </Routes>
);

// Component-based Code Splitting
const HeavyComponent = lazy(() =>
  import('./components/HeavyComponent')
);

const LazyWrapper = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <HeavyComponent />
  </Suspense>
);
```

---

## 🧪 Testing Strategy

### Component Testing Architecture
```typescript
// Component Test Structure
describe('WorkflowNode', () => {
  it('renders correctly', () => {
    const node = createMockNode();
    render(<WorkflowNode node={node} />);
    expect(screen.getByText(node.title)).toBeInTheDocument();
  });

  it('handles selection', () => {
    const mockOnSelect = jest.fn();
    const node = createMockNode();
    render(
      <WorkflowNode
        node={node}
        onSelect={mockOnSelect}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(mockOnSelect).toHaveBeenCalledWith(node.id);
  });

  it('is accessible', () => {
    const node = createMockNode();
    render(<WorkflowNode node={node} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label');
  });
});
```

### Integration Testing
```typescript
// Feature Integration Tests
describe('Workflow Creation Flow', () => {
  it('creates a new workflow successfully', async () => {
    // Mock API responses
    mockApi.onPost('/api/workflows').reply(200, mockWorkflow);

    render(<App />);

    // Navigate to workflow creation
    await userEvent.click(screen.getByText('Create Workflow'));

    // Fill out form
    await userEvent.type(screen.getByLabelText('Name'), 'Test Workflow');
    await userEvent.click(screen.getByText('Create'));

    // Verify success
    await waitFor(() => {
      expect(screen.getByText('Workflow created successfully')).toBeInTheDocument();
    });
  });
});
```

---

## 📋 Component Documentation Standards

### Component Documentation Template
```typescript
/**
 * @component WorkflowNode
 * @description Individual node component in the workflow canvas
 *
 * @param {WorkflowNode} node - The node data object
 * @param {boolean} selected - Whether the node is currently selected
 * @param {function} onSelect - Callback when node is selected
 * @param {function} onDrag - Callback when node is dragged
 * @param {function} onConnect - Callback when connection is made
 *
 * @example
 * <WorkflowNode
 *   node={workflowNode}
 *   selected={true}
 *   onSelect={(id) => console.log('Selected:', id)}
 *   onDrag={(e, node) => handleDrag(e, node)}
 *   onConnect={(sourceId, targetId) => createConnection(sourceId, targetId)}
 * />
 */
```

### Storybook Integration
```typescript
// Component Story
export const Default = {
  args: {
    node: createMockNode(),
    selected: false,
  },
};

export const Selected = {
  args: {
    ...Default.args,
    selected: true,
  },
};

export const WithConnections = {
  args: {
    ...Default.args,
    node: createMockNodeWithConnections(),
  },
};
```

---

*This component architecture and feature mapping document provides the foundation for understanding how Auterity's frontend is structured and how product features map to specific components. It serves as a reference for developers, designers, and stakeholders to understand the implementation details and relationships between features and components.*

*Last Updated: [Current Date] | Version: 1.2.3*
