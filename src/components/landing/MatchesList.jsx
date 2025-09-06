import React from 'react';

const MatchesList = ({ matches }) => {
  if (!matches || matches.length === 0) {
    return <p className="text-center text-gray-500">No hay partidos programados para este torneo.</p>;
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Próximos Partidos</h3>
      <div className="space-y-4">
        {matches.filter(m => m.estado !== 'Finalizado').slice(0, 10).map((match) => (
          <div key={match.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-right">
                <p className="font-bold text-lg text-gray-800">{match.equipo_local.nombre}</p>
              </div>
              <div className="mx-4 text-center">
                <p className="text-lg font-semibold text-gray-500">VS</p>
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-lg text-gray-800">{match.equipo_visitante.nombre}</p>
              </div>
            </div>
            <div className="text-center mt-2 text-sm text-gray-500">
              <p>{formatDate(match.fecha_hora)}</p>
              <p>{match.cancha.nombre}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchesList;