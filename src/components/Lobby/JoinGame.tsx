import { useState, useEffect } from 'react';
import Button from '../common/Button';
import { useGameStore } from '../../state/useGameStore';
import { useLobbyStore } from '../../state/useLobbyStore';
import { useChatStore } from '../../state/useChatStore';
import { createClientController, type ClientController } from '../../net/clientController';

let clientRef: ClientController | null = null;

export function getClientController() { return clientRef; }

export default function JoinGame({ onBack, initialCode }: { onBack: () => void; initialCode?: string }) {
  const [name, setName] = useState('Player');
  const [code, setCode] = useState(initialCode ?? '');
  const [joining, setJoining] = useState(false);
  const { setMode, setGameState, setLocalPlayerId } = useGameStore();
  const { lobby, setLobby, setError, error } = useLobbyStore();
  const { addMessage } = useChatStore();
  const [hostClosed, setHostClosed] = useState(false);

  useEffect(() => {
    if (initialCode) setCode(initialCode);
  }, [initialCode]);

  async function handleJoin() {
    setJoining(true);
    setError(null);
    try {
      clientRef = await createClientController(
        code.toUpperCase(), name, '⭐',
        (lobby) => setLobby(lobby),
        (state, playerId) => {
          setGameState(state);
          setLocalPlayerId(playerId);
          setMode('online');
        },
        (state) => setGameState(state),
        (msg) => addMessage(msg),
        (playerName) => addMessage({
          id: Date.now().toString(), from: 'system', fromName: 'System',
          to: 'all', text: `${playerName} left the game`, ts: Date.now(), system: true,
        }),
        () => setHostClosed(true),
        (msg) => { setError(msg); setJoining(false); },
      );
    } catch (err: any) {
      setError(err.message || 'Failed to connect');
      setJoining(false);
    }
  }

  if (hostClosed) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 text-center">
        <h2 className="text-xl font-bold text-white mb-4">Host Left</h2>
        <p className="text-gray-400 mb-4">The host has closed the game.</p>
        <Button onClick={() => { clientRef?.destroy(); clientRef = null; setHostClosed(false); onBack(); }}>
          Back to Menu
        </Button>
      </div>
    );
  }

  if (lobby) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-2">Waiting Room</h2>
        <div className="text-gray-400 text-sm mb-4">Room: <span className="text-yellow-400 font-mono font-bold">{lobby.roomCode}</span></div>
        <div className="space-y-2 mb-4">
          {lobby.players.map(p => (
            <div key={p.id} className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-2">
              <span>{p.avatar}</span>
              <span className="text-white font-medium">{p.name}</span>
              {p.isHost && <span className="text-xs text-yellow-400 ml-auto">Host</span>}
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-sm">Waiting for host to start the game...</p>
        <Button variant="ghost" className="mt-3" onClick={() => { clientRef?.destroy(); clientRef = null; setLobby(null); onBack(); }}>
          Leave
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4">Join Game</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white mb-3"
        placeholder="Your name"
      />
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white mb-4 font-mono tracking-wider"
        placeholder="STAR-XXXX"
        maxLength={9}
      />
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button className="flex-1" onClick={handleJoin} disabled={joining || !name.trim() || code.length < 9}>
          {joining ? 'Connecting...' : 'Join'}
        </Button>
      </div>
      {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
    </div>
  );
}
