import api from './axiosConfig'

// ---------------------------------------------------------------------------
// dashboardService.js — Estadísticas para directivos y admin
// Endpoints: /dashboard/*
// ---------------------------------------------------------------------------

export const getResumenGeneral    = ()              => api.get('/dashboard/resumen')
export const getEstadisticasNotas = (params)        => api.get('/dashboard/notas', { params })
export const getEstadisticasAsist = (params)        => api.get('/dashboard/asistencia', { params })
export const getEstadisticasCurso = (cursoId)       => api.get(`/dashboard/curso/${cursoId}`)
