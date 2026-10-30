import { io, type Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@movie-roulette/shared";

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const serverUrl: string | undefined =
  import.meta.env.VITE_SERVER_URL || undefined;

const options = { autoConnect: false };

export const socket: AppSocket =
  serverUrl === undefined ? io(options) : io(serverUrl, options);
