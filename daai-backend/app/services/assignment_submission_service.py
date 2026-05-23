from datetime import datetime, timezone

from beanie import PydanticObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.models.assignment_model import Assignment, AssignmentStatus
from app.models.enrollment_model import Enrollment, EnrollmentStatus
from app.models.learning_module_model import LearningModule
from app.models.submission_model import Submission, SubmissionStatus
from app.models.track_model import Track
from app.models.user_model import User
from app.schema.assignment_schema import (
    AssignmentCreate,
    AssignmentResponse,
    AssignmentUpdate,
    FellowAssignmentDashboardSummary,
    FellowAssignmentDetailResponse,
    FellowAssignmentSummary,
    FellowMySubmissionRow,
    SubmissionDetailResponse,
    SubmissionListItem,
    SubmissionResponse,
    SubmissionReviewUpdate,
    SubmissionUpsert,
)


def _parse_oid(value: str, field: str) -> PydanticObjectId:
    try:
        return PydanticObjectId(value)
    except (InvalidId, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {field} id",
        ) from exc


async def _active_enrollment_track_id(user: User) -> PydanticObjectId | None:
    e = await Enrollment.find_one(
        {
            "fellow_id": user.id,
            "status": EnrollmentStatus.ACTIVE.value,
        },
    )
    return e.track_id if e else None


def _assignment_response(a: Assignment) -> AssignmentResponse:
    return AssignmentResponse(
        id=str(a.id),
        title=a.title,
        description=a.description,
        instructions=a.instructions,
        track_id=str(a.track_id),
        module_id=str(a.module_id) if a.module_id else None,
        due_date=a.due_date,
        max_score=a.max_score,
        status=a.status,
        created_by=str(a.created_by),
        created_at=a.created_at,
        updated_at=a.updated_at,
    )


def _submission_response(s: Submission) -> SubmissionResponse:
    return SubmissionResponse(
        id=str(s.id),
        assignment_id=str(s.assignment_id),
        fellow_id=str(s.fellow_id),
        track_id=str(s.track_id),
        module_id=str(s.module_id) if s.module_id else None,
        submission_text=s.submission_text,
        submission_link=s.submission_link,
        file_url=s.file_url,
        status=s.status,
        score=s.score,
        feedback=s.feedback,
        reviewed_by=str(s.reviewed_by) if s.reviewed_by else None,
        submitted_at=s.submitted_at,
        reviewed_at=s.reviewed_at,
        created_at=s.created_at,
        updated_at=s.updated_at,
    )


async def _ensure_track_exists(track_oid: PydanticObjectId) -> None:
    track = await Track.get(track_oid)
    if track is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Track not found")


async def _validate_module_for_assignment(
    module_oid: PydanticObjectId | None,
    track_oid: PydanticObjectId,
) -> None:
    if module_oid is None:
        return
    module = await LearningModule.get(module_oid)
    if module is None or module.track_id != track_oid:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Module not found or does not belong to the selected track",
        )


