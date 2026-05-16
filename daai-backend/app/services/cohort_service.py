from datetime import datetime, timezone

from beanie import PydanticObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status

from app.constants.learning_tracks import (
    LEARNING_TRACK_TO_SELECTED_TRACK,
    SELECTED_TRACK_TO_LEARNING_TRACK,
    SELECTED_TRACK_VALUES,
)
from app.models.program_cohort_model import CohortStatus, ProgramCohort
from app.models.user_model import User, UserRole
from app.schema.cohort_schema import (
    CohortCreate,
    CohortDetailResponse,
    CohortFellowSummary,
    CohortResponse,
    CohortStatsResponse,
    CohortUpdate,
    MyCohortResponse,
)


def _parse_oid(value: str, label: str) -> PydanticObjectId:
    try:
        return PydanticObjectId(value)
    except (InvalidId, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {label} id",
        ) from exc


def _validate_dates(start_date: datetime, end_date: datetime) -> None:
    if start_date >= end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="startDate must be before endDate",
        )


def _to_response(cohort: ProgramCohort) -> CohortResponse:
    return CohortResponse(
        id=str(cohort.id),
        name=cohort.name,
        track=cohort.track,
        description=cohort.description,
        start_date=cohort.start_date,
        end_date=cohort.end_date,
        status=cohort.status,
        fellows=[str(fellow_id) for fellow_id in cohort.fellows],
        fellows_count=len(cohort.fellows),
        created_at=cohort.created_at,
        updated_at=cohort.updated_at,
    )


def _to_fellow_summary(user: User) -> CohortFellowSummary:
    return CohortFellowSummary(
        id=str(user.id),
        full_name=user.full_name,
        email=str(user.email),
        selected_track=LEARNING_TRACK_TO_SELECTED_TRACK.get(user.learning_track),
        status="Active" if user.is_active else "Inactive",
    )


class CohortService:
    async def _validate_fellow_ids(
        self,
        fellow_ids: list[str],
        cohort_track: str,
    ) -> list[PydanticObjectId]:
        object_ids: list[PydanticObjectId] = []
        seen: set[str] = set()

        for fellow_id in fellow_ids:
            if fellow_id in seen:
                continue

            seen.add(fellow_id)
            oid = _parse_oid(fellow_id, "fellow")
            fellow = await User.get(oid)

            if fellow is None or fellow.role != UserRole.FELLOW:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Only fellow users can be assigned to cohorts.",
                )

            selected_track = LEARNING_TRACK_TO_SELECTED_TRACK.get(fellow.learning_track)
            if selected_track is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"{fellow.full_name} has not selected a track yet.",
                )

            if selected_track != cohort_track:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"{fellow.full_name} is enrolled in {selected_track}, "
                        f"not {cohort_track}."
                    ),
                )

            object_ids.append(oid)

        return object_ids

    async def list_cohorts(
        self,
        *,
        track: str | None = None,
        status_filter: str | None = None,
    ) -> list[CohortResponse]:
        if track and track not in SELECTED_TRACK_VALUES:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid track filter")

        if status_filter and status_filter not in {item.value for item in CohortStatus}:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid status filter")

        cohorts = await ProgramCohort.find_all().to_list()
        if track:
            cohorts = [cohort for cohort in cohorts if cohort.track == track]
        if status_filter:
            cohorts = [cohort for cohort in cohorts if cohort.status == status_filter]

        cohorts.sort(key=lambda cohort: cohort.start_date, reverse=True)
        return [_to_response(cohort) for cohort in cohorts]

    async def create_cohort(self, data: CohortCreate) -> CohortDetailResponse:
        _validate_dates(data.start_date, data.end_date)
        fellow_ids = await self._validate_fellow_ids(data.fellows, data.track)
        now = datetime.now(timezone.utc)
        cohort = ProgramCohort(
            name=data.name,
            track=data.track,
            description=data.description,
            start_date=data.start_date,
            end_date=data.end_date,
            status=data.status,
            fellows=fellow_ids,
            created_at=now,
            updated_at=now,
        )
        await cohort.insert()
        return await self.get_cohort(str(cohort.id))

    async def get_cohort(self, cohort_id: str) -> CohortDetailResponse:
        cohort = await ProgramCohort.get(_parse_oid(cohort_id, "cohort"))
        if cohort is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Cohort not found")

        response = _to_response(cohort).model_dump()
        fellow_details = []
        for fellow_id in cohort.fellows:
            fellow = await User.get(fellow_id)
            if fellow is not None:
                fellow_details.append(_to_fellow_summary(fellow))

        return CohortDetailResponse(**response, fellow_details=fellow_details)

    async def update_cohort(
        self,
        cohort_id: str,
        data: CohortUpdate,
    ) -> CohortDetailResponse:
        cohort = await ProgramCohort.get(_parse_oid(cohort_id, "cohort"))
        if cohort is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Cohort not found")

        update_data = data.model_dump(exclude_unset=True, by_alias=False)
        if "name" in update_data:
            cohort.name = update_data["name"]
        if "track" in update_data:
            new_track = update_data["track"]
            await self._validate_fellow_ids([str(fid) for fid in cohort.fellows], new_track)
            cohort.track = new_track
        if "description" in update_data:
            cohort.description = update_data["description"] or ""
        if "start_date" in update_data:
            cohort.start_date = update_data["start_date"]
        if "end_date" in update_data:
            cohort.end_date = update_data["end_date"]
        if "status" in update_data:
            cohort.status = update_data["status"]

        _validate_dates(cohort.start_date, cohort.end_date)
        cohort.updated_at = datetime.now(timezone.utc)
        await cohort.save()
        return await self.get_cohort(cohort_id)

    async def archive_cohort(self, cohort_id: str) -> CohortResponse:
        cohort = await ProgramCohort.get(_parse_oid(cohort_id, "cohort"))
        if cohort is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Cohort not found")

        cohort.status = CohortStatus.ARCHIVED
        cohort.updated_at = datetime.now(timezone.utc)
        await cohort.save()
        return _to_response(cohort)

    async def update_cohort_fellows(
        self,
        cohort_id: str,
        fellow_ids: list[str],
    ) -> CohortDetailResponse:
        cohort = await ProgramCohort.get(_parse_oid(cohort_id, "cohort"))
        if cohort is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Cohort not found")

        cohort.fellows = await self._validate_fellow_ids(fellow_ids, cohort.track)
        cohort.updated_at = datetime.now(timezone.utc)
        await cohort.save()
        return await self.get_cohort(cohort_id)

    async def get_my_cohort(self, user: User) -> MyCohortResponse:
        cohorts = await ProgramCohort.find(
            {
                "fellows": user.id,
                "status": {"$in": [CohortStatus.ACTIVE.value, CohortStatus.UPCOMING.value]},
            },
        ).to_list()

        if not cohorts:
            return MyCohortResponse(
                cohort=None,
                message="You are not assigned to a cohort yet.",
            )

        cohorts.sort(key=lambda cohort: cohort.start_date)
        return MyCohortResponse(cohort=_to_response(cohorts[0]))

    async def get_cohort_stats(self) -> CohortStatsResponse:
        cohorts = await ProgramCohort.find_all().to_list()
        counts = {status_item.value: 0 for status_item in CohortStatus}
        for cohort in cohorts:
            counts[cohort.status.value] += 1

        return CohortStatsResponse(
            totalCohorts=len(cohorts),
            active=counts[CohortStatus.ACTIVE.value],
            upcoming=counts[CohortStatus.UPCOMING.value],
            completed=counts[CohortStatus.COMPLETED.value],
            archived=counts[CohortStatus.ARCHIVED.value],
        )
