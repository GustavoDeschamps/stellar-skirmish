import { useState } from 'react';
import { useGameStore } from '../../state/useGameStore';
import { canAttackPlayer, canAttackBase } from '../../engine/targeting';
import { getCardDef } from '../../cards';
import { getHostController } from '../Lobby/CreateGame';
import { getClientController } from '../Lobby/JoinGame';
import type { Action } from '../../engine/types';
import OpponentPanel from './OpponentPanel';
import TradeRow from './TradeRow';
import PlayerPanel from './PlayerPanel';
import ChoiceModal from './ChoiceModal';
import WinnerModal from './WinnerModal';
import GameLog from './GameLog';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ChatPanel from '../Chat/ChatPanel';
import { useWakeLock } from '../../hooks/useWakeLock';

export default function GameTable() {
  const { gameState: state, dispatch, mode, localPlayerId } = useGameStore();
  const [showConcede, setShowConcede] = useState(false);
  const [showHostLeft, setShowHostLeft] = useState(false);

  useWakeLock(state?.phase === 'playing');

  if (!state) return null;

  const isOnline = mode === 'online';
  const isHotseat = mode === 'hotseat';

  const myPlayerIdx = isOnline
    ? state.players.findIndex(p => p.id === localPlayerId)
    : state.turnIndex;
  const myPlayer = state.players[myPlayerIdx] ?? state.players[0];
  const currentPlayer = state.players[state.turnIndex];
  const isMyTurn = isHotseat || currentPlayer.id === myPlayer.id;

  function sendAction(action: Action) {
    if (isOnline) {
      const host = getHostController();
      if (host) {
        // We are the host — dispatch locally via host controller
        dispatch(action, myPlayer.id);
        return;
      }
      const client = getClientController();
      if (client) {
        client.send(action);
        return;
      }
    }
    dispatch(action);
  }

  const opponents = state.players.filter((_, i) => (isOnline ? i !== myPlayerIdx : i !== state.turnIndex));

  return (
    <div className="flex flex-col gap-4 p-4 min-h-screen">
      {/* Turn indicator */}
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <span className="text-sm text-gray-400">Turn {state.turnNumber} — </span>
          <span className="text-sm font-bold text-yellow-400">
            {currentPlayer.avatar} {currentPlayer.name}'s Turn
          </span>
          {isHotseat && <span className="text-xs text-gray-500 ml-2">(Hot-Seat)</span>}
          {isOnline && !isMyTurn && <span className="text-xs text-gray-500 ml-2">(Waiting...)</span>}
        </div>
        {myPlayer.alive && (
          <Button size="sm" variant="danger" onClick={() => setShowConcede(true)}>
            Concede
          </Button>
        )}
      </div>

      {/* Opponents row */}
      <div className="flex gap-3 justify-center flex-wrap">
        {opponents.map(opp => {
          const activePlayer = isHotseat ? currentPlayer : myPlayer;
          const canHitPlayer = isMyTurn && activePlayer.combat > 0 && canAttackPlayer(state, activePlayer.id, opp.id);
          const attackableBases = opp.bases
            .filter(b => {
              const def = getCardDef(b.defId);
              return isMyTurn && activePlayer.combat >= (def.defense ?? 0) && canAttackBase(state, activePlayer.id, opp.id, b.uid);
            })
            .map(b => b.uid);

          return (
            <OpponentPanel
              key={opp.id}
              player={opp}
              isActive={opp.id === currentPlayer.id}
              canAttack={canHitPlayer}
              canAttackBases={attackableBases}
              onAttack={() => sendAction({ type: 'ATTACK_PLAYER', targetId: opp.id })}
              onAttackBase={(baseUid) => sendAction({ type: 'ATTACK_BASE', targetId: opp.id, baseUid })}
            />
          );
        })}
      </div>

      {/* Trade Row */}
      <TradeRow
        state={state}
        trade={isMyTurn ? (isHotseat ? currentPlayer : myPlayer).trade : 0}
        onBuy={(uid) => sendAction({ type: 'BUY_CARD', cardUid: uid })}
        onAcquireExplorer={() => sendAction({ type: 'ACQUIRE_EXPLORER' })}
      />

      {/* Current Player Panel */}
      <PlayerPanel
        player={isHotseat ? currentPlayer : myPlayer}
        state={state}
        isMyTurn={isMyTurn}
        onPlayCard={(uid) => sendAction({ type: 'PLAY_CARD', cardUid: uid })}
        onPlayAll={() => sendAction({ type: 'PLAY_ALL' })}
        onEndTurn={() => sendAction({ type: 'END_TURN' })}
        onScrap={(uid) => sendAction({ type: 'USE_SCRAP', cardUid: uid })}
      />

      {/* Game Log */}
      <GameLog log={state.log} players={state.players} />

      {/* Choice Modal */}
      {state.pendingChoices.length > 0 && isMyTurn && (
        <ChoiceModal
          choice={state.pendingChoices[0]}
          onResolve={(idx) => sendAction({ type: 'RESOLVE_CHOICE', optionIndex: idx })}
        />
      )}

      {/* Winner Modal */}
      {state.phase === 'gameOver' && (
        <WinnerModal
          state={state}
          onNewGame={() => useGameStore.getState().setMode('menu')}
        />
      )}

      {/* Concede Confirmation */}
      <Modal open={showConcede} onClose={() => setShowConcede(false)} title="Concede?">
        <p className="text-gray-400 mb-4">Are you sure you want to concede? The game will continue for other players.</p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setShowConcede(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => {
            sendAction({ type: 'CONCEDE' });
            setShowConcede(false);
          }}>
            Concede
          </Button>
        </div>
      </Modal>

      {/* Host Left Modal */}
      <Modal open={showHostLeft} title="Host Left">
        <p className="text-gray-400 mb-4">The host has left. The game has ended.</p>
        <Button onClick={() => { setShowHostLeft(false); useGameStore.getState().setMode('menu'); }}>
          Back to Menu
        </Button>
      </Modal>

      {/* Chat */}
      <ChatPanel />
    </div>
  );
}