class AssignmentAdminService:
    async def list_assignments(
        self,
        track_id: str | None,
        module_id: str | None,
    ) -> list[AssignmentResponse]:
        if module_id:
            moid = _parse_oid(module_id, "module")
            rows = await Assignment.find(Assignment.module_id == moid).sort(
                -Assignment.created_at,
            ).to_list()
        elif track_id:
            toid = _parse_oid(track_id, "track")
            rows = await Assignment.find(Assignment.track_id == toid).sort(
                -Assignment.created_at,
            ).to_list()
        else:
            rows = await Assignment.find_all().sort(-Assignment.created_at).to_list()
        return [_assignment_response(a) for a in rows]

    async def get_assignment(self, assignment_id: str) -> AssignmentResponse:
        oid = _parse_oid(assignment_id, "assignment")
        a = await Assignment.get(oid)
        if a is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Assignment not found")
        return _assignment_response(a)

    async def create_assignment(
        self,
        data: AssignmentCreate,
        admin: User,
    ) -> AssignmentResponse:
        track_oid = _parse_oid(data.track_id, "track")
        await _ensure_track_exists(track_oid)
        module_oid = _parse_oid(data.module_id, "module") if data.module_id else None
        await _validate_module_for_assignment(module_oid, track_oid)
        now = datetime.now(timezone.utc)
        a = Assignment(
            title=data.title.strip(),
            description=data.description.strip(),
            instructions=data.instructions.strip(),
            track_id=track_oid,
            module_id=module_oid,
            due_date=data.due_date,
            max_score=data.max_score,
            status=data.status,
            created_by=admin.id,
            created_at=now,
            updated_at=now,
        )
        await a.insert()
        return _assignment_response(a)

    async def update_assignment(
        self,
        assignment_id: str,
        data: AssignmentUpdate,
    ) -> AssignmentResponse:
        oid = _parse_oid(assignment_id, "assignment")
        a = await Assignment.get(oid)
        if a is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Assignment not found")

        updates = data.model_dump(exclude_unset=True)

        if "track_id" in updates and updates["track_id"] is not None:
            track_oid = _parse_oid(updates["track_id"], "track")
            await _ensure_track_exists(track_oid)
            a.track_id = track_oid

        if "module_id" in updates:
            raw_mod = updates["module_id"]
            module_oid = _parse_oid(raw_mod, "module") if raw_mod else None
            await _validate_module_for_assignment(module_oid, a.track_id)
            a.module_id = module_oid
        elif "track_id" in updates:
            await _validate_module_for_assignment(a.module_id, a.track_id)

        if "title" in updates and updates["title"] is not None:
            a.title = updates["title"].strip()
        if "description" in updates and updates["description"] is not None:
            a.description = updates["description"].strip()
        if "instructions" in updates and updates["instructions"] is not None:
            a.instructions = updates["instructions"].strip()
        if "due_date" in updates:
            a.due_date = updates["due_date"]
        if "max_score" in updates and updates["max_score"] is not None:
            a.max_score = updates["max_score"]
        if "status" in updates and updates["status"] is not None:
            a.status = updates["status"]

        a.updated_at = datetime.now(timezone.utc)
        await a.save()
        return _assignment_response(a)

    async def delete_assignment(self, assignment_id: str) -> None:
        oid = _parse_oid(assignment_id, "assignment")
        a = await Assignment.get(oid)
        if a is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Assignment not found")
        await Submission.find(Submission.assignment_id == oid).delete()
        await a.delete()


