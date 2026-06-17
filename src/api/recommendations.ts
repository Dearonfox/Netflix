import { apiClient } from "./client";

export type RecommendationItem = {
    title: string;
    reason: string;
    mood?: string | null;
    year?: string | null;
};

export type RecommendationResponse = {
    query: string;
    recommendations: RecommendationItem[];
};

export async function getAiRecommendations(prompt: string, limit = 5) {
    const res = await apiClient.post<RecommendationResponse>("/api/ai/recommendations", {
        prompt,
        limit,
    });
    return res.data;
}
