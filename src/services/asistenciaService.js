import api from './axiosConfig'

// ---------------------------------------------------------------------------
// asistenciaService.js — Registro y consulta de asistencia
// Endpoints: /asistencia/*
// ---------------------------------------------------------------------------

export const registrar        = (data)                  => api.post('/asistencia', data)
export const getByCursoFecha  = (cursoId, fecha)        => api.get(`/asistencia/curso/${cursoId}`, { params: { fecha } })
export const getMiAsistencia  = ()                       => api.get('/asistencia/mi-asistencia')
export const getByEstudiante  = (estudianteId)          => api.get(`/asistencia/estudiante/${estudianteId}`)
export const update           = (id, data)              => api.put(`/asistencia/${id}`, data)
export const getResumen       = (cursoId, params)       => api.get(`/asistencia/resumen/${cursoId}`, { params })
