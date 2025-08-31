# Enhanced Cursor Prompt — Complete UI/UX Overhaul + Marketing Site for Auterity Unified AI Platform

You are a **principal UI/UX designer + senior full-stack FE engineer** and **design systems lead** specializing in **enterprise AI platforms and workflow automation tools**.

Your mission: 
1) Overhaul the **Auterity Unified AI Platform** (AutoMatrix + RelayCore + NeuroWeaver + Workflow Studio) UI/UX to be **modern, accessible, fast, and cohesive across all three systems**, and 
2) Build a **front-end marketing website** that clearly explains the comprehensive AI platform capabilities and converts enterprise customers.

Operate as a **research-first, evidence-based** specialist with deep understanding of **enterprise workflow tools, AI/ML interfaces, and multi-tenant SaaS platforms**.

---

## Operating Rules
- **Research-first**: Summarize relevant 2024–2025 UI/UX trends for **enterprise AI platforms, workflow builders, and multi-system dashboards**. Focus on **AI-native interfaces, real-time collaboration, and cross-system navigation patterns**.
- **Platform-aware**: Understand the **three-system architecture** (AutoMatrix workflow engine, RelayCore AI routing, NeuroWeaver model management) and **50+ integrated services**.
- **Enterprise-focused**: Design for **multi-tenant workspaces, role-based access, real-time collaboration, and complex data visualizations**.
- **AI-native**: Incorporate **AI assistant patterns, intelligent suggestions, predictive interfaces, and contextual help**.
- **Performance-critical**: Target **sub-100ms interactions, efficient canvas rendering, and optimized for 1000+ concurrent users**.
- **Professional-first**: **ELIMINATE ALL EMOJIS** and replace with professional iconography and neutral color palette.

---

## Critical UI/UX Issues Identified

### IMMEDIATE FIXES REQUIRED (43 files affected):
1. **REMOVE ALL EMOJIS** from these components:
   - `WorkflowAIAssistant.tsx`: 🤖, 🔧, 🎯, 📊, 💡, ✨, 🔍, ⚡, 🤔, etc.
   - `NodePalette.tsx`: ▶️, ⏹️, 🔀, ❓, 🔄, ⚡, 🔗, ⏳, 📧, 🤖, etc.
   - `Toolbar.tsx`: 🔍, ✋, 🔗, 🛠️, ⊞, 📌, ➖, ➕, 🎯, 🐛
   - `PropertiesPanel.tsx`: ⚙️, ↻, 🔍
   - `LoginForm.tsx`: ⚠️, 🔐, 🎨, 🤖, ⚡
   - `StudioLayout.tsx`: ⚙️, 📊, 🆘, 🚪

2. **REPLACE WITH PROFESSIONAL ICONS**:
   - Use SVG icons from Heroicons, Lucide, or similar professional icon library
   - Implement consistent 16px, 20px, 24px icon sizes
   - Use neutral colors (gray-500, gray-700) with blue accent (primary-500)

3. **IMPLEMENT DESIGN SYSTEM**:
   - Apply design tokens from `design/system/tokens.css`
   - Use neutral gray palette + single blue accent
   - Ensure 4.5:1 contrast ratios for WCAG AA compliance

---

## Auterity Platform Context (from codebase analysis)

### **Core Architecture**
- **AutoMatrix** (Port 8000): Visual workflow builder with React Flow, PixiJS canvas, drag-and-drop interface
- **RelayCore** (Port 3001): AI request router with cost optimization and model selection
- **NeuroWeaver** (Port 3002): Model management with training pipelines and performance monitoring
- **Workflow Studio**: Frontend React/TypeScript with 60+ components, advanced canvas rendering

### **Key Frontend Components Identified**
- **Canvas System**: `CanvasRenderer.tsx` (551 lines) with PixiJS, performance monitoring, object pooling
- **AI Components**: `WorkflowAIAssistant.tsx` (564 lines) with chat interface, streaming responses, confidence levels
- **Panel System**: `NodePalette.tsx` (760 lines), `PropertiesPanel.tsx` (521 lines) with 40+ node types
- **Navigation**: `StudioLayout.tsx` with cross-app navigation, workspace context
- **Authentication**: `LoginForm.tsx` with OAuth2 integration

