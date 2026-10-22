const STORAGE_KEY = "movie-roulette:session";

export interface StoredSession {
    code: string;
    token: string;
}

export function saveSession(session: StoredSession): void {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
        // Storage is unavailable (for example, blocked by browser settings).
        // The game still works; it just can't be resumed after a refresh.
    }
}

export function loadSession(): StoredSession | null {
    let raw: string| null;

    try {
        raw = sessionStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }

    if (raw === null) return null;

    try {
        const parsed: unknown = JSON.parse(raw);

        if (
            typeof parsed === "object" &&
            parsed !== null &&
            "code" in parsed &&
            "token" in parsed &&
            typeof parsed.code === "string" &&
            typeof parsed.token === "string"
        ) {
            return { code: parsed.code, token: parsed.token };
        }
    } catch {
        // Unreadable data is treated the same as no session at all.
    }

    return null;
}

export function clearSession(): void {
    try {
        sessionStorage.removeItem(STORAGE_KEY);
    } catch {
        // Nothing to clear if storage is unavailable.
    }
}