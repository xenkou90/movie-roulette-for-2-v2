export interface ServerHelloPayload {
    socketId: string;
    serverTime: number;
}

export interface PingResult {
    serverTime: number;
}

export interface ServerToClientEvents {
    "server:hello": (payload: ServerHelloPayload) => void;
}

export interface ClientToServerEvents {
    "client:ping": (ack: (result: PingResult) => void) => void;
}