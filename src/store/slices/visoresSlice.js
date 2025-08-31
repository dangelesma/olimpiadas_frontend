import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const fetchVisores = createAsyncThunk(
  'visores/fetchVisores',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/usuarios')
      // Filtrar solo usuarios con rol 'veedor'
      const visores = response.data.filter(user => user.role === 'veedor')
      return visores
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar visores')
    }
  }
)

export const createVisor = createAsyncThunk(
  'visores/createVisor',
  async (visorData, { rejectWithValue }) => {
    try {
      const response = await api.post('/usuarios', {
        ...visorData,
        role: 'veedor'
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear visor')
    }
  }
)

export const updateVisor = createAsyncThunk(
  'visores/updateVisor',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/usuarios/${id}`, {
        ...data,
        role: 'veedor'
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar visor')
    }
  }
)

export const deleteVisor = createAsyncThunk(
  'visores/deleteVisor',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/usuarios/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar visor')
    }
  }
)

const visoresSlice = createSlice({
  name: 'visores',
  initialState: {
    visores: [],
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
      // Fetch visores
      .addCase(fetchVisores.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchVisores.fulfilled, (state, action) => {
        state.isLoading = false
        state.visores = action.payload
      })
      .addCase(fetchVisores.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Create visor
      .addCase(createVisor.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createVisor.fulfilled, (state, action) => {
        state.isLoading = false
        state.visores.push(action.payload)
      })
      .addCase(createVisor.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Update visor
      .addCase(updateVisor.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateVisor.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.visores.findIndex(visor => visor.id === action.payload.id)
        if (index !== -1) {
          state.visores[index] = action.payload
        }
      })
      .addCase(updateVisor.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Delete visor
      .addCase(deleteVisor.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteVisor.fulfilled, (state, action) => {
        state.isLoading = false
        state.visores = state.visores.filter(visor => visor.id !== action.payload)
      })
      .addCase(deleteVisor.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { clearError } = visoresSlice.actions
export default visoresSlice.reducer