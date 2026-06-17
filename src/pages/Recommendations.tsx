import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { getAiRecommendations, type RecommendationItem } from "../api/recommendations";

const presets = ["비 오는 밤에 볼 영화", "넷플릭스 스릴러 느낌", "가볍게 웃긴 영화", "몰입감 좋은 액션", "감성적인 로맨스"];

export default function Recommendations() {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState("");
    const [items, setItems] = useState<RecommendationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const canSubmit = useMemo(() => prompt.trim().length > 0 && !loading, [prompt, loading]);

    const requestRecommendations = async (value = prompt) => {
        const cleaned = value.trim().replace(/\s+/g, " ");
        if (!cleaned) return;

        try {
            setLoading(true);
            setError("");
            setPrompt(cleaned);
            const data = await getAiRecommendations(cleaned, 5);
            setItems(data.recommendations);
        } catch (e) {
            setError(getApiErrorMessage(e, "AI 추천을 불러오지 못했습니다."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "#111", color: "white", padding: "34px clamp(18px, 4vw, 52px)" }}>
            <section
                style={{
                    minHeight: 260,
                    borderRadius: 10,
                    padding: "34px clamp(22px, 5vw, 54px)",
                    background:
                        "linear-gradient(120deg, rgba(229,9,20,0.88), rgba(25,25,25,0.92) 58%), linear-gradient(45deg, #202020, #090909)",
                    boxShadow: "0 24px 70px rgba(0,0,0,0.38)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: 18,
                }}
            >
                <div>
                    <h1 style={{ margin: 0, fontSize: 40, fontWeight: 900, letterSpacing: 0 }}>AI 영화 추천</h1>
                    <p style={{ margin: "12px 0 0", color: "#f2f2f2", maxWidth: 680, lineHeight: 1.5 }}>
                        보고 싶은 분위기나 장르를 적으면 GPT가 넷플릭스 큐레이터처럼 추천을 골라줍니다.
                    </p>
                </div>

                <div style={{ display: "flex", gap: 10, maxWidth: 760 }}>
                    <input
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") requestRecommendations();
                        }}
                        placeholder="예: 오늘 밤 몰입해서 볼 수 있는 반전 스릴러"
                        style={{
                            flex: 1,
                            minWidth: 0,
                            padding: "15px 16px",
                            borderRadius: 6,
                            border: "1px solid rgba(255,255,255,0.22)",
                            background: "rgba(0,0,0,0.55)",
                            color: "white",
                            fontSize: 15,
                            outline: "none",
                        }}
                    />
                    <button
                        type="button"
                        disabled={!canSubmit}
                        onClick={() => requestRecommendations()}
                        style={{
                            padding: "0 18px",
                            borderRadius: 6,
                            border: "none",
                            background: canSubmit ? "white" : "#555",
                            color: "#111",
                            fontWeight: 900,
                            cursor: canSubmit ? "pointer" : "not-allowed",
                            whiteSpace: "nowrap",
                        }}
                    >
                        추천 받기
                    </button>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {presets.map((preset) => (
                        <button
                            key={preset}
                            type="button"
                            onClick={() => requestRecommendations(preset)}
                            style={{
                                padding: "8px 12px",
                                borderRadius: 999,
                                border: "1px solid rgba(255,255,255,0.22)",
                                background: "rgba(0,0,0,0.32)",
                                color: "white",
                                cursor: "pointer",
                                fontWeight: 700,
                            }}
                        >
                            {preset}
                        </button>
                    ))}
                </div>
            </section>

            {loading && <div style={{ color: "#bbb", marginTop: 24 }}>AI가 취향을 분석하는 중...</div>}
            {error && <div style={{ color: "salmon", marginTop: 24 }}>Error: {error}</div>}

            <section
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 14,
                    marginTop: 24,
                }}
            >
                {items.map((item, index) => (
                    <article
                        key={`${item.title}-${index}`}
                        onClick={() => navigate(`/search?query=${encodeURIComponent(item.title)}`)}
                        style={{
                            position: "relative",
                            minHeight: 190,
                            padding: 18,
                            borderRadius: 8,
                            border: "1px solid #292929",
                            background: "linear-gradient(180deg, #1c1c1c, #101010)",
                            boxShadow: "0 12px 30px rgba(0,0,0,0.28)",
                            cursor: "pointer",
                            overflow: "hidden",
                            transition: "transform .18s ease, border-color .18s ease, box-shadow .18s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-5px) scale(1.02)";
                            e.currentTarget.style.borderColor = "rgba(229,9,20,0.85)";
                            e.currentTarget.style.boxShadow = "0 22px 46px rgba(0,0,0,0.45)";
                            const overlay = e.currentTarget.querySelector<HTMLDivElement>("[data-hover-overlay]");
                            if (overlay) overlay.style.opacity = "1";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0) scale(1)";
                            e.currentTarget.style.borderColor = "#292929";
                            e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.28)";
                            const overlay = e.currentTarget.querySelector<HTMLDivElement>("[data-hover-overlay]");
                            if (overlay) overlay.style.opacity = "0";
                        }}
                    >
                        <div style={{ color: "#e50914", fontWeight: 900, fontSize: 13 }}>추천 {index + 1}</div>
                        <h2 style={{ margin: "10px 0 8px", fontSize: 22, fontWeight: 900 }}>{item.title}</h2>
                        <div style={{ color: "#aaa", fontSize: 13, marginBottom: 12 }}>
                            {[item.year, item.mood].filter(Boolean).join(" · ")}
                        </div>
                        <p style={{ margin: 0, color: "#d8d8d8", lineHeight: 1.55 }}>{item.reason}</p>
                        <div
                            data-hover-overlay
                            style={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "flex-end",
                                justifyContent: "space-between",
                                gap: 12,
                                padding: 18,
                                opacity: 0,
                                transition: "opacity .18s ease",
                                background:
                                    "linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.92))",
                                pointerEvents: "none",
                            }}
                        >
                            <div>
                                <div style={{ color: "white", fontSize: 13, fontWeight: 900 }}>자세히 보기</div>
                                <div style={{ color: "#bdbdbd", fontSize: 12, marginTop: 4 }}>
                                    클릭하면 검색 결과로 이동합니다.
                                </div>
                            </div>
                            <div
                                style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: "50%",
                                    display: "grid",
                                    placeItems: "center",
                                    background: "#e50914",
                                    color: "white",
                                    fontWeight: 900,
                                }}
                            >
                                →
                            </div>
                        </div>
                    </article>
                ))}
            </section>

            {!loading && !error && items.length === 0 && (
                <div style={{ color: "#8f8f8f", marginTop: 24 }}>
                    위 입력창에 원하는 분위기를 적거나 추천 태그를 눌러보세요.
                </div>
            )}
        </div>
    );
}
