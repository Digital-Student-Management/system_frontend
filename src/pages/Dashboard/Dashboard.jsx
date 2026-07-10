import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { FaSchool } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import {
  FiLogOut,
  FiUser,
  FiBookOpen,
  FiCalendar,
  FiFileText,
  FiUsers,
  FiAlertCircle,
  FiAward,
  FiMail,
  FiGrid,
  FiClipboard,
  FiLayers,
  FiHome,
  FiMenu,
  FiX,
  FiSettings
} from 'react-icons/fi'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import './Dashboard.scss'

export default function Dashboard() {
  const { usuario, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const cerrarMenu = () => setMenuOpen(false)

  // Datos mock para gráficos y widgets según rol
  const dataNotas = [
    { name: 'Matemática', nota: 6.2 },
    { name: 'Lenguaje', nota: 5.8 },
    { name: 'Ciencias', nota: 6.5 },
    { name: 'Historia', nota: 6.0 },
    { name: 'Inglés', nota: 6.8 }
  ]

  const dataAsistenciaGeneral = [
    { name: 'Asistentes', value: 870 },
    { name: 'Ausentes', value: 30 }
  ]
  const COLORS = ['#2563EB', '#EF4444']

  const renderRoleDashboard = () => {
    switch (usuario.rol) {
      case 'ESTUDIANTE':
        return (
          <div className="role-dashboard-content animate-fade-in">
            <h2>Resumen Académico</h2>
            <div className="widgets-grid">
              <div className="widget-card stats-card">
                <h3>Promedio General</h3>
                <p className="big-stat">6.3</p>
                <span className="stat-sub">Posición: 3º en el curso</span>
              </div>
              <div className="widget-card stats-card">
                <h3>Asistencia</h3>
                <p className="big-stat">96.5%</p>
                <span className="stat-sub">Total días: 82 / 85</span>
              </div>
              <div className="widget-card stats-card">
                <h3>Anotaciones</h3>
                <p className="big-stat positive">2</p>
                <span className="stat-sub">Positivas: 2 · Negativas: 0</span>
              </div>
            </div>

            <div className="dashboard-charts-section">
              <div className="chart-wrapper">
                <h3>Mis Calificaciones por Asignatura</h3>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={dataNotas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={11} tickLine={false} />
                      <YAxis domain={[1, 7]} fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="nota" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={45}>
                        {dataNotas.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.nota >= 4 ? '#2563EB' : '#EF4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="widget-card list-card">
                <h3>Próximas Evaluaciones</h3>
                <ul className="dashboard-list">
                  <li>
                    <FiCalendar />
                    <div>
                      <strong>Prueba de Matemática</strong>
                      <span>Álgebra y funciones · Jueves 9 de Julio</span>
                    </div>
                  </li>
                  <li>
                    <FiCalendar />
                    <div>
                      <strong>Control de Lectura</strong>
                      <span>"La amortajada" · Lunes 13 de Julio</span>
                    </div>
                  </li>
                  <li>
                    <FiCalendar />
                    <div>
                      <strong>Presentación de Ciencias</strong>
                      <span>Física: Termodinámica · Viernes 17 de Julio</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 'DOCENTE':
        return (
          <div className="role-dashboard-content animate-fade-in">
            <h2>Panel del Docente</h2>
            <div className="widgets-grid">
              <div className="widget-card stats-card">
                <h3>Mis Asignaturas</h3>
                <p className="big-stat">4</p>
                <span className="stat-sub">Horas semanales: 22</span>
              </div>
              <div className="widget-card stats-card">
                <h3>Alumnos a Cargo</h3>
                <p className="big-stat">124</p>
                <span className="stat-sub">Distribuidos en 3 cursos</span>
              </div>
              <div className="widget-card stats-card">
                <h3>Evaluaciones Pendientes</h3>
                <p className="big-stat warning">3</p>
                <span className="stat-sub">Por revisar o calificar</span>
              </div>
            </div>

            <div className="dashboard-charts-section">
              <div className="widget-card list-card">
                <h3>Mis Cursos y Horarios</h3>
                <ul className="dashboard-list">
                  <li>
                    <FiBookOpen />
                    <div>
                      <strong>1º Medio A · Matemática</strong>
                      <span>Sala 102 · Bloque 1 (08:00 - 09:30)</span>
                    </div>
                  </li>
                  <li>
                    <FiBookOpen />
                    <div>
                      <strong>2º Medio B · Física</strong>
                      <span>Laboratorio de Ciencias · Bloque 2 (09:45 - 11:15)</span>
                    </div>
                  </li>
                  <li>
                    <FiBookOpen />
                    <div>
                      <strong>4º Medio A · Álgebra Avanzada</strong>
                      <span>Sala 204 · Bloque 4 (13:00 - 14:30)</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="widget-card list-card">
                <h3>Tareas Rápidas</h3>
                <ul className="dashboard-list interactive">
                  <li className="clickable">
                    <FiFileText />
                    <div>
                      <strong>Registrar asistencia</strong>
                      <span>1º Medio A</span>
                    </div>
                  </li>
                  <li className="clickable">
                    <FiFileText />
                    <div>
                      <strong>Subir notas de control</strong>
                      <span>Física (2º Medio B)</span>
                    </div>
                  </li>
                  <li className="clickable">
                    <FiBookOpen />
                    <div>
                      <strong>Completar bitácora curricular</strong>
                      <span>Registrar objetivos de aprendizaje</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 'APODERADO':
        return (
          <div className="role-dashboard-content animate-fade-in">
            <h2>Ficha de Pupilo</h2>
            <div className="student-profile-summary">
              <div className="student-avatar">🧒</div>
              <div>
                <h3>Tomás Ignacio Vidal</h3>
                <p>Curso: 7º Básico B · Profesor Jefe: Darío Meza</p>
              </div>
            </div>

            <div className="widgets-grid">
              <div className="widget-card stats-card">
                <h3>Promedio Parcial</h3>
                <p className="big-stat">6.1</p>
                <span className="stat-sub">Calificaciones ingresadas: 14</span>
              </div>
              <div className="widget-card stats-card">
                <h3>Asistencia Acumulada</h3>
                <p className="big-stat">98.2%</p>
                <span className="stat-sub">Inasistencias justificadas: 1</span>
              </div>
              <div className="widget-card stats-card">
                <h3>Última Observación</h3>
                <p className="big-stat positive">Fav</p>
                <span className="stat-sub">"Destacada participación en acto"</span>
              </div>
            </div>

            <div className="dashboard-charts-section">
              <div className="widget-card list-card">
                <h3>Citaciones y Reuniones</h3>
                <ul className="dashboard-list">
                  <li className="warning-border">
                    <FiCalendar />
                    <div>
                      <strong>Reunión General de Apoderados</strong>
                      <span>Miércoles 15 de Julio · 19:00 hrs · Comedor Principal</span>
                    </div>
                  </li>
                  <li>
                    <FiUser />
                    <div>
                      <strong>Entrevista Individual con Profesor Jefe</strong>
                      <span>Viernes 24 de Julio · 15:30 hrs · Oficina de Apoyo</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 'INSPECTOR':
        return (
          <div className="role-dashboard-content animate-fade-in">
            <h2>Panel de Inspectoría y Convivencia</h2>
            <div className="widgets-grid">
              <div className="widget-card stats-card">
                <h3>Atrasos Hoy</h3>
                <p className="big-stat warning">12</p>
                <span className="stat-sub">Registrados en portería</span>
              </div>
              <div className="widget-card stats-card">
                <h3>Anotaciones Conductuales</h3>
                <p className="big-stat">5</p>
                <span className="stat-sub">Ingresadas durante la semana</span>
              </div>
              <div className="widget-card stats-card">
                <h3>Solicitudes de Citación</h3>
                <p className="big-stat info">2</p>
                <span className="stat-sub">Apoderados citados para mañana</span>
              </div>
            </div>

            <div className="dashboard-charts-section">
              <div className="chart-wrapper">
                <h3>Asistencia Institucional del Día</h3>
                <div style={{ width: '100%', height: 200, display: 'flex', justifyContent: 'center' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={dataAsistenciaGeneral}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {dataAsistenciaGeneral.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-legend">
                  <span className="legend-item"><span className="dot primary"></span> Asistentes (96.7%)</span>
                  <span className="legend-item"><span className="dot danger"></span> Ausentes (3.3%)</span>
                </div>
              </div>

              <div className="widget-card list-card">
                <h3>Actividades Pendientes</h3>
                <ul className="dashboard-list interactive">
                  <li className="clickable">
                    <FiAlertCircle />
                    <div>
                      <strong>Ingresar reporte de conducta</strong>
                      <span>Incidente durante el recreo de las 11:15</span>
                    </div>
                  </li>
                  <li className="clickable">
                    <FiUsers />
                    <div>
                      <strong>Controlar atrasos de segundo bloque</strong>
                      <span>Validar firmas de justificación</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )

      default:
        // DIRECTIVO, FUNCIONARIO, ADMIN
        return (
          <div className="role-dashboard-content animate-fade-in">
            <h2>Panel de Control y Reportes Directivos</h2>
            <div className="widgets-grid">
              <div className="widget-card stats-card">
                <h3>Matrícula Total</h3>
                <p className="big-stat">900</p>
                <span className="stat-sub">Capacidad máxima: 950</span>
              </div>
              <div className="widget-card stats-card">
                <h3>Rendimiento General</h3>
                <p className="big-stat">5.9</p>
                <span className="stat-sub">Meta institucional: 6.0</span>
              </div>
              <div className="widget-card stats-card">
                <h3>Asistencia Promedio</h3>
                <p className="big-stat">94.8%</p>
                <span className="stat-sub">Semana actual</span>
              </div>
            </div>

            <div className="dashboard-charts-section">
              <div className="chart-wrapper full-width">
                <h3>Monitoreo de Calificaciones por Curso</h3>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={[
                        { name: '1º Básico', promedio: 6.4 },
                        { name: '4º Básico', promedio: 6.1 },
                        { name: '7º Básico', promedio: 5.7 },
                        { name: '1º Medio', promedio: 5.5 },
                        { name: '4º Medio', promedio: 5.9 }
                      ]}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={11} tickLine={false} />
                      <YAxis domain={[1, 7]} fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="promedio" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="dashboard-layout">
      {/* Top Navbar */}
      <nav className="dashboard-navbar">
        <div className="navbar-logo">
          <span className="logo-icon"><FaSchool /></span>
          <span className="logo-text">Colegio Bernardo O'Higgins</span>
        </div>

        {/* Botón de menú (responsive) */}
        <button
          type="button"
          className={`navbar-toggle ${menuOpen ? 'is-open' : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menú de navegación"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <div className={`navbar-menu-links ${menuOpen ? 'open' : ''}`} onClick={cerrarMenu}>
          <Link to="/" className="nav-link active"><FiHome /> Inicio</Link>
          {(usuario.rol === 'DOCENTE' || usuario.rol === 'ADMIN') && (
            <Link to="/registro-notas" className="nav-link">
              <FiBookOpen /> Registrar Notas
            </Link>
          )}
          {(usuario.rol === 'ESTUDIANTE' || usuario.rol === 'APODERADO' || usuario.rol === 'ADMIN') && (
            <Link to="/mis-notas" className="nav-link">
              <FiAward /> Mis Notas
            </Link>
          )}
          {(usuario.rol === 'APODERADO' || usuario.rol === 'ESTUDIANTE' || usuario.rol === 'ADMIN') && (
            <Link to="/mi-estudiante" className="nav-link">
              <FiUsers /> {usuario.rol === 'APODERADO' ? 'Mi Pupilo' : 'Mi Ficha'}
            </Link>
          )}
          <Link to="/mis-cursos" className="nav-link">
            <FiLayers /> Cursos
          </Link>
          {(usuario.rol === 'DOCENTE' || usuario.rol === 'ADMIN') && (
            <Link to="/bitacora-asignatura" className="nav-link">
              <FiClipboard /> Bitácora
            </Link>
          )}
          <Link to="/anotaciones" className="nav-link">
            <FiFileText /> Anotaciones
          </Link>
          <Link to="/reuniones" className="nav-link">
            <FiCalendar /> Reuniones
          </Link>
          <Link to="/calendario" className="nav-link">
            <FiCalendar /> Calendario
          </Link>
          {(usuario.rol === 'ADMIN' || usuario.rol === 'DIRECTIVO' || usuario.rol === 'FUNCIONARIO' || usuario.rol === 'APODERADO') && (
            <Link to="/matriculas" className="nav-link">
              <FiFileText /> Matrículas
            </Link>
          )}
          <Link to="/mural" className="nav-link">
            <FiGrid /> Mural
          </Link>
          <Link to="/mensajeria" className="nav-link">
            <FiMail /> Mensajería
          </Link>
          {(usuario.rol === 'ADMIN' || usuario.rol === 'DIRECTIVO') && (
            <Link to="/admin" className="nav-link nav-link-admin">
              <FiSettings /> Administración
            </Link>
          )}
        </div>

        {menuOpen && <div className="navbar-backdrop" onClick={cerrarMenu} />}

        <div className="navbar-user-section">
          <Link to="/mi-perfil" className="user-info" title="Ver mi perfil">
            <span className="user-avatar-mini"><FiUser /></span>
            <span className="user-text">
              <span className="user-name">{usuario.nombre}</span>
              <span className={`user-role-badge ${usuario.rol.toLowerCase()}`}>{usuario.rol}</span>
            </span>
          </Link>
          <button type="button" className="btn-logout" onClick={logout} title="Cerrar Sesión">
            <FiLogOut />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <header className="dashboard-header-banner">
          <h1>¡Hola, {usuario.nombre.split(' ')[0]}!</h1>
          <p>Bienvenido al portal escolar del Colegio Bernardo O'Higgins.</p>
        </header>

        {renderRoleDashboard()}
      </main>
    </div>
  )
}
