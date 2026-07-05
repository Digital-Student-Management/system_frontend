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
export const getBitacora  = (asignaturaId)   => api.get(`/asignaturas/${asignaturaId}/bitacora`)
