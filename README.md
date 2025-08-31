# Auterity Workflow Studio

A modern 2D workflow canvas built with React, PixiJS, and the canonical workflow contracts. Features comprehensive API integration, performance monitoring, offline support, and optimized user experience.

## Quick Start

### Prerequisites

**Node.js 18+** required for development.

### Install & Run

```bash
# Install dependencies
npm ci

# Start development server
npm run dev
# Opens at http://localhost:5173
```

### Test

```bash
# Run unit tests
npm test

# Run tests with UI
npm run test:ui

# Performance testing
npm run test:performance

# Accessibility testing
npm run test:accessibility
```

## 🚀 AI SDK Integration & Development Roadmap

**NEW**: Comprehensive AI SDK implementation plan available:
- **[OPTIMIZED_AI_SDK_IMPLEMENTATION_PLAN.md](./OPTIMIZED_AI_SDK_IMPLEMENTATION_PLAN.md)** - 67% faster implementation leveraging existing scaffolding
- **[AI_SDK_QUICK_START_GUIDE.md](./AI_SDK_QUICK_START_GUIDE.md)** - Get AI responses in < 2 hours using existing components
- **[COMPREHENSIVE_AI_SDK_IMPLEMENTATION_PLAN.md](./COMPREHENSIVE_AI_SDK_IMPLEMENTATION_PLAN.md)** - Complete technical roadmap with all dependencies

### Key Benefits:
- **67% reduction** in implementation time (64 hours saved)
- **85% code reuse** from existing 890-line AI Assistant and services
- **Zero breaking changes** to existing functionality
- **Immediate value** with AI responses in under 2 hours

### What You Get in 2 Hours:
- ✅ **AI-Powered Chat Assistant** - Real-time workflow suggestions
- ✅ **Streaming AI Responses** - Better user experience  
- ✅ **Unified Provider API** - Easy OpenAI/Anthropic switching
- ✅ **Real-time Collaboration** - Google Docs-style editing
- ✅ **AI Template Generation** - Dynamic workflow creation

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
```bash
npm ci
```

**Contracts not available**: Contact repository maintainer for workflow contracts package

**PixiJS rendering issues**: Check browser console; ensure Canvas component renders inside a mounted div.

## Commit Messages

- `feat(api): enhance API client with standardized error handling`
- `feat(performance): add Core Web Vitals monitoring`
- `feat(pwa): implement service worker with offline support`
- `feat(ui): add OptimizedImage component with WebP support`
- `chore(config): add comprehensive environment configuration`
- `test(performance): add render time monitoring tests`
- `chore(deps): update @auterity/workflow-contracts to v1.1.0`
