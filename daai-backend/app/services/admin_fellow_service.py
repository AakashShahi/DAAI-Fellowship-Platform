from datetime import datetime, timezone

from beanie import PydanticObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status

from app.constants.learning_tracks import (
    LEARNING_TRACK_TO_SELECTED_TRACK,
    SELECTED_TRACK_TO_LEARNING_TRACK,
    SELECTED_TRACK_VALUES,
)
from app.models.user_model import User, UserRole
from app.schema.admin_fellow_schema import (
    AdminFellowListItem,
    AdminFellowTrackUpdateResponse,
    AdminTrackStatsResponse,
)

TRACK_FILTER_UNASSIGNED = "unassigned"
TRACK_STATS_ORDER = (
    "qa",
    "aws-practitioner",
    "aws-architect",
    "salesforce",
)


def _parse_user_id(value: str) -> PydanticObjectId:
    try:
        return PydanticObjectId(value)
    except (InvalidId, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid fellow id",
        ) from exc


def _to_admin_fellow_item(user: User) -> AdminFellowListItem:
    return AdminFellowListItem(
        id=str(user.id),
        full_name=user.full_name,
        email=str(user.email),
        role=user.role,
        selected_track=LEARNING_TRACK_TO_SELECTED_TRACK.get(user.learning_track),
        created_at=user.created_at,
        status="Active" if user.is_active else "Inactive",
    )


class AdminFellowService:
    async def list_fellows(self, track: str | None = None) -> list[AdminFellowListItem]:
        users = await User.find(User.role == UserRole.FELLOW).to_list()

        if track:
            normalized_track = track.strip().lower()
            if normalized_track == TRACK_FILTER_UNASSIGNED:
                users = [user for user in users if user.learning_track is None]
            elif normalized_track in SELECTED_TRACK_VALUES:
                users = [
                    user
                    for user in users
                    if user.learning_track == SELECTED_TRACK_TO_LEARNING_TRACK[normalized_track]
                ]
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid track filter",
                )

        users.sort(key=lambda user: user.created_at, reverse=True)
        return [_to_admin_fellow_item(user) for user in users]

    async def update_fellow_track(
        self,
        fellow_id: str,
        selected_track: str | None,
    ) -> AdminFellowTrackUpdateResponse:
        fellow = await User.get(_parse_user_id(fellow_id))
        if fellow is None or fellow.role != UserRole.FELLOW:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fellow not found",
            )

        if selected_track is None:
            fellow.learning_track = None
            message = "Fellow track reset successfully."
        else:
            fellow.learning_track = SELECTED_TRACK_TO_LEARNING_TRACK[selected_track]
            message = "Fellow track updated successfully."

        fellow.updated_at = datetime.now(timezone.utc)
        await fellow.save()

        return AdminFellowTrackUpdateResponse(
            message=message,
            fellow=_to_admin_fellow_item(fellow),
        )

    async def get_track_stats(self) -> AdminTrackStatsResponse:
        fellows = await User.find(User.role == UserRole.FELLOW).to_list()
        tracks = {track: 0 for track in TRACK_STATS_ORDER}
        unassigned = 0

        for fellow in fellows:
            selected_track = LEARNING_TRACK_TO_SELECTED_TRACK.get(fellow.learning_track)
            if selected_track is None:
                unassigned += 1
            else:
                tracks[selected_track] += 1

        return AdminTrackStatsResponse(
            totalFellows=len(fellows),
            unassigned=unassigned,
            tracks=tracks,
        )
