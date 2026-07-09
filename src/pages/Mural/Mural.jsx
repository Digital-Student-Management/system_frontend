import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  FiGrid,
  FiArrowLeft,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiX,
  FiSend,
  FiGlobe
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import {
  getPublicaciones,
  create,
  update,
  remove
} from '../../services/muralService'
import './Mural.scss'

const NIVELES = ['INSTITUCION', 'CURSO', 'ASIGNATURA']
const ROLES_PUBLICADORES = ['DOCENTE', 'INSPECTOR', 'DIRECTIVO', 'FUNCIONARIO', 'ADMIN']

/**
 * Mural — Mural digital del establecimiento (ms-murales).
 * Todos los roles pueden leer; el personal del colegio puede publicar,
 * editar y eliminar comunicados.
 */
export default function Mural() {
  const { usuario } = useAuth()
  const [publicaciones, setPublicaciones] = useState([])
  const [loading, setLoading] = useState(true)

  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [contenido, setContenido] = useState('')
  const [nivelAlcance, setNivelAlcance] = useState('INSTITUCION')

  const puedePublicar = ROLES_PUBLICADORES.includes(usuario?.rol)

  const cargar = async () => {
    setLoading(true)
    try {
      const res = await getPublicaciones()
      const ordenadas = (res.data || []).sort(
        (a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion)
      )
      setPublicaciones(ordenadas)
    } catch (err) {
      console.error('Error cargando el mural:', err)
      toast.error('No se pudo cargar el mural digital.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const abrirCrear = () => {
    setEditandoId(null)
    setContenido('')
    setNivelAlcance('INSTITUCION')
    setMostrarForm(true)
  }

  const abrirEditar = (p) => {
    setEditandoId(p.idPublicacion)
    setContenido(p.contenido || '')
    setNivelAlcance(p.nivelAlcance || 'INSTITUCION')
    setMostrarForm(true)
  }

  const cerrarForm = () => {
    setMostrarForm(false)
    setEditandoId(null)
    setContenido('')
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!contenido.trim()) {
      toast.warning('El contenido no puede estar vacío.')
      return
    }

    const payload = {
      idFuncionario: usuario?.id,
      contenido: contenido.trim(),
      nivelAlcance,
      fechaPublicacion: new Date().toISOString().slice(0, 19)
    }

    setLoading(true)
    try {
      if (editandoId) {
        await update(editandoId, payload)
        toast.success('Publicación actualizada.')
      } else {
        await create(payload)
        toast.success('¡Publicación agregada al mural!')
      }
      cerrarForm()
      cargar()
    } catch (err) {
      console.error('Error guardando publicación:', err)
      toast.error('No se pudo guardar la publicación.')
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta publicación del mural?')) return
    setLoading(true)
    try {
      await remove(id)
      toast.success('Publicación eliminada.')
      cargar()
    } catch (err) {
      console.error('Error eliminando publicación:', err)
      toast.error('No se pudo eliminar la publicación.')
    } finally {
      setLoading(false)
    }
  }

  const formatearFecha = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d)) return iso
    return d.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="mural-container">
      <header className="mural-header">
        <div className="title-section">
          <FiGrid className="icon-title" />
          <div>
            <h1>Mural Digital</h1>
            <p>Comunicados y novedades del Colegio Bernardo O'Higgins.</p>
          </div>
        </div>
        <Link to="/" className="btn-back-home">
          <FiArrowLeft /> Volver al Inicio
        </Link>
      </header>

      {puedePublicar && !mostrarForm && (
        <button type="button" className="btn-publicar" onClick={abrirCrear}>
          <FiPlus /> Nueva Publicación
        </button>
      )}

      {mostrarForm && (
        <form className="mural-form" onSubmit={handleGuardar}>
          <div className="form-head">
            <h3>{editandoId ? 'Editar Publicación' : 'Nueva Publicación'}</h3>
            <button type="button" className="btn-cerrar" onClick={cerrarForm}><FiX /></button>
          </div>
          <textarea
            rows={4}
            placeholder="Escribe el comunicado o novedad para la comunidad escolar…"
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            required
          />
          <div className="form-footer">
            <div className="nivel-select">
              <label>Alcance:</label>
              <select value={nivelAlcance} onChange={(e) => setNivelAlcance(e.target.value)}>
                {NIVELES.map((n) => (
                  <option key={n} value={n}>{n.charAt(0) + n.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancelar" onClick={cerrarForm}>Cancelar</button>
              <button type="submit" className="btn-enviar" disabled={loading}>
                <FiSend /> {editandoId ? 'Guardar' : 'Publicar'}
              </button>
            </div>
          </div>
        </form>
      )}

      {loading && publicaciones.length === 0 ? (
        <div className="mural-empty"><p>Cargando publicaciones…</p></div>
      ) : publicaciones.length === 0 ? (
        <div className="mural-empty">
          <FiGrid className="empty-icon" />
          <p>Todavía no hay publicaciones en el mural.</p>
        </div>
      ) : (
        <div className="mural-feed">
          {publicaciones.map((p) => (
            <article className="mural-card" key={p.idPublicacion}>
              <div className="card-top">
                <span className={`nivel-chip ${(p.nivelAlcance || 'institucion').toLowerCase()}`}>
                  <FiGlobe /> {p.nivelAlcance || 'INSTITUCION'}
                </span>
                <span className="card-fecha">{formatearFecha(p.fechaPublicacion)}</span>
              </div>
              <p className="card-contenido">{p.contenido}</p>
              <div className="card-footer">
                <span className="card-autor">Publicado por funcionario #{p.idFuncionario}</span>
                {puedePublicar && (
                  <div className="card-acciones">
                    <button type="button" onClick={() => abrirEditar(p)} title="Editar"><FiEdit2 /></button>
                    <button
                      type="button"
                      className="del"
                      onClick={() => handleEliminar(p.idPublicacion)}
                      title="Eliminar"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
