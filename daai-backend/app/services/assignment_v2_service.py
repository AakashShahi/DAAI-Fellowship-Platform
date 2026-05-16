from datetime import datetime, timezone

from beanie import PydanticObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status

from app.constants.assignments import (
    ASSIGNMENT_STATUS_ARCHIVED,
    ASSIGNMENT_STATUS_PUBLISHED,
    ASSIGNMENT_STATUS_TO_MODEL,
    MODEL_ASSIGNMENT_STATUS_TO_API,
    MODEL_SUBMISSION_STATUS_TO_API,
    SUBMISSION_STATUS_NEEDS_RESUBMISSION,
    SUBMISSION_STATUS_REVIEWED,
    SUBMISSION_STATUS_SUBMITTED,
    SUBMISSION_STATUS_TO_MODEL,
)
from app.constants.learning_tracks import LEARNING_TRACK_TO_SELECTED_TRACK
from app.models.assignment_model import Assignment, AssignmentStatus
from app.models.learning_module_model import LearningModule
from app.models.lesson_model import Lesson
from app.models.submission_model import Submission, SubmissionLink, SubmissionStatus
from app.models.user_model import User, UserRole
from app.schema.assignment_v2_schema import (
    AssignmentCreateV2,
    AssignmentResponseV2,
    AssignmentStatsResponse,
    AssignmentUpdateV2,
    FellowAssignmentDetailV2,
    FellowAssignmentStats,
    FellowAssignmentSummaryV2,
    SubmissionPayload,
    SubmissionResponseV2,
    SubmissionReviewPayload,
)


def _parse_oid(value: str, field: str) -> PydanticObjectId:
    try:
        return PydanticObjectId(value)
    except (InvalidId, ValueError) as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Invalid {field} id") from exc


def _selected_track(user: User) -> str:
    track = LEARNING_TRACK_TO_SELECTED_TRACK.get(user.learning_track)
    if track is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Please select a learning track first.")
    return track


async def _validate_module_and_lesson(track: str, module_id: str, lesson_id: str | None):
    module = await LearningModule.get(_parse_oid(module_id, "module"))
    if module is None or module.track != track:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Assignment module must match selected track.")
    lesson = None
    if lesson_id:
        lesson = await Lesson.get(_parse_oid(lesson_id, "lesson"))
        if lesson is None or lesson.module_id != module.id:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Lesson must belong to the selected module.")
    return module, lesson


async def _assignment_response(assignment: Assignment) -> AssignmentResponseV2:
    module = await LearningModule.get(assignment.module_id) if assignment.module_id else None
    lesson = await Lesson.get(assignment.lesson_id) if assignment.lesson_id else None
    submissions_count = await Submission.find(Submission.assignment_id == assignment.id).count()
    return AssignmentResponseV2(
        id=str(assignment.id),
        title=assignment.title,
        description=assignment.description,
        track=assignment.track,
        module_id=str(assignment.module_id),
        module_title=module.title if module else None,
        lesson_id=str(assignment.lesson_id) if assignment.lesson_id else None,
        lesson_title=lesson.title if lesson else None,
        due_date=assignment.due_date,
        total_marks=assignment.total_marks if assignment.total_marks is not None else assignment.max_score,
        submission_type=assignment.submission_type.value,
        status=MODEL_ASSIGNMENT_STATUS_TO_API[assignment.status],
        created_by=str(assignment.created_by),
        submissions_count=submissions_count,
        created_at=assignment.created_at,
        updated_at=assignment.updated_at,
    )


async def _submission_response(submission: Submission) -> SubmissionResponseV2:
    assignment = await Assignment.get(submission.assignment_id)
    fellow = await User.get(submission.fellow_id)
    return SubmissionResponseV2(
        id=str(submission.id),
        assignment_id=str(submission.assignment_id),
        assignment_title=assignment.title if assignment else None,
        fellow_id=str(submission.fellow_id),
        fellow_name=fellow.full_name if fellow else None,
        fellow_email=str(fellow.email) if fellow else None,
        selected_track=LEARNING_TRACK_TO_SELECTED_TRACK.get(fellow.learning_track) if fellow else None,
        submission_text=submission.submission_text,
        submission_links=submission.submission_links,
        status=MODEL_SUBMISSION_STATUS_TO_API[submission.status],
        marks_obtained=submission.marks_obtained if submission.marks_obtained is not None else submission.score,
        feedback=submission.feedback,
        reviewed_by=str(submission.reviewed_by) if submission.reviewed_by else None,
        reviewed_at=submission.reviewed_at,
        submitted_at=submission.submitted_at,
        created_at=submission.created_at,
        updated_at=submission.updated_at,
    )


