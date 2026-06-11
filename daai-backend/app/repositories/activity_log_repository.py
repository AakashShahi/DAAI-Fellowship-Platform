from beanie import PydanticObjectId
from bson.errors import InvalidId
from pymongo import DESCENDING

from app.models.activity_log_model import ActivityAction, ActivityLog


class ActivityLogRepository:
    async def create(
        self,
        *,
        actor_id: str,
        actor_name: str,
        actor_role: str,
        action: ActivityAction,
        target_id: str | None = None,
        target_name: str | None = None,
        description: str = "",
        metadata: dict | None = None,
    ) -> ActivityLog:
        log = ActivityLog(
            actor_id=actor_id,
            actor_name=actor_name,
            actor_role=actor_role,
            action=action,
            target_id=target_id,
            target_name=target_name,
            description=description,
            metadata=metadata,
        )
        await log.insert()
        return log

    async def find_by_target(
        self,
        target_id: str,
        *,
        skip: int = 0,
        limit: int = 50,
    ) -> list[ActivityLog]:
        return (
            await ActivityLog.find(ActivityLog.target_id == target_id)
            .sort(("created_at", DESCENDING))
            .skip(skip)
            .limit(limit)
            .to_list()
        )

    async def count_by_target(self, target_id: str) -> int:
        return await ActivityLog.find(ActivityLog.target_id == target_id).count()

    async def find_by_actor(
        self,
        actor_id: str,
        *,
        skip: int = 0,
        limit: int = 50,
    ) -> list[ActivityLog]:
        return (
            await ActivityLog.find(ActivityLog.actor_id == actor_id)
            .sort(("created_at", DESCENDING))
            .skip(skip)
            .limit(limit)
            .to_list()
        )

    async def find_recent(self, *, limit: int = 50) -> list[ActivityLog]:
        return (
            await ActivityLog.find_all()
            .sort(("created_at", DESCENDING))
            .limit(limit)
            .to_list()
        )
