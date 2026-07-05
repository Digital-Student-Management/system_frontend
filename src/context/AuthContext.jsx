import { createContext, useState, useCallback } from 'react'
import PropTypes from 'prop-types'

export const AuthContext = createContext(null)

/**
 * AuthProvider — Proveedor global de autenticación para el GED.
 *
 * Expone:
 *   token          → JWT de sesión
 *   usuario        → { rut, nombre, email, rol }
 *   login(t, u)    → guarda sesión en estado + localStorage
 *   logout()       → limpia sesión
 *   isAuthenticated → boolean
 *   hasRole(rol)   → string o array: hasRole('DOCENTE') | hasRole(['DOCENTE','DIRECTIVO'])
 *
 * Roles del sistema GED:
 *   ESTUDIANTE | DOCENTE | APODERADO | INSPECTOR | DIRECTIVO | FUNCIONARIO | ADMIN
 */
export function AuthProvider({ children }) {
  // Lazy initializer: se ejecuta solo una vez al montar (localStorage.getItem es I/O)
  const [token, setToken] = useState(() => localStorage.getItem('ged_token'))
  const [usuario, setUsuario] = useState(() => {
    const stored = localStorage.getItem('ged_user')
    return stored ? JSON.parse(stored) : null
  })

  // useCallback: login/logout no se recrean en cada render de AuthProvider
  const login = useCallback((newToken, userData) => {
    localStorage.setItem('ged_token', newToken)
    localStorage.setItem('ged_user', JSON.stringify(userData))
    setToken(newToken)
    setUsuario(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('ged_token')
    localStorage.removeItem('ged_user')
    setToken(null)
    setUsuario(null)
  }, [])

  // Solo autenticado si existen TANTO el token como los datos del usuario
  const isAuthenticated = !!token && !!usuario

  // Acepta string: hasRole('ADMIN')
  // O array:       hasRole(['ADMIN', 'DIRECTIVO'])
  const hasRole = useCallback((rol) => {
    if (!usuario) return false
    if (Array.isArray(rol)) return rol.includes(usuario.rol)
    return usuario.rol === rol
  }, [usuario])

  return (
    <AuthContext.Provider value={{ token, usuario, login, logout, isAuthenticated, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

AuthProvider.propTypes = { children: PropTypes.node.isRequired }
