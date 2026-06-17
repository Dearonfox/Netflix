import { useEffect, useState } from "react";
import { getMovieNote, saveMovieNote } from "../api/backend";
import { loadWishlist, toggleWish, type WishItem } from "../utils/wishlist";
import { STORAGE_KEYS } from "../utils/storage";

function posterUrl(path: string | null) {
    return path ? `https://image.tmdb.org/t/p/w342${path}` : "";
}

export default function Wishlist() {
    const [items, setItems] = useState<WishItem[]>([]);
    const [notes, setNotes] = useState<Record<number, string>>({});
    const [noteStatus, setNoteStatus] = useState<Record<number, string>>({});
    const currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) ?? "guest";

    useEffect(() => {
        setItems(loadWishlist());
    }, []);

    useEffect(() => {
        let alive = true;

        async function loadNotes() {
            const pairs = await Promise.all(
                items.map(async (item) => {
                    try {
                        const data = await getMovieNote(item.id, currentUser);
                        return [item.id, data.note] as const;
                    } catch {
                        return [item.id, ""] as const;
                    }
                })
            );

            if (alive) {
                setNotes(Object.fromEntries(pairs));
            }
        }

        if (items.length > 0) loadNotes();

        return () => {
            alive = false;
        };
    }, [currentUser, items]);

    const saveNote = async (movieId: number) => {
        try {
            setNoteStatus((prev) => ({ ...prev, [movieId]: "저장 중..." }));
            await saveMovieNote(movieId, currentUser, notes[movieId] ?? "");
            setNoteStatus((prev) => ({ ...prev, [movieId]: "저장됨" }));
        } catch {
            setNoteStatus((prev) => ({ ...prev, [movieId]: "서버 연결 필요" }));
        }
    };

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
                                style={{
                                    border: "1px solid #222",
                                    borderRadius: 10,
                                    padding: 10,
                                    background: "#151515",
                                }}
                            >
                                {m.poster_path ? (
                                    <img
                                        src={posterUrl(m.poster_path)}
                                        alt={m.title}
                                        style={{ width: "100%", borderRadius: 8, cursor: "pointer" }}
                                        onClick={() => {
                                            const next = toggleWish(m);
                                            setItems(next);
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{ height: 210, background: "#333", borderRadius: 8, cursor: "pointer" }}
                                        onClick={() => {
                                            const next = toggleWish(m);
                                            setItems(next);
                                        }}
                                    />
                                )}
                                <div style={{ color: "white", marginTop: 6, fontSize: 14 }}>{m.title}</div>
                                <textarea
                                    value={notes[m.id] ?? ""}
                                    onChange={(e) => {
                                        setNotes((prev) => ({ ...prev, [m.id]: e.target.value }));
                                        setNoteStatus((prev) => ({ ...prev, [m.id]: "" }));
                                    }}
                                    placeholder="감상 메모"
                                    maxLength={500}
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                        minHeight: 72,
                                        marginTop: 8,
                                        padding: 8,
                                        borderRadius: 8,
                                        border: "1px solid #333",
                                        background: "#0f0f0f",
                                        color: "white",
                                        resize: "vertical",
                                    }}
                                />
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                                    <button
                                        type="button"
                                        onClick={() => saveNote(m.id)}
                                        style={{
                                            padding: "7px 10px",
                                            borderRadius: 8,
                                            border: "1px solid #333",
                                            background: "#e50914",
                                            color: "white",
                                            cursor: "pointer",
                                            fontWeight: 800,
                                        }}
                                    >
                                        메모 저장
                                    </button>
                                    <span style={{ color: "#aaa", fontSize: 12 }}>{noteStatus[m.id]}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ color: "#aaa", marginTop: 10, fontSize: 12 }}>
                        ※ 포스터 클릭하면 찜 해제됩니다. 감상 메모는 로컬 백엔드 API에 저장됩니다.
                    </div>
                </>
            )}
        </div>
    );
}
