from fastapi import APIRouter

from app.api.v1.routes import auth_routes, health_routes, quiz_routes

api_router = APIRouter()

api_router.include_router(
    auth_routes.router,
    prefix="/auth",
    tags=["Authentication"]
)

api_router.include_router(
    health_routes.router,
    prefix="/health",
    tags=["Health"]
)

api_router.include_router(
    quiz_routes.router,
    prefix="/quizzes",
    tags=["Quizzes"]
)
