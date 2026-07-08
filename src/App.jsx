import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute/PrivateRoute'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import RegistroNotas from './pages/RegistroNotas/RegistroNotas'
import MisNotas from './pages/MisNotas/MisNotas'
import Anotaciones from './pages/Anotaciones/Anotaciones'

// Roles del sistema: ESTUDIANTE, DOCENTE, APODERADO, INSPECTOR, DIRECTIVO, FUNCIONARIO, ADMIN

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta Pública */}
          <Route path="/login" element={<Login />} />

          {/* Ruta Privada Protegida - Dashboard */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Ruta Privada: Registro de Notas (Docentes) */}
          <Route
            path="/registro-notas"
            element={
              <PrivateRoute roles={['DOCENTE', 'ADMIN']}>
                <RegistroNotas />
              </PrivateRoute>
            }
          />

          {/* Ruta Privada: Mis Notas (Estudiantes/Apoderados) */}
          <Route
            path="/mis-notas"
            element={
              <PrivateRoute roles={['ESTUDIANTE', 'APODERADO', 'ADMIN']}>
                <MisNotas />
              </PrivateRoute>
            }
          />

          {/* Ruta Privada: Anotaciones y Conducta (Todos los roles) */}
          <Route
            path="/anotaciones"
            element={
              <PrivateRoute roles={['ESTUDIANTE', 'DOCENTE', 'APODERADO', 'INSPECTOR', 'ADMIN']}>
                <Anotaciones />
              </PrivateRoute>
            }
          />

          {/* Catch-all: cualquier URL desconocida va a login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* ToastContainer definido aquí = disponible en toda la app */}
        <ToastContainer position="top-right" autoClose={4000} theme="light" />
      </BrowserRouter>
    </AuthProvider>
  )
}
