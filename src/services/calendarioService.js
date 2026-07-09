import api from './axiosConfig'

// ---------------------------------------------------------------------------
// calendarioService.js — Calendario estudiantil (ms-murales, 8087)
// Endpoints reales: /api/calendario/*
// DTO: { idEvento, idFuncionario, tituloEvento, descripEvento, fechaInicio, fechaFin }
// ---------------------------------------------------------------------------

export const getEventos   = ()            => api.get('/calendario')
export const getEvento    = (id)          => api.get(`/calendario/${id}`)
export const getProximos  = ()            => api.get('/calendario/proximos')
export const getPorRango  = (inicio, fin) => api.get('/calendario/rango', { params: { inicio, fin } })
export const createEvento = (data)        => api.post('/calendario', data)
export const updateEvento = (id, data)    => api.put(`/calendario/${id}`, data)
export const deleteEvento = (id)          => api.delete(`/calendario/${id}`)
