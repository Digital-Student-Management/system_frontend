import api from './axiosConfig'

// ---------------------------------------------------------------------------
// estudianteService.js — Gestión de datos de estudiantes
// Endpoints: /estudiantes/*
// ---------------------------------------------------------------------------

export const getMiPerfil      = ()           => api.get('/estudiantes/me')
export const getAll           = ()           => api.get('/estudiantes')
export const getById          = (id)         => api.get(`/estudiantes/${id}`)
export const getByCurso       = (cursoId)    => api.get(`/estudiantes/curso/${cursoId}`)
export const update           = (id, data)   => api.put(`/estudiantes/${id}`, data)
export const getAntMedicos    = (id)         => api.get(`/estudiantes/${id}/antecedentes-medicos`)
export const getAntAcademicos = (id)         => api.get(`/estudiantes/${id}/antecedentes-academicos`)
export const getHojaVida      = (id)         => api.get(`/estudiantes/${id}/hoja-vida`)
export const getAnotaciones   = (id)         => api.get(`/estudiantes/${id}/anotaciones`)
