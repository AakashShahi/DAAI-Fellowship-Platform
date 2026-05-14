from datetime import datetime, timezone

from beanie import PydanticObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.models.batch_model import Batch, BatchStatus
from app.models.enrollment_model import Enrollment, EnrollmentStatus
from app.models.track_model import Track
from app.models.user_model import User, UserRole
from app.schema.fellowship_schema import (
    BatchCreate,
    BatchResponse,
    BatchSummary,
    BatchUpdate,
    EnrollmentCreate,
    EnrollmentDetail,
    EnrollmentListItem,
    EnrollmentUpdate,
    FellowListItem,
    MyEnrollmentResponse,
    TrackCreate,
    TrackResponse,
    TrackSummary,
    TrackUpdate,
)


def _parse_oid(value: str, field: str) -> PydanticObjectId:
    try:
        return PydanticObjectId(value)
    except (InvalidId, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {field} id",
        ) from exc


def _track_summary(t: Track) -> TrackSummary:
    return TrackSummary(
        id=str(t.id),
        title=t.title,
        slug=t.slug,
        description=t.description,
        duration=t.duration,
        difficulty=t.difficulty,
        status=t.status,
    )


def _track_response(t: Track) -> TrackResponse:
    return TrackResponse(
        id=str(t.id),
        title=t.title,
        slug=t.slug,
        description=t.description,
        duration=t.duration,
        difficulty=t.difficulty,
        status=t.status,
        created_at=t.created_at,
        updated_at=t.updated_at,
    )


def _batch_summary(b: Batch) -> BatchSummary:
    return BatchSummary(
        id=str(b.id),
        name=b.name,
        start_date=b.start_date,
        end_date=b.end_date,
        status=b.status,
    )


def _batch_response(b: Batch) -> BatchResponse:
    return BatchResponse(
        id=str(b.id),
        name=b.name,
        track_id=str(b.track_id),
        start_date=b.start_date,
        end_date=b.end_date,
        status=b.status,
        created_at=b.created_at,
        updated_at=b.updated_at,
    )


class TrackService:
    async def list_tracks(self) -> list[TrackResponse]:
        tracks = await Track.find_all().sort(-Track.created_at).to_list()
        return [_track_response(t) for t in tracks]

    async def get_track(self, track_id: str) -> TrackResponse:
        oid = _parse_oid(track_id, "track")
        t = await Track.get(oid)
        if t is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Track not found")
        return _track_response(t)

    async def create_track(self, data: TrackCreate) -> TrackResponse:
        existing = await Track.find_one(Track.slug == data.slug)
        if existing:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "A track with this slug already exists",
            )
        now = datetime.now(timezone.utc)
        t = Track(
            title=data.title.strip(),
            slug=data.slug,
            description=data.description.strip(),
            duration=data.duration.strip(),
            difficulty=data.difficulty.strip(),
            status=data.status,
            created_at=now,
            updated_at=now,
        )
        await t.insert()
        return _track_response(t)

    async def update_track(self, track_id: str, data: TrackUpdate) -> TrackResponse:
        oid = _parse_oid(track_id, "track")
        t = await Track.get(oid)
        if t is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Track not found")
        if data.title is not None:
            t.title = data.title.strip()
        if data.description is not None:
            t.description = data.description.strip()
        if data.duration is not None:
            t.duration = data.duration.strip()
        if data.difficulty is not None:
            t.difficulty = data.difficulty.strip()
        if data.status is not None:
            t.status = data.status
        t.updated_at = datetime.now(timezone.utc)
        await t.save()
        return _track_response(t)

    async def delete_track(self, track_id: str) -> None:
        oid = _parse_oid(track_id, "track")
        t = await Track.get(oid)
        if t is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Track not found")
        batch_count = await Batch.find(Batch.track_id == oid).count()
        if batch_count > 0:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Cannot delete a track that still has batches",
            )
        await t.delete()


class BatchService:
    async def list_batches(self, track_id: str | None) -> list[BatchResponse]:
        if track_id:
            oid = _parse_oid(track_id, "track")
            batches = await Batch.find(Batch.track_id == oid).sort(-Batch.start_date).to_list()
        else:
            batches = await Batch.find_all().sort(-Batch.start_date).to_list()
        return [_batch_response(b) for b in batches]

    async def get_batch(self, batch_id: str) -> BatchResponse:
        oid = _parse_oid(batch_id, "batch")
        b = await Batch.get(oid)
        if b is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Batch not found")
        return _batch_response(b)

    async def create_batch(self, data: BatchCreate) -> BatchResponse:
        track_oid = _parse_oid(data.track_id, "track")
        track = await Track.get(track_oid)
        if track is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Track not found")
        if data.end_date < data.start_date:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "endDate must be on or after startDate",
            )
        now = datetime.now(timezone.utc)
        b = Batch(
            name=data.name.strip(),
            track_id=track_oid,
            start_date=data.start_date,
            end_date=data.end_date,
            status=data.status,
            created_at=now,
            updated_at=now,
        )
        await b.insert()
        return _batch_response(b)

    async def update_batch(self, batch_id: str, data: BatchUpdate) -> BatchResponse:
        oid = _parse_oid(batch_id, "batch")
        b = await Batch.get(oid)
        if b is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Batch not found")
        if data.name is not None:
            b.name = data.name.strip()
        if data.start_date is not None:
            b.start_date = data.start_date
        if data.end_date is not None:
            b.end_date = data.end_date
        if data.status is not None:
            b.status = data.status
        if b.end_date < b.start_date:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "endDate must be on or after startDate",
            )
        b.updated_at = datetime.now(timezone.utc)
        await b.save()
        return _batch_response(b)

    async def delete_batch(self, batch_id: str) -> None:
        oid = _parse_oid(batch_id, "batch")
        b = await Batch.get(oid)
        if b is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Batch not found")
        enrollment_count = await Enrollment.find(Enrollment.batch_id == oid).count()
        if enrollment_count > 0:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Cannot delete a batch that has enrollments",
            )
        await b.delete()


