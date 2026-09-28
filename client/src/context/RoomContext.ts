import { createContext } from "react";
import type { Decision, PlayerView, RoomView } from "@movie-roulette/shared";
import type { GameState } from "../game/gameReducer";

export interface CurrentRoom {
    room: RoomView;
    you: PlayerView;
}

export interface RoomContextValue {
    current: CurrentRoom | null;
    lastDeparture: string | null;
    game: GameState;
    enterRoom: (next: CurrentRoom) => void;
    leaveRoom: () => void;
    decide: (movieId: number, decision: Decision) => void;
    clearNotice: () => void;
}

export const RoomContext = createContext<RoomContextValue | null>(null);