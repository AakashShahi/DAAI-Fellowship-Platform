from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()

API_VERSION = "1.0.0"


@router.get("/")
async def health():
    return {
        "success": True,
        "message": "Backend is running",
        "version": API_VERSION,
        "environment": settings.APP_ENV,
    }


@router.get("/version")
async def version():
    return {
        "success": True,
        "version": API_VERSION,
        "service": "daai-backend",
    }