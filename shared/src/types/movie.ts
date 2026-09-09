export interface Movie {
    id: number;
    title: string;
    posterPath: string | null;
    releaseYear: number | null;
    overview: string;
    rating: number;
    genres: string[];
    runtimeMinutes: number | null;
    imdbId: string | null;
}