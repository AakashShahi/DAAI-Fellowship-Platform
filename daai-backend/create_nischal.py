from pymongo import MongoClient
import bcrypt
from datetime import datetime, timezone

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

client = MongoClient("mongodb://localhost:27017")
db = client.daai_fellowship_db
users = db.users

nischal = users.find_one({"email": "nischal@daai.com"})
if not nischal:
    users.insert_one({
        "full_name": "Nischal",
        "email": "nischal@daai.com",
        "hashed_password": hash_password("Password@123"),
        "role": "FELLOW",
        "learning_track": "AWS_ARCHITECT",  # Approximation of AWS DevOps and Cloud Engineering
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    })
    print("Created user nischal@daai.com with password: Password@123")
else:
    print("User already exists")
