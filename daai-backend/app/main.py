from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.core.config import settings
from app.core.database import close_mongo_connection, init_db
from app.api.v1.router import api_router
from app.api.v1.routes import learning_progress_routes, profile_routes, quiz_routes
from app.api.v1.routes import (
    admin_cohort_routes,
    admin_curriculum_routes,
    admin_assignment_v2_routes,
    admin_session_routes,
    admin_fellow_routes,
    admin_staff_routes,
    fellow_routes,
    profile_routes,
    quiz_routes,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    try:
        yield
    finally:
        await close_mongo_connection()


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
    ],
    allow_origin_regex=r"^http://(127\.0\.0\.1|localhost):517\d$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "DAAI Backend Running"
    }


app.include_router(api_router, prefix="/api/v1")
Path("uploads").mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.include_router(quiz_routes.router, prefix="/api/quizzes", tags=["Quizzes"])
app.include_router(profile_routes.router, prefix="/api/profile", tags=["Profile"])
app.include_router(
    learning_progress_routes.router,
    prefix="/api/learning-progress",
    tags=["Learning Progress"],
)
app.include_router(fellow_routes.router, prefix="/api/fellow", tags=["Fellow"])
app.include_router(admin_fellow_routes.router, prefix="/api/admin", tags=["Admin Fellow Management"])
app.include_router(admin_cohort_routes.router, prefix="/api/admin", tags=["Admin Cohort Management"])
app.include_router(admin_curriculum_routes.router, prefix="/api/admin", tags=["Admin Curriculum Management"])
app.include_router(admin_assignment_v2_routes.router, prefix="/api/admin", tags=["Admin Assignment Management"])
app.include_router(admin_session_routes.router, prefix="/api/admin", tags=["Admin Session Management"])
app.include_router(admin_staff_routes.router, prefix="/api/admin", tags=["Admin Staff Management"])
