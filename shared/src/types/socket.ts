import type { Movie } from "./movie.js";

export type Decision = "skip" | "like";

export interface PlayerView {
  id: string;
  name: string;
}

export type RoomPlayerView = PlayerView & { connected: boolean };

export interface RoomView {
  code: string;
  players: RoomPlayerView[];
}

export type RoomErrorCode =
  | "invalid_name"
  | "invalid_code"
  | "room_not_found"
  | "room_full"
  | "already_in_room";

export type RoomResult =
  | { ok: true; room: RoomView; you: PlayerView; token: string }
  | { ok: false; error: RoomErrorCode };

export type GameSnapshot =
  | { status: "none" }
  | { status: "playing"; movie: Movie }
  | { status: "matched"; movie: Movie; readyPlayerIds: string[] };

export type ResumeResult =
  | { ok: true; room: RoomView; you: PlayerView; game: GameSnapshot }
  | { ok: false; error: "session_not_found" };

export type GameErrorCode =
  | "no_active_game"
  | "invalid_decision"
  | "stale_decision"
  | "game_over"
  | "queue_unavailable"
  | "not_matched";

export type DecideResult =
  | { ok: true; movie: Movie | null; partnerAlreadyPassed: boolean }
  | { ok: false; error: GameErrorCode };

export type RematchResult = { ok: true } | { ok: false; error: GameErrorCode };

export interface ServerHelloPayload {
  socketId: string;
  serverTime: number;
}

export interface PingResult {
  serverTime: number;
}

export type SessionEndReason = "idle";

export interface ServerToClientEvents {
  "server:hello": (payload: ServerHelloPayload) => void;
  "room:updated": (room: RoomView) => void;
  "room:playerLeft": (payload: { playerId: string; name: string }) => void;
  "session:replaced": () => void;
  "session:idleWarning": (payload: { secondsLeft: number }) => void;
  "session:ended": (payload: { reason: SessionEndReason }) => void;
  "game:started": (payload: { movie: Movie }) => void;
  "game:matched": (payload: { movie: Movie }) => void;
  "game:movieDetails": (payload: { movie: Movie }) => void;
  "game:rematchStatus": (payload: { readyPlayerIds: string[] }) => void;
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
  "session:resume": (
    payload: { code: string; token: string },
    ack: (result: ResumeResult) => void,
  ) => void;
  "session:stillHere": () => void;
  "game:decide": (
    payload: { movieId: number; decision: Decision },
    ack: (result: DecideResult) => void,
  ) => void;
  "game:rematch": (ack: (result: RematchResult) => void) => void;
}

export interface SocketData {
  roomCode?: string;
  playerId?: string;
}
