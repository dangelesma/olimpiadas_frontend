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
      const response = await api.put(`/jugadores/${id}`, data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar jugador')
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
      .addCase(createJugador.fulfilled, (state, action) => {
        state.jugadores.push(action.payload)
      })
      .addCase(registrarJugadoresMasivo.fulfilled, (state, action) => {
        state.jugadores = [...state.jugadores, ...action.payload]
      })
      .addCase(updateJugador.fulfilled, (state, action) => {
        const index = state.jugadores.findIndex(j => j.id === action.payload.id)
        if (index !== -1) {
          state.jugadores[index] = action.payload
        }
      })
      .addCase(deleteJugador.fulfilled, (state, action) => {
        state.jugadores = state.jugadores.filter(j => j.id !== action.payload)
      })
  },
})

export const { clearError } = jugadoresSlice.actions
export default jugadoresSlice.reducer