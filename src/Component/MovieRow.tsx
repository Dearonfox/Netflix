import { useEffect, useState } from "react";
import { tmdb, getApiKey } from "../api/tmdb";

type Movie = { id: number; title: string; poster_path: string | null };
type Resp = { results: Movie[] };

function posterUrl(path: string | null) {
    return path ? `https://image.tmdb.org/t/p/w342${path}` : "";
}

type Props = {
    title: string;
    endpoint: string;              // 예: "/movie/popular"
    params?: Record<string, any>;  // 예: { with_genres: 28 }
};

export default function MovieRow({ title, endpoint, params }: Props) {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoading(true);
                setError("");

                const key = getApiKey();

                // v3 키면 api_key로, v4 토큰이면 Bearer로 (둘 다 커버)
                const isV4 = key.startsWith("eyJ");
                const res = await tmdb.get<Resp>(endpoint, {
                    params: isV4 ? { ...params, page: 1 } : { api_key: key, ...params, page: 1 },
                    headers: isV4 ? { Authorization: `Bearer ${key}` } : undefined,
                });

                if (alive) setMovies(res.data.results ?? []);
            } catch (e: any) {
                if (alive) setError(e?.message ?? "요청 실패");
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [endpoint]);

    return (
        <section style={{ padding: "18px 0" }}>
            <h2 style={{ color: "white", margin: "0 0 10px 0" }}>{title}</h2>

            {loading && <div style={{ color: "#bbb" }}>Loading...</div>}
            {error && <div style={{ color: "salmon" }}>Error: {error}</div>}

            <div
                style={{
                    display: "flex",
                    gap: 10,
                    overflowX: "auto",
                    paddingBottom: 8,
                }}
            >
                {movies.map((m) => {
                    const img = posterUrl(m.poster_path);
                    return (
                        <div
                            key={m.id}
                            style={{
                                minWidth: 140,
                                cursor: "pointer",
                                transform: "scale(1)",
                                transition: "transform 0.15s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        >
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
        </section>
    );
}
