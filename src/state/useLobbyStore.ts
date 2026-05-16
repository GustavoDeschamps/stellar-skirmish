import { create } from 'zustand';
import type { LobbyState } from '../net/protocol';

interface LobbyStore {
  lobby: LobbyState | null;
  isConnecting: boolean;
  error: string | null;
  setLobby: (lobby: LobbyState | null) => void;
  setConnecting: (v: boolean) => void;
  setError: (msg: string | null) => void;
}

export const useLobbyStore = create<LobbyStore>((set) => ({
  lobby: null,
  isConnecting: false,
  error: null,
  setLobby: (lobby) => set({ lobby }),
  setConnecting: (v) => set({ isConnecting: v }),
  setError: (msg) => set({ error: msg }),
}));
