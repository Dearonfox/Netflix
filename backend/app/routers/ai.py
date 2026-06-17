from fastapi import APIRouter

from app.schemas.ai import RecommendationRequest, RecommendationResponse
from app.services.ai_recommendation_service import ai_recommendation_service


router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/recommendations", response_model=RecommendationResponse)
async def recommend_movies(payload: RecommendationRequest) -> RecommendationResponse:
    return await ai_recommendation_service.recommend(
        prompt=payload.prompt,
        limit=payload.limit,
    )
