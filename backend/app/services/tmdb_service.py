from typing import Any
from time import monotonic

import httpx
from fastapi import HTTPException, status

from app.core.config import settings
from app.schemas.movie import Movie, MovieListResponse


class TmdbService:
    def __init__(self) -> None:
        self.base_url = settings.tmdb_base_url.rstrip("/")
        self.image_base_url = settings.tmdb_image_base_url.rstrip("/")
        self.timeout = httpx.Timeout(settings.tmdb_timeout_seconds)
        self.cache_ttl_seconds = settings.tmdb_cache_ttl_seconds
        self._cache: dict[tuple[str, tuple[tuple[str, str], ...]], tuple[float, dict[str, Any]]] = {}

    def _cache_key(
        self,
        path: str,
        params: dict[str, Any] | None,
    ) -> tuple[str, tuple[tuple[str, str], ...]]:
        normalized_params = tuple(
            sorted((str(key), str(value)) for key, value in (params or {}).items())
        )
        return path, normalized_params

    def _get_cached(
        self,
        key: tuple[str, tuple[tuple[str, str], ...]],
    ) -> dict[str, Any] | None:
        if self.cache_ttl_seconds <= 0:
            return None

        cached = self._cache.get(key)
        if not cached:
            return None

        expires_at, payload = cached
        if monotonic() >= expires_at:
            self._cache.pop(key, None)
            return None

        return payload

    def _set_cached(
        self,
        key: tuple[str, tuple[tuple[str, str], ...]],
        payload: dict[str, Any],
    ) -> None:
        if self.cache_ttl_seconds <= 0:
            return

        self._cache[key] = (monotonic() + self.cache_ttl_seconds, payload)

    def _auth_params(self) -> dict[str, str]:
        if settings.tmdb_access_token.strip():
            return {}
        if settings.tmdb_api_key.strip():
            return {"api_key": settings.tmdb_api_key.strip()}
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="TMDB credentials are not configured.",
        )

    def _auth_headers(self) -> dict[str, str]:
        token = settings.tmdb_access_token.strip()
        if not token:
            return {}
        if token.lower().startswith("bearer "):
            return {"Authorization": token}
        return {"Authorization": f"Bearer {token}"}

    async def _request(self, path: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        merged_params: dict[str, Any] = {
            "language": "ko-KR",
            **self._auth_params(),
            **(params or {}),
        }
        safe_cache_params = {key: value for key, value in merged_params.items() if key != "api_key"}
        cache_key = self._cache_key(path, safe_cache_params)
        cached_payload = self._get_cached(cache_key)
        if cached_payload is not None:
            return cached_payload

        async with httpx.AsyncClient(
            base_url=self.base_url,
            timeout=self.timeout,
            headers=self._auth_headers(),
        ) as client:
            try:
                response = await client.get(path, params=merged_params)
                response.raise_for_status()
                payload = response.json()
                self._set_cached(cache_key, payload)
                return payload
            except httpx.TimeoutException as exc:
                raise HTTPException(
                    status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                    detail="TMDB request timed out.",
                ) from exc
            except httpx.HTTPStatusError as exc:
                raise HTTPException(
                    status_code=exc.response.status_code,
                    detail=self._extract_error_message(exc.response),
                ) from exc
            except httpx.HTTPError as exc:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Failed to request TMDB API.",
                ) from exc

    @staticmethod
    def _extract_error_message(response: httpx.Response) -> str:
        try:
            body = response.json()
        except ValueError:
            return "TMDB API returned an error."
        return str(body.get("status_message") or body.get("detail") or "TMDB API returned an error.")

    def _image_url(self, path: str | None, size: str) -> str | None:
        if not path:
            return None
        return f"{self.image_base_url}/{size}{path}"

    def _normalize_movie(self, raw: dict[str, Any]) -> Movie:
        title = raw.get("title") or raw.get("name") or raw.get("original_title") or "Untitled"
        poster_path = raw.get("poster_path")
        backdrop_path = raw.get("backdrop_path")

        return Movie(
            id=int(raw["id"]),
            title=title,
            overview=raw.get("overview") or "",
            poster_path=poster_path,
            backdrop_path=backdrop_path,
            poster_url=self._image_url(poster_path, "w342"),
            backdrop_url=self._image_url(backdrop_path, "w1280"),
            release_date=raw.get("release_date"),
            vote_average=float(raw.get("vote_average") or 0),
            popularity=float(raw.get("popularity") or 0),
            original_language=raw.get("original_language"),
        )

    def _normalize_list(self, raw: dict[str, Any]) -> MovieListResponse:
        return MovieListResponse(
            page=int(raw.get("page") or 1),
            total_pages=int(raw.get("total_pages") or 1),
            total_results=int(raw.get("total_results") or 0),
            results=[self._normalize_movie(item) for item in raw.get("results", []) if item.get("id")],
        )

    async def get_popular(self, page: int = 1) -> MovieListResponse:
        return self._normalize_list(await self._request("/movie/popular", {"page": page}))

    async def get_top_rated(self, page: int = 1) -> MovieListResponse:
        return self._normalize_list(await self._request("/movie/top_rated", {"page": page}))

    async def get_now_playing(self, page: int = 1) -> MovieListResponse:
        return self._normalize_list(await self._request("/movie/now_playing", {"page": page}))

    async def get_upcoming(self, page: int = 1) -> MovieListResponse:
        return self._normalize_list(await self._request("/movie/upcoming", {"page": page}))

    async def search(self, query: str, page: int = 1) -> MovieListResponse:
        cleaned_query = query.strip()
        if not cleaned_query:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Search query is required.",
            )
        return self._normalize_list(
            await self._request("/search/movie", {"query": cleaned_query, "page": page})
        )

    async def get_movie(self, movie_id: int) -> Movie:
        if movie_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Movie id must be a positive integer.",
            )
        return self._normalize_movie(await self._request(f"/movie/{movie_id}"))


tmdb_service = TmdbService()
