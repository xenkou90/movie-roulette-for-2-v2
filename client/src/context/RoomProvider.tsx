import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import type { RoomView } from "@movie-roulette/shared";
import { useSocket } from "../hooks/useSocket";
import { RoomContext, type CurrentRoom } from "./RoomContext";

interface RoomProviderProps {
    children: ReactNode;
}

function RoomProvider({ children }: RoomProviderProps) {
    const { socket } = useSocket();
    const [current, setCurrent] = useState<CurrentRoom | null>(null);
    const [lastDeparture, setLastDeparture] = useState<string | null>(null);

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
        }

        function handleDisconnect() {
            setCurrent(null);
        }

        socket.on("room:updated", handleUpdated);
        socket.on("room:playerLeft", handlePlayerLeft);
        socket.on("disconnect", handleDisconnect);

        return () => {
            socket.off("room:updated", handleUpdated);
            socket.off("room:playerLeft", handleDisconnect);
            socket.off("disconnect", handleDisconnect);
        };
    }, [socket]);

    const enterRoom = useCallback((next: CurrentRoom) => {
        setLastDeparture(null);
        setCurrent(next);
    }, []);

    const leaveRoom = useCallback(() => {
        socket.emit("room:leave", () => {
            // Leaving cannot fail, so local state is cleared optimistically below.
        });
        setCurrent(null);
        setLastDeparture(null);
    }, [socket]);

    const value = useMemo(
        () => ({ current, lastDeparture, enterRoom, leaveRoom }),
        [current, lastDeparture, enterRoom, leaveRoom],
    );

    return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

export default RoomProvider;