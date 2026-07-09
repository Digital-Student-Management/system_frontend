import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiFileText, FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiX, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { getAll, create, update, remove } from '../../services/matriculaService'
import { getAll as getUsuarios } from '../../services/usuarioService'

const ROLES_GESTION = ['ADMIN', 'DIRECTIVO', 'FUNCIONARIO']
const ESTADOS = ['VIGENTE', 'PENDIENTE', 'RENOVADA', 'RETIRADA']

export default function Matriculas() {
  const { usuario } = useAuth()
  const [matriculas, setMatriculas] = useState([])
  const [estudiantes, setEstudiantes] = useState([])
  const [directivos, setDirectivos] = useState([])
  const [loading, setLoading] = useState(true)

  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState({ idEstudiante: '', idDirectivo: '', estadoMatricula: 'VIGENTE' })

  const puedeGestionar = ROLES_GESTION.includes(usuario?.rol)
  const esApoderado = usuario?.rol === 'APODERADO'

  const cargar = async () => {
    setLoading(true)
    try {
      const [matRes, usuRes] = await Promise.all([getAll(), getUsuarios()])
      const usuarios = usuRes.data || []
      const alumnos = usuarios.filter((u) => u.tipoUsuario === 'ESTUDIANTE')
      setEstudiantes(alumnos)
      setDirectivos(usuarios.filter((u) => u.tipoUsuario === 'DIRECTIVO'))

      let mats = matRes.data || []
      // El apoderado solo ve las matrículas de sus pupilos
      if (esApoderado) {
        const idsPupilos = alumnos.filter((a) => String(a.idApoderado) === String(usuario?.id)).map((a) => a.id)
        mats = mats.filter((m) => idsPupilos.includes(m.idEstudiante))
      }
      setMatriculas(mats)
    } catch (err) {
      console.error('Error cargando matrículas:', err)
      toast.error('No se pudieron cargar las matrículas.')
    } finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  const nombre = (lista, id) => {
    const u = lista.find((x) => String(x.id) === String(id))
    return u ? `${u.pnombreUsuario} ${u.appaternoUsuario}` : `#${id}`
  }

  const abrirCrear = () => {
    setEditandoId(null)
    setForm({ idEstudiante: '', idDirectivo: usuario?.rol === 'DIRECTIVO' ? usuario.id : '', estadoMatricula: 'VIGENTE' })
    setMostrarForm(true)
  }
  const abrirEditar = (m) => {
    setEditandoId(m.idMatricula)
    setForm({ idEstudiante: m.idEstudiante, idDirectivo: m.idDirectivo, estadoMatricula: m.estadoMatricula })
    setMostrarForm(true)
  }
  const cerrar = () => { setMostrarForm(false); setEditandoId(null) }

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!form.idEstudiante || !form.idDirectivo) {
      toast.warning('Selecciona estudiante y directivo.')
      return
    }
    const payload = {
      idEstudiante: Number(form.idEstudiante),
      idDirectivo: Number(form.idDirectivo),
      estadoMatricula: form.estadoMatricula
    }
    setLoading(true)
    try {
      if (editandoId) { await update(editandoId, payload); toast.success('Matrícula actualizada.') }
      else { await create(payload); toast.success('Matrícula registrada.') }
      cerrar(); cargar()
    } catch (err) {
      console.error('Error guardando matrícula:', err)
      toast.error('No se pudo guardar la matrícula.')
    } finally { setLoading(false) }
  }

  const handleRenovar = async (m) => {
    setLoading(true)
    try {
      await update(m.idMatricula, { idEstudiante: m.idEstudiante, idDirectivo: m.idDirectivo, estadoMatricula: 'RENOVADA' })
      toast.success('Matrícula renovada.')
      cargar()
    } catch (err) { console.error(err); toast.error('No se pudo renovar.') }
    finally { setLoading(false) }
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta matrícula?')) return
    setLoading(true)
    try { await remove(id); toast.success('Matrícula eliminada.'); cargar() }
    catch (err) { console.error(err); toast.error('No se pudo eliminar.') }
    finally { setLoading(false) }
  }

  const fecha = (iso) => iso ? new Date(iso).toLocaleDateString('es-CL') : '—'

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="title-section">
          <FiFileText className="icon-title" />
          <div>
            <h1>Matrícula de Estudiantes</h1>
            <p>{esApoderado ? 'Estado de matrícula de tus pupilos.' : 'Registra, renueva y gestiona las matrículas del establecimiento.'}</p>
          </div>
        </div>
        <Link to="/" className="btn-back-home"><FiArrowLeft /> Volver al Inicio</Link>
      </header>

      {puedeGestionar && (
        <div className="admin-toolbar">
          <div className="toolbar-left" />
          {!mostrarForm && <button className="btn-add" onClick={abrirCrear}><FiPlus /> Nueva Matrícula</button>}
        </div>
      )}

      {mostrarForm && (
        <form className="admin-form" onSubmit={handleGuardar}>
          <div className="form-head">
            <h3>{editandoId ? 'Modificar Matrícula' : 'Registrar Matrícula'}</h3>
            <button type="button" className="btn-cerrar" onClick={cerrar}><FiX /></button>
          </div>
          <div className="form-grid">
            <div className="input-group">
              <label>Estudiante</label>
              <select value={form.idEstudiante} onChange={(e) => setForm({ ...form, idEstudiante: e.target.value })} required>
                <option value="">-- Selecciona --</option>
                {estudiantes.map((es) => <option key={es.id} value={es.id}>{es.pnombreUsuario} {es.appaternoUsuario}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Directivo responsable</label>
              <select value={form.idDirectivo} onChange={(e) => setForm({ ...form, idDirectivo: e.target.value })} required>
                <option value="">-- Selecciona --</option>
                {directivos.map((d) => <option key={d.id} value={d.id}>{d.pnombreUsuario} {d.appaternoUsuario}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Estado</label>
              <select value={form.estadoMatricula} onChange={(e) => setForm({ ...form, estadoMatricula: e.target.value })}>
                {ESTADOS.map((es) => <option key={es} value={es}>{es}</option>)}
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-guardar" disabled={loading}>{editandoId ? 'Guardar' : 'Registrar'}</button>
              <button type="button" className="btn-cancelar" onClick={cerrar}>Cancelar</button>
            </div>
          </div>
        </form>
      )}

      {loading && matriculas.length === 0 ? (
        <div className="admin-empty"><p>Cargando…</p></div>
      ) : matriculas.length === 0 ? (
        <div className="admin-empty"><FiFileText className="empty-icon" /><p>{esApoderado ? 'No hay matrículas asociadas a tus pupilos.' : 'No hay matrículas registradas.'}</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>ID</th><th>Estudiante</th><th>Directivo</th><th>Estado</th><th>Inscripción</th>{puedeGestionar && <th style={{ width: '140px' }}>Acciones</th>}</tr>
            </thead>
            <tbody>
              {matriculas.map((m) => (
                <tr key={m.idMatricula}>
                  <td className="mono">#{m.idMatricula}</td>
                  <td><strong>{nombre(estudiantes, m.idEstudiante)}</strong></td>
                  <td>{nombre(directivos, m.idDirectivo)}</td>
                  <td><span className={`estado-pill ${(m.estadoMatricula || '').toLowerCase()}`}>{m.estadoMatricula}</span></td>
                  <td>{fecha(m.fechaInscripcion)}</td>
                  {puedeGestionar && (
                    <td>
                      <div className="row-actions">
                        <button onClick={() => handleRenovar(m)} title="Renovar"><FiRefreshCw /></button>
                        <button onClick={() => abrirEditar(m)} title="Modificar"><FiEdit2 /></button>
                        <button className="del" onClick={() => handleEliminar(m.idMatricula)} title="Eliminar"><FiTrash2 /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!puedeGestionar && !esApoderado && (
        <div className="admin-empty"><FiAlertTriangle className="empty-icon" /><p>Solo consulta disponible para tu rol.</p></div>
      )}
    </div>
  )
}
