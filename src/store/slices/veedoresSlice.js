import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const fetchVeedores = createAsyncThunk(
  'veedores/fetchVeedores',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/veedores')
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar veedores')
    }
  }
)

export const createVeedor = createAsyncThunk(
  'veedores/createVeedor',
  async (veedorData, { rejectWithValue }) => {
    try {
      const response = await api.post('/veedores', veedorData)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear veedor')
    }
  }
)

export const updateVeedor = createAsyncThunk(
  'veedores/updateVeedor',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/veedores/${id}`, data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar veedor')
    }
  }
)

export const deleteVeedor = createAsyncThunk(
  'veedores/deleteVeedor',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/veedores/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar veedor')
    }
  }
)

const veedoresSlice = createSlice({
  name: 'veedores',
  initialState: {
    veedores: [],
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
      // Fetch veedores
      .addCase(fetchVeedores.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchVeedores.fulfilled, (state, action) => {
        state.isLoading = false
        state.veedores = action.payload
      })
      .addCase(fetchVeedores.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Create veedor
      .addCase(createVeedor.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createVeedor.fulfilled, (state, action) => {
        state.isLoading = false
        state.veedores.push(action.payload)
      })
      .addCase(createVeedor.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Update veedor
      .addCase(updateVeedor.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateVeedor.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.veedores.findIndex(v => v.id === action.payload.id)
        if (index !== -1) {
          state.veedores[index] = action.payload
        }
      })
      .addCase(updateVeedor.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Delete veedor
      .addCase(deleteVeedor.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteVeedor.fulfilled, (state, action) => {
        state.isLoading = false
        state.veedores = state.veedores.filter(v => v.id !== action.payload)
      })
      .addCase(deleteVeedor.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { clearError } = veedoresSlice.actions
export default veedoresSlice.reducer