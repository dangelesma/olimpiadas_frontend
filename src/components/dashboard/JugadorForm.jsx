import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { toLocalDateInput } from '../../utils/dateUtils'
import { createJugador, updateJugador, clearError as clearJugadoresError } from '../../store/slices/jugadoresSlice'

const JugadorForm = ({ show, onClose, equipoId, jugadorToEdit, onJugadorCreated }) => {
  const dispatch = useDispatch()
  const { isLoading, error } = useSelector((state) => state.jugadores)
  const [jugadorData, setJugadorData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    fecha_nacimiento: '',
    numero_camiseta: '',
    telefono: ''
  })

  const isEditMode = !!jugadorToEdit

  useEffect(() => {
    if (isEditMode) {
      setJugadorData({
        nombre: jugadorToEdit.nombre || '',
        apellido: jugadorToEdit.apellido || '',
        dni: jugadorToEdit.dni || '',
        fecha_nacimiento: jugadorToEdit.fecha_nacimiento || '',
        numero_camiseta: jugadorToEdit.numero_camiseta || '',
        telefono: jugadorToEdit.telefono || ''
      })
    } else {
      // Reset form for new player
      setJugadorData({
        nombre: '',
        apellido: '',
        dni: '',
        fecha_nacimiento: '',
        numero_camiseta: '',
        telefono: ''
      })
    }
    // Clear errors when modal opens or jugadorToEdit changes
    dispatch(clearJugadoresError())
  }, [jugadorToEdit, isEditMode, dispatch, show])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      let resultAction
      if (isEditMode) {
        resultAction = await dispatch(updateJugador({ id: jugadorToEdit.id, data: jugadorData })).unwrap()
      } else {
        resultAction = await dispatch(createJugador({ ...jugadorData, equipo_id: equipoId })).unwrap()
      }
      
      if (onJugadorCreated) {
        onJugadorCreated(resultAction) // Pass the new/updated player data back
      }
      handleClose()
    } catch (err) {
      // Error is handled by the slice and displayed via the selector
      console.error('Failed to save player:', err)
    }
  }

  const handleClose = () => {
    setJugadorData({
      nombre: '',
      apellido: '',
      dni: '',
      fecha_nacimiento: '',
      numero_camiseta: '',
      telefono: ''
    })
    dispatch(clearJugadoresError())
    onClose()
  }

  if (!show) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditMode ? 'Editar Jugador' : 'Agregar Jugador'}
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-red-700">{JSON.stringify(error)}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre *</label>
              <input
                type="text"
                required
                className="input-field"
                value={jugadorData.nombre}
                onChange={(e) => setJugadorData({ ...jugadorData, nombre: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellido</label>
              <input
                type="text"
                className="input-field"
                value={jugadorData.apellido}
                onChange={(e) => setJugadorData({ ...jugadorData, apellido: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">DNI</label>
              <input
                type="text"
                className="input-field"
                value={jugadorData.dni}
                onChange={(e) => setJugadorData({ ...jugadorData, dni: e.target.value })}
                placeholder="12345678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Número de Camiseta</label>
              <input
                type="number"
                min="1"
                className="input-field"
                value={jugadorData.numero_camiseta}
                onChange={(e) => setJugadorData({ ...jugadorData, numero_camiseta: e.target.value })}
                placeholder="Ej: 10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              type="tel"
              className="input-field"
              value={jugadorData.telefono}
              onChange={(e) => setJugadorData({ ...jugadorData, telefono: e.target.value })}
              placeholder="987654321"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
            <input
              type="date"
              className="input-field"
              value={jugadorData.fecha_nacimiento ? toLocalDateInput(jugadorData.fecha_nacimiento) : ''}
              onChange={(e) => setJugadorData({ ...jugadorData, fecha_nacimiento: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={handleClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Guardando...' : (isEditMode ? 'Actualizar Jugador' : 'Agregar Jugador')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JugadorForm