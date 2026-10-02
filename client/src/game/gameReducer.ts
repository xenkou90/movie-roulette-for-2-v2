import type { GameErrorCode, Movie } from "@movie-roulette/shared";

export type GameNotice =
    | "partner_passed"
    | "partner_already_passed"
    | "next_movie_failed";

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

type PlayingState = Extract<GameState, { status: "playing" }>;

export type GameAction =
      | { type: "started"; movie: Movie }
      | { type: "decisionSent" }
      | { type: "advanced"; movie: Movie; partnerAlreadyPassed: boolean }
      | { type: "decisionRejected"; error: GameErrorCode }
      | { type: "partnerPassed" }
      | { type: "noticeCleared" }
      | { type: "matched"; movie: Movie }
      | { type: "partnerLeft" }
      | { type: "unavailable" }
      | { type: "reset" };

export const initialGameState: GameState = { status: "idle" };

function showNotice(state: PlayingState, notice: GameNotice): PlayingState {
    return { ...state, notice, noticeId: state.noticeId + 1 };
}

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

        case "advanced": {
            if (state.status !== "playing") return state;

            const next: PlayingState = { ...state, movie: action.movie, pending: false };
            return action.partnerAlreadyPassed
                ? showNotice(next, "partner_already_passed")
                : next;
        }

        case "decisionRejected": {
            if (state.status !== "playing") return state;

            const next: PlayingState = { ...state, pending: false };
            return action.error === "queue_unavailable"
                ? showNotice(next, "next_movie_failed")
                : next;
        }

        case "partnerPassed":
            return state.status === "playing"
                ? showNotice(state, "partner_passed")
                : state;

        case "noticeCleared":
            return state.status === "playing" ? { ...state, notice: null} : state;

        case "matched":
            return { status: "matched", movie: action.movie };

        case "partnerLeft":
            return state.status === "matched" ? state : initialGameState;

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