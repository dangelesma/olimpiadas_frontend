
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchEquipos,
  createEquipo,
  updateEquipo,
  deleteEquipo,
  clearError
} from '../../store/slices/equiposSlice'
import { fetchTorneos } from '../../store/slices/torneosSlice'
import {
  fetchJugadores,
  createJugador,
  deleteJugador
} from '../../store/slices/jugadoresSlice'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { validateDNI, validatePhone, formatDNI, formatPhone, getValidationMessage } from '../../utils/validation'

const Equipos = () => {
  const dispatch = useDispatch()
  const { equipos, isLoading, error } = useSelector((state) => state.equipos)
  const { torneos } = useSelector((state) => state.torneos)
  const { jugadores } = useSelector((state) => state.jugadores)
  const [showModal, setShowModal] = useState(false)
  const [showJugadoresModal, setShowJugadoresModal] = useState(false)
  const [showAddJugadorModal, setShowAddJugadorModal] = useState(false)
  const [editingEquipo, setEditingEquipo] = useState(null)
  const [selectedEquipo, setSelectedEquipo] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedTorneos, setExpandedTorneos] = useState({})
  const [expandedGrupos, setExpandedGrupos] = useState({})
  const [formData, setFormData] = useState({
    nombre: '',
    torneo_id: '',
    telefono: '',
    grupo: '',
    delegado: ''
  })
  const [jugadorData, setJugadorData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    fecha_nacimiento: '',
    numero_camiseta: '',
    telefono: ''
  })

  useEffect(() => {
    dispatch(fetchEquipos())
    dispatch(fetchTorneos())
  }, [dispatch])

  useEffect(() => {
    if (selectedEquipo) {
      dispatch(fetchJugadores(selectedEquipo.id))
    }
  }, [dispatch, selectedEquipo])

  useEffect(() => {
    if (error) {
      console.error('Error en equipos:', error)
    }
  }, [error])

  // Agrupar equipos por torneo y luego por grupo
  const equiposEstructurados = torneos.map(torneo => {
    const equiposDelTorneo = equipos.filter(equipo => equipo.torneo_id === torneo.id)
    
    // Filtrar por búsqueda
    const equiposFiltrados = equiposDelTorneo.filter(equipo =>
      equipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipo.delegado?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    // Agrupar por grupo
    const equiposPorGrupo = equiposFiltrados.reduce((acc, equipo) => {
      const grupo = equipo.grupo || 'Sin Grupo'
      if (!acc[grupo]) {
        acc[grupo] = []
      }
      acc[grupo].push(equipo)
      return acc
    }, {})
    
    return {
      torneo,
      grupos: Object.entries(equiposPorGrupo).map(([grupo, equipos]) => ({
        nombre: grupo,
        equipos
      }))
    }
  }).filter(item => item.grupos.length > 0)

  const toggleTorneo = (torneoId) => {
    setExpandedTorneos(prev => ({
      ...prev,
      [torneoId]: !prev[torneoId]
    }))
  }

  const toggleGrupo = (torneoId, grupo) => {
    const key = `${torneoId}-${grupo}`
    setExpandedGrupos(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingEquipo) {
        await dispatch(updateEquipo({ 
          id: editingEquipo.id, 
          data: formData 
        })).unwrap()
      } else {
        await dispatch(createEquipo(formData)).unwrap()
      }
      handleCloseModal()
      dispatch(fetchEquipos())
    } catch (error) {
      console.error('Error al guardar equipo:', error)
    }
  }

  const handleEdit = (equipo) => {
    setEditingEquipo(equipo)
    setFormData({
      nombre: equipo.nombre,
      torneo_id: equipo.torneo_id?.toString() || '',
      telefono: equipo.telefono || '',
      grupo: equipo.grupo || '',
      delegado: equipo.delegado || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este equipo?')) {
      try {
        await dispatch(deleteEquipo(id)).unwrap()
        dispatch(fetchEquipos())
      } catch (error) {
        console.error('Error al eliminar equipo:', error)
      }
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingEquipo(null)
    setFormData({
      nombre: '',
      torneo_id: '',
      telefono: '',
      grupo: '',
      delegado: ''
    })
    dispatch(clearError())
  }

  const handleViewJugadores = (equipo) => {
    setSelectedEquipo(equipo)
    setShowJugadoresModal(true)
  }

  const handleAddJugador = async (e) => {
    e.preventDefault()
    try {
      await dispatch(createJugador({
        ...jugadorData,
        equipo_id: selectedEquipo.id
      })).unwrap()
      setShowAddJugadorModal(false)
      setJugadorData({
        nombre: '',
        apellido: '',
        dni: '',
        fecha_nacimiento: '',
        numero_camiseta: '',
        telefono: ''
      })
      dispatch(fetchJugadores(selectedEquipo.id))
    } catch (error) {
      console.error('Error al agregar jugador:', error)
    }
  }

  const handleDeleteJugador = async (jugadorId) => {
    if (window.confirm('¿Estás seguro de eliminar este jugador?')) {
      try {
        await dispatch(deleteJugador(jugadorId)).unwrap()
        dispatch(fetchJugadores(selectedEquipo.id))
      } catch (error) {
        console.error('Error al eliminar jugador:', error)
      }
    }
  }

  const handleCloseJugadoresModal = () => {
    setShowJugadoresModal(false)
    setSelectedEquipo(null)
  }

  const equipoJugadores = jugadores.filter(j => j.equipo_id === selectedEquipo?.id)

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Equipos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestión de equipos participantes en los torneos
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuevo Equipo
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Filtro de búsqueda */}
      <div className="mt-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Buscar equipos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de equipos estructurada por Torneo → Grupo → Equipos */}
      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {equiposEstructurados.map(({ torneo, grupos }) => (
              <div key={torneo.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Header del Torneo */}
                <div 
                  className="px-6 py-4 border-b border-gray-200 bg-primary-50 rounded-t-lg cursor-pointer hover:bg-primary-100"
                  onClick={() => toggleTorneo(torneo.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {expandedTorneos[torneo.id] ? (
                        <ChevronDownIcon className="h-5 w-5 text-primary-600 mr-2" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5 text-primary-600 mr-2" />
                      )}
                      <h2 className="text-lg font-semibold text-gray-900">{torneo.nombre}</h2>
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="capitalize">{torneo.deporte}</span> • {grupos.reduce((total, grupo) => total + grupo.equipos.length, 0)} equipos
                    </div>
                  </div>
                </div>
                
                {/* Grupos del Torneo */}
                {expandedTorneos[torneo.id] && (
                  <div className="p-6">
                    <div className="space-y-4">
                      {grupos.map((grupo) => (
                        <div key={grupo.nombre} className="border border-gray-200 rounded-lg">
                          {/* Header del Grupo */}
                          <div 
                            className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg cursor-pointer hover:bg-gray-100"
                            onClick={() => toggleGrupo(torneo.id, grupo.nombre)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {expandedGrupos[`${torneo.id}-${grupo.nombre}`] ? (
                                  <ChevronDownIcon className="h-4 w-4 text-gray-600 mr-2" />
                                ) : (
                                  <ChevronRightIcon className="h-4 w-4 text-gray-600 mr-2" />
                                )}
                                <h3 className="text-md font-medium text-gray-900">{grupo.nombre}</h3>
                              </div>
                              <span className="text-sm text-gray-500">{grupo.equipos.length} equipos</span>
                            </div>
                          </div>
                          
                          {/* Equipos del Grupo */}
                          {expandedGrupos[`${torneo.id}-${grupo.nombre}`] && (
                            <div className="p-4">
                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {grupo.equipos.map((equipo) => (
                                  <div key={equipo.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center">
                                        <UserGroupIcon className="h-5 w-5 text-primary-600 mr-2" />
                                        <h4 className="text-sm font-medium text-gray-900 truncate">
                                          {equipo.nombre}
                                        </h4>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-1 text-xs text-gray-500">
                                      {equipo.delegado && (
                                        <div>
                                          <span className="font-medium">Delegado:</span>
                                          <span className="ml-1">{equipo.delegado}</span>
                                        </div>
                                      )}
                                      {equipo.telefono && (
                                        <div>
                                          <span className="font-medium">Teléfono:</span>
                                          <span className="ml-1">{equipo.telefono}</span>
                                        </div>
                                      )}
                                      <div>
                                        <span className="font-medium">Jugadores:</span>
                                        <span className="ml-1">{equipo.jugadores_count || 0}</span>
                                      </div>
                                    </div>

                                    <div className="mt-3 flex justify-end space-x-1">
                                      <button
                                        onClick={() => handleViewJugadores(equipo)}
                                        className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700"
                                        title="Ver jugadores"
                                      >
                                        <EyeIcon className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={() => handleEdit(equipo)}
                                        className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                                        title="Editar equipo"
                                      >
                                        <PencilIcon className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(equipo.id)}
                                        className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700"
                                        title="Eliminar equipo"
                                      >
                                        <TrashIcon className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Estado vacío */}
            {equiposEstructurados.length === 0 && (
              <div className="text-center py-12">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {searchTerm ? 'No se encontraron equipos' : 'No hay equipos'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm 
                    ? 'Intenta ajustar el término de búsqueda.'
                    : 'Comienza registrando un nuevo equipo.'
                  }
                </p>
                {!searchTerm && (
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setShowModal(true)}
                      className="btn-primary"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Nuevo Equipo
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para crear/editar equipo */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingEquipo ? 'Editar Equipo' : 'Nuevo Equipo'}
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
                  Nombre del Equipo *
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Ej: Los Tigres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Torneo
                </label>
                <select
                  className="input-field"
                  value={formData.torneo_id}
                  onChange={(e) => setFormData({...formData, torneo_id: e.target.value})}
                >
                  <option value="">Seleccionar torneo</option>
                  {torneos.map((torneo) => (
                    <option key={torneo.id} value={torneo.id}>
                      {torneo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Grupo
                  </label>
                  <select
                    className="input-field"
                    value={formData.grupo}
                    onChange={(e) => setFormData({...formData, grupo: e.target.value})}
                  >
                    <option value="">Seleccionar grupo</option>
                    <option value="A">Grupo A</option>
                    <option value="B">Grupo B</option>
                    <option value="C">Grupo C</option>
                    <option value="D">Grupo D</option>
                    <option value="E">Grupo E</option>
                    <option value="F">Grupo F</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Delegado
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.delegado}
                    onChange={(e) => setFormData({...formData, delegado: e.target.value})}
                    placeholder="Nombre del delegado"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  type="tel"
                  className="input-field"
                  value={formData.telefono}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value)
                    setFormData({...formData, telefono: formatted})
                  }}
                  placeholder="999-999-999"
                />
                {formData.telefono && !validatePhone(formData.telefono) && (
                  <p className="mt-1 text-sm text-red-600">
                    {getValidationMessage('phone')}
                  </p>
                )}
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
                  {isLoading ? 'Guardando...' : (editingEquipo ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para ver/gestionar jugadores */}
      {showJugadoresModal && selectedEquipo && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Jugadores de {selectedEquipo.nombre}
              </h3>
              <button
                onClick={handleCloseJugadoresModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4 flex justify-between items-center">
              <div className="text-sm text-gray-600 space-y-1">
                {selectedEquipo.grupo && <p><strong>Grupo:</strong> {selectedEquipo.grupo}</p>}
                {selectedEquipo.delegado && <p><strong>Delegado:</strong> {selectedEquipo.delegado}</p>}
                <p><strong>Jugadores registrados:</strong> {equipoJugadores.length}</p>
              </div>
              <button
                onClick={() => setShowAddJugadorModal(true)}
                className="btn-primary flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Agregar Jugador
              </button>
            </div>

            {/* Lista de jugadores */}
            <div className="max-h-96 overflow-y-auto">
              {equipoJugadores.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {equipoJugadores.map((jugador) => (
                    <div key={jugador.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {jugador.nombre} {jugador.apellido}
                            </p>
                            <p className="text-xs text-gray-500">
                              #{jugador.numero_camiseta}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteJugador(jugador.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        <p><strong>DNI:</strong> {jugador.dni}</p>
                        {jugador.telefono && <p><strong>Teléfono:</strong> {jugador.telefono}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay jugadores</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comienza agregando jugadores a este equipo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal para agregar jugador */}
      {showAddJugadorModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Agregar Jugador
              </h3>
              <button
                onClick={() => setShowAddJugadorModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddJugador} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={jugadorData.nombre}
                    onChange={(e) => setJugadorData({...jugadorData, nombre: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={jugadorData.apellido}
                    onChange={(e) => setJugadorData({...jugadorData, apellido: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    DNI *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={jugadorData.dni}
                    onChange={(e) => {
                      const formatted = formatDNI(e.target.value)
                      setJugadorData({...jugadorData, dni: formatted})
                    }}
                    placeholder="12345678"
                  />
                  {jugadorData.dni && !validateDNI(jugadorData.dni) && (
                    <p className="mt-1 text-sm text-red-600">
                      {getValidationMessage('dni')}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Número de Camiseta
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    className="input-field"
                    value={jugadorData.numero_camiseta}
                    onChange={(e) => setJugadorData({...jugadorData, numero_camiseta: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    value={jugadorData.telefono}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value)
                      setJugadorData({...jugadorData, telefono: formatted})
                    }}
                    placeholder="999-999-999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={jugadorData.fecha_nacimiento}
                  onChange={(e) => setJugadorData({...jugadorData, fecha_nacimiento: e.target.value})}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddJugadorModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? 'Agregando...' : 'Agregar Jugador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Equipos