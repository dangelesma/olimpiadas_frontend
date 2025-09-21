import React, { useMemo } from 'react';

const TopScorers = ({ scorers, teams = [], showAll = false }) => {
  // Usar todos los goleadores sin filtrado por categoría
  const filteredScorers = useMemo(() => {
    if (!scorers || scorers.length === 0) return [];
    return scorers;
  }, [scorers]);

  if (!scorers || scorers.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">No hay datos de goleadores disponibles.</p>
      </div>
    );
  }

  const getPositionIcon = (position) => {
    if (position === 1) {
      return (
        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 9.101c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
      );
    } else if (position === 2) {
      return (
        <div className="w-8 h-8 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-sm">2</span>
        </div>
      );
    } else if (position === 3) {
      return (
        <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-sm">3</span>
        </div>
      );
    } else {
      return (
        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-sm">{position}</span>
        </div>
      );
    }
  };

  return (
    <div>
      {/* Header responsive - Sin filtro */}
      <div className="flex items-center justify-center sm:justify-start space-x-3 mb-6">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-lg sm:text-2xl font-bold text-gray-800">Máximos Goleadores</h3>
      </div>
      
      {/* Lista responsive */}
      <div className="space-y-2 sm:space-y-3">
        {(showAll ? filteredScorers : filteredScorers.slice(0, 10)).map((scorer, index) => {
          const position = index + 1;
          const isTopThree = position <= 3;
          
          return (
            <div
              key={scorer.jugador_id}
              className={`group relative flex items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${
                isTopThree
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100'
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {/* Posición */}
              <div className="flex-shrink-0 mr-3 sm:mr-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8">
                  {position === 1 ? (
                    <div className="w-full h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 9.101c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                  ) : position === 2 ? (
                    <div className="w-full h-full bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xs sm:text-sm">2</span>
                    </div>
                  ) : position === 3 ? (
                    <div className="w-full h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xs sm:text-sm">3</span>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xs sm:text-sm">{position}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Información del jugador */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <p className={`font-semibold truncate text-sm sm:text-base ${
                    isTopThree ? 'text-gray-900' : 'text-gray-800'
                  }`}>
                    {scorer.jugador.nombre} {scorer.jugador.apellido}
                  </p>
                  {position === 1 && (
                    <div className="flex-shrink-0 hidden sm:block">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 9.101c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 truncate flex items-center space-x-1">
                  <svg className="w-2 h-2 sm:w-3 sm:h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="truncate">PROMOCIÓN {scorer.jugador.equipo.nombre}</span>
                </p>
              </div>

              {/* Goles */}
              <div className="flex-shrink-0 text-right">
                <div className={`inline-flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${
                  isTopThree
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>{scorer.total_goles}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                  {scorer.total_goles === 1 ? 'gol' : 'goles'}
                </p>
              </div>

              {/* Efecto de brillo en hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl sm:rounded-2xl pointer-events-none"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopScorers;