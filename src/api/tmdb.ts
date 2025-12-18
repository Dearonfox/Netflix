import axios from "axios";

const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p";

export function getApiKey(): string {
    const fromLS = (localStorage.getItem("TMDB-Key") ?? "").trim();
    if (fromLS) return fromLS;

    const fromEnv = (process.env.REACT_APP_TMDB_API_KEY ?? "").trim();
    if (fromEnv) return fromEnv;

    throw new Error("TMDB 키가 없습니다. (localStorage TMDb-Key 또는 .env REACT_APP_TMDB_KEY)");
}

export function isV4Token(key: string) {
    return key.trim().startsWith("eyJ");
}

export const tmdb = axios.create({
    baseURL: BASE_URL,
    params: { language: "ko-KR" },
});

export function posterUrl(
    posterPath: string | null,
    size: "w185" | "w342" | "w500" | "w1280" = "w342"
) {
    if (!posterPath) return "";
    return `${IMG_BASE}/${size}${posterPath}`;
}
