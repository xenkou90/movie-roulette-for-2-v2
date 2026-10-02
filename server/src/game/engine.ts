import type { Decision } from "@movie-roulette/shared";

export interface PlayerProgress {
    index: number;
    likedIds: Set<number>;
    skippedIds: Set<number>;
}

export interface GameState {
    progress: Map<string, PlayerProgress>;
    matchedMovieId: number | null;
}

export type DecisionOutcome =
    | { type: "advance" }
    | { type: "match", movieId: number }
    | { type: "partner_passed" }
    | { type: "partner_already_passed"}
    | { type: "already_matched" }
    | { type: "out_of_turn" };

export function createGameState(playerIds: string[]): GameState {
    const progress = new Map<string, PlayerProgress>();

    for (const id of playerIds) {
        progress.set(id, {
            index: 0,
            likedIds: new Set(),
            skippedIds: new Set(),
        });
    }

    return { progress, matchedMovieId: null };
}

export function getIndex(state: GameState, playerId: string): number {
    return state.progress.get(playerId)?.index ?? 0;
}

function partnerOf(state: GameState, playerId: string): PlayerProgress[] {
    return [...state.progress]
        .filter(([id]) => id !== playerId)
        .map(([, progress]) => progress);
}

export function applyDecision(
    state: GameState,
    playerId: string,
    movieId: number,
    decision: Decision,
): DecisionOutcome {
    if (state.matchedMovieId !== null) {
        return { type: "already_matched" };
    }

    const player = state.progress.get(playerId);
    if (player === undefined) {
        return { type: "out_of_turn" };
    }

    player.index += 1;

    if (decision === "skip") {
        player.skippedIds.add(movieId);

        const partnerLikedIt = partnerOf(state, playerId).some((partner) =>
            partner.likedIds.has(movieId),
        );

        return partnerLikedIt ? { type: "partner_passed" } : { type: "advance" };
    }

    player.likedIds.add(movieId);

    const everyoneLikedIt = [...state.progress.values()].every((progress) =>
        progress.likedIds.has(movieId),
    );

    if (everyoneLikedIt) {
        state.matchedMovieId = movieId;
        return { type: "match", movieId };
    }

    const partnerSkippedIt = partnerOf(state, playerId).some((partner) =>
        partner.skippedIds.has(movieId),
    );

    return partnerSkippedIt
        ? { type: "partner_already_passed" }
        : { type: "advance" };
}