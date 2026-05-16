import type { PlayerState } from '../../engine/types';
import { getCardDef } from '../../cards';
import { Heart, Layers, CreditCard } from 'lucide-react';

interface OpponentPanelProps {
  player: PlayerState;
  isActive: boolean;
  onAttack?: () => void;
  onAttackBase?: (baseUid: string) => void;
  canAttack: boolean;
  canAttackBases: string[];
}

export default function OpponentPanel({ player, isActive, onAttack, onAttackBase, canAttack, canAttackBases }: OpponentPanelProps) {
  return (
    <div className={`
      rounded-lg p-3 min-w-[160px]
      ${!player.alive ? 'opacity-30 bg-gray-900' : isActive ? 'bg-gray-800 ring-2 ring-yellow-400' : 'bg-gray-800/60'}
    `}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{player.avatar}</span>
        <span className="font-bold text-sm text-white truncate">{player.name}</span>
        {isActive && <span className="text-yellow-400 text-xs">(active)</span>}
      </div>

      <div className="flex items-center gap-3 text-sm mb-2">
        <button
          onClick={canAttack ? onAttack : undefined}
          disabled={!canAttack}
          className={`flex items-center gap-1 ${canAttack ? 'text-red-400 hover:text-red-300 cursor-pointer' : 'text-gray-400'}`}
          title={canAttack ? 'Attack this player' : 'Cannot attack (outpost blocks)'}
        >
          <Heart className="w-4 h-4" />
          <span className="font-bold">{player.authority}</span>
        </button>
        <span className="flex items-center gap-1 text-gray-500">
          <Layers className="w-3 h-3" /> {player.deck?.length ?? 0}
        </span>
        <span className="flex items-center gap-1 text-gray-500">
          <CreditCard className="w-3 h-3" /> {player.hand?.length ?? 0}
        </span>
      </div>

      {/* Opponent's bases */}
      {player.bases.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {player.bases.map(base => {
            const def = getCardDef(base.defId);
            const canHit = canAttackBases.includes(base.uid);
            return (
              <button
                key={base.uid}
                onClick={canHit ? () => onAttackBase?.(base.uid) : undefined}
                disabled={!canHit}
                className={`
                  text-[10px] px-2 py-1 rounded border
                  ${def.type === 'outpost' ? 'border-red-500 bg-red-900/30' : 'border-gray-600 bg-gray-800'}
                  ${canHit ? 'hover:brightness-125 cursor-pointer' : 'opacity-60'}
                `}
                title={`${def.name} - Defense: ${def.defense}`}
              >
                {def.type === 'outpost' ? '🛡️' : '🏗️'} {def.name} ({def.defense})
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
