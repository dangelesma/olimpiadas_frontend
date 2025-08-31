import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  fetchCanchas, 
  createCancha, 
  updateCancha, 
  deleteCancha,
  clearError 
} from '../../store/slices/canchasSlice'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  BuildingOfficeIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

const Canchas = () => {
  const dispatch = useDispatch()
  const { canchas, isLoading, error } = useSelector((state) => state.canchas)
  const [showModal, setShowModal] = useState(false)
  const [editingCancha, setEditingCancha] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDeporte, setSelectedDeporte] = useState('')
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    deporte: 'futbol',
    capacidad: '',
    estado: 'disponible',
    descripcion: '',
    contacto: '',
    telefono: ''
  })

  useEffect(() => {
    dispatch(fetchCanchas())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      console.error('Error en canchas:', error)
    }
  }, [error])

  // Filtrar canchas
  const filteredCanchas = canchas.filter(cancha => {
    const matchesSearch = cancha.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cancha.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDeporte = !selectedDeporte || cancha.deporte === selectedDeporte
    return matchesSearch && matchesDeporte
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSend = {
        ...formData,
        capacidad: formData.capacidad ? parseInt(formData.capacidad) : null
      }
      
      if (editingCancha) {
        await dispatch(updateCancha({ 
          id: editingCancha.id, 
          data: dataToSend 
        })).unwrap()
      } else {
        await dispatch(createCancha(dataToSend)).unwrap()
      }
      handleCloseModal()
      dispatch(fetchCanchas())
    } catch (error) {
      console.error('Error al guardar cancha:', error)
    }
  }

  const handleEdit = (cancha) => {
    setEditingCancha(cancha)
    setFormData({
      nombre: cancha.nombre,
      ubicacion: cancha.ubicacion || '',
      deporte: cancha.deporte,
      capacidad: cancha.capacidad?.toString() || '',
      estado: cancha.estado || 'disponible',
      descripcion: cancha.descripcion || '',
      contacto: cancha.contacto || '',
      telefono: cancha.telefono || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta cancha?')) {
      try {
        await dispatch(deleteCancha(id)).unwrap()
        dispatch(fetchCanchas())
      } catch (error) {
        console.error('Error al eliminar cancha:', error)
      }
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCancha(null)
    setFormData({
      nombre: '',
      ubicacion: '',
      deporte: 'futbol',
      capacidad: '',
      estado: 'disponible',
      descripcion: '',
      contacto: '',
      telefono: ''
    })
    dispatch(clearError())
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      disponible: 'bg-green-100 text-green-800',
      ocupada: 'bg-yellow-100 text-yellow-800',
      mantenimiento: 'bg-red-100 text-red-800',
      inactiva: 'bg-gray-100 text-gray-800'
    }
    return badges[estado] || 'bg-gray-100 text-gray-800'
  }

  const getDeporteIcon = (deporte) => {
    return deporte === 'futbol' ? '⚽' : '🏐'
  }

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Estadios/Canchas</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestión de instalaciones deportivas para los torneos
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nueva Cancha
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Filtros */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Buscar canchas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            className="input-field"
            value={selectedDeporte}
            onChange={(e) => setSelectedDeporte(e.target.value)}
          >
            <option value="">Todos los deportes</option>
            <option value="futbol">Fútbol</option>
            <option value="voley">Vóley</option>
          </select>
        </div>
      </div>

      {/* Lista de canchas */}
      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCanchas.map((cancha) => (
              <div key={cancha.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
                      </div>
                      <div className="ml-3">
                        <span className="text-2xl">{getDeporteIcon(cancha.deporte)}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getEstadoBadge(cancha.estado)}`}>
                      {cancha.estado}
                    </span>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {cancha.nombre}
                    </h3>
                    {cancha.ubicacion && (
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        <span className="truncate">{cancha.ubicacion}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium">Deporte:</span>
                      <span className="ml-1 capitalize">{cancha.deporte}</span>
                    </div>
                    {cancha.capacidad && (
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="font-medium">Capacidad:</span>
                        <span className="ml-1">{cancha.capacidad} personas</span>
                      </div>
                    )}
                    {cancha.contacto && (
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="font-medium">Contacto:</span>
                        <span className="ml-1 truncate">{cancha.contacto}</span>
                      </div>
                    )}
                    {cancha.telefono && (
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="font-medium">Teléfono:</span>
                        <span className="ml-1">{cancha.telefono}</span>
                      </div>
                    )}
                  </div>

                  {cancha.descripcion && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {cancha.descripcion}
                      </p>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(cancha)}
                      className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cancha.id)}
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

        {!isLoading && filteredCanchas.length === 0 && (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm || selectedDeporte ? 'No se encontraron canchas' : 'No hay canchas'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedDeporte 
                ? 'Intenta ajustar los filtros de búsqueda.'
                : 'Comienza registrando una nueva cancha.'
              }
            </p>
            {!searchTerm && !selectedDeporte && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="btn-primary"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Nueva Cancha
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para crear/editar cancha */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCancha ? 'Editar Cancha' : 'Nueva Cancha'}
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
                  Nombre de la Cancha *
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Ej: Estadio Municipal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ubicación
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                  placeholder="Ej: Av. Principal 123, Centro"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Estado
                  </label>
                  <select
                    className="input-field"
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  >
                    <option value="disponible">Disponible</option>
                    <option value="ocupada">Ocupada</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="inactiva">Inactiva</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Capacidad (personas)
                </label>
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  value={formData.capacidad}
                  onChange={(e) => setFormData({...formData, capacidad: e.target.value})}
                  placeholder="Ej: 500"
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
                  placeholder="Descripción de la cancha, características especiales..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contacto
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.contacto}
                    onChange={(e) => setFormData({...formData, contacto: e.target.value})}
                    placeholder="Nombre del responsable"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    placeholder="999-999-999"
                  />
                </div>
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
                  {isLoading ? 'Guardando...' : (editingCancha ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Canchas