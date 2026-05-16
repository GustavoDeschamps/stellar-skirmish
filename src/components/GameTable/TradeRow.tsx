import type { GameState } from '../../engine/types';
import { getCardDef } from '../../cards';
import CardView from '../Card/CardView';
import { explorer } from '../../cards/starter';

interface TradeRowProps {
  state: GameState;
  trade: number;
  onBuy: (cardUid: string) => void;
  onAcquireExplorer: () => void;
}

export default function TradeRow({ state, trade, onBuy, onAcquireExplorer }: TradeRowProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-sm text-gray-400 font-medium">
        Trade Row
        <span className="ml-3 text-xs text-gray-600">
          Deck: {state.tradeDeck.length} | Scrap: {state.scrapHeap.length}
        </span>
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        {state.tradeRow.map(card => {
          const def = getCardDef(card.defId);
          return (
            <CardView
              key={card.uid}
              def={def}
              onClick={trade >= def.cost ? () => onBuy(card.uid) : undefined}
              disabled={trade < def.cost}
              small
            />
          );
        })}
        {/* Explorer pile */}
        <div className="relative">
          <CardView
            def={explorer}
            onClick={trade >= 2 && state.explorers > 0 ? onAcquireExplorer : undefined}
            disabled={trade < 2 || state.explorers <= 0}
            small
          />
          <div className="absolute -bottom-1 -right-1 bg-gray-800 text-xs text-gray-300 px-1.5 rounded-full border border-gray-600">
            x{state.explorers}
          </div>
        </div>
      </div>
    </div>
  );
}
