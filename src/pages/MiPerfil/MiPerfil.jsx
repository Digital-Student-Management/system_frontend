import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FiUser,
  FiArrowLeft,
  FiMail,
  FiCreditCard,
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiBriefcase,
  FiCalendar,
  FiPhone,
  FiMapPin
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { getById } from '../../services/usuarioService'
import './MiPerfil.scss'

export default function MiPerfil() {
  const { usuario } = useAuth()
  const [detalle, setDetalle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarPerfil = async () => {
      if (!usuario?.id) {
        setLoading(false)
        return
      }
      try {
        const res = await getById(usuario.id)
        setDetalle(res.data || null)
      } catch (err) {
        console.error('No se pudo cargar el detalle del perfil:', err)
      } finally {
        setLoading(false)
      }
    }
    cargarPerfil()
  }, [usuario])

  const iniciales = (usuario?.nombre || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

  const activo = (detalle?.estadoUsuario || 'ACTIVO').toUpperCase() === 'ACTIVO'

  const camposEspecificos = () => {
    if (!detalle) return []
    switch (detalle.tipoUsuario) {
      case 'ESTUDIANTE':
        return [
          { icon: <FiCalendar />, label: 'Fecha de nacimiento', value: detalle.fechaNacimientoEstudiante },
          { icon: <FiUser />, label: 'ID Apoderado', value: detalle.idApoderado }
        ]
      case 'APODERADO':
        return [
          { icon: <FiPhone />, label: 'Teléfono', value: detalle.telefonoApoderado },
          { icon: <FiBriefcase />, label: 'Profesión / Oficio', value: detalle.profesionOficioApoderado },
          { icon: <FiUser />, label: 'Parentesco', value: detalle.parentescoEst }
        ]
      case 'DOCENTE':
        return [{ icon: <FiBriefcase />, label: 'Especialidad', value: detalle.especialidad }]
      case 'DIRECTIVO':
        return [{ icon: <FiBriefcase />, label: 'Cargo', value: detalle.cargoDirectivo }]
      case 'INSPECTOR':
        return [
          { icon: <FiMapPin />, label: 'Sector asignado', value: detalle.sectorAsignadoInspector },
          { icon: <FiCalendar />, label: 'Turno', value: detalle.turnoInspector }
        ]
      default:
        return []
    }
  }

  return (
    <div className="perfil-container">
      <header className="perfil-header">
        <div className="title-section">
          <FiUser className="icon-title" />
          <div>
            <h1>Mi Perfil</h1>
            <p>Consulta tus datos personales y de cuenta registrados en el sistema.</p>
          </div>
        </div>
        <Link to="/" className="btn-back-home">
          <FiArrowLeft /> Volver al Inicio
        </Link>
      </header>

      <section className="perfil-card">
        <div className="perfil-banner">
          <div className="perfil-avatar">{iniciales}</div>
          <div className="perfil-identidad">
            <h2>{usuario?.nombre}</h2>
            <span className={`rol-badge ${usuario?.rol?.toLowerCase()}`}>{usuario?.rol}</span>
            <span className={`estado-chip ${activo ? 'activo' : 'inactivo'}`}>
              {activo ? <FiCheckCircle /> : <FiXCircle />}
              {activo ? 'Cuenta Activa' : 'Cuenta Inactiva'}
            </span>
          </div>
        </div>

        <div className="perfil-datos">
          <div className="dato-item">
            <FiCreditCard className="dato-icon" />
            <div>
              <span className="dato-label">RUT</span>
              <span className="dato-value mono">{usuario?.rut || '—'}</span>
            </div>
          </div>

          <div className="dato-item">
            <FiMail className="dato-icon" />
            <div>
              <span className="dato-label">Correo electrónico</span>
              <span className="dato-value">{usuario?.email || detalle?.correoUsuario || '—'}</span>
            </div>
          </div>

          <div className="dato-item">
            <FiShield className="dato-icon" />
            <div>
              <span className="dato-label">Rol en el sistema</span>
              <span className="dato-value">{usuario?.rol || '—'}</span>
            </div>
          </div>

          {loading && (
            <div className="dato-item loading-item">
              <span className="dato-value muted">Cargando datos adicionales…</span>
            </div>
          )}

          {camposEspecificos().map(
            (campo) =>
              campo.value != null &&
              campo.value !== '' && (
                <div className="dato-item" key={campo.label}>
                  <span className="dato-icon">{campo.icon}</span>
                  <div>
                    <span className="dato-label">{campo.label}</span>
                    <span className="dato-value">{String(campo.value)}</span>
                  </div>
                </div>
              )
          )}
        </div>

        <footer className="perfil-footer">
          <FiShield />
          <p>
            Para modificar tus datos personales o restablecer tu contraseña, comunícate con la
            administración del establecimiento.
          </p>
        </footer>
      </section>
    </div>
  )
}
