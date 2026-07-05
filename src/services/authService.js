import api from './axiosConfig'

// ---------------------------------------------------------------------------
// authService.js — Autenticación de usuarios del GED
// Endpoints: /auth/*
// ---------------------------------------------------------------------------

export const login         = (credentials) => api.post('/auth/login', credentials)
export const logout        = ()             => api.post('/auth/logout')
export const refreshToken  = ()             => api.post('/auth/refresh')
export const changePassword = (data)        => api.put('/auth/change-password', data)
