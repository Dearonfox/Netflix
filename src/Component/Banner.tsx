import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../api/client";
import { getMovieList } from "../api/movies";
import type { Movie } from "../types/movie";

function backdropUrl(movie: Movie | null) {
    if (!movie) return "";
    return movie.backdrop_url || "";
}

export default function Banner() {
    const [movie, setMovie] = useState<Movie | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                setError("");
                const data = await getMovieList("popular");
                const first = data.results?.[0] ?? null;
                setMovie(first);
            } catch (e) {
                setError(getApiErrorMessage(e, "영화 정보를 불러오지 못했습니다."));
                setMovie(null);
            }
        })();
    }, []);

    const bg = backdropUrl(movie);

    return (
        <div
            style={{
                height: 420,
                backgroundImage: bg ? `linear-gradient(to top, #111 0%, rgba(17,17,17,0.2) 60%), url(${bg})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                padding: "70px 22px 0",
                color: "white",
            }}
        >
            <h1 style={{ fontSize: 44, margin: 0, fontWeight: 900 }}>
                {movie?.title ?? (error ? "영화 API 연결 필요" : "Loading...")}
            </h1>

            <p style={{ maxWidth: 720, marginTop: 14, color: "#e5e5e5", lineHeight: 1.4 }}>
                {error || (movie?.overview ?? "").slice(0, 160)}
                {!error && movie?.overview && movie.overview.length > 160 ? "..." : ""}
            </p>

            <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
                <button style={{ padding: "10px 16px", fontWeight: 800, cursor: "pointer" }}>▶ 재생</button>
                <button style={{ padding: "10px 16px", fontWeight: 800, cursor: "pointer" }}>ⓘ 상세 정보</button>
            </div>
        </div>
    );
}
