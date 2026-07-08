import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { 
  FiMail, 
  FiSend, 
  FiTrash2, 
  FiPlus, 
  FiUser, 
  FiCalendar, 
  FiDownload, 
  FiPaperclip, 
  FiInbox, 
  FiArrowLeft,
  FiSearch
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { 
  getBandeja, 
  enviarMensaje, 
  eliminarMensaje 
} from '../../services/mensajeService'
import { getAll as getUsuarios } from '../../services/usuarioService'
import dayjs from 'dayjs'
import './Mensajeria.scss'

export default function Mensajeria() {
  const { usuario } = useAuth()
  const currentUserId = usuario?.id || 11 // Fallback para pruebas locales

  // Estados de carga de datos
  const [mensajes, setMensajes] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [filtroRemitente, setFiltroRemitente] = useState('')

  // Estados del mensaje seleccionado
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null)

  // Vista de Redacción
  const [modoRedactar, setModoRedactar] = useState(false)
  const [destinatarioId, setDestinatarioId] = useState('')
  const [cuerpoMensaje, setCuerpoMensaje] = useState('')
  const [hiloConversacion, setHiloConversacion] = useState('General')
  const [archivoAdjunto, setArchivoAdjunto] = useState(null)

  // Carga inicial de datos de la base de datos
  const cargarMensajeria = async () => {
    setLoading(true)
    try {
      // 1. Cargar bandeja de entrada del usuario logueado
      const bandejaRes = await getBandeja(currentUserId)
      setMensajes(bandejaRes.data || [])

      // 2. Cargar listado de usuarios para redactarles
      const usuariosRes = await getUsuarios()
      const listadoFiltrado = (usuariosRes.data || []).filter(u => u.id !== currentUserId)
      setUsuarios(listadoFiltrado)
    } catch (err) {
      console.error('Error al cargar mensajería:', err)
      toast.error('Error al conectar con los microservicios de mensajería y usuarios.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarMensajeria()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Buscar nombre del remitente por su ID en el listado local de usuarios
  const obtenerNombreUsuario = (id) => {
    if (id === currentUserId) return 'Yo'
    const found = usuarios.find(u => u.id === id)
    return found ? `${found.pnombreUsuario} ${found.appaternoUsuario} (${found.tipoUsuario})` : `Usuario #${id}`
  };

  // Filtrar mensajes por el buscador
  const mensajesFiltrados = mensajes.filter(msg => {
    const nombreRemitente = obtenerNombreUsuario(msg.idRemitente).toLowerCase()
    const cuerpo = msg.cuerpoMensaje.toLowerCase()
    const query = filtroRemitente.toLowerCase()
    return nombreRemitente.includes(query) || cuerpo.includes(query)
  })

  // Enviar mensaje
  const handleEnviarMensaje = async (e) => {
    e.preventDefault()
    if (!destinatarioId) {
      toast.warning('Por favor selecciona un destinatario.')
      return
    }
    if (!cuerpoMensaje.trim()) {
      toast.warning('El mensaje no puede estar vacío.')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('idRemitente', currentUserId)
      formData.append('idDestinatario', parseInt(destinatarioId))
      formData.append('cuerpoMensaje', cuerpoMensaje.trim())
      formData.append('hiloConversacion', hiloConversacion)
      if (archivoAdjunto) {
        formData.append('archivo', archivoAdjunto)
      }

      await enviarMensaje(formData)
      toast.success('¡Mensaje enviado con éxito!')

      // Limpiar campos
      setCuerpoMensaje('')
      setArchivoAdjunto(null)
      setDestinatarioId('')
      setModoRedactar(false)

      // Recargar bandeja
      await cargarMensajeria()
    } catch (err) {
      console.error('Error al enviar mensaje:', err)
      toast.error('No se pudo enviar el mensaje. Verifica los microservicios.')
    } finally {
      setLoading(false)
    }
  }

  // Eliminar mensaje
  const handleEliminarMensaje = async (id) => {
    if (!window.confirm('¿Deseas eliminar este mensaje permanentemente?')) return

    setLoading(true)
    try {
      await eliminarMensaje(id)
      toast.success('Mensaje eliminado.')
      setMensajeSeleccionado(null)
      await cargarMensajeria()
    } catch (err) {
      console.error('Error al borrar mensaje:', err)
      toast.error('No se pudo eliminar el mensaje.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mensajeria-container">
      <header className="mensajeria-header">
        <div className="title-section">
          <FiMail className="icon-title" />
          <div>
            <h1>Mensajería Escolar</h1>
            <p>Comunícate directamente con la comunidad educativa de manera privada e institucional.</p>
          </div>
        </div>
        <Link to="/" className="btn-back-home">
          <FiArrowLeft /> Volver al Inicio
        </Link>
      </header>

      <div className="mensajeria-layout">
        
        {/* Panel Izquierdo: Lista de Mensajes */}
        <aside className="mensajeria-sidebar">
          <button 
            type="button" 
            className={`btn-compose ${modoRedactar ? 'active' : ''}`}
            onClick={() => {
              setModoRedactar(true)
              setMensajeSeleccionado(null)
            }}
          >
            <FiPlus /> Redactar Mensaje
          </button>

          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar por remitente o texto..." 
              value={filtroRemitente}
              onChange={(e) => setFiltroRemitente(e.target.value)}
            />
          </div>

          <div className="message-list-header">
            <FiInbox />
            <span>Bandeja de Entrada</span>
          </div>

          <div className="messages-list">
            {loading && mensajes.length === 0 ? (
              <p className="status-text">Cargando correspondencia...</p>
            ) : mensajesFiltrados.length > 0 ? (
              mensajesFiltrados.map((msg) => (
                <div 
                  key={msg.idMensaje} 
                  className={`message-item ${mensajeSeleccionado?.idMensaje === msg.idMensaje ? 'active' : ''}`}
                  onClick={() => {
                    setMensajeSeleccionado(msg)
                    setModoRedactar(false)
                  }}
                >
                  <div className="item-meta">
                    <span className="sender">{obtenerNombreUsuario(msg.idRemitente)}</span>
                    <span className="date">{dayjs(msg.fechaHoraEnvio).format('DD MMM')}</span>
                  </div>
                  <span className="subject">{msg.hiloConversacion || 'General'}</span>
                  <p className="body-excerpt">{msg.cuerpoMensaje}</p>
                  {msg.urlArchivoAdjunto && (
                    <span className="attachment-indicator">
                      <FiPaperclip /> Adjunto
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-mailbox">
                <FiInbox className="empty-icon" />
                <p>No tienes mensajes en tu bandeja de entrada.</p>
              </div>
            )}
          </div>
        </aside>

        {/* Panel Derecho: Detalles o Redacción */}
        <main className="mensajeria-main-panel">
          {modoRedactar ? (
            <div className="composer-view">
              <h2>Nuevo Mensaje</h2>
              <form onSubmit={handleEnviarMensaje} className="composer-form">
                <div className="form-group">
                  <label>Para (Destinatario):</label>
                  <select 
                    value={destinatarioId} 
                    onChange={(e) => setDestinatarioId(e.target.value)}
                    required
                  >
                    <option value="">-- Selecciona Destinatario --</option>
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.pnombreUsuario} {u.appaternoUsuario} ({u.tipoUsuario})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Asunto / Hilo de Conversación:</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Justificativo, Consulta Pedagógica..." 
                    value={hiloConversacion}
                    onChange={(e) => setHiloConversacion(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Cuerpo del Mensaje:</label>
                  <textarea 
                    placeholder="Escribe tu mensaje institucional aquí..." 
                    value={cuerpoMensaje}
                    onChange={(e) => setCuerpoMensaje(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group file-input-group">
                  <label htmlFor="file-upload" className="file-label">
                    <FiPaperclip /> {archivoAdjunto ? archivoAdjunto.name : 'Adjuntar Archivo (Opcional)'}
                  </label>
                  <input 
                    id="file-upload"
                    type="file" 
                    onChange={(e) => setArchivoAdjunto(e.target.files[0])}
                  />
                  {archivoAdjunto && (
                    <button 
                      type="button" 
                      className="btn-clear-file" 
                      onClick={() => setArchivoAdjunto(null)}
                    >
                      Quitar archivo
                    </button>
                  )}
                </div>

                <div className="composer-actions">
                  <button type="submit" className="btn-send-message" disabled={loading}>
                    <FiSend /> Enviar Correo
                  </button>
                  <button 
                    type="button" 
                    className="btn-cancel" 
                    onClick={() => setModoRedactar(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          ) : mensajeSeleccionado ? (
            <div className="message-detail-view">
              <div className="detail-header">
                <div className="detail-meta">
                  <h2>{mensajeSeleccionado.hiloConversacion || 'General'}</h2>
                  <div className="sender-info">
                    <FiUser />
                    <span>De: <strong>{obtenerNombreUsuario(mensajeSeleccionado.idRemitente)}</strong></span>
                  </div>
                  <div className="date-info">
                    <FiCalendar />
                    <span>Enviado: {dayjs(mensajeSeleccionado.fechaHoraEnvio).format('DD/MM/YYYY - HH:mm')}</span>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn-delete-message"
                  onClick={() => handleEliminarMensaje(mensajeSeleccionado.idMensaje)}
                  title="Eliminar mensaje"
                >
                  <FiTrash2 /> Eliminar
                </button>
              </div>

              <div className="detail-body">
                <p>{mensajeSeleccionado.cuerpoMensaje}</p>
              </div>

              {mensajeSeleccionado.urlArchivoAdjunto && (
                <div className="detail-attachments">
                  <h4>Archivo Adjunto:</h4>
                  <a 
                    href={`http://localhost:8086${mensajeSeleccionado.urlArchivoAdjunto}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="attachment-download-card"
                  >
                    <FiPaperclip className="attach-icon" />
                    <div className="attach-info">
                      <span>Documento / Imagen</span>
                      <small>Haga clic para abrir o descargar</small>
                    </div>
                    <FiDownload className="download-icon" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="detail-empty-state">
              <FiMail className="empty-icon" />
              <p>Selecciona un mensaje de la bandeja de entrada para leer su contenido, o redacta uno nuevo.</p>
            </div>
          )}
        </main>

      </div>
    </div>
  )
}
