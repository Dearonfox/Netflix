from fastapi import APIRouter, Query

from app.schemas.movie import Movie, MovieListResponse
from app.services.tmdb_service import tmdb_service


router = APIRouter(prefix="/movies", tags=["movies"])


@router.get("/popular", response_model=MovieListResponse)
async def popular_movies(page: int = Query(default=1, ge=1)) -> MovieListResponse:
    return await tmdb_service.get_popular(page=page)


@router.get("/top-rated", response_model=MovieListResponse)
async def top_rated_movies(page: int = Query(default=1, ge=1)) -> MovieListResponse:
    return await tmdb_service.get_top_rated(page=page)


@router.get("/now-playing", response_model=MovieListResponse)
async def now_playing_movies(page: int = Query(default=1, ge=1)) -> MovieListResponse:
    return await tmdb_service.get_now_playing(page=page)


@router.get("/upcoming", response_model=MovieListResponse)
async def upcoming_movies(page: int = Query(default=1, ge=1)) -> MovieListResponse:
    return await tmdb_service.get_upcoming(page=page)


@router.get("/search", response_model=MovieListResponse)
async def search_movies(
    query: str = Query(min_length=1),
    page: int = Query(default=1, ge=1),
) -> MovieListResponse:
    return await tmdb_service.search(query=query, page=page)


@router.get("/{movie_id}", response_model=Movie)
async def movie_detail(movie_id: int) -> Movie:
    return await tmdb_service.get_movie(movie_id=movie_id)
