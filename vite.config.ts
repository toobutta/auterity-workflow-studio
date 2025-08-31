import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - only enabled when ANALYZE=true
    ...(process.env.ANALYZE === 'true' ? [visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })] : [])
  ],
  server: {
    port: 5173,
    open: true,
    // Enable HMR with better performance
    hmr: {
      overlay: true
    }
  },
  build: {
    // Optimize build output
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: process.env.NODE_ENV === 'development',

    rollupOptions: {
      output: {
        // Intelligent chunk splitting for better caching
        manualChunks: (id) => {
          // Vendor libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('pixi.js')) {
              return 'pixi-vendor';
            }
            if (id.includes('zustand') || id.includes('immer')) {
              return 'state-vendor';
            }
            if (id.includes('zod') || id.includes('date-fns')) {
              return 'utils-vendor';
            }
            if (id.includes('@headlessui') || id.includes('framer-motion')) {
              return 'ui-vendor';
            }
            // Other node_modules go to vendor
            return 'vendor';
          }

          // Application code chunks
          if (id.includes('/src/hooks/')) {
            return 'hooks';
          }
          if (id.includes('/src/utils/')) {
            return 'utils';
          }
          if (id.includes('/src/components/')) {
            return 'components';
          }
          if (id.includes('/src/services/')) {
            return 'services';
          }
        },

        // Optimize asset naming for better caching
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return `assets/[name]-[hash][extname]`;

          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/\.(css)$/i.test(assetInfo.name)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },

        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },

      // External dependencies that shouldn't be bundled
      external: []
    },

    // Performance optimizations
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false, // Disabled for faster builds
  },

  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'zustand',
      'immer',
      'zod',
      'date-fns',
      'clsx'
    ],
    exclude: []
  },

  // Environment variables
  envPrefix: 'VITE_',

  // Preview server configuration
  preview: {
    port: 4173,
    open: true
  }
})
