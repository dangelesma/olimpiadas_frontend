import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTorneos } from '../../store/slices/torneosSlice'
import { obtenerMaximosGoleadores, obtenerTarjetasAcumuladas, obtenerPosicionesTorneo, obtenerTablaPosicionesPorGrupos } from '../../store/slices/partidosSlice'
import {
  TrophyIcon,
  UserIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

const Estadisticas = () => {
  const dispatch = useDispatch()
  const { torneos, isLoading } = useSelector((state) => state.torneos)
  const { maximosGoleadores, tarjetasAcumuladas, posicionesTorneo, tablaPosicionesPorGrupos } = useSelector((state) => state.partidos)
  const [selectedTorneo, setSelectedTorneo] = useState('')
  const [currentTabByTorneo, setCurrentTabByTorneo] = useState({}) // Estado por torneo
  const [expandedTorneos, setExpandedTorneos] = useState({})
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    dispatch(fetchTorneos())
  }, [dispatch])

  // Cargar datos automáticamente cuando se expande un torneo
  useEffect(() => {
    if (selectedTorneo) {
      // Obtener datos del backend
      dispatch(obtenerMaximosGoleadores(selectedTorneo))
        .then((result) => {
          console.log('Goleadores obtenidos:', result.payload)
        })
        .catch((error) => {
          console.error('Error obteniendo goleadores:', error)
        })
      
      dispatch(obtenerTarjetasAcumuladas(selectedTorneo))
        .then((result) => {
          console.log('Tarjetas obtenidas:', result.payload)
        })
        .catch((error) => {
          console.error('Error obteniendo tarjetas:', error)
        })

      dispatch(obtenerPosicionesTorneo(selectedTorneo))
        .then((result) => {
          console.log('Posiciones obtenidas:', result.payload)
        })
        .catch((error) => {
          console.error('Error obteniendo posiciones:', error)
        })

      dispatch(obtenerTablaPosicionesPorGrupos(selectedTorneo))
        .then((result) => {
          console.log('Tabla por grupos obtenida:', result.payload)
        })
        .catch((error) => {
          console.error('Error obteniendo tabla por grupos:', error)
        })
    }
  }, [dispatch, selectedTorneo])


  const toggleTorneo = (torneoId) => {
    const wasExpanded = expandedTorneos[torneoId]
    
    setExpandedTorneos(prev => ({
      ...prev,
      [torneoId]: !prev[torneoId]
    }))
    
    // Si se está expandiendo el torneo, cargar sus datos automáticamente
    if (!wasExpanded) {
      setSelectedTorneo(torneoId)
      
      // Inicializar pestaña por defecto para este torneo si no existe
      if (!currentTabByTorneo[torneoId]) {
        setCurrentTabByTorneo(prev => ({
          ...prev,
          [torneoId]: 'posiciones'
        }))
      }
    }
  }

  // Función para cambiar pestaña de un torneo específico
  const setTabForTorneo = (torneoId, tab) => {
    setCurrentTabByTorneo(prev => ({
      ...prev,
      [torneoId]: tab
    }))
    setSelectedTorneo(torneoId)
  }

  // Función para obtener la pestaña actual de un torneo
  const getCurrentTabForTorneo = (torneoId) => {
    return currentTabByTorneo[torneoId] || 'posiciones'
  }

  const filteredTorneos = torneos.filter(torneo =>
    torneo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )


  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Estadísticas de Torneos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Consulta las estadísticas, tabla de posiciones, goleadores y tarjetas por torneo
          </p>
        </div>
      </div>


      {/* Filtro de búsqueda */}
      <div className="mt-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Buscar torneos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de torneos */}
      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTorneos.map((torneo) => {
              const isExpanded = expandedTorneos[torneo.id]
              
              return (
                <div key={torneo.id} className="bg-white shadow rounded-lg overflow-hidden">
                  {/* Header del torneo */}
                  <div 
                    className="px-6 py-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleTorneo(torneo.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <TrophyIcon className="h-8 w-8 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            {torneo.nombre}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {torneo.descripcion || 'Sin descripción'} • {torneo.deporte}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {/* Icono de expandir/contraer */}
                        {isExpanded ? (
                          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contenido expandible */}
                  {isExpanded && (
                    <div className="p-6">
                      {/* Pestañas */}
                      <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8">
                          <button
                            onClick={() => setTabForTorneo(torneo.id, 'posiciones')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              getCurrentTabForTorneo(torneo.id) === 'posiciones'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            Tabla de Posiciones
                          </button>
                          <button
                            onClick={() => setTabForTorneo(torneo.id, 'goleadores')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              getCurrentTabForTorneo(torneo.id) === 'goleadores'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            Goleadores
                          </button>
                          <button
                            onClick={() => setTabForTorneo(torneo.id, 'tarjetas')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              getCurrentTabForTorneo(torneo.id) === 'tarjetas'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            Tarjetas
                          </button>
                        </nav>
                      </div>

                      {/* Contenido de las pestañas */}
                      {getCurrentTabForTorneo(torneo.id) === 'posiciones' && selectedTorneo === torneo.id && (
                        <div>
                          <h4 className="text-lg font-semibold mb-4">Tabla de Posiciones</h4>
                          {(() => {
                            // Usar datos de tabla por grupos si están disponibles, sino usar la tabla general
                            const gruposData = tablaPosicionesPorGrupos || []
                            const posicionesData = posicionesTorneo || []
                            
                            if (gruposData.length > 0) {
                              // Mostrar tabla por grupos y subgrupos
                              return (
                                <div className="space-y-6">
                                  {gruposData.map((grupo, grupoIndex) => (
                                    <div key={grupoIndex} className="border border-gray-200 rounded-lg">
                                      <div className="bg-blue-50 px-4 py-3 border-b">
                                        <h5 className="text-md font-semibold text-blue-900">
                                          {grupo.grupo === 'Sin Grupo' ? 'Tabla General' : `Grupo ${grupo.grupo}`}
                                        </h5>
                                      </div>
                                      
                                      {/* Equipos del grupo principal (sin subgrupo) */}
                                      {grupo.equipos && grupo.equipos.length > 0 && (
                                        <div className="p-4">
                                          <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                              <thead className="bg-gray-50">
                                                <tr>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pos</th>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Equipo</th>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">PJ</th>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">G</th>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">E</th>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">P</th>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">GF</th>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">GC</th>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">DG</th>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pts</th>
                                                </tr>
                                              </thead>
                                              <tbody className="bg-white divide-y divide-gray-200">
                                                {grupo.equipos.map((equipo, index) => (
                                                  <tr key={index} className={index < 3 ? 'bg-green-50' : ''}>
                                                    <td className="px-3 py-2 text-sm font-medium text-gray-900">{equipo.posicion}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-900">{equipo.equipo}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-500">{equipo.partidos_jugados}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-500">{equipo.victorias}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-500">{equipo.empates}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-500">{equipo.derrotas}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-500">{equipo.goles_favor}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-500">{equipo.goles_contra}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-500">{equipo.diferencia_goles}</td>
                                                    <td className="px-3 py-2 text-sm font-medium text-gray-900">{equipo.puntos}</td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      )}

                                      {/* Subgrupos */}
                                      {grupo.subgrupos && Object.keys(grupo.subgrupos).length > 0 && (
                                        <div className="space-y-4 p-4">
                                          {Object.entries(grupo.subgrupos).map(([subgrupoKey, subgrupo]) => (
                                            <div key={subgrupoKey} className="border border-blue-200 rounded-lg">
                                              <div className="bg-blue-100 px-3 py-2 border-b">
                                                <h6 className="text-sm font-semibold text-blue-900">
                                                  Subgrupo {grupo.grupo}-{subgrupo.subgrupo}
                                                </h6>
                                              </div>
                                              <div className="p-3">
                                                <div className="overflow-x-auto">
                                                  <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                      <tr>
                                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Pos</th>
                                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Equipo</th>
                                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">PJ</th>
                                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">G</th>
                                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">E</th>
                                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">P</th>
                                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Pts</th>
                                                      </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                      {subgrupo.equipos.map((equipo, index) => (
                                                        <tr key={index} className={index < 2 ? 'bg-green-50' : ''}>
                                                          <td className="px-2 py-1 text-xs font-medium text-gray-900">{equipo.posicion}</td>
                                                          <td className="px-2 py-1 text-xs text-gray-900">{equipo.equipo}</td>
                                                          <td className="px-2 py-1 text-xs text-gray-500">{equipo.partidos_jugados}</td>
                                                          <td className="px-2 py-1 text-xs text-gray-500">{equipo.victorias}</td>
                                                          <td className="px-2 py-1 text-xs text-gray-500">{equipo.empates}</td>
                                                          <td className="px-2 py-1 text-xs text-gray-500">{equipo.derrotas}</td>
                                                          <td className="px-2 py-1 text-xs font-medium text-gray-900">{equipo.puntos}</td>
                                                        </tr>
                                                      ))}
                                                    </tbody>
                                                  </table>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )
                            } else if (posicionesData.length > 0) {
                              // Mostrar tabla general como fallback
                              return (
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pos</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PJ</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">G</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GF</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GC</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DG</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pts</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {posicionesData.map((equipo, index) => (
                                        <tr key={index} className={index < 3 ? 'bg-green-50' : ''}>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{equipo.equipo_nombre || equipo.equipo}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{equipo.partidos_jugados}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{equipo.ganados || equipo.victorias}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{equipo.empatados || equipo.empates}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{equipo.perdidos || equipo.derrotas}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{equipo.goles_favor}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{equipo.goles_contra}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{equipo.diferencia_goles || (equipo.goles_favor - equipo.goles_contra)}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{equipo.puntos}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )
                            } else {
                              return (
                                <div className="text-center py-8">
                                  <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
                                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                                    No hay datos de posiciones
                                  </h3>
                                  <p className="mt-1 text-sm text-gray-500">
                                    Los datos aparecerán cuando se jueguen partidos en este torneo.
                                  </p>
                                </div>
                              )
                            }
                          })()}
                        </div>
                      )}

                      {getCurrentTabForTorneo(torneo.id) === 'goleadores' && selectedTorneo === torneo.id && (
                        <div>
                          <h4 className="text-lg font-semibold mb-4">Top 10 Goleadores</h4>
                          {(() => {
                            // Solo usar datos del backend, no generar datos simulados
                            const goleadoresData = maximosGoleadores || []
                            
                            return goleadoresData.length > 0 ? (
                              <div className="space-y-3">
                                {goleadoresData.slice(0, 10).map((goleador, index) => (
                                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold ${
                                          index === 0 ? 'bg-yellow-500' :
                                          index === 1 ? 'bg-gray-400' :
                                          index === 2 ? 'bg-orange-600' : 'bg-primary-600'
                                        }`}>
                                          {index + 1}
                                        </div>
                                      </div>
                                      <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-900">
                                          #{goleador.numero_camiseta || 'S/N'} {goleador.jugador_nombre}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {goleador.equipo_nombre}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-lg font-bold text-primary-600">
                                        {goleador.total_goles || goleador.goles}
                                      </p>
                                      <p className="text-xs text-gray-500">goles</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                  No hay goleadores registrados
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                  Los goleadores aparecerán cuando se registren goles en los partidos.
                                </p>
                              </div>
                            )
                          })()}
                        </div>
                      )}

                      {getCurrentTabForTorneo(torneo.id) === 'tarjetas' && selectedTorneo === torneo.id && (
                        <div>
                          <h4 className="text-lg font-semibold mb-4">Estadísticas de Tarjetas</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(() => {
                              // Solo usar datos del backend, no generar datos simulados
                              const tarjetasData = tarjetasAcumuladas || { amarillas: [], rojas: [] }
                              
                              return (
                                <>
                                  {/* Tarjetas Amarillas */}
                                  <div>
                                    <h5 className="text-md font-medium text-yellow-600 mb-3">Tarjetas Amarillas</h5>
                                    {tarjetasData.amarillas && tarjetasData.amarillas.length > 0 ? (
                                      <div className="space-y-2">
                                        {tarjetasData.amarillas.map((tarjeta, index) => (
                                          <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                            <div>
                                              <p className="text-sm font-medium text-gray-900">
                                                #{tarjeta.numero_camiseta || 'S/N'} {tarjeta.jugador_nombre}
                                              </p>
                                              <p className="text-sm text-gray-500">
                                                {tarjeta.equipo_nombre}
                                              </p>
                                            </div>
                                            <div className="text-right">
                                              <p className="text-lg font-bold text-yellow-600">
                                                {tarjeta.total_tarjetas || tarjeta.tarjetas}
                                              </p>
                                              <p className="text-xs text-gray-500">amarillas</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-center py-6">
                                        <p className="text-sm text-gray-500">No hay tarjetas amarillas registradas</p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Tarjetas Rojas */}
                                  <div>
                                    <h5 className="text-md font-medium text-red-600 mb-3">Tarjetas Rojas</h5>
                                    {tarjetasData.rojas && tarjetasData.rojas.length > 0 ? (
                                      <div className="space-y-2">
                                        {tarjetasData.rojas.map((tarjeta, index) => (
                                          <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                            <div>
                                              <p className="text-sm font-medium text-gray-900">
                                                #{tarjeta.numero_camiseta || tarjeta.numero || 'S/N'} {
                                                  tarjeta.jugador_nombre ||
                                                  tarjeta.nombre_completo ||
                                                  `${tarjeta.nombre || ''} ${tarjeta.apellido || ''}`.trim() ||
                                                  tarjeta.jugador ||
                                                  'Jugador sin nombre'
                                                }
                                              </p>
                                              <p className="text-sm text-gray-500">
                                                {tarjeta.equipo_nombre || tarjeta.equipo?.nombre || tarjeta.equipo || 'Equipo sin nombre'}
                                              </p>
                                            </div>
                                            <div className="text-right">
                                              <p className="text-lg font-bold text-red-600">
                                                {tarjeta.total_tarjetas || tarjeta.tarjetas}
                                              </p>
                                              <p className="text-xs text-gray-500">rojas</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-center py-6">
                                        <p className="text-sm text-gray-500">No hay tarjetas rojas registradas</p>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {!isLoading && filteredTorneos.length === 0 && (
          <div className="text-center py-12">
            <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? 'No se encontraron torneos' : 'No hay torneos'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Intenta ajustar el término de búsqueda.'
                : 'Los torneos aparecerán aquí cuando estén disponibles.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Estadisticas