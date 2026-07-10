import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiPlus, FiSave, FiAlertTriangle, FiBookOpen, FiUser, FiTrendingUp, FiArrowLeft, FiTrash2 } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import {
  getEvaluaciones,
  createEvaluacion,
  getNotasByEvaluacion,
  registrarNota,
  updateNota,
  deleteNota
} from '../../services/notaService'
import { getAll as getCursos } from '../../services/cursoService'
import { getAll as getAsignaturas } from '../../services/asignaturaService'
import { getAll as getUsuarios } from '../../services/usuarioService'
import './RegistroNotas.scss'

export default function RegistroNotas() {
  const { usuario } = useAuth()
  
  // Listados Maestros desde Base de Datos
  const [cursos, setCursos] = useState([])
  const [asignaturas, setAsignaturas] = useState([])
  const [estudiantes, setEstudiantes] = useState([])

  // Selectores de estado
  const [cursoSeleccionado, setCursoSeleccionado] = useState('')
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState('')
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState('')

  // Listados cargados
  const [evaluaciones, setEvaluaciones] = useState([])
  const [notas, setNotas] = useState({}) // Mapea estudianteId -> objeto nota
  const [loading, setLoading] = useState(false)

  // Crear nueva evaluación
  const [mostrarCrearEv, setMostrarCrearEv] = useState(false)
  const [nuevoTitulo, setNuevoTitulo] = useState('')
  const [nuevaFecha, setNuevaFecha] = useState('')
  const [nuevoPorcentaje, setNuevoPorcentaje] = useState('')

  // Carga inicial de datos maestros de la Base de Datos
  const cargarDatosMaestros = async () => {
    setLoading(true)
    try {
      // 1. Cargar cursos reales
      const cursosRes = await getCursos()
      setCursos(cursosRes.data || [])

      // 2. Cargar asignaturas reales
      const asignaturasRes = await getAsignaturas()
      setAsignaturas(asignaturasRes.data || [])

      // 3. Cargar estudiantes reales del MS de usuarios
      const usuariosRes = await getUsuarios()
      const alumnos = (usuariosRes.data || []).filter(u => u.tipoUsuario === 'ESTUDIANTE')
      const alumnosFormateados = alumnos.map(u => ({
        id: u.id,
        nombreCompleto: `${u.pnombreUsuario} ${u.appaternoUsuario}`,
        rut: u.rutUsuario
      }))
      setEstudiantes(alumnosFormateados)
    } catch (err) {
      console.error('Error al cargar datos maestros desde la base de datos:', err)
      toast.error('No se pudo conectar con los microservicios de base de datos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatosMaestros()
  }, [])

  // Carga de Evaluaciones
  const cargarEvaluaciones = async (asignaturaId) => {
    if (!asignaturaId) return
    setLoading(true)
    try {
      const res = await getEvaluaciones(asignaturaId)
      setEvaluaciones(res.data || [])
    } catch (err) {
      console.error('Error cargando evaluaciones de la API:', err)
      setEvaluaciones([])
      toast.error('No se pudieron obtener las evaluaciones del servidor.')
    } finally {
      setLoading(false)
    }
  }

  // Carga de Notas asociadas a la evaluación
  const cargarNotas = async (evalId) => {
    if (!evalId) return
    setLoading(true)
    try {
      const res = await getNotasByEvaluacion(evalId)
      const notasMap = {}
      
      // Mapeamos las notas recibidas a su estudiante
      res.data.forEach((n) => {
        notasMap[n.idEstudiante] = {
          id_nota: n.id_nota,
          valorCalif: n.valorCalif,
          observacion: n.observacion || '',
          puntaje: n.puntaje || 0,
          formatoNota: n.formatoNota || 'Escrita'
        }
      })

      // Rellenamos estudiantes que no tienen nota registrada aún en base a la lista real
      estudiantes.forEach((est) => {
        if (!notasMap[est.id]) {
          notasMap[est.id] = {
            id_nota: null,
            valorCalif: '',
            observacion: '',
            puntaje: '',
            formatoNota: 'Escrita'
          }
        }
      })

      setNotas(notasMap)
    } catch (err) {
      console.error('Error al cargar notas de la API:', err)
      setNotas({})
    } finally {
      setLoading(false)
    }
  }

  // Detectar cambios de selección
  useEffect(() => {
    setAsignaturaSeleccionada('')
    setEvaluacionSeleccionada('')
    setEvaluaciones([])
    setNotas({})
  }, [cursoSeleccionado])

  useEffect(() => {
    setEvaluacionSeleccionada('')
    setNotas({})
    if (asignaturaSeleccionada) {
      cargarEvaluaciones(asignaturaSeleccionada)
    }
  }, [asignaturaSeleccionada])

  useEffect(() => {
    if (evaluacionSeleccionada) {
      cargarNotas(evaluacionSeleccionada)
    } else {
      setNotas({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluacionSeleccionada])

  // Crear Evaluación
  const handleCrearEvaluacion = async (e) => {
    e.preventDefault()
    if (!nuevoTitulo || !nuevaFecha || !nuevoPorcentaje) {
      toast.warning('Por favor completa todos los campos de la evaluación.')
      return
    }

    const payload = {
      tituloEv: nuevoTitulo,
      fechaAplicacion: nuevaFecha,
      porcentajePond: parseFloat(nuevoPorcentaje),
      idAsignatura: parseInt(asignaturaSeleccionada)
    }

    setLoading(true)
    try {
      await createEvaluacion(payload)
      toast.success('¡Evaluación creada exitosamente en MySQL!')
      setNuevoTitulo('')
      setNuevoPorcentaje('')
      setNuevaFecha('')
      setMostrarCrearEv(false)
      cargarEvaluaciones(asignaturaSeleccionada)
    } catch (err) {
      console.error('Error al registrar evaluación en base de datos:', err)
      toast.error('No se pudo guardar la evaluación en la base de datos.')
    } finally {
      setLoading(false)
    }
  }

  // Modificar celda de nota
  const handleNotaChange = (estudianteId, campo, valor) => {
    setNotas((prev) => ({
      ...prev,
      [estudianteId]: {
        ...prev[estudianteId],
        [campo]: valor
      }
    }))
  }

  // Eliminar una calificación ya registrada en la base de datos
  const handleEliminarNota = async (estudianteId) => {
    const item = notas[estudianteId]
    if (!item?.id_nota) {
      toast.info('Esta calificación aún no está guardada.')
      return
    }
    if (!window.confirm('¿Eliminar esta calificación de la base de datos?')) return
    setLoading(true)
    try {
      await deleteNota(item.id_nota)
      toast.success('Calificación eliminada.')
      cargarNotas(evaluacionSeleccionada)
    } catch (err) {
      console.error('Error al eliminar nota:', err)
      toast.error('No se pudo eliminar la calificación.')
    } finally {
      setLoading(false)
    }
  }

  // Guardar Calificaciones
  const handleGuardarNotas = async () => {
    if (!evaluacionSeleccionada) return

    setLoading(true)
    let exitosas = 0
    let fallidas = 0
    let modificadas = 0

    try {
      for (const estId of Object.keys(notas)) {
        const item = notas[estId]
        if (item.valorCalif === '' || item.valorCalif === undefined) continue

        const val = parseFloat(item.valorCalif)
        if (isNaN(val) || val < 1.0 || val > 7.0) {
          toast.error(`La nota de estudiante ID ${estId} debe estar entre 1.0 y 7.0`)
          setLoading(false)
          return
        }

        const payload = {
          valorCalif: val,
          formatoNota: item.formatoNota || 'Escrita',
          puntaje: parseInt(item.puntaje) || 0,
          observacion: item.observacion || '',
          idEvaluacion: parseInt(evaluacionSeleccionada),
          idEstudiante: parseInt(estId)
        }

        try {
          if (item.id_nota) {
            await updateNota(item.id_nota, payload)
            modificadas++
          } else {
            await registrarNota(payload)
          }
          exitosas++
        } catch {
          fallidas++
        }
      }

      if (fallidas === 0 && exitosas > 0) {
        toast.success('¡Todas las calificaciones fueron guardadas en MySQL!')
      } else if (exitosas > 0) {
        toast.warn(`Se guardaron ${exitosas} notas. ${fallidas} fallaron al guardar en DB.`)
      } else {
        toast.info('No se guardaron notas nuevas.')
      }

      // Al modificar notas existentes, se notifica el cambio a los apoderados.
      if (modificadas > 0) {
        toast.info(`🔔 Se notificó a los apoderados el cambio de ${modificadas} calificación(es).`)
      }

      cargarNotas(evaluacionSeleccionada)
    } catch (err) {
      console.error('Error masivo al guardar notas:', err)
      toast.error('Ocurrió un error al guardar.')
    } finally {
      setLoading(false)
    }
  }

  // Métricas del curso
  const calcularEstadisticas = () => {
    const listado = Object.values(notas)
      .map((n) => parseFloat(n.valorCalif))
      .filter((v) => !isNaN(v))

    if (listado.length === 0) return { promedio: '-', aprobados: '-', max: '-', min: '-' }

    const suma = listado.reduce((acc, v) => acc + v, 0)
    const prom = (suma / listado.length).toFixed(2)
    const aprobadosCount = listado.filter((v) => v >= 4.0).length
    const rate = ((aprobadosCount / listado.length) * 100).toFixed(0)
    const max = Math.max(...listado).toFixed(1)
    const min = Math.min(...listado).toFixed(1)

    return { promedio: prom, aprobados: `${rate}%`, max, min }
  }

  const stats = calcularEstadisticas()

  // Restricción de acceso
  if (usuario?.rol !== 'DOCENTE' && usuario?.rol !== 'ADMIN') {
    return (
      <div className="notas-forbidden">
        <FiAlertTriangle className="icon-warn" />
        <h2>Acceso Denegado</h2>
        <p>Esta sección está restringida únicamente para Docentes y Directivos del Colegio.</p>
      </div>
    )
  }

  return (
    <div className="notas-container">
      <header className="notas-header">
        <div className="title-section">
          <FiBookOpen className="icon-title" />
          <div>
            <h1>Registro de Calificaciones</h1>
            <p>Ingresa, edita y gestiona las planificaciones y notas de evaluaciones escolares desde la base de datos.</p>
          </div>
        </div>
        <Link to="/" className="btn-back-home">
          <FiArrowLeft /> Volver al Inicio
        </Link>
      </header>

      {/* Selectores */}
      <section className="notas-selectors-panel">
        <div className="selector-group">
          <label>Curso:</label>
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
          <label>Asignatura:</label>
          <select 
            value={asignaturaSeleccionada} 
            onChange={(e) => setAsignaturaSeleccionada(e.target.value)}
            disabled={!cursoSeleccionado}
          >
            <option value="">-- Selecciona Asignatura --</option>
            {asignaturas.map((a) => (
              <option key={a.id_asignatura} value={a.id_asignatura}>
                {a.nombre_asignatura}
              </option>
            ))}
          </select>
        </div>

        <div className="selector-group">
          <label>Evaluación:</label>
          <div className="eval-select-wrapper">
            <select 
              value={evaluacionSeleccionada} 
              onChange={(e) => setEvaluacionSeleccionada(e.target.value)}
              disabled={!asignaturaSeleccionada}
            >
              <option value="">-- Selecciona Evaluación --</option>
              {evaluaciones.map((ev) => (
                <option key={ev.id_evaluacion} value={ev.id_evaluacion}>
                  {ev.tituloEv} ({ev.porcentajePond}%)
                </option>
              ))}
            </select>

            {asignaturaSeleccionada && (
              <button 
                type="button" 
                className="btn-add-eval"
                onClick={() => setMostrarCrearEv(!mostrarCrearEv)}
                title="Añadir Evaluación"
              >
                <FiPlus />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Crear Nueva Evaluación Form */}
      {mostrarCrearEv && (
        <form className="crear-eval-form" onSubmit={handleCrearEvaluacion}>
          <h3>Planificar Nueva Evaluación</h3>
          <div className="form-grid">
            <div className="input-group">
              <label>Título del Examen:</label>
              <input 
                type="text" 
                placeholder="Ej. Prueba Parcial 2" 
                value={nuevoTitulo} 
                onChange={(e) => setNuevoTitulo(e.target.value)} 
                required
              />
            </div>
            <div className="input-group">
              <label>Fecha de Aplicación:</label>
              <input 
                type="date" 
                value={nuevaFecha} 
                onChange={(e) => setNuevaFecha(e.target.value)} 
                required
              />
            </div>
            <div className="input-group">
              <label>Ponderación (%):</label>
              <input 
                type="number" 
                min="1" 
                max="100" 
                placeholder="Ej. 25" 
                value={nuevoPorcentaje} 
                onChange={(e) => setNuevoPorcentaje(e.target.value)} 
                required
              />
            </div>
            <div className="btn-actions">
              <button type="submit" className="btn-save-eval" disabled={loading}>
                Crear Examen
              </button>
              <button type="button" className="btn-cancel-eval" onClick={() => setMostrarCrearEv(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Grid de notas */}
      {evaluacionSeleccionada ? (
        <div className="notas-workspace">
          {/* Métricas rápidas */}
          <div className="notas-stats-grid">
            <div className="stat-card">
              <FiTrendingUp className="stat-icon" />
              <div className="stat-info">
                <span className="stat-val">{stats.promedio}</span>
                <span className="stat-label">Promedio de Curso</span>
              </div>
            </div>
            <div className="stat-card">
              <FiUser className="stat-icon" />
              <div className="stat-info">
                <span className="stat-val">{stats.aprobados}</span>
                <span className="stat-label">Tasa de Aprobación</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <span className="stat-val max-grade">{stats.max}</span>
                <span className="stat-label">Calificación Máxima</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <span className="stat-val min-grade">{stats.min}</span>
                <span className="stat-label">Calificación Mínima</span>
              </div>
            </div>
          </div>

          {/* Tabla de Alumnos */}
          <div className="table-responsive">
            <table className="tabla-calificaciones">
              <thead>
                <tr>
                  <th>Rut Estudiante</th>
                  <th>Nombre Completo</th>
                  <th style={{ width: '110px' }}>Nota (1.0 - 7.0)</th>
                  <th style={{ width: '100px' }}>Puntaje</th>
                  <th style={{ width: '130px' }}>Formato</th>
                  <th>Observación / Comentario</th>
                  <th style={{ width: '60px' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.map((est) => {
                  const item = notas[est.id] || {}
                  return (
                    <tr key={est.id}>
                      <td className="rut-cell">{est.rut}</td>
                      <td className="name-cell">{est.nombreCompleto}</td>
                      <td>
                        <input
                          type="number"
                          step="0.1"
                          min="1.0"
                          max="7.0"
                          placeholder="0.0"
                          value={item.valorCalif || ''}
                          className={`input-grade ${parseFloat(item.valorCalif) < 4.0 ? 'insuficiente' : ''}`}
                          onChange={(e) => handleNotaChange(est.id, 'valorCalif', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          placeholder="Pts"
                          value={item.puntaje || ''}
                          className="input-score"
                          onChange={(e) => handleNotaChange(est.id, 'puntaje', e.target.value)}
                        />
                      </td>
                      <td>
                        <select
                          value={item.formatoNota || 'Escrita'}
                          className="select-format"
                          onChange={(e) => handleNotaChange(est.id, 'formatoNota', e.target.value)}
                        >
                          <option value="Escrita">Escrita</option>
                          <option value="Oral">Oral</option>
                          <option value="Presentación">Presentación</option>
                          <option value="Taller">Taller</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="Ej: Excelente avance, necesita reforzar álgebra."
                          value={item.observacion || ''}
                          className="input-obs"
                          onChange={(e) => handleNotaChange(est.id, 'observacion', e.target.value)}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-del-nota"
                          title={item.id_nota ? 'Eliminar calificación' : 'Sin calificación guardada'}
                          disabled={!item.id_nota}
                          onClick={() => handleEliminarNota(est.id)}
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="action-save-bar">
            <button className="btn-save-grades" onClick={handleGuardarNotas} disabled={loading}>
              <FiSave /> Guardar Notas en MySQL
            </button>
          </div>
        </div>
      ) : (
        <div className="notas-empty-state">
          <FiAlertTriangle className="empty-icon" />
          <p>Selecciona un Curso, Asignatura y Evaluación para habilitar la planilla de ingreso de calificaciones.</p>
        </div>
      )}
    </div>
  )
}
