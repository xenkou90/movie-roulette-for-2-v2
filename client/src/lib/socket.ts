import { io, type Socket } from "socket.io-client";
import type {
    ClientToServerEvents,
    ServerToClientEvents,
} from "@movie-roulette/shared";

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const serverUrl = import.meta.env.VITE_SERVER_URL ?? "http://localhost:3001";

export const socket: AppSocket = io(serverUrl, {
    autoConnect: false,
});