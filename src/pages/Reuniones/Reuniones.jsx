import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  FiCalendar,
  FiArrowLeft,
  FiPlus,
  FiTrash2,
  FiX,
  FiUser,
  FiUsers,
  FiFileText,
  FiClock
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import * as reunionService from '../../services/reunionService'
import { getAll as getUsuarios } from '../../services/usuarioService'
import { getAll as getCursos } from '../../services/cursoService'
import './Reuniones.scss'

const ESTADOS = ['PENDIENTE', 'REALIZADA', 'CANCELADA']

/**
 * Reuniones — Gestión de reuniones del establecimiento (ms-reuniones).
 * Tres módulos: Citaciones individuales, Reuniones generales de curso y
 * Actas de reuniones internas de directivos.
 */
export default function Reuniones() {
  const { usuario } = useAuth()
  const rol = usuario?.rol

  const esDirectivo = rol === 'DIRECTIVO' || rol === 'ADMIN'
  const esDocente = rol === 'DOCENTE' || esDirectivo

  const [tab, setTab] = useState(esDirectivo ? 'actas' : 'citaciones')
  const [loading, setLoading] = useState(false)

  const [citaciones, setCitaciones] = useState([])
  const [generales, setGenerales] = useState([])
  const [actas, setActas] = useState([])

  const [estudiantes, setEstudiantes] = useState([])
  const [apoderados, setApoderados] = useState([])
  const [cursos, setCursos] = useState([])

  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm] = useState({})

  // Carga de catálogos para los selectores
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [usuariosRes, cursosRes] = await Promise.all([getUsuarios(), getCursos()])
        const usuarios = usuariosRes.data || []
        setEstudiantes(usuarios.filter((u) => u.tipoUsuario === 'ESTUDIANTE'))
        setApoderados(usuarios.filter((u) => u.tipoUsuario === 'APODERADO'))
        setCursos(cursosRes.data || [])
      } catch (err) {
        console.error('Error cargando catálogos:', err)
      }
    }
    cargarCatalogos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      if (tab === 'citaciones') {
        const res = await reunionService.getCitaciones()
        setCitaciones(res.data || [])
      } else if (tab === 'generales') {
        const res = await reunionService.getGenerales()
        setGenerales(res.data || [])
      } else {
        const res = await reunionService.getActas()
        setActas(res.data || [])
      }
    } catch (err) {
      console.error('Error cargando reuniones:', err)
      toast.error('No se pudieron cargar las reuniones.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
    setMostrarForm(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const puedeGestionar = tab === 'actas' ? esDirectivo : esDocente

  const abrirForm = () => {
    // Valores iniciales por pestaña
    if (tab === 'citaciones') {
      setForm({ estado: 'PENDIENTE', idDocente: usuario?.id, idEstudiante: '', idApoderado: '', temaEspEstudiante: '', acuerdosCompromisos: '' })
    } else if (tab === 'generales') {
      setForm({ estado: 'PENDIENTE', idDocente: usuario?.id, idCurso: '', temarioGeneralCurso: '', acuerdosCompromisos: '' })
    } else {
      setForm({ tipoReunion: '', idDirectivo: usuario?.id, decisionesAcuerdos: '' })
    }
    setMostrarForm(true)
  }

  const set = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }))

  const handleGuardar = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (tab === 'citaciones') {
        if (!form.idEstudiante || !form.idApoderado) {
          toast.warning('Selecciona estudiante y apoderado.')
          setLoading(false)
          return
        }
        await reunionService.createCitacion({
          ...form,
          idDocente: Number(form.idDocente) || null,
          idEstudiante: Number(form.idEstudiante),
          idApoderado: Number(form.idApoderado)
        })
      } else if (tab === 'generales') {
        if (!form.idCurso) {
          toast.warning('Selecciona un curso.')
          setLoading(false)
          return
        }
        await reunionService.createGeneral({
          ...form,
          idDocente: Number(form.idDocente) || null,
          idCurso: Number(form.idCurso)
        })
      } else {
        if (!form.tipoReunion) {
          toast.warning('Indica el tipo de reunión.')
          setLoading(false)
          return
        }
        await reunionService.createActa({
          ...form,
          idDirectivo: Number(form.idDirectivo) || null
        })
      }
      toast.success('Registro creado correctamente.')
      setMostrarForm(false)
      cargarDatos()
    } catch (err) {
      console.error('Error guardando reunión:', err)
      toast.error('No se pudo guardar el registro.')
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este registro?')) return
    setLoading(true)
    try {
      if (tab === 'citaciones') await reunionService.removeCitacion(id)
      else if (tab === 'generales') await reunionService.removeGeneral(id)
      else await reunionService.removeActa(id)
      toast.success('Registro eliminado.')
      cargarDatos()
    } catch (err) {
      console.error('Error eliminando reunión:', err)
      toast.error('No se pudo eliminar el registro.')
    } finally {
      setLoading(false)
    }
  }

  const nombreUsuario = (lista, id) => {
    const u = lista.find((x) => String(x.id) === String(id))
    return u ? `${u.pnombreUsuario} ${u.appaternoUsuario}` : `#${id}`
  }

  const nombreCurso = (id) => {
    const c = cursos.find((x) => String(x.idCurso) === String(id))
    return c ? `${c.nivel?.nombreNivel || ''} ${c.letra || ''}`.trim() : `#${id}`
  }

  const formatearFecha = (iso) => {
    if (!iso) return 'Fecha por definir'
    const d = new Date(iso)
    if (isNaN(d)) return iso
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const EstadoChip = ({ estado }) => (
    <span className={`estado-chip ${(estado || 'pendiente').toLowerCase()}`}>{estado || 'PENDIENTE'}</span>
  )

  const lista = tab === 'citaciones' ? citaciones : tab === 'generales' ? generales : actas

  return (
    <div className="reuniones-container">
      <header className="reuniones-header">
        <div className="title-section">
          <FiCalendar className="icon-title" />
          <div>
            <h1>Reuniones y Citaciones</h1>
            <p>Gestiona citaciones a apoderados, reuniones de curso y actas directivas.</p>
          </div>
        </div>
        <Link to="/" className="btn-back-home">
          <FiArrowLeft /> Volver al Inicio
        </Link>
      </header>

      <nav className="reuniones-tabs">
        <button className={tab === 'citaciones' ? 'active' : ''} onClick={() => setTab('citaciones')}>
          <FiUser /> Citaciones
        </button>
        <button className={tab === 'generales' ? 'active' : ''} onClick={() => setTab('generales')}>
          <FiUsers /> Reuniones de Curso
        </button>
        <button className={tab === 'actas' ? 'active' : ''} onClick={() => setTab('actas')}>
          <FiFileText /> Actas Directivas
        </button>
      </nav>

      {puedeGestionar && !mostrarForm && (
        <button type="button" className="btn-nuevo" onClick={abrirForm}>
          <FiPlus /> Nuevo Registro
        </button>
      )}

      {/* Formulario contextual */}
      {mostrarForm && (
        <form className="reuniones-form" onSubmit={handleGuardar}>
          <div className="form-head">
            <h3>
              {tab === 'citaciones' && 'Nueva Citación a Apoderado'}
              {tab === 'generales' && 'Nueva Reunión de Curso'}
              {tab === 'actas' && 'Nueva Acta Directiva'}
            </h3>
            <button type="button" className="btn-cerrar" onClick={() => setMostrarForm(false)}><FiX /></button>
          </div>

          <div className="form-grid">
            {tab === 'citaciones' && (
              <>
                <div className="input-group">
                  <label>Estudiante</label>
                  <select value={form.idEstudiante} onChange={(e) => set('idEstudiante', e.target.value)} required>
                    <option value="">-- Selecciona --</option>
                    {estudiantes.map((es) => (
                      <option key={es.id} value={es.id}>{es.pnombreUsuario} {es.appaternoUsuario}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Apoderado</label>
                  <select value={form.idApoderado} onChange={(e) => set('idApoderado', e.target.value)} required>
                    <option value="">-- Selecciona --</option>
                    {apoderados.map((ap) => (
                      <option key={ap.id} value={ap.id}>{ap.pnombreUsuario} {ap.appaternoUsuario}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group full">
                  <label>Tema a tratar</label>
                  <input type="text" placeholder="Motivo de la citación" value={form.temaEspEstudiante} onChange={(e) => set('temaEspEstudiante', e.target.value)} />
                </div>
                <div className="input-group full">
                  <label>Acuerdos / Compromisos</label>
                  <textarea rows={2} value={form.acuerdosCompromisos} onChange={(e) => set('acuerdosCompromisos', e.target.value)} />
                </div>
              </>
            )}

            {tab === 'generales' && (
              <>
                <div className="input-group">
                  <label>Curso</label>
                  <select value={form.idCurso} onChange={(e) => set('idCurso', e.target.value)} required>
                    <option value="">-- Selecciona --</option>
                    {cursos.map((c) => (
                      <option key={c.idCurso} value={c.idCurso}>
                        {c.nivel?.nombreNivel} {c.letra} ({c.anoAcademicoCurso})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group full">
                  <label>Temario general del curso</label>
                  <input type="text" placeholder="Temas de la reunión" value={form.temarioGeneralCurso} onChange={(e) => set('temarioGeneralCurso', e.target.value)} />
                </div>
                <div className="input-group full">
                  <label>Acuerdos / Compromisos</label>
                  <textarea rows={2} value={form.acuerdosCompromisos} onChange={(e) => set('acuerdosCompromisos', e.target.value)} />
                </div>
              </>
            )}

            {tab === 'actas' && (
              <>
                <div className="input-group">
                  <label>Tipo de reunión</label>
                  <input type="text" placeholder="Ej: Consejo de profesores" value={form.tipoReunion} onChange={(e) => set('tipoReunion', e.target.value)} required />
                </div>
                <div className="input-group full">
                  <label>Decisiones y acuerdos</label>
                  <textarea rows={3} value={form.decisionesAcuerdos} onChange={(e) => set('decisionesAcuerdos', e.target.value)} />
                </div>
              </>
            )}

            {tab !== 'actas' && (
              <div className="input-group">
                <label>Estado</label>
                <select value={form.estado} onChange={(e) => set('estado', e.target.value)}>
                  {ESTADOS.map((es) => <option key={es} value={es}>{es}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-guardar" disabled={loading}>Guardar</button>
            <button type="button" className="btn-cancelar" onClick={() => setMostrarForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      {/* Listado */}
      {loading && lista.length === 0 ? (
        <div className="reuniones-empty"><p>Cargando…</p></div>
      ) : lista.length === 0 ? (
        <div className="reuniones-empty">
          <FiCalendar className="empty-icon" />
          <p>No hay registros en esta sección.</p>
        </div>
      ) : (
        <div className="reuniones-lista">
          {tab === 'citaciones' && citaciones.map((c) => (
            <article className="reunion-card" key={c.idReunion}>
              <div className="card-main">
                <div className="card-titulo">
                  <FiUser /> Citación — {nombreUsuario(estudiantes, c.idEstudiante)}
                </div>
                <p className="card-tema">{c.temaEspEstudiante || 'Sin tema especificado'}</p>
                {c.acuerdosCompromisos && <p className="card-acuerdos">{c.acuerdosCompromisos}</p>}
                <div className="card-meta">
                  <span><FiUsers /> Apoderado: {nombreUsuario(apoderados, c.idApoderado)}</span>
                  <span><FiClock /> {formatearFecha(c.fechaProgramada)}</span>
                </div>
              </div>
              <div className="card-side">
                <EstadoChip estado={c.estado} />
                {puedeGestionar && (
                  <button className="btn-del" onClick={() => handleEliminar(c.idReunion)} title="Eliminar"><FiTrash2 /></button>
                )}
              </div>
            </article>
          ))}

          {tab === 'generales' && generales.map((g) => (
            <article className="reunion-card" key={g.idReunion}>
              <div className="card-main">
                <div className="card-titulo">
                  <FiUsers /> Reunión de {nombreCurso(g.idCurso)}
                </div>
                <p className="card-tema">{g.temarioGeneralCurso || 'Sin temario especificado'}</p>
                {g.acuerdosCompromisos && <p className="card-acuerdos">{g.acuerdosCompromisos}</p>}
                <div className="card-meta">
                  <span><FiClock /> {formatearFecha(g.fechaProgramada)}</span>
                </div>
              </div>
              <div className="card-side">
                <EstadoChip estado={g.estado} />
                {puedeGestionar && (
                  <button className="btn-del" onClick={() => handleEliminar(g.idReunion)} title="Eliminar"><FiTrash2 /></button>
                )}
              </div>
            </article>
          ))}

          {tab === 'actas' && actas.map((a) => (
            <article className="reunion-card" key={a.idActa}>
              <div className="card-main">
                <div className="card-titulo">
                  <FiFileText /> {a.tipoReunion || 'Reunión interna'}
                </div>
                {a.decisionesAcuerdos && <p className="card-acuerdos">{a.decisionesAcuerdos}</p>}
                <div className="card-meta">
                  <span><FiClock /> {formatearFecha(a.fechaReunion)}</span>
                </div>
              </div>
              <div className="card-side">
                {puedeGestionar && (
                  <button className="btn-del" onClick={() => handleEliminar(a.idActa)} title="Eliminar"><FiTrash2 /></button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