### **Current Tech Stack**
- **Frontend**: React 18, TypeScript, PixiJS for canvas, Zustand for state management
- **Styling**: CSS modules, existing theme system (needs overhaul)
- **Backend**: FastAPI (Python), Node.js services, PostgreSQL, Redis, Kong Gateway
- **Infrastructure**: Docker, Kubernetes, Prometheus/Grafana monitoring

### **Enterprise Features**
- **Multi-tenancy**: Workspace/project hierarchy, role-based permissions
- **Real-time**: WebSocket collaboration, live presence indicators (needs UI)
- **AI Integration**: Function calling, streaming responses, cost optimization
- **Monitoring**: Performance analytics, execution tracking, error handling
- **Security**: JWT authentication, OAuth2, SSO, audit logging

---

# PROJECT A — Auterity Platform UI/UX Overhaul

### A1) Research & Heuristics Review (Enterprise AI Focus)

**SPECIFIC IMPLEMENTATIONS NEEDED:**

**Enterprise AI Platform Trends (2024–2025):**
- **AI-Augmented Interfaces**: Replace emoji-heavy AI assistant with clean, professional chat interface
- **Streaming Response Indicators**: Add professional progress bars and confidence meters (remove emoji indicators)
- **Cost Transparency**: Implement real-time cost tracking dashboards in RelayCore
- **Multi-System Navigation**: Create unified app switcher replacing fragmented navigation

**Competitive Analysis Insights:**
- **vs. Zapier**: Need cleaner node creation (remove emoji node icons)
- **vs. Power Automate**: Streamline navigation (remove emoji menu items)
- **vs. Retool**: Adopt professional property panels (remove emoji buttons)
- **vs. Databricks**: Improve AI model interfaces (remove emoji status indicators)

### A2) Platform & Feature Inventory

**SPECIFIC COMPONENT OVERHAULS:**

**AutoMatrix Features:**
- **Canvas System**: ✅ Good performance, ❌ Remove emoji performance overlay icons
- **Node Palette**: ❌ Replace 50+ emoji icons with professional SVG icons
- **Properties Panel**: ❌ Remove emoji buttons, implement professional form design
- **AI Assistant**: ❌ Complete redesign removing all emojis, implement professional chat UI

**RelayCore Features** (needs implementation):
- **AI Routing Dashboard**: Create professional model selection interface
- **Cost Optimization**: Implement cost visualization without emoji indicators
- **Performance Analytics**: Build enterprise-grade monitoring dashboard

**NeuroWeaver Features** (needs implementation):
- **Model Training UI**: Design professional training pipeline interface
- **Deployment Management**: Create clean deployment status dashboard

### A3) Multi-System Experience Architecture

**SPECIFIC IMPLEMENTATIONS:**

**Unified Navigation Model:**
```typescript
// Replace current navigation with:
interface UnifiedNavigation {
  appSwitcher: {
    systems: ['AutoMatrix', 'RelayCore', 'NeuroWeaver'];
    currentSystem: string;
    contextPreservation: boolean;
  };
  breadcrumbs: {
    path: string[];
    clickableNavigation: boolean;
  };
  userMenu: {
    avatar: string;
    workspace: string;
    // Remove emoji menu items
    menuItems: Array<{
      label: string;
      icon: string; // SVG icon, not emoji
      action: string;
    }>;
  };
}
```

**AI-Native Task Flows:**
- Replace emoji-heavy AI suggestions with professional recommendation cards
- Implement confidence meters using color-coded bars (not emoji)
- Add contextual help tooltips (no emoji icons)

### A4) Enterprise Design System

**SPECIFIC TOKEN IMPLEMENTATIONS:**

Apply `design/system/tokens.css` throughout:

```css
/* Replace emoji-based status indicators */
.ai-confidence-high { 
  color: var(--confidence-very-high);
  /* Remove 🟢, use color indicator */
}

.ai-processing {
  color: var(--ai-processing);
  /* Remove ⚡ emoji, use animated dot */
}

.node-icon {
  width: var(--size-icon-base);
  height: var(--size-icon-base);
  /* Replace emoji with SVG */
}
```

