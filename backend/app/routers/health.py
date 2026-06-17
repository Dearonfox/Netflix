from datetime import datetime, timezone

from fastapi import APIRouter

from app.core.config import settings


router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict[str, str | bool]:
    return {
        "ok": True,
        "service": settings.app_name,
        "environment": settings.app_env,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
