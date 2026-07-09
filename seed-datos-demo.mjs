/*
 * ============================================================================
 * seed-datos-demo.mjs — Carga de datos de demostración del Sistema Escolar
 * ============================================================================
 *
 * QUÉ HACE:
 *   Puebla una base de datos VACÍA con un set de datos coherente para poder
 *   revisar todas las funcionalidades del sistema (usuarios de cada rol,
 *   cursos, asignaturas, notas, mural, reuniones, anotaciones, etc.).
 *
 * CÓMO USARLO (una sola vez, sobre bases de datos recién creadas):
 *   1. Inicia MySQL y los 9 microservicios (puertos 8081–8089).
 *   2. En una terminal, dentro de la carpeta system_frontend, ejecuta:
 *          node seed-datos-demo.mjs
 *   3. Listo: entra al frontend con cualquiera de las credenciales de abajo.
 *
 * CREDENCIALES (contraseña para todos: Password123):
 *   ADMIN      -> admin@colegio.cl
 *   DIRECTIVO  -> directivo@colegio.cl
 *   DOCENTE    -> docente@colegio.cl
 *   INSPECTOR  -> inspector@colegio.cl
 *   APODERADO  -> apoderado@colegio.cl
 *   ESTUDIANTE -> estudiante@colegio.cl
 *
 * NOTA: Requiere Node 18+ (usa fetch nativo). Ejecutar SOLO una vez; si se
 *       corre de nuevo sobre datos existentes, generará duplicados o errores 409.
 * ============================================================================
 */

const P = {
  cursos: 'http://localhost:8082',
  asign: 'http://localhost:8081',
  usuarios: 'http://localhost:8089',
  eval: 'http://localhost:8085',
  murales: 'http://localhost:8087',
  reuniones: 'http://localhost:8088',
  estudiantes: 'http://localhost:8084'
}
const PASS = 'Password123'
let ok = 0, fail = 0

async function req(method, url, body, token) {
  try {
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined })
    const text = await res.text()
    let data = null
    try { data = text ? JSON.parse(text) : null } catch { data = text }
    if (!res.ok) { fail++; console.log(`  ✗ ${method} ${url} -> ${res.status} ${String(text).slice(0, 100)}`); return null }
    ok++
    return data
  } catch (e) { fail++; console.log(`  ✗ ${method} ${url} -> ${e.message}`); return null }
}
const post = (url, body, token) => req('POST', url, body, token)
const get = (url) => req('GET', url)
const del = (url, token) => req('DELETE', url, null, token)

// Para roles de personal se pasa el token de un admin (autorización requerida por el backend).
async function register(nombreCompleto, rut, email, rol, token) {
  const r = await post(`${P.usuarios}/api/auth/register`, { nombreCompleto, rut, email, password: PASS, rol }, token)
  if (r?.user) console.log(`  ✓ ${rol.padEnd(10)} ${nombreCompleto.padEnd(20)} id=${r.user.id}  (${email})`)
  return r // { token, user }
}

