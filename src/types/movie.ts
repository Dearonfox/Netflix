export type Movie = {
    id: number;
    title: string;
    overview?: string;
    poster_path: string | null;
    backdrop_path?: string | null;
    poster_url?: string | null;
    backdrop_url?: string | null;
    release_date?: string | null;
    vote_average?: number;
    popularity?: number;
    original_language?: string | null;
};

export type MovieListResponse = {
    page: number;
    total_pages: number;
    total_results: number;
    results: Movie[];
};
