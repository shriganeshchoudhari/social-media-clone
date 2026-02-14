import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
    include: ['src/**/*.test.jsx', 'src/**/*.test.js']
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      overlay: false
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://localhost:8081',
        ws: true,
        changeOrigin: true,
      }
    }
  }
})
