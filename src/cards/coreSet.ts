import type { CardDef } from '../engine/types';

const tradeFederation: CardDef[] = [
  {
    id: 'federation-shuttle', name: 'Federation Shuttle', cost: 1,
    factions: ['trade'], type: 'ship',
    primary: [{ kind: 'trade', amount: 2 }],
    ally: [{ kind: 'authority', amount: 4 }],
    scrap: [],
  },
  {
    id: 'cutter', name: 'Cutter', cost: 2,
    factions: ['trade'], type: 'ship',
    primary: [{ kind: 'trade', amount: 2 }, { kind: 'authority', amount: 4 }],
    ally: [{ kind: 'combat', amount: 4 }],
    scrap: [],
  },
  {
    id: 'embassy-yacht', name: 'Embassy Yacht', cost: 3,
    factions: ['trade'], type: 'ship',
    primary: [{ kind: 'trade', amount: 2 }, { kind: 'authority', amount: 3 }, { kind: 'draw', amount: 2 }],
    ally: [],
    scrap: [],
  },
  {
    id: 'freighter', name: 'Freighter', cost: 4,
    factions: ['trade'], type: 'ship',
    primary: [{ kind: 'trade', amount: 4 }],
    ally: [{ kind: 'authority', amount: 4 }],
    scrap: [],
  },
  {
    id: 'trade-escort', name: 'Trade Escort', cost: 5,
    factions: ['trade'], type: 'ship',
    primary: [{ kind: 'trade', amount: 3 }, { kind: 'authority', amount: 4 }],
    ally: [{ kind: 'draw', amount: 1 }],
    scrap: [],
  },
  {
    id: 'flagship', name: 'Flagship', cost: 6,
    factions: ['trade'], type: 'ship',
    primary: [{ kind: 'trade', amount: 5 }, { kind: 'draw', amount: 1 }],
    ally: [{ kind: 'authority', amount: 5 }],
    scrap: [],
  },
  {
    id: 'command-ship', name: 'Command Ship', cost: 8,
    factions: ['trade'], type: 'ship',
    primary: [{ kind: 'authority', amount: 4 }, { kind: 'trade', amount: 5 }, { kind: 'draw', amount: 2 }],
    ally: [{ kind: 'destroyBase' }],
    scrap: [],
  },
  {
    id: 'trading-post', name: 'Trading Post', cost: 3,
    factions: ['trade'], type: 'outpost', defense: 4,
    primary: [{ kind: 'choice', options: [[{ kind: 'trade', amount: 1 }], [{ kind: 'authority', amount: 1 }]] }],
    ally: [],
    scrap: [],
  },
  {
    id: 'barter-world', name: 'Barter World', cost: 4,
    factions: ['trade'], type: 'base', defense: 4,
    primary: [{ kind: 'choice', options: [[{ kind: 'trade', amount: 2 }], [{ kind: 'authority', amount: 2 }]] }],
    ally: [],
    scrap: [],
  },
  {
    id: 'defense-center', name: 'Defense Center', cost: 5,
    factions: ['trade'], type: 'outpost', defense: 5,
    primary: [{ kind: 'choice', options: [[{ kind: 'combat', amount: 2 }], [{ kind: 'authority', amount: 3 }]] }],
    ally: [],
    scrap: [],
  },
  {
    id: 'port-of-call', name: 'Port of Call', cost: 6,
    factions: ['trade'], type: 'outpost', defense: 6,
    primary: [{ kind: 'trade', amount: 3 }],
    ally: [],
    scrap: [{ kind: 'draw', amount: 1 }, { kind: 'destroyBase' }],
  },
  {
    id: 'central-office', name: 'Central Office', cost: 7,
    factions: ['trade'], type: 'base', defense: 6,
    primary: [{ kind: 'trade', amount: 2 }, { kind: 'acquireToTopOfDeck', maxCost: 99 }],
    ally: [{ kind: 'draw', amount: 1 }],
    scrap: [],
  },
];

