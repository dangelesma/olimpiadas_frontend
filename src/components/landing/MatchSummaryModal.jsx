import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const MatchSummaryModal = ({ isOpen, onClose, summary, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-center text-primary-600">
            Resumen del Partido
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : !summary ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No se pudo cargar el resumen del partido.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Marcador Final */}
            <div className="text-center bg-primary-50 p-6 rounded-lg">
              <h4 className="text-xl font-semibold mb-4">Resultado Final</h4>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-lg font-medium">{summary.equipo_local}</p>
                  <p className="text-4xl font-bold text-primary-600">
                    {summary.deporte === 'voley' ? summary.sets_local : summary.goles_local}
                  </p>
                </div>
                <span className="text-2xl font-bold">-</span>
                <div className="text-center">
                  <p className="text-lg font-medium">{summary.equipo_visitante}</p>
                  <p className="text-4xl font-bold text-primary-600">
                    {summary.deporte === 'voley' ? summary.sets_visitante : summary.goles_visitante}
                  </p>
                </div>
              </div>
            </div>

            {/* Goles */}
            {summary.goles && summary.goles.length > 0 && (
              <div className="bg-white border rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-4">Goles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium mb-3 text-blue-600">{summary.equipo_local}</h5>
                    <div className="space-y-2">
                      {summary.goles.filter(g => g.equipo === summary.equipo_local).map((gol, index) => (
                        <div key={`goal-local-${index}`} className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm">
                          <span>{gol.jugador}</span>
                          <span className="font-bold">⚽ {gol.cantidad}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-3 text-green-600">{summary.equipo_visitante}</h5>
                    <div className="space-y-2">
                      {summary.goles.filter(g => g.equipo === summary.equipo_visitante).map((gol, index) => (
                        <div key={`goal-visit-${index}`} className="flex items-center justify-between p-2 bg-green-50 rounded text-sm">
                          <span>{gol.jugador}</span>
                          <span className="font-bold">⚽ {gol.cantidad}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tarjetas */}
            {(summary.tarjetas_amarillas?.length > 0 || summary.tarjetas_rojas?.length > 0) && (
              <div className="bg-white border rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-4">Tarjetas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium mb-3">{summary.equipo_local}</h5>
                    <div className="space-y-2">
                      {summary.tarjetas_amarillas?.filter(t => t.equipo === summary.equipo_local).map((t, i) => <div key={`yl-${i}`} className="text-sm p-2 bg-yellow-50 rounded">🟨 {t.jugador} ({t.cantidad})</div>)}
                      {summary.tarjetas_rojas?.filter(t => t.equipo === summary.equipo_local).map((t, i) => <div key={`rl-${i}`} className="text-sm p-2 bg-red-50 rounded">🟥 {t.jugador} ({t.cantidad})</div>)}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-3">{summary.equipo_visitante}</h5>
                    <div className="space-y-2">
                      {summary.tarjetas_amarillas?.filter(t => t.equipo === summary.equipo_visitante).map((t, i) => <div key={`yv-${i}`} className="text-sm p-2 bg-yellow-50 rounded">🟨 {t.jugador} ({t.cantidad})</div>)}
                      {summary.tarjetas_rojas?.filter(t => t.equipo === summary.equipo_visitante).map((t, i) => <div key={`rv-${i}`} className="text-sm p-2 bg-red-50 rounded">🟥 {t.jugador} ({t.cantidad})</div>)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchSummaryModal;