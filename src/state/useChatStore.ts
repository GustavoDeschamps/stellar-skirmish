import { create } from 'zustand';
import type { ChatMessage } from '../net/protocol';

const MAX_MESSAGES = 200;

interface ChatStore {
  messages: ChatMessage[];
  unreadCount: number;
  isOpen: boolean;
  addMessage: (msg: ChatMessage) => void;
  setOpen: (open: boolean) => void;
  markRead: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  unreadCount: 0,
  isOpen: false,

  addMessage: (msg) => {
    set(s => ({
      messages: [...s.messages.slice(-(MAX_MESSAGES - 1)), msg],
      unreadCount: s.isOpen ? 0 : s.unreadCount + 1,
    }));
  },

  setOpen: (open) => set({ isOpen: open, unreadCount: open ? 0 : get().unreadCount }),
  markRead: () => set({ unreadCount: 0 }),
}));
