import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

const initialState = {
  usuarios: [],
  isLoading: false,
  error: null,
}

export const fetchUsuarios = createAsyncThunk(
  'usuarios/fetchUsuarios',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/usuarios')
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener usuarios')
    }
  }
)

export const createUsuario = createAsyncThunk(
  'usuarios/createUsuario',
  async (usuarioData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', usuarioData)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear usuario')
    }
  }
)

export const updateUsuario = createAsyncThunk(
  'usuarios/updateUsuario',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/usuarios/${id}`, data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar usuario')
    }
  }
)

export const deleteUsuario = createAsyncThunk(
  'usuarios/deleteUsuario',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/usuarios/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar usuario')
    }
  }
)

const usuariosSlice = createSlice({
  name: 'usuarios',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsuarios.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUsuarios.fulfilled, (state, action) => {
        state.isLoading = false
        state.usuarios = action.payload
      })
      .addCase(fetchUsuarios.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(createUsuario.fulfilled, (state, action) => {
        state.usuarios.push(action.payload.user)
      })
      .addCase(updateUsuario.fulfilled, (state, action) => {
        const index = state.usuarios.findIndex(u => u.id === action.payload.id)
        if (index !== -1) {
          state.usuarios[index] = action.payload
        }
      })
      .addCase(deleteUsuario.fulfilled, (state, action) => {
        state.usuarios = state.usuarios.filter(u => u.id !== action.payload)
      })
  },
})

export const { clearError } = usuariosSlice.actions
export default usuariosSlice.reducer