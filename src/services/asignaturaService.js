import api from './axiosConfig'

// ---------------------------------------------------------------------------
// asignaturaService.js — Gestión de asignaturas
// Endpoints: /asignaturas/*
// ---------------------------------------------------------------------------

export const getAll       = ()               => api.get('/asignaturas')
export const getById      = (id)             => api.get(`/asignaturas/${id}`)
export const getByCurso   = (cursoId)        => api.get(`/asignaturas/curso/${cursoId}`)
export const create       = (data)           => api.post('/asignaturas', data)
export const update       = (id, data)       => api.put(`/asignaturas/${id}`, data)
export const remove       = (id)             => api.delete(`/asignaturas/${id}`)

// ---------------------------------------------------------------------------
// Bitácora de asignatura (registro de clases) — ms-asignaturas → /api/bitacoras/*
// DTO: { id_bitacora_asignatura, fecha_clase (yyyy-MM-dd), actividades_realizadas,
//        observaciones_generales, objetivo_aprendizaje, id_asignatura }
// ---------------------------------------------------------------------------
export const getBitacoras            = ()             => api.get('/bitacoras')
export const getBitacorasByAsignatura = (asignaturaId) => api.get(`/bitacoras/asignatura/${asignaturaId}`)
export const createBitacora          = (data)         => api.post('/bitacoras', data)
export const updateBitacora          = (id, data)     => api.put(`/bitacoras/${id}`, data)
export const removeBitacora          = (id)           => api.delete(`/bitacoras/${id}`)
