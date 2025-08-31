import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

const initialState = {
  equipos: [],
  currentEquipo: null,
  isLoading: false,
  error: null,
}

export const fetchEquipos = createAsyncThunk(
  'equipos/fetchEquipos',
  async (torneoId = null, { rejectWithValue }) => {
    try {
      const url = torneoId ? `/equipos?torneo_id=${torneoId}` : '/equipos'
      const response = await api.get(url)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener equipos')
    }
  }
)

export const createEquipo = createAsyncThunk(
  'equipos/createEquipo',
  async (equipoData, { rejectWithValue }) => {
    try {
      const response = await api.post('/equipos', equipoData)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear equipo')
    }
  }
)

export const updateEquipo = createAsyncThunk(
  'equipos/updateEquipo',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/equipos/${id}`, data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar equipo')
    }
  }
)

export const deleteEquipo = createAsyncThunk(
  'equipos/deleteEquipo',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/equipos/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar equipo')
    }
  }
)

const equiposSlice = createSlice({
  name: 'equipos',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentEquipo: (state, action) => {
      state.currentEquipo = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEquipos.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchEquipos.fulfilled, (state, action) => {
        state.isLoading = false
        state.equipos = action.payload
      })
      .addCase(fetchEquipos.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(createEquipo.fulfilled, (state, action) => {
        state.equipos.push(action.payload)
      })
      .addCase(updateEquipo.fulfilled, (state, action) => {
        const index = state.equipos.findIndex(e => e.id === action.payload.id)
        if (index !== -1) {
          state.equipos[index] = action.payload
        }
      })
      .addCase(deleteEquipo.fulfilled, (state, action) => {
        state.equipos = state.equipos.filter(e => e.id !== action.payload)
      })
  },
})

export const { clearError, setCurrentEquipo } = equiposSlice.actions
export default equiposSlice.reducer