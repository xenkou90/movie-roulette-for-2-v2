import { startGame } from "../game/handlers.js";
import { snapshotFor } from "../game/snapshot.js";
import type { AppServer, AppSocket } from "../socket/types.js";
import {
  forgetRoom,
  holdSeat,
  markActive,
  ownedSeat,
  releaseSeat,
  toRoomView,
} from "./seats.js";
import {
  MAX_PLAYERS,
  createRoom,
  findPlayerByToken,
  generateRoomCode,
  getRoom,
  joinRoom,
} from "./store.js";
import {
  isPlausibleToken,
  normalisePlayerName,
  normaliseRoomCode,
} from "./validation.js";

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

    console.log(`[room] player ${player.id} created ${code}`);

    markActive(io, room, player);

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

    console.log(`[room] player ${player.id} joined ${roomCode}`);

    for (const member of room.players) {
      markActive(io, room, member);
    }

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

    markActive(io, room, player);

    ack({
      ok: true,
      room: toRoomView(room),
      you: { id: player.id, name: player.name },
      game: snapshotFor(room, player.id),
    });

    socket.to(room.code).emit("room:updated", toRoomView(room));
    console.log(`[room] player ${player.id} resumed in ${room.code}`);
  });

  socket.on("session:stillHere", () => {
    const seat = ownedSeat(socket);
    if (seat !== undefined) {
      markActive(io, seat.room, seat.player);
    }
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
