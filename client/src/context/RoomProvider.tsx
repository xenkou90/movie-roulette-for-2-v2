import {
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useState,
    type ReactNode,
} from "react";
import type { Decision, Movie, RoomView } from "@movie-roulette/shared";
import { useSocket } from "../hooks/useSocket";
import { gameReducer, initialGameState } from "../game/gameReducer";
import { RoomContext, type CurrentRoom } from "./RoomContext";

interface RoomProviderProps {
    children: ReactNode;
}

function RoomProvider({ children }: RoomProviderProps) {
    const { socket } = useSocket();
    const [current, setCurrent] = useState<CurrentRoom | null>(null);
    const [lastDeparture, setLastDeparture] = useState<string | null>(null);
    const [game, dispatch] = useReducer(gameReducer, initialGameState);

    useEffect(() => {
        function handleUpdated(room: RoomView) {
            setCurrent((prev) =>
                prev !== null && prev.room.code === room.code
                    ? { ...prev, room }
                    : prev,
            );
        }

        function handlePlayerLeft(payload: { socketId: string; name: string }) {
            setLastDeparture(payload.name);
            dispatch({ type: "reset" });
        }

        function handleDisconnect() {
            setCurrent(null);
            dispatch({ type: "reset" });
        }

        function handleStarted(payload: { movie: Movie }) {
            dispatch({ type: "started", movie: payload.movie });
        }

        function handleMatched(payload: { movie: Movie }) {
            dispatch({ type: "matched", movie: payload.movie });
        }

        function handlePartnerPassed() {
            dispatch({ type: "partnerPassed" });
        }

        function handleUnavailable() {
            dispatch({ type: "unavailable" });
        }

        socket.on("room:updated", handleUpdated);
        socket.on("room:playerLeft", handlePlayerLeft);
        socket.on("disconnect", handleDisconnect);
        socket.on("game:started", handleStarted);
        socket.on("game:matched", handleMatched);
        socket.on("game:partnerPassed", handlePartnerPassed);
        socket.on("game:unavailable", handleUnavailable);

        return () => {
            socket.off("room:updated", handleUpdated);
            socket.off("room:playerLeft", handlePlayerLeft);
            socket.off("disconnect", handleDisconnect);
            socket.off("game:started", handleStarted);
            socket.off("game:matched", handleMatched);
            socket.off("game:partnerPassed", handlePartnerPassed);
            socket.off("game:unavailable", handleUnavailable);
        };

    }, [socket]);

    const enterRoom = useCallback((next: CurrentRoom) => {
        setLastDeparture(null);
        dispatch({ type: "reset" });
        setCurrent(next);
    }, []);

    const leaveRoom = useCallback(() => {
        socket.emit("room:leave", () => {
            // Leaving cannot fail, so local state is cleared optimistically below.
        });
        setCurrent(null);
        setLastDeparture(null);
        dispatch({ type: "reset" });
    }, [socket]);

    const decide = useCallback(
        (movieId: number, decision: Decision) => {
            dispatch({ type: "decisionSent" });

            socket.emit("game:decide", { movieId, decision }, (result) => {
                if (!result.ok) {
                    dispatch({ type: "decisionRejected" });
                    return;
                }

                if (result.movie !== null) {
                    dispatch({ type: "advanced", movie: result.movie });
                }
            });
        },
        [socket],
    );

    const clearNotice = useCallback(() => {
        dispatch({ type: "noticeCleared" });
    }, []);

    const value = useMemo(
        () => ({
            current,
            lastDeparture,
            game,
            enterRoom,
            leaveRoom,
            decide,
            clearNotice,
        }),
        [current, lastDeparture, game, enterRoom, leaveRoom, decide, clearNotice],
    );

    return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>
}

export default RoomProvider;