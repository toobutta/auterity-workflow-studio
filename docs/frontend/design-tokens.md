# Design Tokens & Design System

## Overview

This document defines Auterity's comprehensive design system, including all design tokens, visual guidelines, and implementation standards. The design system ensures consistency across all user interfaces while providing flexibility for different use cases.

## 🎨 Color System

### Primary Color Palette

#### Brand Colors
```css
/* Primary Brand Colors */
--color-primary-50: #f0f9ff;    /* Lightest */
--color-primary-100: #e0f2fe;
--color-primary-200: #bae6fd;
--color-primary-300: #7dd3fc;
--color-primary-400: #38bdf8;
--color-primary-500: #0ea5e9;   /* Base Primary */
--color-primary-600: #0284c7;
--color-primary-700: #0369a1;
--color-primary-800: #075985;
--color-primary-900: #0c4a6e;   /* Darkest */
--color-primary-950: #082f49;   /* Darker than dark */

/* Usage Examples */
.primary-button {
  background-color: var(--color-primary-500);
  color: white;
}

.primary-button:hover {
  background-color: var(--color-primary-600);
}

.primary-button:active {
  background-color: var(--color-primary-700);
}
```

#### Semantic Colors
```css
/* Success States */
--color-success-50: #f0fdf4;
--color-success-500: #22c55e;
--color-success-600: #16a34a;

/* Warning States */
--color-warning-50: #fffbeb;
--color-warning-500: #f59e0b;
--color-warning-600: #d97706;

/* Error States */
--color-error-50: #fef2f2;
--color-error-500: #ef4444;
--color-error-600: #dc2626;

/* Info States */
--color-info-50: #eff6ff;
--color-info-500: #3b82f6;
--color-info-600: #2563eb;
```

### Neutral Color Palette

#### Gray Scale
```css
/* Neutral Grays */
--color-gray-50: #f9fafb;     /* Lightest background */
--color-gray-100: #f3f4f6;    /* Card backgrounds */
--color-gray-200: #e5e7eb;    /* Borders, dividers */
--color-gray-300: #d1d5db;    /* Subtle borders */
--color-gray-400: #9ca3af;    /* Placeholder text */
--color-gray-500: #6b7280;    /* Body text */
--color-gray-600: #4b5563;    /* Secondary text */
--color-gray-700: #374151;    /* Primary text */
--color-gray-800: #1f2937;    /* Headings */
--color-gray-900: #111827;    /* Darkest text */
--color-gray-950: #030712;    /* Dark backgrounds */
```

#### Dark Mode Colors
```css
/* Dark Mode Variants */
--color-dark-primary-50: #0c4a6e;
--color-dark-primary-100: #075985;
--color-dark-primary-200: #0369a1;
--color-dark-primary-300: #0284c7;
--color-dark-primary-400: #0ea5e9;
--color-dark-primary-500: #38bdf8;
--color-dark-primary-600: #7dd3fc;
--color-dark-primary-700: #bae6fd;
--color-dark-primary-800: #e0f2fe;
--color-dark-primary-900: #f0f9ff;

/* Dark Mode Neutrals */
--color-dark-gray-50: #030712;
--color-dark-gray-100: #111827;
--color-dark-gray-200: #1f2937;
--color-dark-gray-300: #374151;
--color-dark-gray-400: #4b5563;
--color-dark-gray-500: #6b7280;
--color-dark-gray-600: #9ca3af;
--color-dark-gray-700: #d1d5db;
--color-dark-gray-800: #e5e7eb;
--color-dark-gray-900: #f9fafb;
```

---

## 📝 Typography System

### Font Families

#### Primary Typeface
```css
/* Inter Font Family (Primary) */
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Usage */
body {
  font-family: var(--font-family-primary);
}
```

#### Monospace Typeface
```css
/* JetBrains Mono (Code) */
--font-family-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Monaco, 'Cascadia Code', monospace;

/* Usage */
code, pre, .code-block {
  font-family: var(--font-family-mono);
}
```

### Font Sizes & Line Heights

