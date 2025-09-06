import React from 'react';

const TournamentSelector = ({ tournaments, selectedTournament, onChange }) => {
  return (
    <div className="max-w-md mx-auto mb-8">
      <select
        id="tournament-select"
        value={selectedTournament}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 text-lg bg-white border-2 border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
      >
        {tournaments.map((tournament) => (
          <option key={tournament.id} value={tournament.id}>
            {tournament.nombre}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TournamentSelector;