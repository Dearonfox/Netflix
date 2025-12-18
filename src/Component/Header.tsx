import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { STORAGE_KEYS } from "../utils/storage";

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    color: isActive ? "white" : "#cfcfcf",
    textDecoration: "none",
    fontWeight: 700,
    marginRight: 18,
});

export default function Header() {
    const nav = useNavigate();
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) ?? "";
    const isLogin = !!currentUser;

    const logout = () => {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem(STORAGE_KEYS.KEEP_LOGIN);
        localStorage.removeItem(STORAGE_KEYS.TMDB_KEY); // 키도 같이 제거
        setOpen(false);
        nav("/signin");
    };

    // 바깥 클릭하면 메뉴 닫기
    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (!menuRef.current) return;
            if (!menuRef.current.contains(e.target as Node)) setOpen(false);
        };
        window.addEventListener("mousedown", onDown);
        return () => window.removeEventListener("mousedown", onDown);
    }, []);

    return (
        <header
            style={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                background: "#111",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #222",
            }}
        >
            {/* left */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 26, height: 18, border: "3px solid red" }} />

                <nav>
                    <NavLink to="/" end style={linkStyle}>
                        홈
                    </NavLink>
                    <NavLink to="/popular" style={linkStyle}>
                        대세 콘텐츠
                    </NavLink>
                    <NavLink to="/search" style={linkStyle}>
                        찾아보기
                    </NavLink>
                    <NavLink to="/wishlist" style={linkStyle}>
                        내가 찜한 리스트
                    </NavLink>
                </nav>
            </div>

            {/* right */}
            <div ref={menuRef} style={{ position: "relative" }}>
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        background: "transparent",
                        border: "1px solid #333",
                        color: "white",
                        padding: "6px 10px",
                        borderRadius: 10,
                        cursor: "pointer",
                    }}
                >
                    <span style={{ fontSize: 18 }}>👤</span>
                    <span style={{ fontSize: 12, color: "#cfcfcf", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {isLogin ? currentUser : "Guest"}
          </span>
                </button>

                {open && (
                    <div
                        style={{
                            position: "absolute",
                            right: 0,
                            marginTop: 10,
                            width: 180,
                            background: "#151515",
                            border: "1px solid #2a2a2a",
                            borderRadius: 12,
                            overflow: "hidden",
                            boxShadow: "0 12px 28px rgba(0,0,0,0.45)",
                        }}
                    >
                        {isLogin ? (
                            <>
                                <div style={{ padding: "10px 12px", color: "white", fontSize: 13 }}>
                                    <div style={{ color: "#aaa", fontSize: 12, marginBottom: 4 }}>Signed in as</div>
                                    <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser}</div>
                                </div>
                                <div style={{ height: 1, background: "#222" }} />
                                <button
                                    type="button"
                                    onClick={logout}
                                    style={{
                                        width: "100%",
                                        textAlign: "left",
                                        padding: "10px 12px",
                                        background: "transparent",
                                        border: "none",
                                        color: "salmon",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                    }}
                                >
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setOpen(false);
                                    nav("/signin");
                                }}
                                style={{
                                    width: "100%",
                                    textAlign: "left",
                                    padding: "10px 12px",
                                    background: "transparent",
                                    border: "none",
                                    color: "white",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                }}
                            >
                                로그인
                            </button>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
