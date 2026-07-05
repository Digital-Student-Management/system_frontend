import api from './axiosConfig'

// ---------------------------------------------------------------------------
// ubicacionService.js — Datos geográficos (para formularios de matrícula)
// Endpoints: /ubicacion/*
// ---------------------------------------------------------------------------

export const getPaises    = ()             => api.get('/ubicacion/paises')
export const getRegiones  = ()             => api.get('/ubicacion/regiones')
export const getCiudades  = (regionId)     => api.get(`/ubicacion/ciudades/${regionId}`)
export const getComunas   = (ciudadId)     => api.get(`/ubicacion/comunas/${ciudadId}`)
