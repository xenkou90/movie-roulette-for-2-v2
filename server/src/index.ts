import { createServer } from "node:http";
import express from "express";
import { Server } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "@movie-roulette/shared";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errors.js";
import { registerRoomHandlers } from "./rooms/handlers.js";
import { registerGameHandlers } from "./game/handlers.js";

const app = express();
const httpServer = createServer(app);

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>(httpServer, {
  cors: { origin: env.clientUrl },
});

io.on("connection", (socket) => {
  console.log(`[socket] connected: ${socket.id}`);

  socket.emit("server:hello", {
    socketId: socket.id,
    serverTime: Date.now(),
  });

  socket.on("client:ping", (ack) => {
    ack({ serverTime: Date.now() });
  });

  registerRoomHandlers(io, socket);
  registerGameHandlers(io, socket);

  socket.on("disconnect", (reason) => {
    console.log(`[socket] disconnected: ${socket.id} (${reason})`);
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(notFoundHandler);
app.use(errorHandler);

httpServer.listen(env.port, env.host, () => {
  console.log(`Server listening on http://${env.host}:${env.port}`);
});

function shutdown(signal: NodeJS.Signals): void {
  console.log(`[server] ${signal} received, shutting down`);

  void io.close(() => {
    process.exit(0);
  });

  setTimeout(() => {
    console.error("[server] forced shutdown after timeout");
    process.exit(1);
  }, 5000).unref();
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
