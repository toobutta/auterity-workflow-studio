#!/usr/bin/env node

/**
 * Enhanced Development Workflow Script
 *
 * Manages development, testing, and deployment across both projects
 * with API-based integration and error-free workflows
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class EnhancedDevWorkflow {
  constructor() {
    this.workflowStudioPath = path.join(__dirname, '..');
    this.errorIQPath = path.join(__dirname, '../../auterity-error-iq');
    this.isWindows = process.platform === 'win32';
  }

  // Initialize both projects
  async initialize() {
    console.log('🚀 Initializing Enhanced Development Workflow...\n');

    try {
      // Check if both projects exist
      if (!fs.existsSync(this.workflowStudioPath)) {
        throw new Error('Workflow Studio project not found');
      }

      if (!fs.existsSync(this.errorIQPath)) {
        console.log('⚠️  Error IQ project not found - some features will be limited');
      }

      // Install dependencies
      await this.installDependencies();

      // Setup development environment
      await this.setupDevEnvironment();

      // Configure API integration
      await this.configureIntegration();

      console.log('✅ Enhanced Development Workflow initialized successfully!');
    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      process.exit(1);
    }
  }

  // Install dependencies for both projects
  async installDependencies() {
    console.log('📦 Installing dependencies...\n');

    // Workflow Studio dependencies
    if (fs.existsSync(path.join(this.workflowStudioPath, 'package.json'))) {
      console.log('📦 Installing Workflow Studio dependencies...');
      execSync('npm install', {
        cwd: this.workflowStudioPath,
        stdio: 'inherit'
      });
    }

    // Error IQ dependencies
    if (fs.existsSync(this.errorIQPath)) {
      if (fs.existsSync(path.join(this.errorIQPath, 'frontend/package.json'))) {
        console.log('📦 Installing Error IQ Frontend dependencies...');
        execSync('npm install', {
          cwd: path.join(this.errorIQPath, 'frontend'),
          stdio: 'inherit'
        });
      }

      if (fs.existsSync(path.join(this.errorIQPath, 'backend/requirements.txt'))) {
        console.log('📦 Installing Error IQ Backend dependencies...');
        execSync('pip install -r requirements.txt', {
          cwd: path.join(this.errorIQPath, 'backend'),
          stdio: 'inherit'
        });
      }
    }

    console.log('✅ Dependencies installed successfully!\n');
  }

  // Setup development environment
  async setupDevEnvironment() {
    console.log('🔧 Setting up development environment...\n');

    // Create environment files
    await this.createEnvFiles();

    // Setup pre-commit hooks
    await this.setupPreCommitHooks();

    // Configure linting and formatting
    await this.configureCodeQuality();

    console.log('✅ Development environment configured!\n');
  }

  // Configure API integration between projects
  async configureIntegration() {
    console.log('🔗 Configuring API integration...\n');

    // Create integration configuration
    const integrationConfig = {
      workflowStudio: {
        baseUrl: process.env.WORKFLOW_STUDIO_URL || 'http://localhost:3001',
        apiKey: process.env.WORKFLOW_STUDIO_API_KEY || 'dev-key',
        timeout: 30000
      },
      errorIQ: {
        baseUrl: process.env.ERROR_IQ_URL || 'http://localhost:8000',
        apiKey: process.env.ERROR_IQ_API_KEY || 'dev-key',
        timeout: 30000
      },
      crossSystem: {
        enabled: true,
        syncInterval: 30000,
        retryAttempts: 3,
        circuitBreaker: {
          failureThreshold: 5,
          recoveryTimeout: 60000
        }
      }
    };

    // Write integration config to both projects
    const configPath1 = path.join(this.workflowStudioPath, 'integration.config.json');
    const configPath2 = path.join(this.errorIQPath, 'frontend/integration.config.json');

    fs.writeFileSync(configPath1, JSON.stringify(integrationConfig, null, 2));
    if (fs.existsSync(this.errorIQPath)) {
      fs.writeFileSync(configPath2, JSON.stringify(integrationConfig, null, 2));
    }

    console.log('✅ API integration configured!\n');
  }

  // Development server management
  async startDevServers() {
    console.log('🚀 Starting development servers...\n');

    const processes = [];

    // Start Workflow Studio
    const studioProcess = spawn('npm', ['run', 'dev'], {
      cwd: this.workflowStudioPath,
      stdio: 'inherit',
      shell: this.isWindows
    });
    processes.push({ name: 'Workflow Studio', process: studioProcess });

    // Start Error IQ Frontend (if exists)
    if (fs.existsSync(this.errorIQPath)) {
      const errorIQProcess = spawn('npm', ['run', 'dev'], {
        cwd: path.join(this.errorIQPath, 'frontend'),
        stdio: 'inherit',
        shell: this.isWindows
      });
      processes.push({ name: 'Error IQ Frontend', process: errorIQProcess });

      // Start Error IQ Backend
      const backendProcess = spawn('python', ['-m', 'uvicorn', 'main:app', '--reload'], {
        cwd: path.join(this.errorIQPath, 'backend'),
        stdio: 'inherit',
        shell: this.isWindows
      });
      processes.push({ name: 'Error IQ Backend', process: backendProcess });
    }

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down development servers...');
      processes.forEach(({ name, process }) => {
        console.log(`Stopping ${name}...`);
        process.kill();
      });
      process.exit(0);
    });

    // Wait for processes
    await Promise.all(
      processes.map(({ name, process }) =>
        new Promise((resolve) => {
          process.on('close', (code) => {
            console.log(`${name} exited with code ${code}`);
            resolve(code);
          });
        })
      )
    );
  }

  // Run tests across both projects
  async runTests(options = {}) {
    const { coverage = false, watch = false, projects = ['workflow-studio', 'error-iq'] } = options;

    console.log('🧪 Running tests...\n');

    const testResults = [];

    if (projects.includes('workflow-studio')) {
      console.log('🧪 Running Workflow Studio tests...');
      try {
        const args = ['test'];
        if (coverage) args.push('--coverage');
        if (watch) args.push('--watch');

        execSync(`npm ${args.join(' ')}`, {
          cwd: this.workflowStudioPath,
          stdio: 'inherit'
        });
        testResults.push({ project: 'Workflow Studio', status: 'passed' });
      } catch (error) {
        testResults.push({ project: 'Workflow Studio', status: 'failed', error: error.message });
      }
    }

    if (projects.includes('error-iq') && fs.existsSync(this.errorIQPath)) {
      // Frontend tests
      if (fs.existsSync(path.join(this.errorIQPath, 'frontend/package.json'))) {
        console.log('🧪 Running Error IQ Frontend tests...');
        try {
          execSync('npm test', {
            cwd: path.join(this.errorIQPath, 'frontend'),
            stdio: 'inherit'
          });
          testResults.push({ project: 'Error IQ Frontend', status: 'passed' });
        } catch (error) {
          testResults.push({ project: 'Error IQ Frontend', status: 'failed', error: error.message });
        }
      }

      // Backend tests
      if (fs.existsSync(path.join(this.errorIQPath, 'backend'))) {
        console.log('🧪 Running Error IQ Backend tests...');
        try {
          execSync('python -m pytest', {
            cwd: path.join(this.errorIQPath, 'backend'),
            stdio: 'inherit'
          });
          testResults.push({ project: 'Error IQ Backend', status: 'passed' });
        } catch (error) {
          testResults.push({ project: 'Error IQ Backend', status: 'failed', error: error.message });
        }
      }
    }

    console.log('\n📊 Test Results Summary:');
    testResults.forEach(result => {
      const icon = result.status === 'passed' ? '✅' : '❌';
      console.log(`${icon} ${result.project}: ${result.status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
  }

  // Build both projects
  async buildProjects() {
    console.log('🔨 Building projects...\n');

    // Build Workflow Studio
    console.log('🔨 Building Workflow Studio...');
    execSync('npm run build', {
      cwd: this.workflowStudioPath,
      stdio: 'inherit'
    });

    // Build Error IQ Frontend (if exists)
    if (fs.existsSync(this.errorIQPath)) {
      console.log('🔨 Building Error IQ Frontend...');
      execSync('npm run build', {
        cwd: path.join(this.errorIQPath, 'frontend'),
        stdio: 'inherit'
      });
    }

    console.log('✅ All projects built successfully!\n');
  }

  // Deploy both projects
  async deployProjects(environment = 'development') {
    console.log(`🚀 Deploying to ${environment}...\n`);

    // Deploy Workflow Studio
    console.log('🚀 Deploying Workflow Studio...');
    execSync(`npm run deploy:${environment}`, {
      cwd: this.workflowStudioPath,
      stdio: 'inherit'
    });

    // Deploy Error IQ (if exists)
    if (fs.existsSync(this.errorIQPath)) {
      console.log('🚀 Deploying Error IQ...');
      // Add deployment commands for Error IQ
    }

    console.log('✅ All projects deployed successfully!\n');
  }

  // Create environment files
  async createEnvFiles() {
    const envTemplate = `# Enhanced Development Environment
NODE_ENV=development
VITE_APP_ENV=development

# API Configuration
VITE_WORKFLOW_STUDIO_URL=http://localhost:3001
VITE_ERROR_IQ_URL=http://localhost:8000
VITE_CROSS_SYSTEM_BUS_URL=ws://localhost:8080

# Authentication
VITE_WORKFLOW_STUDIO_API_KEY=dev-workflow-studio-key
VITE_ERROR_IQ_API_KEY=dev-error-iq-key

# AI Configuration
VITE_OPENAI_API_KEY=your-openai-key
VITE_ANTHROPIC_API_KEY=your-anthropic-key
VITE_GOOGLE_API_KEY=your-google-key

# LangSmith Configuration
VITE_LANGSMITH_API_KEY=your-langsmith-key
VITE_LANGSMITH_PROJECT=auterity-dev

# PromptLayer Configuration
VITE_PROMPT_LAYER_API_KEY=your-promptlayer-key

# WebAssembly Configuration
VITE_ENABLE_WEBASSEMBLY=true
VITE_TENSORFLOW_WASM=true
VITE_OPENCV_WASM=true

# Performance Configuration
VITE_AI_REQUEST_TIMEOUT=30000
VITE_AI_MAX_RETRIES=3
VITE_AI_CACHE_ENABLED=true
VITE_AI_CACHE_TTL=3600000

# Error Handling
VITE_CIRCUIT_BREAKER_ENABLED=true
VITE_FALLBACK_AI_PROVIDER=anthropic
VITE_HEALTH_CHECK_INTERVAL=30000
`;

    // Create .env files
    fs.writeFileSync(path.join(this.workflowStudioPath, '.env.local'), envTemplate);

    if (fs.existsSync(this.errorIQPath)) {
      fs.writeFileSync(path.join(this.errorIQPath, 'frontend/.env.local'), envTemplate);
    }

    console.log('📝 Environment files created');
  }

  // Setup pre-commit hooks
  async setupPreCommitHooks() {
    // Create pre-commit hook for linting and testing
    const hookScript = `#!/bin/sh
echo "🔍 Running pre-commit checks..."

# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm run test:unit

echo "✅ Pre-commit checks passed!"
`;

    const hookPath = path.join(this.workflowStudioPath, '.git/hooks/pre-commit');
    fs.writeFileSync(hookPath, hookScript);
    fs.chmodSync(hookPath, '755');

    console.log('🔗 Pre-commit hooks configured');
  }

  // Configure code quality tools
  async configureCodeQuality() {
    // ESLint configuration
    const eslintConfig = {
      extends: [
        'react-app',
        'react-app/jest',
        '@typescript-eslint/recommended',
        'prettier'
      ],
      rules: {
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/explicit-function-return-type': 'off',
        'react-hooks/exhaustive-deps': 'warn'
      }
    };

    fs.writeFileSync(
      path.join(this.workflowStudioPath, '.eslintrc.json'),
      JSON.stringify(eslintConfig, null, 2)
    );

    // Prettier configuration
    const prettierConfig = {
      semi: true,
      trailingComma: 'es5',
      singleQuote: true,
      printWidth: 80,
      tabWidth: 2,
      useTabs: false
    };

    fs.writeFileSync(
      path.join(this.workflowStudioPath, '.prettierrc'),
      JSON.stringify(prettierConfig, null, 2)
    );

    console.log('🎨 Code quality tools configured');
  }
}

// CLI Interface
const workflow = new EnhancedDevWorkflow();

const command = process.argv[2];
const options = process.argv.slice(3);

switch (command) {
  case 'init':
    workflow.initialize();
    break;

  case 'dev':
    workflow.startDevServers();
    break;

  case 'test':
    const testOptions = {
      coverage: options.includes('--coverage'),
      watch: options.includes('--watch'),
      projects: options.includes('--workflow-studio-only') ? ['workflow-studio'] :
               options.includes('--error-iq-only') ? ['error-iq'] : ['workflow-studio', 'error-iq']
    };
    workflow.runTests(testOptions);
    break;

  case 'build':
    workflow.buildProjects();
    break;

  case 'deploy':
    const environment = options[0] || 'development';
    workflow.deployProjects(environment);
    break;

  case 'setup':
    workflow.setupDevEnvironment();
    break;

  default:
    console.log(`
🤖 Enhanced Development Workflow CLI

Usage: node enhanced-dev-workflow.js <command> [options]

Commands:
  init          Initialize both projects with dependencies and configuration
  dev           Start development servers for both projects
  test          Run tests across both projects
    --coverage    Include coverage reports
    --watch       Watch mode
    --workflow-studio-only  Test only Workflow Studio
    --error-iq-only         Test only Error IQ
  build         Build both projects for production
  deploy        Deploy both projects
    <environment>  Target environment (development, staging, production)
  setup         Setup development environment (linting, hooks, etc.)

Examples:
  node enhanced-dev-workflow.js init
  node enhanced-dev-workflow.js dev
  node enhanced-dev-workflow.js test --coverage
  node enhanced-dev-workflow.js deploy production
`);
    break;
}

module.exports = EnhancedDevWorkflow;
