import type { GameState, PlayerState, RNG } from './types';
import { buildStarterDeck, buildTradeDeck } from '../cards';
import { drawCards } from './effects';

function createPlayer(id: string, name: string, avatar: string, rng: RNG): PlayerState {
  return {
    id,
    name,
    avatar,
    authority: 50,
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
): GameState {
  const players = playerInfos.map(p => createPlayer(p.id, p.name, p.avatar, rng));
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

  // Draw initial hands: first player gets 3, second gets 4 in multiplayer, rest get 5
  for (let i = 0; i < players.length; i++) {
    let handSize = 5;
    if (players.length > 2) {
      if (i === 0) handSize = 3;
      else if (i === 1) handSize = 4;
    } else if (players.length === 2) {
      if (i === 0) handSize = 3;
      else handSize = 5;
    }
    state = drawCards(state, i, handSize);
  }

  return state;
}
