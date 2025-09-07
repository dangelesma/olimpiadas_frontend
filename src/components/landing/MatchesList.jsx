import React from 'react';

const MatchesList = ({ matches }) => {
  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">No hay partidos programados para este torneo.</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return {
        date: 'Hoy',
        time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        isToday: true
      };
    } else if (diffDays === 1) {
      return {
        date: 'Mañana',
        time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        isTomorrow: true
      };
    } else {
      return {
        date: date.toLocaleDateString('es-ES', {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        }),
        time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        isUpcoming: diffDays > 0
      };
    }
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'Programado':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Programado
          </span>
        );
      case 'En Curso':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            En Vivo
          </span>
        );
      case 'Finalizado':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Finalizado
          </span>
        );
      default:
        return null;
    }
  };

  const upcomingMatches = matches.filter(m => m.estado !== 'Finalizado').slice(0, 10);

  return (
    <div>
      {/* Header responsive */}
      <div className="flex items-center justify-center sm:justify-start space-x-3 mb-4 sm:mb-6">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg sm:text-2xl font-bold text-gray-800">Próximos Partidos</h3>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        {upcomingMatches.map((match) => {
          const dateInfo = formatDate(match.fecha_hora);
          
          return (
            <div
              key={match.id}
              className="group relative bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-blue-300"
            >
              {/* Status Badge y Próximamente */}
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                {getStatusBadge(match.estado)}
                {(dateInfo.isToday || dateInfo.isTomorrow) && (
                  <div className="flex items-center space-x-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>¡Próximamente!</span>
                  </div>
                )}
              </div>

              {/* Equipos - Diseño compacto */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                {/* Equipo Local */}
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-sm">
                    {match.equipo_local.nombre.slice(-2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm sm:text-base text-gray-800 truncate">{match.equipo_local.nombre}</p>
                    <p className="text-xs text-blue-600 font-medium">Local</p>
                  </div>
                </div>

                {/* VS - Más compacto */}
                <div className="px-3 sm:px-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-bold text-gray-600">VS</span>
                  </div>
                </div>

                {/* Equipo Visitante */}
                <div className="flex items-center space-x-3 flex-1 min-w-0 flex-row-reverse">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-sm">
                    {match.equipo_visitante.nombre.slice(-2)}
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="font-bold text-sm sm:text-base text-gray-800 truncate">{match.equipo_visitante.nombre}</p>
                    <p className="text-xs text-red-600 font-medium">Visitante</p>
                  </div>
                </div>
              </div>

              {/* Información del partido - Más compacta */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">{dateInfo.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{dateInfo.time}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-600">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium truncate">{match.cancha.nombre}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MatchesList;