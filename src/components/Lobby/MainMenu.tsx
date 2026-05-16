import { useState, useEffect } from 'react';
import { useGameStore } from '../../state/useGameStore';
import Button from '../common/Button';
import CreateGame from './CreateGame';
import JoinGame from './JoinGame';
import { Sparkles } from 'lucide-react';

type Screen = 'main' | 'hotseat' | 'create' | 'join';

export default function MainMenu() {
  const { startHotseatGame } = useGameStore();
  const [screen, setScreen] = useState<Screen>('main');
  const [playerCount, setPlayerCount] = useState(2);
  const [names, setNames] = useState(['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6', 'Player 7', 'Player 8']);

  const params = new URLSearchParams(window.location.search);
  const roomParam = params.get('room');

  useEffect(() => {
    if (roomParam) setScreen('join');
  }, [roomParam]);

  function handleStart() {
    startHotseatGame(names.slice(0, playerCount));
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-yellow-400" />
          <h1 className="text-4xl font-bold text-white">Stellar Skirmish</h1>
          <Sparkles className="w-8 h-8 text-yellow-400" />
        </div>
        <p className="text-gray-400">A deck-building card game for 2-8 players</p>
      </div>

      {screen === 'main' && (
        <div className="flex flex-col gap-4 w-64">
          <Button onClick={() => setScreen('hotseat')} size="lg" className="w-full">
            Hot-Seat Game
          </Button>
          <Button onClick={() => setScreen('create')} size="lg" variant="secondary" className="w-full">
            Create Online Game
          </Button>
          <Button onClick={() => setScreen('join')} size="lg" variant="secondary" className="w-full">
            Join Online Game
          </Button>
        </div>
      )}

      {screen === 'hotseat' && (
        <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Hot-Seat Setup</h2>
          <div className="mb-4">
            <label className="text-sm text-gray-400 block mb-1">Number of Players</label>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6, 7, 8].map(n => (
                <button
                  key={n}
                  onClick={() => setPlayerCount(n)}
                  className={`w-8 h-8 rounded ${playerCount === n ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 mb-6">
            {Array.from({ length: playerCount }, (_, i) => (
              <input
                key={i}
                value={names[i]}
                onChange={(e) => {
                  const n = [...names];
                  n[i] = e.target.value;
                  setNames(n);
                }}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white"
                placeholder={`Player ${i + 1}`}
              />
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setScreen('main')}>Back</Button>
            <Button onClick={handleStart} className="flex-1">Start Game</Button>
          </div>
        </div>
      )}

      {screen === 'create' && (
        <CreateGame onBack={() => setScreen('main')} />
      )}

      {screen === 'join' && (
        <JoinGame onBack={() => setScreen('main')} initialCode={roomParam ?? undefined} />
      )}

      <p className="text-xs text-gray-600 mt-8 max-w-sm text-center">
        Fan project for private play. Not affiliated with Wise Wizard Games. No copyrighted art used.
      </p>
    </div>
  );
}
