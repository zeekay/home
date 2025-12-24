import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::",
    port: 8080,
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React and routing
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Radix UI components (used heavily)
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-tabs',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-menubar',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-accordion',
          ],
          // CodeMirror (heavy - used by terminal/editor)
          'vendor-codemirror': [
            'codemirror',
            '@codemirror/lang-javascript',
            '@codemirror/lang-json',
            '@codemirror/lang-markdown',
            '@codemirror/lang-css',
            '@codemirror/lang-html',
            '@codemirror/theme-one-dark',
            '@replit/codemirror-vim',
          ],
          // Charts and data visualization
          'vendor-charts': ['recharts'],
          // Date utilities
          'vendor-date': ['date-fns', 'react-day-picker'],
          // Animation library
          'vendor-animation': ['framer-motion'],
        },
      },
    },
    // Increase chunk size warning threshold
    chunkSizeWarningLimit: 500,
  },
}));
