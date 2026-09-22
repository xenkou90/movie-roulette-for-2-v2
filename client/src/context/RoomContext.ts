import { createContext } from "react";
import type { PlayerView, RoomView } from "@movie-roulette/shared";

export interface CurrentRoom {
    room: RoomView;
    you: PlayerView;
}

export interface RoomContextValue {
    current: CurrentRoom | null;
    lastDeparture: string | null;
    enterRoom: (next: CurrentRoom) => void;
    leaveRoom: () => void;
}

export const RoomContext = createContext<RoomContextValue | null>(null);