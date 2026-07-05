import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

/**
 * useAuth — Hook consumidor del AuthContext del GED.
 *
 * Uso:
 *   const { usuario, isAuthenticated, hasRole, login, logout } = useAuth()
 *
 * Lanza un error descriptivo si se usa fuera del árbol de AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
