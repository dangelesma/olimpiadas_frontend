// Validaciones para formularios
export const validateDNI = (dni) => {
  const dniRegex = /^\d{8}$/
  return dniRegex.test(dni)
}

export const validatePhone = (phone) => {
  const phoneRegex = /^\d{9}$/
  return phoneRegex.test(phone)
}

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0
}

export const validateMinLength = (value, minLength) => {
  return value && value.toString().length >= minLength
}

export const validateMaxLength = (value, maxLength) => {
  return !value || value.toString().length <= maxLength
}

// Funciones de formateo
export const formatDNI = (value) => {
  return value.replace(/\D/g, '').slice(0, 8)
}

export const formatPhone = (value) => {
  return value.replace(/\D/g, '').slice(0, 9)
}

// Mensajes de error
export const getValidationMessage = (field, type) => {
  const messages = {
    dni: {
      required: 'El DNI es obligatorio',
      invalid: 'El DNI debe tener exactamente 8 dígitos numéricos'
    },
    phone: {
      required: 'El teléfono es obligatorio',
      invalid: 'El teléfono debe tener exactamente 9 dígitos numéricos'
    },
    email: {
      required: 'El email es obligatorio',
      invalid: 'El formato del email no es válido'
    },
    name: {
      required: 'El nombre es obligatorio',
      minLength: 'El nombre debe tener al menos 2 caracteres'
    },
    password: {
      required: 'La contraseña es obligatoria',
      minLength: 'La contraseña debe tener al menos 6 caracteres'
    }
  }

  return messages[field]?.[type] || 'Campo inválido'
}