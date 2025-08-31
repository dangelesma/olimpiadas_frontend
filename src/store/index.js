import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import torneosSlice from './slices/torneosSlice'
import equiposSlice from './slices/equiposSlice'
import partidosSlice from './slices/partidosSlice'
import canchasSlice from './slices/canchasSlice'
import jugadoresSlice from './slices/jugadoresSlice'
import usuariosSlice from './slices/usuariosSlice'
import arbitrosSlice from './slices/arbitrosSlice'
import veedoresSlice from './slices/veedoresSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    torneos: torneosSlice,
    equipos: equiposSlice,
    partidos: partidosSlice,
    canchas: canchasSlice,
    jugadores: jugadoresSlice,
    usuarios: usuariosSlice,
    arbitros: arbitrosSlice,
    veedores: veedoresSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export default store