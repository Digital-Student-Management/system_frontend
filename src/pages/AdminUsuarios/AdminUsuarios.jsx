import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiUsers, FiArrowLeft, FiTrash2, FiSearch, FiAlertTriangle, FiInfo } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { getAll, remove } from '../../services/usuarioService'

const ROLES_ADMIN = ['ADMIN', 'DIRECTIVO']
const TIPOS = ['TODOS', 'ESTUDIANTE', 'APODERADO', 'DOCENTE', 'INSPECTOR', 'DIRECTIVO']

export default function AdminUsuarios() {
  const { usuario } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('TODOS')

  const cargar = async () => {
    setLoading(true)
    try {
      const res = await getAll()
      setUsuarios(res.data || [])
    } catch (err) {
      console.error('Error cargando usuarios:', err)
      toast.error('No se pudieron cargar los usuarios.')
    } finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  const handleEliminar = async (id, nombre) => {
    if (String(id) === String(usuario?.id)) {
      toast.warning('No puedes eliminar tu propia cuenta mientras la usas.')
      return
    }
    if (!window.confirm(`¿Eliminar al usuario ${nombre}? Esta acción no se puede deshacer.`)) return
    setLoading(true)
    try { await remove(id); toast.success('Usuario eliminado.'); cargar() }
    catch (err) { console.error(err); toast.error('No se pudo eliminar el usuario.') }
    finally { setLoading(false) }
  }

  const nombre = (u) => [u.pnombreUsuario, u.appaternoUsuario, u.apmaternoUsuario].filter(Boolean).join(' ')

  const filtrados = usuarios.filter((u) => {
    const coincideTipo = filtroTipo === 'TODOS' || u.tipoUsuario === filtroTipo
    const texto = `${nombre(u)} ${u.rutUsuario} ${u.correoUsuario}`.toLowerCase()
    return coincideTipo && texto.includes(busqueda.toLowerCase())
  })

  if (!ROLES_ADMIN.includes(usuario?.rol)) {
    return (
      <div className="admin-forbidden">
        <FiAlertTriangle className="icon-warn" />
        <h2>Acceso Restringido</h2>
        <p>Esta sección es solo para Administradores y Directivos.</p>
        <Link to="/" className="btn-back-home"><FiArrowLeft /> Volver al Inicio</Link>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="title-section">
          <FiUsers className="icon-title" />
          <div>
            <h1>Gestión de Usuarios</h1>
            <p>Directorio de cuentas del sistema. Las nuevas cuentas se crean desde el registro.</p>
          </div>
        </div>
        <Link to="/admin" className="btn-back-home"><FiArrowLeft /> Volver al Panel</Link>
      </header>

      <div className="admin-toolbar">
        <div className="toolbar-left">
          <input className="admin-search" placeholder="Buscar por nombre, RUT o correo…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          <select className="admin-filter" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            {TIPOS.map((t) => <option key={t} value={t}>{t === 'TODOS' ? 'Todos los roles' : t}</option>)}
          </select>
        </div>
        <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, color: '#64748B' }}>
          <FiSearch /> {filtrados.length} de {usuarios.length}
        </span>
      </div>

      {loading && usuarios.length === 0 ? (
        <div className="admin-empty"><p>Cargando…</p></div>
      ) : usuarios.length === 0 ? (
        <div className="admin-empty">
          <FiUsers className="empty-icon" />
          <p>No hay usuarios registrados. Crea cuentas desde la pantalla de registro del login.</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="admin-empty"><FiInfo className="empty-icon" /><p>Ningún usuario coincide con el filtro.</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>RUT</th><th>Correo</th><th>Rol</th><th>Estado</th><th style={{ width: '70px' }}>Acción</th></tr>
            </thead>
            <tbody>
              {filtrados.map((u) => (
                <tr key={u.id}>
                  <td className="mono">#{u.id}</td>
                  <td><strong>{nombre(u)}</strong></td>
                  <td className="mono">{u.rutUsuario}</td>
                  <td>{u.correoUsuario}</td>
                  <td><span className={`rol-pill ${(u.tipoUsuario || '').toLowerCase()}`}>{u.tipoUsuario || '—'}</span></td>
                  <td><span className={`estado-pill ${(u.estadoUsuario || 'activo').toLowerCase()}`}>{u.estadoUsuario || 'ACTIVO'}</span></td>
                  <td>
                    <div className="row-actions">
                      <button className="del" onClick={() => handleEliminar(u.id, nombre(u))} title="Eliminar"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
