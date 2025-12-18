import { useEffect, useState } from "react";
import { tmdb, getApiKey, isV4Token } from "../api/tmdb";

type Movie = {
    id: number;
    title: string;
    overview: string;
    backdrop_path: string | null;
};

type Resp = { results: Movie[] };

function backdropUrl(path: string | null) {
    return path ? `https://image.tmdb.org/t/p/w1280${path}` : "";
}

export default function Banner() {
    const [movie, setMovie] = useState<Movie | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const key = getApiKey();
                const v4 = isV4Token(key);

                const res = await tmdb.get<Resp>("/movie/popular", {
                    params: v4 ? { page: 1 } : { api_key: key, page: 1 },
                    headers: v4 ? { Authorization: `Bearer ${key}` } : undefined,
                });

                const first = res.data.results?.[0] ?? null;
                setMovie(first);
            } catch {
                setMovie(null);
            }
        })();
    }, []);

    const bg = backdropUrl(movie?.backdrop_path ?? null);

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
                {movie?.title ?? "Loading..."}
            </h1>

            <p style={{ maxWidth: 720, marginTop: 14, color: "#e5e5e5", lineHeight: 1.4 }}>
                {(movie?.overview ?? "").slice(0, 160)}
                {movie?.overview && movie.overview.length > 160 ? "..." : ""}
            </p>

            <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
                <button style={{ padding: "10px 16px", fontWeight: 800, cursor: "pointer" }}>▶ 재생</button>
                <button style={{ padding: "10px 16px", fontWeight: 800, cursor: "pointer" }}>ⓘ 상세 정보</button>
            </div>
        </div>
    );
}
