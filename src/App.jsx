import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'

// Los imports de páginas y componentes se agregarán a medida que se desarrollen.
// Este archivo actúa como el mapa de rutas del sistema GED.
// Roles del sistema: ESTUDIANTE, DOCENTE, APODERADO, INSPECTOR, DIRECTIVO, FUNCIONARIO, ADMIN

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/*
           * Las rutas se agregarán progresivamente según el módulo:
           *
           * PÚBLICAS (sin layout):
           *   /login
           *
           * PRIVADAS - ESTUDIANTE:
           *   /mis-notas, /mi-horario, /mi-asistencia, /mensajes, /calendario
           *
           * PRIVADAS - DOCENTE:
           *   /mis-cursos, /registro-notas, /registro-asistencia, /mensajes, /calendario
           *
           * PRIVADAS - APODERADO:
           *   /mi-estudiante, /mensajes, /calendario, /reuniones
           *
           * PRIVADAS - INSPECTOR:
           *   /asistencia, /anotaciones, /mensajes
           *
           * PRIVADAS - DIRECTIVO:
           *   /dashboard, /reportes, /mensajes
           *
           * PRIVADAS - FUNCIONARIO:
           *   /matriculas, /usuarios, /mensajes
           *
           * ADMIN:
           *   /admin, /admin/usuarios, /admin/cursos, /admin/asignaturas
           */}

          {/* Catch-all: cualquier URL desconocida va a login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* ToastContainer definido aquí = disponible en toda la app */}
        <ToastContainer position="top-right" autoClose={4000} theme="light" />
      </BrowserRouter>
    </AuthProvider>
  )
}
