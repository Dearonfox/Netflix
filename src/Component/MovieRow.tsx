import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../api/client";
import { getMovieList, type MovieListKind } from "../api/movies";
import { loadWishlist, toggleWish } from "../utils/wishlist";
import type { Movie } from "../types/movie";
import MovieDetailModal from "./MovieDetailModal";

function posterUrl(movie: Movie) {
    return movie.poster_url || "";
}

type Props = {
    title: string;
    kind: MovieListKind;
};

export default function MovieRow({ title, kind }: Props) {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

    // ✅ 현재 찜 상태(IDs)
    const [wishIds, setWishIds] = useState<number[]>(() =>
        loadWishlist().map((x) => x.id)
    );

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getMovieList(kind);
                if (alive) setMovies(data.results ?? []);
            } catch (e) {
                if (alive) setError(getApiErrorMessage(e, "영화 목록 요청 실패"));
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [kind]);

    return (
        <section style={{ padding: "18px 0" }}>
            <h2 style={{ color: "white", margin: "0 0 10px 0" }}>{title}</h2>

            {loading && <div style={{ color: "#bbb" }}>Loading...</div>}
            {error && <div style={{ color: "salmon" }}>Error: {error}</div>}

            <div
                className="movieRowScroller"
                style={{
                    display: "flex",
                    gap: 10,
                    overflowX: "auto",
                    padding: "2px 2px 12px",
                }}
            >
                {movies.map((m) => {
                    const img = posterUrl(m);
                    const wished = wishIds.includes(m.id);

                    return (
                        <div
                            key={m.id}
                            onClick={() => setSelectedMovieId(m.id)}
                            style={{
                                minWidth: 140,
                                cursor: "pointer",
                                transform: "scale(1)",
                                transition: "transform 0.15s ease",
                                position: "relative",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        >
                            {/* ★ 표시 */}
                            <div
                                onClick={(event) => {
                                    event.stopPropagation();
                                    const next = toggleWish({ id: m.id, title: m.title, poster_path: m.poster_path });
                                    setWishIds(next.map((x) => x.id));
                                }}
                                style={{
                                    position: "absolute",
                                    top: 6,
                                    right: 8,
                                    fontSize: 18,
                                    color: wished ? "gold" : "#aaa",
                                    textShadow: "0 0 4px rgba(0,0,0,0.8)",
                                    zIndex: 2,
                                }}
                            >
                                ★
                            </div>

                            {img ? (
                                <img
                                    src={img}
                                    alt={m.title}
                                    style={{ width: 140, borderRadius: 6, display: "block" }}
                                />
                            ) : (
                                <div style={{ width: 140, height: 210, background: "#333", borderRadius: 6 }} />
                            )}
                        </div>
                    );
                })}
            </div>
            <MovieDetailModal movieId={selectedMovieId} onClose={() => setSelectedMovieId(null)} />
        </section>
    );
}
