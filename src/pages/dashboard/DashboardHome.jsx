import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTorneos } from '../../store/slices/torneosSlice'
import { fetchPartidos } from '../../store/slices/partidosSlice'
import { 
  TrophyIcon,
  UserGroupIcon,
  PlayIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

const DashboardHome = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { torneos } = useSelector((state) => state.torneos)
  const { partidos } = useSelector((state) => state.partidos)

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(fetchTorneos())
      dispatch(fetchPartidos())
    }
  }, [dispatch, user])

  // Estadísticas básicas
  const stats = [
    {
      name: 'Torneos Activos',
      value: torneos.filter(t => t.estado === 'en_curso').length,
      icon: TrophyIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Torneos',
      value: torneos.length,
      icon: ChartBarIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Partidos Hoy',
      value: partidos.filter(p => {
        const today = new Date().toISOString().split('T')[0]
        return p.fecha_hora?.startsWith(today)
      }).length,
      icon: PlayIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Partidos en Curso',
      value: partidos.filter(p => p.estado === 'en_curso').length,
      icon: UserGroupIcon,
      color: 'bg-red-500',
    },
  ]

  return (
    <div>
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {user?.name}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {user?.role === 'admin' 
            ? 'Panel de administración de olimpiadas escolares'
            : 'Panel de gestión de partidos asignados'
          }
        </p>
      </div>

      {/* Estadísticas para administradores */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6 sm:mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${stat.color} p-2 sm:p-3 rounded-md`}>
                      <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-lg sm:text-xl font-medium text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Torneos recientes */}
        {user?.role === 'admin' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-4 sm:px-6 sm:py-5">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 mb-3 sm:mb-4">
                Torneos Recientes
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {torneos.slice(0, 5).map((torneo) => (
                  <div key={torneo.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{torneo.nombre}</p>
                      <p className="text-xs text-gray-500 capitalize">{torneo.deporte} • {torneo.estado}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                      torneo.estado === 'en_curso'
                        ? 'bg-green-100 text-green-800'
                        : torneo.estado === 'finalizado'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {torneo.estado}
                    </span>
                  </div>
                ))}
                {torneos.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No hay torneos registrados
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actividad reciente */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-4 sm:px-6 sm:py-5">
            <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 mb-3 sm:mb-4">
              {user?.role === 'admin' ? 'Partidos Próximos' : 'Mis Próximos Partidos'}
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {partidos
                .filter(p => p.estado === 'programado')
                .slice(0, 5)
                .map((partido) => (
                <div key={partido.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {partido.equipo_local?.nombre} vs {partido.equipo_visitante?.nombre}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {new Date(partido.fecha_hora).toLocaleDateString()} • {partido.cancha?.nombre}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                    Programado
                  </span>
                </div>
              ))}
              {partidos.filter(p => p.estado === 'programado').length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay partidos programados
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="mt-8">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {user?.role === 'admin' ? (
            <>
              <button className="bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-left">
                <TrophyIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 mb-2" />
                <h4 className="text-sm font-medium text-gray-900">Crear Torneo</h4>
                <p className="text-xs text-gray-500">Nuevo torneo deportivo</p>
              </button>
              <button className="bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-left">
                <UserGroupIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 mb-2" />
                <h4 className="text-sm font-medium text-gray-900">Registrar Equipo</h4>
                <p className="text-xs text-gray-500">Nuevo equipo participante</p>
              </button>
              <button className="bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-left">
                <PlayIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 mb-2" />
                <h4 className="text-sm font-medium text-gray-900">Programar Partido</h4>
                <p className="text-xs text-gray-500">Nuevo encuentro deportivo</p>
              </button>
              <button className="bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-left">
                <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 mb-2" />
                <h4 className="text-sm font-medium text-gray-900">Ver Estadísticas</h4>
                <p className="text-xs text-gray-500">Reportes y análisis</p>
              </button>
            </>
          ) : (
            <>
              <button className="bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-left">
                <PlayIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 mb-2" />
                <h4 className="text-sm font-medium text-gray-900">Mis Partidos</h4>
                <p className="text-xs text-gray-500">Partidos asignados</p>
              </button>
              <button className="bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-left">
                <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 mb-2" />
                <h4 className="text-sm font-medium text-gray-900">Registrar Evento</h4>
                <p className="text-xs text-gray-500">Goles, tarjetas, cambios</p>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardHome