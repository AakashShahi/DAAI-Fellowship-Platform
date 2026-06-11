import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.learning_module_model import LearningModule, LearningModuleStatus
from app.models.user_model import User
from app.services.curriculum_service import CurriculumFellowService

async def main():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    await init_beanie(database=client.daai_fellowship_db, document_models=[LearningModule, User])
    
    nischal = await User.find_one({"email": "nischal@daai.com"})
    print(f"Fellow: {nischal.full_name}, Track: {nischal.learning_track}")
    
    service = CurriculumFellowService()
    modules = await service.list_modules(nischal)
    
    print(f"Found {len(modules)} published modules for this fellow:")
    for m in modules:
        print(f" - {m.title} (lessons: {m.lesson_count})")

asyncio.run(main())
