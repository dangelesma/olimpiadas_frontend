import React from 'react';
import StandingsTable from './StandingsTable';

const Groups = ({ groups }) => {
  // Comprobar si 'groups' es un array y tiene elementos
  if (!Array.isArray(groups) || groups.length === 0) {
    return <p>No hay grupos o tabla de posiciones disponibles para este torneo.</p>;
  }

  return (
    <div className="space-y-8">
      {groups.map((groupData, index) => (
        <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Grupo {groupData.grupo}
          </h3>

          {/* Tabla para equipos del grupo principal */}
          {groupData.equipos && groupData.equipos.length > 0 && (
            <StandingsTable standings={groupData.equipos} />
          )}

          {/* Tablas para subgrupos */}
          {groupData.subgrupos && typeof groupData.subgrupos === 'object' && Object.keys(groupData.subgrupos).length > 0 && (
            <div className="mt-6 space-y-6">
              {Object.values(groupData.subgrupos).map((subgroup, subIndex) => (
                <div key={subIndex}>
                  <h4 className="text-xl font-semibold text-gray-700 mb-2">
                    Subgrupo {groupData.grupo}-{subgroup.subgrupo}
                  </h4>
                  <StandingsTable standings={subgroup.equipos} />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Groups;