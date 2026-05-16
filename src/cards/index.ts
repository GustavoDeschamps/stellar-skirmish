import { nanoid } from 'nanoid';
import type { CardDef, CardInstance, RNG } from '../engine/types';
import { scout, viper, explorer } from './starter';
import { coreSetCards, coreSetPiles } from './coreSet';

export { scout, viper, explorer, coreSetCards, coreSetPiles };

const cardRegistry = new Map<string, CardDef>();

function register(def: CardDef) {
  cardRegistry.set(def.id, def);
}

[scout, viper, explorer, ...coreSetCards].forEach(register);

export function getCardDef(defId: string): CardDef {
  const def = cardRegistry.get(defId);
  if (!def) throw new Error(`Unknown card: ${defId}`);
  return def;
}

export function makeCard(defId: string): CardInstance {
  return { uid: nanoid(8), defId };
}

function shuffle<T>(arr: T[], rng: RNG): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildStarterDeck(rng: RNG): CardInstance[] {
  const cards: CardInstance[] = [];
  for (let i = 0; i < 8; i++) cards.push(makeCard('scout'));
  for (let i = 0; i < 2; i++) cards.push(makeCard('viper'));
  return shuffle(cards, rng);
}

export function buildTradeDeck(rng: RNG): CardInstance[] {
  const cards: CardInstance[] = [];
  for (const pile of coreSetPiles) {
    for (let i = 0; i < pile.count; i++) {
      cards.push(makeCard(pile.def.id));
    }
  }
  return shuffle(cards, rng);
}
