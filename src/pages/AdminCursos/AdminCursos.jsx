import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiLayers, FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiX, FiTag, FiAlertTriangle } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import {
  getAll as getCursos, create as createCurso, update as updateCurso, remove as removeCurso,
  getNiveles, createNivel, removeNivel, getSalas
} from '../../services/cursoService'
import { getAll as getUsuarios } from '../../services/usuarioService'

const ROLES_ADMIN = ['ADMIN', 'DIRECTIVO']
const ANO_ACTUAL = new Date().getFullYear()
const FORM_VACIO = { idNivel: '', letra: '', anoAcademicoCurso: ANO_ACTUAL, idSala: '', idDocenteJefe: '' }

export default function AdminCursos() {
  const { usuario } = useAuth()
  const [cursos, setCursos] = useState([])
  const [niveles, setNiveles] = useState([])
  const [salas, setSalas] = useState([])
  const [docentes, setDocentes] = useState([])
  const [loading, setLoading] = useState(true)

  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)
  const [nuevoNivel, setNuevoNivel] = useState('')

  const cargar = async () => {
    setLoading(true)
    try {
      const [c, n, s, u] = await Promise.all([
        getCursos().catch(() => ({ data: [] })),
        getNiveles().catch(() => ({ data: [] })),
        getSalas().catch(() => ({ data: [] })),
        getUsuarios().catch(() => ({ data: [] }))
      ])
      setCursos(c.data || [])
      setNiveles(n.data || [])
      setSalas(s.data || [])
      setDocentes((u.data || []).filter((x) => x.tipoUsuario === 'DOCENTE'))
    } catch (err) {
      console.error('Error cargando datos de cursos:', err)
      toast.error('No se pudieron cargar los datos.')
    } finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  // ── Niveles ─────────────────────────────────────────────────────────────────
  const handleCrearNivel = async (e) => {
    e.preventDefault()
    if (!nuevoNivel.trim()) return
    try {
      await createNivel({ nombreNivel: nuevoNivel.trim() })
      toast.success('Nivel creado.')
      setNuevoNivel('')
      cargar()
    } catch (err) { console.error(err); toast.error('No se pudo crear el nivel.') }
  }

  const handleEliminarNivel = async (id) => {
    if (!window.confirm('¿Eliminar este nivel? Los cursos que lo usen podrían verse afectados.')) return
    try { await removeNivel(id); toast.success('Nivel eliminado.'); cargar() }
    catch (err) { console.error(err); toast.error('No se pudo eliminar (¿tiene cursos asociados?).') }
  }

  // ── Cursos ──────────────────────────────────────────────────────────────────
  const abrirCrear = () => { setEditandoId(null); setForm(FORM_VACIO); setMostrarForm(true) }
  const abrirEditar = (c) => {
    setEditandoId(c.idCurso)
    setForm({
      idNivel: c.nivel?.idNivel ?? '',
      letra: c.letra ?? '',
      anoAcademicoCurso: c.anoAcademicoCurso ?? ANO_ACTUAL,
      idSala: c.sala?.idSala ?? '',
      idDocenteJefe: c.idDocenteJefe ?? ''
    })
    setMostrarForm(true)
  }
  const cerrar = () => { setMostrarForm(false); setEditandoId(null); setForm(FORM_VACIO) }

  const handleGuardarCurso = async (e) => {
    e.preventDefault()
    if (!form.idNivel || !form.letra || !form.idDocenteJefe) {
      toast.warning('Nivel, letra y profesor jefe son obligatorios.')
      return
    }
    const payload = {
      idNivel: Number(form.idNivel),
      letra: form.letra.toUpperCase(),
      anoAcademicoCurso: Number(form.anoAcademicoCurso),
      idDocenteJefe: Number(form.idDocenteJefe)
    }
    if (form.idSala) payload.idSala = Number(form.idSala)

    setLoading(true)
    try {
      if (editandoId) { await updateCurso(editandoId, payload); toast.success('Curso actualizado.') }
      else { await createCurso(payload); toast.success('Curso creado.') }
      cerrar(); cargar()
    } catch (err) {
      console.error('Error guardando curso:', err)
      toast.error('No se pudo guardar el curso. Verifica los datos.')
    } finally { setLoading(false) }
  }

  const handleEliminarCurso = async (id) => {
    if (!window.confirm('¿Eliminar este curso?')) return
    setLoading(true)
    try { await removeCurso(id); toast.success('Curso eliminado.'); cargar() }
    catch (err) { console.error(err); toast.error('No se pudo eliminar el curso.') }
    finally { setLoading(false) }
  }

  const nombreDocente = (id) => {
    const d = docentes.find((x) => String(x.id) === String(id))
    return d ? `${d.pnombreUsuario} ${d.appaternoUsuario}` : `#${id}`
  }

  if (!ROLES_ADMIN.includes(usuario?.rol)) {
    return (
      <div className="admin-forbidden">
        <FiAlertTriangle className="icon-warn" />
        <h2>Acceso Restringido</h2>
        <p>Esta sección es solo para Administradores y Directivos.</p>
        <Link to="/" className="btn-back-home"><FiArrowLeft /> Volver al Inicio</Link>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="title-section">
          <FiLayers className="icon-title" />
          <div>
            <h1>Gestión de Cursos y Niveles</h1>
            <p>Crea los niveles educativos y los cursos con su sala y profesor jefe.</p>
          </div>
        </div>
        <Link to="/admin" className="btn-back-home"><FiArrowLeft /> Volver al Panel</Link>
      </header>

      {/* Niveles */}
      <section className="admin-section">
        <h2 className="section-title"><FiTag /> Niveles ({niveles.length})</h2>
        <div className="admin-form" style={{ borderStyle: 'solid' }}>
          <form onSubmit={handleCrearNivel} className="form-grid" style={{ marginBottom: 0 }}>
            <div className="input-group full">
              <label>Nuevo nivel (ej: 1° Básico, 4° Medio)</label>
              <input type="text" value={nuevoNivel} onChange={(e) => setNuevoNivel(e.target.value)} placeholder="Nombre del nivel" />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-guardar"><FiPlus /> Agregar Nivel</button>
            </div>
          </form>
          {niveles.length > 0 && (
            <div className="niveles-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {niveles.map((n) => (
                <span key={n.idNivel} className="rol-pill docente" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', fontSize: '0.8rem' }}>
                  {n.nombreNivel}
                  <button type="button" onClick={() => handleEliminarNivel(n.idNivel)} title="Eliminar nivel"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', padding: 0 }}>
                    <FiX />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cursos */}
      <section className="admin-section">
        <div className="admin-toolbar">
          <h2 className="section-title"><FiLayers /> Cursos ({cursos.length})</h2>
          {!mostrarForm && <button className="btn-add" onClick={abrirCrear}><FiPlus /> Nuevo Curso</button>}
        </div>

        {mostrarForm && (
          <form className="admin-form" onSubmit={handleGuardarCurso}>
            <div className="form-head">
              <h3>{editandoId ? 'Editar Curso' : 'Nuevo Curso'}</h3>
              <button type="button" className="btn-cerrar" onClick={cerrar}><FiX /></button>
            </div>
            <div className="form-grid">
              <div className="input-group">
                <label>Nivel</label>
                <select value={form.idNivel} onChange={(e) => setForm({ ...form, idNivel: e.target.value })} required>
                  <option value="">-- Selecciona --</option>
                  {niveles.map((n) => <option key={n.idNivel} value={n.idNivel}>{n.nombreNivel}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Letra</label>
                <input type="text" maxLength={1} placeholder="A" value={form.letra} onChange={(e) => setForm({ ...form, letra: e.target.value.toUpperCase() })} required />
              </div>
              <div className="input-group">
                <label>Año académico</label>
                <input type="number" min="2000" value={form.anoAcademicoCurso} onChange={(e) => setForm({ ...form, anoAcademicoCurso: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>Sala (opcional)</label>
                <select value={form.idSala} onChange={(e) => setForm({ ...form, idSala: e.target.value })}>
                  <option value="">-- Sin asignar --</option>
                  {salas.map((s) => <option key={s.idSala} value={s.idSala}>Sala {s.numeroSala} (cap. {s.capacidadMaxima})</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Profesor jefe</label>
                <select value={form.idDocenteJefe} onChange={(e) => setForm({ ...form, idDocenteJefe: e.target.value })} required>
                  <option value="">-- Selecciona --</option>
                  {docentes.map((d) => <option key={d.id} value={d.id}>{d.pnombreUsuario} {d.appaternoUsuario}</option>)}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-guardar" disabled={loading}>{editandoId ? 'Guardar' : 'Crear Curso'}</button>
              <button type="button" className="btn-cancelar" onClick={cerrar}>Cancelar</button>
            </div>
          </form>
        )}

        {loading && cursos.length === 0 ? (
          <div className="admin-empty"><p>Cargando…</p></div>
        ) : cursos.length === 0 ? (
          <div className="admin-empty"><FiLayers className="empty-icon" /><p>No hay cursos. Crea niveles y luego el primer curso.</p></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>ID</th><th>Curso</th><th>Año</th><th>Sala</th><th>Profesor Jefe</th><th style={{ width: '110px' }}>Acciones</th></tr>
              </thead>
              <tbody>
                {cursos.map((c) => (
                  <tr key={c.idCurso}>
                    <td className="mono">#{c.idCurso}</td>
                    <td><strong>{c.nivel?.nombreNivel} {c.letra}</strong></td>
                    <td>{c.anoAcademicoCurso}</td>
                    <td>{c.sala?.numeroSala ? `Sala ${c.sala.numeroSala}` : '—'}</td>
                    <td>{nombreDocente(c.idDocenteJefe)}</td>
                    <td>
                      <div className="row-actions">
                        <button onClick={() => abrirEditar(c)} title="Editar"><FiEdit2 /></button>
                        <button className="del" onClick={() => handleEliminarCurso(c.idCurso)} title="Eliminar"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
