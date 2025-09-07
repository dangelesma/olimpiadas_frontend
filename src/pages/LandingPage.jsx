import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getPublicTournaments,
  getPublicStandings,
  getPublicTopScorers,
  getPublicCards,
  getPublicMatches,
  getPublicMatchesByDate,
  getPublicGroupStandings,
  getPublicTeams,
  getPublicStats
} from '../services/api';
import TournamentSelector from '../components/landing/TournamentSelector';
import StandingsTable from '../components/landing/StandingsTable';
import TopScorers from '../components/landing/TopScorers';
import CardsStats from '../components/landing/CardsStats';
import MatchesList from '../components/landing/MatchesList';
import MatchesByDate from '../components/landing/MatchesByDate';
import Loading from '../components/Loading';
import Groups from '../components/landing/Groups';
import Teams from '../components/landing/Teams';
import Stats from '../components/landing/Stats';
import Menu from '../components/landing/Menu';

const LandingPage = () => {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [selectedMenu, setSelectedMenu] = useState('Todos');
  const [standings, setStandings] = useState([]);
  const [topScorers, setTopScorers] = useState([]);
  const [cards, setCards] = useState([]);
  const [matches, setMatches] = useState([]);
  const [groups, setGroups] = useState([]);
  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState(null);
  const [groupStandings, setGroupStandings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFixtureModalOpen, setIsFixtureModalOpen] = useState(false);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await getPublicTournaments();
        const activeTournaments = response.data.data.filter(t => t.estado !== 'Finalizado');
        setTournaments(activeTournaments);
        if (activeTournaments.length > 0) {
          setSelectedTournament(activeTournaments[0].id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError('No se pudieron cargar los torneos.');
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (!selectedTournament) return;

    const fetchTournamentData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          standingsRes,
          scorersRes,
          cardsRes,
          matchesRes,
          groupStandingsRes,
          teamsRes,
          statsRes
        ] = await Promise.all([
          getPublicStandings(selectedTournament),
          getPublicTopScorers(selectedTournament),
          getPublicCards(selectedTournament),
          getPublicMatchesByDate(selectedTournament),
          getPublicGroupStandings(selectedTournament),
          getPublicTeams(selectedTournament),
          getPublicStats(selectedTournament)
        ]);
        setStandings(standingsRes.data.data);
        setTopScorers(scorersRes.data.data);
        setCards(cardsRes.data.data);
        const allMatches = matchesRes.data.data.flatMap(fecha => fecha.partidos);
        setMatches(allMatches);
        setGroups(groupStandingsRes.data.data); // Usar groupStandings para groups también
        setTeams(teamsRes.data.data);
        setStats(statsRes.data.data);
        setGroupStandings(groupStandingsRes.data.data);
      } catch (err) {
        setError('No se pudieron cargar los datos del torneo.');
      } finally {
        setLoading(false);
      }
    };
    fetchTournamentData();
  }, [selectedTournament]);

  const selectedTournamentName = tournaments.find(t => t.id === parseInt(selectedTournament))?.nombre || 'Resultados';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans">
      {/* Header mejorado - Responsive */}

      {/* Hero Section - Responsive */}
      <section className="relative overflow-hidden py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="mb-6 sm:mb-8">
            {/* Logo centrado en tamaño completo */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="Logo Olimpiadas Santa Edelmira"
                  className="max-w-full h-auto shadow-2xl rounded-lg"
                />
              </div>
            </div>
          </div>
          
          {/* Tournament Selector mejorado - Responsive */}
          <div className="max-w-sm sm:max-w-md mx-auto mb-8 sm:mb-12 px-4">
            <div className="relative">
              <select
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg bg-white/90 backdrop-blur-sm border-2 border-blue-200 rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer hover:shadow-2xl"
              >
                {tournaments.map((tournament) => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.nombre}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 pointer-events-none">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Botón para ver el fixture */}
          <div className="my-6 sm:my-8">
            <button
              onClick={() => setIsFixtureModalOpen(true)}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-3 sm:py-4 px-8 sm:px-12 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out text-base sm:text-lg"
            >
              Ver Fixture del Torneo
            </button>
          </div>

          {/* Stats Cards Preview - Responsive */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto mb-8 sm:mb-12 px-4">
              <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-6 rounded-2xl shadow-lg border border-blue-100">
                <div className="text-xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">{stats.partidos_jugados}</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">Partidos Jugados</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-6 rounded-2xl shadow-lg border border-green-100">
                <div className="text-xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">{stats.total_goles}</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">Goles</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-6 rounded-2xl shadow-lg border border-orange-100">
                <div className="text-xl sm:text-3xl font-bold text-orange-600 mb-1 sm:mb-2">{teams.length}</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">Equipos</div>
              </div>
            </div>
          )}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Menu selected={selectedMenu} setSelected={setSelectedMenu} />

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 p-6 rounded-2xl text-center shadow-lg">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* No Tournaments State */}
        {!selectedTournament && !loading && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-8 rounded-2xl text-center shadow-lg">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-yellow-800 mb-2">No hay torneos activos</h3>
              <p className="text-yellow-700">En este momento no hay torneos disponibles para mostrar.</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && selectedTournament && (
          <div className="space-y-8">
            {/* Vista Todos - Layout mejorado y responsive */}
            {selectedMenu === 'Todos' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                {/* Columna principal - Posiciones */}
                <div className="xl:col-span-2 space-y-6 lg:space-y-8">
                  {/* Posiciones */}
                  <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-xl border border-blue-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                    <StandingsTable standings={standings} teams={teams} groups={groups} groupStandings={groupStandings} />
                  </div>

                  {/* Grupos */}
                  {groups.length > 0 && (
                    <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-xl border border-green-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                      <Groups groups={groups} />
                    </div>
                  )}

                  {/* Partidos */}
                  <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-xl border border-purple-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                    <MatchesList matches={matches} />
                  </div>
                </div>

                {/* Sidebar - Estadísticas y Rankings */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Estadísticas Generales */}
                  <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 rounded-2xl lg:rounded-3xl shadow-xl border border-indigo-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                    <Stats stats={stats} />
                  </div>

                  {/* Goleadores */}
                  <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 rounded-2xl lg:rounded-3xl shadow-xl border border-green-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                    <TopScorers scorers={topScorers} teams={teams} />
                  </div>

                  {/* Tarjetas */}
                  <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 rounded-2xl lg:rounded-3xl shadow-xl border border-yellow-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                    <CardsStats cards={cards} />
                  </div>
                </div>
              </div>
            )}

            {/* Vistas individuales - Layout responsive */}
            {selectedMenu === 'Posiciones' && (
              <div className="max-w-6xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-xl border border-blue-100 hover:shadow-2xl transition-all duration-500">
                  <StandingsTable standings={standings} teams={teams} groups={groups} groupStandings={groupStandings} />
                </div>
              </div>
            )}

            {selectedMenu === 'Goleadores' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-xl border border-green-100 hover:shadow-2xl transition-all duration-500">
                  <TopScorers scorers={topScorers} teams={teams} />
                </div>
              </div>
            )}

            {selectedMenu === 'Tarjetas' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-xl border border-yellow-100 hover:shadow-2xl transition-all duration-500">
                  <CardsStats cards={cards} />
                </div>
              </div>
            )}

            {selectedMenu === 'Partidos' && (
              <div className="max-w-6xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-xl border border-purple-100 hover:shadow-2xl transition-all duration-500">
                  <MatchesList matches={matches} />
                </div>
              </div>
            )}

            {selectedMenu === 'Equipos' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-xl border border-blue-100 hover:shadow-2xl transition-all duration-500">
                  <Teams teams={teams} />
                </div>
              </div>
            )}

            {selectedMenu === 'Fechas' && (
              <div className="max-w-6xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-xl border border-indigo-100 hover:shadow-2xl transition-all duration-500">
                  <MatchesByDate torneoId={selectedTournament} />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer mejorado */}
      <footer className="relative mt-20 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Logo */}
            <div className="flex justify-center md:justify-start">
              <img src="/logobon.png" alt="Bon Elektroniks Logo" className="h-48"/>
            </div>

            {/* Información de contacto */}
            <div className="space-y-4 text-center md:text-left">
              <h4 className="text-lg font-semibold text-blue-200">Contacto</h4>
              <div className="space-y-3 inline-block text-left">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9"></path></svg>
                  <a href="https://bonelektroniks.com" target="_blank" rel="noopener noreferrer" className="text-blue-100 hover:text-white transition-colors duration-200">bonelektroniks.com</a>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  <span className="text-blue-100">999 393 662</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-blue-100">Manco Capac 464 - Vista Alegre</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </footer>

      {/* Modal para ver el Fixture */}
      {isFixtureModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
          onClick={() => setIsFixtureModalOpen(false)}
        >
          <div
            className="relative bg-white p-2 rounded-lg shadow-2xl max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src="/fixture.png"
              alt="Fixture del Torneo"
              className="w-full h-auto rounded"
            />
            <button
              onClick={() => setIsFixtureModalOpen(false)}
              className="absolute -top-4 -right-4 bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold hover:bg-red-700 transition-colors shadow-lg"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;