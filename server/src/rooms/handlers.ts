import type { Server, Socket } from "socket.io";
import type {
    ClientToServerEvents,
    RoomView,
    ServerToClientEvents,
    SocketData,
} from "@movie-roulette/shared";
import {
    createRoom,
    generateRoomCode,
    joinRoom,
    removePlayer,
    type Room,
} from "./store.js";
import { normalisePlayerName, normaliseRoomCode } from "./validation.js";

type AppServer = Server<
    ClientToServerEvents,
    ServerToClientEvents,
    Record<string, never>,
    SocketData
>;

type AppSocket = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    Record<string, never>,
    SocketData
>;

function toRoomView(room: Room): RoomView {
    return {
        code: room.code,
        players: room.players.map((player) => ({
            socketId: player.socketId,
            name: player.name,
        })),
    };
}

function leaveCurrentRoom(io: AppServer, socket: AppSocket): void {
    const code = socket.data.roomCode;
    const name = socket.data.playerName;

    if (code === undefined) return;

    const remaining = removePlayer(code, socket.id);
    void socket.leave(code);

    socket.data.roomCode = undefined;
    socket.data.playerName = undefined;

    if (remaining !== undefined) {
        io.to(code).emit("room:playerLeft", {
            socketId: socket.id,
            name: name ?? "A player",
        });
        io.to(code).emit("room:updated", toRoomView(remaining));
    }

    console.log(`[room] ${socket.id} left ${code}`);
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
        const room = createRoom(code, { socketId: socket.id, name: playerName });

        void socket.join(code);
        socket.data.roomCode = code;
        socket.data.playerName = playerName;

        console.log(`[room] ${playerName} created ${code}`);

        ack({
            ok: true,
            room: toRoomView(room),
            you: { socketId: socket.id, name: playerName },
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

        const result = joinRoom(roomCode, {
            socketId: socket.id,
            name: playerName
        });

        if (!result.ok) {
            ack({ ok: false, error: result.reason });
            return;
        }

        void socket.join(roomCode);
        socket.data.roomCode = roomCode;
        socket.data.playerName = playerName;

        console.log(`[room] ${playerName} joined ${roomCode}`);

        const view = toRoomView(result.room);

        ack({
            ok: true,
            room: view,
            you: { socketId: socket.id, name: playerName },
        });

        socket.to(roomCode).emit("room:updated", view);
    });

    socket.on("room:leave", (ack) => {
        leaveCurrentRoom(io, socket);
        ack({ ok: true });
    });

    socket.on("disconnect", () => {
        leaveCurrentRoom(io, socket);
    });
}
