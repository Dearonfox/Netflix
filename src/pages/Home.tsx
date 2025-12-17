import { useEffect, useState } from "react";
import { tmdb, getApiKey, posterUrl } from "../api/tmdb";

type Movie = { id: number; title: string; poster_path: string | null };
type Resp = { results: Movie[] };

export default function Home() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError("");

                const res = await tmdb.get<Resp>("/movie/now_playing", {
                    params: { api_key: getApiKey(), page: 1 },
                });

                setMovies(res.data.results ?? []);
            } catch (e: any) {
                setError(e?.message ?? "TMDB 요청 실패");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) return <div style={{ color: "white" }}>Loading...</div>;
    if (error) return <div style={{ color: "salmon" }}>Error: {error}</div>;

    return (
        <div style={{ padding: 16 }}>
            <h2 style={{ color: "white" }}>Now Playing</h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                {movies.map((m) => {
                    const img = posterUrl(m.poster_path, "w342");
                    return (
                        <div key={m.id}>
                            {img ? (
                                <img src={img} alt={m.title} style={{ width: "100%", borderRadius: 8 }} />
                            ) : (
                                <div style={{ height: 210, background: "#333", borderRadius: 8 }} />
                            )}
                            <div style={{ color: "white", fontSize: 14, marginTop: 6 }}>{m.title}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
