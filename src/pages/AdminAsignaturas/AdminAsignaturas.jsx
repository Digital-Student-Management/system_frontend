import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiBookOpen, FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiX, FiClock, FiAlertTriangle } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { getAll, create, update, remove } from '../../services/asignaturaService'

const ROLES_ADMIN = ['ADMIN', 'DIRECTIVO']
const FORM_VACIO = { nombre_asignatura: '', horas_semanales: '' }

export default function AdminAsignaturas() {
  const { usuario } = useAuth()
  const [asignaturas, setAsignaturas] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)

  const cargar = async () => {
    setLoading(true)
    try {
      const res = await getAll()
      setAsignaturas(res.data || [])
    } catch (err) {
      console.error('Error cargando asignaturas:', err)
      toast.error('No se pudieron cargar las asignaturas.')
    } finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  const abrirCrear = () => { setEditandoId(null); setForm(FORM_VACIO); setMostrarForm(true) }
  const abrirEditar = (a) => {
    setEditandoId(a.id_asignatura)
    setForm({ nombre_asignatura: a.nombre_asignatura || '', horas_semanales: a.horas_semanales ?? '' })
    setMostrarForm(true)
  }
  const cerrar = () => { setMostrarForm(false); setEditandoId(null); setForm(FORM_VACIO) }

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!form.nombre_asignatura.trim()) { toast.warning('Indica el nombre de la asignatura.'); return }
    const payload = { nombre_asignatura: form.nombre_asignatura.trim(), horas_semanales: parseInt(form.horas_semanales) || 0 }
    setLoading(true)
    try {
      if (editandoId) { await update(editandoId, payload); toast.success('Asignatura actualizada.') }
      else { await create(payload); toast.success('Asignatura creada.') }
      cerrar(); cargar()
    } catch (err) {
      console.error('Error guardando asignatura:', err)
      toast.error('No se pudo guardar la asignatura.')
    } finally { setLoading(false) }
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta asignatura?')) return
    setLoading(true)
    try { await remove(id); toast.success('Asignatura eliminada.'); cargar() }
    catch (err) { console.error(err); toast.error('No se pudo eliminar la asignatura.') }
    finally { setLoading(false) }
  }

  const filtradas = asignaturas.filter((a) =>
    (a.nombre_asignatura || '').toLowerCase().includes(busqueda.toLowerCase())
  )

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
          <FiBookOpen className="icon-title" />
          <div>
            <h1>Gestión de Asignaturas</h1>
            <p>Administra las asignaturas y sus horas semanales.</p>
          </div>
        </div>
        <Link to="/admin" className="btn-back-home"><FiArrowLeft /> Volver al Panel</Link>
      </header>

      <div className="admin-toolbar">
        <div className="toolbar-left">
          <input className="admin-search" placeholder="Buscar asignatura…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        {!mostrarForm && <button className="btn-add" onClick={abrirCrear}><FiPlus /> Nueva Asignatura</button>}
      </div>

      {mostrarForm && (
        <form className="admin-form" onSubmit={handleGuardar}>
          <div className="form-head">
            <h3>{editandoId ? 'Editar Asignatura' : 'Nueva Asignatura'}</h3>
            <button type="button" className="btn-cerrar" onClick={cerrar}><FiX /></button>
          </div>
          <div className="form-grid">
            <div className="input-group full">
              <label>Nombre de la asignatura</label>
              <input type="text" placeholder="Ej: Matemática" value={form.nombre_asignatura} onChange={(e) => setForm({ ...form, nombre_asignatura: e.target.value })} required />
            </div>
            <div className="input-group">
              <label>Horas semanales</label>
              <input type="number" min="0" value={form.horas_semanales} onChange={(e) => setForm({ ...form, horas_semanales: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-guardar" disabled={loading}>{editandoId ? 'Guardar' : 'Crear'}</button>
              <button type="button" className="btn-cancelar" onClick={cerrar}>Cancelar</button>
            </div>
          </div>
        </form>
      )}

      {loading && asignaturas.length === 0 ? (
        <div className="admin-empty"><p>Cargando…</p></div>
      ) : filtradas.length === 0 ? (
        <div className="admin-empty"><FiBookOpen className="empty-icon" /><p>No hay asignaturas para mostrar.</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>ID</th><th>Asignatura</th><th>Horas semanales</th><th style={{ width: '110px' }}>Acciones</th></tr>
            </thead>
            <tbody>
              {filtradas.map((a) => (
                <tr key={a.id_asignatura}>
                  <td className="mono">#{a.id_asignatura}</td>
                  <td><strong>{a.nombre_asignatura}</strong></td>
                  <td><FiClock style={{ verticalAlign: '-2px', marginRight: 4, opacity: 0.6 }} />{a.horas_semanales} hrs</td>
                  <td>
                    <div className="row-actions">
                      <button onClick={() => abrirEditar(a)} title="Editar"><FiEdit2 /></button>
                      <button className="del" onClick={() => handleEliminar(a.id_asignatura)} title="Eliminar"><FiTrash2 /></button>
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
