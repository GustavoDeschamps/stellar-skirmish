const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomChar(): string {
  return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
}

export function generateRoomCode(): string {
  return `STAR-${randomChar()}${randomChar()}${randomChar()}${randomChar()}`;
}
