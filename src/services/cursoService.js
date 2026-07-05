import api from './axiosConfig'

// ---------------------------------------------------------------------------
// cursoService.js — Gestión de cursos y niveles
// Endpoints: /cursos/*, /niveles/*
// ---------------------------------------------------------------------------

export const getAll       = ()            => api.get('/cursos')
export const getById      = (id)          => api.get(`/cursos/${id}`)
export const create       = (data)        => api.post('/cursos', data)
export const update       = (id, data)    => api.put(`/cursos/${id}`, data)
export const remove       = (id)          => api.delete(`/cursos/${id}`)

export const getNiveles   = ()            => api.get('/niveles')
export const getSalas     = ()            => api.get('/salas')
