import type { Action, GameState } from '../engine/types';
import { connectToHost, type PeerClient } from './peer';
import type { ClientMsg, HostMsg, LobbyState, ChatMessage } from './protocol';

export interface ClientController {
  playerId: string;
  send: (action: Action) => void;
  sendChat: (to: 'all' | string, text: string) => void;
  destroy: () => void;
}

export async function createClientController(
  roomCode: string,
  playerName: string,
  playerAvatar: string,
  onLobbyUpdate: (lobby: LobbyState) => void,
  onGameStart: (state: GameState, playerId: string) => void,
  onStateUpdate: (state: GameState) => void,
  onChat: (msg: ChatMessage) => void,
  onPlayerLeft: (name: string) => void,
  onHostClosed: () => void,
  onError: (msg: string) => void,
): Promise<ClientController> {
  let myPlayerId = '';
  let client: PeerClient | null = null;

  function onData(data: unknown) {
    const msg = data as HostMsg;
    switch (msg.t) {
      case 'JOIN_ACCEPTED':
        myPlayerId = msg.playerId;
        onLobbyUpdate(msg.lobby);
        break;
      case 'JOIN_REJECTED':
        onError(`Join rejected: ${msg.reason}`);
        break;
      case 'LOBBY_UPDATE':
        onLobbyUpdate(msg.lobby);
        break;
      case 'GAME_START':
        myPlayerId = msg.playerId;
        onGameStart(restoreState(msg.state), msg.playerId);
        break;
      case 'STATE_UPDATE':
        onStateUpdate(restoreState(msg.state));
        break;
      case 'CHAT':
        onChat(msg.msg);
        break;
      case 'PLAYER_LEFT':
        onPlayerLeft(msg.name);
        break;
      case 'HOST_CLOSING':
        onHostClosed();
        break;
    }
  }

  client = await connectToHost(
    roomCode.toUpperCase(),
    (data) => onData(data),
    () => onHostClosed(),
    (err) => onError(err.message),
  );

  // Send join request
  client.send({
    t: 'JOIN_REQUEST',
    name: playerName,
    avatar: playerAvatar,
  } as ClientMsg);

  return {
    get playerId() { return myPlayerId; },
    send: (action) => {
      client?.send({ t: 'ACTION', action } as ClientMsg);
    },
    sendChat: (to, text) => {
      client?.send({ t: 'CHAT', to, text } as ClientMsg);
    },
    destroy: () => {
      client?.destroy();
    },
  };
}

function restoreState(state: GameState): GameState {
  return {
    ...state,
    players: state.players.map(p => ({
      ...p,
      allyTriggered: p.allyTriggered instanceof Set ? p.allyTriggered : new Set(p.allyTriggered as unknown as string[]),
      scrapUsed: p.scrapUsed instanceof Set ? p.scrapUsed : new Set(p.scrapUsed as unknown as string[]),
    })),
  };
}
