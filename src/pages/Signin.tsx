import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/auth.css"; // 아래에서 만들거임
import { STORAGE_KEYS, readJSON, writeJSON, type User } from "../utils/storage";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signin() {
    const nav = useNavigate();
    const [mode, setMode] = useState<"signin" | "signup">("signin");

    const [id, setId] = useState("");
    const [pw, setPw] = useState("");
    const [pw2, setPw2] = useState("");

    const [remember, setRemember] = useState(true);
    const [agree, setAgree] = useState(false);

    const signup = () => {
        if (!id.trim() || !pw.trim() || !pw2.trim()) return alert("모두 입력하세요.");
        if (!emailRegex.test(id)) return alert("이메일 형식으로 입력하세요.");
        if (pw !== pw2) return alert("비밀번호 확인이 일치하지 않습니다.");
        if (!agree) return alert("약관에 동의해야 합니다.");

        const users = readJSON<User[]>(STORAGE_KEYS.USERS, []);
        if (users.some((u) => u.id === id)) return alert("이미 존재하는 아이디입니다.");

        writeJSON(STORAGE_KEYS.USERS, [...users, { id, pw }]);
        alert("회원가입 완료! 로그인 해주세요.");
        setMode("signin");
        setPw2("");
    };

    const signin = () => {
        if (!id.trim() || !pw.trim()) return alert("아이디/비밀번호를 입력하세요.");
        if (!emailRegex.test(id)) return alert("이메일 형식으로 입력하세요.");

        const users = readJSON<User[]>(STORAGE_KEYS.USERS, []);
        const ok = users.find((u) => u.id === id && u.pw === pw);
        if (!ok) return alert("로그인 실패: 계정 정보가 없습니다.");

        // ✅ 과제 요건: localStorage 저장(3개 이상)
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, id);
        localStorage.setItem(STORAGE_KEYS.TMDB_KEY, pw); // 비번=TMDB Key로 사용
        localStorage.setItem(STORAGE_KEYS.KEEP_LOGIN, remember ? "1" : "0");

        nav("/");
    };

    return (
        <div className="auth-bg">
            <div className="auth-vignette" />

            <div className="auth-wrap">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        className="auth-card"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.22 }}
                    >
                        <h2 className="auth-title">{mode === "signin" ? "Sign in" : "Sign up"}</h2>

                        <input
                            className="auth-input"
                            placeholder="Username or Email"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                        />

                        <input
                            className="auth-input"
                            placeholder="Password"
                            type="password"
                            value={pw}
                            onChange={(e) => setPw(e.target.value)}
                        />

                        {mode === "signup" && (
                            <input
                                className="auth-input"
                                placeholder="Confirm Password"
                                type="password"
                                value={pw2}
                                onChange={(e) => setPw2(e.target.value)}
                            />
                        )}

                        {mode === "signin" ? (
                            <div className="auth-row">
                                <label className="auth-check">
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                    />
                                    <span>Remember me</span>
                                </label>

                                <button className="auth-link" type="button" onClick={() => alert("구현 안 함")}>
                                    Forgot Password?
                                </button>
                            </div>
                        ) : (
                            <label className="auth-check auth-agree">
                                <input
                                    type="checkbox"
                                    checked={agree}
                                    onChange={(e) => setAgree(e.target.checked)}
                                />
                                <span>I agree to Terms & Conditions</span>
                            </label>
                        )}

                        <button className="auth-btn" onClick={mode === "signin" ? signin : signup}>
                            {mode === "signin" ? "LOGIN" : "SIGN UP"}
                        </button>

                        <button
                            className="auth-bottom"
                            type="button"
                            onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
                        >
                            {mode === "signin"
                                ? "Don't have an account?  Sign up"
                                : "Already have an account?  Sign in"}
                        </button>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