#### Text Scale
```css
/* Display Text */
--text-display-2xl: 4.5rem;    /* 72px */
--text-display-xl: 3.75rem;    /* 60px */
--text-display-lg: 3rem;       /* 48px */
--text-display-md: 2.25rem;    /* 36px */
--text-display-sm: 1.875rem;   /* 30px */

/* Heading Text */
--text-heading-xl: 2.25rem;    /* 36px */
--text-heading-lg: 1.875rem;   /* 30px */
--text-heading-md: 1.5rem;     /* 24px */
--text-heading-sm: 1.25rem;    /* 20px */
--text-heading-xs: 1.125rem;   /* 18px */

/* Body Text */
--text-body-xl: 1.25rem;       /* 20px */
--text-body-lg: 1.125rem;      /* 18px */
--text-body-md: 1rem;          /* 16px */
--text-body-sm: 0.875rem;      /* 14px */
--text-body-xs: 0.75rem;       /* 12px */

/* Label Text */
--text-label-lg: 0.875rem;     /* 14px */
--text-label-md: 0.75rem;      /* 12px */
--text-label-sm: 0.6875rem;    /* 11px */
```

#### Line Heights
```css
/* Line Height Scale */
--line-height-tight: 1.25;     /* Tight spacing */
--line-height-snug: 1.375;     /* Slightly loose */
--line-height-normal: 1.5;     /* Standard */
--line-height-relaxed: 1.625;  /* Relaxed */
--line-height-loose: 2;        /* Very loose */

/* Usage Examples */
.text-body {
  font-size: var(--text-body-md);
  line-height: var(--line-height-normal);
}

.text-heading {
  font-size: var(--text-heading-lg);
  line-height: var(--line-height-tight);
}
```

### Font Weights
```css
/* Font Weight Scale */
--font-weight-thin: 100;
--font-weight-extralight: 200;
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
--font-weight-black: 900;

/* Usage */
.text-bold {
  font-weight: var(--font-weight-bold);
}

.text-semibold {
  font-weight: var(--font-weight-semibold);
}
```

---

## 📏 Spacing System

### Spacing Scale
```css
/* Spacing Scale (4px base) */
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
--space-32: 8rem;      /* 128px */
```

### Spacing Usage Guidelines

#### Component Spacing
```css
/* Component Padding */
.component-padding-sm {
  padding: var(--space-3) var(--space-4);  /* 12px 16px */
}

.component-padding-md {
  padding: var(--space-4) var(--space-6);  /* 16px 24px */
}

.component-padding-lg {
  padding: var(--space-6) var(--space-8);  /* 24px 32px */
}

/* Element Spacing */
.element-gap-sm {
  gap: var(--space-2);  /* 8px */
}

.element-gap-md {
  gap: var(--space-4);  /* 16px */
}

.element-gap-lg {
  gap: var(--space-6);  /* 24px */
}
```

#### Layout Spacing
```css
/* Page Layout */
.page-container {
  padding: var(--space-8) var(--space-6);  /* 32px 24px */
  max-width: 1200px;
  margin: 0 auto;
}

/* Section Spacing */
.section-spacing {
  margin-bottom: var(--space-12);  /* 48px */
}

/* Card Grid */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);  /* 24px */
}
```

---

## 🔄 Motion System

### Duration Scale
```css
/* Duration Scale */
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 350ms;
--duration-slower: 500ms;

/* Usage */
.transition-fast {
  transition: all var(--duration-fast) ease-out;
}

.transition-normal {
  transition: all var(--duration-normal) ease-out;
}
```

### Easing Functions
```css
/* Easing Functions */
--ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0.0, 1, 1);
--ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Usage */
.button-hover {
  transition: transform var(--duration-fast) var(--ease-out);
}

.modal-enter {
  animation: modalSlideIn var(--duration-normal) var(--ease-out);
}
```

### Keyframe Animations
```css
/* Keyframe Definitions */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Usage Classes */
.fade-in {
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.slide-in-right {
  animation: slideInFromRight var(--duration-normal) var(--ease-out);
}

.loading-pulse {
  animation: pulse var(--duration-slow) ease-in-out infinite;
}
```

---

## 📐 Border & Shadow System

