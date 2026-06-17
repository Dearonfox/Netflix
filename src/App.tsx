import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Component/Layout";
import Signin from "./pages/Signin";
import Home from "./pages/Home";
import Popular from "./pages/Popular";
import Search from "./pages/Search";
import Recommendations from "./pages/Recommendations";
import Wishlist from "./pages/Wishlist";
import { STORAGE_KEYS } from "./utils/storage";
import type { ReactElement } from "react";

function ProtectedRoute({ children }: { children: ReactElement }) {
    const isLogin = !!localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return isLogin ? children : <Navigate to="/signin" replace />;
}

export default function App() {
    return (
        <Routes>
            {/* ✅ 로그인 페이지는 가드 밖 */}
            <Route path="/signin" element={<Signin />} />

            {/* ✅ 나머지는 가드 안 */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Home />} />
                <Route path="popular" element={<Popular />} />
                <Route path="search" element={<Search />} />
                <Route path="recommendations" element={<Recommendations />} />
                <Route path="wishlist" element={<Wishlist />} />
            </Route>

            {/* 나머지 경로는 홈으로 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
