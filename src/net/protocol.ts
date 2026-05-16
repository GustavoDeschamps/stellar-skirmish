import type { Action, GameState } from '../engine/types';

export interface LobbyPlayer {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
}

export interface LobbyState {
  roomCode: string;
  players: LobbyPlayer[];
  hostId: string;
}

export interface ChatMessage {
  id: string;
  from: string;
  fromName: string;
  to: 'all' | string;
  text: string;
  ts: number;
  system?: boolean;
}

// Client → Host
export type ClientMsg =
  | { t: 'JOIN_REQUEST'; name: string; avatar: string }
  | { t: 'ACTION'; action: Action }
  | { t: 'CHAT'; to: 'all' | string; text: string }
  | { t: 'PING'; ts: number };

// Host → Client
export type HostMsg =
  | { t: 'JOIN_ACCEPTED'; playerId: string; lobby: LobbyState }
  | { t: 'JOIN_REJECTED'; reason: string }
  | { t: 'LOBBY_UPDATE'; lobby: LobbyState }
  | { t: 'GAME_START'; state: GameState; playerId: string }
  | { t: 'STATE_UPDATE'; state: GameState }
  | { t: 'CHAT'; msg: ChatMessage }
  | { t: 'PLAYER_LEFT'; playerId: string; name: string }
  | { t: 'HOST_CLOSING' }
  | { t: 'PONG'; ts: number };

export function serializeState(state: GameState): string {
  return JSON.stringify(state, (_key, value) => {
    if (value instanceof Set) return { __set: [...value] };
    return value;
  });
}

export function deserializeState(json: string): GameState {
  return JSON.parse(json, (_key, value) => {
    if (value && value.__set) return new Set(value.__set);
    return value;
  });
}

export function redactStateForPlayer(state: GameState, playerId: string): GameState {
  return {
    ...state,
    players: state.players.map(p => {
      if (p.id === playerId) return p;
      return {
        ...p,
        hand: Array.from({ length: p.hand.length }, (_, i) => ({
          uid: `hidden-${i}`,
          defId: 'hidden',
        })),
        deck: Array.from({ length: p.deck.length }, (_, i) => ({
          uid: `hidden-deck-${i}`,
          defId: 'hidden',
        })),
      };
    }),
  };
}
