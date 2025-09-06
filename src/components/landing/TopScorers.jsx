import React from 'react';

const TopScorers = ({ scorers }) => {
  if (!scorers || scorers.length === 0) {
    return <p className="text-center text-gray-500">No hay datos de goleadores disponibles.</p>;
  }

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Máximos Goleadores</h3>
      <ul className="space-y-4">
        {scorers.slice(0, 10).map((scorer, index) => (
          <li key={scorer.jugador_id} className="flex items-center bg-gray-50 p-3 rounded-lg">
            <span className="text-lg font-bold text-gray-500 w-8">{index + 1}.</span>
            <div className="ml-4">
              <p className="text-md font-semibold text-gray-900">{scorer.jugador.nombre} {scorer.jugador.apellido}</p>
              <p className="text-sm text-gray-500">{scorer.jugador.equipo.nombre}</p>
            </div>
            <span className="ml-auto text-lg font-bold text-blue-600">{scorer.total_goles} goles</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopScorers;