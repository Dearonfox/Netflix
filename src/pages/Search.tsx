import { useEffect, useMemo, useState } from "react";
import { tmdb, getApiKey } from "../api/tmdb";
import { loadWishlist, toggleWish } from "../utils/wishlist";

type Movie = { id: number; title: string; poster_path: string | null };
type Resp = { results: Movie[] };

function posterUrl(path: string | null) {
    return path ? `https://image.tmdb.org/t/p/w342${path}` : "";
}

export default function Search() {
    const [q, setQ] = useState("");
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [wishIds, setWishIds] = useState<number[]>(() =>
        loadWishlist().map((x) => x.id)
    );

    const canSearch = useMemo(() => q.trim().length >= 1, [q]);

    const doSearch = async () => {
        if (!canSearch) return;

        try {
            setLoading(true);
            setError("");

            const key = getApiKey().trim();
            const isV4 = key.startsWith("eyJ");

            const res = await tmdb.get<Resp>("/search/movie", {
                params: isV4 ? { query: q.trim(), page: 1 } : { api_key: key, query: q.trim(), page: 1 },
                headers: isV4 ? { Authorization: `Bearer ${key}` } : undefined,
            });

            setMovies(res.data.results ?? []);
        } catch (e: any) {
            setError(e?.message ?? "검색 실패");
        } finally {
            setLoading(false);
        }
    };

    // 페이지 들어오면 찜 상태 최신화(다른 페이지에서 찜했을 수도)
    useEffect(() => {
        setWishIds(loadWishlist().map((x) => x.id));
    }, []);

    return (
        <div style={{ background: "#111", minHeight: "100vh", padding: "16px 22px" }}>
            <h2 style={{ color: "white" }}>찾아보기</h2>

            <div style={{ display: "flex", gap: 8, marginTop: 12, maxWidth: 520 }}>
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") doSearch();
                    }}
                    placeholder="영화 제목 검색"
                    style={{
                        flex: 1,
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "1px solid #333",
                        background: "#0f0f0f",
                        color: "white",
                        outline: "none",
                    }}
                />
                <button
                    onClick={doSearch}
                    disabled={!canSearch || loading}
                    style={{
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "1px solid #333",
                        background: !canSearch || loading ? "#222" : "#e50914",
                        color: "white",
                        cursor: !canSearch || loading ? "not-allowed" : "pointer",
                    }}
                >
                    검색
                </button>
            </div>

            {loading && <div style={{ color: "#bbb", marginTop: 12 }}>Loading...</div>}
            {error && <div style={{ color: "salmon", marginTop: 12 }}>Error: {error}</div>}

            <div
                style={{
                    marginTop: 16,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: 12,
                }}
            >
                {movies.map((m) => {
                    const img = posterUrl(m.poster_path);
                    const wished = wishIds.includes(m.id);

                    return (
                        <div
                            key={m.id}
                            style={{ cursor: "pointer", position: "relative" }}
                            onClick={() => {
                                const next = toggleWish({ id: m.id, title: m.title, poster_path: m.poster_path });
                                setWishIds(next.map((x) => x.id));
                            }}
                        >
                            <div
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
                                <img src={img} alt={m.title} style={{ width: "100%", borderRadius: 8 }} />
                            ) : (
                                <div style={{ height: 210, background: "#333", borderRadius: 8 }} />
                            )}

                            <div style={{ color: "white", marginTop: 6, fontSize: 14 }}>{m.title}</div>
                        </div>
                    );
                })}
            </div>

            {!loading && !error && movies.length === 0 && q.trim() && (
                <div style={{ color: "#bbb", marginTop: 14 }}>검색 결과가 없습니다.</div>
            )}
        </div>
    );
}