class EnrollmentService:
    async def build_detail(self, e: Enrollment) -> EnrollmentDetail:
        track = await Track.get(e.track_id)
        batch = await Batch.get(e.batch_id)
        if track is None or batch is None:
            raise HTTPException(
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                "Enrollment references missing track or batch",
            )
        return EnrollmentDetail(
            id=str(e.id),
            fellow_id=str(e.fellow_id),
            track_id=str(e.track_id),
            batch_id=str(e.batch_id),
            status=e.status,
            enrolled_at=e.enrolled_at,
            completed_at=e.completed_at,
            track=_track_summary(track),
            batch=_batch_summary(batch),
        )

    async def build_list_item(self, e: Enrollment) -> EnrollmentListItem:
        detail = await self.build_detail(e)
        return EnrollmentListItem(
            id=detail.id,
            fellow_id=detail.fellow_id,
            track_id=detail.track_id,
            batch_id=detail.batch_id,
            status=detail.status,
            enrolled_at=detail.enrolled_at,
            completed_at=detail.completed_at,
            track=detail.track,
            batch=detail.batch,
        )

    async def list_enrollments(
        self,
        *,
        fellow_id: str | None,
        track_id: str | None,
    ) -> list[EnrollmentListItem]:
        if fellow_id:
            fid = _parse_oid(fellow_id, "fellow")
            enrollments = (
                await Enrollment.find(Enrollment.fellow_id == fid)
                .sort(-Enrollment.enrolled_at)
                .limit(500)
                .to_list()
            )
        elif track_id:
            tid = _parse_oid(track_id, "track")
            enrollments = (
                await Enrollment.find(Enrollment.track_id == tid)
                .sort(-Enrollment.enrolled_at)
                .limit(500)
                .to_list()
            )
        else:
            enrollments = (
                await Enrollment.find_all()
                .sort(-Enrollment.enrolled_at)
                .limit(500)
                .to_list()
            )
        items: list[EnrollmentListItem] = []
        for e in enrollments:
            items.append(await self.build_list_item(e))
        return items

    async def get_my_enrollment(self, user: User) -> MyEnrollmentResponse:
        e = await Enrollment.find_one(
            {
                "fellow_id": user.id,
                "status": EnrollmentStatus.ACTIVE.value,
            },
        )
        if e is None:
            return MyEnrollmentResponse(enrollment=None)
        return MyEnrollmentResponse(enrollment=await self.build_detail(e))

    async def create_enrollment(self, data: EnrollmentCreate) -> EnrollmentDetail:
        fellow_oid = _parse_oid(data.fellow_id, "fellow")
        track_oid = _parse_oid(data.track_id, "track")
        batch_oid = _parse_oid(data.batch_id, "batch")

        fellow = await User.get(fellow_oid)
        if fellow is None or fellow.role != UserRole.FELLOW:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "User is not a fellow or does not exist",
            )
        track = await Track.get(track_oid)
        if track is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Track not found")
        batch = await Batch.get(batch_oid)
        if batch is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Batch not found")
        if batch.track_id != track_oid:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Batch does not belong to the selected track",
            )

        existing = await Enrollment.find_one(
            {
                "fellow_id": fellow_oid,
                "status": EnrollmentStatus.ACTIVE.value,
            },
        )
        if existing:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "This fellow already has an active enrollment. Withdraw or complete it first.",
            )

        now = datetime.now(timezone.utc)
        enrollment = Enrollment(
            fellow_id=fellow_oid,
            track_id=track_oid,
            batch_id=batch_oid,
            status=EnrollmentStatus.ACTIVE,
            enrolled_at=now,
            completed_at=None,
            created_at=now,
            updated_at=now,
        )
        try:
            await enrollment.insert()
        except DuplicateKeyError as exc:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "This fellow already has an active enrollment.",
            ) from exc

        return await self.build_detail(enrollment)

    async def update_enrollment(
        self,
        enrollment_id: str,
        data: EnrollmentUpdate,
    ) -> EnrollmentDetail:
        oid = _parse_oid(enrollment_id, "enrollment")
        e = await Enrollment.get(oid)
        if e is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Enrollment not found")

        if data.status == EnrollmentStatus.ACTIVE:
            active = await Enrollment.find(
                {
                    "fellow_id": e.fellow_id,
                    "status": EnrollmentStatus.ACTIVE.value,
                },
            ).to_list()
            if any(row.id != e.id for row in active):
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST,
                    "Fellow already has another active enrollment",
                )

        e.status = data.status
        if data.status in (EnrollmentStatus.COMPLETED, EnrollmentStatus.WITHDRAWN):
            e.completed_at = data.completed_at or datetime.now(timezone.utc)
        elif data.status == EnrollmentStatus.ACTIVE:
            e.completed_at = None
        e.updated_at = datetime.now(timezone.utc)
        try:
            await e.save()
        except DuplicateKeyError as exc:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Cannot activate: another active enrollment exists for this fellow.",
            ) from exc

        return await self.build_detail(e)


async def list_fellow_users() -> list[FellowListItem]:
    users = await User.find(User.role == UserRole.FELLOW).to_list()
    users.sort(key=lambda u: u.full_name.lower())
    return [
        FellowListItem(id=str(u.id), full_name=u.full_name, email=str(u.email))
        for u in users
    ]
