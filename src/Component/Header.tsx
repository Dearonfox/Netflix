import { NavLink } from "react-router-dom";

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    color: isActive ? "white" : "#cfcfcf",
    textDecoration: "none",
    fontWeight: 700,
    marginRight: 18,
});

export default function Header() {
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
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 26, height: 18, border: "3px solid red" }} />
                <nav>
                    <NavLink to="/" end style={linkStyle}>홈</NavLink>
                    <NavLink to="/popular" style={linkStyle}>대세 콘텐츠</NavLink>
                    <NavLink to="/search" style={linkStyle}>찾아보기</NavLink>
                    <NavLink to="/wishlist" style={linkStyle}>내가 찜한 리스트</NavLink>
                </nav>
            </div>

            <div style={{ color: "white", fontSize: 20 }}>👤</div>
        </header>
    );
}
