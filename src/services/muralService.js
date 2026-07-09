import api from './axiosConfig'

// ---------------------------------------------------------------------------
// muralService.js — Mural digital del establecimiento
// Backend real: ms-murales (8087) → /api/murales/*
// DTO: { idPublicacion, idFuncionario, contenido, nivelAlcance, fechaPublicacion }
// ---------------------------------------------------------------------------

export const getPublicaciones = ()                => api.get('/murales')
export const getById          = (id)              => api.get(`/murales/${id}`)
export const getByNivel       = (nivelAlcance)    => api.get(`/murales/nivel/${nivelAlcance}`)
export const create           = (data)            => api.post('/murales', data)
export const update           = (id, data)        => api.put(`/murales/${id}`, data)
export const remove           = (id)              => api.delete(`/murales/${id}`)
