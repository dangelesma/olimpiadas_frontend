import React from 'react';

const CardsStats = ({ cards }) => {
  const yellowCards = cards ? cards.filter(c => c.tipo_evento === 'tarjeta_amarilla') : [];
  const redCards = cards ? cards.filter(c => c.tipo_evento === 'tarjeta_roja') : [];

  if (yellowCards.length === 0 && redCards.length === 0) {
    return <p className="text-center text-gray-500">No hay datos de tarjetas disponibles.</p>;
  }

  return (
    <div>
      {/* Header responsive */}
      <div className="flex items-center justify-center sm:justify-start space-x-3 mb-4 sm:mb-6">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-yellow-500 to-red-500 rounded-xl flex items-center justify-center">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg sm:text-2xl font-bold text-gray-800">Disciplina</h3>
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        {/* Tarjetas Amarillas */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-4 h-4 bg-yellow-500 rounded-sm"></div>
            <h4 className="font-semibold text-base sm:text-lg text-yellow-600">Tarjetas Amarillas</h4>
          </div>
          {yellowCards.length > 0 ? (
            <ul className="space-y-2 sm:space-y-3">
              {yellowCards.slice(0, 5).map((card) => (
                <li key={card.jugador_id} className="flex items-center justify-between bg-yellow-50 hover:bg-yellow-100 p-3 rounded-lg transition-colors duration-200 border border-yellow-200">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{card.jugador.nombre} {card.jugador.apellido}</p>
                    <p className="text-xs text-gray-500 truncate">{card.jugador.equipo.nombre}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-3">
                    <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold min-w-[24px] text-center">
                      {card.total}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500">Sin tarjetas amarillas registradas.</p>
            </div>
          )}
        </div>
        
        {/* Tarjetas Rojas */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
            <h4 className="font-semibold text-base sm:text-lg text-red-600">Tarjetas Rojas</h4>
          </div>
          {redCards.length > 0 ? (
            <ul className="space-y-2 sm:space-y-3">
              {redCards.slice(0, 5).map((card) => (
                <li key={card.jugador_id} className="flex items-center justify-between bg-red-50 hover:bg-red-100 p-3 rounded-lg transition-colors duration-200 border border-red-200">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{card.jugador.nombre} {card.jugador.apellido}</p>
                    <p className="text-xs text-gray-500 truncate">{card.jugador.equipo.nombre}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-3">
                    <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold min-w-[24px] text-center">
                      {card.total}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500">Sin tarjetas rojas registradas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardsStats;