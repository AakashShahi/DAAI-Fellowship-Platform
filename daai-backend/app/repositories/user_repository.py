from beanie import PydanticObjectId
from bson.errors import InvalidId

from app.models.user_model import User
from app.schema.user_schema import UserCreate
from app.utils.password import hash_password


class UserRepository:
    async def get_by_id(self, user_id: str) -> User | None:
        try:
            object_id = PydanticObjectId(user_id)
        except InvalidId:
            return None

        return await User.get(object_id)

    async def get_by_email(self, email: str) -> User | None:
        return await User.find_one(User.email == email.lower())

    async def create(self, user_data: UserCreate) -> User:
        user = User(
            full_name=user_data.full_name,
            email=user_data.email.lower(),
            hashed_password=hash_password(user_data.password),
            role=user_data.role,
        )
        await user.insert()
        return user
