import type { RoomView } from "@movie-roulette/shared";
import { env } from "../config/env.js";
import { startGame } from "../game/handlers.js";
import { snapshotFor } from "../game/snapshot.js";
import type { AppServer, AppSocket } from "../socket/types.js";
import {
  MAX_PLAYERS,
  createRoom,
  findPlayer,
  findPlayerByToken,
  generateRoomCode,
  getRoom,
  joinRoom,
  removePlayer,
  type Player,
  type Room,
} from "./store.js";
import {
  isPlausibleToken,
  normalisePlayerName,
  normaliseRoomCode,
} from "./validation.js";

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

function ownedSeat(
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

function releaseSeat(io: AppServer, room: Room, player: Player): void {
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

function holdSeat(io: AppServer, room: Room, player: Player): void {
  player.socketId = null;
  io.to(room.code).emit("room:updated", toRoomView(room));

  player.graceTimer = setTimeout(() => {
    const stillSeated =
      getRoom(room.code) === room && findPlayer(room, player.id) === player;

    if (stillSeated && player.socketId === null) {
      releaseSeat(io, room, player);
    }
  }, env.resumeGraceMs);

  console.log(
    `[room] player ${player.id} disconnected from ${room.code}; holding seat`,
  );
}

function forgetRoom(socket: AppSocket): void {
  const code = socket.data.roomCode;
  if (code !== undefined) {
    void socket.leave(code);
  }
  socket.data.roomCode = undefined;
  socket.data.playerId = undefined;
}

export function registerRoomHandlers(io: AppServer, socket: AppSocket): void {
  socket.on("room:create", ({ name }, ack) => {
    if (socket.data.roomCode !== undefined) {
      ack({ ok: false, error: "already_in_room" });
      return;
    }

    const playerName = normalisePlayerName(name);
    if (playerName === null) {
      ack({ ok: false, error: "invalid_name" });
      return;
    }

    const code = generateRoomCode();
    const { room, player } = createRoom(code, playerName, socket.id);

    void socket.join(code);
    socket.data.roomCode = code;
    socket.data.playerId = player.id;

    console.log(`[room] ${playerName} created ${code}`);

    ack({
      ok: true,
      room: toRoomView(room),
      you: { id: player.id, name: player.name },
      token: player.token,
    });
  });

  socket.on("room:join", ({ code, name }, ack) => {
    if (socket.data.roomCode !== undefined) {
      ack({ ok: false, error: "already_in_room" });
      return;
    }

    const playerName = normalisePlayerName(name);
    if (playerName === null) {
      ack({ ok: false, error: "invalid_name" });
      return;
    }

    const roomCode = normaliseRoomCode(code);
    if (roomCode === null) {
      ack({ ok: false, error: "invalid_code" });
      return;
    }

    const result = joinRoom(roomCode, playerName, socket.id);

    if (!result.ok) {
      ack({ ok: false, error: result.reason });
      return;
    }

    const { room, player } = result;

    void socket.join(roomCode);
    socket.data.roomCode = roomCode;
    socket.data.playerId = player.id;

    console.log(`[room] ${playerName} joined ${roomCode}`);

    const view = toRoomView(room);

    ack({
      ok: true,
      room: view,
      you: { id: player.id, name: player.name },
      token: player.token,
    });

    socket.to(roomCode).emit("room:updated", view);

    if (room.players.length === MAX_PLAYERS) {
      startGame(io, room).catch((error: unknown) => {
        console.error(`[game] unexpected error starting ${roomCode}`, error);
      });
    }
  });

  socket.on("session:resume", ({ code, token }, ack) => {
    if (socket.data.roomCode !== undefined) {
      ack({ ok: false, error: "session_not_found" });
      return;
    }

    const roomCode = normaliseRoomCode(code);
    if (roomCode === null || !isPlausibleToken(token)) {
      ack({ ok: false, error: "session_not_found" });
      return;
    }

    const room = getRoom(roomCode);
    const player =
      room === undefined ? undefined : findPlayerByToken(room, token);

    if (room === undefined || player === undefined) {
      ack({ ok: false, error: "session_not_found" });
      return;
    }

    clearTimeout(player.graceTimer);
    player.graceTimer = undefined;

    const previousSocketId = player.socketId;
    player.socketId = socket.id;

    if (previousSocketId !== null && previousSocketId !== socket.id) {
      io.to(previousSocketId).emit("session:replaced");
      io.in(previousSocketId).disconnectSockets(true);
    }

    void socket.join(room.code);
    socket.data.roomCode = room.code;
    socket.data.playerId = player.id;

    ack({
      ok: true,
      room: toRoomView(room),
      you: { id: player.id, name: player.name },
      game: snapshotFor(room, player.id),
    });

    socket.to(room.code).emit("room:updated", toRoomView(room));
    console.log(`[room] player ${player.id} resumed in ${room.code}`);
  });

  socket.on("room:leave", (ack) => {
    const seat = ownedSeat(socket);
    if (seat !== undefined) {
      releaseSeat(io, seat.room, seat.player);
    }
    forgetRoom(socket);
    ack({ ok: true });
  });

  socket.on("disconnect", () => {
    const seat = ownedSeat(socket);
    if (seat !== undefined) {
      holdSeat(io, seat.room, seat.player);
    }
  });
}
