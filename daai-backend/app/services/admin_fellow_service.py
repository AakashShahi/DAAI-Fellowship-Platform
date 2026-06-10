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
from app.models.attendance_model import Attendance, AttendanceStatus
from app.models.quiz_model import QuizAttempt
from app.models.submission_model import Submission, SubmissionStatus
from app.schema.admin_fellow_schema import (
    AdminFellowAttendanceSummary,
    AdminFellowListItem,
    AdminFellowProfile,
    AdminFellowQuizProgress,
    AdminFellowSubmissionSummary,
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

    async def get_fellow_profile(self, fellow_id: str) -> AdminFellowProfile:
        fellow = await User.get(_parse_user_id(fellow_id))
        if fellow is None or fellow.role != UserRole.FELLOW:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fellow not found",
            )

        quiz_attempts = await QuizAttempt.find(QuizAttempt.user_id == str(fellow.id)).to_list()
        submissions = await Submission.find(Submission.fellow_id == fellow.id).to_list()
        attendance_records = await Attendance.find(Attendance.fellow_id == fellow.id).to_list()

        scores = [
            round((attempt.score / attempt.total_questions) * 100)
            for attempt in quiz_attempts
            if attempt.total_questions
        ]
        last_attempt_at = max(
            (attempt.submitted_at for attempt in quiz_attempts),
            default=None,
        )

        reviewed_statuses = {
            SubmissionStatus.REVIEWED,
            SubmissionStatus.REVIEWED_V2,
        }
        needs_revision_statuses = {
            SubmissionStatus.NEEDS_REVISION,
            SubmissionStatus.NEEDS_RESUBMISSION,
        }
        pending_review = [
            submission
            for submission in submissions
            if submission.status not in reviewed_statuses | needs_revision_statuses
        ]

        attendance_counts = {
            status_value: sum(
                1 for record in attendance_records if record.status == status_value
            )
            for status_value in AttendanceStatus
        }
        total_sessions = len(attendance_records)
        attended_count = (
            attendance_counts[AttendanceStatus.PRESENT]
            + attendance_counts[AttendanceStatus.LATE]
        )
        attendance_rate = round((attended_count / total_sessions) * 100) if total_sessions else 0
        list_item = _to_admin_fellow_item(fellow)

        return AdminFellowProfile(
            **list_item.model_dump(),
            enrollment_status="Enrolled" if list_item.selected_track else "Pending",
            quiz_progress=AdminFellowQuizProgress(
                attempts=len(quiz_attempts),
                best_score=max(scores, default=None),
                average_score=round(sum(scores) / len(scores)) if scores else None,
                last_attempt_at=last_attempt_at,
            ),
            assignment_submissions=AdminFellowSubmissionSummary(
                total=len(submissions),
                reviewed=sum(
                    1 for submission in submissions if submission.status in reviewed_statuses
                ),
                pending_review=len(pending_review),
                needs_revision=sum(
                    1
                    for submission in submissions
                    if submission.status in needs_revision_statuses
                ),
            ),
            attendance=AdminFellowAttendanceSummary(
                total_sessions=total_sessions,
                present=attendance_counts[AttendanceStatus.PRESENT],
                absent=attendance_counts[AttendanceStatus.ABSENT],
                late=attendance_counts[AttendanceStatus.LATE],
                excused=attendance_counts[AttendanceStatus.EXCUSED],
                attendance_rate=attendance_rate,
            ),
        )

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
            activeFellows=sum(1 for fellow in fellows if fellow.is_active),
            unassigned=unassigned,
            tracks=tracks,
        )
