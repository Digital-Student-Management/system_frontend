import api from './axiosConfig'

// ---------------------------------------------------------------------------
// notaService.js — Registro y consulta de evaluaciones y notas
// Endpoints: /evaluaciones/*, /notas/*
// ---------------------------------------------------------------------------

// Evaluaciones
export const getEvaluaciones          = (asignaturaId)             => api.get(`/evaluaciones/asignatura/${asignaturaId}`)
export const createEvaluacion         = (data)                     => api.post('/evaluaciones', data)
export const updateEvaluacion         = (id, data)                 => api.put(`/evaluaciones/${id}`, data)
export const deleteEvaluacion         = (id)                       => api.delete(`/evaluaciones/${id}`)

// Notas
export const getNotasByEvaluacion     = (evalId)                   => api.get(`/notas/evaluacion/${evalId}`)
export const getNotasByEstudiante     = (estudianteId)             => api.get(`/notas/estudiante/${estudianteId}`)
export const getMisNotas              = ()                          => api.get('/notas/mis-notas')
export const registrarNota            = (data)                     => api.post('/notas', data)
export const updateNota               = (id, data)                 => api.put(`/notas/${id}`, data)
export const getPromedios             = (cursoId, asignaturaId)    => api.get(`/notas/promedios`, { params: { cursoId, asignaturaId } })
