import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts'
import { FiBookOpen, FiAward, FiAlertCircle, FiActivity, FiTrendingUp, FiArrowLeft } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { getMisNotas, getEvaluaciones } from '../../services/notaService'
import { getAll as getAsignaturas } from '../../services/asignaturaService'
import './MisNotas.scss'

export default function MisNotas() {
  const { usuario } = useAuth()
  const [reporteAsignaturas, setReporteAsignaturas] = useState([])
  const [promedioGeneral, setPromedioGeneral] = useState(0)
  const [totalEvaluaciones, setTotalEvaluaciones] = useState(0)
  const [loading, setLoading] = useState(true)

  // Carga de notas y evaluaciones reales desde base de datos
  const cargarLibretaCalificaciones = async () => {
    setLoading(true)
    const estudianteId = usuario?.id || 1
    try {
      // 1. Cargar todas las asignaturas conocidas en la base de datos
      const asigRes = await getAsignaturas()
      const asignaturasList = asigRes.data || []

      // 2. Obtener notas reales del estudiante
      const notasRes = await getMisNotas(estudianteId)
      const notasList = notasRes.data || []

      // 3. Obtener evaluaciones del backend
      // Realizamos un fetch a todas las evaluaciones
      const evsRes = await getEvaluaciones(0) // Pasa 0 para que devuelva todo y filtremos
      const evsList = evsRes.data || []

      // Consolidar datos en base a las materias y notas reales
      const asignaturasConsolidadas = {}

      asignaturasList.forEach((a) => {
        asignaturasConsolidadas[a.id_asignatura] = {
          id: a.id_asignatura,
          nombre: a.nombre_asignatura,
          profesor: 'Docente Asignado',
          calificaciones: [],
          promedio: 0
        }
      })

      // Emparejar cada nota real con su evaluación correspondiente
      notasList.forEach((nota) => {
        const ev = evsList.find((e) => e.id_evaluacion === nota.idEvaluacion)
        if (ev) {
          const asigId = ev.idAsignatura
          if (asignaturasConsolidadas[asigId]) {
            asignaturasConsolidadas[asigId].calificaciones.push({
              idNota: nota.id_nota,
              nota: nota.valorCalif,
              titulo: ev.tituloEv,
              fecha: ev.fechaAplicacion,
              porcentaje: ev.porcentajePond,
              observacion: nota.observacion || 'Sin comentarios'
            })
          }
        }
      })

      // Calcular promedios individuales
      let sumaPromedios = 0
      let asignaturasConNotas = 0
      let totalCalificaciones = 0

      const listaFinal = Object.values(asignaturasConsolidadas).map((asig) => {
        if (asig.calificaciones.length > 0) {
          const suma = asig.calificaciones.reduce((acc, c) => acc + c.nota, 0)
          const prom = parseFloat((suma / asig.calificaciones.length).toFixed(2))
          sumaPromedios += prom
          asignaturasConNotas++
          totalCalificaciones += asig.calificaciones.length
          return { ...asig, promedio: prom }
        }
        return { ...asig, promedio: 0 }
      })

      const promGral = asignaturasConNotas > 0 ? parseFloat((sumaPromedios / asignaturasConNotas).toFixed(2)) : 0

      setReporteAsignaturas(listaFinal)
      setPromedioGeneral(promGral)
      setTotalEvaluaciones(totalCalificaciones)
    } catch (error) {
      console.error('Error al cargar libreta de calificaciones desde base de datos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarLibretaCalificaciones()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Datos para el gráfico de avance académico
  const chartData = reporteAsignaturas
    .filter((a) => a.promedio > 0)
    .map((a) => ({
      name: a.nombre.substring(0, 10) + '.',
      Promedio: a.promedio
    }))

  return (
    <div className="mis-notas-container">
      <header className="mis-notas-header">
        <div className="title-section">
          <FiAward className="icon-title" />
          <div>
            <h1>Mi Libreta de Calificaciones</h1>
            <p>Monitorea tu avance curricular, promedios parciales e informes reales de la base de datos.</p>
          </div>
        </div>
        <Link to="/" className="btn-back-home">
          <FiArrowLeft /> Volver al Inicio
        </Link>
      </header>

      {loading ? (
        <div className="loading-state">
          <p>Cargando calificaciones de la base de datos...</p>
        </div>
      ) : (
        <>
          {/* Métricas e Info del Alumno */}
          <section className="mis-notas-dashboard">
            <div className="metric-card">
              <FiTrendingUp className="metric-icon" />
              <div className="metric-info">
                <span className={`metric-val ${promedioGeneral < 4.0 ? 'insuficiente' : 'suficiente'}`}>
                  {promedioGeneral || '0.0'}
                </span>
                <span className="metric-label">Promedio General</span>
              </div>
            </div>

            <div className="metric-card">
              <FiBookOpen className="metric-icon" />
              <div className="metric-info">
                <span className="metric-val">{totalEvaluaciones}</span>
                <span className="metric-label">Calificaciones Registradas</span>
              </div>
            </div>

            <div className="metric-card">
              <FiActivity className="metric-icon" />
              <div className="metric-info">
                <span className="metric-val">
                  {reporteAsignaturas.filter((a) => a.promedio > 0 && a.promedio < 4.0).length}
                </span>
                <span className="metric-label">Asignaturas en Riesgo (&lt; 4.0)</span>
              </div>
            </div>
          </section>

          {/* Gráfico y Libreta */}
          <div className="mis-notas-grid">
            {/* Libreta de Asignaturas */}
            <div className="asignaturas-list">
              {reporteAsignaturas.length > 0 ? (
                reporteAsignaturas.map((asig) => (
                  <div key={asig.id} className="asignatura-card">
                    <div className="asignatura-header">
                      <div>
                        <h2>{asig.nombre}</h2>
                        <span className="prof-name">{asig.profesor}</span>
                      </div>
                      <div className={`asignatura-promedio ${asig.promedio === 0 ? 'vacio' : asig.promedio < 4.0 ? 'riesgo' : 'aprobado'}`}>
                        {asig.promedio > 0 ? asig.promedio.toFixed(1) : '-.-'}
                      </div>
                    </div>

                    <div className="calificaciones-sublist">
                      {asig.calificaciones.length > 0 ? (
                        <table className="tabla-calificaciones-estudiante">
                          <thead>
                            <tr>
                              <th>Evaluación</th>
                              <th>Ponderación</th>
                              <th>Nota</th>
                              <th>Comentario del Docente</th>
                            </tr>
                          </thead>
                          <tbody>
                            {asig.calificaciones.map((c) => (
                              <tr key={c.idNota}>
                                <td className="eval-title">{c.titulo}</td>
                                <td className="eval-pond">{c.porcentaje}%</td>
                                <td className={`eval-grade ${c.nota < 4.0 ? 'insuficiente' : ''}`}>{c.nota.toFixed(1)}</td>
                                <td className="eval-comment">{c.observacion}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="empty-calificaciones">
                          <FiAlertCircle className="icon-empty" />
                          <span>Sin calificaciones registradas en este período.</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state-list">
                  <p>No se encontraron asignaturas registradas en la base de datos.</p>
                </div>
              )}
            </div>

            {/* Panel Lateral con Gráfico */}
            <div className="grafico-panel">
              <div className="grafico-card">
                <h3>Rendimiento por Asignatura</h3>
                <p>Evolución de promedios parciales acumulados en el año.</p>

                {chartData.length > 0 ? (
                  <div className="chart-container" style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis domain={[1.0, 7.0]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="Promedio" 
                          stroke="#2563eb" 
                          strokeWidth={3} 
                          activeDot={{ r: 6 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="empty-chart">
                    <span>No hay datos suficientes para graficar.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
