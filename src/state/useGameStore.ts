import { create } from 'zustand';
import type { GameState, Action, GameOptions } from '../engine/types';
import { newGame } from '../engine/setup';
import { applyAction } from '../engine/reducer';
import { createRNG } from '../engine/rng';

type AppMode = 'menu' | 'lobby' | 'hotseat' | 'online';

interface GameStore {
  mode: AppMode;
  gameState: GameState | null;
  localPlayerId: string;
  errors: string[];
  hotseatPlayerNames: string[];

  setMode: (mode: AppMode) => void;
  startHotseatGame: (names: string[], options?: Partial<GameOptions>) => void;
  dispatch: (action: Action, actorId?: string) => void;
  clearErrors: () => void;
  setGameState: (state: GameState) => void;
  setLocalPlayerId: (id: string) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  mode: 'menu',
  gameState: null,
  localPlayerId: '',
  errors: [],
  hotseatPlayerNames: [],

  setMode: (mode) => set({ mode }),

  startHotseatGame: (names, options) => {
    const rng = createRNG();
    const playerInfos = names.map((name, i) => ({
      id: `player-${i}`,
      name,
      avatar: ['🚀', '⭐', '🌙', '🪐', '☄️', '🌌', '🔭', '💫'][i] || '🎮',
    }));
    const state = newGame(playerInfos, rng, options);
    set({
      gameState: state,
      localPlayerId: 'player-0',
      hotseatPlayerNames: names,
      mode: 'hotseat',
    });
  },

  dispatch: (action, actorId) => {
    const { gameState } = get();
    if (!gameState) return;
    const actor = actorId ?? gameState.players[gameState.turnIndex].id;
    const result = applyAction(gameState, action, actor);
    set({ gameState: result.state, errors: result.errors || [] });
  },

  clearErrors: () => set({ errors: [] }),
  setGameState: (state) => set({ gameState: state }),
  setLocalPlayerId: (id) => set({ localPlayerId: id }),
}));
