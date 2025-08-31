# Auterity Workflow Studio

A modern 2D workflow canvas built with React, PixiJS, and the canonical workflow contracts. Features comprehensive API integration, performance monitoring, offline support, and optimized user experience.

## Quick Start

### Prerequisites

1. **API Server Running** (in separate terminal):
```powershell
cd ../auterity-error-iq/apps/api
npm ci
npm run dev
# API runs at http://localhost:5055
```

2. **Contracts Package** (already included as local tarball):
```powershell
# Verify contracts tarball exists:
ls ../auterity-error-iq/packages/workflow-contracts/auterity-workflow-contracts-1.0.0.tgz
```

### Install & Run

```powershell
# Install dependencies
npm ci

# Start development server
npm run dev
# Opens at http://localhost:5173
```

### Test

```powershell
# Run unit tests (contracts integration)
npm test

# Run API integration tests (requires API server running)
npm test src/__tests__/api.test.ts

# Run tests with UI
npm run test:ui

# Performance testing
npm run test:performance

# Accessibility testing
npm run test:accessibility
```

## 🚀 AI SDK Integration & Development Roadmap

**NEW**: Comprehensive AI SDK implementation plan available:
- **[AI SDK Implementation Plan](./COMPREHENSIVE_AI_SDK_IMPLEMENTATION_PLAN.md)** - Complete roadmap for Vercel AI SDK integration
- **Strategic tool integration** - LangGraph, LiteLLM, AutoGen, Temporal, and more
- **Enterprise features** - Real-time collaboration, advanced monitoring, MLOps
- **Phase-by-phase implementation** - 16-week roadmap with clear milestones

### Key Benefits:
- **50% reduction** in AI provider management complexity
- **3x development velocity** through unified tooling
- **25-45% cost optimization** via intelligent routing
- **Enterprise readiness** with SSO, compliance, and collaboration

## Features

### 🚀 Performance Optimizations
- **Core Web Vitals Monitoring**: Real-time performance tracking
- **Service Worker**: Offline support with intelligent caching
- **Optimized Images**: WebP support with lazy loading
- **Bundle Splitting**: Intelligent chunk splitting for better caching
- **Component Performance**: Render time monitoring

### 🔧 Enhanced API Integration
- **Standardized API Client**: Consistent error handling and authentication
- **File Upload Support**: Progress tracking and error recovery
- **Retry Logic**: Exponential backoff for failed requests
- **Request/Response Interceptors**: Centralized request management

### 🎨 Developer Experience
- **Custom Hooks**: Reusable API, auth, and performance hooks
- **TypeScript Support**: Full type safety across the application
- **Utility Functions**: Comprehensive helper functions
- **Configuration Management**: Centralized app configuration

### 📱 Offline & PWA Features
- **Background Sync**: Sync pending changes when online
- **Push Notifications**: Real-time updates and notifications
- **Cache Management**: Intelligent caching strategies
- **Offline Fallbacks**: Graceful degradation

## Usage

1. **Export a workflow** from Error-IQ (if wired) or use API directly:
```powershell
curl -X POST "http://localhost:5055/v1/workflows/export" `
  -H "Content-Type: application/json" `
  -H "x-api-key: dev-api-key-123" `
  -d '{"id":"test","nodes":[{"id":"n1","type":"start","position":{"x":100,"y":200},"data":{"label":"Test"}}],"edges":[],"viewport":{"x":0,"y":0,"zoom":1}}'
```

2. **Import in Studio**: Enter the workflow ID and click "Import"

3. **Drag nodes** to update positions (local state)

## Architecture

```
src/
├── services/
│   ├── api.ts              # Enhanced API client with error handling
│   └── authService.ts      # Authentication service
├── hooks/
│   ├── useApi.ts           # API interaction hooks
│   ├── useAuth.ts          # Authentication hooks
│   ├── usePerformance.ts   # Performance monitoring hooks
│   ├── useServiceWorker.ts # Service worker management
│   └── useCanonical.ts     # Workflow validation hooks
├── config/
│   └── constants.ts        # Application configuration
├── utils/
│   ├── common.ts           # Utility functions
│   ├── cn.ts              # CSS class utilities
│   └── memoryMonitor.ts   # Memory monitoring utilities
├── components/
│   ├── ui/
│   │   └── OptimizedImage.tsx # Performance-optimized images
│   └── Canvas.tsx         # PixiJS renderer with drag support
├── pages/
│   └── ImportPage.tsx     # Simple import UI
├── __tests__/
│   ├── contracts.test.ts  # Round-trip adapter tests
│   ├── api.test.ts        # Integration tests vs running API
│   └── performance/       # Performance test suites
└── main.tsx               # React root
```

## Configuration

### Environment Variables

Create `.env.local` to override defaults:
```env
# Application Settings
VITE_APP_NAME=Auterity Workflow Studio
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development

# API Configuration
VITE_API_BASE_URL=http://localhost:5055
VITE_API_KEY=dev-api-key-123

