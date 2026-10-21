import type { RoomView } from "@movie-roulette/shared";
import { startGame } from "../game/handlers.js";
import type { AppServer, AppSocket } from "../socket/types.js";
import {
    MAX_PLAYERS,
    createRoom,
    findPlayer,
    generateRoomCode,
    getRoom,
    joinRoom,
    removePlayer,
    type Room,
} from "./store.js";
import { normalisePlayerName, normaliseRoomCode } from "./validation.js";

export function toRoomView(room: Room): RoomView {
    return {
        code: room.code,
        players: room.players.map((player) => ({
            id: player.id,
            name: player.name,
        })),
    };
}

function leaveCurrentRoom(io: AppServer, socket: AppSocket): void {
    const code = socket.data.roomCode;
    const playerId = socket.data.playerId;

    if (code === undefined || playerId === undefined) return;

    const room = getRoom(code);
    const name = room === undefined ? undefined : findPlayer(room, playerId)?.name;

    const remaining = removePlayer(code, playerId);
    void socket.leave(code);

    socket.data.roomCode = undefined;
    socket.data.playerId = undefined;

    if (remaining !== undefined) {
        remaining.game = undefined;

        io.to(code).emit("room:playerLeft", {
            playerId,
            name: name ?? "A player",
        });
        io.to(code).emit("room:updated", toRoomView(remaining));
    }

    console.log(`[room] player ${playerId} left ${code}`);
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
        });

        socket.to(roomCode).emit("room:updated", view);

        if (room.players.length === MAX_PLAYERS) {
            startGame(io, room).catch((error: unknown) => {
                console.error(`[game] unexpected error starting ${roomCode}`, error);
            });
        }
    });

    socket.on("room:leave", (ack) => {
        leaveCurrentRoom(io, socket);
        ack({ ok: true });
    });

    socket.on("disconnect", () => {
        leaveCurrentRoom(io, socket);
    });
}