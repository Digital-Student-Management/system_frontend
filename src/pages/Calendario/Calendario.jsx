import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiCalendar, FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiX, FiClock } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { getEventos, createEvento, updateEvento, deleteEvento } from '../../services/calendarioService'
import './Calendario.scss'

const ROLES_GESTION = ['DOCENTE', 'DIRECTIVO', 'ADMIN', 'FUNCIONARIO']
const FORM_VACIO = { tituloEvento: '', descripEvento: '', fechaInicio: '', fechaFin: '' }

export default function Calendario() {
  const { usuario } = useAuth()
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)

  const puedeGestionar = ROLES_GESTION.includes(usuario?.rol)

  const cargar = async () => {
    setLoading(true)
    try {
      const res = await getEventos()
      const ordenados = (res.data || []).sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
      setEventos(ordenados)
    } catch (err) {
      console.error('Error cargando calendario:', err)
      toast.error('No se pudo cargar el calendario.')
    } finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  const abrirCrear = () => { setEditandoId(null); setForm(FORM_VACIO); setMostrarForm(true) }
  const abrirEditar = (ev) => {
    setEditandoId(ev.idEvento)
    setForm({ tituloEvento: ev.tituloEvento || '', descripEvento: ev.descripEvento || '', fechaInicio: ev.fechaInicio || '', fechaFin: ev.fechaFin || '' })
    setMostrarForm(true)
  }
  const cerrar = () => { setMostrarForm(false); setEditandoId(null); setForm(FORM_VACIO) }

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!form.tituloEvento.trim() || !form.descripEvento.trim() || !form.fechaInicio) {
      toast.warning('Título, descripción y fecha de inicio son obligatorios.')
      return
    }
    const payload = {
      idFuncionario: usuario?.id,
      tituloEvento: form.tituloEvento.trim(),
      descripEvento: form.descripEvento.trim(),
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin || null
    }
    setLoading(true)
    try {
      if (editandoId) { await updateEvento(editandoId, payload); toast.success('Evento actualizado.') }
      else { await createEvento(payload); toast.success('Evento creado.') }
      cerrar(); cargar()
    } catch (err) {
      console.error('Error guardando evento:', err)
      toast.error('No se pudo guardar el evento.')
    } finally { setLoading(false) }
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este evento?')) return
    setLoading(true)
    try { await deleteEvento(id); toast.success('Evento eliminado.'); cargar() }
    catch (err) { console.error(err); toast.error('No se pudo eliminar el evento.') }
    finally { setLoading(false) }
  }

  const fmt = (iso) => iso ? new Date(iso + 'T00:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' }) : ''
  const esPasado = (ev) => new Date((ev.fechaFin || ev.fechaInicio) + 'T23:59:59') < new Date()

  return (
    <div className="calendario-container">
      <header className="cal-header">
        <div className="title-section">
          <FiCalendar className="icon-title" />
          <div>
            <h1>Calendario Estudiantil</h1>
            <p>Eventos, actividades y fechas importantes del establecimiento.</p>
          </div>
        </div>
        <Link to="/" className="btn-back-home"><FiArrowLeft /> Volver al Inicio</Link>
      </header>

      {puedeGestionar && !mostrarForm && (
        <button type="button" className="btn-nuevo-evento" onClick={abrirCrear}><FiPlus /> Nuevo Evento</button>
      )}

      {mostrarForm && (
        <form className="cal-form" onSubmit={handleGuardar}>
          <div className="form-head">
            <h3>{editandoId ? 'Editar Evento' : 'Nuevo Evento'}</h3>
            <button type="button" className="btn-cerrar" onClick={cerrar}><FiX /></button>
          </div>
          <div className="form-grid">
            <div className="input-group full">
              <label>Título del evento</label>
              <input type="text" placeholder="Ej: Reunión de apoderados" value={form.tituloEvento} onChange={(e) => setForm({ ...form, tituloEvento: e.target.value })} required />
            </div>
            <div className="input-group full">
              <label>Descripción</label>
              <textarea rows={2} placeholder="Detalle del evento…" value={form.descripEvento} onChange={(e) => setForm({ ...form, descripEvento: e.target.value })} required />
            </div>
            <div className="input-group">
              <label>Fecha de inicio</label>
              <input type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} required />
            </div>
            <div className="input-group">
              <label>Fecha de término (opcional)</label>
              <input type="date" value={form.fechaFin} onChange={(e) => setForm({ ...form, fechaFin: e.target.value })} />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-guardar" disabled={loading}>{editandoId ? 'Guardar' : 'Crear Evento'}</button>
            <button type="button" className="btn-cancelar" onClick={cerrar}>Cancelar</button>
          </div>
        </form>
      )}

      {loading && eventos.length === 0 ? (
        <div className="cal-empty"><p>Cargando eventos…</p></div>
      ) : eventos.length === 0 ? (
        <div className="cal-empty"><FiCalendar className="empty-icon" /><p>No hay eventos en el calendario.</p></div>
      ) : (
        <div className="cal-lista">
          {eventos.map((ev) => (
            <article className={`cal-evento ${esPasado(ev) ? 'pasado' : ''}`} key={ev.idEvento}>
              <div className="cal-fecha-box">
                <span className="dia">{new Date(ev.fechaInicio + 'T00:00:00').getDate()}</span>
                <span className="mes">{new Date(ev.fechaInicio + 'T00:00:00').toLocaleDateString('es-CL', { month: 'short' })}</span>
              </div>
              <div className="cal-info">
                <h3>{ev.tituloEvento}</h3>
                <p className="cal-desc">{ev.descripEvento}</p>
                <span className="cal-rango"><FiClock /> {fmt(ev.fechaInicio)}{ev.fechaFin ? ` — ${fmt(ev.fechaFin)}` : ''}</span>
              </div>
              {puedeGestionar && (
                <div className="cal-acciones">
                  <button onClick={() => abrirEditar(ev)} title="Editar"><FiEdit2 /></button>
                  <button className="del" onClick={() => handleEliminar(ev.idEvento)} title="Eliminar"><FiTrash2 /></button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
