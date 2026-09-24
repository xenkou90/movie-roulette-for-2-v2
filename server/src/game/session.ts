import type { GameState } from "./engine.js";
import type { MovieQueue } from "./queue.js";

export type GameStatus = "loading" | "playing";

export interface GameSession {
    status:GameStatus;
    state: GameState;
    queue: MovieQueue;
}