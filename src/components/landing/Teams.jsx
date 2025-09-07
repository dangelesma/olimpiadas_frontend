import React, { useState, useMemo } from 'react';
import TeamPlayersModal from './TeamPlayersModal';

const Teams = ({ teams }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleTeamClick = (team) => {
    setSelectedTeam(team);
  };

  const handleCloseModal = () => {
    setSelectedTeam(null);
  };

  // Organizar equipos de manera más eficiente
  const organizedTeams = useMemo(() => {
    if (!teams || teams.length === 0) return {};

    const grouped = {};
    
    teams.forEach(team => {
      const grupo = team.grupo || 'Sin Categoría';
      const subgrupo = team.subgrupo;
      
      if (!grouped[grupo]) {
        grouped[grupo] = {
          name: `Categoría ${grupo}`,
          teams: [],
          subgroups: {},
          totalTeams: 0
        };
      }
      
      if (subgrupo) {
        const subgroupKey = `${grupo}-${subgrupo}`;
        if (!grouped[grupo].subgroups[subgroupKey]) {
          grouped[grupo].subgroups[subgroupKey] = {
            name: `${grupo}-${subgrupo}`,
            teams: []
          };
        }
        grouped[grupo].subgroups[subgroupKey].teams.push(team);
        grouped[grupo].totalTeams++;
      } else {
        grouped[grupo].teams.push(team);
        grouped[grupo].totalTeams++;
      }
    });
    
    return grouped;
  }, [teams]);

  // Filtrar por búsqueda
  const filteredTeams = useMemo(() => {
    if (!searchTerm) return organizedTeams;
    
    const filtered = {};
    Object.entries(organizedTeams).forEach(([groupKey, groupData]) => {
      const filteredGroup = {
        ...groupData,
        teams: groupData.teams.filter(team => 
          team.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        subgroups: {}
      };
      
      Object.entries(groupData.subgroups).forEach(([subgroupKey, subgroupData]) => {
        const filteredSubgroup = {
          ...subgroupData,
          teams: subgroupData.teams.filter(team => 
            team.nombre.toLowerCase().includes(searchTerm.toLowerCase())
          )
        };
        
        if (filteredSubgroup.teams.length > 0) {
          filteredGroup.subgroups[subgroupKey] = filteredSubgroup;
        }
      });
      
      if (filteredGroup.teams.length > 0 || Object.keys(filteredGroup.subgroups).length > 0) {
        filtered[groupKey] = filteredGroup;
      }
    });
    
    return filtered;
  }, [organizedTeams, searchTerm]);

  // Categorías para filtro
  const categories = useMemo(() => {
    const cats = [{ key: 'all', label: 'Todas', count: teams?.length || 0 }];
    Object.entries(organizedTeams).forEach(([key, data]) => {
      cats.push({ key, label: `Cat. ${key}`, count: data.totalTeams });
    });
    return cats;
  }, [organizedTeams, teams]);

  // Filtrar por categoría
  const displayData = useMemo(() => {
    if (selectedCategory === 'all') return filteredTeams;
    return selectedCategory in filteredTeams ? { [selectedCategory]: filteredTeams[selectedCategory] } : {};
  }, [filteredTeams, selectedCategory]);

  const getTeamColor = (team) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
      'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
    ];
    return colors[team.nombre.charCodeAt(0) % colors.length];
  };

  const renderCompactTeamGrid = (teamsData, title, isSubgroup = false) => {
    if (!teamsData || teamsData.length === 0) return null;

    return (
      <div className="space-y-3">
        {/* Header compacto */}
        <div className="flex items-center justify-between">
          <h4 className={`text-sm font-semibold ${isSubgroup ? 'text-green-700' : 'text-blue-700'}`}>
            {title}
          </h4>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            isSubgroup ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {teamsData.length}
          </span>
        </div>

        {/* Grid compacto de equipos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {teamsData.map(team => {
            const teamColor = getTeamColor(team);
            
            return (
              <div
                key={team.id}
                className={`group relative bg-white p-3 rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer ${
                  isSubgroup ? 'border-green-200 hover:border-green-300' : 'border-blue-200 hover:border-blue-300'
                } hover:scale-105`}
                onClick={() => handleTeamClick(team)}
              >
                {/* Icono del equipo */}
                <div className="flex flex-col items-center space-y-2">
                  <div className={`w-8 h-8 ${teamColor} rounded-lg flex items-center justify-center shadow-sm`}>
                    <span className="text-white font-bold text-xs">
                      {team.nombre.slice(-2)}
                    </span>
                  </div>
                  
                  {/* Nombre del equipo */}
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-800 leading-tight">
                      {team.nombre}
                    </p>
                    <p className={`text-xs mt-1 px-1.5 py-0.5 rounded-full font-medium ${
                      isSubgroup ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {team.grupo ? `${team.grupo}${team.subgrupo ? `-${team.subgrupo}` : ''}` : 'S/C'}
                    </p>
                  </div>
                </div>

                {/* Hover indicator */}
                <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none"></div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!teams || teams.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay equipos registrados</h3>
        <p className="text-gray-600">Los equipos aparecerán aquí cuando sean añadidos al torneo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Equipos Participantes</h3>
            <p className="text-sm text-gray-600">
              {teams.length} equipos en {Object.keys(organizedTeams).length} categorías
            </p>
          </div>
        </div>

        {/* Controles compactos */}
        <div className="flex items-center space-x-3">
          {/* Búsqueda */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 w-32 sm:w-40 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtro de categoría */}
          {categories.length > 2 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.key} value={cat.key}>
                  {cat.label} ({cat.count})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Contenido */}
      {Object.keys(displayData).length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No se encontraron equipos.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(displayData).map(([groupKey, groupData]) => (
            <div key={groupKey} className="space-y-6">
              {/* Equipos principales del grupo */}
              {groupData.teams && groupData.teams.length > 0 && (
                <div>
                  {renderCompactTeamGrid(
                    groupData.teams, 
                    selectedCategory === 'all' ? groupData.name : `${groupData.name} - Principal`,
                    false
                  )}
                </div>
              )}

              {/* Subgrupos */}
              {Object.entries(groupData.subgroups || {}).map(([subgroupKey, subgroupData]) => (
                <div key={subgroupKey} className="ml-4">
                  {renderCompactTeamGrid(
                    subgroupData.teams, 
                    `Categoría ${subgroupData.name}`, 
                    true
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      
      <TeamPlayersModal team={selectedTeam} onClose={handleCloseModal} />
    </div>
  );
};

export default Teams;