const blob: CardDef[] = [
  {
    id: 'blob-fighter', name: 'Blob Fighter', cost: 1,
    factions: ['blob'], type: 'ship',
    primary: [{ kind: 'combat', amount: 3 }],
    ally: [{ kind: 'draw', amount: 1 }],
    scrap: [],
  },
  {
    id: 'trade-pod', name: 'Trade Pod', cost: 2,
    factions: ['blob'], type: 'ship',
    primary: [{ kind: 'trade', amount: 3 }],
    ally: [{ kind: 'combat', amount: 2 }],
    scrap: [],
  },
  {
    id: 'battle-pod', name: 'Battle Pod', cost: 2,
    factions: ['blob'], type: 'ship',
    primary: [{ kind: 'combat', amount: 4 }, { kind: 'scrapTradeRow', upTo: 1 }],
    ally: [{ kind: 'combat', amount: 2 }],
    scrap: [],
  },
  {
    id: 'ram', name: 'Ram', cost: 3,
    factions: ['blob'], type: 'ship',
    primary: [{ kind: 'combat', amount: 5 }],
    ally: [{ kind: 'combat', amount: 2 }],
    scrap: [{ kind: 'trade', amount: 3 }],
  },
  {
    id: 'blob-wheel', name: 'Blob Wheel', cost: 3,
    factions: ['blob'], type: 'base', defense: 5,
    primary: [{ kind: 'combat', amount: 1 }],
    ally: [],
    scrap: [{ kind: 'trade', amount: 3 }],
  },
  {
    id: 'blob-destroyer', name: 'Blob Destroyer', cost: 4,
    factions: ['blob'], type: 'ship',
    primary: [{ kind: 'combat', amount: 6 }],
    ally: [{ kind: 'destroyBase' }, { kind: 'scrapTradeRow', upTo: 1 }],
    scrap: [],
  },
  {
    id: 'battle-blob', name: 'Battle Blob', cost: 6,
    factions: ['blob'], type: 'ship',
    primary: [{ kind: 'combat', amount: 8 }],
    ally: [{ kind: 'draw', amount: 1 }],
    scrap: [],
  },
  {
    id: 'blob-carrier', name: 'Blob Carrier', cost: 6,
    factions: ['blob'], type: 'ship',
    primary: [{ kind: 'combat', amount: 7 }],
    ally: [{ kind: 'acquireShipFree', maxCost: 0, topOfDeck: true }],
    scrap: [],
  },
  {
    id: 'mothership', name: 'Mothership', cost: 7,
    factions: ['blob'], type: 'ship',
    primary: [{ kind: 'combat', amount: 6 }, { kind: 'draw', amount: 1 }],
    ally: [{ kind: 'draw', amount: 1 }],
    scrap: [],
  },
  {
    id: 'the-hive', name: 'The Hive', cost: 5,
    factions: ['blob'], type: 'base', defense: 5,
    primary: [{ kind: 'combat', amount: 3 }],
    ally: [{ kind: 'draw', amount: 1 }],
    scrap: [],
  },
  {
    id: 'blob-world', name: 'Blob World', cost: 8,
    factions: ['blob'], type: 'base', defense: 7,
    primary: [{ kind: 'choice', options: [[{ kind: 'combat', amount: 5 }], [{ kind: 'draw', amount: 3 }]] }],
    ally: [],
    scrap: [],
  },
];

