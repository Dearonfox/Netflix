import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../api/client";
import { getMovie } from "../api/movies";
import type { Movie } from "../types/movie";
import { loadWishlist, toggleWish } from "../utils/wishlist";

type Props = {
    movieId: number | null;
    onClose: () => void;
};

export default function MovieDetailModal({ movieId, onClose }: Props) {
    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [wished, setWished] = useState(false);

    useEffect(() => {
        if (!movieId) return;

        let alive = true;

        (async () => {
            try {
                setLoading(true);
                setError("");
                setMovie(null);
                setWished(loadWishlist().some((item) => item.id === movieId));

                const data = await getMovie(movieId);
                if (alive) setMovie(data);
            } catch (e) {
                if (alive) setError(getApiErrorMessage(e, "영화 상세 정보를 불러오지 못했습니다."));
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [movieId]);

    useEffect(() => {
        if (!movieId) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [movieId, onClose]);

    if (!movieId) return null;

    const toggleCurrentMovie = () => {
        if (!movie) return;
        const next = toggleWish({
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
        });
        setWished(next.some((item) => item.id === movie.id));
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                background: "rgba(0,0,0,0.72)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
            }}
        >
            <div
                onClick={(event) => event.stopPropagation()}
                style={{
                    width: "min(860px, 100%)",
                    maxHeight: "88vh",
                    overflow: "auto",
                    borderRadius: 8,
                    background: "#141414",
                    color: "white",
                    boxShadow: "0 20px 70px rgba(0,0,0,0.7)",
                    border: "1px solid #2a2a2a",
                }}
            >
                <div
                    style={{
                        minHeight: 300,
                        backgroundImage: movie?.backdrop_url
                            ? `linear-gradient(to top, #141414 0%, rgba(20,20,20,0.25) 64%), url(${movie.backdrop_url})`
                            : "linear-gradient(135deg, #2b2b2b, #101010)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        position: "relative",
                        padding: "22px 24px",
                        display: "flex",
                        alignItems: "flex-end",
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="닫기"
                        style={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            border: "1px solid #333",
                            background: "rgba(0,0,0,0.72)",
                            color: "white",
                            cursor: "pointer",
                            fontSize: 20,
                            lineHeight: 1,
                        }}
                    >
                        ×
                    </button>

                    <div>
                        <h2 style={{ fontSize: 36, margin: 0, fontWeight: 900 }}>
                            {movie?.title ?? (loading ? "Loading..." : "상세 정보")}
                        </h2>
                        {movie && (
                            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12, color: "#d0d0d0" }}>
                                <span>평점 {(movie.vote_average ?? 0).toFixed(1)}</span>
                                <span>{movie.release_date || "개봉일 미정"}</span>
                                <span>{movie.original_language?.toUpperCase() || "언어 정보 없음"}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ padding: "22px 24px 26px" }}>
                    {loading && <div style={{ color: "#bbb" }}>상세 정보를 불러오는 중...</div>}
                    {error && <div style={{ color: "salmon" }}>Error: {error}</div>}

                    {movie && (
                        <>
                            <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                                <button
                                    type="button"
                                    style={{
                                        padding: "10px 16px",
                                        borderRadius: 6,
                                        border: "none",
                                        background: "white",
                                        color: "#111",
                                        fontWeight: 900,
                                        cursor: "pointer",
                                    }}
                                >
                                    ▶ 재생
                                </button>
                                <button
                                    type="button"
                                    onClick={toggleCurrentMovie}
                                    style={{
                                        padding: "10px 16px",
                                        borderRadius: 6,
                                        border: "1px solid #555",
                                        background: wished ? "#e50914" : "#242424",
                                        color: "white",
                                        fontWeight: 900,
                                        cursor: "pointer",
                                    }}
                                >
                                    {wished ? "찜 해제" : "찜 추가"}
                                </button>
                            </div>

                            <p style={{ color: "#e5e5e5", lineHeight: 1.6, margin: 0 }}>
                                {movie.overview || "줄거리 정보가 없습니다."}
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
