import type { Movie } from "@movie-roulette/shared";
import { fetchMovieDetails, type MovieDetails } from "./movies.js";

const MAX_CACHED = 2000;

const resolved = new Map<number, MovieDetails>();
const inFlight = new Map<number, Promise<MovieDetails>>();

function remember(movieId: number, details: MovieDetails): void {
  resolved.set(movieId, details);

  if (resolved.size > MAX_CACHED) {
    const oldest = resolved.keys().next().value;
    if (oldest !== undefined) {
      resolved.delete(oldest);
    }
  }
}

export function getCachedDetails(movieId: number): MovieDetails | undefined {
  return resolved.get(movieId);
}

export function loadDetails(movieId: number): Promise<MovieDetails> {
  const cached = resolved.get(movieId);
  if (cached !== undefined) {
    return Promise.resolve(cached);
  }

  const existing = inFlight.get(movieId);
  if (existing !== undefined) {
    return existing;
  }

  const request = fetchMovieDetails(movieId)
    .then((details) => {
      remember(movieId, details);
      return details;
    })
    .finally(() => {
      inFlight.delete(movieId);
    });

  inFlight.set(movieId, request);
  return request;
}

export function withDetails(movie: Movie): Movie {
  const details = resolved.get(movie.id);
  return details === undefined ? movie : { ...movie, ...details };
}
