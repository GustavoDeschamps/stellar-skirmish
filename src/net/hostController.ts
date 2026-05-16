import { nanoid } from 'nanoid';
import type { GameState, Action } from '../engine/types';
import { applyAction } from '../engine/reducer';
import { newGame } from '../engine/setup';
import { createRNG } from '../engine/rng';
import { createHost, type PeerHost } from './peer';
import { generateRoomCode } from './codeGen';
import type { ClientMsg, HostMsg, LobbyPlayer, LobbyState, ChatMessage } from './protocol';
import { redactStateForPlayer } from './protocol';

interface HostState {
  lobby: LobbyState;
  gameState: GameState | null;
  connToPlayer: Map<string, string>;
  playerToConn: Map<string, string>;
  host: PeerHost | null;
}

export interface HostController {
  state: HostState;
  roomCode: string;
  startGame: () => void;
  destroy: () => void;
}

export async function createHostController(
  hostName: string,
  hostAvatar: string,
  onLobbyUpdate: (lobby: LobbyState) => void,
  onGameStart: (state: GameState, playerId: string) => void,
  onStateUpdate: (state: GameState) => void,
  onChat: (msg: ChatMessage) => void,
  onError: (msg: string) => void,
): Promise<HostController> {
  const hostPlayerId = `host-${nanoid(6)}`;
  let roomCode = '';
  let attempts = 0;
  let host: PeerHost | null = null;

  const hs: HostState = {
    lobby: { roomCode: '', players: [], hostId: hostPlayerId },
    gameState: null,
    connToPlayer: new Map(),
    playerToConn: new Map(),
    host: null,
  };

  const hostPlayer: LobbyPlayer = {
    id: hostPlayerId,
    name: hostName,
    avatar: hostAvatar,
    isHost: true,
  };

  function broadcastLobby() {
    const msg: HostMsg = { t: 'LOBBY_UPDATE', lobby: hs.lobby };
    host?.broadcast(msg);
    onLobbyUpdate(hs.lobby);
  }

  function broadcastState() {
    if (!hs.gameState) return;
    for (const [connId, playerId] of hs.connToPlayer) {
      const redacted = redactStateForPlayer(hs.gameState, playerId);
      host?.sendTo(connId, { t: 'STATE_UPDATE', state: redacted } as HostMsg);
    }
    onStateUpdate(hs.gameState);
  }

  function broadcastChat(msg: ChatMessage) {
    if (msg.to === 'all') {
      host?.broadcast({ t: 'CHAT', msg } as HostMsg);
    } else {
      const targetConn = hs.playerToConn.get(msg.to);
      if (targetConn) host?.sendTo(targetConn, { t: 'CHAT', msg } as HostMsg);
      const senderConn = hs.playerToConn.get(msg.from);
      if (senderConn) host?.sendTo(senderConn, { t: 'CHAT', msg } as HostMsg);
    }
    onChat(msg);
  }

  function handleAction(action: Action, playerId: string) {
    if (!hs.gameState) return;
    const result = applyAction(hs.gameState, action, playerId);
    if (result.errors?.length) {
      onError(result.errors.join(', '));
      return;
    }
    hs.gameState = result.state;
    broadcastState();
  }

  function onData(data: unknown, connId: string) {
    const msg = data as ClientMsg;
    switch (msg.t) {
      case 'JOIN_REQUEST': {
        if (hs.gameState) {
          host?.sendTo(connId, { t: 'JOIN_REJECTED', reason: 'Game already in progress' } as HostMsg);
          return;
        }
        if (hs.lobby.players.length >= 8) {
          host?.sendTo(connId, { t: 'JOIN_REJECTED', reason: 'Lobby is full' } as HostMsg);
          return;
        }
        const playerId = `p-${nanoid(6)}`;
        const player: LobbyPlayer = { id: playerId, name: msg.name, avatar: msg.avatar, isHost: false };
        hs.lobby.players.push(player);
        hs.connToPlayer.set(connId, playerId);
        hs.playerToConn.set(playerId, connId);
        host?.sendTo(connId, { t: 'JOIN_ACCEPTED', playerId, lobby: hs.lobby } as HostMsg);
        broadcastLobby();
        broadcastChat({
          id: nanoid(8), from: 'system', fromName: 'System',
          to: 'all', text: `${msg.name} joined the game`, ts: Date.now(), system: true,
        });
        break;
      }
      case 'ACTION': {
        const playerId = hs.connToPlayer.get(connId);
        if (playerId) handleAction(msg.action, playerId);
        break;
      }
      case 'CHAT': {
        const playerId = hs.connToPlayer.get(connId);
        const player = hs.lobby.players.find(p => p.id === playerId);
        if (playerId && player) {
          broadcastChat({
            id: nanoid(8), from: playerId, fromName: player.name,
            to: msg.to, text: msg.text, ts: Date.now(),
          });
        }
        break;
      }
      case 'PING': {
        host?.sendTo(connId, { t: 'PONG', ts: msg.ts } as HostMsg);
        break;
      }
    }
  }

  function onConnect(_connId: string) {
    // handled by JOIN_REQUEST
  }

  function onDisconnect(connId: string) {
    const playerId = hs.connToPlayer.get(connId);
    if (playerId) {
      const player = hs.lobby.players.find(p => p.id === playerId);
      hs.lobby.players = hs.lobby.players.filter(p => p.id !== playerId);
      hs.connToPlayer.delete(connId);
      hs.playerToConn.delete(playerId);
      host?.broadcast({ t: 'PLAYER_LEFT', playerId, name: player?.name ?? 'Unknown' } as HostMsg);
      broadcastLobby();
      if (player) {
        broadcastChat({
          id: nanoid(8), from: 'system', fromName: 'System',
          to: 'all', text: `${player.name} left the game`, ts: Date.now(), system: true,
        });
      }
      if (hs.gameState) {
        const result = applyAction(hs.gameState, { type: 'CONCEDE' }, playerId);
        hs.gameState = result.state;
        broadcastState();
      }
    }
  }

  while (attempts < 5) {
    roomCode = generateRoomCode();
    try {
      host = await createHost(roomCode, onData, onConnect, onDisconnect, (err) => onError(err.message));
      break;
    } catch {
      attempts++;
    }
  }

  if (!host) throw new Error('Failed to create room after 5 attempts');

  hs.lobby = { roomCode, players: [hostPlayer], hostId: hostPlayerId };
  hs.host = host;
  onLobbyUpdate(hs.lobby);

  return {
    state: hs,
    roomCode,
    startGame: () => {
      if (hs.lobby.players.length < 2) {
        onError('Need at least 2 players');
        return;
      }
      const rng = createRNG();
      const playerInfos = hs.lobby.players.map(p => ({ id: p.id, name: p.name, avatar: p.avatar }));
      hs.gameState = newGame(playerInfos, rng);

      for (const [connId, playerId] of hs.connToPlayer) {
        const redacted = redactStateForPlayer(hs.gameState, playerId);
        host?.sendTo(connId, { t: 'GAME_START', state: redacted, playerId } as HostMsg);
      }
      onGameStart(hs.gameState, hostPlayerId);
    },
    destroy: () => {
      host?.broadcast({ t: 'HOST_CLOSING' } as HostMsg);
      host?.destroy();
    },
  };
}
