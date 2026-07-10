import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  FiClipboard,
  FiArrowLeft,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiCalendar,
  FiTarget,
  FiAlertTriangle,
  FiX
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import {
  getAll as getAsignaturas,
  getBitacorasByAsignatura,
  createBitacora,
  updateBitacora,
  removeBitacora
} from '../../services/asignaturaService'
import './BitacoraAsignatura.scss'

const FORM_VACIO = {
  fecha_clase: '',
  objetivo_aprendizaje: '',
  actividades_realizadas: '',
  observaciones_generales: ''
}

export default function BitacoraAsignatura() {
  const { usuario } = useAuth()

  const [asignaturas, setAsignaturas] = useState([])
  const [asignaturaSel, setAsignaturaSel] = useState('')
  const [bitacoras, setBitacoras] = useState([])
  const [loading, setLoading] = useState(false)

  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)

  const puedeEditar = usuario?.rol === 'DOCENTE' || usuario?.rol === 'ADMIN'

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await getAsignaturas()
        setAsignaturas(res.data || [])
      } catch (err) {
        console.error('Error cargando asignaturas:', err)
        toast.error('No se pudieron cargar las asignaturas.')
      }
    }
    cargar()
  }, [])

  const cargarBitacoras = async (asignaturaId) => {
    if (!asignaturaId) {
      setBitacoras([])
      return
    }
    setLoading(true)
    try {
      const res = await getBitacorasByAsignatura(asignaturaId)
      // Más recientes primero
      const ordenadas = (res.data || []).sort(
        (a, b) => new Date(b.fecha_clase) - new Date(a.fecha_clase)
      )
      setBitacoras(ordenadas)
    } catch (err) {
      console.error('Error cargando bitácoras:', err)
      setBitacoras([])
      toast.error('No se pudieron obtener los registros de clase.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarBitacoras(asignaturaSel)
    cerrarForm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asignaturaSel])

  const abrirCrear = () => {
    setEditandoId(null)
    setForm(FORM_VACIO)
    setMostrarForm(true)
  }

  const abrirEditar = (b) => {
    setEditandoId(b.id_bitacora_asignatura)
    setForm({
      fecha_clase: b.fecha_clase || '',
      objetivo_aprendizaje: b.objetivo_aprendizaje || '',
      actividades_realizadas: b.actividades_realizadas || '',
      observaciones_generales: b.observaciones_generales || ''
    })
    setMostrarForm(true)
  }

  const cerrarForm = () => {
    setMostrarForm(false)
    setEditandoId(null)
    setForm(FORM_VACIO)
  }

  const handleChange = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }))

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!form.fecha_clase || !form.actividades_realizadas) {
      toast.warning('La fecha y las actividades realizadas son obligatorias.')
      return
    }

    const payload = {
      ...form,
      id_asignatura: parseInt(asignaturaSel)
    }

    setLoading(true)
    try {
      if (editandoId) {
        await updateBitacora(editandoId, payload)
        toast.success('Registro de clase actualizado.')
      } else {
        await createBitacora(payload)
        toast.success('Registro de clase agregado a la bitácora.')
      }
      cerrarForm()
      cargarBitacoras(asignaturaSel)
    } catch (err) {
      console.error('Error guardando bitácora:', err)
      toast.error('No se pudo guardar el registro en la base de datos.')
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este registro de clase de la bitácora?')) return
    setLoading(true)
    try {
      await removeBitacora(id)
      toast.success('Registro eliminado.')
      cargarBitacoras(asignaturaSel)
    } catch (err) {
      console.error('Error eliminando bitácora:', err)
      toast.error('No se pudo eliminar el registro.')
    } finally {
      setLoading(false)
    }
  }

  if (!puedeEditar) {
    return (
      <div className="bitacora-forbidden">
        <FiAlertTriangle className="icon-warn" />
        <h2>Acceso Denegado</h2>
        <p>La bitácora de asignatura está disponible solo para Docentes y Administración.</p>
        <Link to="/" className="btn-back-home"><FiArrowLeft /> Volver al Inicio</Link>
      </div>
    )
  }

  return (
    <div className="bitacora-container">
      <header className="bitacora-header">
        <div className="title-section">
          <FiClipboard className="icon-title" />
          <div>
            <h1>Bitácora de Asignatura</h1>
            <p>Registra el leccionario: objetivos, actividades y observaciones de cada clase.</p>
          </div>
        </div>
        <Link to="/" className="btn-back-home">
          <FiArrowLeft /> Volver al Inicio
        </Link>
      </header>

      <section className="bitacora-toolbar">
        <div className="selector-group">
          <label>Asignatura:</label>
          <select value={asignaturaSel} onChange={(e) => setAsignaturaSel(e.target.value)}>
            <option value="">-- Selecciona Asignatura --</option>
            {asignaturas.map((a) => (
              <option key={a.id_asignatura} value={a.id_asignatura}>
                {a.nombre_asignatura}
              </option>
            ))}
          </select>
        </div>

        {asignaturaSel && !mostrarForm && (
          <button type="button" className="btn-nuevo" onClick={abrirCrear}>
            <FiPlus /> Nuevo Registro
          </button>
        )}
      </section>

      {mostrarForm && (
        <form className="bitacora-form" onSubmit={handleGuardar}>
          <div className="form-head">
            <h3>{editandoId ? 'Editar Registro de Clase' : 'Nuevo Registro de Clase'}</h3>
            <button type="button" className="btn-cerrar" onClick={cerrarForm}><FiX /></button>
          </div>
          <div className="form-grid">
            <div className="input-group">
              <label>Fecha de la clase</label>
              <input
                type="date"
                value={form.fecha_clase}
                onChange={(e) => handleChange('fecha_clase', e.target.value)}
                required
              />
            </div>
            <div className="input-group full">
              <label>Objetivo de aprendizaje</label>
              <input
                type="text"
                placeholder="Ej: Comprender el teorema de Pitágoras"
                value={form.objetivo_aprendizaje}
                onChange={(e) => handleChange('objetivo_aprendizaje', e.target.value)}
              />
            </div>
            <div className="input-group full">
              <label>Actividades realizadas</label>
              <textarea
                rows={3}
                placeholder="Describe las actividades desarrolladas en la clase…"
                value={form.actividades_realizadas}
                onChange={(e) => handleChange('actividades_realizadas', e.target.value)}
                required
              />
            </div>
            <div className="input-group full">
              <label>Observaciones generales</label>
              <textarea
                rows={2}
                placeholder="Observaciones de convivencia, avances o pendientes…"
                value={form.observaciones_generales}
                onChange={(e) => handleChange('observaciones_generales', e.target.value)}
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-guardar" disabled={loading}>
              {editandoId ? 'Guardar Cambios' : 'Agregar a Bitácora'}
            </button>
            <button type="button" className="btn-cancelar" onClick={cerrarForm}>Cancelar</button>
          </div>
        </form>
      )}

      {!asignaturaSel ? (
        <div className="bitacora-empty">
          <FiClipboard className="empty-icon" />
          <p>Selecciona una asignatura para ver y registrar su bitácora de clases.</p>
        </div>
      ) : loading && bitacoras.length === 0 ? (
        <div className="bitacora-empty"><p>Cargando registros…</p></div>
      ) : bitacoras.length === 0 ? (
        <div className="bitacora-empty">
          <FiCalendar className="empty-icon" />
          <p>Aún no hay registros de clase para esta asignatura. ¡Crea el primero!</p>
        </div>
      ) : (
        <div className="bitacora-timeline">
          {bitacoras.map((b) => (
            <article className="bitacora-item" key={b.id_bitacora_asignatura}>
              <div className="item-fecha">
                <FiCalendar />
                <span>{b.fecha_clase}</span>
              </div>
              <div className="item-body">
                {b.objetivo_aprendizaje && (
                  <p className="item-objetivo"><FiTarget /> {b.objetivo_aprendizaje}</p>
                )}
                <p className="item-actividades">{b.actividades_realizadas}</p>
                {b.observaciones_generales && (
                  <p className="item-obs"><strong>Observaciones:</strong> {b.observaciones_generales}</p>
                )}
              </div>
              <div className="item-acciones">
                <button type="button" onClick={() => abrirEditar(b)} title="Editar"><FiEdit2 /></button>
                <button
                  type="button"
                  className="del"
                  onClick={() => handleEliminar(b.id_bitacora_asignatura)}
                  title="Eliminar"
                >
                  <FiTrash2 />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
