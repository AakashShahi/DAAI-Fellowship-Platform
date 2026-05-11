from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def health():
    return {
        "success": True,
        "message": "Backend is running"
    }