import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { STORAGE_KEYS } from "../utils/storage";

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    color: isActive ? "white" : "#cfcfcf",
    textDecoration: "none",
    fontWeight: 700,
    marginRight: 18,
    whiteSpace: "nowrap" as const,
    wordBreak: "keep-all" as const,
});

export default function Header() {
    const nav = useNavigate();
    const [openUser, setOpenUser] = useState(false);
    const [openNav, setOpenNav] = useState(false);
    const userRef = useRef<HTMLDivElement | null>(null);
    const navRef = useRef<HTMLDivElement | null>(null);

    const currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) ?? "";
    const isLogin = !!currentUser;

    const logout = () => {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem(STORAGE_KEYS.KEEP_LOGIN);
        localStorage.removeItem(STORAGE_KEYS.TMDB_KEY);
        setOpenUser(false);
        nav("/signin");
    };

    // 바깥 클릭하면 메뉴 닫기
    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            const t = e.target as Node;
            if (userRef.current && !userRef.current.contains(t)) setOpenUser(false);
            if (navRef.current && !navRef.current.contains(t)) setOpenNav(false);
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
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #222",
                gap: 12,
            }}
        >
            {/* left */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <div style={{ width: 26, height: 18, border: "3px solid red", flex: "0 0 auto" }} />

                {/* 데스크탑 nav */}
                <nav className="topNav">
                    <NavLink to="/" end style={linkStyle}>홈</NavLink>
                    <NavLink to="/popular" style={linkStyle}>대세 콘텐츠</NavLink>
                    <NavLink to="/search" style={linkStyle}>찾아보기</NavLink>
                    <NavLink to="/wishlist" style={linkStyle}>내가 찜한 리스트</NavLink>
                </nav>

                {/* 모바일 햄버거 */}
                <div ref={navRef} className="mobileNavWrap" style={{ position: "relative" }}>
                    <button
                        type="button"
                        className="hamburgerBtn"
                        onClick={() => setOpenNav((v) => !v)}
                        style={{
                            background: "transparent",
                            border: "1px solid #333",
                            color: "white",
                            padding: "6px 10px",
                            borderRadius: 10,
                            cursor: "pointer",
                            fontWeight: 800,
                        }}
                    >
                        ☰
                    </button>

                    {openNav && (
                        <div
                            style={{
                                position: "absolute",
                                left: 0,
                                marginTop: 10,
                                width: 190,
                                background: "#151515",
                                border: "1px solid #2a2a2a",
                                borderRadius: 12,
                                overflow: "hidden",
                                boxShadow: "0 12px 28px rgba(0,0,0,0.45)",
                            }}
                        >
                            {[
                                { to: "/", label: "홈", end: true },
                                { to: "/popular", label: "대세 콘텐츠" },
                                { to: "/search", label: "찾아보기" },
                                { to: "/wishlist", label: "내가 찜한 리스트" },
                            ].map((x) => (
                                <NavLink
                                    key={x.to}
                                    to={x.to}
                                    end={x.end as any}
                                    onClick={() => setOpenNav(false)}
                                    style={({ isActive }) => ({
                                        display: "block",
                                        padding: "10px 12px",
                                        color: isActive ? "white" : "#cfcfcf",
                                        textDecoration: "none",
                                        fontWeight: 700,
                                        whiteSpace: "nowrap",
                                        wordBreak: "keep-all",
                                    })}
                                >
                                    {x.label}
                                </NavLink>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* right (user) - 텍스트 없이 아이콘만 */}
            <div ref={userRef} style={{ position: "relative", flex: "0 0 auto" }}>
                <button
                    type="button"
                    onClick={() => setOpenUser((v) => !v)}
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
                    aria-label={isLogin ? "프로필 메뉴(로그인됨)" : "프로필 메뉴(게스트)"}
                >
                    <span style={{ fontSize: 18 }}>👤</span>
                </button>

                {openUser && (
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
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setOpenUser(false);
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
