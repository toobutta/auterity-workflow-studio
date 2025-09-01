# Storybook Documentation & Interactive Component Library

## Overview

This document provides comprehensive guidance for using Storybook as Auterity's interactive component documentation system. Storybook enables developers, designers, and stakeholders to explore, test, and understand UI components in isolation.

## 📚 Storybook Setup & Configuration

### Installation & Setup

#### Basic Storybook Installation
```bash
# Install Storybook
npx storybook@latest init

# Install additional addons
npm install --save-dev \
  @storybook/addon-a11y \
  @storybook/addon-interactions \
  @storybook/addon-measure \
  @storybook/addon-outline \
  storybook-addon-pseudo-states \
  @storybook/addon-storysource
```

#### Storybook Configuration
```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-measure',
    '@storybook/addon-outline',
    'storybook-addon-pseudo-states',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
};

export default config;
```

#### Preview Configuration
```typescript
// .storybook/preview.ts
import type { Preview } from '@storybook/react';
import '../src/styles/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      toc: true,
    },
    a11y: {
      element: '#storybook-root',
      config: {},
      options: {},
      manual: false,
    },
  },
  tags: ['autodocs'],
};

export default preview;
```

### Theme Integration

#### Design System Integration
```typescript
// .storybook/preview.ts (continued)
import { ThemeProvider } from '../src/components/theme/ThemeProvider';
import { designTokens } from '../src/styles/design-tokens';

const preview: Preview = {
  // ... existing config
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ padding: '1rem' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  parameters: {
    // ... existing parameters
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: designTokens.colors.gray[50],
        },
        {
          name: 'dark',
          value: designTokens.colors.gray[900],
        },
      ],
    },
  },
};
```

---

## 📖 Component Documentation Structure

### Story Organization

#### Directory Structure
```
src/
├── components/
│   ├── ui/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   └── Input/
│   │       ├── Input.tsx
│   │       ├── Input.stories.tsx
│   │       ├── Input.test.tsx
│   │       └── index.ts
│   └── workflow/
│       ├── WorkflowCanvas/
│       │   ├── WorkflowCanvas.tsx
│       │   ├── WorkflowCanvas.stories.tsx
│       │   └── index.ts
│       └── NodePalette/
│           ├── NodePalette.tsx
│           ├── NodePalette.stories.tsx
│           └── index.ts
└── stories/
    ├── Introduction.stories.mdx
    ├── DesignSystem.stories.mdx
    └── Accessibility.stories.mdx
```

### Story File Template

#### Basic Component Story
```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants and states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger', 'ghost'],
      description: 'The visual style variant of the button',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'The size of the button',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the button is disabled',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Whether to show loading state',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Click me',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Action',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Disabled Button',
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Loading...',
  },
};
```

#### Complex Component Story
```typescript
// WorkflowCanvas.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { WorkflowCanvas } from './WorkflowCanvas';
import { mockWorkflowData } from '../../mocks/workflowData';

const meta: Meta<typeof WorkflowCanvas> = {
  title: 'Workflow/WorkflowCanvas',
  component: WorkflowCanvas,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Interactive canvas for building and editing workflows with drag-and-drop functionality.',
      },
    },
    a11y: {
      disable: false,
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WorkflowCanvas>;

export const Empty: Story = {
  args: {
    workflow: null,
    readOnly: false,
  },
};

export const WithWorkflow: Story = {
  args: {
    workflow: mockWorkflowData,
    readOnly: false,
  },
};

export const ReadOnly: Story = {
  args: {
    workflow: mockWorkflowData,
    readOnly: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Canvas in read-only mode, useful for workflow preview.',
      },
    },
  },
};
```

---

## 🎨 Design System Stories

### Color Palette Documentation
```typescript
// stories/DesignSystem/Colors.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { designTokens } from '../../src/styles/design-tokens';

const ColorSwatch = ({ name, value }: { name: string; value: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', margin: '0.5rem 0' }}>
    <div
      style={{
        width: '3rem',
        height: '3rem',
        backgroundColor: value,
        border: '1px solid #e5e7eb',
        borderRadius: '0.25rem',
        marginRight: '1rem',
      }}
    />
    <div>
      <div style={{ fontWeight: 600 }}>{name}</div>
      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{value}</div>
    </div>
  </div>
);

const meta: Meta = {
  title: 'Design System/Colors',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Complete color palette following design token specifications.',
      },
    },
  },
};

export default meta;

export const Primary = () => (
  <div>
    <h3>Primary Colors</h3>
    {Object.entries(designTokens.colors.primary).map(([key, value]) => (
      <ColorSwatch key={key} name={`Primary ${key}`} value={value} />
    ))}
  </div>
);

export const Gray = () => (
  <div>
    <h3>Gray Scale</h3>
    {Object.entries(designTokens.colors.gray).map(([key, value]) => (
      <ColorSwatch key={key} name={`Gray ${key}`} value={value} />
    ))}
  </div>
);
```

