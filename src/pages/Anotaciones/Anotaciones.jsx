import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { 
  FiAlertCircle, 
  FiCheckCircle, 
  FiFileText, 
  FiTrash2, 
  FiPlus, 
  FiUser, 
  FiCalendar, 
  FiBookOpen, 
  FiSave 
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { 
  getByEstudiante, 
  create as createAnotacion, 
  remove as removeAnotacion, 
  getHojaVida, 
  updateHojaVida 
} from '../../services/anotacionService'
import { getAll as getCursos } from '../../services/cursoService'
import { getAll as getUsuarios } from '../../services/usuarioService'
import dayjs from 'dayjs'
import './Anotaciones.scss'

export default function Anotaciones() {
  const { usuario } = useAuth()
  const isDocenteOrStaff = ['DOCENTE', 'INSPECTOR', 'ADMIN'].includes(usuario?.rol)

  // Listados maestros
  const [cursos, setCursos] = useState([])
  const [estudiantes, setEstudiantes] = useState([])

  // Selectores
  const [cursoSeleccionado, setCursoSeleccionado] = useState('')
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState('')

  // Datos del estudiante seleccionado
  const [anotaciones, setAnotaciones] = useState([])
  const [hojaVida, setHojaVida] = useState(null)
  const [nuevaObservacion, setNuevaObservacion] = useState('')
  const [loading, setLoading] = useState(false)

  // Formulario nueva anotación
  const [tipoAnotacion, setTipoAnotacion] = useState('POSITIVA')
  const [descripcionAnotacion, setDescripcionAnotacion] = useState('')

  // Cargar Cursos y Estudiantes reales
  const cargarDatosMaestros = async () => {
    setLoading(true)
    try {
      if (isDocenteOrStaff) {
        const cursosRes = await getCursos()
        setCursos(cursosRes.data || [])

        const usuariosRes = await getUsuarios()
        const alumnos = (usuariosRes.data || []).filter(u => u.tipoUsuario === 'ESTUDIANTE')
        const alumnosFormateados = alumnos.map(u => ({
          id: u.id,
          nombreCompleto: `${u.pnombreUsuario} ${u.appaternoUsuario}`,
          rut: u.rutUsuario
        }))
        setEstudiantes(alumnosFormateados)
      } else {
        // Estudiantes/Apoderados: cargar directamente su información propia
        const estId = usuario?.id || 11 // Fallback de pruebas
        setEstudianteSeleccionado(estId)
      }
    } catch (err) {
      console.error('Error al cargar datos maestros:', err)
      toast.error('Error de conexión con los microservicios de base de datos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatosMaestros()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cargar Historial Conductual del Estudiante seleccionado
  const cargarHistorialEstudiante = async (idEst) => {
    if (!idEst) return
    setLoading(true)
    try {
      // 1. Obtener anotaciones
      const anotacionesRes = await getByEstudiante(idEst)
      setAnotaciones(anotacionesRes.data || [])

      // 2. Obtener Hoja de Vida
      const hvRes = await getHojaVida(idEst)
      if (hvRes.data) {
        setHojaVida(hvRes.data)
        setNuevaObservacion(hvRes.data.observacionGeneral || '')
      } else {
        setHojaVida(null)
        setNuevaObservacion('')
      }
    } catch (err) {
      console.error('Error al cargar historial del estudiante:', err)
      setAnotaciones([])
      setHojaVida(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (estudianteSeleccionado) {
      cargarHistorialEstudiante(estudianteSeleccionado)
    } else {
      setAnotaciones([])
      setHojaVida(null)
    }
  }, [estudianteSeleccionado])

  // Crear anotación
  const handleCrearAnotacion = async (e) => {
    e.preventDefault()
    if (!descripcionAnotacion.trim()) {
      toast.warning('Ingresa una descripción para la anotación.')
      return
    }

    const payload = {
      idEstudiante: parseInt(estudianteSeleccionado),
      tipoAnotacion,
      descripcionAnotacion: descripcionAnotacion.trim()
    }

    setLoading(true)
    try {
      await createAnotacion(payload)
      toast.success('¡Anotación guardada en la Hoja de Vida!')
      setDescripcionAnotacion('')
      cargarHistorialEstudiante(estudianteSeleccionado)
    } catch (err) {
      console.error('Error al crear anotación:', err)
      toast.error('No se pudo guardar la anotación en la base de datos.')
    } finally {
      setLoading(false)
    }
  }

  // Eliminar anotación
  const handleEliminarAnotacion = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta anotación del historial?')) return

    setLoading(true)
    try {
      await removeAnotacion(id)
      toast.success('Anotación eliminada correctamente.')
      cargarHistorialEstudiante(estudianteSeleccionado)
    } catch (err) {
      console.error('Error al borrar anotación:', err)
      toast.error('No se pudo eliminar la anotación.')
    } finally {
      setLoading(false)
    }
  }

  // Guardar Observación General de la Hoja de Vida
  const handleGuardarObservacionGeneral = async () => {
    if (!estudianteSeleccionado) return
    setLoading(true)
    try {
      await updateHojaVida(estudianteSeleccionado, nuevaObservacion)
      toast.success('¡Observación de Hoja de Vida actualizada!')
      cargarHistorialEstudiante(estudianteSeleccionado)
    } catch (err) {
      console.error('Error al actualizar observación general:', err)
      toast.error('No se pudo actualizar la observación en el servidor.')
    } finally {
      setLoading(false)
    }
  }

  // Contadores conductuales
  const positivas = anotaciones.filter(a => a.tipoAnotacion === 'POSITIVA').length
  const negativas = anotaciones.filter(a => a.tipoAnotacion === 'NEGATIVA').length

  return (
    <div className="anotaciones-container">
      <header className="anotaciones-header">
        <div className="title-section">
          <FiBookOpen className="icon-title" />
          <div>
            <h1>Historial y Anotaciones Conductuales</h1>
            <p>
              {isDocenteOrStaff 
                ? 'Monitorea, registra y edita la hoja de vida conductual de los estudiantes en la base de datos.' 
                : 'Revisa tu registro de conducta escolar, reconocimientos y observaciones del período.'}
            </p>
          </div>
        </div>
      </header>

      {/* Selectores de búsqueda (solo para Docentes/Inspectores/Admins) */}
      {isDocenteOrStaff && (
        <section className="anotaciones-selectors">
          <div className="selector-group">
            <label>Filtrar por Curso:</label>
            <select value={cursoSeleccionado} onChange={(e) => setCursoSeleccionado(e.target.value)}>
              <option value="">-- Selecciona Curso --</option>
              {cursos.map((c) => (
                <option key={c.idCurso} value={c.idCurso}>
                  {c.nivel?.nombreNivel} {c.letra} ({c.anoAcademicoCurso})
                </option>
              ))}
            </select>
          </div>

          <div className="selector-group">
            <label>Seleccionar Estudiante:</label>
            <select 
              value={estudianteSeleccionado} 
              onChange={(e) => setEstudianteSeleccionado(e.target.value)}
            >
              <option value="">-- Selecciona Estudiante --</option>
              {estudiantes.map((est) => (
                <option key={est.id} value={est.id}>
                  {est.nombreCompleto} ({est.rut})
                </option>
              ))}
            </select>
          </div>
        </section>
      )}

      {estudianteSeleccionado ? (
        <div className="anotaciones-workspace">
          
          {/* Dashboard Resumen Conductual */}
          <section className="anotaciones-dashboard">
            <div className="metric-card positiva">
              <FiCheckCircle className="metric-icon" />
              <div className="metric-info">
                <span className="metric-val">{positivas}</span>
                <span className="metric-label">Anotaciones Positivas</span>
              </div>
            </div>

            <div className="metric-card negativa">
              <FiAlertCircle className="metric-icon" />
              <div className="metric-info">
                <span className="metric-val">{negativas}</span>
                <span className="metric-label">Anotaciones Negativas</span>
              </div>
            </div>

            <div className="metric-card general">
              <FiFileText className="metric-icon" />
              <div className="metric-info">
                <span className={`metric-val ${negativas > 3 ? 'riesgo' : negativas > 0 ? 'advertencia' : 'excelente'}`}>
                  {negativas > 3 ? 'Condicional' : negativas > 0 ? 'Con Observaciones' : 'Excelente Conducta'}
                </span>
                <span className="metric-label">Estado Disciplinario</span>
              </div>
            </div>
          </section>

          <div className="anotaciones-grid">
            
            {/* Historial / Timeline de anotaciones */}
            <div className="anotaciones-list-panel">
              <h3>Hoja de Vida — Historial Conductual</h3>
              {anotaciones.length > 0 ? (
                <div className="anotaciones-timeline">
                  {anotaciones.map((anot) => (
                    <div key={anot.idAnotacion} className={`timeline-item ${anot.tipoAnotacion.toLowerCase()}`}>
                      <div className="timeline-badge">
                        {anot.tipoAnotacion === 'POSITIVA' ? <FiCheckCircle /> : <FiAlertCircle />}
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className={`badge-tipo ${anot.tipoAnotacion.toLowerCase()}`}>
                            {anot.tipoAnotacion}
                          </span>
                          <span className="timeline-date">
                            <FiCalendar /> {dayjs(anot.fecha).format('DD/MM/YYYY HH:mm')}
                          </span>
                        </div>
                        <p className="descripcion">{anot.descripcionAnotacion}</p>
                        
                        {isDocenteOrStaff && (
                          <div className="actions">
                            <button 
                              type="button" 
                              className="btn-delete"
                              onClick={() => handleEliminarAnotacion(anot.idAnotacion)}
                              title="Eliminar Anotación"
                            >
                              <FiTrash2 /> Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="anotaciones-empty">
                  <FiCheckCircle className="empty-icon" />
                  <p>Este alumno no registra anotaciones conductuales en el período.</p>
                </div>
              )}
            </div>

            {/* Panel Lateral: Observación General y Formulario */}
            <div className="anotaciones-sidebar">
              
              {/* Observación General de Convivencia Escolar */}
              <div className="sidebar-card">
                <h3>Observación General de Convivencia</h3>
                <p className="subtitle">Comentario general sobre el comportamiento integral del estudiante.</p>
                {isDocenteOrStaff ? (
                  <div className="observacion-editor">
                    <textarea 
                      placeholder="Ingresa un diagnóstico o comentario general..."
                      value={nuevaObservacion}
                      onChange={(e) => setNuevaObservacion(e.target.value)}
                    />
                    <button 
                      type="button" 
                      className="btn-save-obs"
                      onClick={handleGuardarObservacionGeneral}
                      disabled={loading}
                    >
                      <FiSave /> Guardar Observación
                    </button>
                  </div>
                ) : (
                  <div className="observacion-view">
                    <p className="obs-content">
                      {hojaVida?.observacionGeneral || 'Sin comentarios registrados por convivencia escolar.'}
                    </p>
                    {hojaVida?.fechaCreacion && (
                      <span className="obs-date">
                        Última actualización: {dayjs(hojaVida.fechaCreacion).format('DD/MM/YYYY')}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Formulario Agregar Anotación (solo Docentes/Inspectores/Admins) */}
              {isDocenteOrStaff && (
                <div className="sidebar-card">
                  <h3>Registrar Nueva Anotación</h3>
                  <form onSubmit={handleCrearAnotacion} className="form-anotacion">
                    <div className="form-group">
                      <label>Tipo de Anotación:</label>
                      <div className="radio-group">
                        <label className={`radio-label positiva ${tipoAnotacion === 'POSITIVA' ? 'active' : ''}`}>
                          <input 
                            type="radio" 
                            name="tipoAnotacion" 
                            value="POSITIVA" 
                            checked={tipoAnotacion === 'POSITIVA'}
                            onChange={() => setTipoAnotacion('POSITIVA')}
                          />
                          Positiva
                        </label>
                        <label className={`radio-label negativa ${tipoAnotacion === 'NEGATIVA' ? 'active' : ''}`}>
                          <input 
                            type="radio" 
                            name="tipoAnotacion" 
                            value="NEGATIVA" 
                            checked={tipoAnotacion === 'NEGATIVA'}
                            onChange={() => setTipoAnotacion('NEGATIVA')}
                          />
                          Negativa
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Descripción / Detalle:</label>
                      <textarea 
                        placeholder="Ingresa la descripción de la falta o el reconocimiento..."
                        value={descripcionAnotacion}
                        onChange={(e) => setDescripcionAnotacion(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="btn-submit-anotacion" disabled={loading}>
                      <FiPlus /> Registrar Anotación
                    </button>
                  </form>
                </div>
              )}

            </div>

          </div>

        </div>
      ) : (
        <div className="anotaciones-empty-state">
          <FiUser className="empty-icon" />
          <p>Selecciona un estudiante para cargar su historial conductual y hoja de vida.</p>
        </div>
      )}
    </div>
  )
}
