import type { Movie } from "@movie-roulette/shared";

export function imdbUrl(movie: Movie): string {
  if (movie.imdbId !== null) {
    return `https://www.imdb.com/title/${movie.imdbId}/`;
  }

  const query =
    movie.releaseYear === null
      ? movie.title
      : `${movie.title} ${movie.releaseYear}`;

  return `https://www.imdb.com/find/?q=${encodeURIComponent(query)}`;
}

export function letterboxdUrl(movie: Movie): string {
  return `https://letterboxd.com/tmdb/${movie.id}/`;
}