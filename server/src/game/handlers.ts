import { getRoom, type Room } from "../rooms/store.js";
import type { AppServer, AppSocket } from "../socket/types.js";
import { applyDecision, createGameState, getIndex } from "./engine.js";
import { createQueue, ensureAvailable } from "./queue.js";
import type { GameSession } from "./session.js";
import { isDecision } from "./validation.js";

function isStillCurrent(room: Room, session: GameSession): boolean {
    return getRoom(room.code) === room && room.game === session;
}

function currentRoom(socket: AppSocket): Room | undefined {
    const code = socket.data.roomCode;
    return code === undefined ? undefined : getRoom(code);
}

function notifyPartners(io: AppServer, room: Room, deciderId: string): void {
    for (const player of room.players) {
        if (player.socketId !== deciderId) {
            io.to(player.socketId).emit("game:partnerPassed");
        }
    }
}

export async function startGame(io: AppServer, room: Room): Promise<void> {
    const session: GameSession = {
        status: "loading",
        state: createGameState(room.players.map((player) => player.socketId)),
        queue: createQueue(),
    };

    room.game = session;

    try {
        await ensureAvailable(session.queue, 0);
    } catch (error) {
        console.error(`[game] could not load movies for ${room.code}`, error);

        if (isStillCurrent(room, session)) {
            room.game = undefined;
            io.to (room.code).emit("game:unavailable");
        }
        return;
    }

    if (!isStillCurrent(room, session)) {
        console.log(`[game] start for ${room.code} was superseded while loading`);
        return;
    }

    const first = session.queue.movies[0];

    if (first === undefined) {
        room.game = undefined;
        io.to(room.code).emit("game:unavailable");
        return;
    }

    session.status = "playing";
    io.to(room.code).emit("game:started", { movie: first });
    console.log(`[game] started in ${room.code}`);
}

export function registerGameHandlers(io: AppServer, socket: AppSocket): void {
    socket.on("game:decide", async ({ movieId, decision }, ack) => {
        const room = currentRoom(socket);
        const session = room?.game;

        if (
            room === undefined ||
            session === undefined ||
            session.status !== "playing"
        ) {
            ack({ ok: false, error: "no_active_game" });
            return;
        }

        if (session.state.matchedMovieId !== null) {
            ack({ ok: false, error: "game_over" });
            return;
        }

        if (!isDecision(decision)) {
            ack({ ok: false, error: "invalid_decision" });
            return;
        }

        const index = getIndex(session.state, socket.id);
        const current = session.queue.movies[index];

        if (current === undefined || current.id !== movieId) {
            ack({ ok: false, error: "stale_decision" });
            return;
        }

        const outcome = applyDecision(session.state, socket.id, current.id, decision);

        switch (outcome.type) {
            case "match":
                io.to(room.code).emit("game:matched", { movie: current });
                ack({ ok: true, movie: null });
                return;
            case "already_matched":
                ack({ ok: false, error: "game_over" });
                return;
            case "out_of_turn":
                ack({ ok: false, error: "no_active_game" });
                return;
            case "partner_passed":
                notifyPartners(io, room, socket.id);
                break;
            case "advance":
                break;
            default: {
                const unhandled: never = outcome;
                throw new Error(`Unhandled outcome: ${JSON.stringify(unhandled)}`);
            }
        }

        const nextIndex = getIndex(session.state, socket.id);

        try {
            await ensureAvailable(session.queue, nextIndex);
        } catch (error) {
            console.log(`[game] could not extend queue for ${room.code}`, error);
            ack({ ok: false, error: "queue_unavailable" });
            return;
        }

        if (!isStillCurrent(room, session)) {
            ack({ ok: false, error: "no_active_game" });
            return;
        }

        const next = session.queue.movies[nextIndex];

        if (next === undefined) {
            ack({ ok: false, error: "queue_unavailable" });
            return;
        }

        ack({ ok: true, movie: next });
    });
}