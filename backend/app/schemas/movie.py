from pydantic import BaseModel, ConfigDict


class Movie(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: int
    title: str
    overview: str = ""
    poster_path: str | None = None
    backdrop_path: str | None = None
    poster_url: str | None = None
    backdrop_url: str | None = None
    release_date: str | None = None
    vote_average: float = 0
    popularity: float = 0
    original_language: str | None = None


class MovieListResponse(BaseModel):
    page: int = 1
    total_pages: int = 1
    total_results: int = 0
    results: list[Movie]
