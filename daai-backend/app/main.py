from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import close_mongo_connection, init_db
from app.api.v1.router import api_router
from app.api.v1.routes import profile_routes, quiz_routes


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
app.include_router(quiz_routes.router, prefix="/api/quizzes", tags=["Quizzes"])
app.include_router(profile_routes.router, prefix="/api/profile", tags=["Profile"])
