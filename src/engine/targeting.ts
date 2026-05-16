import type { GameState, PlayerState } from './types';
import { getCardDef } from '../cards';

export function getOutposts(player: PlayerState): string[] {
  return player.bases
    .filter(c => getCardDef(c.defId).type === 'outpost')
    .map(c => c.uid);
}

export function hasOutposts(player: PlayerState): boolean {
  return player.bases.some(c => getCardDef(c.defId).type === 'outpost');
}

export function canAttackPlayer(state: GameState, attackerId: string, targetId: string): boolean {
  const target = state.players.find(p => p.id === targetId);
  if (!target || !target.alive || targetId === attackerId) return false;
  return !hasOutposts(target);
}

export function canAttackBase(
  state: GameState,
  attackerId: string,
  targetId: string,
  baseUid: string,
): boolean {
  const target = state.players.find(p => p.id === targetId);
  if (!target || !target.alive || targetId === attackerId) return false;
  const base = target.bases.find(c => c.uid === baseUid);
  if (!base) return false;
  const def = getCardDef(base.defId);
  if (def.type === 'outpost') return true;
  return !hasOutposts(target);
}

export function getAttackableTargets(state: GameState, attackerId: string) {
  const targets: Array<{ playerId: string; type: 'player' | 'base'; baseUid?: string; defense?: number }> = [];
  for (const p of state.players) {
    if (p.id === attackerId || !p.alive) continue;
    if (canAttackPlayer(state, attackerId, p.id)) {
      targets.push({ playerId: p.id, type: 'player' });
    }
    for (const base of p.bases) {
      if (canAttackBase(state, attackerId, p.id, base.uid)) {
        const def = getCardDef(base.defId);
        targets.push({ playerId: p.id, type: 'base', baseUid: base.uid, defense: def.defense });
      }
    }
  }
  return targets;
}