async function main() {
  console.log('\n======= CARGA DE DATOS DEMO =======')

  console.log('\n=== 1. ADMIN (obtiene token para operaciones protegidas) ===')
  const adminReg = await register('Admin Sistema', '10.000.000-0', 'admin@colegio.cl', 'ADMIN')
  const adminToken = adminReg?.token
  if (!adminToken) { console.log('\n⚠  No se pudo crear el ADMIN. ¿Están arriba los microservicios? Abortando.'); return }

  console.log('\n=== 2. PERSONAL Y APODERADOS ===')
  // Los roles de personal se crean con el token del admin (autorización del backend).
  const docentes = []
  docentes.push((await register('María González', '15.111.111-1', 'docente@colegio.cl', 'DOCENTE', adminToken))?.user)
  docentes.push((await register('Pedro Ramírez', '15.222.222-2', 'pedro.ramirez@colegio.cl', 'DOCENTE', adminToken))?.user)
  docentes.push((await register('Ana Torres', '15.333.333-3', 'ana.torres@colegio.cl', 'DOCENTE', adminToken))?.user)
  const directivo = (await register('Roberto Fuentes', '14.000.000-0', 'directivo@colegio.cl', 'DIRECTIVO', adminToken))?.user
  await register('Carmen Rojas', '14.111.111-1', 'inspector@colegio.cl', 'INSPECTOR', adminToken)
  const apo1 = (await register('Jorge Vidal', '16.111.111-1', 'apoderado@colegio.cl', 'APODERADO'))?.user
  const apo2 = (await register('Lucía Morales', '16.222.222-2', 'lucia.morales@colegio.cl', 'APODERADO'))?.user

  console.log('\n=== 3. NIVELES Y SALAS ===')
  const niveles = []
  for (const n of ['7° Básico', '8° Básico', '1° Medio', '2° Medio']) {
    const r = await post(`${P.cursos}/api/niveles`, { nombreNivel: n }); if (r) niveles.push(r)
  }
  const salas = []
  for (const s of [[101, 30], [102, 35], [201, 40], [202, 32]]) {
    const r = await post(`${P.cursos}/api/salas`, { numeroSala: s[0], capacidadMaxima: s[1] }); if (r) salas.push(r)
  }
  console.log(`  ✓ ${niveles.length} niveles, ${salas.length} salas`)

  console.log('\n=== 4. ASIGNATURAS ===')
  const asignaturas = []
  for (const [nombre, horas] of [['Matemática', 6], ['Lenguaje', 6], ['Ciencias Naturales', 4], ['Historia', 4], ['Inglés', 3]]) {
    const r = await post(`${P.asign}/api/asignaturas`, { nombre_asignatura: nombre, horas_semanales: horas }); if (r) asignaturas.push(r)
  }
  console.log(`  ✓ ${asignaturas.length} asignaturas`)

  console.log('\n=== 5. ESTUDIANTES (vinculados a su apoderado) ===')
  // Bootstrap: registrar un estudiante temporal para crear el rol ESTUDIANTE y conocer su idRol
  const tmp = await register('Temporal Bootstrap', '28.000.000-0', 'tmp.bootstrap@colegio.cl', 'ESTUDIANTE')
  const idRolEstudiante = tmp?.user ? (await get(`${P.usuarios}/api/usuarios/${tmp.user.id}`))?.idRol : null
  if (tmp?.user) await del(`${P.usuarios}/api/usuarios/${tmp.user.id}`, adminToken) // eliminar el temporal

  const est = []
  const estDefs = [
    ['Tomás', 'Vidal', '20.111.111-1', 'tomas.vidal@colegio.cl', apo1],
    ['Sofía', 'Vidal', '20.222.222-2', 'sofia.vidal@colegio.cl', apo1],
    ['Matías', 'Morales', '20.333.333-3', 'matias.morales@colegio.cl', apo2],
    ['Valentina', 'Soto', '20.444.444-4', 'valentina.soto@colegio.cl', apo2],
    ['Benjamín', 'Díaz', '20.555.555-5', 'benjamin.diaz@colegio.cl', apo1]
  ]
  for (const [pn, ap, rut, mail, apo] of estDefs) {
    const body = {
      tipoUsuario: 'ESTUDIANTE', rutUsuario: rut, pnombreUsuario: pn, snombreUsuario: '',
      appaternoUsuario: ap, apmaternoUsuario: '', correoUsuario: mail, contrasenaUsuario: PASS,
      estadoUsuario: 'ACTIVO', idRol: idRolEstudiante, fechaNacimientoEstudiante: '2010-03-15',
      idApoderado: apo?.id
    }
    const r = await post(`${P.usuarios}/api/usuarios`, body, adminToken) // POST protegido → requiere token admin
    if (r) { est.push(r); console.log(`  ✓ ${pn} ${ap} id=${r.id} apoderado=${r.idApoderado} (${mail})`) }
  }

  console.log('\n=== 6. CURSOS ===')
  const cursos = []
  const cursoDefs = [[niveles[0], 'A', salas[0], docentes[0]], [niveles[1], 'B', salas[1], docentes[1]], [niveles[2], 'A', salas[2], docentes[2]]]
  for (const [niv, letra, sala, doc] of cursoDefs) {
    if (!niv || !doc) continue
    const r = await post(`${P.cursos}/api/cursos`, { idNivel: niv.idNivel, letra, anoAcademicoCurso: 2026, idSala: sala?.idSala, idDocenteJefe: doc.id })
    if (r) cursos.push(r)
  }
  console.log(`  ✓ ${cursos.length} cursos`)

  console.log('\n=== 7. EVALUACIONES Y NOTAS ===')
  const evals = []
  const evalDefs = [['Prueba de Álgebra', '2026-04-10', 30, asignaturas[0]], ['Control de Lectura', '2026-04-15', 25, asignaturas[1]], ['Prueba de Ciencias', '2026-05-05', 30, asignaturas[2]]]
  for (const [titulo, fecha, pond, asig] of evalDefs) {
    if (!asig) continue
    const r = await post(`${P.eval}/evaluacion`, { tituloEv: titulo, fechaAplicacion: fecha, porcentajePond: pond, idAsignatura: asig.id_asignatura })
    if (r) evals.push(r)
  }
  const vals = [6.5, 5.8, 4.2, 6.9, 5.0]
  for (const ev of evals) for (let i = 0; i < est.length; i++) {
    await post(`${P.eval}/nota`, { valorCalif: vals[i], formatoNota: 'Escrita', puntaje: 40 + i * 3, observacion: 'Registro demo', idEvaluacion: ev.id_evaluacion, idEstudiante: est[i].id })
  }
  console.log(`  ✓ ${evals.length} evaluaciones y ${evals.length * est.length} notas`)

  console.log('\n=== 8. BITÁCORA, MURAL, REUNIONES Y ANOTACIONES ===')
  if (asignaturas[0]) {
    await post(`${P.asign}/api/bitacoras`, { fecha_clase: '2026-04-08', objetivo_aprendizaje: 'Comprender ecuaciones de primer grado', actividades_realizadas: 'Ejercicios en pizarra y trabajo grupal.', observaciones_generales: 'Curso participativo.', id_asignatura: asignaturas[0].id_asignatura })
    await post(`${P.asign}/api/bitacoras`, { fecha_clase: '2026-04-11', objetivo_aprendizaje: 'Aplicar propiedades de potencias', actividades_realizadas: 'Guía de ejercicios y revisión de tareas.', observaciones_generales: 'Reforzar signos.', id_asignatura: asignaturas[0].id_asignatura })
  }
  if (directivo) {
    await post(`${P.murales}/api/murales`, { idFuncionario: directivo.id, contenido: '📢 Bienvenidos al año escolar 2026. Las clases comienzan el lunes 3 de marzo.', nivelAlcance: 'INSTITUCION', fechaPublicacion: '2026-03-01T09:00:00' })
    await post(`${P.murales}/api/murales`, { idFuncionario: directivo.id, contenido: '🎨 Este viernes se realizará la muestra de arte en el gimnasio a las 11:00 hrs.', nivelAlcance: 'INSTITUCION', fechaPublicacion: '2026-04-05T10:30:00' })
    await post(`${P.reuniones}/api/reuniones/actas`, { tipoReunion: 'Consejo de Profesores', decisionesAcuerdos: 'Se acordó reforzar el plan lector en todos los niveles.', idDirectivo: directivo.id })
  }
  if (docentes[0] && est[0] && apo1) await post(`${P.reuniones}/api/reuniones/bitacoras/citaciones`, { acuerdosCompromisos: 'Apoyo en casa con tareas de matemática.', estado: 'PENDIENTE', idDocente: docentes[0].id, temaEspEstudiante: 'Rendimiento en matemática', idEstudiante: est[0].id, idApoderado: apo1.id })
  if (docentes[0] && cursos[0]) await post(`${P.reuniones}/api/reuniones/bitacoras/generales`, { acuerdosCompromisos: 'Organizar paseo de curso.', estado: 'REALIZADA', idDocente: docentes[0].id, temarioGeneralCurso: 'Convivencia y actividades del curso', idCurso: cursos[0].idCurso })
  if (est[0]) await post(`${P.estudiantes}/api/bitacora/anotaciones`, { idEstudiante: est[0].id, tipoAnotacion: 'POSITIVA', descripcionAnotacion: 'Excelente disposición y ayuda a sus compañeros.' })
  if (est[2]) await post(`${P.estudiantes}/api/bitacora/anotaciones`, { idEstudiante: est[2].id, tipoAnotacion: 'NEGATIVA', descripcionAnotacion: 'No trajo materiales de trabajo.' })
  console.log('  ✓ Bitácora, mural, reuniones y anotaciones cargadas')

  console.log('\n=== 9. MATRÍCULAS Y CALENDARIO ===')
  if (directivo) {
    for (const e of est) {
      await post(`${P.estudiantes}/api/matriculas`, { idEstudiante: e.id, idDirectivo: directivo.id, estadoMatricula: 'VIGENTE' })
    }
    await post(`${P.murales}/api/calendario`, { idFuncionario: directivo.id, tituloEvento: 'Inicio de clases 2026', descripEvento: 'Comienzo del año escolar para todos los niveles.', fechaInicio: '2026-03-03' })
    await post(`${P.murales}/api/calendario`, { idFuncionario: directivo.id, tituloEvento: 'Reunión general de apoderados', descripEvento: 'Primera reunión de apoderados del año.', fechaInicio: '2026-04-08' })
    await post(`${P.murales}/api/calendario`, { idFuncionario: directivo.id, tituloEvento: 'Vacaciones de invierno', descripEvento: 'Receso escolar de invierno.', fechaInicio: '2026-07-14', fechaFin: '2026-07-25' })
  }
  console.log(`  ✓ ${est.length} matrículas y 3 eventos de calendario`)

  console.log(`\n======= FIN =======  Éxitos: ${ok}  ·  Fallos: ${fail}`)
  console.log('\nCredenciales (contraseña: Password123):')
  console.log('  admin@colegio.cl · directivo@colegio.cl · docente@colegio.cl')
  console.log('  inspector@colegio.cl · apoderado@colegio.cl · estudiante@colegio.cl\n')
}

main()
