import type { RoomView } from "@movie-roulette/shared";
import { env } from "../config/env.js";
import type { AppServer, AppSocket } from "../socket/types.js";
import {
  findPlayer,
  getRoom,
  removePlayer,
  type Player,
  type Room,
} from "./store.js";

export function toRoomView(room: Room): RoomView {
  return {
    code: room.code,
    players: room.players.map((player) => ({
      id: player.id,
      name: player.name,
      connected: player.socketId !== null,
    })),
  };
}

export function isSeated(room: Room, player: Player): boolean {
  return getRoom(room.code) === room && findPlayer(room, player.id) === player;
}

export function ownedSeat(
  socket: AppSocket,
): { room: Room; player: Player } | undefined {
  const code = socket.data.roomCode;
  const playerId = socket.data.playerId;
  if (code === undefined || playerId === undefined) return undefined;

  const room = getRoom(code);
  if (room === undefined) return undefined;

  const player = findPlayer(room, playerId);
  if (player === undefined || player.socketId !== socket.id) return undefined;

  return { room, player };
}

export function forgetRoom(socket: AppSocket): void {
  const code = socket.data.roomCode;
  if (code !== undefined) {
    void socket.leave(code);
  }
  socket.data.roomCode = undefined;
  socket.data.playerId = undefined;
}

export function releaseSeat(io: AppServer, room: Room, player: Player): void {
  clearTimeout(player.graceTimer);

  const remaining = removePlayer(room.code, player.id);

  if (remaining !== undefined) {
    remaining.game = undefined;
    io.to(room.code).emit("room:playerLeft", {
      playerId: player.id,
      name: player.name,
    });
    io.to(room.code).emit("room:updated", toRoomView(remaining));
  }

  console.log(`[room] player ${player.id} left ${room.code}`);
}

export function holdSeat(io: AppServer, room: Room, player: Player): void {
  player.socketId = null;
  io.to(room.code).emit("room:updated", toRoomView(room));

  player.graceTimer = setTimeout(() => {
    if (isSeated(room, player) && player.socketId === null) {
      releaseSeat(io, room, player);
    }
  }, env.resumeGraceMs);

  console.log(
    `[room] player ${player.id} disconnected from ${room.code}; holding seat`,
  );
}