class FellowAssignmentService:
    async def dashboard_summary(self, user: User) -> FellowAssignmentDashboardSummary:
        track_id = await _active_enrollment_track_id(user)
        if track_id is None:
            return FellowAssignmentDashboardSummary(enrolled=False)

        assignments = await Assignment.find(
            {
                "track_id": track_id,
                "status": {"$in": [AssignmentStatus.OPEN.value, AssignmentStatus.CLOSED.value]},
            },
        ).to_list()

        open_count = sum(1 for a in assignments if a.status == AssignmentStatus.OPEN)
        submitted_pending = 0
        needs_revision = 0
        reviewed = 0

        for a in assignments:
            sub = await Submission.find_one(
                {
                    "assignment_id": a.id,
                    "fellow_id": user.id,
                },
            )
            if not sub:
                continue
            if sub.status == SubmissionStatus.SUBMITTED:
                submitted_pending += 1
            elif sub.status == SubmissionStatus.NEEDS_REVISION:
                needs_revision += 1
            elif sub.status == SubmissionStatus.REVIEWED:
                reviewed += 1

        return FellowAssignmentDashboardSummary(
            enrolled=True,
            open_count=open_count,
            submitted_pending_count=submitted_pending,
            needs_revision_count=needs_revision,
            reviewed_count=reviewed,
        )

    async def list_my_assignments(self, user: User) -> list[FellowAssignmentSummary]:
        track_id = await _active_enrollment_track_id(user)
        if track_id is None:
            return []

        assignments = await Assignment.find(
            {
                "track_id": track_id,
                "status": {"$in": [AssignmentStatus.OPEN.value, AssignmentStatus.CLOSED.value]},
            },
        ).to_list()
        far_future = datetime(9999, 12, 31, tzinfo=timezone.utc)
        assignments.sort(key=lambda x: ((x.due_date or far_future), x.title))

        out: list[FellowAssignmentSummary] = []
        for a in assignments:
            sub = await Submission.find_one(
                {"assignment_id": a.id, "fellow_id": user.id},
            )
            out.append(
                FellowAssignmentSummary(
                    id=str(a.id),
                    title=a.title,
                    description=a.description,
                    track_id=str(a.track_id),
                    module_id=str(a.module_id) if a.module_id else None,
                    due_date=a.due_date,
                    max_score=a.max_score,
                    status=a.status,
                    submission_status=sub.status if sub else None,
                    score=sub.score if sub else None,
                ),
            )
        return out

    async def get_my_assignment(
        self,
        user: User,
        assignment_id: str,
    ) -> FellowAssignmentDetailResponse:
        track_id = await _active_enrollment_track_id(user)
        if track_id is None:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                "Active enrollment is required to view assignments",
            )
        oid = _parse_oid(assignment_id, "assignment")
        a = await Assignment.get(oid)
        if (
            a is None
            or a.track_id != track_id
            or a.status not in (AssignmentStatus.OPEN, AssignmentStatus.CLOSED)
        ):
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Assignment not found")

        sub = await Submission.find_one({"assignment_id": a.id, "fellow_id": user.id})
        return FellowAssignmentDetailResponse(
            assignment=_assignment_response(a),
            submission=_submission_response(sub) if sub else None,
        )

    async def list_my_submissions(self, user: User) -> list[FellowMySubmissionRow]:
        track_id = await _active_enrollment_track_id(user)
        if track_id is None:
            return []

        subs = await Submission.find(
            {"fellow_id": user.id, "track_id": track_id},
        ).sort(-Submission.submitted_at).to_list()

        rows: list[FellowMySubmissionRow] = []
        for s in subs:
            a = await Assignment.get(s.assignment_id)
            title = a.title if a else "Unknown assignment"
            rows.append(
                FellowMySubmissionRow(
                    id=str(s.id),
                    assignment_id=str(s.assignment_id),
                    assignment_title=title,
                    status=s.status,
                    score=s.score,
                    feedback=s.feedback,
                    submitted_at=s.submitted_at,
                    reviewed_at=s.reviewed_at,
                ),
            )
        return rows

    def _validate_submission_payload(self, data: SubmissionUpsert) -> tuple[str, str, str]:
        text = data.submission_text.strip()
        link = data.submission_link.strip()
        file_url = data.file_url.strip()
        if not text and not link and not file_url:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Provide at least one of submission text, link, or file URL",
            )
        return text, link, file_url

    def _can_fellow_edit_submission(self, sub: Submission | None) -> bool:
        if sub is None:
            return True
        return sub.status in (SubmissionStatus.SUBMITTED, SubmissionStatus.NEEDS_REVISION)

    async def upsert_my_submission(
        self,
        user: User,
        assignment_id: str,
        data: SubmissionUpsert,
    ) -> SubmissionResponse:
        track_id = await _active_enrollment_track_id(user)
        if track_id is None:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                "Active enrollment is required to submit assignments",
            )
        oid = _parse_oid(assignment_id, "assignment")
        a = await Assignment.get(oid)
        if a is None or a.track_id != track_id:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                "Assignment not found",
            )
        if a.status != AssignmentStatus.OPEN:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "This assignment is not open for submissions",
            )

        text, link, file_url = self._validate_submission_payload(data)

        existing = await Submission.find_one({"assignment_id": a.id, "fellow_id": user.id})
        if existing and not self._can_fellow_edit_submission(existing):
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "This submission has been reviewed and cannot be edited",
            )

        now = datetime.now(timezone.utc)
        if existing:
            existing.submission_text = text
            existing.submission_link = link
            existing.file_url = file_url
            existing.status = SubmissionStatus.SUBMITTED
            existing.submitted_at = now
            existing.updated_at = now
            existing.score = None
            existing.feedback = ""
            existing.reviewed_by = None
            existing.reviewed_at = None
            await existing.save()
            return _submission_response(existing)

        sub = Submission(
            assignment_id=a.id,
            fellow_id=user.id,
            track_id=a.track_id,
            module_id=a.module_id,
            submission_text=text,
            submission_link=link,
            file_url=file_url,
            status=SubmissionStatus.SUBMITTED,
            score=None,
            feedback="",
            reviewed_by=None,
            submitted_at=now,
            reviewed_at=None,
            created_at=now,
            updated_at=now,
        )
        try:
            await sub.insert()
        except DuplicateKeyError as exc:
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                "A submission for this assignment already exists",
            ) from exc
        return _submission_response(sub)


