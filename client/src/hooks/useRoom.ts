import { useContext } from "react";
import { RoomContext, type RoomContextValue } from "../context/RoomContext";

export function useRoom(): RoomContextValue {
    const context = useContext(RoomContext);

    if (context === null) {
        throw new Error("useRoom must be used within a RoomProvider");
    }

    return context;
}