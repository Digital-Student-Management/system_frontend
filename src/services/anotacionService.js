import api from './axiosConfig'

// ---------------------------------------------------------------------------
// anotacionService.js — Anotaciones a estudiantes
// Endpoints: /anotaciones/*
// ---------------------------------------------------------------------------

export const getByEstudiante  = (estudianteId)  => api.get(`/anotaciones/estudiante/${estudianteId}`)
export const create           = (data)          => api.post('/anotaciones', data)
export const update           = (id, data)      => api.put(`/anotaciones/${id}`, data)
export const remove           = (id)            => api.delete(`/anotaciones/${id}`)
