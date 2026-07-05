import api from './axiosConfig'

// ---------------------------------------------------------------------------
// reunionService.js — Gestión de reuniones de apoderados
// Endpoints: /reuniones/*
// ---------------------------------------------------------------------------

export const getAll           = ()            => api.get('/reuniones')
export const getById          = (id)          => api.get(`/reuniones/${id}`)
export const getMisReuniones  = ()            => api.get('/reuniones/mis-reuniones')
export const create           = (data)        => api.post('/reuniones', data)
export const update           = (id, data)    => api.put(`/reuniones/${id}`, data)
export const remove           = (id)          => api.delete(`/reuniones/${id}`)
export const getBitacora      = (reunionId)   => api.get(`/reuniones/${reunionId}/bitacora`)
export const getCitaciones    = (apoId)       => api.get(`/reuniones/citaciones/apoderado/${apoId}`)
