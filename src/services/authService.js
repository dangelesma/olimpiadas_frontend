import api from './api'

const authService = {
  // Iniciar sesión
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    })
    return response.data
  },

  // Registrar usuario (solo admins)
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // Cerrar sesión
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  // Cerrar todas las sesiones
  logoutAll: async () => {
    const response = await api.post('/auth/logout-all')
    return response.data
  },

  // Obtener usuario actual
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Cambiar contraseña
  changePassword: async (currentPassword, newPassword, newPasswordConfirmation) => {
    const response = await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
    })
    return response.data
  },
}

export default authService