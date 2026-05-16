import type { GameState, PlayerState, RNG, GameOptions } from './types';
import { buildStarterDeck, buildTradeDeck } from '../cards';
import { drawCards } from './effects';

function createPlayer(id: string, name: string, avatar: string, rng: RNG, authority: number): PlayerState {
  return {
    id,
    name,
    avatar,
    authority,
    deck: buildStarterDeck(rng),
    hand: [],
    discard: [],
    inPlay: [],
    bases: [],
    trade: 0,
    combat: 0,
    turnsTaken: 0,
    alive: true,
    allyTriggered: new Set(),
    scrapUsed: new Set(),
    pendingDiscards: 0,
  };
}

export function newGame(
  playerInfos: Array<{ id: string; name: string; avatar: string }>,
  rng: RNG,
  options?: Partial<GameOptions>,
): GameState {
  const startingAuthority = options?.startingAuthority ?? 50;
  const players = playerInfos.map(p => createPlayer(p.id, p.name, p.avatar, rng, startingAuthority));
  const tradeDeck = buildTradeDeck(rng);
  const tradeRow = tradeDeck.splice(-5);

  let state: GameState = {
    phase: 'playing',
    players,
    turnIndex: 0,
    tradeRow,
    tradeDeck,
    explorers: 10,
    scrapHeap: [],
    pendingChoices: [],
    log: [],
    winnerId: null,
    turnNumber: 1,
  };

  for (let i = 0; i < players.length; i++) {
    state = drawCards(state, i, 5);
  }

  return state;
}
