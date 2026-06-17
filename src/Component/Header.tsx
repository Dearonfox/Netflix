import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { STORAGE_KEYS } from "../utils/storage";

function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        const m = window.matchMedia(query);
        const onChange = () => setMatches(m.matches);

        // 구형/신형 브라우저 대응
        if (m.addEventListener) m.addEventListener("change", onChange);
        else m.addListener(onChange);

        setMatches(m.matches);

        return () => {
            if (m.removeEventListener) m.removeEventListener("change", onChange);
            else m.removeListener(onChange);
        };
    }, [query]);

    return matches;
}

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

    const isMobile = useMediaQuery("(max-width: 600px)");

    const [openUser, setOpenUser] = useState(false);
    const [openNav, setOpenNav] = useState(false);

    const userRef = useRef<HTMLDivElement | null>(null);
    const navRef = useRef<HTMLDivElement | null>(null);

    const currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) ?? "";
    const isLogin = !!currentUser;

    const menuItems = useMemo(
        () => [
            { to: "/", label: "홈", end: true },
            { to: "/popular", label: "대세 콘텐츠" },
            { to: "/recommendations", label: "AI 추천" },
            { to: "/wishlist", label: "내가 찜한 리스트" },
        ],
        []
    );

    const logout = () => {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem(STORAGE_KEYS.KEEP_LOGIN);
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

    // 모바일/데스크탑 전환될 때 열린 메뉴 닫기
    useEffect(() => {
        setOpenNav(false);
        setOpenUser(false);
    }, [isMobile]);

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

                {/* ✅ 데스크탑에서만 nav 렌더링 */}
                {!isMobile && (
                    <nav style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                        <NavLink to="/" end style={linkStyle}>홈</NavLink>
                        <NavLink to="/popular" style={linkStyle}>대세 콘텐츠</NavLink>
                        <NavLink to="/recommendations" style={linkStyle}>AI 추천</NavLink>
                        <NavLink to="/wishlist" style={linkStyle}>내가 찜한 리스트</NavLink>
                    </nav>
                )}

                {/* ✅ 모바일에서만 햄버거 렌더링 */}
                {isMobile && (
                    <div ref={navRef} style={{ position: "relative" }}>
                        <button
                            type="button"
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
                            aria-label="메뉴"
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
                                    zIndex: 20,
                                }}
                            >
                                {menuItems.map((x) => (
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
                )}
            </div>

            {/* right tools */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 auto" }}>
                <button
                    type="button"
                    onClick={() => nav("/search")}
                    style={{
                        width: 42,
                        height: 38,
                        display: "grid",
                        placeItems: "center",
                        background: "transparent",
                        border: "1px solid #333",
                        color: "white",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontSize: 20,
                    }}
                    aria-label="찾아보기"
                    title="찾아보기"
                >
                    🔍
                </button>

                <div ref={userRef} style={{ position: "relative" }}>
                    <button
                        type="button"
                        onClick={() => setOpenUser((v) => !v)}
                        style={{
                            width: 42,
                            height: 38,
                            display: "grid",
                            placeItems: "center",
                            background: "transparent",
                            border: "1px solid #333",
                            color: "white",
                            borderRadius: 10,
                            cursor: "pointer",
                        }}
                        aria-label="프로필"
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
                                zIndex: 20,
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
            </div>
        </header>
    );
}
