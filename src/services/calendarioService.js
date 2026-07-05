import api from './axiosConfig'

// ---------------------------------------------------------------------------
// calendarioService.js — Eventos y calendario estudiantil
// Endpoints: /calendario/*, /eventos/*
// ---------------------------------------------------------------------------

export const getEventos     = (params)    => api.get('/calendario/eventos', { params })
export const getEvento      = (id)        => api.get(`/calendario/eventos/${id}`)
export const createEvento   = (data)      => api.post('/calendario/eventos', data)
export const updateEvento   = (id, data)  => api.put(`/calendario/eventos/${id}`, data)
export const deleteEvento   = (id)        => api.delete(`/calendario/eventos/${id}`)
