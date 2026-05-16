import type { GameState, PlayerState } from '../../engine/types';
import { getCardDef } from '../../cards';
import CardView from '../Card/CardView';
import Button from '../common/Button';
import { Heart, Swords, Coins } from 'lucide-react';

interface PlayerPanelProps {
  player: PlayerState;
  state: GameState;
  isMyTurn: boolean;
  onPlayCard: (uid: string) => void;
  onPlayAll: () => void;
  onEndTurn: () => void;
  onScrap: (uid: string) => void;
}

export default function PlayerPanel({
  player, state, isMyTurn, onPlayCard, onPlayAll, onEndTurn, onScrap,
}: PlayerPanelProps) {
  const hasPendingChoices = state.pendingChoices.length > 0;

  return (
    <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700">
      {/* Status bar */}
      <div className="flex items-center gap-6 mb-3">
        <span className="text-lg">{player.avatar}</span>
        <span className="font-bold text-white">{player.name}</span>
        <div className="flex items-center gap-1 text-red-400">
          <Heart className="w-4 h-4" /> <span className="font-bold">{player.authority}</span>
        </div>
        <div className="flex items-center gap-1 text-blue-400">
          <Coins className="w-4 h-4" /> <span className="font-bold">{player.trade}</span>
        </div>
        <div className="flex items-center gap-1 text-orange-400">
          <Swords className="w-4 h-4" /> <span className="font-bold">{player.combat}</span>
        </div>
        <div className="ml-auto flex gap-2">
          {isMyTurn && !hasPendingChoices && (
            <>
              <Button size="sm" variant="secondary" onClick={onPlayAll}>
                Play All
              </Button>
              <Button size="sm" onClick={onEndTurn}>
                End Turn
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Bases */}
      {player.bases.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Your Bases</div>
          <div className="flex gap-2 flex-wrap">
            {player.bases.map(card => {
              const def = getCardDef(card.defId);
              return (
                <CardView
                  key={card.uid}
                  def={def}
                  small
                  onClick={def.scrap.length > 0 && !player.scrapUsed.has(card.uid) ? () => onScrap(card.uid) : undefined}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* In play this turn */}
      {player.inPlay.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Played This Turn</div>
          <div className="flex gap-2 flex-wrap">
            {player.inPlay.map(card => {
              const def = getCardDef(card.defId);
              return (
                <CardView
                  key={card.uid}
                  def={def}
                  small
                  onClick={def.scrap.length > 0 && !player.scrapUsed.has(card.uid) ? () => onScrap(card.uid) : undefined}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Hand */}
      <div>
        <div className="text-xs text-gray-500 mb-1">Hand ({player.hand.length})</div>
        <div className="flex gap-2 flex-wrap">
          {player.hand.map(card => {
            const def = getCardDef(card.defId);
            return (
              <CardView
                key={card.uid}
                def={def}
                onClick={isMyTurn && !hasPendingChoices ? () => onPlayCard(card.uid) : undefined}
                disabled={!isMyTurn || hasPendingChoices}
              />
            );
          })}
          {player.hand.length === 0 && (
            <div className="text-gray-600 text-sm italic">No cards in hand</div>
          )}
        </div>
      </div>
    </div>
  );
}
