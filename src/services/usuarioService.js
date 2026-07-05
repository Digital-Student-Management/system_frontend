import api from './axiosConfig'

// ---------------------------------------------------------------------------
// usuarioService.js — Gestión de usuarios del sistema GED
// Endpoints: /usuarios/*
// ---------------------------------------------------------------------------

export const getMe           = ()            => api.get('/usuarios/me')
export const updateMe        = (data)        => api.put('/usuarios/me', data)
export const getAll          = ()            => api.get('/usuarios')
export const getById         = (id)          => api.get(`/usuarios/${id}`)
export const create          = (data)        => api.post('/usuarios', data)
export const update          = (id, data)    => api.put(`/usuarios/${id}`, data)
export const remove          = (id)          => api.delete(`/usuarios/${id}`)
export const activar         = (id)          => api.patch(`/usuarios/${id}/activar`)
export const desactivar      = (id)          => api.patch(`/usuarios/${id}/desactivar`)
