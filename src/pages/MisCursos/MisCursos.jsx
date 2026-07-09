import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  FiBookOpen,
  FiArrowLeft,
  FiHome,
  FiUsers,
  FiClock,
  FiAward,
  FiGrid
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { getAll as getCursos } from '../../services/cursoService'
import { getAll as getAsignaturas } from '../../services/asignaturaService'
import './MisCursos.scss'

/**
 * MisCursos — Vista de cursos y asignaturas.
 * Docentes ven destacados los cursos donde son Profesor Jefe; el resto
 * consulta el catálogo de cursos y asignaturas del establecimiento.
 */
export default function MisCursos() {
  const { usuario } = useAuth()
  const [cursos, setCursos] = useState([])
  const [asignaturas, setAsignaturas] = useState([])
  const [loading, setLoading] = useState(true)

  const esDocente = usuario?.rol === 'DOCENTE'

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      try {
        const [cursosRes, asigRes] = await Promise.all([getCursos(), getAsignaturas()])
        setCursos(cursosRes.data || [])
        setAsignaturas(asigRes.data || [])
      } catch (err) {
        console.error('Error cargando cursos/asignaturas:', err)
        toast.error('No se pudieron cargar los cursos desde el servidor.')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const esMiCurso = (curso) => esDocente && String(curso.idDocenteJefe) === String(usuario?.id)

  // Docente: sus cursos primero
  const cursosOrdenados = [...cursos].sort((a, b) => Number(esMiCurso(b)) - Number(esMiCurso(a)))

  const nombreCurso = (c) =>
    `${c.nivel?.nombreNivel || 'Sin nivel'} ${c.letra || ''}`.trim()

  return (
    <div className="cursos-container">
      <header className="cursos-header">
        <div className="title-section">
          <FiBookOpen className="icon-title" />
          <div>
            <h1>{esDocente ? 'Mis Cursos' : 'Cursos y Asignaturas'}</h1>
            <p>
              {esDocente
                ? 'Cursos a tu cargo y asignaturas impartidas en el establecimiento.'
                : 'Consulta los cursos y asignaturas del Colegio Bernardo O\'Higgins.'}
            </p>
          </div>
        </div>
        <Link to="/" className="btn-back-home">
          <FiArrowLeft /> Volver al Inicio
        </Link>
      </header>

      {loading ? (
        <div className="cursos-empty">
          <FiGrid className="empty-icon" />
          <p>Cargando información académica…</p>
        </div>
      ) : (
        <>
          {/* Sección de Cursos */}
          <section className="cursos-section">
            <h2 className="section-title"><FiHome /> Cursos ({cursos.length})</h2>
            {cursos.length === 0 ? (
              <div className="cursos-empty small">
                <p>No hay cursos registrados en el sistema.</p>
              </div>
            ) : (
              <div className="cursos-grid">
                {cursosOrdenados.map((c) => (
                  <article className={`curso-card ${esMiCurso(c) ? 'destacado' : ''}`} key={c.idCurso}>
                    {esMiCurso(c) && <span className="jefe-tag"><FiAward /> Profesor Jefe</span>}
                    <div className="curso-nivel">{nombreCurso(c)}</div>
                    <div className="curso-ano">Año académico {c.anoAcademicoCurso || '—'}</div>
                    <div className="curso-meta">
                      <span>
                        <FiHome />
                        {c.sala?.numeroSala ? `Sala ${c.sala.numeroSala}` : 'Sin sala asignada'}
                      </span>
                      {c.sala?.capacidadMaxima && (
                        <span>
                          <FiUsers />
                          {c.sala.capacidadMaxima} cupos
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Sección de Asignaturas */}
          <section className="cursos-section">
            <h2 className="section-title"><FiBookOpen /> Asignaturas ({asignaturas.length})</h2>
            {asignaturas.length === 0 ? (
              <div className="cursos-empty small">
                <p>No hay asignaturas registradas en el sistema.</p>
              </div>
            ) : (
              <div className="asignaturas-grid">
                {asignaturas.map((a) => (
                  <article className="asignatura-card" key={a.id_asignatura}>
                    <div className="asig-icon"><FiBookOpen /></div>
                    <div className="asig-info">
                      <span className="asig-nombre">{a.nombre_asignatura}</span>
                      <span className="asig-horas"><FiClock /> {a.horas_semanales} hrs semanales</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
