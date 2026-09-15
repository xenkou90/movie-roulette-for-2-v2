import { useContext } from "react";
import { SocketContext, type SocketContextValue } from "../context/SocketContext";

export function useSocket(): SocketContextValue {
    const context = useContext(SocketContext);

    if (context === null) {
        throw new Error("useSocket must be used within a SocketProvider");
    }

    return context;
}