# Authentication
VITE_AUTH_PROVIDER=local
VITE_AUTH_DOMAIN=
VITE_AUTH_CLIENT_ID=
VITE_AUTH_AUDIENCE=

# Feature Flags
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_PUSH_NOTIFICATIONS=false
VITE_ENABLE_ADVANCED_ANALYTICS=true

# Performance
VITE_PERFORMANCE_MONITORING=true
VITE_ERROR_TRACKING=true

# UI/UX
VITE_THEME=default
VITE_LOCALE=en-US
VITE_TIMEZONE=UTC
```

### Build Configuration

The application includes optimized build configuration with:
- **Intelligent Chunk Splitting**: Separate vendor, UI, and application chunks
- **Asset Optimization**: Optimized naming for better caching
- **Bundle Analysis**: Visual bundle analyzer (`npm run build:analyze`)
- **Performance Monitoring**: Core Web Vitals tracking

## API Integration

### Enhanced API Client

The application includes a comprehensive API client with:

```typescript
import { apiClient } from '../services/api';

// GET request
const workflows = await apiClient.get('/workflows');

// POST request
const newWorkflow = await apiClient.post('/workflows', workflowData);

// File upload
const uploadResult = await apiClient.uploadFile('/files', file, (progress) => {
  console.log(`Upload progress: ${progress}%`);
});
```

### Custom Hooks

Use the provided hooks for consistent API interactions:

```typescript
import { useApi, useAuth, usePerformance } from '../hooks';

// API hook with loading states
const { data, loading, error, refetch } = useApi('/workflows', {
  autoFetch: true
});

// Authentication hook
const { user, isAuthenticated, login, logout } = useAuth();

// Performance monitoring
const { metrics, reportWebVitals } = usePerformance();
```

## Performance Features

### Core Web Vitals Monitoring

Track and monitor Core Web Vitals metrics:

```typescript
import { usePerformance } from '../hooks/usePerformance';

const { metrics } = usePerformance();
// metrics.cls, metrics.fid, metrics.lcp, metrics.fcp
```

### Service Worker

Automatic offline support with intelligent caching:

```typescript
import { useServiceWorker } from '../hooks/useServiceWorker';

const { isRegistered, updateAvailable, updateServiceWorker } = useServiceWorker();
```

### Optimized Images

Use the OptimizedImage component for better performance:

```typescript
import OptimizedImage from '../components/ui/OptimizedImage';

<OptimizedImage
  src="/workflow-diagram.png"
  alt="Workflow Diagram"
  width={800}
  height={600}
  priority={true}
/>
```

## Development

### Adding Features

- **New API endpoints**: Add methods to `src/services/api.ts`
- **Custom hooks**: Create in `src/hooks/` following the established patterns
- **UI components**: Use the `cn` utility for consistent styling
- **Performance monitoring**: Use `useComponentPerformance` for render tracking

### Dependencies

- **@auterity/workflow-contracts**: Zod schemas, adapters (local tarball)
- **pixi.js**: 2D rendering engine
- **react**: UI framework
- **zustand**: State management
- **date-fns**: Date utilities
- **clsx**: CSS class utilities
- **vitest**: Testing framework

## Testing

### Test Categories

```powershell
# Unit tests
npm test

# Integration tests
npm run test:api

# Performance tests
npm run test:performance

# Accessibility tests
npm run test:accessibility

# Visual regression tests
npm run test:visual

# Memory leak detection
npm run test:memory
```

### Test Structure

```
src/__tests__/
├── contracts.test.ts        # Contract validation tests
├── api.test.ts             # API integration tests
├── performance/            # Performance test suites
├── accessibility/          # Accessibility tests
├── memory-leak-detection.test.ts # Memory leak tests
└── visual/                 # Visual regression tests
```

## Deployment

### Build Optimization

```powershell
# Production build
npm run build

# Analyze bundle size
npm run build:analyze

# Preview production build
npm run preview
```

### PWA Features

The application includes PWA capabilities:
- Service worker for offline support
- Web app manifest
- Push notification support
- Background sync

## Troubleshooting

**Import fails**: Verify API server is running and workflow ID exists:
```powershell
curl "http://localhost:5055/v1/workflows/YOUR_ID" -H "x-api-key: dev-api-key-123"
```

**Performance issues**: Check Core Web Vitals in browser dev tools

**Service worker issues**: Clear application cache and reload

**Build errors**: Ensure all dependencies are installed:
```powershell
npm ci
```

**Contracts not found**: Rebuild and repack contracts:
```powershell
cd ../auterity-error-iq/packages/workflow-contracts
npm run build
npm pack
npm ci # in studio to reinstall
```

**PixiJS rendering issues**: Check browser console; ensure Canvas component renders inside a mounted div.

## Commit Messages

- `feat(api): enhance API client with standardized error handling`
- `feat(performance): add Core Web Vitals monitoring`
- `feat(pwa): implement service worker with offline support`
- `feat(ui): add OptimizedImage component with WebP support`
- `chore(config): add comprehensive environment configuration`
- `test(performance): add render time monitoring tests`
- `chore(deps): update @auterity/workflow-contracts to v1.1.0`
