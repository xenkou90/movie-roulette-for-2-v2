import { useEffect, useMemo, useState, type ReactNode } from "react";
import { socket } from "../lib/socket";
import { SocketContext } from "./SocketContext";

interface SocketProviderProps {
    children: ReactNode;
}

function SocketProvider({ children }: SocketProviderProps) {
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        function handleConnect() {
            setIsConnected(true);
        }

        function handleDisconnect() {
            setIsConnected(false);
        }

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.connect();

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.disconnect();
        };
    }, []);

    const value = useMemo(() => ({ socket, isConnected }), [isConnected]);

    return (
        <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
    );
}

export default SocketProvider;