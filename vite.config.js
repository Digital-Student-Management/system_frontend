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
      '/api/evaluaciones': {
        target: 'http://localhost:8085',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/evaluaciones/, '/evaluacion')
      },
      '/api/notas': {
        target: 'http://localhost:8085',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/notas/, '/nota')
      },
      '/api/cursos': {
        target: 'http://localhost:8082',
        changeOrigin: true
      },
      '/api/niveles': {
        target: 'http://localhost:8082',
        changeOrigin: true
      },
      '/api/salas': {
        target: 'http://localhost:8082',
        changeOrigin: true
      },
      '/api/asignaturas': {
        target: 'http://localhost:8081',
        changeOrigin: true
      },
      '/api/bitacoras': {
        target: 'http://localhost:8081',
        changeOrigin: true
      },
      '/api/bitacora': {
        target: 'http://localhost:8084',
        changeOrigin: true
      },
      '/api/mensajes': {
        target: 'http://localhost:8086',
        changeOrigin: true
      },
      '/api': {
        target: 'http://localhost:8089',
        changeOrigin: true
      }
    }
  }
})
