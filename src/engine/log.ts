import type { LogEntry } from './types';

export function addLog(log: LogEntry[], actorId: string, message: string): LogEntry[] {
  return [...log, { ts: Date.now(), actorId, message }];
}
