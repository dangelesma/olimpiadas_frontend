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
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <svg className="h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.05 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <h1 className="text-2xl font-bold text-gray-800">Olimpiadas Santa Edelmira</h1>
            </div>
            <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">
              Acceso al Sistema
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">{selectedTournamentName}</h2>
          <p className="mt-3 text-lg text-gray-600">Resultados y estadísticas en vivo del torneo.</p>
        </div>
        
        <div className="mb-8">
          <TournamentSelector
            tournaments={tournaments}
            selectedTournament={selectedTournament}
            onChange={setSelectedTournament}
          />
        </div>

        <Menu selected={selectedMenu} setSelected={setSelectedMenu} />

        {loading && <div className="flex justify-center items-center h-64"><Loading /></div>}
        {error && <p className="text-red-600 bg-red-100 p-4 rounded-lg text-center shadow-md">{error}</p>}
        {!selectedTournament && !loading && <p className="text-gray-600 bg-yellow-100 p-4 rounded-lg text-center shadow-md">No hay torneos activos en este momento.</p>}

        {!loading && !error && selectedTournament && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {(selectedMenu === 'Todos' || selectedMenu === 'Posiciones') && (
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  <StandingsTable standings={standings} />
                </div>
              )}
              {(selectedMenu === 'Todos' || selectedMenu === 'Posiciones') && (
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  <Groups groups={groups} />
                </div>
              )}
              {(selectedMenu === 'Todos' || selectedMenu === 'Partidos') && (
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  <MatchesList matches={matches} />
                </div>
              )}
            </div>
            <div className="space-y-8">
              {(selectedMenu === 'Todos' || selectedMenu === 'Estadisticas') && (
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  <Stats stats={stats} />
                </div>
              )}
              {(selectedMenu === 'Todos' || selectedMenu === 'Goleadores') && (
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  <TopScorers scorers={topScorers} />
                </div>
              )}
              {(selectedMenu === 'Todos' || selectedMenu === 'Tarjetas') && (
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  <CardsStats cards={cards} />
                </div>
              )}
              {(selectedMenu === 'Todos' || selectedMenu === 'Equipos') && (
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  <Teams teams={teams} />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white mt-16">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 border-t">
          <p className="text-center text-sm text-gray-500">
            © 2024 Olimpiadas Escolares V2. Un nuevo enfoque para la gestión deportiva.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;