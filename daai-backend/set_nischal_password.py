from pymongo import MongoClient
import bcrypt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

client = MongoClient("mongodb://localhost:27017")
db = client.daai_fellowship_db
users = db.users

nischal = users.find_one({"email": "nischal@daai.com"})
if nischal:
    users.update_one(
        {"email": "nischal@daai.com"},
        {"$set": {"hashed_password": hash_password("Password@123"), "is_active": True}}
    )
    print("Password updated for Nischal: Password@123")
else:
    print("User not found")
