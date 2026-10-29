import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import type {
  Decision,
  Movie,
  RoomView,
  SessionEndReason,
} from "@movie-roulette/shared";
import { useSocket } from "../hooks/useSocket";
import { gameReducer, initialGameState } from "../game/gameReducer";
import { matchHaptic } from "../lib/haptics";
import { playMatchChime } from "../lib/sound";
import { clearSession, loadSession, saveSession } from "../lib/session";
import { RoomContext, type CurrentRoom, type ExitReason } from "./RoomContext";

interface RoomProviderProps {
  children: ReactNode;
}

function RoomProvider({ children }: RoomProviderProps) {
  const { socket } = useSocket();
  const [current, setCurrent] = useState<CurrentRoom | null>(null);
  const [lastDeparture, setLastDeparture] = useState<string | null>(null);
  const [exitReason, setExitReason] = useState<ExitReason | null>(null);
  const [isRestoring, setIsRestoring] = useState(() => loadSession() !== null);
  const [idleWarningSeconds, setIdleWarningSeconds] = useState<number | null>(
    null,
  );
  const [game, dispatch] = useReducer(gameReducer, initialGameState);

  useEffect(() => {
    function handleConnect() {
      const stored = loadSession();

      if (stored === null) {
        setIsRestoring(false);
        return;
      }

      setIsRestoring(true);

      socket.emit("session:resume", stored, (result) => {
        setIsRestoring(false);
        setIdleWarningSeconds(null);

        if (!result.ok) {
          clearSession();
          setCurrent(null);
          setExitReason("expired");
          dispatch({ type: "reset" });
          return;
        }

        setCurrent({ room: result.room, you: result.you });
        setExitReason(null);
        dispatch({ type: "restored", snapshot: result.game });
      });
    }

    function handleDisconnect(reason: string) {
      if (reason === "io server disconnect") {
        // The server only closes a connection itself when another tab has taken
        // over this seat. Socket.IO won't reconnect automatically in that case,
        // so reconnect now — without a session, as a fresh connection.
        socket.connect();
      }
    }

    function handleReplaced() {
      clearSession();
      setCurrent(null);
      setExitReason("replaced");
      setIdleWarningSeconds(null);
      dispatch({ type: "reset" });
    }

    function handleIdleWarning(payload: { secondsLeft: number }) {
      setIdleWarningSeconds(payload.secondsLeft);
    }

    function handleSessionEnded(payload: { reason: SessionEndReason }) {
      clearSession();
      setCurrent(null);
      setExitReason(payload.reason);
      setIdleWarningSeconds(null);
      dispatch({ type: "reset" });
    }

    function handleUpdated(room: RoomView) {
      setCurrent((prev) =>
        prev !== null && prev.room.code === room.code
          ? { ...prev, room }
          : prev,
      );
    }

    function handlePlayerLeft(payload: { playerId: string; name: string }) {
      setLastDeparture(payload.name);
      dispatch({ type: "partnerLeft" });
    }

    function handleStarted(payload: { movie: Movie }) {
      dispatch({ type: "started", movie: payload.movie });
    }

    function handleMatched(payload: { movie: Movie }) {
      matchHaptic();
      playMatchChime();
      dispatch({ type: "matched", movie: payload.movie });
    }

    function handleMovieDetails(payload: { movie: Movie }) {
      dispatch({ type: "movieDetails", movie: payload.movie });
    }

    function handleRematchStatus(payload: { readyPlayerIds: string[] }) {
      dispatch({
        type: "rematchStatus",
        readyPlayerIds: payload.readyPlayerIds,
      });
    }

    function handlePartnerPassed() {
      dispatch({ type: "partnerPassed" });
    }

    function handleUnavailable() {
      dispatch({ type: "unavailable" });
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("session:replaced", handleReplaced);
    socket.on("session:idleWarning", handleIdleWarning);
    socket.on("session:ended", handleSessionEnded);
    socket.on("room:updated", handleUpdated);
    socket.on("room:playerLeft", handlePlayerLeft);
    socket.on("game:started", handleStarted);
    socket.on("game:matched", handleMatched);
    socket.on("game:movieDetails", handleMovieDetails);
    socket.on("game:rematchStatus", handleRematchStatus);
    socket.on("game:partnerPassed", handlePartnerPassed);
    socket.on("game:unavailable", handleUnavailable);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("session:replaced", handleReplaced);
      socket.off("session:idleWarning", handleIdleWarning);
      socket.off("session:ended", handleSessionEnded);
      socket.off("room:updated", handleUpdated);
      socket.off("room:playerLeft", handlePlayerLeft);
      socket.off("game:started", handleStarted);
      socket.off("game:matched", handleMatched);
      socket.off("game:movieDetails", handleMovieDetails);
      socket.off("game:rematchStatus", handleRematchStatus);
      socket.off("game:partnerPassed", handlePartnerPassed);
      socket.off("game:unavailable", handleUnavailable);
    };
  }, [socket]);

  const enterRoom = useCallback((next: CurrentRoom, token: string) => {
    saveSession({ code: next.room.code, token });
    setLastDeparture(null);
    setExitReason(null);
    setIdleWarningSeconds(null);
    dispatch({ type: "reset" });
    setCurrent(next);
  }, []);

  const leaveRoom = useCallback(() => {
    socket.emit("room:leave", () => {
      // Leaving cannot fail, so local state is cleared optimistically below.
    });
    clearSession();
    setCurrent(null);
    setLastDeparture(null);
    setExitReason(null);
    setIdleWarningSeconds(null);
    dispatch({ type: "reset" });
  }, [socket]);

  const decide = useCallback(
    (movieId: number, decision: Decision) => {
      dispatch({ type: "decisionSent" });

      socket.emit("game:decide", { movieId, decision }, (result) => {
        if (!result.ok) {
          dispatch({ type: "decisionRejected", error: result.error });
          return;
        }

        if (result.movie !== null) {
          dispatch({
            type: "advanced",
            movie: result.movie,
            partnerAlreadyPassed: result.partnerAlreadyPassed,
          });
        }
      });
    },
    [socket],
  );

  const clearNotice = useCallback(() => {
    dispatch({ type: "noticeCleared" });
  }, []);

  const requestRematch = useCallback(() => {
    socket.emit("game:rematch", () => {
      // Readiness arrives through game:rematchStatus. A rejection means the
      // match can no longer be replayed (the partner left), which the screen shows.
    });
  }, [socket]);

  const returnToRoom = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  const stillHere = useCallback(() => {
    socket.emit("session:stillHere");
    setIdleWarningSeconds(null);
  }, [socket]);

  const value = useMemo(
    () => ({
      current,
      lastDeparture,
      exitReason,
      isRestoring,
      idleWarningSeconds,
      game,
      enterRoom,
      leaveRoom,
      decide,
      clearNotice,
      requestRematch,
      returnToRoom,
      stillHere,
    }),
    [
      current,
      lastDeparture,
      exitReason,
      isRestoring,
      idleWarningSeconds,
      game,
      enterRoom,
      leaveRoom,
      decide,
      clearNotice,
      requestRematch,
      returnToRoom,
      stillHere,
    ],
  );

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

export default RoomProvider;
