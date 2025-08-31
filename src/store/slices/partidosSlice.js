import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

const initialState = {
  partidos: [],
  currentPartido: null,
  misPartidos: [],
  eventosPartido: [],
  resumenPartido: null,
  maximosGoleadores: [],
  tarjetasAcumuladas: { amarillas: [], rojas: [] },
  isLoading: false,
  error: null,
}

export const fetchPartidos = createAsyncThunk(
  'partidos/fetchPartidos',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters).toString()
      const response = await api.get(`/partidos${params ? `?${params}` : ''}`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener partidos')
    }
  }
)

export const fetchMisPartidos = createAsyncThunk(
  'partidos/fetchMisPartidos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/mis-partidos')
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener mis partidos')
    }
  }
)

export const createPartido = createAsyncThunk(
  'partidos/createPartido',
  async (partidoData, { rejectWithValue }) => {
    try {
      const response = await api.post('/partidos', partidoData)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear partido')
    }
  }
)

export const iniciarPartido = createAsyncThunk(
  'partidos/iniciarPartido',
  async ({ id, arbitro_id, veedor_id, titulares }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/partidos/${id}/iniciar`, {
        arbitro_id,
        veedor_id,
        titulares
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al iniciar partido')
    }
  }
)

export const finalizarPartido = createAsyncThunk(
  'partidos/finalizarPartido',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/partidos/${id}/finalizar`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al finalizar partido')
    }
  }
)

export const registrarEvento = createAsyncThunk(
  'partidos/registrarEvento',
  async ({ partidoId, eventoData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/partidos/${partidoId}/eventos`, eventoData)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al registrar evento')
    }
  }
)

export const fetchEventosPartido = createAsyncThunk(
  'partidos/fetchEventosPartido',
  async (partidoId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/partidos/${partidoId}/eventos`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener eventos del partido')
    }
  }
)

export const actualizarMinutoPartido = createAsyncThunk(
  'partidos/actualizarMinutoPartido',
  async ({ partidoId, minuto }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/partidos/${partidoId}/minuto`, { minuto })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar minuto')
    }
  }
)

export const obtenerResumenPartido = createAsyncThunk(
  'partidos/obtenerResumenPartido',
  async (partidoId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/partidos/${partidoId}/resumen`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener resumen del partido')
    }
  }
)

export const obtenerMaximosGoleadores = createAsyncThunk(
  'partidos/obtenerMaximosGoleadores',
  async (torneoId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/torneos/${torneoId}/goleadores`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener máximos goleadores')
    }
  }
)

export const obtenerTarjetasAcumuladas = createAsyncThunk(
  'partidos/obtenerTarjetasAcumuladas',
  async (torneoId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/torneos/${torneoId}/tarjetas`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener tarjetas acumuladas')
    }
  }
)

const partidosSlice = createSlice({
  name: 'partidos',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentPartido: (state, action) => {
      state.currentPartido = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPartidos.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPartidos.fulfilled, (state, action) => {
        state.isLoading = false
        state.partidos = action.payload
      })
      .addCase(fetchPartidos.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(fetchMisPartidos.fulfilled, (state, action) => {
        state.misPartidos = action.payload
      })
      .addCase(createPartido.fulfilled, (state, action) => {
        state.partidos.push(action.payload)
      })
      .addCase(iniciarPartido.fulfilled, (state, action) => {
        const index = state.partidos.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.partidos[index] = action.payload
        }
        if (state.currentPartido?.id === action.payload.id) {
          state.currentPartido = action.payload
        }
      })
      .addCase(finalizarPartido.fulfilled, (state, action) => {
        const index = state.partidos.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.partidos[index] = action.payload
        }
        if (state.currentPartido?.id === action.payload.id) {
          state.currentPartido = action.payload
        }
      })
      .addCase(fetchEventosPartido.fulfilled, (state, action) => {
        state.eventosPartido = action.payload
      })
      .addCase(registrarEvento.fulfilled, (state, action) => {
        state.eventosPartido.push(action.payload)
      })
      .addCase(actualizarMinutoPartido.fulfilled, (state, action) => {
        if (state.currentPartido) {
          state.currentPartido.minuto_actual = action.payload.minuto_actual
        }
      })
      .addCase(obtenerResumenPartido.fulfilled, (state, action) => {
        state.resumenPartido = action.payload
      })
      .addCase(obtenerMaximosGoleadores.fulfilled, (state, action) => {
        state.maximosGoleadores = action.payload
      })
      .addCase(obtenerTarjetasAcumuladas.fulfilled, (state, action) => {
        state.tarjetasAcumuladas = action.payload
      })
  },
})

export const { clearError, setCurrentPartido } = partidosSlice.actions
export default partidosSlice.reducer