import logging

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings
from app.models.user_model import User

logger = logging.getLogger(__name__)

client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None


async def init_db() -> AsyncIOMotorDatabase:
    global client, db

    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]

    await client.admin.command("ping")
    await init_beanie(database=db, document_models=[User])

    logger.info("MongoDB connected: %s", settings.DATABASE_NAME)
    return db


async def close_mongo_connection():
    global client, db

    if client is not None:
        client.close()
        client = None
        db = None
        logger.info("MongoDB disconnected")


def get_database() -> AsyncIOMotorDatabase:
    if db is None:
        raise RuntimeError("Database has not been initialized")

    return db
