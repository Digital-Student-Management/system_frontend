import api from './axiosConfig'

// ---------------------------------------------------------------------------
// muralService.js — Mural digital del establecimiento
// Endpoints: /mural/*
// ---------------------------------------------------------------------------

export const getPublicaciones   = ()           => api.get('/mural')
export const getById            = (id)         => api.get(`/mural/${id}`)
export const create             = (data)       => api.post('/mural', data)
export const update             = (id, data)   => api.put(`/mural/${id}`, data)
export const remove             = (id)         => api.delete(`/mural/${id}`)
