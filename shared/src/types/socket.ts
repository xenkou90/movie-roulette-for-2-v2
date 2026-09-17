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
}

export interface SocketData {
  roomCode?: string;
  playerName?: string;
}