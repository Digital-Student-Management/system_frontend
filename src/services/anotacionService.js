import api from './axiosConfig'

// ---------------------------------------------------------------------------
// anotacionService.js — Anotaciones y Hoja de Vida de Estudiantes
// Endpoints: /api/bitacora/anotaciones/* y /api/bitacora/hojavida/*
// ---------------------------------------------------------------------------

export const getByEstudiante  = (estudianteId)  => api.get(`/bitacora/anotaciones/estudiante/${estudianteId}`)
export const create           = (data)          => api.post('/bitacora/anotaciones', data)
export const update           = (id, data)      => api.put(`/bitacora/anotaciones/${id}`, data)
export const remove           = (id)            => api.delete(`/bitacora/anotaciones/${id}`)
export const getHojaVida      = (estudianteId)  => api.get(`/bitacora/hojavida/${estudianteId}`)
export const updateHojaVida   = (estudianteId, observacion) => api.put(`/bitacora/hojavida/${estudianteId}`, observacion, {
  headers: {
    'Content-Type': 'text/plain'
  }
})