const starEmpire: CardDef[] = [
  {
    id: 'imperial-fighter', name: 'Imperial Fighter', cost: 1,
    factions: ['empire'], type: 'ship',
    primary: [{ kind: 'combat', amount: 2 }, { kind: 'discardOpponent', amount: 1 }],
    ally: [{ kind: 'combat', amount: 2 }],
    scrap: [],
  },
  {
    id: 'corvette', name: 'Corvette', cost: 2,
    factions: ['empire'], type: 'ship',
    primary: [{ kind: 'combat', amount: 1 }, { kind: 'draw', amount: 1 }],
    ally: [{ kind: 'combat', amount: 2 }],
    scrap: [],
  },
  {
    id: 'survey-ship', name: 'Survey Ship', cost: 3,
    factions: ['empire'], type: 'ship',
    primary: [{ kind: 'trade', amount: 1 }, { kind: 'draw', amount: 1 }],
    ally: [],
    scrap: [{ kind: 'discardOpponent', amount: 1 }],
  },
  {
    id: 'imperial-frigate', name: 'Imperial Frigate', cost: 3,
    factions: ['empire'], type: 'ship',
    primary: [{ kind: 'combat', amount: 4 }, { kind: 'discardOpponent', amount: 1 }],
    ally: [{ kind: 'combat', amount: 2 }],
    scrap: [],
  },
  {
    id: 'battlecruiser', name: 'Battlecruiser', cost: 6,
    factions: ['empire'], type: 'ship',
    primary: [{ kind: 'combat', amount: 5 }, { kind: 'draw', amount: 1 }],
    ally: [{ kind: 'discardOpponent', amount: 1 }],
    scrap: [{ kind: 'draw', amount: 1 }, { kind: 'destroyBase' }],
  },
  {
    id: 'dreadnought', name: 'Dreadnought', cost: 7,
    factions: ['empire'], type: 'ship',
    primary: [{ kind: 'combat', amount: 7 }, { kind: 'draw', amount: 1 }],
    ally: [],
    scrap: [{ kind: 'combat', amount: 5 }],
  },
  {
    id: 'space-station', name: 'Space Station', cost: 4,
    factions: ['empire'], type: 'outpost', defense: 4,
    primary: [{ kind: 'combat', amount: 2 }],
    ally: [{ kind: 'combat', amount: 2 }],
    scrap: [{ kind: 'trade', amount: 4 }],
  },
  {
    id: 'recycling-station', name: 'Recycling Station', cost: 4,
    factions: ['empire'], type: 'outpost', defense: 4,
    primary: [{ kind: 'choice', options: [[{ kind: 'trade', amount: 1 }], [{ kind: 'combat', amount: 2 }]] }],
    ally: [],
    scrap: [],
  },
  {
    id: 'war-world', name: 'War World', cost: 5,
    factions: ['empire'], type: 'outpost', defense: 4,
    primary: [{ kind: 'combat', amount: 3 }],
    ally: [{ kind: 'combat', amount: 4 }],
    scrap: [],
  },
  {
    id: 'royal-redoubt', name: 'Royal Redoubt', cost: 6,
    factions: ['empire'], type: 'outpost', defense: 6,
    primary: [{ kind: 'combat', amount: 3 }],
    ally: [{ kind: 'discardOpponent', amount: 1 }],
    scrap: [],
  },
  {
    id: 'fleet-hq', name: 'Fleet HQ', cost: 8,
    factions: ['empire'], type: 'base', defense: 8,
    primary: [],
    ally: [],
    scrap: [],
  },
];

const machineCult: CardDef[] = [
  {
    id: 'trade-bot', name: 'Trade Bot', cost: 1,
    factions: ['cult'], type: 'ship',
    primary: [{ kind: 'trade', amount: 1 }, { kind: 'scrapFromHandOrDiscard', upTo: 1 }],
    ally: [{ kind: 'combat', amount: 2 }],
    scrap: [],
  },
  {
    id: 'missile-bot', name: 'Missile Bot', cost: 2,
    factions: ['cult'], type: 'ship',
    primary: [{ kind: 'combat', amount: 2 }, { kind: 'scrapFromHandOrDiscard', upTo: 1 }],
    ally: [{ kind: 'combat', amount: 2 }],
    scrap: [],
  },
  {
    id: 'supply-bot', name: 'Supply Bot', cost: 3,
    factions: ['cult'], type: 'ship',
    primary: [{ kind: 'trade', amount: 2 }, { kind: 'scrapFromHandOrDiscard', upTo: 1 }],
    ally: [{ kind: 'combat', amount: 2 }],
    scrap: [],
  },
  {
    id: 'patrol-mech', name: 'Patrol Mech', cost: 4,
    factions: ['cult'], type: 'ship',
    primary: [{ kind: 'choice', options: [[{ kind: 'trade', amount: 3 }], [{ kind: 'combat', amount: 5 }]] }],
    ally: [{ kind: 'scrapFromHandOrDiscard', upTo: 1 }],
    scrap: [],
  },
  {
    id: 'stealth-needle', name: 'Stealth Needle', cost: 4,
    factions: ['cult'], type: 'ship',
    primary: [{ kind: 'copyShip' }],
    ally: [],
    scrap: [],
  },
  {
    id: 'battle-mech', name: 'Battle Mech', cost: 5,
    factions: ['cult'], type: 'ship',
    primary: [{ kind: 'combat', amount: 4 }, { kind: 'scrapFromHandOrDiscard', upTo: 1 }],
    ally: [{ kind: 'draw', amount: 1 }],
    scrap: [],
  },
  {
    id: 'missile-mech', name: 'Missile Mech', cost: 6,
    factions: ['cult'], type: 'ship',
    primary: [{ kind: 'combat', amount: 6 }, { kind: 'destroyBase' }],
    ally: [{ kind: 'draw', amount: 1 }],
    scrap: [],
  },
  {
    id: 'mech-world', name: 'Mech World', cost: 5,
    factions: ['trade', 'blob', 'empire', 'cult'], type: 'outpost', defense: 6,
    primary: [],
    ally: [],
    scrap: [],
  },
  {
    id: 'brain-world', name: 'Brain World', cost: 8,
    factions: ['cult'], type: 'outpost', defense: 6,
    primary: [{ kind: 'scrapFromHandOrDiscard', upTo: 2 }],
    ally: [],
    scrap: [],
  },
  {
    id: 'machine-base', name: 'Machine Base', cost: 7,
    factions: ['cult'], type: 'outpost', defense: 6,
    primary: [{ kind: 'draw', amount: 1 }, { kind: 'scrapFromHandOrDiscard', upTo: 1 }],
    ally: [],
    scrap: [],
  },
  {
    id: 'junkyard', name: 'Junkyard', cost: 3,
    factions: ['cult'], type: 'outpost', defense: 5,
    primary: [{ kind: 'scrapFromHandOrDiscard', upTo: 1 }],
    ally: [],
    scrap: [],
  },
];

