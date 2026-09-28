import type { Movie } from "@movie-roulette/shared";

export type GameNotice = "partner_passed";

export type GameState =
    | { status: "idle" }
    | { status: "unavailable" }
    | {
        status: "playing";
        movie: Movie;
        pending: boolean;
        notice: GameNotice | null;
        noticeId: number;
    }
    | { status: "matched"; movie: Movie };

export type GameAction =
    | { type: "started"; movie: Movie }
    | { type: "decisionSent" }
    | { type: "advanced"; movie: Movie }
    | { type: "decisionRejected" }
    | { type: "partnerPassed" }
    | { type: "noticeCleared" }
    | { type: "matched"; movie: Movie }
    | { type: "unavailable" }
    | { type: "reset" };

export const initialGameState: GameState = { status: "idle" };

export function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case "started":
            return {
                status: "playing",
                movie: action.movie,
                pending: false,
                notice: null,
                noticeId: 0,
            };

        case "decisionSent":
            return state.status === "playing" ? { ...state, pending: true } : state;

        case "advanced":
            return state.status === "playing"
                ? { ...state, movie: action.movie, pending: false }
                : state;

        case "decisionRejected":
            return state.status === "playing" ? { ...state, pending: false } : state;

        case "partnerPassed":
            return state.status === "playing"
                ? { ...state, notice: "partner_passed", noticeId: state.noticeId + 1 }
                : state;

        case "noticeCleared":
            return state.status === "playing" ? { ...state, notice: null } : state;

        case "matched":
            return { status: "matched", movie: action.movie };

        case "unavailable":
            return { status: "unavailable" };

        case "reset":
            return initialGameState;

        default: {
            const unhandled: never = action;
            return unhandled;
        }
    }
}