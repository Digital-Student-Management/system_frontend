import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiUsers, FiArrowLeft, FiTrash2, FiAlertTriangle, FiInfo, FiPlus, FiX, FiUserPlus } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { getAll, remove } from '../../services/usuarioService'
import { registerUser } from '../../services/authService'
import { formatearRut } from '../../validators/rutValidators'

const ROLES_ADMIN = ['ADMIN', 'DIRECTIVO']
const TIPOS = ['TODOS', 'ESTUDIANTE', 'APODERADO', 'DOCENTE', 'INSPECTOR', 'DIRECTIVO', 'FUNCIONARIO']
const ROLES_CREABLES = ['ESTUDIANTE', 'APODERADO', 'DOCENTE', 'INSPECTOR', 'DIRECTIVO', 'FUNCIONARIO']
const FORM_VACIO = { nombreCompleto: '', rut: '', email: '', password: '', rol: 'DOCENTE' }

export default function AdminUsuarios() {
  const { usuario } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('TODOS')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm] = useState(FORM_VACIO)

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

  const handleCrear = async (e) => {
    e.preventDefault()
    if (!form.nombreCompleto.trim() || !form.rut.trim() || !form.email.trim() || !form.password) {
      toast.warning('Completa todos los campos.')
      return
    }
    if (form.password.length < 6) {
      toast.warning('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setLoading(true)
    try {
      await registerUser({
        nombreCompleto: form.nombreCompleto.trim(),
        rut: form.rut.trim(),
        email: form.email.trim(),
        password: form.password,
        rol: form.rol
      })
      toast.success(`Usuario ${form.rol} creado correctamente.`)
      setForm(FORM_VACIO)
      setMostrarForm(false)
      cargar()
    } catch (err) {
      const status = err.response?.status
      if (status === 409) toast.error('El RUT o correo ya está registrado.')
      else if (status === 403) toast.error('No tienes permisos para crear este tipo de cuenta.')
      else toast.error(err.response?.data?.message || 'No se pudo crear el usuario.')
      console.error('Error creando usuario:', err)
    } finally { setLoading(false) }
  }

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
            <p>Directorio de cuentas. Como administrador puedes crear cuentas de personal aquí.</p>
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
        {!mostrarForm && <button className="btn-add" onClick={() => setMostrarForm(true)}><FiUserPlus /> Nuevo Usuario</button>}
      </div>

      {mostrarForm && (
        <form className="admin-form" onSubmit={handleCrear}>
          <div className="form-head">
            <h3>Crear Nueva Cuenta</h3>
            <button type="button" className="btn-cerrar" onClick={() => { setMostrarForm(false); setForm(FORM_VACIO) }}><FiX /></button>
          </div>
          <div className="form-grid">
            <div className="input-group">
              <label>Nombre completo</label>
              <input type="text" placeholder="Juan Pérez González" value={form.nombreCompleto} onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })} required />
            </div>
            <div className="input-group">
              <label>RUT</label>
              <input type="text" maxLength={12} placeholder="12.345.678-5" value={form.rut} onChange={(e) => setForm({ ...form, rut: formatearRut(e.target.value) })} required />
            </div>
            <div className="input-group">
              <label>Correo</label>
              <input type="email" placeholder="correo@colegio.cl" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="input-group">
              <label>Contraseña temporal</label>
              <input type="text" placeholder="Mínimo 6 caracteres" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="input-group">
              <label>Rol</label>
              <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                {ROLES_CREABLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-guardar" disabled={loading}><FiPlus /> Crear Cuenta</button>
              <button type="button" className="btn-cancelar" onClick={() => { setMostrarForm(false); setForm(FORM_VACIO) }}>Cancelar</button>
            </div>
          </div>
        </form>
      )}

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