export const coreSetCards: CardDef[] = [
  ...tradeFederation,
  ...blob,
  ...starEmpire,
  ...machineCult,
];

export interface CardPile {
  def: CardDef;
  count: number;
}

export const coreSetPiles: CardPile[] = [
  // Trade Federation
  { def: tradeFederation[0], count: 3 },  // Federation Shuttle
  { def: tradeFederation[1], count: 3 },  // Cutter
  { def: tradeFederation[2], count: 2 },  // Embassy Yacht
  { def: tradeFederation[3], count: 3 },  // Freighter
  { def: tradeFederation[4], count: 2 },  // Trade Escort
  { def: tradeFederation[5], count: 1 },  // Flagship
  { def: tradeFederation[6], count: 1 },  // Command Ship
  { def: tradeFederation[7], count: 2 },  // Trading Post
  { def: tradeFederation[8], count: 2 },  // Barter World
  { def: tradeFederation[9], count: 1 },  // Defense Center
  { def: tradeFederation[10], count: 1 }, // Port of Call
  { def: tradeFederation[11], count: 1 }, // Central Office

  // Blob
  { def: blob[0], count: 3 },  // Blob Fighter
  { def: blob[1], count: 3 },  // Trade Pod
  { def: blob[2], count: 2 },  // Battle Pod
  { def: blob[3], count: 2 },  // Ram
  { def: blob[4], count: 3 },  // Blob Wheel
  { def: blob[5], count: 2 },  // Blob Destroyer
  { def: blob[6], count: 1 },  // Battle Blob
  { def: blob[7], count: 1 },  // Blob Carrier
  { def: blob[8], count: 1 },  // Mothership
  { def: blob[9], count: 1 },  // The Hive
  { def: blob[10], count: 1 }, // Blob World

  // Star Empire
  { def: starEmpire[0], count: 3 },  // Imperial Fighter
  { def: starEmpire[1], count: 2 },  // Corvette
  { def: starEmpire[2], count: 3 },  // Survey Ship
  { def: starEmpire[3], count: 2 },  // Imperial Frigate
  { def: starEmpire[4], count: 1 },  // Battlecruiser
  { def: starEmpire[5], count: 1 },  // Dreadnought
  { def: starEmpire[6], count: 2 },  // Space Station
  { def: starEmpire[7], count: 2 },  // Recycling Station
  { def: starEmpire[8], count: 1 },  // War World
  { def: starEmpire[9], count: 1 },  // Royal Redoubt
  { def: starEmpire[10], count: 1 }, // Fleet HQ

  // Machine Cult
  { def: machineCult[0], count: 3 },  // Trade Bot
  { def: machineCult[1], count: 3 },  // Missile Bot
  { def: machineCult[2], count: 3 },  // Supply Bot
  { def: machineCult[3], count: 2 },  // Patrol Mech
  { def: machineCult[4], count: 2 },  // Stealth Needle
  { def: machineCult[5], count: 1 },  // Battle Mech
  { def: machineCult[6], count: 1 },  // Missile Mech
  { def: machineCult[7], count: 1 },  // Mech World
  { def: machineCult[8], count: 1 },  // Brain World
  { def: machineCult[9], count: 1 },  // Machine Base
  { def: machineCult[10], count: 2 }, // Junkyard
];
