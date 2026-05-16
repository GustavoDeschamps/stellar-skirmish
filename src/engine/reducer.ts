import type { GameState, Action, ActionResult, CardInstance } from './types';
import { getCardDef, makeCard } from '../cards';
import { applyEffects, drawCards, refillTradeRow } from './effects';
import { getNewAllyEffects } from './ally';
import { canAttackPlayer, canAttackBase } from './targeting';
import { addLog } from './log';

function currentPlayer(state: GameState) {
  return state.players[state.turnIndex];
}

function err(state: GameState, msg: string): ActionResult {
  return { state, errors: [msg] };
}

function checkWin(state: GameState): GameState {
  const alive = state.players.filter(p => p.alive);
  if (alive.length === 1) {
    return {
      ...state,
      phase: 'gameOver',
      winnerId: alive[0].id,
      log: addLog(state.log, 'system', `${alive[0].name} wins!`),
    };
  }
  return state;
}

function triggerAlly(state: GameState, playerIdx: number): GameState {
  let changed = true;
  while (changed) {
    changed = false;
    const newAllies = getNewAllyEffects(state.players[playerIdx]);
    for (const { uid, effects } of newAllies) {
      state = applyEffects(state, playerIdx, effects, uid, 'ally');
      const p = state.players[playerIdx];
      state.players[playerIdx] = {
        ...p,
        allyTriggered: new Set([...p.allyTriggered, uid]),
      };
      state = {
        ...state,
        log: addLog(state.log, p.id, `Ally ability triggered for ${getCardDef(findCard(state, playerIdx, uid)!.defId).name}`),
      };
      changed = true;
    }
  }
  return state;
}

function findCard(state: GameState, playerIdx: number, uid: string): CardInstance | undefined {
  const p = state.players[playerIdx];
  return (
    p.hand.find(c => c.uid === uid) ||
    p.inPlay.find(c => c.uid === uid) ||
    p.bases.find(c => c.uid === uid) ||
    p.discard.find(c => c.uid === uid)
  );
}

function findCardInHand(state: GameState, playerIdx: number, uid: string): CardInstance | undefined {
  return state.players[playerIdx].hand.find(c => c.uid === uid);
}

