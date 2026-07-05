import axios from 'axios'

/**
 * axiosConfig.js — Instancia central de axios para el GED.
 *
 * TODOS los services importan `api` de aquí, nunca `axios` directamente.
 * Si usas axios sin pasar por este config, las peticiones salen sin el
 * token JWT y el backend las rechaza con 401.
 *
 * La URL base se lee de la variable de entorno VITE_API_URL.
 * En desarrollo, Vite tiene el proxy configurado en vite.config.js,
 * así que '/api' funciona aunque no definas VITE_API_URL.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
})

// ---------------------------------------------------------------------------
// Interceptor de REQUEST
// Adjunta el token JWT en cada petición automáticamente.
// Ningún service necesita preocuparse de incluirlo a mano.
// ---------------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ged_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ---------------------------------------------------------------------------
// Interceptor de RESPONSE
// Si el token expiró (401), limpia la sesión y redirige al login.
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ged_token')
      localStorage.removeItem('ged_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
