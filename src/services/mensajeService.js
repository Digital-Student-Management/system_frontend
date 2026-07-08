import api from './axiosConfig'

// ---------------------------------------------------------------------------
// mensajeService.js — Mensajería interna del GED
// Endpoints: /api/mensajes/*
// ---------------------------------------------------------------------------

export const getBandeja       = (idDestinatario) => api.get(`/mensajes/bandeja/${idDestinatario}`)
export const getMensajeById   = (idMensaje)      => api.get(`/mensajes/${idMensaje}`)
export const enviarMensaje    = (formData)       => api.post('/mensajes/enviar', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
export const editarMensaje    = (idMensaje, data) => api.put(`/mensajes/${idMensaje}`, data)
export const eliminarMensaje  = (idMensaje)       => api.delete(`/mensajes/${idMensaje}`)
