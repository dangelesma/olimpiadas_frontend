import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

const initialState = {
  canchas: [],
  isLoading: false,
  error: null,
}

export const fetchCanchas = createAsyncThunk(
  'canchas/fetchCanchas',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters).toString()
      const response = await api.get(`/canchas${params ? `?${params}` : ''}`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener canchas')
    }
  }
)

export const createCancha = createAsyncThunk(
  'canchas/createCancha',
  async (canchaData, { rejectWithValue }) => {
    try {
      const response = await api.post('/canchas', canchaData)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear cancha')
    }
  }
)

export const updateCancha = createAsyncThunk(
  'canchas/updateCancha',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/canchas/${id}`, data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar cancha')
    }
  }
)

export const deleteCancha = createAsyncThunk(
  'canchas/deleteCancha',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/canchas/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar cancha')
    }
  }
)

const canchasSlice = createSlice({
  name: 'canchas',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCanchas.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCanchas.fulfilled, (state, action) => {
        state.isLoading = false
        state.canchas = action.payload
      })
      .addCase(fetchCanchas.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(createCancha.fulfilled, (state, action) => {
        state.canchas.push(action.payload)
      })
      .addCase(updateCancha.fulfilled, (state, action) => {
        const index = state.canchas.findIndex(c => c.id === action.payload.id)
        if (index !== -1) {
          state.canchas[index] = action.payload
        }
      })
      .addCase(deleteCancha.fulfilled, (state, action) => {
        state.canchas = state.canchas.filter(c => c.id !== action.payload)
      })
  },
})

export const { clearError } = canchasSlice.actions
export default canchasSlice.reducer