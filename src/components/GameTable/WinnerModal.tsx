import type { GameState } from '../../engine/types';
import Button from '../common/Button';
import Modal from '../common/Modal';

interface WinnerModalProps {
  state: GameState;
  onNewGame: () => void;
}

export default function WinnerModal({ state, onNewGame }: WinnerModalProps) {
  const winner = state.players.find(p => p.id === state.winnerId);
  if (!winner) return null;

  return (
    <Modal open title="Game Over!">
      <div className="text-center space-y-4">
        <div className="text-4xl">{winner.avatar}</div>
        <div className="text-2xl font-bold text-white">{winner.name} Wins!</div>
        <div className="text-gray-400">
          Final Authority: {winner.authority}
        </div>
        <Button onClick={onNewGame} className="w-full">Play Again</Button>
      </div>
    </Modal>
  );
}
