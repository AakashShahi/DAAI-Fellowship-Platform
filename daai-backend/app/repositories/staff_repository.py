import re
from datetime import datetime, timezone

from beanie import PydanticObjectId
from bson.errors import InvalidId
from pymongo import DESCENDING

from app.models.user_model import User, UserRole


class StaffRepository:
    async def get_by_id(self, user_id: str) -> User | None:
        try:
            object_id = PydanticObjectId(user_id)
        except (InvalidId, ValueError):
            return None

        return await User.get(object_id)

    async def get_by_email(self, email: str) -> User | None:
        return await User.find_one(User.email == email.lower())

    async def create(
        self,
        *,
        full_name: str,
        email: str,
        hashed_password: str,
        role: UserRole,
        phone: str | None = None,
    ) -> User:
        user = User(
            full_name=full_name,
            email=email.lower(),
            hashed_password=hashed_password,
            role=role,
            phone=phone,
        )
        await user.insert()
        return user

    async def update(
        self,
        user: User,
        *,
        full_name: str | None = None,
        phone: str | None = ...,
        role: UserRole | None = None,
    ) -> User:
        if full_name is not None:
            user.full_name = full_name
        if phone is not ...:
            user.phone = phone
        if role is not None:
            user.role = role

        user.updated_at = datetime.now(timezone.utc)
        await user.save()
        return user

    async def set_active_status(self, user: User, *, is_active: bool) -> User:
        user.is_active = is_active
        user.updated_at = datetime.now(timezone.utc)
        await user.save()
        return user

    async def list_staff(
        self,
        *,
        role_filter: UserRole | None = None,
        status_filter: bool | None = None,
        search: str | None = None,
        page: int = 1,
        page_size: int = 10,
    ) -> tuple[list[User], int]:
        query_filters = []

        if role_filter is not None:
            query_filters.append(User.role == role_filter)

        if status_filter is not None:
            query_filters.append(User.is_active == status_filter)

        if search:
            escaped = re.escape(search.strip())
            regex_pattern = re.compile(escaped, re.IGNORECASE)
            query_filters.append(
                {
                    "$or": [
                        {"full_name": {"$regex": regex_pattern}},
                        {"email": {"$regex": regex_pattern}},
                        {"phone": {"$regex": regex_pattern}},
                    ]
                }
            )

        query = User.find(*query_filters) if query_filters else User.find_all()
        total = await query.count()

        users = (
            await query
            .sort(("created_at", DESCENDING))
            .skip((page - 1) * page_size)
            .limit(page_size)
            .to_list()
        )

        return users, total
