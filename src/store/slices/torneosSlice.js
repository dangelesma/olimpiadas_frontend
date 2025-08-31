import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Estado inicial
const initialState = {
  torneos: [],
  currentTorneo: null,
  isLoading: false,
  error: null,
}

// Thunks asíncronos
export const fetchTorneos = createAsyncThunk(
  'torneos/fetchTorneos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/torneos')
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener torneos')
    }
  }
)

export const fetchTorneoById = createAsyncThunk(
  'torneos/fetchTorneoById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/torneos/${id}`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener torneo')
    }
  }
)

export const createTorneo = createAsyncThunk(
  'torneos/createTorneo',
  async (torneoData, { rejectWithValue }) => {
    try {
      const response = await api.post('/torneos', torneoData)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear torneo')
    }
  }
)

export const updateTorneo = createAsyncThunk(
  'torneos/updateTorneo',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/torneos/${id}`, data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar torneo')
    }
  }
)

export const deleteTorneo = createAsyncThunk(
  'torneos/deleteTorneo',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/torneos/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar torneo')
    }
  }
)

// Slice
const torneosSlice = createSlice({
  name: 'torneos',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentTorneo: (state, action) => {
      state.currentTorneo = action.payload
    },
    clearCurrentTorneo: (state) => {
      state.currentTorneo = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Torneos
      .addCase(fetchTorneos.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTorneos.fulfilled, (state, action) => {
        state.isLoading = false
        state.torneos = action.payload
        state.error = null
      })
      .addCase(fetchTorneos.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch Torneo by ID
      .addCase(fetchTorneoById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTorneoById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentTorneo = action.payload
        state.error = null
      })
      .addCase(fetchTorneoById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Create Torneo
      .addCase(createTorneo.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createTorneo.fulfilled, (state, action) => {
        state.isLoading = false
        state.torneos.push(action.payload)
        state.error = null
      })
      .addCase(createTorneo.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Update Torneo
      .addCase(updateTorneo.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateTorneo.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.torneos.findIndex(t => t.id === action.payload.id)
        if (index !== -1) {
          state.torneos[index] = action.payload
        }
        if (state.currentTorneo?.id === action.payload.id) {
          state.currentTorneo = action.payload
        }
        state.error = null
      })
      .addCase(updateTorneo.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Delete Torneo
      .addCase(deleteTorneo.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteTorneo.fulfilled, (state, action) => {
        state.isLoading = false
        state.torneos = state.torneos.filter(t => t.id !== action.payload)
        if (state.currentTorneo?.id === action.payload) {
          state.currentTorneo = null
        }
        state.error = null
      })
      .addCase(deleteTorneo.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError, setCurrentTorneo, clearCurrentTorneo } = torneosSlice.actions
export default torneosSlice.reducer