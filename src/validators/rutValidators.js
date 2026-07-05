// validators/rutValidators.js — Validación del RUT chileno
// Se integra con react-hook-form a través de la clave `validate`.

// Limpia todo lo que no sea dígito o K
export const limpiarRut = (rut) => rut.replace(/[^0-9kK]/g, '').toUpperCase()

// Formatea: 12345678K → 12.345.678-K
export const formatearRut = (rut) => {
  const limpio = limpiarRut(rut)
  if (limpio.length < 2) return limpio
  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1)
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${cuerpoFormateado}-${dv}`
}

// Calcula el dígito verificador correcto
const calcularDv = (rut) => {
  let suma = 0
  let multiplo = 2
  for (let i = rut.length - 1; i >= 0; i--) {
    suma += parseInt(rut[i]) * multiplo
    multiplo = multiplo < 7 ? multiplo + 1 : 2
  }
  const resultado = 11 - (suma % 11)
  if (resultado === 11) return '0'
  if (resultado === 10) return 'K'
  return String(resultado)
}

// Retorna true si el RUT es válido, false si no
export const validarRut = (rut) => {
  const limpio = limpiarRut(rut)
  if (limpio.length < 8 || limpio.length > 9) return false
  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1).toUpperCase()
  return calcularDv(cuerpo) === dv
}

// Regla lista para usar en react-hook-form
export const reglasRut = {
  required: 'El RUT es obligatorio',
  validate: (v) => validarRut(v) || 'RUT inválido'
}
