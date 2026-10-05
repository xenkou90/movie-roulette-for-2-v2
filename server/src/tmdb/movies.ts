import type { Movie } from "@movie-roulette/shared";
import { TmdbError, tmdbFetch } from "./client.js";
import { getGenreMap, type GenreMap } from "./genres.js";
import type { TmdbMovieSummary, TmdbPaginatedResponse } from "./types.js";

function isTmdbMovieSummary(value: unknown): value is TmdbMovieSummary {
    if (typeof value !== "object" || value === null) return false;

    const candidate = value as Record<string, unknown>;

    return (
        typeof candidate.id === "number" &&
        typeof candidate.title === "string" &&
        typeof candidate.overview === "string" &&
        typeof candidate.vote_average === "number" &&
        Array.isArray(candidate.genre_ids)
    );
}

function parseReleaseYear(releaseDate: unknown): number | null {
    if (typeof releaseDate !== "string" || releaseDate.length < 4) return null;
    const year = Number(releaseDate.slice(0, 4));
    return Number.isInteger(year) ? year : null;
}

function toMovie(summary: TmdbMovieSummary, genreMap: GenreMap): Movie {
    return {
        id: summary.id,
        title: summary.title,
        posterPath: summary.poster_path ?? null,
        releaseYear: parseReleaseYear(summary.release_date),
        overview: summary.overview,
        rating: summary.vote_average,
        genres: summary.genre_ids
            .map((id) => genreMap.get(id))
            .filter((name): name is string => name !== undefined),
        runtimeMinutes: null,
        imdbId: null,
    };
}

export async function fetchPopularMovies(page = 1): Promise<Movie[]> {
    const [response, genreMap] = await Promise.all([
        tmdbFetch<TmdbPaginatedResponse<unknown>>("/movie/popular", {
            page: String(page),
        }),
        getGenreMap(),
    ]);

    return response.results
        .filter(isTmdbMovieSummary)
        .map((summary) => toMovie(summary, genreMap));
}

export interface MovieDetails {
    runtimeMinutes: number | null;
    imdbId: string | null;
}

const IMDB_ID_PATTERN = /^tt\d+$/;

export async function fetchMovieDetails(movieId: number): Promise<MovieDetails> {
    const data = await tmdbFetch<unknown>(`/movie/${movieId}`);

    if (typeof data !== "object" || data === null) {
        throw new TmdbError(`Unexpected details response for movie ${movieId}`);
    }

    const candidate = data as Record<string, unknown>;
    const { runtime, imdb_id: imdbId } = candidate;

    return {
        runtimeMinutes: typeof runtime === "number" && runtime > 0 ? runtime : null,
        imdbId:
            typeof imdbId === "string" && IMDB_ID_PATTERN.test(imdbId) ? imdbId : null,
    };
}