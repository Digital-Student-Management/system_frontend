import api from './axiosConfig'

// ---------------------------------------------------------------------------
// cursoService.js — Gestión de cursos, niveles y salas (ms-cursos, 8082)
// Endpoints: /cursos/*, /niveles/*, /salas/*
// ---------------------------------------------------------------------------

// ───── Cursos ───────────────────────────────────────────────────────────────
export const getAll        = ()            => api.get('/cursos')
export const getById       = (id)          => api.get(`/cursos/${id}`)
export const getByDocente  = (idDocente)   => api.get(`/cursos/docente/${idDocente}`)
export const create        = (data)        => api.post('/cursos', data)
export const update        = (id, data)    => api.put(`/cursos/${id}`, data)
export const remove        = (id)          => api.delete(`/cursos/${id}`)

// ───── Niveles ──────────────────────────────────────────────────────────────
export const getNiveles    = ()            => api.get('/niveles')
export const createNivel   = (data)        => api.post('/niveles', data)
export const updateNivel   = (id, data)    => api.put(`/niveles/${id}`, data)
export const removeNivel   = (id)          => api.delete(`/niveles/${id}`)

// ───── Salas ────────────────────────────────────────────────────────────────
export const getSalas      = ()            => api.get('/salas')
export const createSala    = (data)        => api.post('/salas', data)
export const updateSala    = (id, data)    => api.put(`/salas/${id}`, data)
export const removeSala    = (id)          => api.delete(`/salas/${id}`)
