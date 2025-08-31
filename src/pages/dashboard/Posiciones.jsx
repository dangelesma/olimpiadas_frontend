import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTorneos } from '../../store/slices/torneosSlice'
import {
  fetchPartidos,
  obtenerMaximosGoleadores,
  obtenerTarjetasAcumuladas
} from '../../store/slices/partidosSlice'
import {
  TrophyIcon,
  UserIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

const Posiciones = () => {
  const dispatch = useDispatch()
  const { torneos, isLoading } = useSelector((state) => state.torneos)
  const { partidos, maximosGoleadores, tarjetasAcumuladas } = useSelector((state) => state.partidos)
  const [selectedTorneo, setSelectedTorneo] = useState('')
  const [activeTab, setActiveTab] = useState('posiciones')
  const [expandedGrupos, setExpandedGrupos] = useState({})

  useEffect(() => {
    dispatch(fetchTorneos())
    dispatch(fetchPartidos())
  }, [dispatch])

  // Cargar datos específicos del torneo cuando se selecciona
  useEffect(() => {
    if (selectedTorneo) {
      if (activeTab === 'goleadores') {
        dispatch(obtenerMaximosGoleadores(parseInt(selectedTorneo)))
      } else if (activeTab === 'tarjetas') {
        dispatch(obtenerTarjetasAcumuladas(parseInt(selectedTorneo)))
      }
    }
  }, [dispatch, selectedTorneo, activeTab])

  // Función para calcular tabla de posiciones por grupos
  const calcularTablaPosiciones = (torneoId) => {
    const partidosTorneo = partidos.filter(p => 
      p.torneo_id === torneoId && p.estado === 'finalizado'
    )

    const equiposStats = {}

    partidosTorneo.forEach(partido => {
      const equipoLocal = partido.equipo_local?.nombre || 'Equipo Local'
      const equipoVisitante = partido.equipo_visitante?.nombre || 'Equipo Visitante'
      const golesLocal = partido.goles_local || 0
      const golesVisitante = partido.goles_visitante || 0

      // Inicializar estadísticas si no existen
      if (!equiposStats[equipoLocal]) {
        equiposStats[equipoLocal] = {
          nombre: equipoLocal,
          grupo: partido.grupo || 'A',
          partidos: 0,
          ganados: 0,
          empatados: 0,
          perdidos: 0,
          golesFavor: 0,
          golesContra: 0,
          diferencia: 0,
          puntos: 0
        }
      }

      if (!equiposStats[equipoVisitante]) {
        equiposStats[equipoVisitante] = {
          nombre: equipoVisitante,
          grupo: partido.grupo || 'A',
          partidos: 0,
          ganados: 0,
          empatados: 0,
          perdidos: 0,
          golesFavor: 0,
          golesContra: 0,
          diferencia: 0,
          puntos: 0
        }
      }

      // Actualizar estadísticas
      equiposStats[equipoLocal].partidos++
      equiposStats[equipoVisitante].partidos++
      equiposStats[equipoLocal].golesFavor += golesLocal
      equiposStats[equipoLocal].golesContra += golesVisitante
      equiposStats[equipoVisitante].golesFavor += golesVisitante
      equiposStats[equipoVisitante].golesContra += golesLocal

      // Determinar resultado
      if (golesLocal > golesVisitante) {
        equiposStats[equipoLocal].ganados++
        equiposStats[equipoLocal].puntos += 3
        equiposStats[equipoVisitante].perdidos++
      } else if (golesLocal < golesVisitante) {
        equiposStats[equipoVisitante].ganados++
        equiposStats[equipoVisitante].puntos += 3
        equiposStats[equipoLocal].perdidos++
      } else {
        equiposStats[equipoLocal].empatados++
        equiposStats[equipoVisitante].empatados++
        equiposStats[equipoLocal].puntos += 1
        equiposStats[equipoVisitante].puntos += 1
      }

      // Calcular diferencia de goles
      equiposStats[equipoLocal].diferencia = equiposStats[equipoLocal].golesFavor - equiposStats[equipoLocal].golesContra
      equiposStats[equipoVisitante].diferencia = equiposStats[equipoVisitante].golesFavor - equiposStats[equipoVisitante].golesContra
    })

    // Agrupar por grupos y ordenar
    const grupos = {}
    Object.values(equiposStats).forEach(equipo => {
      if (!grupos[equipo.grupo]) {
        grupos[equipo.grupo] = []
      }
      grupos[equipo.grupo].push(equipo)
    })

    // Ordenar cada grupo por puntos, diferencia de goles y goles a favor
    Object.keys(grupos).forEach(grupo => {
      grupos[grupo].sort((a, b) => {
        if (b.puntos !== a.puntos) return b.puntos - a.puntos
        if (b.diferencia !== a.diferencia) return b.diferencia - a.diferencia
        return b.golesFavor - a.golesFavor
      })
    })

    return grupos
  }

  // Función para manejar cambio de pestaña
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (selectedTorneo) {
      if (tab === 'goleadores') {
        dispatch(obtenerMaximosGoleadores(parseInt(selectedTorneo)))
      } else if (tab === 'tarjetas') {
        dispatch(obtenerTarjetasAcumuladas(parseInt(selectedTorneo)))
      }
    }
  }

  const toggleGrupo = (grupo) => {
    setExpandedGrupos(prev => ({
      ...prev,
      [grupo]: !prev[grupo]
    }))
  }

  const torneoSeleccionado = torneos.find(t => t.id.toString() === selectedTorneo)
  const tablaPosiciones = selectedTorneo ? calcularTablaPosiciones(parseInt(selectedTorneo)) : {}

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Tabla de Posiciones</h1>
          <p className="mt-2 text-sm text-gray-700">
            Consulta las posiciones, goleadores y estadísticas por torneo
          </p>
        </div>
      </div>

      {/* Selector de Torneo */}
      <div className="mt-6">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Torneo
          </label>
          <select
            className="input-field"
            value={selectedTorneo}
            onChange={(e) => setSelectedTorneo(e.target.value)}
          >
            <option value="">Seleccionar torneo</option>
            {torneos.map((torneo) => (
              <option key={torneo.id} value={torneo.id}>
                {torneo.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedTorneo && (
        <>
          {/* Pestañas */}
          <div className="mt-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('posiciones')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'posiciones'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <TrophyIcon className="w-4 h-4 mr-2" />
                  Tabla de Posiciones
                </button>
                <button
                  onClick={() => setActiveTab('goleadores')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'goleadores'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Goleadores
                </button>
                <button
                  onClick={() => setActiveTab('tarjetas')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'tarjetas'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                  Tarjetas
                </button>
              </nav>
            </div>

            {/* Contenido de las pestañas */}
            <div className="mt-6">
              {/* Tabla de Posiciones */}
              {activeTab === 'posiciones' && (
                <div className="space-y-6">
                  {Object.keys(tablaPosiciones).length > 0 ? (
                    Object.entries(tablaPosiciones).map(([grupo, equipos]) => (
                      <div key={grupo} className="bg-white shadow rounded-lg overflow-hidden">
                        <div 
                          className="px-6 py-4 bg-primary-50 border-b border-gray-200 cursor-pointer hover:bg-primary-100 transition-colors"
                          onClick={() => toggleGrupo(grupo)}
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-primary-900">
                              Grupo {grupo}
                            </h3>
                            {expandedGrupos[grupo] ? (
                              <ChevronDownIcon className="h-5 w-5 text-primary-600" />
                            ) : (
                              <ChevronRightIcon className="h-5 w-5 text-primary-600" />
                            )}
                          </div>
                        </div>

                        {expandedGrupos[grupo] && (
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
                                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    PJ
                                  </th>
                                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    G
                                  </th>
                                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    E
                                  </th>
                                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    P
                                  </th>
                                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    GF
                                  </th>
                                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    GC
                                  </th>
                                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    DIF
                                  </th>
                                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    PTS
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {equipos.map((equipo, index) => (
                                  <tr key={equipo.nombre} className={index < 2 ? 'bg-green-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {equipo.nombre}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                      {equipo.partidos}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                      {equipo.ganados}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                      {equipo.empatados}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                      {equipo.perdidos}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                      {equipo.golesFavor}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                      {equipo.golesContra}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                      <span className={equipo.diferencia >= 0 ? 'text-green-600' : 'text-red-600'}>
                                        {equipo.diferencia > 0 ? '+' : ''}{equipo.diferencia}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                                      {equipo.puntos}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No hay datos de posiciones
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Los datos aparecerán cuando haya partidos finalizados en este torneo.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Máximos Goleadores */}
              {activeTab === 'goleadores' && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-6 py-4 bg-primary-50 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-primary-900">
                      Máximos Goleadores - {torneoSeleccionado?.nombre}
                    </h3>
                  </div>
                  <div className="p-6">
                    {maximosGoleadores.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Pos
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Jugador
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Equipo
                              </th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Goles
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {maximosGoleadores.map((goleador, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {goleador.nombre}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {goleador.equipo}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                                  {goleador.goles}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          No hay goleadores registrados
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Los goleadores aparecerán cuando se registren goles en los partidos.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tarjetas Acumuladas */}
              {activeTab === 'tarjetas' && (
                <div className="grid grid-cols-2 gap-6">
                  {/* Tarjetas Amarillas */}
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 bg-yellow-50 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-yellow-800">
                        Tarjetas Amarillas Acumuladas
                      </h3>
                    </div>
                    <div className="p-6">
                      {tarjetasAcumuladas.amarillas.length > 0 ? (
                        <div className="space-y-2">
                          {tarjetasAcumuladas.amarillas.map((tarjeta, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                              <div>
                                <span className="font-medium">{tarjeta.jugador}</span>
                                <span className="text-sm text-gray-600 ml-2">({tarjeta.equipo})</span>
                              </div>
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-bold">
                                {tarjeta.cantidad}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <ExclamationTriangleIcon className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500">
                            No hay tarjetas amarillas registradas
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tarjetas Rojas */}
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 bg-red-50 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-red-800">
                        Tarjetas Rojas Acumuladas
                      </h3>
                    </div>
                    <div className="p-6">
                      {tarjetasAcumuladas.rojas.length > 0 ? (
                        <div className="space-y-2">
                          {tarjetasAcumuladas.rojas.map((tarjeta, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                              <div>
                                <span className="font-medium">{tarjeta.jugador}</span>
                                <span className="text-sm text-gray-600 ml-2">({tarjeta.equipo})</span>
                              </div>
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-bold">
                                {tarjeta.cantidad}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <ExclamationTriangleIcon className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500">
                            No hay tarjetas rojas registradas
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {!selectedTorneo && (
        <div className="mt-12 text-center">
          <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Selecciona un torneo
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Elige un torneo para ver las posiciones y estadísticas.
          </p>
        </div>
      )}
    </div>
  )
}

export default Posiciones