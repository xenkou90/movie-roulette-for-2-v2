import { PLAYER_NAME_MAX_LENGTH, ROOM_CODE_REGEX } from "@movie-roulette/shared";

export function normalisePlayerName(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim().replace(/\s+/g, " ");

  if (trimmed.length === 0) return null;
  if (trimmed.length > PLAYER_NAME_MAX_LENGTH) return null;

  return trimmed;
}

export function normaliseRoomCode(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();

  return ROOM_CODE_REGEX.test(trimmed) ? trimmed : null;
}