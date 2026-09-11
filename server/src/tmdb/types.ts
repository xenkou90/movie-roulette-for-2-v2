export interface TmdbMovieSummary {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
    overview: string;
    vote_average: number;
    genre_ids: number[];
}

export interface TmdbPaginatedResponse<T> {
    page: number;
    results: T[];
    total_pages: number;
    total_results: number;
}

export interface TmdbGenre {
    id: number;
    name: string;
}

export interface TmdbGenreListResponse {
    genres: TmdbGenre[];
}