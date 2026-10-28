import {
  randomBytes,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { ROOM_CODE_LENGTH } from "@movie-roulette/shared";
import type { GameSession } from "../game/session.js";

export interface Player {
  id: string;
  token: string;
  name: string;
  socketId: string | null;
  graceTimer?: NodeJS.Timeout;
}

export interface Room {
  code: string;
  players: Player[];
  createdAt: number;
  game?: GameSession;
}

export type JoinFailure = "room_not_found" | "room_full";

export type JoinResult =
  { ok: true; room: Room; player: Player } | { ok: false; reason: JoinFailure };

export const MAX_PLAYERS = 2;
const MAX_CODE_ATTEMPTS = 50;
const TOKEN_BYTES = 32;

const rooms = new Map<string, Room>();

export function getRoom(code: string): Room | undefined {
  return rooms.get(code);
}

export function generateRoomCode(): string {
  const max = 10 ** ROOM_CODE_LENGTH;

  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const code = String(randomInt(0, max)).padStart(ROOM_CODE_LENGTH, "0");
    if (!rooms.has(code)) return code;
  }

  throw new Error("Could not generate an unused room code");
}

function newPlayer(name: string, socketId: string): Player {
  return {
    id: randomUUID(),
    token: randomBytes(TOKEN_BYTES).toString("base64url"),
    name,
    socketId,
  };
}

function tokensMatch(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function createRoom(
  code: string,
  hostName: string,
  socketId: string,
): { room: Room; player: Player } {
  const player = newPlayer(hostName, socketId);
  const room: Room = {
    code,
    players: [player],
    createdAt: Date.now(),
  };

  rooms.set(code, room);
  return { room, player };
}

export function joinRoom(
  code: string,
  name: string,
  socketId: string,
): JoinResult {
  const room = rooms.get(code);

  if (room === undefined) {
    return { ok: false, reason: "room_not_found" };
  }

  if (room.players.length >= MAX_PLAYERS) {
    return { ok: false, reason: "room_full" };
  }

  const player = newPlayer(name, socketId);
  room.players.push(player);
  return { ok: true, room, player };
}

export function findPlayer(room: Room, playerId: string): Player | undefined {
  return room.players.find((player) => player.id === playerId);
}

export function findPlayerByToken(
  room: Room,
  token: string,
): Player | undefined {
  return room.players.find((player) => tokensMatch(player.token, token));
}

export function removePlayer(code: string, playerId: string): Room | undefined {
  const room = rooms.get(code);
  if (room === undefined) return undefined;

  room.players = room.players.filter((player) => player.id !== playerId);

  if (room.players.length === 0) {
    rooms.delete(code);
    return undefined;
  }

  return room;
}

export function roomCount(): number {
  return rooms.size;
}