### Typography Scale Documentation
```typescript
// stories/DesignSystem/Typography.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { designTokens } from '../../src/styles/design-tokens';

const TypeSample = ({
  name,
  fontSize,
  lineHeight,
  fontWeight = 400
}: {
  name: string;
  fontSize: string;
  lineHeight: string;
  fontWeight?: number;
}) => (
  <div style={{ margin: '1rem 0', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.25rem' }}>
    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
      {name} - {fontSize} / {lineHeight}
    </div>
    <div
      style={{
        fontSize,
        lineHeight,
        fontWeight,
        color: designTokens.colors.gray[900],
      }}
    >
      The quick brown fox jumps over the lazy dog
    </div>
  </div>
);

const meta: Meta = {
  title: 'Design System/Typography',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Typography scale and text styling specifications.',
      },
    },
  },
};

export default meta;

export const Headings = () => (
  <div>
    <h3>Heading Scale</h3>
    <TypeSample
      name="Heading XL"
      fontSize={designTokens.typography.fontSize['heading-xl']}
      lineHeight={designTokens.typography.lineHeight.tight}
      fontWeight={600}
    />
    <TypeSample
      name="Heading LG"
      fontSize={designTokens.typography.fontSize['heading-lg']}
      lineHeight={designTokens.typography.lineHeight.tight}
      fontWeight={600}
    />
    <TypeSample
      name="Heading MD"
      fontSize={designTokens.typography.fontSize['heading-md']}
      lineHeight={designTokens.typography.lineHeight.tight}
      fontWeight={600}
    />
  </div>
);

export const Body = () => (
  <div>
    <h3>Body Text</h3>
    <TypeSample
      name="Body Large"
      fontSize={designTokens.typography.fontSize['body-lg']}
      lineHeight={designTokens.typography.lineHeight.normal}
    />
    <TypeSample
      name="Body Medium"
      fontSize={designTokens.typography.fontSize['body-md']}
      lineHeight={designTokens.typography.lineHeight.normal}
    />
    <TypeSample
      name="Body Small"
      fontSize={designTokens.typography.fontSize['body-sm']}
      lineHeight={designTokens.typography.lineHeight.normal}
    />
  </div>
);
```

---

## ♿ Accessibility Stories

### Component Accessibility Testing
```typescript
// stories/Accessibility/ButtonAccessibility.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../src/components/ui/Button';

const meta: Meta<typeof Button> = {
  title: 'Accessibility/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Button component with full accessibility support and keyboard navigation.',
      },
    },
    a11y: {
      element: '#storybook-root',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const WithAriaLabel: Story = {
  args: {
    children: 'Save',
    'aria-label': 'Save current workflow',
  },
  parameters: {
    docs: {
      description: {
        story: 'Button with explicit aria-label for screen readers.',
      },
    },
  },
};

export const KeyboardNavigation: Story = {
  args: {
    children: 'Focusable Button',
  },
  parameters: {
    docs: {
      description: {
        story: 'Test keyboard navigation - press Tab to focus, Enter/Space to activate.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Test keyboard navigation
    await userEvent.tab();
    await expect(button).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    // Add assertions for button behavior
  },
};
```

### Screen Reader Testing Stories
```typescript
// stories/Accessibility/ScreenReader.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';

const ScreenReaderAnnouncer = ({
  message,
  priority = 'polite'
}: {
  message: string;
  priority?: 'polite' | 'assertive';
}) => {
  useEffect(() => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';

    document.body.appendChild(announcement);
    announcement.textContent = message;

    return () => {
      document.body.removeChild(announcement);
    };
  }, [message, priority]);

  return null;
};

const meta: Meta = {
  title: 'Accessibility/Screen Reader',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Examples of screen reader announcements and ARIA live regions.',
      },
    },
  },
};

export default meta;

export const LiveRegion = () => {
  const [message, setMessage] = useState('');

  return (
    <div>
      <button onClick={() => setMessage('Action completed successfully!')}>
        Trigger Announcement
      </button>
      <ScreenReaderAnnouncer message={message} priority="polite" />
    </div>
  );
};

export const StatusUpdates = () => {
  const [status, setStatus] = useState('idle');

  return (
    <div>
      <button onClick={() => setStatus('loading')}>Start Process</button>
      <button onClick={() => setStatus('completed')}>Complete Process</button>
      <ScreenReaderAnnouncer
        message={
          status === 'loading' ? 'Process starting...' :
          status === 'completed' ? 'Process completed successfully' :
          ''
        }
        priority="assertive"
      />
    </div>
  );
};
```

