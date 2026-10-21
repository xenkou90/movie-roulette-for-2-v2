import { MAX_PLAYERS, findPlayer, getRoom, type Player, type Room} from "../rooms/store.js";
import type { AppServer, AppSocket } from "../socket/types.js";
import { withDetails } from "../tmdb/detailsCache.js";
import { prefetchDetails, sendDetailsWhenReady } from "./details.js";
import { applyDecision, createGameState, getIndex } from "./engine.js";
import { createQueue, ensureAvailable } from "./queue.js";
import type { GameSession } from "./session.js";
import { isDecision } from "./validation.js";

function isStillCurrent(room: Room, session: GameSession): boolean {
    return getRoom(room.code) === room && room.game === session;
}

function currentSeat(socket: AppSocket): { room: Room; player: Player } | undefined {
    const code = socket.data.roomCode;
    const playerId = socket.data.playerId;
    if (code === undefined || playerId === undefined) return undefined;

    const room = getRoom(code);
    if (room === undefined) return undefined;

    const player = findPlayer(room, playerId);
    return player === undefined ? undefined : { room, player };
}

function notifyPartners(io: AppServer, room: Room, deciderId: string): void {
    for (const player of room.players) {
        if (player.id !== deciderId && player.socketId !== null) {
            io.to(player.socketId).emit("game:partnerPassed");
        }
    }
}

function prefetchMovies(room: Room, session: GameSession, index: number): void {
    ensureAvailable(session.queue, index).catch((error: unknown) => {
        console.error(`[game] background refill failed for ${room.code}`, error);
    });
}

export async function startGame(
    io: AppServer,
    room: Room,
    excludeIds?: ReadonlySet<number>,
): Promise<void> {
    const session: GameSession = {
        status: "loading",
        state: createGameState(room.players.map((player) => player.id)),
        queue: createQueue(excludeIds),
        rematchReady: new Set(),
    };

    room.game = session;

    try {
        await ensureAvailable(session.queue, 0);
    } catch (error) {
        console.error(`[game] could not load movies for ${room.code}`, error);

        if (isStillCurrent(room, session)) {
            room.game = undefined;
            io.to(room.code).emit("game:unavailable");
        }
        return;
    }

    if (!isStillCurrent(room, session)) {
        console.log(`[game]start for ${room.code} was superseded while loading`);
        return;
    }

    const first = session.queue.movies[0];

    if (first === undefined) {
        room.game = undefined;
        io.to(room.code).emit("game:unavailable");
        return;
    }

    session.status = "playing";
    io.to(room.code).emit("game:started", { movie: withDetails(first) });
    console.log(`[game] started in ${room.code}`);

    for (const player of room.players) {
        const socketId = player.socketId;
        if (socketId === null) continue;

        sendDetailsWhenReady(
            io,
            socketId,
            first,
            () =>
                isStillCurrent(room, session) &&
                getIndex(session.state, player.id) === 0,
        );
    }

    prefetchDetails(session.queue, 1);
}

export function registerGameHandlers(io: AppServer, socket: AppSocket): void {
    socket.on("game:decide", async ({ movieId, decision }, ack) => {
        const seat = currentSeat(socket);
        const session = seat?.room.game;

        if (seat === undefined || session === undefined || session.status !== "playing") {
            ack({ ok: false, error: "no_active_game" });
            return;
        }

        const { room, player } = seat;

        if (session.state.matchedMovieId !== null) {
            ack({ ok: false, error: "game_over" });
            return;
        }

        if (!isDecision(decision)) {
            ack({ ok: false, error: "invalid_decision" });
            return;
        }

        const index = getIndex(session.state, player.id);
        const current = session.queue.movies[index];

        if (current === undefined || current.id !== movieId) {
            ack({ ok: false, error: "stale_decision" });
            return;
        }

        const nextIndex = index + 1;

        if (session.queue.movies[nextIndex] === undefined) {
            try {
                await ensureAvailable(session.queue, nextIndex);
            } catch (error) {
                console.error(`[game] could not extend queue for ${room.code}`, error);
            }

            if (!isStillCurrent(room, session)) {
                ack({ ok: false, error: "no_active_game" });
                return;
            }

            if (session.state.matchedMovieId !== null) {
                ack({ ok: false, error: "game_over" });
                return;
            }

            if (getIndex(session.state, player.id) !== index) {
                ack({ ok: false, error: "stale_decision" });
                return;
            }
        } else {
            prefetchMovies(room, session, nextIndex);
        }

        const next = session.queue.movies[nextIndex];

        if (next === undefined) {
            ack({ ok: false, error: "queue_unavailable" });
            return;
        }

        const outcome = applyDecision(session.state, player.id, current.id, decision);

        switch (outcome.type) {
            case "match":
                io.to(room.code).emit("game:matched", { movie: withDetails(current) });
                ack({ ok: true, movie: null, partnerAlreadyPassed: false });
                sendDetailsWhenReady(
                    io,
                    room.code,
                    current,
                    () => getRoom(room.code) === room,
                );
                return;
            case "already_matched":
                ack({ ok: false, error: "game_over" });
                return;
            case "out_of_turn":
                ack({ ok: false, error: "no_active_game" });
                return;
            case "partner_passed":
                notifyPartners(io, room, player.id);
                break;
            case "partner_already_passed":
            case "advance":
                break;
            default: {
                const unhandled: never = outcome;
                throw new Error(`Unhandled outcome: ${JSON.stringify(unhandled)}`);
            }
        }

        ack({
            ok: true,
            movie: withDetails(next),
            partnerAlreadyPassed: outcome.type === "partner_already_passed",
        });

        sendDetailsWhenReady(
            io,
            socket.id,
            next,
            () =>
                isStillCurrent(room, session) &&
                getIndex(session.state, player.id) === nextIndex,
        );

        prefetchDetails(session.queue, nextIndex + 1);
    });

    socket.on("game:rematch", (ack) => {
        const seat = currentSeat(socket);
        const session = seat?.room.game;

        if (
            seat === undefined ||
            session === undefined ||
            session.state.matchedMovieId === null
        ) {
            ack({ ok: false, error: "not_matched" });
            return;
        }

        const { room, player } = seat;

        session.rematchReady.add(player.id);
        ack({ ok: true });

        io.to(room.code).emit("game:rematchStatus", {
            readyPlayerIds: [...session.rematchReady],
        });

        const everyoneReady =
            room.players.length === MAX_PLAYERS &&
            room.players.every((member) => session.rematchReady.has(member.id));

        if (everyoneReady) {
            startGame(io, room, session.queue.seenIds).catch((error: unknown) => {
                console.error(`[game] unexpected error restarting ${room.code}`, error);
            });
        }
    });
}