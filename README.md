# Auterity Workflow Studio

A modern 2D workflow canvas built with React, PixiJS, and the canonical workflow contracts.

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
```

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
├── services/api.ts          # API client (GET/POST/PATCH workflows)
├── hooks/useCanonical.ts    # Load & validate with WorkflowSchema
├── components/Canvas.tsx    # PixiJS renderer with drag support
├── pages/ImportPage.tsx     # Simple import UI
├── __tests__/
│   ├── contracts.test.ts    # Round-trip adapter tests
│   └── api.test.ts          # Integration tests vs running API
└── main.tsx                 # React root
```

## Development

### Environment Variables

Create `.env.local` to override defaults:
```env
VITE_API_BASE=http://localhost:5055
VITE_API_KEY=dev-api-key-123
```

### Adding Features

- **New canvas interactions**: Extend `src/components/Canvas.tsx`
- **API operations**: Add to `src/services/api.ts`
- **Validation**: Import schemas from `@auterity/workflow-contracts`

### Dependencies

- **@auterity/workflow-contracts**: Zod schemas, adapters (local tarball)
- **pixi.js**: 2D rendering engine
- **react**: UI framework
- **vitest**: Testing framework

## Next Steps

1. **PATCH on drag**: Send node position updates to API with ETag
2. **Edge rendering**: Add PixiJS lines between nodes
3. **Node types**: Different visual styles per node.type
4. **Zoom/pan**: Canvas viewport controls
5. **Real-time**: WebSocket updates from API

## Troubleshooting

**Import fails**: Verify API server is running and workflow ID exists:
```powershell
curl "http://localhost:5055/v1/workflows/YOUR_ID" -H "x-api-key: dev-api-key-123"
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

- `feat(canvas): add node drag and position updates`
- `feat(api): add PATCH support with ETag handling`
- `test(integration): add smoke tests for export/import pipeline`
- `chore(deps): update @auterity/workflow-contracts to v1.1.0`
