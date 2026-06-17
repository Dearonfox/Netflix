import { apiClient } from "./client";
import type { Movie, MovieListResponse } from "../types/movie";

export type MovieListKind = "popular" | "top-rated" | "now-playing" | "upcoming";

export async function getMovieList(kind: MovieListKind, page = 1) {
    const res = await apiClient.get<MovieListResponse>(`/api/movies/${kind}`, {
        params: { page },
    });
    return res.data;
}

export async function searchMovies(query: string, page = 1) {
    const res = await apiClient.get<MovieListResponse>("/api/movies/search", {
        params: { query, page },
    });
    return res.data;
}

export async function getMovie(movieId: number) {
    const res = await apiClient.get<Movie>(`/api/movies/${movieId}`);
    return res.data;
}
