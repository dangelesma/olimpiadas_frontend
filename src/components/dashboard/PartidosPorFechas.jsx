import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  CalendarIcon,
  ClockIcon,
  PlayIcon,
  StopIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { formatDateTime } from '../../utils/dateUtils'
import api from '../../services/api'

const PartidosPorFechas = ({ 
  onIniciarPartido, 
  onReingresarPartido, 
  onMarcarWalkover, 
  onVerResumen,
  searchTerm = ''
}) => {
  const [partidosPorFecha, setPartidosPorFecha] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedFechas, setExpandedFechas] = useState({})
  const [expandedTorneos, setExpandedTorneos] = useState({})

  const { torneos } = useSelector((state) => state.torneos)

  useEffect(() => {
    const fetchPartidosPorFecha = async () => {
      try {
        setLoading(true)
        const response = await api.get('/partidos/por-fechas')
        
        if (response.data.success) {
          // Agrupar por torneo y luego por fecha
          const partidosAgrupados = agruparPorTorneoYFecha(response.data.data)
          setPartidosPorFecha(partidosAgrupados)
          
          // Expandir la primera fecha de cada torneo por defecto
          const initialExpanded = {}
          partidosAgrupados.forEach(torneo => {
            if (torneo.fechas.length > 0) {
              initialExpanded[`${torneo.torneo_id}-1`] = true
            }
          })
          setExpandedFechas(initialExpanded)
        }
      } catch (err) {
        console.error('Error fetching partidos por fecha:', err)
        setError('Error al cargar los partidos por fecha')
      } finally {
        setLoading(false)
      }
    }

    fetchPartidosPorFecha()
  }, [])

  const agruparPorTorneoYFecha = (fechas) => {
    const torneoMap = new Map()

    fechas.forEach(fecha => {
      fecha.partidos.forEach(partido => {
        const torneoId = partido.torneo_id
        const torneo = torneos.find(t => t.id === torneoId)
        
        if (!torneoMap.has(torneoId)) {
          torneoMap.set(torneoId, {
            torneo_id: torneoId,
            torneo_nombre: torneo?.nombre || `Torneo ${torneoId}`,
            fechas: new Map()
          })
        }

        const torneoData = torneoMap.get(torneoId)
        const fechaNumero = fecha.fecha_numero

        if (!torneoData.fechas.has(fechaNumero)) {
          torneoData.fechas.set(fechaNumero, {
            fecha_numero: fechaNumero,
            nombre: fecha.nombre,
            partidos: []
          })
        }

        torneoData.fechas.get(fechaNumero).partidos.push(partido)
      })
    })

    // Convertir a array y ordenar
    return Array.from(torneoMap.values()).map(torneo => ({
      ...torneo,
      fechas: Array.from(torneo.fechas.values()).sort((a, b) => a.fecha_numero - b.fecha_numero)
    }))
  }

  const toggleFecha = (torneoId, fechaNumero) => {
    const key = `${torneoId}-${fechaNumero}`
    setExpandedFechas(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const toggleTorneo = (torneoId) => {
    setExpandedTorneos(prev => ({
      ...prev,
      [torneoId]: !prev[torneoId]
    }))
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

  const filtrarPartidos = (partidos) => {
    if (!searchTerm) return partidos
    
    return partidos.filter(partido =>
      partido.equipo_local?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partido.equipo_visitante?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partido.cancha?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const getEstadisticasFecha = (partidos) => {
    return {
      total: partidos.length,
      programados: partidos.filter(p => p.estado === 'programado').length,
      en_curso: partidos.filter(p => p.estado === 'en_curso').length,
      finalizados: partidos.filter(p => p.estado === 'finalizado').length
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (partidosPorFecha.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay partidos programados</h3>
        <p className="mt-1 text-sm text-gray-500">Los partidos aparecerán aquí cuando sean programados.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {partidosPorFecha.map((torneo) => (
        <div key={torneo.torneo_id} className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header del torneo */}
          <div 
            className="px-6 py-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => toggleTorneo(torneo.torneo_id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrophyIcon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {torneo.torneo_nombre}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {torneo.fechas.length} fecha{torneo.fechas.length !== 1 ? 's' : ''} programada{torneo.fechas.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Icono de expandir/contraer */}
                {expandedTorneos[torneo.torneo_id] ? (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Fechas del torneo */}
          {expandedTorneos[torneo.torneo_id] && (
            <div className="divide-y divide-gray-200">
              {torneo.fechas.map((fecha) => {
                const fechaKey = `${torneo.torneo_id}-${fecha.fecha_numero}`
                const isFechaExpanded = expandedFechas[fechaKey]
                const partidosFiltrados = filtrarPartidos(fecha.partidos)
                const stats = getEstadisticasFecha(partidosFiltrados)

                if (partidosFiltrados.length === 0 && searchTerm) {
                  return null // No mostrar fechas sin partidos cuando hay filtro
                }

                return (
                  <div key={fecha.fecha_numero} className="px-6 py-4">
                    {/* Header de la fecha */}
                    <div
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -mx-6 px-6 py-2 rounded transition-colors"
                      onClick={() => toggleFecha(torneo.torneo_id, fecha.fecha_numero)}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600">{fecha.fecha_numero}</span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-md font-medium text-gray-900">
                            {fecha.nombre}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {partidosFiltrados.length} partido{partidosFiltrados.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Estadísticas de la fecha */}
                        <div className="flex space-x-1 text-xs">
                          {stats.programados > 0 && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {stats.programados} Prog.
                            </span>
                          )}
                          {stats.en_curso > 0 && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              {stats.en_curso} En Curso
                            </span>
                          )}
                          {stats.finalizados > 0 && (
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                              {stats.finalizados} Final.
                            </span>
                          )}
                        </div>
                        
                        {/* Icono de expandir/contraer */}
                        {isFechaExpanded ? (
                          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Partidos de la fecha */}
                    {isFechaExpanded && (
                      <div className="mt-4 ml-6 space-y-3">
                        {partidosFiltrados.map((partido) => (
                          <div key={partido.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                    <PlayIcon className="h-4 w-4 text-primary-600" />
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <div className="flex items-center">
                                    <p className="text-sm font-medium text-gray-900">
                                      {partido.equipo_local?.nombre || 'Equipo Local'}
                                      <span className="mx-2 text-gray-500">vs</span>
                                      {partido.equipo_visitante?.nombre || 'Equipo Visitante'}
                                    </p>
                                  </div>
                                  <div className="mt-1 flex items-center text-xs text-gray-500">
                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                    <span>{formatDateTime(partido.fecha_hora)}</span>
                                    {partido.cancha && (
                                      <>
                                        <span className="mx-2">•</span>
                                        <span>{partido.cancha.nombre}</span>
                                      </>
                                    )}
                                    {partido.grupo && (
                                      <>
                                        <span className="mx-2">•</span>
                                        <span>Grupo {partido.grupo}{partido.subgrupo ? `-${partido.subgrupo}` : ''}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                {partido.estado === 'en_curso' && (
                                  <div className="flex items-center text-xs text-green-600">
                                    <ClockIcon className="h-3 w-3 mr-1" />
                                    <span>
                                      {partido.goles_local || 0} - {partido.goles_visitante || 0}
                                    </span>
                                  </div>
                                )}

                                {partido.estado === 'finalizado' && (
                                  <div className="flex items-center text-xs text-gray-600">
                                    <span className="font-semibold">
                                      {partido.goles_local || 0} - {partido.goles_visitante || 0}
                                    </span>
                                  </div>
                                )}

                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getEstadoBadge(partido.estado)}`}>
                                  {partido.estado.replace('_', ' ')}
                                </span>

                                <div className="flex space-x-1">
                                  {partido.estado === 'programado' && (
                                    <button
                                      onClick={() => onIniciarPartido(partido)}
                                      className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                      title="Iniciar partido"
                                    >
                                      <PlayIcon className="h-3 w-3" />
                                    </button>
                                  )}
                                  {partido.estado === 'en_curso' && (
                                    <button
                                      onClick={() => onReingresarPartido(partido)}
                                      className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                      title="Reingresar al partido"
                                    >
                                      <PlayIcon className="h-3 w-3" />
                                    </button>
                                  )}
                                  {partido.estado === 'programado' && (
                                    <button
                                      onClick={() => onMarcarWalkover(partido)}
                                      className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                      title="Marcar como W.O."
                                    >
                                      <ExclamationTriangleIcon className="h-3 w-3" />
                                    </button>
                                  )}
                                  {partido.estado === 'finalizado' && (
                                    <button
                                      onClick={() => onVerResumen(partido)}
                                      className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                      title="Ver resumen del partido"
                                    >
                                      <TrophyIcon className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {partidosFiltrados.length === 0 && searchTerm && (
                          <div className="text-center py-4">
                            <p className="text-gray-500 text-sm">No hay partidos que coincidan con la búsqueda en esta fecha.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )

  function getEstadoBadge(estado) {
    const badges = {
      programado: 'bg-blue-100 text-blue-800',
      en_curso: 'bg-green-100 text-green-800',
      finalizado: 'bg-gray-100 text-gray-800',
      cancelado: 'bg-red-100 text-red-800',
      suspendido: 'bg-yellow-100 text-yellow-800'
    }
    return badges[estado] || 'bg-gray-100 text-gray-800'
  }
}

export default PartidosPorFechas