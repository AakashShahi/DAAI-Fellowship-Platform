from fastapi import FastAPI
from contextlib import asynccontextmanager
from starlette.middleware.cors import CORSMiddleware
import logging

from app.core.config import settings
from app.core.database import close_mongo_connection, init_db
from app.api.v1.router import api_router
from app.api.v1.routes import profile_routes, quiz_routes

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
# Set pymongo to WARNING level to reduce noise
logging.getLogger('pymongo').setLevel(logging.WARNING)
logging.getLogger('motor').setLevel(logging.WARNING)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    try:
        yield
    finally:
        await close_mongo_connection()


# Create app
app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware using Starlette's CORSMiddleware (handles errors properly)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "DAAI Backend Running"}


app.include_router(api_router, prefix="/api/v1")
app.include_router(quiz_routes.router, prefix="/api/quizzes", tags=["Quizzes"])
app.include_router(profile_routes.router, prefix="/api/profile", tags=["Profile"])
