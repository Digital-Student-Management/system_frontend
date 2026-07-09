import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  FiUsers,
  FiArrowLeft,
  FiCreditCard,
  FiMail,
  FiCalendar,
  FiFileText,
  FiAward,
  FiUser
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { getAll as getUsuarios } from '../../services/usuarioService'
import './MiEstudiante.scss'

/**
 * MiEstudiante — Ficha de estudiante(s).
 *  - APODERADO: ve a su(s) pupilo(s) (estudiantes cuyo idApoderado coincide).
 *  - ESTUDIANTE: ve su propia ficha.
 *  - DOCENTE / INSPECTOR / DIRECTIVO / ADMIN: directorio de estudiantes.
 * Los datos provienen de ms-usuarios (lista de usuarios con tipoUsuario).
 */
export default function MiEstudiante() {
  const { usuario } = useAuth()
  const [estudiantes, setEstudiantes] = useState([])
  const [loading, setLoading] = useState(true)

  const rol = usuario?.rol
  const esApoderado = rol === 'APODERADO'
  const esEstudiante = rol === 'ESTUDIANTE'

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      try {
        const res = await getUsuarios()
        const todos = res.data || []
        let alumnos = todos.filter((u) => u.tipoUsuario === 'ESTUDIANTE')

        if (esEstudiante) {
          alumnos = alumnos.filter((u) => String(u.id) === String(usuario?.id))
        } else if (esApoderado) {
          alumnos = alumnos.filter((u) => String(u.idApoderado) === String(usuario?.id))
        }
        setEstudiantes(alumnos)
      } catch (err) {
        console.error('Error cargando estudiantes:', err)
        toast.error('No se pudo cargar la información de estudiantes.')
      } finally {
        setLoading(false)
      }
    }
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario])

  const nombreCompleto = (e) =>
    [e.pnombreUsuario, e.snombreUsuario, e.appaternoUsuario, e.apmaternoUsuario]
      .filter(Boolean)
      .join(' ')

  const iniciales = (e) =>
    `${e.pnombreUsuario?.[0] || ''}${e.appaternoUsuario?.[0] || ''}`.toUpperCase()

  const titulo = esApoderado ? 'Mi Pupilo' : esEstudiante ? 'Mi Ficha' : 'Estudiantes'
  const subtitulo = esApoderado
    ? 'Información académica y personal de tu(s) pupilo(s).'
    : esEstudiante
    ? 'Tu ficha personal como estudiante del establecimiento.'
    : 'Directorio de estudiantes registrados en el sistema.'

  return (
    <div className="estudiante-container">
      <header className="estudiante-header">
        <div className="title-section">
          <FiUsers className="icon-title" />
          <div>
            <h1>{titulo}</h1>
            <p>{subtitulo}</p>
          </div>
        </div>
        <Link to="/" className="btn-back-home">
          <FiArrowLeft /> Volver al Inicio
        </Link>
      </header>

      {loading ? (
        <div className="estudiante-empty">
          <FiUser className="empty-icon" />
          <p>Cargando información…</p>
        </div>
      ) : estudiantes.length === 0 ? (
        <div className="estudiante-empty">
          <FiUsers className="empty-icon" />
          <p>
            {esApoderado
              ? 'No hay estudiantes asociados a tu cuenta de apoderado todavía.'
              : 'No se encontraron estudiantes registrados.'}
          </p>
        </div>
      ) : (
        <div className="estudiantes-grid">
          {estudiantes.map((e) => (
            <article className="estudiante-card" key={e.id}>
              <div className="est-top">
                <div className="est-avatar">{iniciales(e)}</div>
                <div className="est-nombre">
                  <h3>{nombreCompleto(e)}</h3>
                  <span className={`est-estado ${(e.estadoUsuario || 'ACTIVO').toLowerCase()}`}>
                    {e.estadoUsuario || 'ACTIVO'}
                  </span>
                </div>
              </div>

              <div className="est-datos">
                <span><FiCreditCard /> <span className="mono">{e.rutUsuario || '—'}</span></span>
                <span><FiMail /> {e.correoUsuario || '—'}</span>
                {e.fechaNacimientoEstudiante && (
                  <span><FiCalendar /> Nac. {e.fechaNacimientoEstudiante}</span>
                )}
              </div>

              <div className="est-acciones">
                <Link to="/anotaciones" className="est-accion">
                  <FiFileText /> Anotaciones
                </Link>
                <Link to="/mis-notas" className="est-accion">
                  <FiAward /> Calificaciones
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
