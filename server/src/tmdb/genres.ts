import { tmdbFetch } from "./client.js";
import type { TmdbGenreListResponse } from "./types.js";

export type GenreMap = ReadonlyMap<number, string>;

let cachedGenreMap: Promise<GenreMap> | null = null;

async function loadGenreMap(): Promise<GenreMap> {
    const data = await tmdbFetch<TmdbGenreListResponse>("/genre/movie/list");
    return new Map(data.genres.map((genre) => [genre.id, genre.name]));
}

export function getGenreMap(): Promise<GenreMap> {
    if (cachedGenreMap === null) {
        cachedGenreMap = loadGenreMap().catch((error: unknown) => {
            cachedGenreMap = null;
            throw error;
        });
    }
    return cachedGenreMap;
}