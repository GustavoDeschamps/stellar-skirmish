import type { Effect, GameState, PendingChoice } from './types';
import { getCardDef } from '../cards';

export function applyEffects(
  state: GameState,
  playerIdx: number,
  effects: Effect[],
  sourceUid: string,
  source: 'primary' | 'ally' | 'scrap',
): GameState {
  const player = state.players[playerIdx];

  for (const effect of effects) {
    switch (effect.kind) {
      case 'trade':
        state.players[playerIdx] = { ...player, trade: player.trade + effect.amount };
        break;
      case 'combat':
        state.players[playerIdx] = { ...player, combat: player.combat + effect.amount };
        break;
      case 'authority':
        state.players[playerIdx] = { ...player, authority: player.authority + effect.amount };
        break;
      case 'draw':
        state = drawCards(state, playerIdx, effect.amount);
        break;
      case 'discardOpponent':
        for (const p of state.players) {
          if (p.id !== player.id && p.alive) {
            const idx = state.players.indexOf(p);
            state.players[idx] = { ...p, pendingDiscards: p.pendingDiscards + effect.amount };
          }
        }
        break;
      case 'destroyBase':
        break;
      case 'scrapTradeRow':
        break;
      case 'scrapFromHandOrDiscard':
        break;
      case 'acquireShipFree':
        break;
      case 'acquireToTopOfDeck':
        break;
      case 'putShipOnDeck':
        break;
      case 'copyShip':
        break;
      case 'choice': {
        const choice: PendingChoice = { cardUid: sourceUid, options: effect.options, source };
        state = { ...state, pendingChoices: [...state.pendingChoices, choice] };
        break;
      }
    }
    // Re-read player after each effect
    Object.assign(player, state.players[playerIdx]);
  }

  return state;
}

export function drawCards(state: GameState, playerIdx: number, count: number): GameState {
  let player = { ...state.players[playerIdx] };
  let deck = [...player.deck];
  let discard = [...player.discard];
  const hand = [...player.hand];

  for (let i = 0; i < count; i++) {
    if (deck.length === 0) {
      if (discard.length === 0) break;
      deck = shuffleDeck(discard);
      discard = [];
    }
    hand.push(deck.pop()!);
  }

  player = { ...player, deck, hand, discard };
  const players = [...state.players];
  players[playerIdx] = player;
  return { ...state, players };
}

function shuffleDeck(cards: typeof Array.prototype): any[] {
  const a = [...cards];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function refillTradeRow(state: GameState): GameState {
  const tradeRow = [...state.tradeRow];
  const tradeDeck = [...state.tradeDeck];
  while (tradeRow.length < 5 && tradeDeck.length > 0) {
    tradeRow.push(tradeDeck.pop()!);
  }
  return { ...state, tradeRow, tradeDeck };
}

export function describeEffect(effect: Effect): string {
  switch (effect.kind) {
    case 'trade': return `+${effect.amount} Trade`;
    case 'combat': return `+${effect.amount} Combat`;
    case 'authority': return `+${effect.amount} Authority`;
    case 'draw': return `Draw ${effect.amount}`;
    case 'discardOpponent': return `Opponents discard ${effect.amount}`;
    case 'destroyBase': return 'Destroy target base';
    case 'scrapTradeRow': return `Scrap up to ${effect.upTo} from trade row`;
    case 'scrapFromHandOrDiscard': return `Scrap up to ${effect.upTo} from hand/discard`;
    case 'acquireShipFree': return `Acquire ship free (cost ≤${effect.maxCost})${effect.topOfDeck ? ' to top of deck' : ''}`;
    case 'acquireToTopOfDeck': return `Next acquired card goes to top of deck`;
    case 'putShipOnDeck': return 'Put ship on top of deck';
    case 'copyShip': return 'Copy another ship in play';
    case 'choice': return effect.options.map(o => o.map(describeEffect).join(', ')).join(' OR ');
  }
}

export function describeEffects(effects: Effect[]): string {
  return effects.map(describeEffect).join('; ');
}

export function getBaseDefense(defId: string): number {
  const def = getCardDef(defId);
  return def.defense ?? 0;
}
