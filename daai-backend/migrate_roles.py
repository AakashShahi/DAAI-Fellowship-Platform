import asyncio
from pymongo import AsyncMongoClient
from app.core.config import settings

async def migrate_roles():
    print(f"Connecting to {settings.MONGODB_URL}")
    client = AsyncMongoClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    users = db["users"]
    
    print("Updating MENTOR -> HR...")
    result_hr = await users.update_many(
        {"role": "MENTOR"},
        {"$set": {"role": "HR"}}
    )
    print(f"Updated {result_hr.modified_count} users to HR.")
    
    print("Updating TRAINER -> INSTRUCTOR...")
    result_inst = await users.update_many(
        {"role": "TRAINER"},
        {"$set": {"role": "INSTRUCTOR"}}
    )
    print(f"Updated {result_inst.modified_count} users to INSTRUCTOR.")
    
    # Also update ActivityLogs if needed, but let's focus on users first.
    logs = db["activity_logs"]
    print("Updating ActivityLogs actor_role MENTOR -> HR...")
    await logs.update_many({"actor_role": "MENTOR"}, {"$set": {"actor_role": "HR"}})
    print("Updating ActivityLogs actor_role TRAINER -> INSTRUCTOR...")
    await logs.update_many({"actor_role": "TRAINER"}, {"$set": {"actor_role": "INSTRUCTOR"}})

    await client.close()
    print("Migration complete.")

if __name__ == "__main__":
    asyncio.run(migrate_roles())
