import api from './axiosConfig'

// ---------------------------------------------------------------------------
// matriculaService.js — Gestión de matrículas
// Endpoints: /matriculas/*
// ---------------------------------------------------------------------------

export const getAll           = ()           => api.get('/matriculas')
export const getById          = (id)         => api.get(`/matriculas/${id}`)
export const getByEstudiante  = (rutEst)     => api.get(`/matriculas/estudiante/${rutEst}`)
export const create           = (data)       => api.post('/matriculas', data)
export const update           = (id, data)   => api.put(`/matriculas/${id}`, data)
export const cambiarEstado    = (id, estado) => api.patch(`/matriculas/${id}/estado`, { estado })
