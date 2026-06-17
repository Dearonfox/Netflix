const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

export type MovieNote = {
    movieId: number;
    user: string;
    note: string;
    updatedAt?: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options?.headers ?? {}),
        },
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `API request failed: ${res.status}`);
    }

    return res.json() as Promise<T>;
}

export function getMovieNote(movieId: number, user: string) {
    return request<MovieNote>(`/api/movies/${movieId}/note?user=${encodeURIComponent(user)}`);
}

export function saveMovieNote(movieId: number, user: string, note: string) {
    return request<MovieNote>(`/api/movies/${movieId}/note?user=${encodeURIComponent(user)}`, {
        method: "POST",
        body: JSON.stringify({ note }),
    });
}
