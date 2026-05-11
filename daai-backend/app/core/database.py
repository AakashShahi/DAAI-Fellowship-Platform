from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client = AsyncIOMotorClient(settings.MONGODB_URL)

db = client[settings.DATABASE_NAME]


async def connect_to_mongo():
    print("MongoDB connected")


async def close_mongo_connection():
    client.close()
    print("MongoDB disconnected")