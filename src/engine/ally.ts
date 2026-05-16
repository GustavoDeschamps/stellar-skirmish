import type { Faction, PlayerState, Effect } from './types';
import { getCardDef } from '../cards';

export function countFactionsInPlay(player: PlayerState): Map<Faction, number> {
  const counts = new Map<Faction, number>();
  const allInPlay = [...player.inPlay, ...player.bases];
  for (const card of allInPlay) {
    const def = getCardDef(card.defId);
    for (const f of def.factions) {
      counts.set(f, (counts.get(f) || 0) + 1);
    }
  }
  return counts;
}

export function getNewAllyEffects(player: PlayerState): Array<{ uid: string; effects: Effect[] }> {
  const factionCounts = countFactionsInPlay(player);
  const result: Array<{ uid: string; effects: Effect[] }> = [];

  const allInPlay = [...player.inPlay, ...player.bases];
  for (const card of allInPlay) {
    if (player.allyTriggered.has(card.uid)) continue;
    const def = getCardDef(card.defId);
    if (def.ally.length === 0) continue;

    const hasAlly = def.factions.some(f => f !== 'unaligned' && (factionCounts.get(f) || 0) >= 2);
    if (hasAlly) {
      result.push({ uid: card.uid, effects: def.ally });
    }
  }
  return result;
}
