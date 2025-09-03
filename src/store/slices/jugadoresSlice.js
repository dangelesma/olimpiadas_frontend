import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

const initialState = {
  jugadores: [],
  isLoading: false,
  error: null,
}

export const fetchJugadores = createAsyncThunk(
  'jugadores/fetchJugadores',
  async (equipoId = null, { rejectWithValue }) => {
    try {
      const url = equipoId ? `/jugadores?equipo_id=${equipoId}` : '/jugadores'
      const response = await api.get(url)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener jugadores')
    }
  }
)

export const createJugador = createAsyncThunk(
  'jugadores/createJugador',
  async (jugadorData, { rejectWithValue }) => {
    try {
      const response = await api.post('/jugadores', jugadorData)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear jugador')
    }
  }
)

export const registrarJugadoresMasivo = createAsyncThunk(
  'jugadores/registrarJugadoresMasivo',
  async ({ equipoId, jugadores }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/equipos/${equipoId}/jugadores`, { jugadores })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al registrar jugadores')
    }
  }
)

export const updateJugador = createAsyncThunk(
  'jugadores/updateJugador',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      console.log('=== INICIO UPDATE JUGADOR FRONTEND ===')
      console.log('ID del jugador:', id)
      console.log('Datos a enviar:', data)
      
      // Verificar que tenemos un ID válido
      if (!id) {
        throw new Error('ID de jugador no válido')
      }
      
      // Verificar que tenemos datos para enviar
      if (!data || Object.keys(data).length === 0) {
        throw new Error('No hay datos para actualizar')
      }
      
      const response = await api.put(`/jugadores/${id}`, data)
      console.log('Respuesta del backend:', response.data)
      console.log('=== FIN UPDATE JUGADOR FRONTEND EXITOSO ===')
      
      return response.data.data
    } catch (error) {
      console.error('=== ERROR EN UPDATE JUGADOR FRONTEND ===')
      console.error('Error completo:', error)
      console.error('Response data:', error.response?.data)
      console.error('Status:', error.response?.status)
      
      // Manejar diferentes tipos de errores
      if (error.response?.status === 404) {
        return rejectWithValue('Jugador no encontrado')
      }
      
      if (error.response?.status === 403) {
        return rejectWithValue('No tienes permisos para actualizar este jugador')
      }
      
      if (error.response?.status === 422) {
        // Errores de validación
        if (error.response?.data?.errors) {
          return rejectWithValue(error.response.data.errors)
        }
        return rejectWithValue(error.response?.data?.message || 'Error de validación')
      }
      
      if (error.response?.status >= 500) {
        return rejectWithValue('Error interno del servidor')
      }
      
      // Error de red o conexión
      if (!error.response) {
        return rejectWithValue('Error de conexión con el servidor')
      }
      
      return rejectWithValue(error.response?.data?.message || error.message || 'Error al actualizar jugador')
    }
  }
)

export const deleteJugador = createAsyncThunk(
  'jugadores/deleteJugador',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/jugadores/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar jugador')
    }
  }
)

const jugadoresSlice = createSlice({
  name: 'jugadores',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJugadores.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchJugadores.fulfilled, (state, action) => {
        state.isLoading = false
        state.jugadores = action.payload
      })
      .addCase(fetchJugadores.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(createJugador.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createJugador.fulfilled, (state, action) => {
        state.isLoading = false
        state.jugadores.push(action.payload)
      })
      .addCase(createJugador.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(updateJugador.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateJugador.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.jugadores.findIndex(j => j.id === action.payload.id)
        if (index !== -1) {
          state.jugadores[index] = action.payload
        }
      })
      .addCase(updateJugador.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(deleteJugador.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteJugador.fulfilled, (state, action) => {
        state.isLoading = false
        state.jugadores = state.jugadores.filter(j => j.id !== action.payload)
      })
      .addCase(deleteJugador.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(registrarJugadoresMasivo.fulfilled, (state, action) => {
        state.jugadores = [...state.jugadores, ...action.payload]
      })
  },
})

export const { clearError } = jugadoresSlice.actions
export default jugadoresSlice.reducer