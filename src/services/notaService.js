import api from './axiosConfig'

// ---------------------------------------------------------------------------
// notaService.js — Registro y consulta de evaluaciones y notas
// Consume los endpoints nativos sin modificar el backend (filtros en cliente).
// ---------------------------------------------------------------------------

// Evaluaciones
export const getEvaluaciones = async (asignaturaId) => {
  try {
    const response = await api.get('/evaluaciones')
    // Filtrado en el cliente para mantener el MS intacto
    const filtered = response.data.filter(e => e.idAsignatura === parseInt(asignaturaId))
    return { ...response, data: filtered }
  } catch (error) {
    console.error('Error fetching evaluaciones, returning empty list:', error)
    return { data: [] }
  }
}

export const createEvaluacion = (data) => {
  // POST /evaluacion
  return api.post('/evaluaciones', data)
}

export const updateEvaluacion = (id, data) => {
  // La base de datos actualiza el registro si el id_evaluacion viene en el POST
  return api.post('/evaluaciones', {
    ...data,
    id_evaluacion: parseInt(id)
  })
}

export const deleteEvaluacion = (id) => {
  // DELETE /evaluacion/{id}
  return api.delete(`/evaluaciones/${id}`)
}

// Notas
export const getNotasByEvaluacion = async (evalId) => {
  try {
    const response = await api.get('/notas')
    // Filtrado por ID de evaluación en cliente
    const filtered = response.data.filter(n => n.idEvaluacion === parseInt(evalId))
    return { ...response, data: filtered }
  } catch (error) {
    console.error('Error fetching notas, returning empty list:', error)
    return { data: [] }
  }
}

export const getNotasByEstudiante = async (estudianteId) => {
  try {
    const response = await api.get('/notas')
    // Filtrado por ID de estudiante en cliente
    const filtered = response.data.filter(n => n.idEstudiante === parseInt(estudianteId))
    return { ...response, data: filtered }
  } catch (error) {
    console.error('Error fetching notas, returning empty list:', error)
    return { data: [] }
  }
}

export const getMisNotas = async (estudianteId) => {
  return getNotasByEstudiante(estudianteId)
}

export const registrarNota = (data) => {
  // POST /nota
  return api.post('/notas', data)
}

export const updateNota = (id, data) => {
  // Actualiza en JPA mediante POST si enviamos el id_nota
  return api.post('/notas', {
    ...data,
    id_nota: parseInt(id)
  })
}

export const getPromedios = async (cursoId, asignaturaId) => {
  try {
    // 1. Obtener todas las evaluaciones asociadas a la asignatura
    const evResponse = await getEvaluaciones(asignaturaId)
    const evIds = evResponse.data.map(e => e.id_evaluacion)

    if (evIds.length === 0) {
      return { data: { promedioGeneral: 0, totalNotas: 0 } }
    }

    // 2. Obtener todas las notas
    const notesResponse = await api.get('/notas')
    
    // 3. Filtrar notas que pertenecen a esas evaluaciones
    const filteredNotes = notesResponse.data.filter(n => evIds.includes(n.idEvaluacion))

    if (filteredNotes.length === 0) {
      return { data: { promedioGeneral: 0, totalNotas: 0 } }
    }

    const total = filteredNotes.reduce((acc, curr) => acc + curr.valorCalif, 0)
    const promedio = (total / filteredNotes.length).toFixed(2)

    return {
      data: {
        promedioGeneral: parseFloat(promedio),
        totalNotas: filteredNotes.length
      }
    }
  } catch (error) {
    console.error('Error calculando promedios:', error)
    return { data: { promedioGeneral: 0, totalNotas: 0 } }
  }
}

