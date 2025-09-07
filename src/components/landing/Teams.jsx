import React, { useState, useMemo } from 'react';
import TeamPlayersModal from './TeamPlayersModal';

const Teams = ({ teams }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);

  const handleTeamClick = (team) => {
    setSelectedTeam(team);
  };

  const handleCloseModal = () => {
    setSelectedTeam(null);
  };

  // Organizar equipos por grupos y subgrupos
  const organizedTeams = useMemo(() => {
    if (!teams || teams.length === 0) return {};

    const grouped = {};
    
    teams.forEach(team => {
      const grupo = team.grupo || 'Sin Grupo';
      const subgrupo = team.subgrupo;
      
      if (!grouped[grupo]) {
        grouped[grupo] = {
          sinSubgrupo: [],
          subgrupos: {}
        };
      }
      
      if (subgrupo) {
        if (!grouped[grupo].subgrupos[subgrupo]) {
          grouped[grupo].subgrupos[subgrupo] = [];
        }
        grouped[grupo].subgrupos[subgrupo].push(team);
      } else {
        grouped[grupo].sinSubgrupo.push(team);
      }
    });
    
    return grouped;
  }, [teams]);

  if (!teams || teams.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">No hay equipos registrados en este torneo.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800">Equipos Participantes</h3>
      </div>

      <div className="space-y-6">
        {Object.entries(organizedTeams).map(([grupo, grupoData]) => (
          <div key={grupo} className="space-y-4">
            {/* Título del grupo */}
            <h4 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">
              Categoría {grupo}
            </h4>
            
            {/* Equipos sin subgrupo */}
            {grupoData.sinSubgrupo.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {grupoData.sinSubgrupo.map(team => (
                  <div
                    key={team.id}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl shadow-md text-center cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 border border-blue-100 hover:border-blue-300"
                    onClick={() => handleTeamClick(team)}
                  >
                    <p className="font-semibold text-gray-700 text-sm leading-tight">
                      PROMOCIÓN {team.nombre}
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Subgrupos */}
            {Object.entries(grupoData.subgrupos).map(([subgrupo, equiposSubgrupo]) => (
              <div key={subgrupo} className="ml-4 space-y-2">
                <h5 className="text-md font-medium text-gray-600">
                  Categoría {grupo}-{subgrupo}
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {equiposSubgrupo.map(team => (
                    <div
                      key={team.id}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl shadow-md text-center cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 border border-green-100 hover:border-green-300"
                      onClick={() => handleTeamClick(team)}
                    >
                      <p className="font-semibold text-gray-700 text-sm leading-tight">
                        PROMOCIÓN {team.nombre}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      
      <TeamPlayersModal team={selectedTeam} onClose={handleCloseModal} />
    </div>
  );
};

export default Teams;