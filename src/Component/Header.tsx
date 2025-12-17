import { useNavigate, NavLink } from "react-router-dom";
import { STORAGE_KEYS } from "../utils/storage";

export default function Header() {
    const nav = useNavigate();
    const userId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) ?? "";

    const logout = () => {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        nav("/signin");
    };

    return (
        <header style={{ padding: 12, display: "flex", justifyContent: "space-between" }}>
            <nav style={{ display: "flex", gap: 12 }}>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/popular">Popular</NavLink>
                <NavLink to="/search">Search</NavLink>
                <NavLink to="/wishlist">Wishlist</NavLink>
            </nav>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span>{userId}</span>
                <button onClick={logout}>Logout</button>
            </div>
        </header>
    );
}
