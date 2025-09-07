import { useState, useEffect } from 'react'
import { CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'

const MatchesByDate = ({ torneoId }) => {
  const [partidosPorFecha, setPartidosPorFecha] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null)

  useEffect(() => {
    const fetchPartidosPorFecha = async () => {
      try {
        setLoading(true)
        const params = torneoId ? { torneo_id: torneoId } : {}
        const response = await api.get('/public/partidos/por-fechas', { params })
        
        if (response.data.success) {
          setPartidosPorFecha(response.data.data)
          // Seleccionar la primera fecha por defecto
          if (response.data.data.length > 0) {
            setFechaSeleccionada(response.data.data[0].fecha_numero)
          }
        }
      } catch (err) {
        console.error('Error fetching partidos por fecha:', err)
        setError('Error al cargar los partidos por fecha')
      } finally {
        setLoading(false)
      }
    }

    fetchPartidosPorFecha()
  }, [torneoId])

  const formatDate = (dateString) => {
    if (!dateString) return ''
    // Se procesa la fecha como UTC para evitar conversiones de zona horaria del navegador.
    const date = new Date(dateString)
    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Lima'
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return ''
    // Se procesa la fecha como UTC para mostrar la hora sin conversión de zona horaria.
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Lima'
    })
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'programado':
        return 'bg-blue-100 text-blue-800'
      case 'en_curso':
        return 'bg-green-100 text-green-800'
      case 'finalizado':
        return 'bg-gray-100 text-gray-800'
      case 'suspendido':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEstadoText = (estado) => {
    switch (estado) {
      case 'programado':
        return 'Programado'
      case 'en_curso':
        return 'En Curso'
      case 'finalizado':
        return 'Finalizado'
      case 'suspendido':
        return 'Suspendido'
      default:
        return estado
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
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
      <div className="text-center py-8">
        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay partidos programados</h3>
        <p className="mt-1 text-sm text-gray-500">Los partidos aparecerán aquí cuando sean programados.</p>
      </div>
    )
  }

  const fechaActual = partidosPorFecha.find(f => f.fecha_numero === fechaSeleccionada)

  return (
    <div className="space-y-6">
      {/* Selector de fechas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {partidosPorFecha.map((fecha) => (
            <button
              key={fecha.fecha_numero}
              onClick={() => setFechaSeleccionada(fecha.fecha_numero)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                fechaSeleccionada === fecha.fecha_numero
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {fecha.nombre}
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                {fecha.partidos.length}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Partidos de la fecha seleccionada */}
      {fechaActual && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {fechaActual.nombre} - {fechaActual.partidos.length} partidos
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {fechaActual.partidos.map((partido) => (
              <div
                key={partido.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                {/* Estado del partido */}
                <div className="flex justify-between items-start mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(partido.estado)}`}>
                    {getEstadoText(partido.estado)}
                  </span>
                  {partido.estado === 'finalizado' && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {partido.goles_local} - {partido.goles_visitante}
                      </div>
                    </div>
                  )}
                </div>

                {/* Equipos */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {partido.equipo_local?.nombre || 'Equipo Local'}
                    </span>
                    {partido.estado === 'finalizado' && (
                      <span className="text-lg font-bold text-gray-900">
                        {partido.goles_local}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-gray-500 text-sm">vs</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {partido.equipo_visitante?.nombre || 'Equipo Visitante'}
                    </span>
                    {partido.estado === 'finalizado' && (
                      <span className="text-lg font-bold text-gray-900">
                        {partido.goles_visitante}
                      </span>
                    )}
                  </div>
                </div>

                {/* Información del partido */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>{formatDate(partido.fecha_hora)}</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span>{formatTime(partido.fecha_hora)}</span>
                  </div>
                  {partido.cancha && (
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      <span>{partido.cancha.nombre}</span>
                    </div>
                  )}
                </div>

                {/* Información adicional */}
                {(partido.grupo || partido.fase) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {partido.fase && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                          {partido.fase}
                        </span>
                      )}
                      {partido.grupo && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                          Grupo {partido.grupo}
                          {partido.subgrupo && `-${partido.subgrupo}`}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MatchesByDate