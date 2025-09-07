
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
  updateJugador,
  deleteJugador,
  clearError as clearJugadoresError
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
  ChevronRightIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline'
import { validateDNI, validatePhone, formatDNI, formatPhone, getValidationMessage } from '../../utils/validation'
import { toLocalDateInput } from '../../utils/dateUtils'
import api from '../../services/api'

const Equipos = () => {
  const dispatch = useDispatch()
  const { equipos = [], isLoading, error } = useSelector((state) => state.equipos || {})
  const { torneos = [] } = useSelector((state) => state.torneos || {})
  const { jugadores = [], isLoading: jugadoresLoading, error: jugadoresError } = useSelector((state) => state.jugadores || {})
  const [showModal, setShowModal] = useState(false)
  const [showJugadoresModal, setShowJugadoresModal] = useState(false)
  const [showAddJugadorModal, setShowAddJugadorModal] = useState(false)
  const [showEditJugadorModal, setShowEditJugadorModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingEquipo, setEditingEquipo] = useState(null)
  const [editingJugador, setEditingJugador] = useState(null)
  const [selectedEquipo, setSelectedEquipo] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedTorneos, setExpandedTorneos] = useState({})
  const [expandedGrupos, setExpandedGrupos] = useState({})
  const [expandedSubgrupos, setExpandedSubgrupos] = useState({})
  const [formData, setFormData] = useState({
    nombre: '',
    torneo_id: '',
    telefono: '',
    grupo: '',
    subgrupo: '',
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
  const [importFile, setImportFile] = useState(null)
  const [importLoading, setImportLoading] = useState(false)
  const [importResults, setImportResults] = useState(null)

  useEffect(() => {
    dispatch(fetchEquipos())
    dispatch(fetchTorneos())
    // Cargar todos los jugadores al inicio para que el contador funcione correctamente
    dispatch(fetchJugadores())
  }, [dispatch])

  // Removido el useEffect que causaba problemas con los contadores
  // Los jugadores ya se cargan al inicio y se actualizan cuando es necesario

  useEffect(() => {
    if (error) {
      console.error('Error en equipos:', error)
    }
  }, [error])

  // Agrupar equipos por torneo, luego por grupo, luego por subgrupo
  const equiposEstructurados = (torneos || []).map(torneo => {
    const equiposDelTorneo = (equipos || []).filter(equipo => equipo.torneo_id === torneo.id)
    
    // Filtrar por búsqueda
    const equiposFiltrados = equiposDelTorneo.filter(equipo =>
      equipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipo.delegado?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    // Agrupar por grupo principal
    const equiposPorGrupo = equiposFiltrados.reduce((acc, equipo) => {
      const grupoBase = equipo.grupo || 'Sin Grupo'
      
      if (!acc[grupoBase]) {
        acc[grupoBase] = {
          sinSubgrupo: [],
          subgrupos: {}
        }
      }
      
      if (equipo.subgrupo) {
        // Tiene subgrupo
        if (!acc[grupoBase].subgrupos[equipo.subgrupo]) {
          acc[grupoBase].subgrupos[equipo.subgrupo] = []
        }
        acc[grupoBase].subgrupos[equipo.subgrupo].push(equipo)
      } else {
        // Sin subgrupo
        acc[grupoBase].sinSubgrupo.push(equipo)
      }
      
      return acc
    }, {})
    
    return {
      torneo,
      grupos: Object.entries(equiposPorGrupo).map(([grupoNombre, grupoData]) => ({
        nombre: grupoNombre,
        equiposSinSubgrupo: grupoData.sinSubgrupo,
        subgrupos: Object.entries(grupoData.subgrupos).map(([subgrupoNombre, equipos]) => ({
          nombre: subgrupoNombre,
          equipos
        }))
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

  const toggleSubgrupo = (torneoId, grupo, subgrupo) => {
    const key = `${torneoId}-${grupo}-${subgrupo}`
    setExpandedSubgrupos(prev => ({
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
      subgrupo: equipo.subgrupo || '',
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
      subgrupo: '',
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
      // Recargar todos los jugadores para actualizar contadores y lista
      dispatch(fetchJugadores())
      dispatch(fetchEquipos())
    } catch (error) {
      console.error('Error al agregar jugador:', error)
    }
  }

  const handleDeleteJugador = async (jugadorId) => {
    if (window.confirm('¿Estás seguro de eliminar este jugador?')) {
      try {
        await dispatch(deleteJugador(jugadorId)).unwrap()
        // Recargar todos los jugadores para actualizar contadores y lista
        dispatch(fetchJugadores())
        dispatch(fetchEquipos())
      } catch (error) {
        console.error('Error al eliminar jugador:', error)
      }
    }
  }

  const handleEditJugador = (jugador) => {
    dispatch(clearJugadoresError()) // Limpiar errores previos
    setEditingJugador(jugador)
    console.log('Editando jugador:', jugador) // Debug para ver los datos
    setJugadorData({
      nombre: jugador.nombre || '',
      apellido: jugador.apellido || '',
      dni: jugador.dni || '',
      fecha_nacimiento: jugador.fecha_nacimiento || '',
      numero_camiseta: jugador.numero_camiseta || '',
      telefono: jugador.telefono || ''
    })
    setShowEditJugadorModal(true)
  }

  const handleUpdateJugador = async (e) => {
    e.preventDefault()
    
    try {
      console.log('=== INICIO ACTUALIZACIÓN JUGADOR FRONTEND ===')
      console.log('Datos originales del jugador:', editingJugador)
      console.log('Datos del formulario:', jugadorData)
      
      // Validar que tenemos un jugador para editar
      if (!editingJugador || !editingJugador.id) {
        throw new Error('No hay jugador seleccionado para editar')
      }
      
      // Preparar datos para enviar (enviar todos los campos, no solo los cambiados)
      const dataToSend = {
        nombre: jugadorData.nombre.trim(),
        apellido: jugadorData.apellido.trim(),
        dni: jugadorData.dni.trim(),
        numero_camiseta: jugadorData.numero_camiseta ? parseInt(jugadorData.numero_camiseta) : null,
        telefono: jugadorData.telefono.trim() || null,
        fecha_nacimiento: jugadorData.fecha_nacimiento || null
      }
      
      // Remover campos vacíos o null innecesarios
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === '' || dataToSend[key] === undefined) {
          delete dataToSend[key]
        }
      })
      
      console.log('Datos a enviar al backend:', dataToSend)
      
      // Verificar que hay datos para enviar
      if (Object.keys(dataToSend).length === 0) {
        console.log('No hay datos válidos para actualizar')
        alert('No hay datos válidos para actualizar')
        return
      }
      
      // Enviar actualización
      const result = await dispatch(updateJugador({
        id: editingJugador.id,
        data: dataToSend
      })).unwrap()
      
      console.log('Jugador actualizado exitosamente:', result)
      
      // Cerrar modal y limpiar datos
      setShowEditJugadorModal(false)
      setEditingJugador(null)
      setJugadorData({
        nombre: '',
        apellido: '',
        dni: '',
        fecha_nacimiento: '',
        numero_camiseta: '',
        telefono: ''
      })
      
      // Recargar todos los jugadores para mostrar los cambios y actualizar contadores
      await dispatch(fetchJugadores())
      
      // Limpiar errores después de éxito
      dispatch(clearJugadoresError())
      
      // Mostrar mensaje de éxito
      alert('Jugador actualizado exitosamente')
      
      console.log('=== FIN ACTUALIZACIÓN JUGADOR FRONTEND EXITOSO ===')
      
    } catch (error) {
      console.error('=== ERROR EN ACTUALIZACIÓN JUGADOR FRONTEND ===')
      console.error('Error completo:', error)
      
      // Mostrar error al usuario
      let errorMessage = 'Error al actualizar jugador'
      
      if (typeof error === 'string') {
        errorMessage = error
      } else if (error.message) {
        errorMessage = error.message
      } else if (typeof error === 'object') {
        // Manejar errores de validación
        if (error.dni) {
          errorMessage = `Error en DNI: ${error.dni[0]}`
        } else if (error.numero_camiseta) {
          errorMessage = `Error en número de camiseta: ${error.numero_camiseta[0]}`
        } else {
          errorMessage = 'Error de validación en los datos'
        }
      }
      
      alert(errorMessage)
      // El error también se mostrará en el componente a través del estado de Redux
    }
  }

  const handleCloseJugadoresModal = () => {
    setShowJugadoresModal(false)
    setSelectedEquipo(null)
  }

  const handleImportJugadores = async (e) => {
    e.preventDefault()
    
    if (!importFile) {
      alert('Por favor selecciona un archivo Excel')
      return
    }

    setImportLoading(true)
    setImportResults(null)

    try {
      const formData = new FormData()
      formData.append('archivo', importFile)

      const response = await api.post('/jugadores/importar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const result = response.data
      
      if (result.success) {
        setImportResults(result.data)
        
        // Si hay jugadores creados, mostrar mensaje de éxito
        if (result.data && result.data.resumen && result.data.resumen.jugadores_creados > 0) {
          alert(`¡Importación exitosa! Se crearon ${result.data.resumen.jugadores_creados} jugadores.`)
          
          // Recargar jugadores y equipos para mostrar los cambios
          try {
            await dispatch(fetchJugadores()).unwrap()
            await dispatch(fetchEquipos()).unwrap()
          } catch (reloadError) {
            console.error('Error recargando datos:', reloadError)
          }
        }
      } else {
        setImportResults(result.data || { errores: [result.message] })
        alert('Error en la importación: ' + result.message)
      }
    } catch (error) {
      console.error('Error en importación:', error)
      
      let errorMessage = 'Error al importar el archivo'
      
      if (error.response) {
        // Error de respuesta del servidor
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message
          setImportResults(error.response.data.data || { errores: [error.response.data.message] })
        } else {
          errorMessage = `Error del servidor: ${error.response.status}`
        }
      } else if (error.request) {
        // Error de red
        errorMessage = 'Error de conexión con el servidor'
      } else {
        // Otro tipo de error
        errorMessage = error.message
      }
      
      alert(errorMessage)
    } finally {
      setImportLoading(false)
    }
  }

  const equipoJugadores = (jugadores || []).filter(j => j.equipo_id === selectedEquipo?.id)

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
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="btn-primary flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nuevo Equipo
            </button>
            <button
              type="button"
              onClick={() => {
                setImportFile(null)
                setImportResults(null)
                setShowImportModal(true)
              }}
              className="btn-secondary flex items-center"
            >
              <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
              Importar Jugadores
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      
      {/* Error Message para Jugadores */}
      {jugadoresError && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">
            {typeof jugadoresError === 'object' && jugadoresError.dni
              ? `Error de validación: ${jugadoresError.dni[0]}`
              : `Error en jugadores: ${jugadoresError}`}
          </div>
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
                      <span className="capitalize">{torneo.deporte}</span> • {grupos.reduce((total, grupo) => total + grupo.equiposSinSubgrupo.length + grupo.subgrupos.reduce((subTotal, sub) => subTotal + sub.equipos.length, 0), 0)} equipos
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
                                <h3 className="text-md font-medium text-gray-900">Grupo {grupo.nombre}</h3>
                              </div>
                              <span className="text-sm text-gray-500">
                                {grupo.equiposSinSubgrupo.length + grupo.subgrupos.reduce((total, sub) => total + sub.equipos.length, 0)} equipos
                              </span>
                            </div>
                          </div>
                          
                          {/* Contenido del Grupo */}
                          {expandedGrupos[`${torneo.id}-${grupo.nombre}`] && (
                            <div className="p-4 space-y-4">
                              {/* Equipos sin subgrupo */}
                              {grupo.equiposSinSubgrupo.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700 mb-3">Equipos del Grupo {grupo.nombre}</h4>
                                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {grupo.equiposSinSubgrupo.map((equipo) => (
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
                                            <span className="ml-1">{(jugadores || []).filter(j => j.equipo_id === equipo.id).length}</span>
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

                              {/* Subgrupos */}
                              {grupo.subgrupos.map((subgrupo) => (
                                <div key={subgrupo.nombre} className="border border-gray-300 rounded-lg">
                                  {/* Header del Subgrupo */}
                                  <div
                                    className="px-4 py-3 bg-blue-50 border-b border-gray-300 rounded-t-lg cursor-pointer hover:bg-blue-100"
                                    onClick={() => toggleSubgrupo(torneo.id, grupo.nombre, subgrupo.nombre)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        {expandedSubgrupos[`${torneo.id}-${grupo.nombre}-${subgrupo.nombre}`] ? (
                                          <ChevronDownIcon className="h-4 w-4 text-blue-600 mr-2" />
                                        ) : (
                                          <ChevronRightIcon className="h-4 w-4 text-blue-600 mr-2" />
                                        )}
                                        <h4 className="text-sm font-medium text-gray-900">Subgrupo {grupo.nombre}-{subgrupo.nombre}</h4>
                                      </div>
                                      <span className="text-sm text-gray-500">{subgrupo.equipos.length} equipos</span>
                                    </div>
                                  </div>
                                  
                                  {/* Equipos del Subgrupo */}
                                  {expandedSubgrupos[`${torneo.id}-${grupo.nombre}-${subgrupo.nombre}`] && (
                                    <div className="p-4">
                                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {subgrupo.equipos.map((equipo) => (
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
                                                <span className="ml-1">{(jugadores || []).filter(j => j.equipo_id === equipo.id).length}</span>
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
                  {(torneos || []).map((torneo) => (
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
                    onChange={(e) => setFormData({...formData, grupo: e.target.value, subgrupo: ''})}
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
                    Subgrupo (Opcional)
                  </label>
                  <select
                    className="input-field"
                    value={formData.subgrupo}
                    onChange={(e) => setFormData({...formData, subgrupo: e.target.value})}
                    disabled={!formData.grupo}
                  >
                    <option value="">Sin subgrupo</option>
                    {formData.grupo && (
                      <>
                        <option value="1">{formData.grupo}-1</option>
                        <option value="2">{formData.grupo}-2</option>
                        <option value="3">{formData.grupo}-3</option>
                        <option value="4">{formData.grupo}-4</option>
                        <option value="5">{formData.grupo}-5</option>
                      </>
                    )}
                  </select>
                </div>
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
                {selectedEquipo.grupo && (
                  <p>
                    <strong>Grupo:</strong> {selectedEquipo.grupo}
                    {selectedEquipo.subgrupo && `-${selectedEquipo.subgrupo}`}
                  </p>
                )}
                {selectedEquipo.delegado && <p><strong>Delegado:</strong> {selectedEquipo.delegado}</p>}
                <p><strong>Jugadores registrados:</strong> {equipoJugadores.length}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    // Limpiar datos del formulario antes de abrir el modal
                    setJugadorData({
                      nombre: '',
                      apellido: '',
                      dni: '',
                      fecha_nacimiento: '',
                      numero_camiseta: '',
                      telefono: ''
                    })
                    // Limpiar errores
                    dispatch(clearJugadoresError())
                    setShowAddJugadorModal(true)
                  }}
                  className="btn-primary flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Agregar Jugador
                </button>
                <button
                  onClick={() => {
                    setImportFile(null)
                    setImportResults(null)
                    setShowImportModal(true)
                  }}
                  className="btn-secondary flex items-center"
                >
                  <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                  Importar Excel
                </button>
              </div>
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
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditJugador(jugador)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar jugador"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteJugador(jugador.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar jugador"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
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
                onClick={() => {
                  setShowAddJugadorModal(false)
                  // Limpiar datos del formulario al cerrar
                  setJugadorData({
                    nombre: '',
                    apellido: '',
                    dni: '',
                    fecha_nacimiento: '',
                    numero_camiseta: '',
                    telefono: ''
                  })
                  dispatch(clearJugadoresError())
                }}
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
                    className="input-field"
                    value={jugadorData.dni}
                    onChange={(e) => {
                      const formatted = formatDNI(e.target.value)
                      setJugadorData({...jugadorData, dni: formatted})
                    }}
                    placeholder="12345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Número de Camiseta (Opcional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    className="input-field"
                    value={jugadorData.numero_camiseta}
                    onChange={(e) => setJugadorData({...jugadorData, numero_camiseta: e.target.value})}
                    placeholder="Ej: 10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono (Opcional)
                </label>
                <input
                  type="tel"
                  className="input-field"
                  value={jugadorData.telefono}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value)
                    setJugadorData({...jugadorData, telefono: formatted})
                  }}
                  placeholder="987654321"
                  maxLength="9"
                />
                {jugadorData.telefono && !validatePhone(jugadorData.telefono) && (
                  <p className="mt-1 text-sm text-red-600">
                    {getValidationMessage('phone', 'invalid')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={jugadorData.fecha_nacimiento ? toLocalDateInput(jugadorData.fecha_nacimiento) : ''}
                  onChange={(e) => setJugadorData({...jugadorData, fecha_nacimiento: e.target.value})}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddJugadorModal(false)
                    // Limpiar datos del formulario al cancelar
                    setJugadorData({
                      nombre: '',
                      apellido: '',
                      dni: '',
                      fecha_nacimiento: '',
                      numero_camiseta: '',
                      telefono: ''
                    })
                    dispatch(clearJugadoresError())
                  }}
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

      {/* Modal para editar jugador */}
      {showEditJugadorModal && editingJugador && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Editar Jugador
              </h3>
              <button
                onClick={() => {
                  setShowEditJugadorModal(false)
                  setEditingJugador(null)
                  dispatch(clearJugadoresError())
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateJugador} className="space-y-4">
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
                    className="input-field"
                    value={jugadorData.dni}
                    onChange={(e) => {
                      const formatted = formatDNI(e.target.value)
                      setJugadorData({...jugadorData, dni: formatted})
                    }}
                    placeholder="12345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Número de Camiseta (Opcional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    className="input-field"
                    value={jugadorData.numero_camiseta}
                    onChange={(e) => setJugadorData({...jugadorData, numero_camiseta: e.target.value})}
                    placeholder="Ej: 10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono (Opcional)
                </label>
                <input
                  type="tel"
                  className="input-field"
                  value={jugadorData.telefono}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value)
                    setJugadorData({...jugadorData, telefono: formatted})
                  }}
                  placeholder="987654321"
                  maxLength="9"
                />
                {jugadorData.telefono && !validatePhone(jugadorData.telefono) && (
                  <p className="mt-1 text-sm text-red-600">
                    {getValidationMessage('phone', 'invalid')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={jugadorData.fecha_nacimiento ? toLocalDateInput(jugadorData.fecha_nacimiento) : ''}
                  onChange={(e) => setJugadorData({...jugadorData, fecha_nacimiento: e.target.value})}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditJugadorModal(false)
                    setEditingJugador(null)
                    dispatch(clearJugadoresError())
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={jugadoresLoading}
                  className="btn-primary"
                >
                  {jugadoresLoading ? 'Actualizando...' : 'Actualizar Jugador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para importar jugadores */}
      {showImportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Importar Jugadores desde Excel
              </h3>
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setImportFile(null)
                  setImportResults(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Instrucciones */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Instrucciones:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• El archivo debe ser Excel (.xlsx, .xls) o CSV (.csv)</li>
                  <li>• Debe contener las columnas: APELLIDOS, NOMBRES, PROMOCIÓN, DNI, CORREO ELECTRÓNICO, DIRECCIÓN, CELULAR</li>
                  <li>• Los campos APELLIDOS, NOMBRES, PROMOCIÓN y DNI son obligatorios</li>
                  <li>• La PROMOCIÓN debe coincidir con un equipo existente (ej: si hay "PROMOCIÓN 1987", poner solo "1987")</li>
                  <li>• El DNI debe tener exactamente 8 dígitos numéricos</li>
                </ul>
              </div>

              {/* Formulario de importación */}
              <form onSubmit={handleImportJugadores} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar archivo Excel/CSV
                  </label>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => setImportFile(e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    required
                  />
                  {importFile && (
                    <p className="mt-2 text-sm text-gray-600">
                      Archivo seleccionado: {importFile.name}
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false)
                      setImportFile(null)
                      setImportResults(null)
                    }}
                    className="btn-secondary"
                    disabled={importLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={importLoading || !importFile}
                    className="btn-primary"
                  >
                    {importLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Importando...
                      </>
                    ) : (
                      <>
                        <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                        Importar Jugadores
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Resultados de la importación */}
              {importResults && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Resultados de la Importación:</h4>
                  
                  {/* Resumen */}
                  {importResults.resumen && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Filas procesadas:</span>
                          <span className="ml-2">{importResults.resumen.total_filas_procesadas}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-600">Jugadores creados:</span>
                          <span className="ml-2 text-green-600">{importResults.resumen.jugadores_creados}</span>
                        </div>
                        <div>
                          <span className="font-medium text-yellow-600">Duplicados omitidos:</span>
                          <span className="ml-2 text-yellow-600">{importResults.resumen.jugadores_duplicados}</span>
                        </div>
                        <div>
                          <span className="font-medium text-red-600">Equipos no encontrados:</span>
                          <span className="ml-2 text-red-600">{importResults.resumen.equipos_no_encontrados}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Errores */}
                  {importResults.errores && importResults.errores.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h5 className="text-sm font-medium text-red-900 mb-2">Errores encontrados:</h5>
                      <div className="max-h-32 overflow-y-auto">
                        <ul className="text-sm text-red-800 space-y-1">
                          {importResults.errores.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Equipos