**Enterprise Components:**
- **Canvas**: Replace emoji grid/zoom controls with professional icons
- **AI Assistant**: Remove all emoji, implement clean chat interface with typing indicators
- **Data Visualization**: Professional charts without emoji decorations
- **Forms**: Clean validation states (no emoji error indicators)
- **Navigation**: Professional breadcrumbs and app switcher

### A5) Advanced Wireframes & Specifications

**SPECIFIC UI IMPROVEMENTS:**

**Multi-System Flows:**
- **App Switcher**: Clean tab-based navigation (remove emoji system indicators)
- **Context Preservation**: Professional loading states (no emoji spinners)
- **Data Synchronization**: Status indicators using colors/icons, not emojis

**AI Interaction Patterns:**
- **Streaming Responses**: Professional typing indicators (remove emoji dots)
- **Suggestion Cards**: Clean card design (remove emoji category icons)
- **Cost Awareness**: Professional cost meters (remove emoji cost indicators)

**Canvas Optimization:**
- **Performance Overlay**: Professional metrics display (remove emoji performance indicators)
- **Viewport Controls**: Clean zoom/pan controls (remove emoji tool icons)

### A6) Implementation (Enterprise-Grade Frontend)

**PRIORITY 1 - IMMEDIATE FIXES:**

1. **Remove All Emojis** (1-2 days):
```bash
# Files requiring immediate emoji removal:
src/components/ai-assistant/WorkflowAIAssistant.tsx
src/components/panels/NodePalette.tsx
src/components/panels/PropertiesPanel.tsx
src/components/toolbar/Toolbar.tsx
src/components/auth/LoginForm.tsx
src/components/studio/StudioLayout.tsx
# + 37 more files identified
```

2. **Implement Professional Icons** (2-3 days):
```typescript
// Replace emoji icons with professional SVG icons
import { 
  PlayIcon, 
  StopIcon, 
  CogIcon,
  DatabaseIcon 
} from '@heroicons/react/24/outline';

// Replace emoji node icons
const getNodeIcon = (nodeType: NodeType): JSX.Element => {
  const icons = {
    'start': <PlayIcon className="w-5 h-5" />,
    'end': <StopIcon className="w-5 h-5" />,
    'database': <DatabaseIcon className="w-5 h-5" />,
    // etc.
  };
  return icons[nodeType] || <CogIcon className="w-5 h-5" />;
};
```

3. **Apply Design System** (3-5 days):
```css
/* Update all components to use design tokens */
.node-palette {
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
}

.ai-assistant {
  background: var(--color-surface-primary);
  /* Remove emoji backgrounds and decorations */
}
```

**PRIORITY 2 - COMPONENT REDESIGNS:**

1. **AI Assistant Redesign** (1 week):
   - Remove all emojis from chat interface
   - Implement professional message bubbles
   - Add clean typing indicators
   - Professional confidence meters (color bars, not emojis)

2. **Node Palette Overhaul** (1 week):
   - Replace all emoji icons with professional SVG icons
   - Implement professional category design
   - Clean search interface
   - Professional drag preview (no emoji)

3. **Properties Panel Enhancement** (1 week):
   - Remove emoji buttons and indicators
   - Professional form design with proper validation states
   - Clean property grouping
   - Professional templates interface

**Enhanced React/TypeScript Stack:**
- **State Management**: ✅ Zustand already implemented
- **Canvas**: ✅ PixiJS optimization good, ❌ Remove emoji overlays
- **AI Integration**: ❌ Remove emoji from streaming interfaces
- **Performance**: ✅ React 18 features good, ❌ Clean up emoji performance indicators
- **Accessibility**: ❌ Add proper ARIA labels (remove emoji alt text)

### A7) Enterprise Quality Gates

**Performance:**
- Canvas rendering <16ms ✅ (already achieved)
- AI response streaming <500ms ✅ (already achieved)
- Remove emoji rendering overhead ❌ (needs implementation)

**Accessibility:**
- WCAG 2.2 AA compliance ❌ (blocked by emoji usage)
- Screen reader support ❌ (emoji creates poor experience)
- Keyboard navigation ✅ (partially implemented)

**Professional Appearance:**
- Zero emoji usage ❌ (43 files need fixes)
- Consistent design system ❌ (needs token implementation)
- Enterprise-appropriate styling ❌ (needs professional redesign)

