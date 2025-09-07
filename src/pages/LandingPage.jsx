import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getPublicTournaments,
  getPublicStandings,
  getPublicTopScorers,
  getPublicCards,
  getPublicMatches,
  getPublicGroupStandings,
  getPublicTeams,
  getPublicStats
} from '../services/api';
import TournamentSelector from '../components/landing/TournamentSelector';
import StandingsTable from '../components/landing/StandingsTable';
import TopScorers from '../components/landing/TopScorers';
import CardsStats from '../components/landing/CardsStats';
import MatchesList from '../components/landing/MatchesList';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          groupsRes,
          teamsRes,
          statsRes
        ] = await Promise.all([
          getPublicStandings(selectedTournament),
          getPublicTopScorers(selectedTournament),
          getPublicCards(selectedTournament),
          getPublicMatches(selectedTournament),
          getPublicGroupStandings(selectedTournament),
          getPublicTeams(selectedTournament),
          getPublicStats(selectedTournament)
        ]);
        setStandings(standingsRes.data.data);
        setTopScorers(scorersRes.data.data);
        setCards(cardsRes.data.data);
        setMatches(matchesRes.data.data);
        setGroups(groupsRes.data.data);
        setTeams(teamsRes.data.data);
        setStats(statsRes.data.data);
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
      {/* Header mejorado */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-75"></div>
                <svg className="relative h-12 w-12 text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.05 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Olimpiadas Santa Edelmira
                </h1>
                <p className="text-sm text-gray-500 font-medium">Sistema de Gestión Deportiva</p>
              </div>
            </div>
            <Link
              to="/login"
              className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-full text-sm font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <span className="relative z-10">Acceso al Sistema</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
              <span className="block">{selectedTournamentName}</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Sigue en tiempo real todos los resultados, estadísticas y clasificaciones de nuestros torneos deportivos
            </p>
          </div>
          
          {/* Tournament Selector mejorado */}
          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <select
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
                className="w-full px-6 py-4 text-lg bg-white/90 backdrop-blur-sm border-2 border-blue-200 rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer hover:shadow-2xl"
              >
                {tournaments.map((tournament) => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.nombre}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Stats Cards Preview */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-blue-100">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.partidos_jugados}</div>
                <div className="text-sm text-gray-600 font-medium">Partidos</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-green-100">
                <div className="text-3xl font-bold text-green-600 mb-2">{stats.total_goles}</div>
                <div className="text-sm text-gray-600 font-medium">Goles</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-purple-100">
                <div className="text-3xl font-bold text-purple-600 mb-2">{stats.promedio_goles_partido}</div>
                <div className="text-sm text-gray-600 font-medium">Promedio</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-orange-100">
                <div className="text-3xl font-bold text-orange-600 mb-2">{teams.length}</div>
                <div className="text-sm text-gray-600 font-medium">Equipos</div>
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
            {/* Vista Todos - Layout mejorado */}
            {selectedMenu === 'Todos' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Columna principal - Posiciones */}
                <div className="xl:col-span-2 space-y-8">
                  {/* Posiciones */}
                  <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-blue-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                    <StandingsTable standings={standings} teams={teams} groups={groups} />
                  </div>

                  {/* Grupos */}
                  {groups.length > 0 && (
                    <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-green-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                      <Groups groups={groups} />
                    </div>
                  )}

                  {/* Partidos */}
                  <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-purple-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                    <MatchesList matches={matches} />
                  </div>
                </div>

                {/* Sidebar - Estadísticas y Rankings */}
                <div className="space-y-6">
                  {/* Estadísticas Generales */}
                  <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-indigo-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                    <Stats stats={stats} />
                  </div>

                  {/* Goleadores */}
                  <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-green-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                    <TopScorers scorers={topScorers} teams={teams} />
                  </div>

                  {/* Tarjetas */}
                  <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-yellow-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                    <CardsStats cards={cards} />
                  </div>

                  {/* Equipos */}
                  <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-blue-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                    <Teams teams={teams} />
                  </div>
                </div>
              </div>
            )}

            {/* Vistas individuales - Layout de ancho completo */}
            {selectedMenu === 'Posiciones' && (
              <div className="max-w-6xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-blue-100 hover:shadow-2xl transition-all duration-500">
                  <StandingsTable standings={standings} teams={teams} groups={groups} />
                </div>
              </div>
            )}

            {selectedMenu === 'Goleadores' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-green-100 hover:shadow-2xl transition-all duration-500">
                  <TopScorers scorers={topScorers} teams={teams} />
                </div>
              </div>
            )}

            {selectedMenu === 'Tarjetas' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-yellow-100 hover:shadow-2xl transition-all duration-500">
                  <CardsStats cards={cards} />
                </div>
              </div>
            )}

            {selectedMenu === 'Partidos' && (
              <div className="max-w-6xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-purple-100 hover:shadow-2xl transition-all duration-500">
                  <MatchesList matches={matches} />
                </div>
              </div>
            )}

            {selectedMenu === 'Equipos' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-blue-100 hover:shadow-2xl transition-all duration-500">
                  <Teams teams={teams} />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Logo y descripción */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.05 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Olimpiadas Santa Edelmira</h3>
              </div>
              <p className="text-blue-100 leading-relaxed">
                Sistema integral de gestión deportiva para el seguimiento de torneos, estadísticas y resultados en tiempo real.
              </p>
            </div>

            {/* Enlaces rápidos */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-blue-200">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">Torneos Activos</a></li>
                <li><a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">Clasificaciones</a></li>
                <li><a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">Estadísticas</a></li>
                <li><Link to="/login" className="text-blue-100 hover:text-white transition-colors duration-200">Acceso al Sistema</Link></li>
              </ul>
            </div>

            {/* Información de contacto */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-blue-200">Información</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-blue-100">Santa Edelmira, Lima</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-blue-100">Lun - Vie: 8:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Línea divisoria */}
          <div className="border-t border-blue-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-blue-200 text-sm">
                © 2024 Olimpiadas Escolares V2. Todos los derechos reservados.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-blue-200 hover:text-white transition-colors duration-200 text-sm">Política de Privacidad</a>
                <a href="#" className="text-blue-200 hover:text-white transition-colors duration-200 text-sm">Términos de Uso</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;