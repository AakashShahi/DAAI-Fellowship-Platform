from fastapi import APIRouter

from app.api.v1.routes import (
    auth_routes,
    batch_routes,
    enrollment_routes,
    fellows_admin_routes,
    health_routes,
    profile_routes,
    quiz_routes,
    track_routes,
)

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

api_router.include_router(
    profile_routes.router,
    prefix="/profile",
    tags=["Profile"],
)

api_router.include_router(
    track_routes.router,
    prefix="/tracks",
    tags=["Tracks"],
)

api_router.include_router(
    batch_routes.router,
    prefix="/batches",
    tags=["Batches"],
)

api_router.include_router(
    enrollment_routes.router,
    prefix="/enrollments",
    tags=["Enrollments"],
)

api_router.include_router(
    fellows_admin_routes.router,
    prefix="/fellows",
    tags=["Fellows"],
)