export function applyAction(state: GameState, action: Action, actorId: string): ActionResult {
  if (state.phase === 'gameOver') return err(state, 'Game is over');

  const player = currentPlayer(state);
  const playerIdx = state.turnIndex;

  // Concede can happen any time
  if (action.type === 'CONCEDE') {
    const concederIdx = state.players.findIndex(p => p.id === actorId);
    if (concederIdx === -1) return err(state, 'Player not found');
    const conceder = state.players[concederIdx];
    const players = [...state.players];
    players[concederIdx] = { ...conceder, alive: false, authority: 0 };
    state = { ...state, players, log: addLog(state.log, actorId, `${conceder.name} concedes`) };
    state = checkWin(state);
    if (state.phase !== 'gameOver' && concederIdx === state.turnIndex) {
      state = advanceTurn(state);
    }
    return { state };
  }

  // Resolve discard can be done by any player who has pending discards
  if (action.type === 'RESOLVE_DISCARD') {
    const discardIdx = state.players.findIndex(p => p.id === actorId);
    if (discardIdx === -1) return err(state, 'Player not found');
    const dp = state.players[discardIdx];
    if (dp.pendingDiscards <= 0) return err(state, 'No pending discards');
    if (action.cardUids.length !== Math.min(dp.pendingDiscards, dp.hand.length)) {
      return err(state, `Must discard ${Math.min(dp.pendingDiscards, dp.hand.length)} cards`);
    }
    const hand = [...dp.hand];
    const discard = [...dp.discard];
    for (const uid of action.cardUids) {
      const idx = hand.findIndex(c => c.uid === uid);
      if (idx === -1) return err(state, `Card ${uid} not in hand`);
      discard.push(hand.splice(idx, 1)[0]);
    }
    const players = [...state.players];
    players[discardIdx] = { ...dp, hand, discard, pendingDiscards: 0 };
    return { state: { ...state, players } };
  }

  if (actorId !== player.id) return err(state, 'Not your turn');

  // Handle pending choices first
  if (state.pendingChoices.length > 0) {
    if (action.type !== 'RESOLVE_CHOICE') {
      return err(state, 'Must resolve pending choice first');
    }
    const choice = state.pendingChoices[0];
    if (action.optionIndex < 0 || action.optionIndex >= choice.options.length) {
      return err(state, 'Invalid choice index');
    }
    const effects = choice.options[action.optionIndex];
    state = applyEffects(state, playerIdx, effects, choice.cardUid, choice.source);
    state = { ...state, pendingChoices: state.pendingChoices.slice(1) };
    if (state.pendingChoices.length === 0) {
      state = { ...state, phase: 'playing' };
    }
    state = triggerAlly(state, playerIdx);
    return { state };
  }

  switch (action.type) {
    case 'PLAY_CARD': {
      const card = findCardInHand(state, playerIdx, action.cardUid);
      if (!card) return err(state, 'Card not in hand');
      const def = getCardDef(card.defId);

      const hand = player.hand.filter(c => c.uid !== card.uid);
      let inPlay = [...player.inPlay];
      let bases = [...player.bases];

      if (def.type === 'base' || def.type === 'outpost') {
        bases = [...bases, card];
      } else {
        inPlay = [...inPlay, card];
      }

      const players = [...state.players];
      players[playerIdx] = { ...player, hand, inPlay, bases };
      state = { ...state, players, log: addLog(state.log, actorId, `Plays ${def.name}`) };

      state = applyEffects(state, playerIdx, def.primary, card.uid, 'primary');

      if (state.pendingChoices.length > 0) {
        state = { ...state, phase: 'resolvingChoice' };
      }

      state = triggerAlly(state, playerIdx);

      if (state.pendingChoices.length > 0) {
        state = { ...state, phase: 'resolvingChoice' };
      }

      return { state };
    }

    case 'PLAY_ALL': {
      let s = state;
      const playableHand = [...player.hand];
      for (const card of playableHand) {
        if (s.pendingChoices.length > 0) break;
        const result = applyAction(s, { type: 'PLAY_CARD', cardUid: card.uid }, actorId);
        s = result.state;
      }
      return { state: s };
    }

    case 'BUY_CARD': {
      const trIdx = state.tradeRow.findIndex(c => c.uid === action.cardUid);
      if (trIdx === -1) return err(state, 'Card not in trade row');
      const card = state.tradeRow[trIdx];
      const def = getCardDef(card.defId);
      if (player.trade < def.cost) return err(state, 'Not enough trade');

      const tradeRow = state.tradeRow.filter((_, i) => i !== trIdx);
      const discard = [...player.discard, card];
      const players = [...state.players];
      players[playerIdx] = { ...player, trade: player.trade - def.cost, discard };
      state = { ...state, tradeRow, players, log: addLog(state.log, actorId, `Buys ${def.name}`) };
      state = refillTradeRow(state);
      return { state };
    }

    case 'ACQUIRE_EXPLORER': {
      if (state.explorers <= 0) return err(state, 'No explorers left');
      if (player.trade < 2) return err(state, 'Not enough trade');
      const explorerCard = makeCard('explorer');
      const discard = [...player.discard, explorerCard];
      const players = [...state.players];
      players[playerIdx] = { ...player, trade: player.trade - 2, discard };
      state = { ...state, explorers: state.explorers - 1, players, log: addLog(state.log, actorId, 'Acquires Explorer') };
      return { state };
    }

    case 'ATTACK_PLAYER': {
      if (player.combat <= 0) return err(state, 'No combat');
      if (!canAttackPlayer(state, actorId, action.targetId)) {
        return err(state, 'Cannot attack that player (outposts block)');
      }
      const targetIdx = state.players.findIndex(p => p.id === action.targetId);
      if (targetIdx === -1) return err(state, 'Target not found');
      const target = state.players[targetIdx];

      const damage = player.combat;
      const newAuth = Math.max(0, target.authority - damage);
      const players = [...state.players];
      players[playerIdx] = { ...player, combat: 0 };
      players[targetIdx] = {
        ...target,
        authority: newAuth,
        alive: newAuth > 0,
      };
      state = { ...state, players, log: addLog(state.log, actorId, `Attacks ${target.name} for ${damage} damage`) };
      if (newAuth <= 0) {
        state = { ...state, log: addLog(state.log, 'system', `${target.name} is eliminated!`) };
      }
      state = checkWin(state);
      return { state };
    }

    case 'ATTACK_BASE': {
      if (player.combat <= 0) return err(state, 'No combat');
      if (!canAttackBase(state, actorId, action.targetId, action.baseUid)) {
        return err(state, 'Cannot attack that base');
      }
      const targetIdx = state.players.findIndex(p => p.id === action.targetId);
      if (targetIdx === -1) return err(state, 'Target not found');
      const target = state.players[targetIdx];
      const base = target.bases.find(c => c.uid === action.baseUid);
      if (!base) return err(state, 'Base not found');
      const def = getCardDef(base.defId);
      const defense = def.defense ?? 0;

      if (player.combat < defense) return err(state, 'Not enough combat to destroy base');

      const players = [...state.players];
      players[playerIdx] = { ...player, combat: player.combat - defense };
      players[targetIdx] = {
        ...target,
        bases: target.bases.filter(c => c.uid !== action.baseUid),
      };
      const scrapHeap = [...state.scrapHeap, base];
      state = { ...state, players, scrapHeap, log: addLog(state.log, actorId, `Destroys ${target.name}'s ${def.name}`) };
      return { state };
    }

    case 'USE_SCRAP': {
      const card = findCard(state, playerIdx, action.cardUid);
      if (!card) return err(state, 'Card not found');
      if (player.scrapUsed.has(card.uid)) return err(state, 'Already scrapped');
      const def = getCardDef(card.defId);
      if (def.scrap.length === 0) return err(state, 'Card has no scrap ability');

      state = applyEffects(state, playerIdx, def.scrap, card.uid, 'scrap');

      const p = state.players[playerIdx];
      const removeFrom = (arr: CardInstance[]) => arr.filter(c => c.uid !== card.uid);
      const players = [...state.players];
      players[playerIdx] = {
        ...p,
        hand: removeFrom(p.hand),
        inPlay: removeFrom(p.inPlay),
        bases: removeFrom(p.bases),
        discard: removeFrom(p.discard),
        scrapUsed: new Set([...p.scrapUsed, card.uid]),
      };
      const scrapHeap = [...state.scrapHeap, card];
      state = { ...state, players, scrapHeap, log: addLog(state.log, actorId, `Scraps ${def.name}`) };

      if (state.pendingChoices.length > 0) {
        state = { ...state, phase: 'resolvingChoice' };
      }

      state = triggerAlly(state, playerIdx);
      return { state };
    }

    case 'END_TURN': {
      const p = state.players[playerIdx];
      const discard = [...p.discard, ...p.inPlay, ...p.hand];
      const players = [...state.players];
      players[playerIdx] = {
        ...p,
        hand: [],
        inPlay: [],
        discard,
        trade: 0,
        combat: 0,
        turnsTaken: p.turnsTaken + 1,
        allyTriggered: new Set(),
        scrapUsed: new Set(),
        pendingDiscards: 0,
      };
      state = { ...state, players, log: addLog(state.log, actorId, 'Ends turn') };
      state = drawCards(state, playerIdx, 5);
      state = advanceTurn(state);
      return { state };
    }

    default:
      return err(state, `Unknown action: ${(action as any).type}`);
  }
}

function advanceTurn(state: GameState): GameState {
  const n = state.players.length;
  let next = (state.turnIndex + 1) % n;
  let attempts = 0;
  while (!state.players[next].alive && attempts < n) {
    next = (next + 1) % n;
    attempts++;
  }
  return {
    ...state,
    turnIndex: next,
    turnNumber: state.turnNumber + 1,
    log: addLog(state.log, 'system', `${state.players[next].name}'s turn`),
  };
}
