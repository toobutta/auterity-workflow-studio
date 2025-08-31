/**
 * Application configuration and constants
 */

// Environment variables with defaults
export const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5055',

  // Application Settings
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Auterity Workflow Studio',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',

  // Authentication
  AUTH_PROVIDER: import.meta.env.VITE_AUTH_PROVIDER || 'local',
  AUTH_DOMAIN: import.meta.env.VITE_AUTH_DOMAIN,
  AUTH_CLIENT_ID: import.meta.env.VITE_AUTH_CLIENT_ID,
  AUTH_AUDIENCE: import.meta.env.VITE_AUTH_AUDIENCE,

  // External Services
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  ANALYTICS_ID: import.meta.env.VITE_ANALYTICS_ID,
  EMAIL_SERVICE_API_KEY: import.meta.env.VITE_EMAIL_SERVICE_API_KEY,
  FILE_STORAGE_BUCKET: import.meta.env.VITE_FILE_STORAGE_BUCKET,

  // Feature Flags
  ENABLE_OFFLINE_MODE: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true',
  ENABLE_PUSH_NOTIFICATIONS: import.meta.env.VITE_ENABLE_PUSH_NOTIFICATIONS === 'true',
  ENABLE_ADVANCED_ANALYTICS: import.meta.env.VITE_ENABLE_ADVANCED_ANALYTICS === 'true',

  // Performance
  PERFORMANCE_MONITORING: import.meta.env.VITE_PERFORMANCE_MONITORING === 'true',
  ERROR_TRACKING: import.meta.env.VITE_ERROR_TRACKING === 'true',

  // UI/UX
  THEME: import.meta.env.VITE_THEME || 'default',
  LOCALE: import.meta.env.VITE_LOCALE || 'en-US',
  TIMEZONE: import.meta.env.VITE_TIMEZONE || 'UTC',
};

// API Endpoints
export const API_ENDPOINTS = {
  WORKFLOWS: '/v1/workflows',
  TEMPLATES: '/v1/templates',
  EXECUTIONS: '/v1/executions',
  USERS: '/v1/users',
  AUTH: '/auth',
  FILES: '/v1/files',
  ANALYTICS: '/v1/analytics',
  WORKSPACES: '/v1/workspaces',
  PROJECTS: '/v1/workspaces/{workspaceId}/projects',
  AI_FUNCTIONS: '/v1/ai/functions',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// UI Constants
export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  PAGINATION_LIMIT: 20,
  TOAST_DURATION: 5000,
  MODAL_ANIMATION_DURATION: 200,
  SIDEBAR_WIDTH: 280,
  CANVAS_MIN_ZOOM: 0.1,
  CANVAS_MAX_ZOOM: 2.0,
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  WORKFLOW_NAME_MAX_LENGTH: 100,
  NODE_NAME_MAX_LENGTH: 50,
  PROJECT_NAME_MAX_LENGTH: 50,
  WORKSPACE_NAME_MAX_LENGTH: 30,
};

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf', 'application/json', 'text/plain'],
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  API: 'YYYY-MM-DDTHH:mm:ssZ',
  RELATIVE: 'relative',
  TIME_ONLY: 'HH:mm',
  DATE_TIME: 'MMM DD, YYYY HH:mm',
};

// Feature Flags (runtime configurable)
export const FEATURE_FLAGS = {
  ENABLE_OFFLINE_MODE: config.ENABLE_OFFLINE_MODE,
  ENABLE_PUSH_NOTIFICATIONS: config.ENABLE_PUSH_NOTIFICATIONS,
  ENABLE_ADVANCED_ANALYTICS: config.ENABLE_ADVANCED_ANALYTICS,
  ENABLE_COLLABORATION: true,
  ENABLE_VERSION_CONTROL: true,
  ENABLE_AUTO_SAVE: true,
  ENABLE_AI_ASSISTANCE: true,
  ENABLE_ADVANCED_WORKFLOW_ANALYTICS: true,
};

// Workflow Constants
export const WORKFLOW_CONSTANTS = {
  MAX_NODES_PER_WORKFLOW: 1000,
  MAX_CONNECTIONS_PER_NODE: 10,
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  EXECUTION_TIMEOUT: 300000, // 5 minutes
  MAX_EXECUTION_HISTORY: 100,
};

// AI Integration Constants
export const AI_CONSTANTS = {
  MAX_PROMPT_LENGTH: 4000,
  MAX_RESPONSE_LENGTH: 8000,
  DEFAULT_MODEL: 'gpt-4',
  SUPPORTED_MODELS: ['gpt-3.5-turbo', 'gpt-4', 'claude-2'],
  FUNCTION_CALL_TIMEOUT: 60000, // 1 minute
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  WORKFLOW_NOT_FOUND: 'Workflow not found.',
  INVALID_WORKFLOW: 'The workflow contains invalid configuration.',
  EXECUTION_FAILED: 'Workflow execution failed. Please check the logs.',
  SAVE_FAILED: 'Failed to save workflow. Please try again.',
  LOAD_FAILED: 'Failed to load workflow. Please refresh the page.',
  AI_SERVICE_UNAVAILABLE: 'AI service is currently unavailable. Please try again later.',
};
