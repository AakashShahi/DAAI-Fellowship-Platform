from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import close_mongo_connection, init_db
from app.api.v1.router import api_router


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


@app.get("/")
async def root():
    return {
        "message": "DAAI Backend Running"
    }


app.include_router(api_router, prefix="/api/v1")
