import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// Enhanced Vite configuration for optimized builds
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Enable JSX runtime
      jsxRuntime: 'automatic'
    }),

    // Bundle analyzer (only in analyze mode)
    ...(process.env.ANALYZE ? [
      visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true
      })
    ] : [])
  ],

  // Enhanced build configuration
  build: {
    // Output configuration
    outDir: 'dist',
    assetsDir: 'assets',

    // Code splitting and optimization
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // React and core libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // UI libraries
          'ui-vendor': ['framer-motion', 'pixi.js', 'yjs', 'y-webrtc'],

          // AI and ML libraries
          'ai-vendor': ['ai', '@ai-sdk/openai', '@ai-sdk/anthropic', '@ai-sdk/google'],

          // Data visualization
          'viz-vendor': ['d3', 'recharts', 'react-window'],

          // Utilities
          'utils-vendor': ['zod', 'immer', 'zustand', 'date-fns']
        },

        // Optimize chunk names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },

    // Optimization settings
    minify: 'esbuild',
    sourcemap: process.env.NODE_ENV === 'development',

    // Bundle size limits
    chunkSizeWarningLimit: 1000,

    // Target modern browsers for better performance
    target: 'esnext',

    // Enable CSS code splitting
    cssCodeSplit: true,

    // Report compressed size
    reportCompressedSize: true
  },

  // Enhanced development server
  server: {
    host: 'localhost',
    port: 3000,
    open: true,

    // Proxy configuration for API calls
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    },

    // Hot Module Replacement (HMR)
    hmr: {
      overlay: true
    }
  },

  // Enhanced dependency optimization
  optimizeDeps: {
    // Pre-bundle these dependencies for faster dev server startup
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'pixi.js',
      '@ai-sdk/openai',
      '@ai-sdk/anthropic',
      'zod'
    ],

    // Exclude these from pre-bundling (they might cause issues)
    exclude: [
      'ollama' // Dynamic import
    ]
  },

  // Enhanced resolve configuration
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@services': '/src/services',
      '@hooks': '/src/hooks',
      '@utils': '/src/utils',
      '@types': '/src/types',
      '@pages': '/src/pages',
      '@enhanced': '/src/services/enhanced'
    }
  },

  // Enhanced CSS configuration
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase'
    },
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/styles/variables.scss";'
      }
    }
  },

  // Enhanced testing configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**'
      ]
    }
  },

  // Enhanced preview configuration
  preview: {
    host: 'localhost',
    port: 3001,
    open: true
  }
})