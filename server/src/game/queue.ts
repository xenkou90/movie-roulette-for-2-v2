import { randomInt } from "node:crypto";
import type { Movie } from "@movie-roulette/shared";
import { fetchPopularMovies } from "../tmdb/movies.js";

const REFILL_THRESHOLD = 10;
const MAX_REFILLS_PER_CALL = 3;
const STARTING_PAGE_RANGE = 10;

export interface MovieQueue {
    movies: Movie[];
    seenIds: Set<number>;
    nextPage: number;
    pending: Promise<void> | null;
}

export function createQueue(): MovieQueue {
    return {
        movies: [],
        seenIds: new Set(),
        nextPage: randomInt(1, STARTING_PAGE_RANGE + 1),
        pending: null,
    };
}

function shuffle<T>(items: T[]): void {
    for (let i = items.length - 1; i > 0; i -= 1) {
        const j = randomInt(0, i + 1);
        const a = items[i];
        const b = items[j];
        if (a === undefined || b === undefined) continue;
        items[i] = b;
        items[j] = a;
    }
}

async function refill(queue: MovieQueue): Promise<void> {
    const page = queue.nextPage;
    queue.nextPage += 1;

    const movies = await fetchPopularMovies(page);

    const fresh = movies.filter(
        (movie) => movie.posterPath !== null && !queue.seenIds.has(movie.id),
    );

    shuffle(fresh);

    for (const movie of fresh) {
        queue.seenIds.add(movie.id);
        queue.movies.push(movie);
    }
}

export async function ensureAvailable(
    queue: MovieQueue,
    index: number,
): Promise<void> {
    let refills = 0;

    while (
        queue.movies.length - index <= REFILL_THRESHOLD &&
        refills < MAX_REFILLS_PER_CALL
    ) {
        queue.pending ??= refill(queue).finally(() => {
            queue.pending = null;
        });

        await queue.pending;
        refills += 1;
    }
}