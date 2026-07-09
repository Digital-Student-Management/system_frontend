import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiHome, FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiX, FiAlertTriangle } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { getSalas, createSala, updateSala, removeSala } from '../../services/cursoService'

const ROLES_ADMIN = ['ADMIN', 'DIRECTIVO']
const FORM_VACIO = { numeroSala: '', capacidadMaxima: '' }

export default function AdminSalas() {
  const { usuario } = useAuth()
  const [salas, setSalas] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)

  const cargar = async () => {
    setLoading(true)
    try {
      const res = await getSalas()
      setSalas((res.data || []).sort((a, b) => (a.numeroSala || 0) - (b.numeroSala || 0)))
    } catch (err) {
      console.error('Error cargando salas:', err)
      toast.error('No se pudieron cargar las salas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const abrirCrear = () => { setEditandoId(null); setForm(FORM_VACIO); setMostrarForm(true) }
  const abrirEditar = (s) => {
    setEditandoId(s.idSala)
    setForm({ numeroSala: s.numeroSala ?? '', capacidadMaxima: s.capacidadMaxima ?? '' })
    setMostrarForm(true)
  }
  const cerrar = () => { setMostrarForm(false); setEditandoId(null); setForm(FORM_VACIO) }

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!form.numeroSala || !form.capacidadMaxima) {
      toast.warning('Completa el número y la capacidad de la sala.')
      return
    }
    const payload = { numeroSala: parseInt(form.numeroSala), capacidadMaxima: parseInt(form.capacidadMaxima) }
    setLoading(true)
    try {
      if (editandoId) { await updateSala(editandoId, payload); toast.success('Sala actualizada.') }
      else { await createSala(payload); toast.success('Sala creada.') }
      cerrar(); cargar()
    } catch (err) {
      console.error('Error guardando sala:', err)
      toast.error('No se pudo guardar la sala.')
    } finally { setLoading(false) }
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta sala?')) return
    setLoading(true)
    try { await removeSala(id); toast.success('Sala eliminada.'); cargar() }
    catch (err) { console.error(err); toast.error('No se pudo eliminar (¿está asignada a un curso?).') }
    finally { setLoading(false) }
  }

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
          <FiHome className="icon-title" />
          <div>
            <h1>Gestión de Salas</h1>
            <p>Administra las salas del establecimiento y su capacidad.</p>
          </div>
        </div>
        <Link to="/admin" className="btn-back-home"><FiArrowLeft /> Volver al Panel</Link>
      </header>

      <div className="admin-toolbar">
        <div className="toolbar-left" />
        {!mostrarForm && <button className="btn-add" onClick={abrirCrear}><FiPlus /> Nueva Sala</button>}
      </div>

      {mostrarForm && (
        <form className="admin-form" onSubmit={handleGuardar}>
          <div className="form-head">
            <h3>{editandoId ? 'Editar Sala' : 'Nueva Sala'}</h3>
            <button type="button" className="btn-cerrar" onClick={cerrar}><FiX /></button>
          </div>
          <div className="form-grid">
            <div className="input-group">
              <label>Número de sala</label>
              <input type="number" min="1" value={form.numeroSala} onChange={(e) => setForm({ ...form, numeroSala: e.target.value })} required />
            </div>
            <div className="input-group">
              <label>Capacidad máxima</label>
              <input type="number" min="1" value={form.capacidadMaxima} onChange={(e) => setForm({ ...form, capacidadMaxima: e.target.value })} required />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-guardar" disabled={loading}>{editandoId ? 'Guardar' : 'Crear'}</button>
              <button type="button" className="btn-cancelar" onClick={cerrar}>Cancelar</button>
            </div>
          </div>
        </form>
      )}

      {loading && salas.length === 0 ? (
        <div className="admin-empty"><p>Cargando…</p></div>
      ) : salas.length === 0 ? (
        <div className="admin-empty"><FiHome className="empty-icon" /><p>No hay salas registradas. Crea la primera.</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>ID</th><th>Número</th><th>Capacidad</th><th style={{ width: '110px' }}>Acciones</th></tr>
            </thead>
            <tbody>
              {salas.map((s) => (
                <tr key={s.idSala}>
                  <td className="mono">#{s.idSala}</td>
                  <td><strong>Sala {s.numeroSala}</strong></td>
                  <td>{s.capacidadMaxima} estudiantes</td>
                  <td>
                    <div className="row-actions">
                      <button onClick={() => abrirEditar(s)} title="Editar"><FiEdit2 /></button>
                      <button className="del" onClick={() => handleEliminar(s.idSala)} title="Eliminar"><FiTrash2 /></button>
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
