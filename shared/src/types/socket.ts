import type { Movie } from "./movie.js";

export type Decision = "skip" | "like";

export interface PlayerView {
  socketId: string;
  name: string;
}

export interface RoomView {
  code: string;
  players: PlayerView[];
}

export type RoomErrorCode =
  | "invalid_name"
  | "invalid_code"
  | "room_not_found"
  | "room_full"
  | "already_in_room";

export type RoomResult =
  | { ok: true; room: RoomView; you: PlayerView }
  | { ok: false; error: RoomErrorCode };

export type GameErrorCode =
  | "no_active_game"
  | "invalid_decision"
  | "stale_decision"
  | "game_over"
  | "queue_unavailable";

export type DecideResult =
  | { ok: true; movie: Movie | null }
  | { ok: false; error: GameErrorCode };

export interface ServerHelloPayload {
  socketId: string;
  serverTime: number;
}

export interface PingResult {
  serverTime: number;
}

export interface ServerToClientEvents {
  "server:hello": (payload: ServerHelloPayload) => void;
  "room:updated": (room: RoomView) => void;
  "room:playerLeft": (payload: { socketId: string; name: string }) => void;
  "game:started": (payload: { movie: Movie }) => void;
  "game:matched": (payload: { movie: Movie }) => void;
  "game:partnerPassed": () => void;
  "game:unavailable": () => void;
}

export interface ClientToServerEvents {
  "client:ping": (ack: (result: PingResult) => void) => void;
  "room:create": (
    payload: { name: string },
    ack: (result: RoomResult) => void,
  ) => void;
  "room:join": (
    payload: { code: string; name: string },
    ack: (result: RoomResult) => void,
  ) => void;
  "room:leave": (ack: (result: { ok: true }) => void) => void;
  "game:decide": (
    payload: { movieId: number; decision: Decision },
    ack: (result: DecideResult) => void,
  ) => void;
}

export interface SocketData {
  roomCode?: string;
  playerName?: string;
}