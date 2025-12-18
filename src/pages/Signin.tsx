import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";
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
        setAgree(false);
    };

    const signin = () => {
        if (!id.trim() || !pw.trim()) return alert("아이디/비밀번호를 입력하세요.");
        if (!emailRegex.test(id)) return alert("이메일 형식으로 입력하세요.");

        const users = readJSON<User[]>(STORAGE_KEYS.USERS, []);
        const ok = users.find((u) => u.id === id && u.pw === pw);
        if (!ok) return alert("로그인 실패: 계정 정보가 없습니다.");

        // 과제 요건: localStorage 최소 3개 이상
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, id);
        localStorage.setItem(STORAGE_KEYS.TMDB_KEY, pw); // 비번=TMDB Key
        localStorage.setItem(STORAGE_KEYS.KEEP_LOGIN, remember ? "1" : "0");

        nav("/");
    };

    const isSignin = mode === "signin";

    return (
        <div className="auth2-bg">
            <div className="auth2-vignette" />

            <div className="auth2-wrapper">
                <div className="auth2-card">
                    {/* 상단 제목(슬라이드) */}
                    <div className="auth2-titleArea">
                        <div className={`auth2-titleTrack ${isSignin ? "is-signin" : "is-signup"}`}>
                            <div className="auth2-title">Login Form</div>
                            <div className="auth2-title">Signup Form</div>
                        </div>
                    </div>

                    {/* 탭(슬라이드 바) */}
                    <div className="auth2-tabs">
                        <button
                            type="button"
                            className={`auth2-tab ${isSignin ? "active" : ""}`}
                            onClick={() => setMode("signin")}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            className={`auth2-tab ${!isSignin ? "active" : ""}`}
                            onClick={() => setMode("signup")}
                        >
                            Signup
                        </button>
                        <div className={`auth2-tabIndicator ${isSignin ? "left" : "right"}`} />
                    </div>

                    {/* 폼(슬라이드 전환 핵심) */}
                    <div className="auth2-formViewport">
                        <div className={`auth2-formTrack ${isSignin ? "is-signin" : "is-signup"}`}>
                            {/* LOGIN */}
                            <form
                                className="auth2-form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    signin();
                                }}
                            >
                                <div className="auth2-field">
                                    <input
                                        placeholder="Email Address"
                                        value={id}
                                        onChange={(e) => setId(e.target.value)}
                                    />
                                </div>

                                <div className="auth2-field">
                                    <input
                                        placeholder="Password"
                                        type="password"
                                        value={pw}
                                        onChange={(e) => setPw(e.target.value)}
                                    />
                                </div>

                                <div className="auth2-row">
                                    <label className="auth2-check">
                                        <input
                                            type="checkbox"
                                            checked={remember}
                                            onChange={(e) => setRemember(e.target.checked)}
                                        />
                                        <span>Remember me</span>
                                    </label>

                                    <button
                                        className="auth2-link"
                                        type="button"
                                        onClick={() => alert("구현 안 함")}
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                <button className="auth2-submit" type="submit">
                                    Login
                                </button>

                                <div className="auth2-bottomText">
                                    Not a member?{" "}
                                    <button
                                        type="button"
                                        className="auth2-inline"
                                        onClick={() => setMode("signup")}
                                    >
                                        Signup now
                                    </button>
                                </div>
                            </form>

                            {/* SIGNUP */}
                            <form
                                className="auth2-form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    signup();
                                }}
                            >
                                <div className="auth2-field">
                                    <input
                                        placeholder="Email Address"
                                        value={id}
                                        onChange={(e) => setId(e.target.value)}
                                    />
                                </div>

                                <div className="auth2-field">
                                    <input
                                        placeholder="Password"
                                        type="password"
                                        value={pw}
                                        onChange={(e) => setPw(e.target.value)}
                                    />
                                </div>

                                <div className="auth2-field">
                                    <input
                                        placeholder="Confirm password"
                                        type="password"
                                        value={pw2}
                                        onChange={(e) => setPw2(e.target.value)}
                                    />
                                </div>

                                <label className="auth2-check auth2-agree">
                                    <input
                                        type="checkbox"
                                        checked={agree}
                                        onChange={(e) => setAgree(e.target.checked)}
                                    />
                                    <span>I agree to Terms & Conditions</span>
                                </label>

                                <button className="auth2-submit" type="submit">
                                    Signup
                                </button>

                                <div className="auth2-bottomText">
                                    Already have an account?{" "}
                                    <button
                                        type="button"
                                        className="auth2-inline"
                                        onClick={() => setMode("signin")}
                                    >
                                        Login
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* 아래 바닥 패널(너 예시처럼) */}
                <div className="auth2-floor" />
            </div>
        </div>
    );
}
