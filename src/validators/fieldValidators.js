// validators/fieldValidators.js — Validaciones de campos comunes para el GED
// Se integran con react-hook-form a través de register() o Controller.

export const noSoloEspacios = (v) => !v || v.trim().length > 0 || 'No puede contener solo espacios'

export function reglasNombre({ requerido = false, mensaje = 'El nombre es obligatorio' } = {}) {
  return {
    ...(requerido ? { required: mensaje } : {}),
    maxLength: { value: 50, message: 'Máximo 50 caracteres' },
    validate: { noEspacios: noSoloEspacios }
  }
}

export const reglasEmail = {
  required: 'El correo es obligatorio',
  maxLength: { value: 80, message: 'Máximo 80 caracteres' },
  pattern: {
    value: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9][a-zA-Z0-9.\-]*\.[a-zA-Z]{2,}$/,
    message: 'Ingresa un correo válido'
  }
}

export const reglasTelefono = {
  pattern: {
    value: /^(\+56)?[\s-]?9[\s-]?\d{4}[\s-]?\d{4}$/,
    message: 'Ingresa un teléfono chileno válido (+569XXXXXXXX)'
  }
}

// Contraseña para creación (estricta)
export const reglasPasswordCrear = {
  required: 'La contraseña es obligatoria',
  minLength: { value: 8, message: 'Mínimo 8 caracteres' },
  maxLength: { value: 30, message: 'Máximo 30 caracteres' },
  validate: {
    tieneMayuscula: (v) => /[A-Z]/.test(v) || 'Debe incluir una mayúscula',
    tieneMinuscula: (v) => /[a-z]/.test(v) || 'Debe incluir una minúscula',
    tieneNumero:    (v) => /[0-9]/.test(v) || 'Debe incluir un número'
  }
}

// Contraseña para login (solo requerida)
export const reglasPasswordLogin = { required: 'La contraseña es obligatoria' }

// Confirmar contraseña — recibe el valor de watch('password')
export const reglasConfirmPassword = (password) => ({
  required: 'Confirma tu contraseña',
  validate: (v) => v === password || 'Las contraseñas no coinciden'
})