### Border Radius
```css
/* Border Radius Scale */
--radius-none: 0;
--radius-sm: 0.125rem;    /* 2px */
--radius-md: 0.375rem;    /* 6px */
--radius-lg: 0.5rem;      /* 8px */
--radius-xl: 0.75rem;     /* 12px */
--radius-2xl: 1rem;       /* 16px */
--radius-3xl: 1.5rem;     /* 24px */
--radius-full: 9999px;    /* Fully rounded */

/* Usage */
.button {
  border-radius: var(--radius-md);
}

.card {
  border-radius: var(--radius-lg);
}

.avatar {
  border-radius: var(--radius-full);
}
```

### Border Width
```css
/* Border Width Scale */
--border-width-none: 0;
--border-width-thin: 1px;
--border-width-normal: 2px;
--border-width-thick: 4px;

/* Usage */
.divider {
  border-bottom: var(--border-width-thin) solid var(--color-gray-200);
}

.focus-ring {
  border: var(--border-width-normal) solid var(--color-primary-500);
}
```

### Shadow System
```css
/* Shadow Scale */
--shadow-none: none;
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Colored Shadows */
--shadow-primary: 0 4px 6px -1px rgba(14, 165, 233, 0.1), 0 2px 4px -1px rgba(14, 165, 233, 0.06);
--shadow-success: 0 4px 6px -1px rgba(34, 197, 94, 0.1), 0 2px 4px -1px rgba(34, 197, 94, 0.06);
--shadow-error: 0 4px 6px -1px rgba(239, 68, 68, 0.1), 0 2px 4px -1px rgba(239, 68, 68, 0.06);

/* Usage */
.card {
  box-shadow: var(--shadow-sm);
}

.card:hover {
  box-shadow: var(--shadow-md);
}

.modal {
  box-shadow: var(--shadow-2xl);
}
```

---

## 📱 Breakpoint System

### Responsive Breakpoints
```css
/* Breakpoint Definitions */
--breakpoint-mobile: 0px;
--breakpoint-tablet: 768px;
--breakpoint-desktop: 1024px;
--breakpoint-wide: 1440px;

/* Container Max Widths */
--container-mobile: 100%;
--container-tablet: 100%;
--container-desktop: 1024px;
--container-wide: 1440px;
```

### Media Queries
```css
/* Mobile First Approach */
@media (min-width: 768px) {
  /* Tablet and up */
  .container {
    max-width: var(--container-tablet);
  }
}

@media (min-width: 1024px) {
  /* Desktop and up */
  .container {
    max-width: var(--container-desktop);
  }
}

@media (min-width: 1440px) {
  /* Wide screens */
  .container {
    max-width: var(--container-wide);
  }
}
```

---

## 🎯 Component-Specific Tokens

### Button Tokens
```css
/* Button Variants */
--button-primary-bg: var(--color-primary-500);
--button-primary-hover: var(--color-primary-600);
--button-primary-active: var(--color-primary-700);

--button-secondary-bg: var(--color-gray-100);
--button-secondary-border: var(--color-gray-300);
--button-secondary-hover: var(--color-gray-200);

/* Button Sizes */
--button-height-sm: 2rem;      /* 32px */
--button-height-md: 2.5rem;    /* 40px */
--button-height-lg: 3rem;      /* 48px */

--button-padding-x-sm: 0.75rem;  /* 12px */
--button-padding-x-md: 1rem;     /* 16px */
--button-padding-x-lg: 1.5rem;   /* 24px */
```

### Input Tokens
```css
/* Input Field */
--input-height: 2.5rem;          /* 40px */
--input-padding-x: 0.75rem;      /* 12px */
--input-padding-y: 0.5rem;       /* 8px */
--input-border: var(--border-width-thin) solid var(--color-gray-300);
--input-border-focus: var(--border-width-thin) solid var(--color-primary-500);
--input-border-radius: var(--radius-md);

/* Input States */
--input-bg-disabled: var(--color-gray-50);
--input-text-disabled: var(--color-gray-400);
--input-border-error: var(--border-width-thin) solid var(--color-error-500);
```

