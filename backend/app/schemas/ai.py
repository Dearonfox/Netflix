from pydantic import BaseModel, Field


class RecommendationRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=500)
    limit: int = Field(default=5, ge=1, le=8)


class RecommendationItem(BaseModel):
    title: str
    reason: str
    mood: str | None = None
    year: str | None = None


class RecommendationResponse(BaseModel):
    query: str
    recommendations: list[RecommendationItem]
