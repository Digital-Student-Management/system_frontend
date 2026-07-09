import api from './axiosConfig'

// ---------------------------------------------------------------------------
// matriculaService.js — Gestión de matrículas (ms-estudiantes, 8084)
// Endpoints reales: /api/matriculas/*
// DTO: { idMatricula, idEstudiante, idDirectivo, estadoMatricula, fechaInscripcion }
// ---------------------------------------------------------------------------

export const getAll           = ()            => api.get('/matriculas')
export const getByEstudiante  = (idEst)       => api.get(`/matriculas/estudiante/${idEst}`)
export const create           = (data)        => api.post('/matriculas', data)
export const update           = (id, data)    => api.put(`/matriculas/${id}`, data)
export const remove           = (id)          => api.delete(`/matriculas/${id}`)
