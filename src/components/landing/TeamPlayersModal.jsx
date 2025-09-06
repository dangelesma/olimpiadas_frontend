import React from 'react';

const TeamPlayersModal = ({ team, onClose }) => {
  if (!team) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">{team.nombre}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Jugadores:</h4>
          <ul className="list-disc list-inside">
            {team.jugadores.map(player => (
              <li key={player.id}>{player.nombre} {player.apellido}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TeamPlayersModal;