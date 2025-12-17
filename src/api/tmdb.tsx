import axios from "axios";

const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p";

export function getApiKey(): string {
    // 1) 과제 흐름(로그인 비번=키) 쓰는 경우
    const fromLS = localStorage.getItem("TMDb-Key");
    if (fromLS) return fromLS;

    // 2) .env로 넣는 경우(CRA는 REACT_APP_ prefix)
    const fromEnv = process.env.REACT_APP_TMDB_KEY;
    if (fromEnv) return fromEnv;

    throw new Error("TMDB 키가 없습니다. (localStorage TMDb-Key 또는 .env REACT_APP_TMDB_KEY)");
}

export const tmdb = axios.create({
    baseURL: BASE_URL,
    params: { language: "ko-KR" },
});

// ✅ 포스터 이미지 주소 생성
export function posterUrl(posterPath: string | null, size: "w185" | "w342" | "w500" = "w342") {
    if (!posterPath) return "";
    return `${IMG_BASE}/${size}${posterPath}`;
}

export type TmdbMovie = {
    id: number;
    title: string;
    poster_path: string | null;
};
