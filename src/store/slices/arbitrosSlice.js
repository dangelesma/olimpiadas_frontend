import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const fetchArbitros = createAsyncThunk(
  'arbitros/fetchArbitros',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/arbitros')
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar árbitros')
    }
  }
)

export const createArbitro = createAsyncThunk(
  'arbitros/createArbitro',
  async (arbitroData, { rejectWithValue }) => {
    try {
      const response = await api.post('/arbitros', arbitroData)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear árbitro')
    }
  }
)

export const updateArbitro = createAsyncThunk(
  'arbitros/updateArbitro',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/arbitros/${id}`, data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar árbitro')
    }
  }
)

export const deleteArbitro = createAsyncThunk(
  'arbitros/deleteArbitro',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/arbitros/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar árbitro')
    }
  }
)

const arbitrosSlice = createSlice({
  name: 'arbitros',
  initialState: {
    arbitros: [],
    isLoading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch arbitros
      .addCase(fetchArbitros.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchArbitros.fulfilled, (state, action) => {
        state.isLoading = false
        state.arbitros = action.payload
      })
      .addCase(fetchArbitros.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Create arbitro
      .addCase(createArbitro.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createArbitro.fulfilled, (state, action) => {
        state.isLoading = false
        state.arbitros.push(action.payload)
      })
      .addCase(createArbitro.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Update arbitro
      .addCase(updateArbitro.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateArbitro.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.arbitros.findIndex(arbitro => arbitro.id === action.payload.id)
        if (index !== -1) {
          state.arbitros[index] = action.payload
        }
      })
      .addCase(updateArbitro.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Delete arbitro
      .addCase(deleteArbitro.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteArbitro.fulfilled, (state, action) => {
        state.isLoading = false
        state.arbitros = state.arbitros.filter(arbitro => arbitro.id !== action.payload)
      })
      .addCase(deleteArbitro.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { clearError } = arbitrosSlice.actions
export default arbitrosSlice.reducer