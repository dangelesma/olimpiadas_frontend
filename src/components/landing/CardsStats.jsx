import React from 'react';

const CardsStats = ({ cards }) => {
  const yellowCards = cards ? cards.filter(c => c.tipo_evento === 'tarjeta_amarilla') : [];
  const redCards = cards ? cards.filter(c => c.tipo_evento === 'tarjeta_roja') : [];

  if (yellowCards.length === 0 && redCards.length === 0) {
    return <p className="text-center text-gray-500">No hay datos de tarjetas disponibles.</p>;
  }

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Disciplina</h3>
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-lg mb-2 text-yellow-500">Tarjetas Amarillas</h4>
          {yellowCards.length > 0 ? (
            <ul className="space-y-3">
              {yellowCards.slice(0, 5).map((card) => (
                <li key={card.jugador_id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{card.jugador.nombre} {card.jugador.apellido}</p>
                    <p className="text-xs text-gray-500">{card.jugador.equipo.nombre}</p>
                  </div>
                  <span className="font-bold text-yellow-500">{card.total}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-gray-500">Sin tarjetas amarillas.</p>}
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-2 text-red-500">Tarjetas Rojas</h4>
          {redCards.length > 0 ? (
            <ul className="space-y-3">
              {redCards.slice(0, 5).map((card) => (
                <li key={card.jugador_id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{card.jugador.nombre} {card.jugador.apellido}</p>
                    <p className="text-xs text-gray-500">{card.jugador.equipo.nombre}</p>
                  </div>
                  <span className="font-bold text-red-500">{card.total}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-gray-500">Sin tarjetas rojas.</p>}
        </div>
      </div>
    </div>
  );
};

export default CardsStats;