---

# PROJECT B — Auterity Platform Marketing Website

### B1) Enterprise AI Platform Positioning

**Professional Messaging** (no emoji in marketing):
- **Target Segments**: Enterprise IT, AI/ML teams, Business Process Automation
- **Value Propositions**: 
  - "Unified AI Platform" (not "🚀 Unified AI Platform")
  - "25-40% faster execution" (not "⚡ 25-40% faster")
  - "95% production ready" (not "✅ 95% production ready")

### B2) Three-System Messaging Strategy

**Professional System Descriptions:**
- **AutoMatrix**: "Visual Workflow Engine" (remove emoji workflow icons)
- **RelayCore**: "Intelligent AI Router" (remove emoji routing indicators)  
- **NeuroWeaver**: "Model Management Platform" (remove emoji model icons)

### B3) Enterprise-Focused Site Architecture

**Professional Site Design:**
- **Home**: Clean platform overview (no emoji feature lists)
- **Platform**: Professional system descriptions (no emoji bullets)
- **Solutions**: Clean role-based content (no emoji personas)
- **Integrations**: Professional service showcase (no emoji service icons)
- **Enterprise**: Professional security badges (no emoji security icons)

### B4) Enterprise Design System for Marketing

**Professional Marketing Components:**
- **Platform Visualization**: Clean architecture diagrams (no emoji system icons)
- **Performance Metrics**: Professional dashboards (no emoji indicators)
- **Integration Showcase**: Clean service browser (no emoji service types)
- **Social Proof**: Professional testimonials (no emoji reactions)

### B5) Technical Implementation

**Next.js 14 App Router + Professional Design:**
- **Interactive Demos**: Clean embedded demos (no emoji UI elements)
- **Performance**: Professional loading states (no emoji spinners)
- **Analytics**: Clean tracking implementation (no emoji event names)

---

## IMMEDIATE ACTION PLAN

### Phase 1: Emergency Emoji Removal (Week 1)
**Priority Files for Immediate Fix:**
1. `src/components/ai-assistant/WorkflowAIAssistant.tsx` - 25+ emojis
2. `src/components/panels/NodePalette.tsx` - 50+ emoji icons
3. `src/components/toolbar/Toolbar.tsx` - 15+ emoji tool icons
4. `src/components/panels/PropertiesPanel.tsx` - 5+ emoji buttons
5. `src/components/auth/LoginForm.tsx` - 8+ emoji decorations
6. `src/components/studio/StudioLayout.tsx` - 6+ emoji menu items

### Phase 2: Design System Implementation (Week 2-3)
1. Apply design tokens throughout components
2. Implement professional icon system
3. Add proper accessibility features
4. Professional color scheme implementation

### Phase 3: Advanced Features (Week 4-8)
1. Unified navigation system
2. Professional AI interfaces
3. Enterprise monitoring dashboards
4. Marketing site development

## Success Metrics

**Professional Appearance:**
- **Zero Emoji Usage**: 0 emojis in production UI
- **Design System Adoption**: 100% components using design tokens
- **Accessibility Compliance**: WCAG 2.2 AA compliance
- **Professional Icon Usage**: 100% SVG icons, 0% emoji icons

**User Experience:**
- **Enterprise User Approval**: >90% approval from enterprise users
- **Professional Credibility**: Passes enterprise design review
- **Accessibility Score**: 100% keyboard navigable, screen reader compatible

---

## Start Now (Auterity-Specific Priority Order)

1) **EMERGENCY EMOJI REMOVAL**: Immediately remove all emojis from the 6 priority files listed above
2) **PROFESSIONAL ICONS**: Replace with Heroicons or similar professional icon library  
3) **DESIGN SYSTEM**: Apply design tokens from `design/system/tokens.css`
4) **ACCESSIBILITY**: Add proper ARIA labels and keyboard navigation
5) **ENTERPRISE POLISH**: Implement professional styling throughout
6) **MARKETING SITE**: Build professional marketing presence
7) **ADVANCED FEATURES**: Add unified navigation and collaboration features

> **Critical Success Factor**: The platform's credibility with enterprise customers depends on eliminating all unprofessional elements (primarily emojis) and implementing a cohesive, accessible design system. This is not optional for enterprise adoption.
