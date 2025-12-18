export const STORAGE_KEYS = {
    USERS: "users",
    CURRENT_USER: "currentUser",
    TMDB_KEY: "TMDB-Key",
    KEEP_LOGIN: "keepLogin",
    WISHLIST: "Wishlist",
} as const;

export type User = { id: string; pw: string };

export function readJSON<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

export function writeJSON(key: string, value: unknown) {
    localStorage.setItem(key, JSON.stringify(value));
}
