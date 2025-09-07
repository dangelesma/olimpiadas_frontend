import axios from 'axios'

// Configuración base de la API
const api = axios.create({
  //baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://backend.olimpiadassantaedelmira.com/api',
  //baseURL: import.meta.env.VITE_API_BASE_URL || 'https://backend.olimpiadas.bonelektroniks.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Interceptor para agregar el token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Si el token ha expirado o es inválido, redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    // Manejar otros errores
    if (error.response?.status === 403) {
      console.error('Acceso denegado')
    }
    
    if (error.response?.status === 404) {
      console.error('Recurso no encontrado')
    }
    
    if (error.response?.status >= 500) {
      console.error('Error del servidor')
    }
    
    return Promise.reject(error)
  }
)

export default api
// Funciones para la página pública
export const getPublicTournaments = () => api.get('/public/torneos');
export const getPublicStandings = (torneoId) => api.get(`/public/torneos/${torneoId}/posiciones`);
export const getPublicTopScorers = (torneoId) => api.get(`/public/torneos/${torneoId}/goleadores`);
export const getPublicCards = (torneoId) => api.get(`/public/torneos/${torneoId}/tarjetas`);
export const getPublicMatches = (torneoId) => api.get(`/public/torneos/${torneoId}/partidos`);
export const getPublicTournamentDetails = (torneoId) => api.get(`/public/torneos/${torneoId}`);
export const getPublicGroups = (torneoId) => api.get(`/public/torneos/${torneoId}/grupos`);
export const getPublicTeams = (torneoId) => api.get(`/public/torneos/${torneoId}/equipos`);
export const getPublicPlayers = (torneoId) => api.get(`/public/torneos/${torneoId}/jugadores`);
export const getPublicStats = (torneoId) => api.get(`/public/torneos/${torneoId}/estadisticas`);
export const getPublicGroupStandings = (torneoId) => api.get(`/public/torneos/${torneoId}/tabla-posiciones-grupos`);
export const getPublicMatchesByDate = (torneoId) => api.get('/public/partidos/por-fechas', { params: { torneo_id: torneoId } });