import React, { useState, useMemo } from 'react';

const StandingsTable = ({ standings, teams = [], groups = [], groupStandings = {} }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Procesar datos de manera más eficiente usando groupStandings del backend
  const processedData = useMemo(() => {
    const organized = {};
    
    // Si tenemos datos de groupStandings del backend, usarlos
    if (groupStandings && Object.keys(groupStandings).length > 0) {
      Object.entries(groupStandings).forEach(([groupKey, groupData]) => {
        const categoryName = groupKey === 'sin_grupo' ? 'General' : groupKey;
        
        if (!organized[categoryName]) {
          organized[categoryName] = {
            name: `Categoría ${categoryName}`,
            general: [],
            subgroups: {},
            totalTeams: 0
          };
        }
        
        // Procesar subgrupos
        Object.entries(groupData).forEach(([subgroupKey, subgroupTeams]) => {
          if (subgroupKey === 'sin_subgrupo') {
            // Equipos sin subgrupo van al grupo principal
            organized[categoryName].general = subgroupTeams || [];
            organized[categoryName].totalTeams += (subgroupTeams || []).length;
          } else {
            // Equipos con subgrupo
            organized[categoryName].subgroups[subgroupKey] = {
              name: `${categoryName}-${subgroupKey}`,
              teams: subgroupTeams || []
            };
            organized[categoryName].totalTeams += (subgroupTeams || []).length;
          }
        });
      });
    } else if (groups && groups.length > 0) {
      // Fallback con groups (formato anterior)
      groups.forEach(groupData => {
        const groupKey = groupData.grupo || 'General';
        
        if (!organized[groupKey]) {
          organized[groupKey] = {
            name: `Categoría ${groupKey}`,
            general: [],
            subgroups: {},
            totalTeams: 0
          };
        }
        
        // Equipos del grupo principal
        if (groupData.equipos && groupData.equipos.length > 0) {
          organized[groupKey].general = groupData.equipos;
          organized[groupKey].totalTeams += groupData.equipos.length;
        }
        
        // Procesar subgrupos
        if (groupData.subgrupos && typeof groupData.subgrupos === 'object') {
          Object.values(groupData.subgrupos).forEach(subgroupData => {
            const subgroupKey = subgroupData.subgrupo;
            organized[groupKey].subgroups[subgroupKey] = {
              name: `${groupKey}-${subgroupData.subgrupo}`,
              teams: subgroupData.equipos || []
            };
            organized[groupKey].totalTeams += (subgroupData.equipos || []).length;
          });
        }
      });
    } else if (standings && standings.length > 0) {
      // Fallback con standings
      organized['General'] = {
        name: 'Clasificación General',
        general: standings,
        subgroups: {},
        totalTeams: standings.length
      };
    }
    
    return organized;
  }, [standings, teams, groups, groupStandings]);

  // Obtener categorías disponibles ordenadas alfabéticamente
  const categories = useMemo(() => {
    const cats = [{ key: 'all', label: 'Todas las Categorías', count: Object.values(processedData).reduce((acc, cat) => acc + cat.totalTeams, 0) }];
    
    // Ordenar las categorías alfabéticamente
    const sortedEntries = Object.entries(processedData).sort(([keyA], [keyB]) => {
      // Extraer la letra de la categoría para ordenar A, B, C, etc.
      const categoryA = keyA.replace('Categoría ', '').replace('General', 'ZZ'); // General al final
      const categoryB = keyB.replace('Categoría ', '').replace('General', 'ZZ');
      return categoryA.localeCompare(categoryB);
    });
    
    sortedEntries.forEach(([key, data]) => {
      cats.push({ key, label: data.name, count: data.totalTeams });
    });
    
    return cats;
  }, [processedData]);

  // Filtrar por categoría y ordenar alfabéticamente
  const displayData = useMemo(() => {
    if (selectedCategory === 'all') {
      // Ordenar las categorías alfabéticamente para la vista "Todos"
      const sortedData = {};
      const sortedKeys = Object.keys(processedData).sort((a, b) => {
        const categoryA = a.replace('Categoría ', '').replace('General', 'ZZ');
        const categoryB = b.replace('Categoría ', '').replace('General', 'ZZ');
        return categoryA.localeCompare(categoryB);
      });
      
      sortedKeys.forEach(key => {
        sortedData[key] = processedData[key];
      });
      
      return sortedData;
    }
    return selectedCategory in processedData ? { [selectedCategory]: processedData[selectedCategory] } : {};
  }, [processedData, selectedCategory]);

  const getPositionBadge = (position) => {
    const baseClass = "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold";
    
    if (position === 1) {
      return <div className={`${baseClass} bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-md`}>1</div>;
    } else if (position === 2) {
      return <div className={`${baseClass} bg-gradient-to-r from-gray-300 to-gray-400 text-white shadow-md`}>2</div>;
    } else if (position === 3) {
      return <div className={`${baseClass} bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md`}>3</div>;
    } else {
      return <div className={`${baseClass} bg-gray-100 text-gray-700 border border-gray-200`}>{position}</div>;
    }
  };

  const renderCompactTable = (teamsData, title, isSubgroup = false) => {
    if (!teamsData || teamsData.length === 0) return null;

    const sortedTeams = [...teamsData].sort((a, b) => {
      // Usar los nuevos campos si están disponibles, sino usar los antiguos
      const ptsA = a.pts || a.puntos || 0;
      const ptsB = b.pts || b.puntos || 0;
      const dgA = a.dg || a.diferencia_goles || 0;
      const dgB = b.dg || b.diferencia_goles || 0;
      const gfA = a.gf || a.goles_favor || 0;
      const gfB = b.gf || b.goles_favor || 0;
      
      if (ptsB !== ptsA) return ptsB - ptsA;
      if (dgB !== dgA) return dgB - dgA;
      return gfB - gfA;
    });

    // Mostrar todos los equipos
    const displayTeams = sortedTeams;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className={`px-3 py-2 border-b border-gray-100 ${
          isSubgroup ? 'bg-green-50' : 'bg-blue-50'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-semibold text-sm ${isSubgroup ? 'text-green-800' : 'text-blue-800'}`}>
              {title}
            </h4>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              isSubgroup ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {sortedTeams.length} equipos
            </span>
          </div>
        </div>

        {/* Tabla con scroll horizontal */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            {/* Headers de la tabla */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wide min-w-[50px]">POS</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wide min-w-[150px]">EQUIPO</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wide min-w-[50px]">PJ</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wide min-w-[50px]">G</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wide min-w-[50px]">E</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wide min-w-[50px]">P</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wide min-w-[50px]">GF</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wide min-w-[50px]">GC</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wide min-w-[50px]">DG</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wide min-w-[60px]">PTS</th>
              </tr>
            </thead>

            {/* Filas de la tabla */}
            <tbody className="divide-y divide-gray-50">
              {displayTeams.map((team, index) => {
                const position = (team.pos !== undefined) ? team.pos : index + 1;
                const isTop3 = position <= 3;
                
                // Usar nuevos campos si están disponibles, sino usar los antiguos
                const pj = team.pj || team.partidos_jugados || 0;
                const g = team.g || team.victorias || 0;
                const e = team.e || team.empates || 0;
                const p = team.p || team.derrotas || 0;
                const gf = team.gf || team.goles_favor || 0;
                const gc = team.gc || team.goles_contra || 0;
                const dg = team.dg || team.diferencia_goles || 0;
                const pts = team.pts || team.puntos || 0;
                
                return (
                  <tr key={team.equipo} className="hover:bg-gray-50 transition-colors">
                    {/* Posición */}
                    <td className="px-3 py-3 text-center">
                      {position <= 2 ? getPositionBadge(position) : (
                        <div className="w-7 h-7 flex items-center justify-center text-sm font-medium text-gray-700">
                          {position}
                        </div>
                      )}
                    </td>

                    {/* Equipo */}
                    <td className="px-3 py-3">
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                          isSubgroup ? 'bg-green-500' : 'bg-blue-500'
                        }`}>
                          {team.equipo.toString().slice(-2)}
                        </div>
                        <span className="font-medium text-gray-800 text-sm">
                          {team.equipo}
                        </span>
                      </div>
                    </td>

                    {/* PJ */}
                    <td className="px-3 py-3 text-center text-sm text-gray-700 font-medium">
                      {pj}
                    </td>

                    {/* G */}
                    <td className="px-3 py-3 text-center text-sm text-green-600 font-medium">
                      {g}
                    </td>

                    {/* E */}
                    <td className="px-3 py-3 text-center text-sm text-yellow-600 font-medium">
                      {e}
                    </td>

                    {/* P */}
                    <td className="px-3 py-3 text-center text-sm text-red-600 font-medium">
                      {p}
                    </td>

                    {/* GF */}
                    <td className="px-3 py-3 text-center text-sm text-gray-700 font-medium">
                      {gf}
                    </td>

                    {/* GC */}
                    <td className="px-3 py-3 text-center text-sm text-gray-700 font-medium">
                      {gc}
                    </td>

                    {/* DG */}
                    <td className="px-3 py-3 text-center">
                      <span className={`text-sm font-medium ${
                        dg > 0 ? 'text-green-600' :
                        dg < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {dg > 0 ? '+' : ''}{dg}
                      </span>
                    </td>

                    {/* PTS */}
                    <td className="px-3 py-3 text-center">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-bold ${
                        position <= 2
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {pts}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (Object.keys(processedData).length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay datos disponibles</h3>
        <p className="text-gray-600">Los datos de posiciones aparecerán cuando se jueguen los partidos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header compacto con controles - Responsive */}
      <div className="flex flex-col gap-4">
        {/* Título */}
        <div className="flex items-center justify-center sm:justify-start space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">Tabla de Posiciones</h3>
        </div>

        {/* Controles - Stack en móvil, inline en desktop */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-center lg:justify-start">
          {/* Filtro de categoría */}
          {categories.length > 2 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
      <div className="space-y-6">
        {Object.entries(displayData).map(([groupKey, groupData]) => (
          <div key={groupKey} className="space-y-4">
            {/* Tabla general del grupo */}
            {groupData.general && groupData.general.length > 0 && (
              <div>
                {renderCompactTable(
                  groupData.general, 
                  selectedCategory === 'all' ? groupData.name : `${groupData.name} - General`,
                  false
                )}
              </div>
            )}

            {/* Subgrupos - Solo vista separada */}
            {Object.entries(groupData.subgroups || {}).map(([subgroupKey, subgroupData]) => (
              <div key={subgroupKey}>
                {renderCompactTable(subgroupData.teams, `Categoría ${subgroupData.name}`, true)}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Leyenda completa */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3 text-xs text-gray-600">
          <div><span className="font-semibold">POS:</span> Posición</div>
          <div><span className="font-semibold">PJ:</span> Partidos Jugados</div>
          <div><span className="font-semibold">G:</span> Ganados</div>
          <div><span className="font-semibold">E:</span> Empatados</div>
          <div><span className="font-semibold">P:</span> Perdidos</div>
          <div><span className="font-semibold">GF:</span> Goles a Favor</div>
          <div><span className="font-semibold">GC:</span> Goles en Contra</div>
          <div><span className="font-semibold">DG:</span> Dif. Goles</div>
          <div><span className="font-semibold">PTS:</span> Puntos</div>
        </div>
      </div>
    </div>
  );
};

export default StandingsTable;