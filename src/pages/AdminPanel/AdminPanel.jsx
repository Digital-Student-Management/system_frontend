import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FiSettings,
  FiArrowLeft,
  FiUsers,
  FiLayers,
  FiBookOpen,
  FiHome,
  FiShield,
  FiAlertTriangle
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { getAll as getUsuarios } from '../../services/usuarioService'
import { getAll as getCursos, getSalas } from '../../services/cursoService'
import { getAll as getAsignaturas } from '../../services/asignaturaService'

const ROLES_ADMIN = ['ADMIN', 'DIRECTIVO']

const MODULOS = [
  { to: '/admin/usuarios', icon: <FiUsers />, titulo: 'Usuarios', desc: 'Directorio, roles, estados y eliminación de cuentas.' },
  { to: '/admin/cursos', icon: <FiLayers />, titulo: 'Cursos y Niveles', desc: 'Crea niveles y cursos con sala y profesor jefe.' },
  { to: '/admin/asignaturas', icon: <FiBookOpen />, titulo: 'Asignaturas', desc: 'Gestiona las asignaturas y sus horas semanales.' },
  { to: '/admin/salas', icon: <FiHome />, titulo: 'Salas', desc: 'Administra las salas y su capacidad máxima.' }
]

/**
 * AdminPanel — Centro de administración. Muestra métricas globales y da
 * acceso a los módulos de gestión de datos maestros. Solo ADMIN y DIRECTIVO.
 */
export default function AdminPanel() {
  const { usuario } = useAuth()
  const [stats, setStats] = useState({ usuarios: 0, cursos: 0, asignaturas: 0, salas: 0 })

  useEffect(() => {
    const cargar = async () => {
      try {
        const [u, c, a, s] = await Promise.all([
          getUsuarios().catch(() => ({ data: [] })),
          getCursos().catch(() => ({ data: [] })),
          getAsignaturas().catch(() => ({ data: [] })),
          getSalas().catch(() => ({ data: [] }))
        ])
        setStats({
          usuarios: (u.data || []).length,
          cursos: (c.data || []).length,
          asignaturas: (a.data || []).length,
          salas: (s.data || []).length
        })
      } catch (err) {
        console.error('Error cargando estadísticas:', err)
      }
    }
    cargar()
  }, [])

  if (!ROLES_ADMIN.includes(usuario?.rol)) {
    return (
      <div className="admin-forbidden">
        <FiAlertTriangle className="icon-warn" />
        <h2>Acceso Restringido</h2>
        <p>El Panel de Administración está disponible solo para Administradores y Directivos.</p>
        <Link to="/" className="btn-back-home"><FiArrowLeft /> Volver al Inicio</Link>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="title-section">
          <FiSettings className="icon-title" />
          <div>
            <h1>Panel de Administración</h1>
            <p>Gestión central de datos maestros del establecimiento.</p>
          </div>
        </div>
        <Link to="/" className="btn-back-home">
          <FiArrowLeft /> Volver al Inicio
        </Link>
      </header>

      <section className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="stat-icon"><FiUsers /></span>
          <div className="stat-info"><span className="stat-value">{stats.usuarios}</span><span className="stat-label">Usuarios</span></div>
        </div>
        <div className="admin-stat-card">
          <span className="stat-icon"><FiLayers /></span>
          <div className="stat-info"><span className="stat-value">{stats.cursos}</span><span className="stat-label">Cursos</span></div>
        </div>
        <div className="admin-stat-card">
          <span className="stat-icon"><FiBookOpen /></span>
          <div className="stat-info"><span className="stat-value">{stats.asignaturas}</span><span className="stat-label">Asignaturas</span></div>
        </div>
        <div className="admin-stat-card">
          <span className="stat-icon"><FiHome /></span>
          <div className="stat-info"><span className="stat-value">{stats.salas}</span><span className="stat-label">Salas</span></div>
        </div>
      </section>

      <section className="admin-section">
        <h2 className="section-title"><FiShield /> Módulos de Gestión</h2>
        <div className="admin-modules-grid">
          {MODULOS.map((m) => (
            <Link to={m.to} className="admin-module-card" key={m.to}>
              <span className="module-icon">{m.icon}</span>
              <h3>{m.titulo}</h3>
              <p>{m.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
