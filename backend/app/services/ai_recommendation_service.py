import json
from typing import Any

import httpx
from fastapi import HTTPException, status

from app.core.config import settings
from app.schemas.ai import RecommendationItem, RecommendationResponse


class AiRecommendationService:
    def __init__(self) -> None:
        self.timeout = httpx.Timeout(settings.openai_timeout_seconds)

    async def recommend(self, prompt: str, limit: int) -> RecommendationResponse:
        if not settings.openai_api_key.strip():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="OpenAI API key is not configured.",
            )

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.openai_api_key.strip()}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": settings.openai_model,
                        "temperature": 0.7,
                        "response_format": {"type": "json_object"},
                        "messages": [
                            {
                                "role": "system",
                                "content": (
                                    "You are a movie recommendation assistant. "
                                    "Return only valid JSON shaped exactly like "
                                    "{\"recommendations\":[{\"title\":\"...\",\"reason\":\"...\",\"mood\":\"...\",\"year\":\"...\"}]}. "
                                    "The recommendations value must be an array. "
                                    "Each item must include title, reason, mood, and year. "
                                    "Prioritize recent movies from 2018 or later. "
                                    "If a newer movie fits less well, use movies from the last 10 years. "
                                    "Recommend older classics only when the user explicitly asks for classics, old movies, or a specific older era. "
                                    "Prefer widely searchable theatrical or streaming movies. "
                                    "If the request sounds sexual or adult, reinterpret it as mature romance, sensual atmosphere, or emotional tension. "
                                    "Do not recommend pornography, exploitation, or explicit sexual content. "
                                    "Never return an empty recommendations array. "
                                    "Use English JSON keys only: title, reason, mood, year. "
                                    "Write Korean reasons in a concise Netflix-style tone."
                                ),
                            },
                            {
                                "role": "user",
                                "content": (
                                    f"User request: {prompt}\n"
                                    f"Recommendation count: {limit}\n"
                                    "Respond with JSON only. Do not include markdown."
                                ),
                            },
                        ],
                    },
                )
                response.raise_for_status()
            except httpx.TimeoutException as exc:
                raise HTTPException(
                    status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                    detail="OpenAI request timed out.",
                ) from exc
            except httpx.HTTPStatusError as exc:
                raise HTTPException(
                    status_code=exc.response.status_code,
                    detail=self._extract_error_message(exc.response),
                ) from exc
            except httpx.HTTPError as exc:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Failed to request OpenAI API.",
                ) from exc

        content = response.json()["choices"][0]["message"]["content"]
        items = self._parse_recommendations(content, limit)
        return RecommendationResponse(query=prompt, recommendations=items)

    @staticmethod
    def _extract_error_message(response: httpx.Response) -> str:
        try:
            body = response.json()
        except ValueError:
            return "OpenAI API returned an error."
        error = body.get("error")
        if isinstance(error, dict) and error.get("message"):
            return str(error["message"])
        return "OpenAI API returned an error."

    @staticmethod
    def _parse_recommendations(content: str, limit: int) -> list[RecommendationItem]:
        cleaned = content.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`")
            cleaned = cleaned.removeprefix("json").strip()

        try:
            payload = json.loads(cleaned)
        except json.JSONDecodeError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="OpenAI response was not valid JSON.",
            ) from exc

        raw_items = AiRecommendationService._extract_recommendation_items(payload)

        items: list[RecommendationItem] = []
        for raw in raw_items[:limit]:
            if not isinstance(raw, dict):
                continue
            title = str(
                raw.get("title")
                or raw.get("name")
                or raw.get("movie")
                or raw.get("제목")
                or raw.get("영화")
                or ""
            ).strip()
            reason = str(
                raw.get("reason")
                or raw.get("description")
                or raw.get("why")
                or raw.get("이유")
                or raw.get("추천이유")
                or raw.get("추천 이유")
                or ""
            ).strip()
            if not title or not reason:
                continue
            items.append(
                RecommendationItem(
                    title=title,
                    reason=reason,
                    mood=str(raw.get("mood") or raw.get("분위기") or raw.get("장르") or "").strip() or None,
                    year=str(raw.get("year") or raw.get("연도") or raw.get("개봉연도") or "").strip() or None,
                )
            )

        if not items:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="OpenAI response did not include usable recommendations.",
            )

        return items

    @staticmethod
    def _extract_recommendation_items(payload: Any) -> list[Any]:
        if isinstance(payload, list):
            return payload

        if not isinstance(payload, dict):
            return []

        for key in ("recommendations", "movies", "results", "items"):
            value = payload.get(key)
            if isinstance(value, list):
                return value

        for value in payload.values():
            if isinstance(value, list):
                return value

        return []


ai_recommendation_service = AiRecommendationService()
