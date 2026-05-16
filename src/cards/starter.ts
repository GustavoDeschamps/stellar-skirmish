import type { CardDef } from '../engine/types';

export const scout: CardDef = {
  id: 'scout',
  name: 'Scout',
  cost: 0,
  factions: ['unaligned'],
  type: 'ship',
  primary: [{ kind: 'trade', amount: 1 }],
  ally: [],
  scrap: [],
};

export const viper: CardDef = {
  id: 'viper',
  name: 'Viper',
  cost: 0,
  factions: ['unaligned'],
  type: 'ship',
  primary: [{ kind: 'combat', amount: 1 }],
  ally: [],
  scrap: [],
};

export const explorer: CardDef = {
  id: 'explorer',
  name: 'Explorer',
  cost: 2,
  factions: ['unaligned'],
  type: 'ship',
  primary: [{ kind: 'trade', amount: 2 }],
  ally: [],
  scrap: [{ kind: 'combat', amount: 2 }],
};
