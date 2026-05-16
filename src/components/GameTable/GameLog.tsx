import { useRef, useEffect } from 'react';
import type { LogEntry } from '../../engine/types';

interface GameLogProps {
  log: LogEntry[];
  players: Array<{ id: string; name: string }>;
}

export default function GameLog({ log, players }: GameLogProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log.length]);

  const last30 = log.slice(-30);

  return (
    <div className="bg-gray-900/80 rounded-lg border border-gray-700 p-3 max-h-48 overflow-y-auto text-xs">
      <div className="text-gray-500 font-medium mb-2">Game Log</div>
      {last30.map((entry, i) => {
        const actor = entry.actorId === 'system'
          ? null
          : players.find(p => p.id === entry.actorId);
        return (
          <div key={i} className="text-gray-400 mb-0.5">
            {actor && <span className="text-gray-200 font-medium">{actor.name}: </span>}
            {entry.message}
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
