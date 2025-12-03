import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // Proxy all API requests to backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/doctors': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/patients': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/bills': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/dashboard': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/reports': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})