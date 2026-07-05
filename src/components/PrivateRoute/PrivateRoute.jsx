import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import PropTypes from 'prop-types'

/**
 * PrivateRoute — Portero de rutas protegidas del GED.
 *
 * Verifica en orden:
 *   1. ¿Está autenticado? → si no, redirige a /login guardando la URL original
 *   2. ¿Tiene el rol requerido? → si no, redirige a /
 *
 * Uso:
 *   <PrivateRoute roles={['DOCENTE', 'DIRECTIVO']}>
 *     <MiPagina />
 *   </PrivateRoute>
 *
 * Si roles está vacío o no se pasa, solo verifica autenticación.
 */
export default function PrivateRoute({ children, roles }) {
  const { isAuthenticated, hasRole } = useAuth()
  const location = useLocation()

  // Verificación 1: ¿está autenticado?
  // Guarda la URL actual en location.state.from para volver después del login.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Verificación 2: ¿tiene el rol requerido?
  if (roles && roles.length > 0 && !hasRole(roles)) {
    return <Navigate to="/" replace />
  }

  return children
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string)
}
