import { env } from "../config/env.js";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const REQUEST_TIMEOUT_MS = 8000;

export class TmdbError extends Error {
    readonly status: number | undefined;

    constructor(message: string, status?: number, cause?: unknown) {
        super(message, { cause });
        this.name = "TmdbError";
        this.status = status;
    }
}

export async function tmdbFetch<T>(
    path: string,
    params: Record<string, string> = {},
): Promise<T> {
    const url = new URL(`${TMDB_BASE_URL}${path}`);
    url.searchParams.set("api_key", env.tmdbApiKey);
    url.searchParams.set("language", "en-US");

    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
    }

    let response: Response;

    try {
        response = await fetch(url, {
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
    } catch (cause) {
        throw new TmdbError(`Network request to TMDB failed: ${path}`, undefined, cause);
    }

    if (!response.ok) {
        throw new TmdbError(
            `TMDB responded with ${response.status} for ${path}`,
            response.status,
        );
    }

    try {
        return (await response.json()) as T;
    } catch (cause) {
        throw new TmdbError(`Could not parse TMDB response: ${path}`, undefined, cause);
    }
}