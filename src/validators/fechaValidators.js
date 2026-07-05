// validators/fechaValidators.js — Validaciones de fechas para el GED
// Usadas en formularios de matrícula, evaluaciones, eventos, etc.

import dayjs from 'dayjs'

// Valida que la fecha no sea futura
export const noEsFutura = (v) =>
  !v || dayjs(v).isBefore(dayjs().add(1, 'day')) || 'La fecha no puede ser futura'

// Valida que la fecha sea mayor de edad (18 años) — para funcionarios
export const esMayorDeEdad = (v) =>
  !v || dayjs().diff(dayjs(v), 'year') >= 18 || 'Debe ser mayor de 18 años'

// Valida que la fecha fin sea después de la fecha inicio
export const fechaFinDespuesDeInicio = (inicio) => (fin) =>
  !fin || !inicio || dayjs(fin).isAfter(dayjs(inicio)) || 'La fecha fin debe ser posterior al inicio'

// Valida que la fecha de nacimiento sea coherente para un estudiante (5-25 años)
export const edadEstudiante = (v) => {
  if (!v) return true
  const edad = dayjs().diff(dayjs(v), 'year')
  if (edad < 5) return 'El estudiante debe tener al menos 5 años'
  if (edad > 25) return 'Verifica la fecha de nacimiento'
  return true
}
