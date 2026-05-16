export type Faction = 'trade' | 'blob' | 'empire' | 'cult' | 'unaligned';
export type CardType = 'ship' | 'base' | 'outpost';

export type Effect =
  | { kind: 'trade'; amount: number }
  | { kind: 'combat'; amount: number }
  | { kind: 'authority'; amount: number }
  | { kind: 'draw'; amount: number }
  | { kind: 'discardOpponent'; amount: number }
  | { kind: 'destroyBase' }
  | { kind: 'scrapTradeRow'; upTo: number }
  | { kind: 'scrapFromHandOrDiscard'; upTo: number }
  | { kind: 'acquireShipFree'; maxCost: number; topOfDeck?: boolean }
  | { kind: 'putShipOnDeck' }
  | { kind: 'acquireToTopOfDeck'; maxCost: number }
  | { kind: 'copyShip' }
  | { kind: 'choice'; options: Effect[][] };

export interface CardDef {
  id: string;
  name: string;
  cost: number;
  factions: Faction[];
  type: CardType;
  defense?: number;
  primary: Effect[];
  ally: Effect[];
  scrap: Effect[];
}

export interface CardInstance {
  uid: string;
  defId: string;
}

export interface PlayerState {
  id: string;
  name: string;
  avatar: string;
  authority: number;
  deck: CardInstance[];
  hand: CardInstance[];
  discard: CardInstance[];
  inPlay: CardInstance[];
  bases: CardInstance[];
  trade: number;
  combat: number;
  turnsTaken: number;
  alive: boolean;
  allyTriggered: Set<string>;
  scrapUsed: Set<string>;
  pendingDiscards: number;
}

export type Phase = 'lobby' | 'playing' | 'resolvingChoice' | 'resolvingDiscard' | 'gameOver';

export interface PendingChoice {
  cardUid: string;
  options: Effect[][];
  source: 'primary' | 'ally' | 'scrap';
}

export interface LogEntry {
  ts: number;
  actorId: string;
  message: string;
}

export interface GameState {
  phase: Phase;
  players: PlayerState[];
  turnIndex: number;
  tradeRow: CardInstance[];
  tradeDeck: CardInstance[];
  explorers: number;
  scrapHeap: CardInstance[];
  pendingChoices: PendingChoice[];
  log: LogEntry[];
  winnerId: string | null;
  turnNumber: number;
}

export type Action =
  | { type: 'PLAY_CARD'; cardUid: string }
  | { type: 'PLAY_ALL' }
  | { type: 'BUY_CARD'; cardUid: string }
  | { type: 'ACQUIRE_EXPLORER' }
  | { type: 'ATTACK_PLAYER'; targetId: string }
  | { type: 'ATTACK_BASE'; targetId: string; baseUid: string }
  | { type: 'USE_SCRAP'; cardUid: string }
  | { type: 'RESOLVE_CHOICE'; optionIndex: number }
  | { type: 'RESOLVE_DISCARD'; cardUids: string[] }
  | { type: 'END_TURN' }
  | { type: 'CONCEDE' };

export interface ActionResult {
  state: GameState;
  errors?: string[];
}

export type RNG = () => number;