---

## 🔧 Interactive Testing Stories

### Component Interaction Testing
```typescript
// stories/Testing/ButtonInteractions.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../src/components/ui/Button';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<typeof Button> = {
  title: 'Testing/Button Interactions',
  component: Button,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const ClickInteraction: Story = {
  args: {
    children: 'Click Me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await userEvent.click(button);
    // Verify click behavior
    await expect(button).toBeInTheDocument();
  },
};

export const KeyboardInteraction: Story = {
  args: {
    children: 'Keyboard Test',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Test keyboard activation
    await userEvent.tab();
    await expect(button).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    // Verify activation behavior
  },
};
```

### Form Testing Stories
```typescript
// stories/Testing/FormValidation.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const FormExample = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (password && password.length < 8) newErrors.password = 'Password must be at least 8 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted:', { email, password });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        error={errors.email}
        required
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        error={errors.password}
        required
      />
      <Button type="submit">Submit</Button>
    </form>
  );
};

const meta: Meta = {
  title: 'Testing/Form Validation',
  component: FormExample,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const ValidSubmission: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText('Email'), 'user@example.com');
    await userEvent.type(canvas.getByLabelText('Password'), 'password123');

    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));

    // Verify successful submission
    await expect(canvas.queryByText('Email is required')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Password is required')).not.toBeInTheDocument();
  },
};

export const ValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Try to submit empty form
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));

    // Verify error messages appear
    await expect(canvas.getByText('Email is required')).toBeInTheDocument();
    await expect(canvas.getByText('Password is required')).toBeInTheDocument();
  },
};
```

---

## 🚀 Deployment & Integration

### Storybook Build Configuration
```typescript
// .storybook/main.ts (production config)
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // ... existing config
  staticDirs: ['../public'],
  build: {
    test: {
      disabledAddons: [
        '@storybook/addon-onboarding',
        '@storybook/addon-essentials/docs',
      ],
    },
  },
  managerHead: (head) => `
    ${head}
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="description" content="Auterity Component Library" />
  `,
};

export default config;
```

### CI/CD Integration
```yaml
# .github/workflows/storybook.yml
name: Storybook
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Storybook
        run: npm run build-storybook

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        if: github.ref == 'refs/heads/main'
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./storybook-static
```

### Component Library Integration
```typescript
// src/components/index.ts
// Central export file for component library
export { Button } from './ui/Button';
export { Input } from './ui/Input';
export { Select } from './ui/Select';
export { Modal } from './ui/Modal';
export { WorkflowCanvas } from './workflow/WorkflowCanvas';
export { NodePalette } from './workflow/NodePalette';

// Re-export design tokens
export { designTokens } from '../styles/design-tokens';

// Re-export types
export type { ButtonProps } from './ui/Button';
export type { InputProps } from './ui/Input';
export type { WorkflowData } from './workflow/types';
```

---

## 📊 Usage Analytics & Insights

### Storybook Analytics Setup
```typescript
// .storybook/preview.ts (with analytics)
import { addons } from '@storybook/addons';
import { STORY_RENDERED } from '@storybook/core-events';

addons.register('storybook/analytics', (api) => {
  api.on(STORY_RENDERED, (story) => {
    // Track story views
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'storybook_view', {
        story_id: story.id,
        story_name: story.name,
        component: story.component,
      });
    }
  });
});
```

### Documentation Integration
```typescript
// Link to external documentation
const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'A versatile button component. [View API Docs](/docs/frontend/component-map.html#button-component)',
      },
    },
  },
};
```

---

## 🔗 Quick Access Links

### Component Library URLs
- **Storybook Home**: `https://auterity-storybook.vercel.app/`
- **UI Components**: `https://auterity-storybook.vercel.app/?path=/docs/ui-button--primary`
- **Workflow Components**: `https://auterity-storybook.vercel.app/?path=/docs/workflow-workflowcanvas--with-workflow`
- **Design System**: `https://auterity-storybook.vercel.app/?path=/docs/design-system-colors--primary`

### Development Commands
```bash
# Start Storybook locally
npm run storybook

# Build Storybook for production
npm run build-storybook

# Run Storybook tests
npm run test-storybook

# Generate Storybook static files
npm run build-storybook -- --output-dir ./docs/storybook
```

### Integration with CI/CD
- **Automated Testing**: Storybook tests run on every PR
- **Visual Regression**: Chromatic integration for visual testing
- **Accessibility Testing**: Automated a11y checks in CI
- **Performance Testing**: Bundle size and performance monitoring

---

*This Storybook documentation setup provides a comprehensive interactive component library for Auterity's frontend development. The setup enables developers, designers, and stakeholders to explore, test, and understand UI components effectively.*

*Last Updated: [Current Date] | Version: 1.2.3*
