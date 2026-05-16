import type { PendingChoice, Effect } from '../../engine/types';
import { getCardDef } from '../../cards';
import Button from '../common/Button';
import Modal from '../common/Modal';

function formatEffect(e: Effect): string {
  switch (e.kind) {
    case 'trade': return `+${e.amount} Trade`;
    case 'combat': return `+${e.amount} Combat`;
    case 'authority': return `+${e.amount} Authority`;
    case 'draw': return `Draw ${e.amount}`;
    case 'discardOpponent': return `Opp. discard ${e.amount}`;
    case 'destroyBase': return 'Destroy base';
    case 'scrapTradeRow': return `Scrap ≤${e.upTo} from row`;
    case 'scrapFromHandOrDiscard': return `Scrap ≤${e.upTo} hand/discard`;
    default: return e.kind;
  }
}

interface ChoiceModalProps {
  choice: PendingChoice;
  onResolve: (index: number) => void;
}

export default function ChoiceModal({ choice, onResolve }: ChoiceModalProps) {
  const cardName = (() => {
    try { return getCardDef(choice.cardUid).name; } catch { return 'Card'; }
  })();

  return (
    <Modal open title={`Choose — ${cardName}`}>
      <div className="space-y-3">
        {choice.options.map((option, i) => (
          <Button
            key={i}
            variant="secondary"
            className="w-full text-left"
            onClick={() => onResolve(i)}
          >
            {option.map(formatEffect).join(', ')}
          </Button>
        ))}
      </div>
    </Modal>
  );
}
