import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTorneos } from '../../store/slices/torneosSlice'
import { obtenerMaximosGoleadores, obtenerTarjetasAcumuladas, obtenerPosicionesTorneo } from '../../store/slices/partidosSlice'
import {
  TrophyIcon,
  UserIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

const Estadisticas = () => {
  const dispatch = useDispatch()
  const { torneos, isLoading } = useSelector((state) => state.torneos)
  const { maximosGoleadores, tarjetasAcumuladas, posicionesTorneo } = useSelector((state) => state.partidos)
  const [selectedTorneo, setSelectedTorneo] = useState('')
  const [currentTab, setCurrentTab] = useState('posiciones')
  const [expandedTorneos, setExpandedTorneos] = useState({})
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    dispatch(fetchTorneos())
  }, [dispatch])

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
    }
  }, [dispatch, selectedTorneo])

  // Función para generar datos simulados de goleadores
  const generateSimulatedGoleadores = (torneo) => {
    const equipos = torneo.equipos || []
    const goleadores = []
    
    equipos.forEach(equipo => {
      // Simular 2-3 goleadores por equipo
      for (let i = 0; i < Math.floor(Math.random() * 3) + 2; i++) {
        goleadores.push({
          jugador_nombre: `Jugador${i + 1} ${equipo.nombre}`,
          numero_camiseta: Math.floor(Math.random() * 99) + 1,
          equipo_nombre: equipo.nombre,
          total_goles: Math.floor(Math.random() * 15) + 1
        })
      }
    })
    
    return goleadores.sort((a, b) => b.total_goles - a.total_goles).slice(0, 10)
  }

  // Función para generar datos simulados de tarjetas
  const generateSimulatedTarjetas = (torneo) => {
    const equipos = torneo.equipos || []
    const tarjetasAmarillas = []
    const tarjetasRojas = []
    
    equipos.forEach(equipo => {
      // Simular tarjetas amarillas
      for (let i = 0; i < Math.floor(Math.random() * 4) + 1; i++) {
        tarjetasAmarillas.push({
          jugador_nombre: `Jugador${i + 1} ${equipo.nombre}`,
          numero_camiseta: Math.floor(Math.random() * 99) + 1,
          equipo_nombre: equipo.nombre,
          total_tarjetas: Math.floor(Math.random() * 5) + 1
        })
      }
      
      // Simular tarjetas rojas (menos frecuentes)
      if (Math.random() > 0.5) {
        tarjetasRojas.push({
          jugador_nombre: `Jugador${Math.floor(Math.random() * 3) + 1} ${equipo.nombre}`,
          numero_camiseta: Math.floor(Math.random() * 99) + 1,
          equipo_nombre: equipo.nombre,
          total_tarjetas: 1
        })
      }
    })
    
    return {
      amarillas: tarjetasAmarillas.sort((a, b) => b.total_tarjetas - a.total_tarjetas),
      rojas: tarjetasRojas
    }
  }

  const toggleTorneo = (torneoId) => {
    setExpandedTorneos(prev => ({
      ...prev,
      [torneoId]: !prev[torneoId]
    }))
  }

  const filteredTorneos = torneos.filter(torneo =>
    torneo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Función para generar tabla de posiciones simulada
  const generateTablaPositions = (torneo) => {
    // Esta es una implementación simulada. En un caso real, esto vendría del backend
    const equipos = torneo.equipos || []
    return equipos.map((equipo, index) => ({
      posicion: index + 1,
      equipo: equipo.nombre,
      partidos_jugados: Math.floor(Math.random() * 10) + 5,
      ganados: Math.floor(Math.random() * 8) + 2,
      empatados: Math.floor(Math.random() * 3),
      perdidos: Math.floor(Math.random() * 4),
      goles_favor: Math.floor(Math.random() * 20) + 10,
      goles_contra: Math.floor(Math.random() * 15) + 5,
      puntos: Math.floor(Math.random() * 25) + 15
    })).sort((a, b) => b.puntos - a.puntos)
  }

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

      {/* Nota sobre endpoints del backend */}
      <div className="mt-4 rounded-md bg-blue-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Nota de Desarrollo
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Los endpoints del backend para estadísticas necesitan ser implementados:</p>
              <ul className="list-disc list-inside mt-1">
                <li><code>GET /torneos/[id]/goleadores</code></li>
                <li><code>GET /torneos/[id]/tarjetas</code></li>
                <li><code>GET /torneos/[id]/posiciones</code></li>
              </ul>
              <p className="mt-1">Mientras tanto, se muestran datos simulados para demostrar la funcionalidad.</p>
            </div>
          </div>
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
              const tablaPositions = generateTablaPositions(torneo)
              
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
                            onClick={() => setCurrentTab('posiciones')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              currentTab === 'posiciones'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            Tabla de Posiciones
                          </button>
                          <button
                            onClick={() => {
                              setCurrentTab('goleadores')
                              setSelectedTorneo(torneo.id)
                            }}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              currentTab === 'goleadores'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            Goleadores
                          </button>
                          <button
                            onClick={() => {
                              setCurrentTab('tarjetas')
                              setSelectedTorneo(torneo.id)
                            }}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              currentTab === 'tarjetas'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            Tarjetas
                          </button>
                        </nav>
                      </div>

                      {/* Contenido de las pestañas */}
                      {currentTab === 'posiciones' && selectedTorneo === torneo.id && (
                        <div>
                          <h4 className="text-lg font-semibold mb-4">Tabla de Posiciones</h4>
                          {(() => {
                            // Usar datos del backend si están disponibles, sino usar datos simulados
                            const posicionesData = (posicionesTorneo && posicionesTorneo.length > 0)
                              ? posicionesTorneo
                              : generateTablaPositions(torneo)
                            
                            return posicionesData.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pos
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Equipo
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        PJ
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        G
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        E
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        P
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        GF
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        GC
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        DG
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pts
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {posicionesData.map((equipo, index) => (
                                      <tr key={index} className={index < 3 ? 'bg-green-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                          {equipo.posicion}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          {equipo.equipo_nombre || equipo.equipo}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          {equipo.partidos_jugados}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          {equipo.ganados}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          {equipo.empatados}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          {equipo.perdidos}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          {equipo.goles_favor}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          {equipo.goles_contra}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          {equipo.diferencia_goles || (equipo.goles_favor - equipo.goles_contra)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                          {equipo.puntos}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
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
                          })()}
                        </div>
                      )}

                      {currentTab === 'goleadores' && selectedTorneo === torneo.id && (
                        <div>
                          <h4 className="text-lg font-semibold mb-4">Top 10 Goleadores</h4>
                          {(() => {
                            // Usar datos del backend si están disponibles, sino usar datos simulados
                            const goleadoresData = (maximosGoleadores && maximosGoleadores.length > 0)
                              ? maximosGoleadores
                              : generateSimulatedGoleadores(torneo)
                            
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

                      {currentTab === 'tarjetas' && selectedTorneo === torneo.id && (
                        <div>
                          <h4 className="text-lg font-semibold mb-4">Estadísticas de Tarjetas</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(() => {
                              // Usar datos del backend si están disponibles, sino usar datos simulados
                              const tarjetasData = (tarjetasAcumuladas?.amarillas && tarjetasAcumuladas.amarillas.length > 0) ||
                                                  (tarjetasAcumuladas?.rojas && tarjetasAcumuladas.rojas.length > 0)
                                ? tarjetasAcumuladas
                                : generateSimulatedTarjetas(torneo)
                              
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