class SubmissionReviewService:
    async def _fellow_public_fields(self, fellow_id: PydanticObjectId) -> tuple[str, str]:
        u = await User.get(fellow_id)
        if u is None:
            return ("Unknown", "")
        return (u.full_name, u.email)

    async def list_submissions(
        self,
        *,
        assignment_id: str | None,
        track_id: str | None,
        status: SubmissionStatus | None,
        fellow_id: str | None,
    ) -> list[SubmissionListItem]:
        query: dict = {}
        if assignment_id:
            query["assignment_id"] = _parse_oid(assignment_id, "assignment")
        if track_id:
            query["track_id"] = _parse_oid(track_id, "track")
        if status:
            query["status"] = status.value
        if fellow_id:
            query["fellow_id"] = _parse_oid(fellow_id, "fellow")

        subs = await Submission.find(query).sort(-Submission.submitted_at).to_list() if query else await Submission.find_all().sort(-Submission.submitted_at).to_list()

        assignment_cache: dict[PydanticObjectId, Assignment] = {}
        items: list[SubmissionListItem] = []
        for s in subs:
            if s.assignment_id not in assignment_cache:
                assignment_cache[s.assignment_id] = await Assignment.get(s.assignment_id)
            a = assignment_cache[s.assignment_id]
            title = a.title if a else "Unknown assignment"
            name, email = await self._fellow_public_fields(s.fellow_id)
            items.append(
                SubmissionListItem(
                    id=str(s.id),
                    assignment_id=str(s.assignment_id),
                    assignment_title=title,
                    fellow_id=str(s.fellow_id),
                    fellow_name=name,
                    fellow_email=email,
                    track_id=str(s.track_id),
                    module_id=str(s.module_id) if s.module_id else None,
                    status=s.status,
                    score=s.score,
                    submitted_at=s.submitted_at,
                    reviewed_at=s.reviewed_at,
                ),
            )
        return items

    async def get_submission_detail(self, submission_id: str) -> SubmissionDetailResponse:
        oid = _parse_oid(submission_id, "submission")
        s = await Submission.get(oid)
        if s is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Submission not found")
        a = await Assignment.get(s.assignment_id)
        if a is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Assignment not found")
        name, email = await self._fellow_public_fields(s.fellow_id)
        return SubmissionDetailResponse(
            submission=_submission_response(s),
            assignment=_assignment_response(a),
            fellow_name=name,
            fellow_email=email,
        )

    async def review_submission(
        self,
        submission_id: str,
        data: SubmissionReviewUpdate,
        reviewer: User,
    ) -> SubmissionResponse:
        if data.status not in (SubmissionStatus.REVIEWED, SubmissionStatus.NEEDS_REVISION):
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Review status must be REVIEWED or NEEDS_REVISION",
            )

        oid = _parse_oid(submission_id, "submission")
        s = await Submission.get(oid)
        if s is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Submission not found")

        a = await Assignment.get(s.assignment_id)
        if a is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Assignment not found")

        score = data.score
        if data.status == SubmissionStatus.REVIEWED and score is not None:
            if score > a.max_score:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST,
                    f"Score cannot exceed assignment max score ({a.max_score})",
                )

        if data.status == SubmissionStatus.NEEDS_REVISION:
            score = None

        now = datetime.now(timezone.utc)
        s.status = data.status
        s.score = score
        s.feedback = data.feedback.strip()
        s.reviewed_by = reviewer.id
        s.reviewed_at = now
        s.updated_at = now
        await s.save()
        return _submission_response(s)
