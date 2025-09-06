import React from 'react';

const Stats = ({ stats }) => {
  if (!stats) {
    return <p>No hay estadísticas disponibles para este torneo.</p>;
  }

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Estadísticas Generales</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 text-center">
        <div className="bg-blue-50 p-4 rounded-lg shadow-md">
          <p className="text-3xl font-bold text-blue-600">{stats.partidos_jugados}</p>
          <p className="text-gray-600">Partidos Jugados</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow-md">
          <p className="text-3xl font-bold text-green-600">{stats.total_goles}</p>
          <p className="text-gray-600">Goles Anotados</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg shadow-md">
          <p className="text-3xl font-bold text-indigo-600">{stats.promedio_goles_partido}</p>
          <p className="text-gray-600">Goles por Partido</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow-md">
          <p className="text-3xl font-bold text-yellow-600">{stats.total_tarjetas_amarillas}</p>
          <p className="text-gray-600">Tarjetas Amarillas</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow-md">
          <p className="text-3xl font-bold text-red-600">{stats.total_tarjetas_rojas}</p>
          <p className="text-gray-600">Tarjetas Rojas</p>
        </div>
      </div>
    </div>
  );
};

export default Stats;