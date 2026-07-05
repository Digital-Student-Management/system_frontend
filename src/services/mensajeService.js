import api from './axiosConfig'

// ---------------------------------------------------------------------------
// mensajeService.js — Mensajería interna del GED
// Endpoints: /mensajes/*
// ---------------------------------------------------------------------------

export const getMensajes      = ()           => api.get('/mensajes')
export const getConversacion  = (userId)     => api.get(`/mensajes/conversacion/${userId}`)
export const enviar           = (data)       => api.post('/mensajes', data)
export const marcarLeido      = (id)         => api.patch(`/mensajes/${id}/leido`)
export const eliminar         = (id)         => api.delete(`/mensajes/${id}`)
export const getNoLeidos      = ()           => api.get('/mensajes/no-leidos')
