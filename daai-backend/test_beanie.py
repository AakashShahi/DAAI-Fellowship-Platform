import asyncio
from beanie import Document, init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

class User(Document):
    role: str
    is_active: bool

async def main():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    await init_beanie(database=client.test_db, document_models=[User])
    
    query_filters = [
        {"role": {"$nin": ["FELLOW", "EMPLOYER"]}}
    ]
    query_filters.append(User.is_active == True)
    query = User.find(*query_filters)
    print("Query ok")

asyncio.run(main())
