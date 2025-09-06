import React from 'react';
import StandingsTable from './StandingsTable';

const Groups = ({ groups }) => {
  if (!groups || Object.keys(groups).length === 0) {
    return <p>No hay grupos definidos para este torneo.</p>;
  }

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Grupos y Subgrupos</h3>
      <div className="space-y-8">
        {Object.entries(groups).map(([groupName, subgroups]) => (
          <div key={groupName}>
            <h4 className="text-2xl font-semibold text-gray-800 mb-4">{groupName}</h4>
            {Object.entries(subgroups).map(([subgroupName, teams]) => (
              <div key={subgroupName} className="mb-8">
                <h5 className="text-xl font-semibold text-gray-700 mb-2">{subgroupName}</h5>
                <StandingsTable standings={teams} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Groups;