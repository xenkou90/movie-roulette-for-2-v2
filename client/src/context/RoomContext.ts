import { createContext } from "react";
import type { Decision, PlayerView, RoomView } from "@movie-roulette/shared";
import type { GameState } from "../game/gameReducer";

export interface CurrentRoom {
  room: RoomView;
  you: PlayerView;
}

export type ExitReason = "expired" | "replaced";

export interface RoomContextValue {
  current: CurrentRoom | null;
  lastDeparture: string | null;
  exitReason: ExitReason | null;
  isRestoring: boolean;
  game: GameState;
  enterRoom: (next: CurrentRoom, token: string) => void;
  leaveRoom: () => void;
  decide: (movieId: number, decision: Decision) => void;
  clearNotice: () => void;
  requestRematch: () => void;
  returnToRoom: () => void;
}

export const RoomContext = createContext<RoomContextValue | null>(null);