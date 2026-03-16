import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - bibliotecas de terceiros
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          
          // Feature chunks - carregados sob demanda
          'export-libs': ['xlsx', 'jspdf', 'jspdf-autotable'],
          'charts': ['recharts'],
        },
      },
    },
    // Otimizações de chunks
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'terser',
  },
});
