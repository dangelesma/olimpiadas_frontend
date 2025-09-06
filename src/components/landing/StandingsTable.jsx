import React from 'react';

const StandingsTable = ({ standings }) => {
  if (!standings || standings.length === 0) {
    return <p className="text-center text-gray-500">No hay datos de posiciones disponibles para este torneo.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Tabla de Posiciones</h3>
      <table className="min-w-full bg-white rounded-lg shadow-md">
        <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
          <tr>
            <th className="py-3 px-6 text-left">#</th>
            <th className="py-3 px-6 text-left">Equipo</th>
            <th className="py-3 px-6 text-center">PJ</th>
            <th className="py-3 px-6 text-center">PG</th>
            <th className="py-3 px-6 text-center">PE</th>
            <th className="py-3 px-6 text-center">PP</th>
            <th className="py-3 px-6 text-center">GF</th>
            <th className="py-3 px-6 text-center">GC</th>
            <th className="py-3 px-6 text-center">DG</th>
            <th className="py-3 px-6 text-center">Puntos</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {standings.map((team, index) => (
            <tr key={team.equipo} className="border-b border-gray-200 hover:bg-gray-100">
              <td className="py-3 px-6 text-left whitespace-nowrap">
                <div className="flex items-center">
                  <span className="font-medium">{index + 1}</span>
                </div>
              </td>
              <td className="py-3 px-6 text-left">
                <div className="flex items-center">
                  <span className="font-medium">{team.equipo}</span>
                </div>
              </td>
              <td className="py-3 px-6 text-center">{team.partidos_jugados}</td>
              <td className="py-3 px-6 text-center">{team.victorias}</td>
              <td className="py-3 px-6 text-center">{team.empates}</td>
              <td className="py-3 px-6 text-center">{team.derrotas}</td>
              <td className="py-3 px-6 text-center">{team.goles_favor}</td>
              <td className="py-3 px-6 text-center">{team.goles_contra}</td>
              <td className="py-3 px-6 text-center">{team.diferencia_goles}</td>
              <td className="py-3 px-6 text-center font-bold">{team.puntos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StandingsTable;