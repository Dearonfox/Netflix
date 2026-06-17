import { useEffect, useRef, useState } from "react";
import { getApiErrorMessage } from "../api/client";
import { getMovieList } from "../api/movies";
import { loadWishlist, toggleWish } from "../utils/wishlist";
import type { Movie } from "../types/movie";
import MovieDetailModal from "../Component/MovieDetailModal";

function posterUrl(movie: Movie) {
    return movie.poster_url || "";
}

type ViewMode = "table" | "infinite";

export default function Popular() {
    const [mode, setMode] = useState<ViewMode>("table");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

    const [wishIds, setWishIds] = useState<number[]>(() =>
        loadWishlist().map((x) => x.id)
    );

    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const fetchPage = async (p: number, append: boolean) => {
        try {
            setLoading(true);
            setError("");

            const data = await getMovieList("popular", p);

            setTotalPages(data.total_pages ?? 1);

            const next = data.results ?? [];
            setMovies((prev) => (append ? [...prev, ...next] : next));
        } catch (e) {
            setError(getApiErrorMessage(e, "요청 실패"));
        } finally {
            setLoading(false);
        }
    };

    // 모드 전환 시 초기화
    useEffect(() => {
        setWishIds(loadWishlist().map((x) => x.id));

        if (mode === "table") {
            setPage(1);
            fetchPage(1, false);
        } else {
            setMovies([]);
            setPage(1);
            window.scrollTo({ top: 0 });
            fetchPage(1, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    // Table 페이지 변경
    useEffect(() => {
        if (mode !== "table") return;
        fetchPage(page, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    // Infinite: page 증가 시 append fetch
    useEffect(() => {
        if (mode !== "infinite") return;
        if (page === 1) return;
        fetchPage(page, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, mode]);

    // Infinite: 끝 도달 시 다음 페이지
    useEffect(() => {
        if (mode !== "infinite") return;
        if (!sentinelRef.current) return;

        const el = sentinelRef.current;

        const io = new IntersectionObserver(
            (entries) => {
                const hit = entries.some((en) => en.isIntersecting);
                if (!hit) return;
                if (loading) return;
                if (page >= totalPages) return;

                setPage((p) => Math.min(totalPages, p + 1));
            },
            { root: null, rootMargin: "300px", threshold: 0 }
        );

        io.observe(el);
        return () => io.disconnect();
    }, [mode, loading, page, totalPages]);

    // Top 버튼
    const [showTop, setShowTop] = useState(false);
    useEffect(() => {
        if (mode !== "infinite") return;
        const onScroll = () => setShowTop(window.scrollY > 450);
        window.addEventListener("scroll", onScroll);
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, [mode]);

    const toggle = (m: Movie) => {
        const next = toggleWish({ id: m.id, title: m.title, poster_path: m.poster_path });
        setWishIds(next.map((x) => x.id));
    };

    // Table 모드는 첫 화면에서 보기 좋게 Top 5만 강조합니다.
    const tableMovies = movies.slice(0, 5);

    return (
        <div style={{ background: "#111", minHeight: "100vh", padding: "28px clamp(18px, 4vw, 48px)" }}>
            <div
                style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-end",
                    marginBottom: 22,
                    flexWrap: "wrap",
                }}
            >
                <div style={{ marginRight: "auto" }}>
                    <h1 style={{ color: "white", margin: 0, fontSize: 34, fontWeight: 900, letterSpacing: 0 }}>
                        대세 콘텐츠
                    </h1>
                    <div style={{ color: "#a8a8a8", marginTop: 8, fontSize: 14 }}>
                        지금 많이 보는 영화들을 빠르게 훑어보세요.
                    </div>
                </div>

                <button
                    onClick={() => setMode("table")}
                    style={{
                        padding: "10px 14px",
                        borderRadius: 999,
                        border: mode === "table" ? "1px solid #e50914" : "1px solid #3a3a3a",
                        background: mode === "table" ? "#e50914" : "#151515",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: 800,
                    }}
                >
                    자세히 보기
                </button>

                <button
                    onClick={() => setMode("infinite")}
                    style={{
                        padding: "10px 14px",
                        borderRadius: 999,
                        border: mode === "infinite" ? "1px solid #e50914" : "1px solid #3a3a3a",
                        background: mode === "infinite" ? "#e50914" : "#151515",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: 800,
                    }}
                >
                    펼쳐보기
                </button>
            </div>

            {error && <div style={{ color: "salmon", marginBottom: 10 }}>Error: {error}</div>}

            {/* TABLE VIEW */}
            {mode === "table" && (
                <>
                    <div
                        style={{
                            display: "grid",
                            gap: 14,
                        }}
                    >
                        {tableMovies.map((m, index) => {
                            const img = posterUrl(m);
                            const wished = wishIds.includes(m.id);

                            return (
                                <div
                                    key={m.id}
                                    onClick={() => setSelectedMovieId(m.id)}
                                    style={{
                                        minHeight: 132,
                                        display: "grid",
                                        gridTemplateColumns: "76px 86px minmax(0, 1fr) auto",
                                        gap: 18,
                                        alignItems: "center",
                                        padding: "16px 18px",
                                        borderRadius: 10,
                                        border: wished ? "1px solid rgba(229,9,20,0.55)" : "1px solid #252525",
                                        background:
                                            "linear-gradient(90deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))",
                                        boxShadow: "0 12px 34px rgba(0,0,0,0.28)",
                                        cursor: "pointer",
                                        transition: "transform .16s ease, background .16s ease, border-color .16s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.borderColor = wished ? "rgba(229,9,20,0.55)" : "#252525";
                                    }}
                                >
                                    <div
                                        style={{
                                            color: "#333",
                                            WebkitTextStroke: "2px #b5b5b5",
                                            fontSize: 66,
                                            fontWeight: 900,
                                            lineHeight: 1,
                                            textAlign: "center",
                                        }}
                                    >
                                        {index + 1}
                                    </div>

                                    <div
                                        style={{
                                            width: 76,
                                            height: 112,
                                            borderRadius: 7,
                                            overflow: "hidden",
                                            background: "#252525",
                                            boxShadow: "0 10px 22px rgba(0,0,0,0.45)",
                                        }}
                                    >
                                        {img ? (
                                            <img
                                                src={img}
                                                alt={m.title}
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                        ) : (
                                            <div style={{ width: "100%", height: "100%" }} />
                                        )}
                                    </div>

                                    <div style={{ minWidth: 0 }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: 10,
                                                alignItems: "center",
                                                minWidth: 0,
                                            }}
                                        >
                                            <h3
                                                style={{
                                                    color: "white",
                                                    fontSize: 23,
                                                    lineHeight: 1.25,
                                                    margin: 0,
                                                    fontWeight: 900,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {m.title}
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    toggle(m);
                                                }}
                                                title={wished ? "찜 해제" : "찜 추가"}
                                                style={{
                                                    width: 34,
                                                    height: 34,
                                                    borderRadius: "50%",
                                                    border: wished ? "1px solid #e50914" : "1px solid #4a4a4a",
                                                    background: wished ? "#e50914" : "rgba(0,0,0,0.25)",
                                                    color: "white",
                                                    cursor: "pointer",
                                                    fontSize: 18,
                                                    flex: "0 0 auto",
                                                }}
                                            >
                                                {wished ? "★" : "＋"}
                                            </button>
                                        </div>

                                        <div
                                            style={{
                                                display: "flex",
                                                gap: 8,
                                                flexWrap: "wrap",
                                                marginTop: 12,
                                                color: "#d6d6d6",
                                                fontSize: 14,
                                            }}
                                        >
                                            <span style={{ color: "#46d369", fontWeight: 900 }}>
                                                평점 {(m.vote_average ?? 0).toFixed(1)}
                                            </span>
                                            <span>{m.release_date || "개봉일 미정"}</span>
                                            <span>{m.original_language?.toUpperCase() || "언어 정보 없음"}</span>
                                            <span>인기도 {(m.popularity ?? 0).toFixed(0)}</span>
                                        </div>

                                        <div
                                            style={{
                                                color: "#9f9f9f",
                                                fontSize: 13,
                                                marginTop: 10,
                                            }}
                                        >
                                            클릭해서 상세 정보 보기
                                        </div>
                                    </div>

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
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        ▶ 재생
                                    </button>
                                </div>
                            );
                        })}

                        {loading && <div style={{ color: "#bbb", padding: 18 }}>Loading...</div>}
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            justifyContent: "center",
                            alignItems: "center",
                            marginTop: 22,
                        }}
                    >
                        <button
                            disabled={page <= 1 || loading}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            style={{
                                padding: "10px 16px",
                                borderRadius: 999,
                                border: "1px solid #3a3a3a",
                                background: page <= 1 ? "#202020" : "#151515",
                                color: "white",
                                cursor: page <= 1 ? "not-allowed" : "pointer",
                                fontWeight: 800,
                            }}
                        >
                            이전
                        </button>

                        <div style={{ color: "white", fontWeight: 900, minWidth: 96, textAlign: "center" }}>
                            {page} / {totalPages}
                        </div>

                        <button
                            disabled={page >= totalPages || loading}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            style={{
                                padding: "10px 16px",
                                borderRadius: 999,
                                border: "1px solid #3a3a3a",
                                background: page >= totalPages ? "#202020" : "#151515",
                                color: "white",
                                cursor: page >= totalPages ? "not-allowed" : "pointer",
                                fontWeight: 800,
                            }}
                        >
                            다음
                        </button>
                    </div>
                </>
            )}

            {/* INFINITE VIEW */}
            {mode === "infinite" && (
                <>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                            gap: 12,
                            marginTop: 8,
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
                                        cursor: "pointer",
                                        position: "relative",
                                        borderRadius: 12,
                                        padding: 8,
                                        background: wished ? "rgba(229,9,20,0.10)" : "transparent",
                                        border: wished ? "1px solid rgba(229,9,20,0.55)" : "1px solid #222",
                                        transition: "transform .15s ease",
                                        transform: "scale(1)",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                >
                                    <div
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            toggle(m);
                                        }}
                                        style={{
                                            position: "absolute",
                                            top: 10,
                                            right: 12,
                                            fontSize: 18,
                                            color: wished ? "gold" : "#666",
                                            textShadow: "0 0 4px rgba(0,0,0,0.8)",
                                        }}
                                    >
                                        ★
                                    </div>

                                    {img ? (
                                        <img
                                            src={img}
                                            alt={m.title}
                                            style={{ width: "100%", borderRadius: 10, display: "block" }}
                                        />
                                    ) : (
                                        <div style={{ height: 210, background: "#333", borderRadius: 10 }} />
                                    )}

                                    <div style={{ color: "white", marginTop: 8, fontWeight: 800, fontSize: 14 }}>
                                        {m.title}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div ref={sentinelRef} style={{ height: 1 }} />
                    {loading && <div style={{ color: "#bbb", marginTop: 14 }}>Loading more...</div>}

                    {showTop && (
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            style={{
                                position: "fixed",
                                right: 18,
                                bottom: 18,
                                padding: "10px 12px",
                                borderRadius: 999,
                                border: "1px solid #333",
                                background: "#151515",
                                color: "white",
                                cursor: "pointer",
                                fontWeight: 900,
                            }}
                        >
                            Top ↑
                        </button>
                    )}
                </>
            )}

            <MovieDetailModal movieId={selectedMovieId} onClose={() => setSelectedMovieId(null)} />
        </div>
    );
}
