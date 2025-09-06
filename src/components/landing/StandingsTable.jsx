import React from 'react';

const StandingsTable = ({ standings }) => {
  if (!standings || standings.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">No hay datos de posiciones disponibles para este torneo.</p>
      </div>
    );
  }

  const getPositionBadge = (position) => {
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
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800">Tabla de Posiciones</h3>
      </div>

      <div className="overflow-x-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
            <div className="grid grid-cols-10 gap-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-3">Equipo</div>
              <div className="col-span-1 text-center">PJ</div>
              <div className="col-span-1 text-center">PG</div>
              <div className="col-span-1 text-center">PE</div>
              <div className="col-span-1 text-center">PP</div>
              <div className="col-span-1 text-center">DG</div>
              <div className="col-span-1 text-center">Pts</div>
            </div>
          </div>

          {/* Body */}
          <div className="divide-y divide-gray-100">
            {standings.map((team, index) => {
              const position = index + 1;
              const isTopThree = position <= 3;
              
              return (
                <div
                  key={team.equipo}
                  className={`group px-6 py-4 hover:bg-blue-50 transition-all duration-200 ${
                    isTopThree ? 'bg-gradient-to-r from-blue-25 to-indigo-25' : ''
                  }`}
                >
                  <div className="grid grid-cols-10 gap-4 items-center">
                    {/* Posición */}
                    <div className="col-span-1 flex justify-center">
                      {getPositionBadge(position)}
                    </div>

                    {/* Equipo */}
                    <div className="col-span-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className={`font-semibold ${isTopThree ? 'text-gray-900' : 'text-gray-800'}`}>
                            {team.equipo}
                          </p>
                          {isTopThree && (
                            <p className="text-xs text-blue-600 font-medium">
                              {position === 1 ? 'Líder' : position === 2 ? 'Segundo' : 'Tercero'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="col-span-1 text-center">
                      <span className="text-sm font-medium text-gray-700">{team.partidos_jugados}</span>
                    </div>
                    <div className="col-span-1 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {team.victorias}
                      </span>
                    </div>
                    <div className="col-span-1 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {team.empates}
                      </span>
                    </div>
                    <div className="col-span-1 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {team.derrotas}
                      </span>
                    </div>
                    <div className="col-span-1 text-center">
                      <span className={`text-sm font-semibold ${
                        team.diferencia_goles > 0 ? 'text-green-600' :
                        team.diferencia_goles < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {team.diferencia_goles > 0 ? '+' : ''}{team.diferencia_goles}
                      </span>
                    </div>
                    <div className="col-span-1 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                        isTopThree
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {team.puntos}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leyenda */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <span className="font-medium">PJ:</span>
            <span>Partidos Jugados</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-medium">PG:</span>
            <span>Partidos Ganados</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-medium">PE:</span>
            <span>Partidos Empatados</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-medium">PP:</span>
            <span>Partidos Perdidos</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-medium">DG:</span>
            <span>Diferencia de Goles</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-medium">Pts:</span>
            <span>Puntos</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandingsTable;