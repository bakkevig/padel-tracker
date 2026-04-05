import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Trash2, Plus } from 'lucide-react';

export default function PadelTracker() {
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [matches, setMatches] = useState([]);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [team1Sets, setTeam1Sets] = useState('');
  const [team2Sets, setTeam2Sets] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    try {
      const playersData = localStorage.getItem('padel-players');
      const matchesData = localStorage.getItem('padel-matches');
      
      if (playersData) setPlayers(JSON.parse(playersData));
      if (matchesData) setMatches(JSON.parse(matchesData));
    } catch (error) {
      console.log('Loading error:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('padel-players', JSON.stringify(players));
        localStorage.setItem('padel-matches', JSON.stringify(matches));
      } catch (error) {
        console.log('Save error:', error);
      }
    }
  }, [players, matches, isLoaded]);

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      setPlayers([...players, { id: Date.now(), name: newPlayerName }]);
      setNewPlayerName('');
    }
  };

  const removePlayer = (id) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const addMatch = () => {
    if (team1Players.length === 2 && team2Players.length === 2 && team1Sets && team2Sets) {
      const newMatch = {
        id: Date.now(),
        date: new Date().toLocaleDateString('no-NO'),
        team1: team1Players,
        team2: team2Players,
        team1Sets: parseInt(team1Sets),
        team2Sets: parseInt(team2Sets),
      };
      setMatches([...matches, newMatch]);
      setTeam1Players([]);
      setTeam2Players([]);
      setTeam1Sets('');
      setTeam2Sets('');
    }
  };

  const removeMatch = (id) => {
    setMatches(matches.filter(m => m.id !== id));
  };

  // Calculate statistics
  const calculateStats = () => {
    const stats = {};
    players.forEach(p => {
      stats[p.id] = { wins: 0, losses: 0, setWon: 0, setLost: 0, matches: 0 };
    });

    matches.forEach(match => {
      match.team1.forEach(playerId => {
        if (stats[playerId]) {
          stats[playerId].setWon += match.team1Sets;
          stats[playerId].setLost += match.team2Sets;
          stats[playerId].matches += 1;
          if (match.team1Sets > match.team2Sets) {
            stats[playerId].wins += 1;
          } else {
            stats[playerId].losses += 1;
          }
        }
      });

      match.team2.forEach(playerId => {
        if (stats[playerId]) {
          stats[playerId].setWon += match.team2Sets;
          stats[playerId].setLost += match.team1Sets;
          stats[playerId].matches += 1;
          if (match.team2Sets > match.team1Sets) {
            stats[playerId].wins += 1;
          } else {
            stats[playerId].losses += 1;
          }
        }
      });
    });

    return stats;
  };

  if (!isLoaded) return null;

  const stats = calculateStats();
  const totalMatches = matches.length;
  const totalSets = matches.reduce((sum, m) => sum + m.team1Sets + m.team2Sets, 0);

  const flyIds = (() => {
    const active = players.filter(p => stats[p.id]?.matches > 0);
    if (!active.length) return new Set();
    const minWins = Math.min(...active.map(p => stats[p.id].wins));
    const withMinWins = active.filter(p => stats[p.id].wins === minWins);
    const minPct = Math.min(...withMinWins.map(p => stats[p.id].wins / stats[p.id].matches));
    return new Set(withMinWins.filter(p => stats[p.id].wins / stats[p.id].matches === minPct).map(p => p.id));
  })();

  return (
    <>
      <Head>
        <title>Padel Tracker</title>
        <meta name="description" content="Track your padel matches and statistics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-blue-900 mb-8">🎾 Padel Tracker</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Players */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Spillere ({players.length})</h2>
                
                <div className="mb-4">
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                    placeholder="Navn på spiller"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addPlayer}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Plus size={20} /> Legg til spiller
                  </button>
                </div>

                <div className="space-y-2">
                  {players.map(player => (
                    <div key={player.id} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                      <span className="font-semibold text-gray-800">{player.name}</span>
                      <button
                        onClick={() => removePlayer(player.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle column - Match entry */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Ny kamp</h2>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lag 1 (må ha 2 spillere)</label>
                  <div className="space-y-2 mb-3">
                    {players.map(player => (
                      <label key={player.id} className="flex items-center bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={team1Players.includes(player.id)}
                          onChange={(e) => {
                            if (e.target.checked && team1Players.length < 2) {
                              setTeam1Players([...team1Players, player.id]);
                            } else if (!e.target.checked) {
                              setTeam1Players(team1Players.filter(id => id !== player.id));
                            }
                          }}
                          disabled={team2Players.includes(player.id) || (team1Players.length >= 2 && !team1Players.includes(player.id))}
                          className="w-4 h-4 disabled:opacity-50 cursor-pointer"
                        />
                        <span className="ml-2 text-sm">{player.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lag 2 (må ha 2 spillere)</label>
                  <div className="space-y-2">
                    {players.map(player => (
                      <label key={player.id} className="flex items-center bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={team2Players.includes(player.id)}
                          onChange={(e) => {
                            if (e.target.checked && team2Players.length < 2) {
                              setTeam2Players([...team2Players, player.id]);
                            } else if (!e.target.checked) {
                              setTeam2Players(team2Players.filter(id => id !== player.id));
                            }
                          }}
                          disabled={team1Players.includes(player.id) || (team2Players.length >= 2 && !team2Players.includes(player.id))}
                          className="w-4 h-4 disabled:opacity-50 cursor-pointer"
                        />
                        <span className="ml-2 text-sm">{player.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={team1Sets}
                    onChange={(e) => setTeam1Sets(e.target.value)}
                    placeholder="Games Lag 1"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={team2Sets}
                    onChange={(e) => setTeam2Sets(e.target.value)}
                    placeholder="Games Lag 2"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={addMatch}
                  disabled={team1Players.length !== 2 || team2Players.length !== 2 || !team1Sets || !team2Sets}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-2 rounded-lg"
                >
                  Registrer kamp
                </button>
              </div>
            </div>

            {/* Right column - Statistics */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Statistikk</h2>
                
                <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600">Totale kamper</p>
                  <p className="text-3xl font-bold text-yellow-600">{totalMatches}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600">Totale games spilt</p>
                  <p className="text-3xl font-bold text-purple-600">{totalSets}</p>
                </div>

                <h3 className="font-bold text-gray-800 mb-3">Spiller-statistikk</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {players.map(player => (
                    <div key={player.id} className={`p-3 rounded-lg text-sm ${flyIds.has(player.id) ? 'bg-red-50 border-2 border-red-300' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-gray-800">{player.name}</p>
                        {flyIds.has(player.id) && (
                          <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">
                            <img src="/fly.svg" alt="fly" className="w-3.5 h-3.5 inline" />
                            Flua
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white rounded p-2 text-center">
                          <p className="text-xs text-gray-500">Kamper</p>
                          <p className="text-xl font-bold text-orange-600">{stats[player.id]?.matches || 0}</p>
                        </div>
                        <div className="bg-white rounded p-2 text-center">
                          <p className="text-xs text-gray-500">Seire</p>
                          <p className="text-xl font-bold text-green-600">{stats[player.id]?.wins || 0}</p>
                        </div>
                        <div className="bg-white rounded p-2 text-center">
                          <p className="text-xs text-gray-500">Tap</p>
                          <p className="text-xl font-bold text-red-600">{stats[player.id]?.losses || 0}</p>
                        </div>
                        <div className="bg-white rounded p-2 text-center">
                          <p className="text-xs text-gray-500">Vinn%</p>
                          <p className="text-xl font-bold text-teal-600">
                            {stats[player.id]?.matches > 0
                              ? Math.round((stats[player.id].wins / stats[player.id].matches) * 100)
                              : 0}%
                          </p>
                        </div>
                        <div className="bg-white rounded p-2 text-center">
                          <p className="text-xs text-gray-500">Games +</p>
                          <p className="text-xl font-bold text-blue-600">{stats[player.id]?.setWon || 0}</p>
                        </div>
                        <div className="bg-white rounded p-2 text-center">
                          <p className="text-xs text-gray-500">Games -</p>
                          <p className="text-xl font-bold text-red-400">{stats[player.id]?.setLost || 0}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Matches history */}
          {matches.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Kamphistorikk</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {[...matches].reverse().map(match => (
                  <div key={match.id} className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">{match.date}</p>
                      <button
                        onClick={() => removeMatch(match.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {match.team1.map(id => players.find(p => p.id === id)?.name).join(' + ')}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          <span className={match.team1Sets > match.team2Sets ? 'text-green-600' : 'text-gray-400'}>
                            {match.team1Sets}
                          </span>
                          {' - '}
                          <span className={match.team2Sets > match.team1Sets ? 'text-green-600' : 'text-gray-400'}>
                            {match.team2Sets}
                          </span>
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-gray-600">
                          {match.team2.map(id => players.find(p => p.id === id)?.name).join(' + ')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