class AssignmentV2AdminService:
    async def list_assignments(self, track: str | None, status_filter: str | None, module_id: str | None):
        assignments = [a for a in await Assignment.find_all().to_list() if a.track]
        if track:
            assignments = [a for a in assignments if a.track == track]
        if status_filter:
            assignments = [a for a in assignments if MODEL_ASSIGNMENT_STATUS_TO_API[a.status] == status_filter]
        if module_id:
            oid = _parse_oid(module_id, "module")
            assignments = [a for a in assignments if a.module_id == oid]
        assignments.sort(key=lambda a: a.created_at, reverse=True)
        return [await _assignment_response(a) for a in assignments]

    async def create_assignment(self, data: AssignmentCreateV2, admin: User):
        module, lesson = await _validate_module_and_lesson(data.track, data.module_id, data.lesson_id)
        now = datetime.now(timezone.utc)
        assignment = Assignment(
            title=data.title,
            description=data.description,
            instructions=data.description,
            track=data.track,
            module_id=module.id,
            lesson_id=lesson.id if lesson else None,
            due_date=data.due_date,
            max_score=data.total_marks,
            total_marks=data.total_marks,
            submission_type=data.submission_type,
            status=ASSIGNMENT_STATUS_TO_MODEL[data.status],
            created_by=admin.id,
            created_at=now,
            updated_at=now,
        )
        await assignment.insert()
        return await _assignment_response(assignment)

    async def get_assignment(self, assignment_id: str):
        assignment = await Assignment.get(_parse_oid(assignment_id, "assignment"))
        if assignment is None or not assignment.track:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Assignment not found")
        return await _assignment_response(assignment)

    async def update_assignment(self, assignment_id: str, data: AssignmentUpdateV2):
        assignment = await Assignment.get(_parse_oid(assignment_id, "assignment"))
        if assignment is None or not assignment.track:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Assignment not found")
        updates = data.model_dump(exclude_unset=True, by_alias=False)
        track = updates.get("track", assignment.track)
        module_id = updates.get("module_id", str(assignment.module_id))
        lesson_id = updates.get("lesson_id", str(assignment.lesson_id) if assignment.lesson_id else None)
        module, lesson = await _validate_module_and_lesson(track, module_id, lesson_id)
        assignment.track = track
        assignment.module_id = module.id
        assignment.lesson_id = lesson.id if lesson else None
        for field in ("title", "description", "due_date", "total_marks", "submission_type"):
            if field in updates and updates[field] is not None:
                setattr(assignment, field, updates[field])
        if "description" in updates and updates["description"] is not None:
            assignment.instructions = updates["description"]
        if "total_marks" in updates and updates["total_marks"] is not None:
            assignment.max_score = updates["total_marks"]
        if "status" in updates and updates["status"] is not None:
            assignment.status = ASSIGNMENT_STATUS_TO_MODEL[updates["status"]]
        assignment.updated_at = datetime.now(timezone.utc)
        await assignment.save()
        return await _assignment_response(assignment)

    async def archive_assignment(self, assignment_id: str):
        assignment = await Assignment.get(_parse_oid(assignment_id, "assignment"))
        if assignment is None or not assignment.track:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Assignment not found")
        assignment.status = ASSIGNMENT_STATUS_TO_MODEL[ASSIGNMENT_STATUS_ARCHIVED]
        assignment.updated_at = datetime.now(timezone.utc)
        await assignment.save()
        return await _assignment_response(assignment)

    async def list_submissions(self, assignment_id: str):
        assignment = await Assignment.get(_parse_oid(assignment_id, "assignment"))
        if assignment is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Assignment not found")
        submissions = await Submission.find(Submission.assignment_id == assignment.id).sort(-Submission.submitted_at).to_list()
        return [await _submission_response(sub) for sub in submissions]

    async def review_submission(self, submission_id: str, payload: SubmissionReviewPayload, admin: User):
        submission = await Submission.get(_parse_oid(submission_id, "submission"))
        if submission is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Submission not found")
        assignment = await Assignment.get(submission.assignment_id)
        if assignment is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Assignment not found")
        total = assignment.total_marks if assignment and assignment.total_marks is not None else assignment.max_score
        if payload.marksObtained is not None and payload.marksObtained > total:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "marksObtained cannot be greater than totalMarks.")
        submission.status = SUBMISSION_STATUS_TO_MODEL[payload.status]
        submission.marks_obtained = payload.marksObtained
        submission.score = payload.marksObtained
        submission.feedback = payload.feedback.strip()
        submission.reviewed_by = admin.id
        submission.reviewed_at = datetime.now(timezone.utc)
        submission.updated_at = datetime.now(timezone.utc)
        await submission.save()
        return await _submission_response(submission)

    async def stats(self):
        assignments = [a for a in await Assignment.find_all().to_list() if a.track]
        submissions = await Submission.find_all().to_list()
        return {
            "totalAssignments": len(assignments),
            "publishedAssignments": sum(1 for a in assignments if MODEL_ASSIGNMENT_STATUS_TO_API[a.status] == ASSIGNMENT_STATUS_PUBLISHED),
            "pendingReviews": sum(1 for s in submissions if MODEL_SUBMISSION_STATUS_TO_API.get(s.status) in {SUBMISSION_STATUS_SUBMITTED, "under-review"}),
            "reviewedSubmissions": sum(1 for s in submissions if MODEL_SUBMISSION_STATUS_TO_API.get(s.status) == SUBMISSION_STATUS_REVIEWED),
            "needsResubmission": sum(1 for s in submissions if MODEL_SUBMISSION_STATUS_TO_API.get(s.status) == SUBMISSION_STATUS_NEEDS_RESUBMISSION),
        }


