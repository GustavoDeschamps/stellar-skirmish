import { useState } from 'react';
import Button from '../common/Button';
import { Copy, Check } from 'lucide-react';
import { useGameStore } from '../../state/useGameStore';
import { useLobbyStore } from '../../state/useLobbyStore';
import { useChatStore } from '../../state/useChatStore';
import { createHostController, type HostController } from '../../net/hostController';

let hostRef: HostController | null = null;

export function getHostController() { return hostRef; }

export default function CreateGame({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState('Host');
  const [avatar] = useState('🚀');
  const [creating, setCreating] = useState(false);
  const [startingHealth, setStartingHealth] = useState(50);
  const { setMode, setGameState, setLocalPlayerId } = useGameStore();
  const { lobby, setLobby, setConnecting, setError, error } = useLobbyStore();
  const { addMessage } = useChatStore();

  async function handleCreate() {
    setCreating(true);
    setError(null);
    try {
      hostRef = await createHostController(
        name, avatar,
        (lobby) => setLobby(lobby),
        (state, playerId) => {
          setGameState(state);
          setLocalPlayerId(playerId);
          setMode('online');
        },
        (state) => setGameState(state),
        (msg) => addMessage(msg),
        (msg) => setError(msg),
      );
      setConnecting(false);
    } catch (err: any) {
      setError(err.message);
      setCreating(false);
    }
  }

  function handleStart() {
    hostRef?.startGame({ startingAuthority: startingHealth });
  }

  const [copied, setCopied] = useState(false);
  function copyCode() {
    if (lobby?.roomCode) {
      navigator.clipboard.writeText(lobby.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function copyLink() {
    if (lobby?.roomCode) {
      const url = `${window.location.origin}${window.location.pathname}?room=${lobby.roomCode}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (lobby) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Waiting for Players</h2>

        <div className="flex items-center gap-3 mb-4 bg-gray-900 rounded-lg p-3">
          <span className="text-2xl font-mono font-bold text-yellow-400">{lobby.roomCode}</span>
          <button onClick={copyCode} className="text-gray-400 hover:text-white" title="Copy code">
            {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
          </button>
          <Button size="sm" variant="ghost" onClick={copyLink}>Copy Link</Button>
        </div>

        <div className="space-y-2 mb-4">
          {lobby.players.map(p => (
            <div key={p.id} className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-2">
              <span>{p.avatar}</span>
              <span className="text-white font-medium">{p.name}</span>
              {p.isHost && <span className="text-xs text-yellow-400 ml-auto">Host</span>}
            </div>
          ))}
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-400 block mb-1">Starting Health: <span className="text-white font-bold">{startingHealth}</span></label>
          <input
            type="range"
            min={10}
            max={200}
            step={5}
            value={startingHealth}
            onChange={(e) => setStartingHealth(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10</span>
            <span>50 (default)</span>
            <span>200</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => { hostRef?.destroy(); hostRef = null; setLobby(null); onBack(); }}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleStart}
            disabled={lobby.players.length < 2}
          >
            Start Game ({lobby.players.length}/8)
          </Button>
        </div>

        {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4">Create Game</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white mb-4"
        placeholder="Your name"
      />
      <div className="mb-4">
        <label className="text-sm text-gray-400 block mb-1">Starting Health: <span className="text-white font-bold">{startingHealth}</span></label>
        <input
          type="range"
          min={10}
          max={200}
          step={5}
          value={startingHealth}
          onChange={(e) => setStartingHealth(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>10</span>
          <span>50 (default)</span>
          <span>200</span>
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button className="flex-1" onClick={handleCreate} disabled={creating || !name.trim()}>
          {creating ? 'Creating...' : 'Create Room'}
        </Button>
      </div>
      {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
    </div>
  );
}
