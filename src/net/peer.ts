import Peer, { type DataConnection } from 'peerjs';

export type OnData = (data: unknown, connId: string) => void;
export type OnConnect = (connId: string) => void;
export type OnDisconnect = (connId: string) => void;
export type OnError = (err: Error) => void;

export interface PeerHost {
  peer: Peer;
  connections: Map<string, DataConnection>;
  broadcast: (data: unknown) => void;
  sendTo: (connId: string, data: unknown) => void;
  destroy: () => void;
}

export interface PeerClient {
  peer: Peer;
  connection: DataConnection;
  send: (data: unknown) => void;
  destroy: () => void;
}

export function createHost(
  roomCode: string,
  onData: OnData,
  onConnect: OnConnect,
  onDisconnect: OnDisconnect,
  onError: OnError,
): Promise<PeerHost> {
  return new Promise((resolve, reject) => {
    const peer = new Peer(roomCode, {
      debug: 1,
    });
    const connections = new Map<string, DataConnection>();

    peer.on('open', () => {
      const host: PeerHost = {
        peer,
        connections,
        broadcast: (data) => {
          const msg = JSON.stringify(data);
          connections.forEach(conn => {
            if (conn.open) conn.send(msg);
          });
        },
        sendTo: (connId, data) => {
          const conn = connections.get(connId);
          if (conn?.open) conn.send(JSON.stringify(data));
        },
        destroy: () => {
          connections.forEach(c => c.close());
          peer.destroy();
        },
      };

      peer.on('connection', (conn) => {
        conn.on('open', () => {
          connections.set(conn.connectionId, conn);
          onConnect(conn.connectionId);
        });

        conn.on('data', (rawData) => {
          try {
            const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
            onData(data, conn.connectionId);
          } catch {
            // ignore malformed messages
          }
        });

        conn.on('close', () => {
          connections.delete(conn.connectionId);
          onDisconnect(conn.connectionId);
        });

        conn.on('error', (err) => onError(err));
      });

      peer.on('error', (err) => onError(err));
      resolve(host);
    });

    peer.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        peer.destroy();
        reject(new Error('Room code already in use'));
      } else {
        onError(err);
      }
    });
  });
}

export function connectToHost(
  roomCode: string,
  onData: OnData,
  onDisconnect: () => void,
  onError: OnError,
): Promise<PeerClient> {
  return new Promise((resolve, reject) => {
    const peer = new Peer({
      debug: 1,
    });

    peer.on('open', () => {
      const conn = peer.connect(roomCode, { reliable: true });

      conn.on('open', () => {
        const client: PeerClient = {
          peer,
          connection: conn,
          send: (data) => {
            if (conn.open) conn.send(JSON.stringify(data));
          },
          destroy: () => {
            conn.close();
            peer.destroy();
          },
        };
        resolve(client);
      });

      conn.on('data', (rawData) => {
        try {
          const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
          onData(data, conn.connectionId);
        } catch {
          // ignore malformed messages
        }
      });

      conn.on('close', onDisconnect);
      conn.on('error', (err) => onError(err));
    });

    peer.on('error', (err) => {
      reject(err);
    });

    setTimeout(() => reject(new Error('Connection timeout')), 15000);
  });
}
