import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

// Custom render function that includes providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return React.createElement(React.Fragment, null, children)
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  const user = userEvent.setup()
  return {
    user,
    ...render(ui, { wrapper: AllTheProviders, ...options }),
  }
}

// Test data factories
export const createMockNode = (overrides = {}) => ({
  id: 'node-1',
  type: 'start' as const,
  position: { x: 100, y: 100 },
  size: { width: 120, height: 48 },
  data: { label: 'Test Node' },
  style: {
    backgroundColor: 0x3498db,
    borderColor: 0x2980b9,
    borderWidth: 2,
    borderRadius: 4,
    textColor: 0xffffff,
    fontSize: 14,
    fontWeight: 'normal',
    shadow: false,
    opacity: 1,
  },
  selected: false,
  dragging: false,
  ...overrides,
})

export const createMockWorkflow = (overrides = {}) => ({
  id: 'workflow-1',
  name: 'Test Workflow',
  nodes: [createMockNode()],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  ...overrides,
})

export const createMockCanvasConfig = (overrides = {}) => ({
  width: 800,
  height: 600,
  backgroundColor: 0xffffff,
  gridEnabled: true,
  gridSize: 20,
  gridColor: 0xe0e0e0,
  snapToGrid: false,
  showRulers: false,
  ...overrides,
})

// Performance testing utilities
export const measurePerformance = async (fn: () => void | Promise<void>) => {
  const startTime = performance.now()
  const startMemory = (performance as any).memory?.usedJSHeapSize || 0

  await fn()

  const endTime = performance.now()
  const endMemory = (performance as any).memory?.usedJSHeapSize || 0

  return {
    duration: endTime - startTime,
    memoryDelta: endMemory - startMemory,
  }
}

// Memory leak detection
export const detectMemoryLeaks = async (fn: () => void | Promise<void>, iterations = 10) => {
  const initialMemory = (performance as any).memory?.usedJSHeapSize || 0
  let maxMemory = initialMemory

  for (let i = 0; i < iterations; i++) {
    await fn()
    const currentMemory = (performance as any).memory?.usedJSHeapSize || 0
    maxMemory = Math.max(maxMemory, currentMemory)

    // Force garbage collection if available
    if (global.gc) {
      global.gc()
    }
  }

  const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
  const memoryLeak = finalMemory - initialMemory

  return {
    initialMemory,
    maxMemory,
    finalMemory,
    memoryLeak,
    hasLeak: memoryLeak > 1024 * 1024, // 1MB threshold
  }
}

// Mock implementations for external dependencies
export const mockPixiApplication = () => ({
  stage: {
    addChild: vi.fn(),
    removeChild: vi.fn(),
    interactive: true,
    on: vi.fn(),
    off: vi.fn(),
  },
  renderer: {
    resize: vi.fn(),
  },
  view: document.createElement('canvas'),
  destroy: vi.fn(),
  ticker: {
    add: vi.fn(),
    remove: vi.fn(),
  },
})

// Accessibility testing helpers
export const checkAccessibility = (element: HTMLElement): string[] => {
  const issues: string[] = []

  // Check for alt text on images
  const images = element.querySelectorAll('img')
  images.forEach((img) => {
    if (!img.alt) {
      issues.push(`Image missing alt text: ${img.src}`)
    }
  })

  // Check for labels on form elements
  const inputs = element.querySelectorAll('input, select, textarea')
  inputs.forEach((input) => {
    const label = element.querySelector(`label[for="${input.id}"]`)
    if (!label && !input.getAttribute('aria-label')) {
      issues.push(`Form element missing label: ${input.tagName}`)
    }
  })

  // Check for sufficient color contrast (simplified)
  const textElements = element.querySelectorAll('*')
  textElements.forEach((el) => {
    const style = window.getComputedStyle(el)
    if (style.color && style.backgroundColor) {
      // This is a simplified check - in real scenarios use a proper contrast library
      if (style.color === style.backgroundColor) {
        issues.push(`Poor color contrast detected`)
      }
    }
  })

  return issues
}

// Visual regression helpers
export const takeScreenshot = async (element: HTMLElement): Promise<string> => {
  // This is a mock implementation - in real scenarios use puppeteer or playwright
  return `screenshot-${Date.now()}`
}

export const compareScreenshots = (screenshot1: string, screenshot2: string): boolean => {
  // This is a mock implementation - in real scenarios use pixelmatch or similar
  return screenshot1 === screenshot2
}

// Export custom render as default
export { customRender as render }

// Re-export everything from testing-library
export * from '@testing-library/react'
export * from '@testing-library/user-event'
