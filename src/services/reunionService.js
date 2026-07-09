import api from './axiosConfig'

// ---------------------------------------------------------------------------
// reunionService.js — Gestión de reuniones (ms-reuniones, 8088)
// El backend expone 3 recursos bajo /api/reuniones:
//   1. Actas de reuniones internas de directivos        → /actas
//   2. Citaciones individuales a apoderados              → /bitacoras/citaciones
//   3. Reuniones generales de curso                      → /bitacoras/generales
// ---------------------------------------------------------------------------

// ───── Actas de reuniones internas (Directivos) ─────────────────────────────
export const getActas         = ()            => api.get('/reuniones/actas')
export const getActaById      = (id)          => api.get(`/reuniones/actas/${id}`)
export const getActasByDirectivo = (idDir)    => api.get(`/reuniones/actas/directivo/${idDir}`)
export const createActa       = (data)        => api.post('/reuniones/actas', data)
export const updateActa       = (id, data)    => api.put(`/reuniones/actas/${id}`, data)
export const removeActa       = (id)          => api.delete(`/reuniones/actas/${id}`)

// ───── Citaciones individuales (Apoderados) ─────────────────────────────────
export const getCitaciones    = ()            => api.get('/reuniones/bitacoras/citaciones')
export const getCitacionById  = (id)          => api.get(`/reuniones/bitacoras/citaciones/${id}`)
export const createCitacion   = (data)        => api.post('/reuniones/bitacoras/citaciones', data)
export const updateCitacion   = (id, data)    => api.put(`/reuniones/bitacoras/citaciones/${id}`, data)
export const removeCitacion   = (id)          => api.delete(`/reuniones/bitacoras/citaciones/${id}`)

// ───── Reuniones generales de curso ─────────────────────────────────────────
export const getGenerales     = ()            => api.get('/reuniones/bitacoras/generales')
export const getGeneralById   = (id)          => api.get(`/reuniones/bitacoras/generales/${id}`)
export const createGeneral    = (data)        => api.post('/reuniones/bitacoras/generales', data)
export const updateGeneral    = (id, data)    => api.put(`/reuniones/bitacoras/generales/${id}`, data)
export const removeGeneral    = (id)          => api.delete(`/reuniones/bitacoras/generales/${id}`)
