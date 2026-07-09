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
import Mensajeria from './pages/Mensajeria/Mensajeria'
import MiPerfil from './pages/MiPerfil/MiPerfil'
import MiEstudiante from './pages/MiEstudiante/MiEstudiante'
import MisCursos from './pages/MisCursos/MisCursos'
import BitacoraAsignatura from './pages/BitacoraAsignatura/BitacoraAsignatura'
import Mural from './pages/Mural/Mural'
import Reuniones from './pages/Reuniones/Reuniones'
import AdminPanel from './pages/AdminPanel/AdminPanel'
import AdminUsuarios from './pages/AdminUsuarios/AdminUsuarios'
import AdminCursos from './pages/AdminCursos/AdminCursos'
import AdminAsignaturas from './pages/AdminAsignaturas/AdminAsignaturas'
import AdminSalas from './pages/AdminSalas/AdminSalas'
import Matriculas from './pages/Matriculas/Matriculas'
import Calendario from './pages/Calendario/Calendario'

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

          {/* Ruta Privada: Mensajería (Todos los roles) */}
          <Route
            path="/mensajeria"
            element={
              <PrivateRoute>
                <Mensajeria />
              </PrivateRoute>
            }
          />

          {/* Ruta Privada: Mi Perfil (Todos los roles) */}
          <Route
            path="/mi-perfil"
            element={
              <PrivateRoute>
                <MiPerfil />
              </PrivateRoute>
            }
          />

          {/* Ruta Privada: Mi Estudiante / Ficha (Todos los roles) */}
          <Route
            path="/mi-estudiante"
            element={
              <PrivateRoute>
                <MiEstudiante />
              </PrivateRoute>
            }
          />

          {/* Ruta Privada: Mis Cursos y Asignaturas (Todos los roles) */}
          <Route
            path="/mis-cursos"
            element={
              <PrivateRoute>
                <MisCursos />
              </PrivateRoute>
            }
          />

          {/* Ruta Privada: Bitácora de Asignatura (Docentes) */}
          <Route
            path="/bitacora-asignatura"
            element={
              <PrivateRoute roles={['DOCENTE', 'ADMIN']}>
                <BitacoraAsignatura />
              </PrivateRoute>
            }
          />

          {/* Ruta Privada: Mural Digital (Todos los roles) */}
          <Route
            path="/mural"
            element={
              <PrivateRoute>
                <Mural />
              </PrivateRoute>
            }
          />

          {/* Ruta Privada: Reuniones y Citaciones (Todos los roles) */}
          <Route
            path="/reuniones"
            element={
              <PrivateRoute>
                <Reuniones />
              </PrivateRoute>
            }
          />

          {/* Ruta Privada: Matrículas (gestión + apoderado consulta) */}
          <Route
            path="/matriculas"
            element={
              <PrivateRoute roles={['ADMIN', 'DIRECTIVO', 'FUNCIONARIO', 'APODERADO']}>
                <Matriculas />
              </PrivateRoute>
            }
          />

          {/* Ruta Privada: Calendario Estudiantil (todos los roles) */}
          <Route
            path="/calendario"
            element={
              <PrivateRoute>
                <Calendario />
              </PrivateRoute>
            }
          />

          {/* ───── Panel de Administración (ADMIN y DIRECTIVO) ───── */}
          <Route
            path="/admin"
            element={
              <PrivateRoute roles={['ADMIN', 'DIRECTIVO']}>
                <AdminPanel />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <PrivateRoute roles={['ADMIN', 'DIRECTIVO']}>
                <AdminUsuarios />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/cursos"
            element={
              <PrivateRoute roles={['ADMIN', 'DIRECTIVO']}>
                <AdminCursos />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/asignaturas"
            element={
              <PrivateRoute roles={['ADMIN', 'DIRECTIVO']}>
                <AdminAsignaturas />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/salas"
            element={
              <PrivateRoute roles={['ADMIN', 'DIRECTIVO']}>
                <AdminSalas />
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
