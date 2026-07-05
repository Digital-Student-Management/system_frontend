import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // Usa el compilador moderno de Sass (evita warnings de deprecación)
        api: 'modern-compiler'
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      // Todas las peticiones a /api se redirigen al backend en desarrollo.
      // Así evitas CORS sin tocar el backend: el navegador cree que habla
      // con el mismo servidor (localhost:5173) y Vite lo redirige internamente.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
