import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../state/useChatStore';
import { useGameStore } from '../../state/useGameStore';
import { getHostController } from '../Lobby/CreateGame';
import { getClientController } from '../Lobby/JoinGame';
import { nanoid } from 'nanoid';
import { MessageCircle, X, Send } from 'lucide-react';
import type { ChatMessage } from '../../net/protocol';

export default function ChatPanel() {
  const { messages, unreadCount, isOpen, setOpen, addMessage } = useChatStore();
  const { gameState, localPlayerId, mode } = useGameStore();
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isOpen]);

  const isOnline = mode === 'online';
  const players = gameState?.players ?? [];
  const myName = players.find(p => p.id === localPlayerId)?.name ?? 'You';

  function sendMessage() {
    const trimmed = text.trim();
    if (!trimmed) return;

    let to: 'all' | string = 'all';
    let content = trimmed;
    const whisperMatch = trimmed.match(/^@(\S+)\s+(.+)/);
    if (whisperMatch) {
      const targetName = whisperMatch[1];
      const target = players.find(p => p.name.toLowerCase() === targetName.toLowerCase() && p.id !== localPlayerId);
      if (target) {
        to = target.id;
        content = whisperMatch[2];
      }
    }

    if (isOnline) {
      const host = getHostController();
      const client = getClientController();
      if (host) {
        const msg: ChatMessage = {
          id: nanoid(8), from: localPlayerId, fromName: myName,
          to, text: content, ts: Date.now(),
        };
        // Host broadcasts directly
        if (to === 'all') {
          host.state.host?.broadcast({ t: 'CHAT', msg });
        } else {
          const targetConn = host.state.playerToConn.get(to);
          if (targetConn) host.state.host?.sendTo(targetConn, { t: 'CHAT', msg });
        }
        addMessage(msg);
      } else if (client) {
        client.sendChat(to, content);
      }
    } else {
      addMessage({
        id: nanoid(8), from: localPlayerId, fromName: myName,
        to, text: content, ts: Date.now(),
      });
    }

    setText('');
    inputRef.current?.focus();
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full p-3 shadow-lg z-40"
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl flex flex-col z-40 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <span className="text-sm font-bold text-white">Chat</span>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map(msg => {
          const isSystem = msg.system || msg.from === 'system';
          const isWhisper = msg.to !== 'all';
          const isMe = msg.from === localPlayerId;
          return (
            <div key={msg.id} className={`text-sm ${isSystem ? 'text-gray-500 italic' : ''}`}>
              {isSystem ? (
                <span>{msg.text}</span>
              ) : (
                <>
                  <span className={`font-medium ${isMe ? 'text-blue-400' : 'text-green-400'}`}>
                    {msg.fromName}
                  </span>
                  {isWhisper && (
                    <span className="text-purple-400 text-xs ml-1">
                      (whisper{!isMe ? '' : ` to ${players.find(p => p.id === msg.to)?.name ?? '?'}`})
                    </span>
                  )}
                  <span className="text-gray-300 ml-1">{msg.text}</span>
                </>
              )}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white"
            placeholder="Message (@name for whisper)"
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim()}
            className="text-blue-400 hover:text-blue-300 disabled:opacity-40"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
