import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute/PrivateRoute'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'

// Roles del sistema: ESTUDIANTE, DOCENTE, APODERADO, INSPECTOR, DIRECTIVO, FUNCIONARIO, ADMIN

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta Pública */}
          <Route path="/login" element={<Login />} />

          {/* Ruta Privada Protegida */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
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
