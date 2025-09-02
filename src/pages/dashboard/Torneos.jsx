import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  fetchTorneos, 
  createTorneo, 
  updateTorneo, 
  deleteTorneo,
  clearError 
} from '../../store/slices/torneosSlice'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  TrophyIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline'

const Torneos = () => {
  const dispatch = useDispatch()
  const { torneos, isLoading, error } = useSelector((state) => state.torneos)
  const [showModal, setShowModal] = useState(false)
  const [editingTorneo, setEditingTorneo] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    deporte: 'futbol',
    fecha_inicio: '',
    fecha_fin: '',
    max_equipos: 16
  })

  useEffect(() => {
    dispatch(fetchTorneos())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      console.error('Error en torneos:', error)
    }
  }, [error])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingTorneo) {
        await dispatch(updateTorneo({ 
          id: editingTorneo.id, 
          data: formData 
        })).unwrap()
      } else {
        await dispatch(createTorneo(formData)).unwrap()
      }
      handleCloseModal()
      dispatch(fetchTorneos())
    } catch (error) {
      console.error('Error al guardar torneo:', error)
    }
  }

  const handleEdit = (torneo) => {
    setEditingTorneo(torneo)
    setFormData({
      nombre: torneo.nombre,
      descripcion: torneo.descripcion || '',
      deporte: torneo.deporte,
      fecha_inicio: torneo.fecha_inicio?.split('T')[0] || '',
      fecha_fin: torneo.fecha_fin?.split('T')[0] || '',
      max_equipos: torneo.max_equipos || 16
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este torneo?')) {
      try {
        await dispatch(deleteTorneo(id)).unwrap()
        dispatch(fetchTorneos())
      } catch (error) {
        console.error('Error al eliminar torneo:', error)
      }
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTorneo(null)
    setFormData({
      nombre: '',
      descripcion: '',
      deporte: 'futbol',
      fecha_inicio: '',
      fecha_fin: '',
      max_equipos: 16
    })
    dispatch(clearError())
  }

  const getDeporteIcon = (deporte) => {
    return deporte === 'futbol' ? '⚽' : '🏐'
  }

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Torneos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestión de torneos deportivos escolares
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuevo Torneo
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Lista de torneos */}
      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {torneos.map((torneo) => (
              <div key={torneo.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TrophyIcon className="h-8 w-8 text-primary-600" />
                      </div>
                      <div className="ml-3">
                        <span className="text-2xl">{getDeporteIcon(torneo.deporte)}</span>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {torneo.deporte === 'futbol' ? 'Fútbol' : 'Vóley'}
                    </span>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {torneo.nombre}
                    </h3>
                    {torneo.descripcion && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {torneo.descripcion}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium">Deporte:</span>
                      <span className="ml-1 capitalize">{torneo.deporte}</span>
                    </div>
                    {torneo.fecha_inicio && (
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="font-medium">Inicio:</span>
                        <span className="ml-1">
                          {new Date(torneo.fecha_inicio).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {torneo.fecha_fin && (
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="font-medium">Fin:</span>
                        <span className="ml-1">
                          {new Date(torneo.fecha_fin).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium">Equipos:</span>
                      <span className="ml-1">{torneo.equipos_count || 0}/{torneo.max_equipos}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(torneo)}
                      className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(torneo.id)}
                      className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && torneos.length === 0 && (
          <div className="text-center py-12">
            <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay torneos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando un nuevo torneo deportivo.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="btn-primary"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Nuevo Torneo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal para crear/editar torneo */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingTorneo ? 'Editar Torneo' : 'Nuevo Torneo'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre del Torneo *
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Ej: Copa Escolar 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Descripción del torneo..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Deporte *
                </label>
                <select
                  required
                  className="input-field"
                  value={formData.deporte}
                  onChange={(e) => setFormData({...formData, deporte: e.target.value})}
                >
                  <option value="futbol">Fútbol</option>
                  <option value="voley">Vóley</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Máx. Equipos
                </label>
                <input
                  type="number"
                  min="2"
                  max="32"
                  className="input-field"
                  value={formData.max_equipos}
                  onChange={(e) => setFormData({...formData, max_equipos: parseInt(e.target.value)})}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? 'Guardando...' : (editingTorneo ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Torneos