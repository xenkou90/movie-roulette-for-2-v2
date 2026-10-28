import type { Movie } from "@movie-roulette/shared";

export function makeMovie(overrides: Partial<Movie> = {}): Movie {
  return {
    id: 1,
    title: "Test Movie",
    posterPath: "/poster.jpg",
    releaseYear: 2024,
    overview: "A movie used in tests.",
    rating: 7.5,
    genres: ["Drama"],
    runtimeMinutes: null,
    imdbId: null,
    ...overrides,
  };
}
