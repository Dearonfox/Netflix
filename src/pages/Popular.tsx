import { useEffect, useMemo, useRef, useState } from "react";
import { tmdb, getApiKey } from "../api/tmdb";
import { loadWishlist, toggleWish } from "../utils/wishlist";

type Movie = {
    id: number;
    title: string;
    poster_path: string | null;
    release_date?: string;
    vote_average?: number;
    popularity?: number;
    original_language?: string;
};

type Resp = {
    results: Movie[];
    page: number;
    total_pages: number;
};

function posterUrl(path: string | null, size: "w185" | "w342" = "w185") {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : "";
}

type ViewMode = "table" | "infinite";

export default function Popular() {
    const [mode, setMode] = useState<ViewMode>("table");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [wishIds, setWishIds] = useState<number[]>(() =>
        loadWishlist().map((x) => x.id)
    );

    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const key = useMemo(() => getApiKey().trim(), []);
    const isV4 = useMemo(() => key.startsWith("eyJ"), [key]);

    const fetchPage = async (p: number, append: boolean) => {
        try {
            setLoading(true);
            setError("");

            const res = await tmdb.get<Resp>("/movie/popular", {
                params: isV4 ? { page: p } : { api_key: key, page: p },
                headers: isV4 ? { Authorization: `Bearer ${key}` } : undefined,
            });

            setTotalPages(res.data.total_pages ?? 1);

            const next = res.data.results ?? [];
            setMovies((prev) => (append ? [...prev, ...next] : next));
        } catch (e: any) {
            setError(e?.message ?? "요청 실패");
        } finally {
            setLoading(false);
        }
    };

    // Table 모드: 스크롤 막기 / Infinite 모드: 스크롤 허용
    useEffect(() => {
        if (mode === "table") document.body.style.overflow = "hidden";
        else document.body.style.overflow = "auto";

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [mode]);

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

    // ✅ Table에서는 화면 안정적으로 보이게 10개만 표시
    const tableMovies = movies.slice(0, 5);

    return (
        <div style={{ background: "#111", minHeight: "100vh", padding: "16px 22px" }}>
            {/* 상단: 모드 선택 */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
                <h2 style={{ color: "white", margin: 0, marginRight: 10 }}>대세 콘텐츠</h2>

                <button
                    onClick={() => setMode("table")}
                    style={{
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid #333",
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
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid #333",
                        background: mode === "infinite" ? "#e50914" : "#151515",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: 800,
                    }}
                >
                    펼쳐보기
                </button>

                <div style={{ marginLeft: "auto", color: "#aaa", fontSize: 12 }}>

                </div>
            </div>

            {error && <div style={{ color: "salmon", marginBottom: 10 }}>Error: {error}</div>}

            {/* TABLE VIEW */}
            {mode === "table" && (
                <>
                    <div
                        style={{
                            border: "1px solid #222",
                            borderRadius: 12,
                            overflow: "hidden",
                            background: "#0f0f0f",
                        }}
                    >
                        <table style={{ width: "100%", borderCollapse: "collapse", color: "white" }}>
                            <thead>
                            <tr>
                                {[
                                    { label: "포스터", w: 70, align: "left" as const },
                                    { label: "제목", w: "auto", align: "left" as const },
                                    { label: "언어", w: 80, align: "center" as const },
                                    { label: "개봉", w: 120, align: "center" as const },
                                    { label: "평점", w: 90, align: "right" as const },
                                    { label: "인기", w: 90, align: "right" as const },
                                ].map((c) => (
                                    <th
                                        key={c.label}
                                        style={{
                                            position: "sticky",
                                            top: 0,
                                            zIndex: 1,
                                            background: "#141414",
                                            color: "#ddd",
                                            fontSize: 12,
                                            letterSpacing: 0.4,
                                            padding: "10px 12px",
                                            textAlign: c.align,
                                            width: c.w as any,
                                            borderBottom: "1px solid #222",
                                        }}
                                    >
                                        {c.label}
                                    </th>
                                ))}
                            </tr>
                            </thead>

                            <tbody>
                            {tableMovies.map((m) => {
                                const img = posterUrl(m.poster_path, "w185");
                                const wished = wishIds.includes(m.id);

                                return (
                                    <tr
                                        key={m.id}
                                        style={{
                                            borderTop: "1px solid #222",
                                            background: wished ? "rgba(229,9,20,0.08)" : "transparent",
                                        }}
                                    >
                                        <td style={{ padding: "10px 12px" }}>
                                            <div
                                                onClick={() => toggle(m)}
                                                style={{
                                                    width: 46,
                                                    height: 68,
                                                    borderRadius: 8,
                                                    overflow: "hidden",
                                                    cursor: "pointer",
                                                    transform: "scale(1)",
                                                    transition: "transform .15s ease",
                                                    border: wished ? "2px solid gold" : "1px solid #333",
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
                                                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                                title={wished ? "찜 해제" : "찜 추가"}
                                            >
                                                {img ? (
                                                    <img
                                                        src={img}
                                                        alt={m.title}
                                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                    />
                                                ) : (
                                                    <div style={{ width: "100%", height: "100%", background: "#333" }} />
                                                )}
                                            </div>
                                        </td>

                                        <td
                                            style={{
                                                padding: "10px 12px",
                                                fontWeight: 800,
                                                maxWidth: 520,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {m.title}{" "}
                                            <span style={{ color: wished ? "gold" : "#444", fontWeight: 900 }}>
                          {wished ? "★" : "☆"}
                        </span>
                                        </td>

                                        <td style={{ padding: "10px 12px", color: "#cfcfcf", textAlign: "center" }}>
                                            {m.original_language ?? "-"}
                                        </td>
                                        <td style={{ padding: "10px 12px", color: "#cfcfcf", textAlign: "center" }}>
                                            {m.release_date ?? "-"}
                                        </td>
                                        <td style={{ padding: "10px 12px", textAlign: "right", color: "#cfcfcf" }}>
                                            {(m.vote_average ?? 0).toFixed(1)}
                                        </td>
                                        <td style={{ padding: "10px 12px", textAlign: "right", color: "#cfcfcf" }}>
                                            {(m.popularity ?? 0).toFixed(0)}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>

                        {loading && <div style={{ color: "#bbb", padding: 12 }}>Loading...</div>}
                    </div>

                    {/* 페이지네이션 */}
                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            justifyContent: "center",
                            alignItems: "center",
                            marginTop: 14,
                        }}
                    >
                        <button
                            disabled={page <= 1 || loading}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            style={{
                                padding: "8px 12px",
                                borderRadius: 10,
                                border: "1px solid #333",
                                background: page <= 1 ? "#222" : "#151515",
                                color: "white",
                                cursor: page <= 1 ? "not-allowed" : "pointer",
                                fontWeight: 800,
                            }}
                        >
                            이전
                        </button>

                        <div style={{ color: "white", fontWeight: 900 }}>
                            {page} / {totalPages}
                        </div>

                        <button
                            disabled={page >= totalPages || loading}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            style={{
                                padding: "8px 12px",
                                borderRadius: 10,
                                border: "1px solid #333",
                                background: page >= totalPages ? "#222" : "#151515",
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
                            const img = posterUrl(m.poster_path, "w342");
                            const wished = wishIds.includes(m.id);

                            return (
                                <div
                                    key={m.id}
                                    onClick={() => toggle(m)}
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
        </div>
    );
}
