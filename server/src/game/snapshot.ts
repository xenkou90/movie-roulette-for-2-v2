import type { GameSnapshot } from "@movie-roulette/shared";
import type { Room } from "../rooms/store.js";
import { withDetails } from "../tmdb/detailsCache.js";
import { getIndex } from "./engine.js";

export function snapshotFor(room: Room, playerId: string): GameSnapshot {
    const session = room.game;

    if (session === undefined || session.status !== "playing") {
        return { status: "none" };
    }

    const matchedId = session.state.matchedMovieId;

    if (matchedId !== null) {
        const matched = session.queue.movies.find((movie) => movie.id === matchedId);
        return matched === undefined
            ? { status: "none" }
            : {
                status: "matched",
                movie: withDetails(matched),
                readyPlayerIds: [...session.rematchReady],
            };
    }

    const current = session.queue.movies[getIndex(session.state, playerId)];

    return current === undefined
        ? { status: "none" }
        : { status: "playing", movie: withDetails(current) };
}