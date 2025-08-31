import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  fetchMisPartidos, 
  iniciarPartido,
  finalizarPartido,
  registrarEvento,
  clearError 
} from '../../store/slices/partidosSlice'
import { 
  PlayIcon, 
  StopIcon,
  CalendarIcon,
  XMarkIcon,
  ClockIcon,
  PlusIcon,
  UserIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const MisPartidos = () => {
  const dispatch = useDispatch()
  const { misPartidos, isLoading, error } = useSelector((state) => state.partidos)
  const { user } = useSelector((state) => state.auth)
  const [selectedPartido, setSelectedPartido] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEstado, setSelectedEstado] = useState('')
  const [eventoData, setEventoData] = useState({
    tipo: 'gol',
    jugador_id: '',
    minuto: '',
    descripcion: '',
    equipo_id: ''
  })

  useEffect(() => {
    dispatch(fetchMisPartidos())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      console.error('Error en mis partidos:', error)
    }
  }, [error])

  // Filtrar partidos por estado
  const filteredPartidos = misPartidos.filter(partido => {
    if (!selectedEstado) return true
    return partido.estado === selectedEstado
  })

  const handleIniciarPartido = async (id) => {
    if (window.confirm('¿Estás seguro de iniciar este partido?')) {
      try {
        await dispatch(iniciarPartido({ id, titulares: {} })).unwrap()
        dispatch(fetchMisPartidos())
      } catch (error) {
        console.error('Error al iniciar partido:', error)
      }
    }
  }

  const handleFinalizarPartido = async (id) => {
    if (window.confirm('¿Estás seguro de finalizar este partido?')) {
      try {
        await dispatch(finalizarPartido(id)).unwrap()
        dispatch(fetchMisPartidos())
      } catch (error) {
        console.error('Error al finalizar partido:', error)
      }
    }
  }

  const handleRegistrarEvento = async (e) => {
    e.preventDefault()
    try {
      await dispatch(registrarEvento({
        partidoId: selectedPartido.id,
        eventoData: {
          ...eventoData,
          minuto: parseInt(eventoData.minuto)
        }
      })).unwrap()
      setShowEventModal(false)
      setEventoData({
        tipo: 'gol',
        jugador_id: '',
        minuto: '',
        descripcion: '',
        equipo_id: ''
      })
      dispatch(fetchMisPartidos())
    } catch (error) {
      console.error('Error al registrar evento:', error)
    }
  }

  const handleCloseEventModal = () => {
    setShowEventModal(false)
    setSelectedPartido(null)
    setEventoData({
      tipo: 'gol',
      jugador_id: '',
      minuto: '',
      descripcion: '',
      equipo_id: ''
    })
    dispatch(clearError())
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      programado: 'bg-blue-100 text-blue-800',
      en_curso: 'bg-green-100 text-green-800',
      finalizado: 'bg-gray-100 text-gray-800',
      cancelado: 'bg-red-100 text-red-800',
      suspendido: 'bg-yellow-100 text-yellow-800'
    }
    return badges[estado] || 'bg-gray-100 text-gray-800'
  }

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'No programado'
    const date = new Date(dateTime)
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTipoEventoIcon = (tipo) => {
    const icons = {
      gol: '⚽',
      tarjeta_amarilla: '🟨',
      tarjeta_roja: '🟥',
      cambio: '🔄',
      falta: '⚠️'
    }
    return icons[tipo] || '📝'
  }

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Mis Partidos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Partidos asignados para registro de eventos
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Filtro por estado */}
      <div className="mt-6">
        <div className="max-w-xs">
          <select
            className="input-field"
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="programado">Programado</option>
            <option value="en_curso">En Curso</option>
            <option value="finalizado">Finalizado</option>
            <option value="cancelado">Cancelado</option>
            <option value="suspendido">Suspendido</option>
          </select>
        </div>
      </div>

      {/* Lista de partidos */}
      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPartidos.map((partido) => (
              <div key={partido.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                          <PlayIcon className="h-8 w-8 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">
                            {partido.equipo_local?.nombre || 'Equipo Local'} 
                            <span className="mx-3 text-gray-500">vs</span>
                            {partido.equipo_visitante?.nombre || 'Equipo Visitante'}
                          </h3>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <span>{formatDateTime(partido.fecha_hora)}</span>
                          {partido.cancha && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{partido.cancha.nombre}</span>
                            </>
                          )}
                        </div>
                        {partido.torneo && (
                          <div className="mt-1 text-xs text-gray-400">
                            {partido.torneo.nombre}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {partido.estado === 'en_curso' && (
                        <div className="text-center">
                          <div className="flex items-center text-lg font-bold text-green-600">
                            <span>{partido.goles_local || 0}</span>
                            <span className="mx-2">-</span>
                            <span>{partido.goles_visitante || 0}</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            <span>En curso</span>
                          </div>
                        </div>
                      )}
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getEstadoBadge(partido.estado)}`}>
                        {partido.estado.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="mt-6 flex justify-end space-x-3">
                    {partido.estado === 'programado' && (
                      <button
                        onClick={() => handleIniciarPartido(partido.id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <PlayIcon className="h-4 w-4 mr-2" />
                        Iniciar Partido
                      </button>
                    )}
                    {partido.estado === 'en_curso' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedPartido(partido)
                            setShowEventModal(true)
                          }}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Registrar Evento
                        </button>
                        <button
                          onClick={() => handleFinalizarPartido(partido.id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <StopIcon className="h-4 w-4 mr-2" />
                          Finalizar
                        </button>
                      </>
                    )}
                  </div>

                  {/* Eventos del partido */}
                  {partido.eventos && partido.eventos.length > 0 && (
                    <div className="mt-6 border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Eventos del Partido</h4>
                      <div className="space-y-2">
                        {partido.eventos.slice(-5).map((evento, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <span className="text-lg mr-2">{getTipoEventoIcon(evento.tipo)}</span>
                            <span className="font-medium mr-2">{evento.minuto}'</span>
                            <span className="mr-2">{evento.jugador?.nombre}</span>
                            <span className="text-gray-500">({evento.tipo.replace('_', ' ')})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredPartidos.length === 0 && (
          <div className="text-center py-12">
            <PlayIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {selectedEstado ? 'No hay partidos con este estado' : 'No tienes partidos asignados'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedEstado 
                ? 'Intenta seleccionar un estado diferente.'
                : 'Los partidos asignados aparecerán aquí cuando estén disponibles.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal para registrar evento */}
      {showEventModal && selectedPartido && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Registrar Evento
              </h3>
              <button
                onClick={handleCloseEventModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>{selectedPartido.equipo_local?.nombre}</strong> vs <strong>{selectedPartido.equipo_visitante?.nombre}</strong>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {selectedPartido.goles_local || 0} - {selectedPartido.goles_visitante || 0}
              </p>
            </div>

            <form onSubmit={handleRegistrarEvento} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Evento *
                </label>
                <select
                  required
                  className="input-field"
                  value={eventoData.tipo}
                  onChange={(e) => setEventoData({...eventoData, tipo: e.target.value})}
                >
                  <option value="gol">Gol</option>
                  <option value="tarjeta_amarilla">Tarjeta Amarilla</option>
                  <option value="tarjeta_roja">Tarjeta Roja</option>
                  <option value="cambio">Cambio</option>
                  <option value="falta">Falta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Equipo *
                </label>
                <select
                  required
                  className="input-field"
                  value={eventoData.equipo_id}
                  onChange={(e) => setEventoData({...eventoData, equipo_id: e.target.value})}
                >
                  <option value="">Seleccionar equipo</option>
                  <option value={selectedPartido.equipo_local?.id}>
                    {selectedPartido.equipo_local?.nombre}
                  </option>
                  <option value={selectedPartido.equipo_visitante?.id}>
                    {selectedPartido.equipo_visitante?.nombre}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Minuto *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  className="input-field"
                  value={eventoData.minuto}
                  onChange={(e) => setEventoData({...eventoData, minuto: e.target.value})}
                  placeholder="Ej: 45"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={eventoData.descripcion}
                  onChange={(e) => setEventoData({...eventoData, descripcion: e.target.value})}
                  placeholder="Descripción adicional del evento..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseEventModal}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? 'Registrando...' : 'Registrar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MisPartidos