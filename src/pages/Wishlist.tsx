import { useEffect, useState } from "react";
import { loadWishlist, toggleWish, type WishItem } from "../utils/wishlist";

function posterUrl(path: string | null) {
    return path ? `https://image.tmdb.org/t/p/w342${path}` : "";
}

export default function Wishlist() {
    const [items, setItems] = useState<WishItem[]>([]);

    useEffect(() => {
        setItems(loadWishlist());
    }, []);

    return (
        <div style={{ background: "#111", minHeight: "100vh", padding: "16px 22px" }}>
            <h2 style={{ color: "white" }}>내가 찜한 리스트</h2>

            {items.length === 0 ? (
                <div style={{ color: "#bbb", marginTop: 14 }}>찜한 영화가 없습니다.</div>
            ) : (
                <>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                            gap: 12,
                            marginTop: 12,
                        }}
                    >
                        {items.map((m) => (
                            <div
                                key={m.id}
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                    const next = toggleWish(m);
                                    setItems(next);
                                }}
                            >
                                {m.poster_path ? (
                                    <img
                                        src={posterUrl(m.poster_path)}
                                        alt={m.title}
                                        style={{ width: "100%", borderRadius: 8 }}
                                    />
                                ) : (
                                    <div style={{ height: 210, background: "#333", borderRadius: 8 }} />
                                )}
                                <div style={{ color: "white", marginTop: 6, fontSize: 14 }}>{m.title}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ color: "#aaa", marginTop: 10, fontSize: 12 }}>
                        ※ 포스터 클릭하면 찜 해제됩니다.
                    </div>
                </>
            )}
        </div>
    );
}
