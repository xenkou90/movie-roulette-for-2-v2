import type { Movie } from "@movie-roulette/shared";
import type { AppServer } from "../socket/types.js";
import { getCachedDetails, loadDetails } from "../tmdb/detailsCache.js";
import type { MovieQueue } from "./queue.js";

const DETAILS_LOOKAHEAD = 3;

export function prefetchDetails(queue: MovieQueue, fromIndex: number): void {
  const upcoming = queue.movies.slice(fromIndex, fromIndex + DETAILS_LOOKAHEAD);

  for (const movie of upcoming) {
    loadDetails(movie.id).catch(() => {
      // Not fatal: a card whose details failed to prefetch requests them again when shown.
    });
  }
}

export function sendDetailsWhenReady(
  io: AppServer,
  target: string,
  movie: Movie,
  isStillRelevant: () => boolean,
): void {
  if (getCachedDetails(movie.id) !== undefined) {
    return;
  }

  loadDetails(movie.id)
    .then((details) => {
      if (!isStillRelevant()) return;

      io.to(target).emit("game:movieDetails", {
        movie: { ...movie, ...details },
      });
    })
    .catch((error: unknown) => {
      console.error(`[game] could not load details for ${movie.title}`, error);
    });
}
