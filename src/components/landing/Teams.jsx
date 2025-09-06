import React, { useState } from 'react';
import TeamPlayersModal from './TeamPlayersModal';

const Teams = ({ teams }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);

  const handleTeamClick = (team) => {
    setSelectedTeam(team);
  };

  const handleCloseModal = () => {
    setSelectedTeam(null);
  };

  if (!teams || teams.length === 0) {
    return <p>No hay equipos registrados en este torneo.</p>;
  }

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Equipos Participantes</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {teams.map(team => (
          <div
            key={team.id}
            className="bg-white p-4 rounded-lg shadow-md text-center cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300"
            onClick={() => handleTeamClick(team)}
          >
            <p className="font-semibold text-gray-700">{team.nombre}</p>
          </div>
        ))}
      </div>
      <TeamPlayersModal team={selectedTeam} onClose={handleCloseModal} />
    </div>
  );
};

export default Teams;