import { startTransition, useCallback } from "react";
import { useNavigate } from "react-router";
import { useRoom } from "./useRoom";

export function useLeaveRoom(): () => void {
    const navigate = useNavigate();
    const { leaveRoom } = useRoom();

    return useCallback(() => {
        navigate("/");
        startTransition(() => {
            leaveRoom();
        });
    }, [navigate, leaveRoom]);
}