class AssignmentV2FellowService:
    async def list_assignments(self, user: User):
        track = _selected_track(user)
        assignments = await Assignment.find(
            Assignment.track == track,
            Assignment.status == AssignmentStatus.PUBLISHED,
        ).to_list()
        assignments.sort(key=lambda a: (a.due_date or datetime.max.replace(tzinfo=timezone.utc), a.title))
        rows = []
        for assignment in assignments:
            submission = await Submission.find_one({"assignment_id": assignment.id, "fellow_id": user.id})
            response = (await _assignment_response(assignment)).model_dump()
            status_value = MODEL_SUBMISSION_STATUS_TO_API[submission.status] if submission else "not-submitted"
            rows.append(FellowAssignmentSummaryV2(**response, submission_status=status_value, review_status=status_value, marks_obtained=(submission.marks_obtained if submission else None)))
        return rows

    async def get_assignment(self, user: User, assignment_id: str):
        track = _selected_track(user)
        assignment = await Assignment.get(_parse_oid(assignment_id, "assignment"))
        if assignment is None or assignment.status != AssignmentStatus.PUBLISHED:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Assignment not found")
        if assignment.track != track:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "You are not enrolled in this track.")
        submission = await Submission.find_one({"assignment_id": assignment.id, "fellow_id": user.id})
        return FellowAssignmentDetailV2(
            assignment=await _assignment_response(assignment),
            submission=await _submission_response(submission) if submission else None,
        )

    async def submit_assignment(self, user: User, assignment_id: str, payload: SubmissionPayload):
        track = _selected_track(user)
        assignment = await Assignment.get(_parse_oid(assignment_id, "assignment"))
        if assignment is None or assignment.status != AssignmentStatus.PUBLISHED:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Assignment not found")
        if assignment.track != track:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "You are not enrolled in this track.")
        if not payload.submission_text.strip() and not payload.submission_links:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Provide submission text or at least one link.")
        existing = await Submission.find_one({"assignment_id": assignment.id, "fellow_id": user.id})
        if existing and MODEL_SUBMISSION_STATUS_TO_API[existing.status] not in {SUBMISSION_STATUS_SUBMITTED, SUBMISSION_STATUS_NEEDS_RESUBMISSION}:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "This submission cannot be resubmitted after review.")
        now = datetime.now(timezone.utc)
        links = [SubmissionLink(**link.model_dump()) for link in payload.submission_links]
        if existing:
            existing.submission_text = payload.submission_text.strip()
            existing.submission_links = links
            existing.submission_link = links[0].url if links else ""
            existing.status = SubmissionStatus.SUBMITTED_V2
            existing.submitted_at = now
            existing.updated_at = now
            existing.marks_obtained = None
            existing.score = None
            existing.feedback = ""
            existing.reviewed_by = None
            existing.reviewed_at = None
            await existing.save()
            return await _submission_response(existing)
        submission = Submission(
            assignment_id=assignment.id,
            fellow_id=user.id,
            track=track,
            module_id=assignment.module_id,
            submission_text=payload.submission_text.strip(),
            submission_links=links,
            submission_link=links[0].url if links else "",
            status=SubmissionStatus.SUBMITTED_V2,
            submitted_at=now,
            created_at=now,
            updated_at=now,
        )
        await submission.insert()
        return await _submission_response(submission)

    async def list_my_submissions(self, user: User):
        track = _selected_track(user)
        submissions = await Submission.find({"fellow_id": user.id, "track": track}).sort(-Submission.submitted_at).to_list()
        return [await _submission_response(sub) for sub in submissions]

    async def get_my_submission(self, user: User, submission_id: str):
        submission = await Submission.get(_parse_oid(submission_id, "submission"))
        if submission is None or submission.fellow_id != user.id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Submission not found")
        return await _submission_response(submission)

    async def summary(self, user: User):
        assignments = await self.list_assignments(user)
        total = len(assignments)
        submitted = sum(1 for a in assignments if a.submission_status != "not-submitted")
        reviewed = sum(1 for a in assignments if a.submission_status == "reviewed")
        return FellowAssignmentStats(
            totalAssignments=total,
            submittedAssignments=submitted,
            reviewedAssignments=reviewed,
            pendingAssignments=total - submitted,
        )
