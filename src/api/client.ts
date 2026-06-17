import axios from "axios";

const API_BASE_URL =
    process.env.VITE_API_BASE_URL ||
    process.env.REACT_APP_API_BASE_URL ||
    "http://127.0.0.1:8000";

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

export function getApiErrorMessage(error: unknown, fallback = "요청 실패") {
    if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;
        if (typeof detail === "string") return detail;
        const message = error.response?.data?.message;
        if (typeof message === "string") return message;
        return error.message || fallback;
    }

    if (error instanceof Error) return error.message;
    return fallback;
}