### Card Tokens
```css
/* Card Styles */
--card-padding: var(--space-6);     /* 24px */
--card-border-radius: var(--radius-lg);
--card-shadow: var(--shadow-sm);
--card-shadow-hover: var(--shadow-md);
--card-border: var(--border-width-thin) solid var(--color-gray-200);

/* Card Header */
--card-header-padding: var(--space-4);  /* 16px */
--card-header-border-bottom: var(--border-width-thin) solid var(--color-gray-200);
```

---

## 🌙 Dark Mode Implementation

### Theme Toggle Strategy
```typescript
// Theme Configuration
const themes = {
  light: {
    // Light theme tokens
    background: 'var(--color-gray-50)',
    surface: 'var(--color-gray-100)',
    text: 'var(--color-gray-900)',
    textSecondary: 'var(--color-gray-600)',
    // ... other tokens
  },
  dark: {
    // Dark theme tokens
    background: 'var(--color-gray-950)',
    surface: 'var(--color-gray-900)',
    text: 'var(--color-gray-100)',
    textSecondary: 'var(--color-gray-400)',
    // ... other tokens
  }
};

// Theme Hook
const useTheme = () => {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
};
```

### CSS Custom Properties for Themes
```css
/* Theme-aware CSS Variables */
:root {
  --bg-primary: var(--color-gray-50);
  --bg-secondary: var(--color-gray-100);
  --text-primary: var(--color-gray-900);
  --text-secondary: var(--color-gray-600);
}

[data-theme="dark"] {
  --bg-primary: var(--color-gray-950);
  --bg-secondary: var(--color-gray-900);
  --text-primary: var(--color-gray-100);
  --text-secondary: var(--color-gray-400);
}

/* Usage */
.body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.card {
  background-color: var(--bg-secondary);
}
```

---

## 🧩 Implementation Guidelines

### Token Usage in Components
```typescript
// Component with Design Tokens
const Button = styled.button<{
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
}>`
  height: ${props => {
    switch (props.size) {
      case 'sm': return 'var(--button-height-sm)';
      case 'md': return 'var(--button-height-md)';
      case 'lg': return 'var(--button-height-lg)';
      default: return 'var(--button-height-md)';
    }
  }};

  padding: 0 ${props => {
    switch (props.size) {
      case 'sm': return 'var(--button-padding-x-sm)';
      case 'md': return 'var(--button-padding-x-md)';
      case 'lg': return 'var(--button-padding-x-lg)';
      default: return 'var(--button-padding-x-md)';
    }
  }};

  background-color: ${props =>
    props.variant === 'primary'
      ? 'var(--button-primary-bg)'
      : 'var(--button-secondary-bg)'
  };

  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-out);
`;
```

### Theme Extension
```typescript
// Custom Theme Extension
interface CustomTheme {
  colors: {
    brand: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
}
```

---

## 📋 Design Token Maintenance

### Token Versioning
```json
{
  "version": "1.2.3",
  "lastUpdated": "2024-01-15",
  "changes": [
    {
      "version": "1.2.3",
      "date": "2024-01-15",
      "description": "Added dark mode color variants",
      "affectedTokens": ["color-dark-*"]
    }
  ]
}
```

### Token Validation
```typescript
// Token Validation Schema
const colorTokenSchema = {
  type: 'object',
  patternProperties: {
    '^--color-': {
      type: 'string',
      pattern: '^#[0-9a-fA-F]{6}$|^#[0-9a-fA-F]{3}$'
    }
  }
};

const spacingTokenSchema = {
  type: 'object',
  patternProperties: {
    '^--space-': {
      type: 'string',
      pattern: '^[0-9]+(?:\\.[0-9]+)?rem$'
    }
  }
};
```

### Token Documentation Standards
```markdown
## Token Documentation Format

### Token Name
**Value:** `actual-value`
**Usage:** Description of when to use this token
**Examples:**
- Usage example 1
- Usage example 2

### Related Tokens
- Related token 1
- Related token 2
- Related token 3
```

---

*This design tokens and design system document provides the comprehensive visual foundation for Auterity's user interface. All components should reference these tokens to ensure visual consistency and maintainability across the platform.*

*Last Updated: [Current Date] | Version: 1.2.3*
