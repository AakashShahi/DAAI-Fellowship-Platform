from datetime import datetime, timezone

from beanie import PydanticObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status

from app.constants.learning_tracks import LEARNING_TRACK_TO_SELECTED_TRACK, SELECTED_TRACK_VALUES
from app.constants.sessions import (
    ATTENDANCE_STATUS_ABSENT,
    ATTENDANCE_STATUS_EXCUSED,
    ATTENDANCE_STATUS_LATE,
    ATTENDANCE_STATUS_NOT_MARKED,
    ATTENDANCE_STATUS_PRESENT,
)
from app.models.attendance_model import Attendance, AttendanceStatus
from app.models.program_cohort_model import ProgramCohort
from app.models.session_model import Session, SessionStatus
from app.models.user_model import User
from app.schema.session_schema import (
    AttendanceBulkUpdate,
    AttendanceRow,
    AttendanceSummary,
    FellowAttendanceRow,
    SessionCreate,
    SessionResponse,
    SessionStatsResponse,
    SessionUpdate,
)


def _parse_oid(value: str, label: str) -> PydanticObjectId:
    try:
        return PydanticObjectId(value)
    except (InvalidId, ValueError) as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Invalid {label} id") from exc


def _validate_times(start_time: str, end_time: str) -> None:
    if start_time >= end_time:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "startTime must be before endTime.")


async def _get_cohort(cohort_id: str) -> ProgramCohort:
    cohort = await ProgramCohort.get(_parse_oid(cohort_id, "cohort"))
    if cohort is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Cohort not found")
    return cohort


async def _session_response(session: Session) -> SessionResponse:
    cohort = await ProgramCohort.get(session.cohort_id)
    marked_count = await Attendance.find(Attendance.session_id == session.id).count()
    return SessionResponse(
        id=str(session.id),
        title=session.title,
        description=session.description,
        cohort_id=str(session.cohort_id),
        cohort_name=cohort.name if cohort else None,
        track=session.track,
        session_date=session.session_date,
        start_time=session.start_time,
        end_time=session.end_time,
        meeting_link=session.meeting_link,
        recording_link=session.recording_link,
        status=session.status.value,
        created_by=str(session.created_by),
        attendance_marked_count=marked_count,
        created_at=session.created_at,
        updated_at=session.updated_at,
    )


async def _assigned_cohorts(user: User) -> list[ProgramCohort]:
    cohorts = await ProgramCohort.find({"fellows": user.id}).to_list()
    if not cohorts:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You are not assigned to a cohort yet.")
    return cohorts


class SessionAdminService:
    async def list_sessions(
        self,
        track: str | None = None,
        cohort_id: str | None = None,
        status_filter: str | None = None,
    ) -> list[SessionResponse]:
        if track and track not in SELECTED_TRACK_VALUES:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid track filter")
        if status_filter and status_filter not in {item.value for item in SessionStatus}:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid status filter")

        sessions = await Session.find_all().to_list()
        if track:
            sessions = [session for session in sessions if session.track == track]
        if cohort_id:
            oid = _parse_oid(cohort_id, "cohort")
            sessions = [session for session in sessions if session.cohort_id == oid]
        if status_filter:
            sessions = [session for session in sessions if session.status.value == status_filter]

        sessions.sort(key=lambda session: (session.session_date, session.start_time), reverse=True)
        return [await _session_response(session) for session in sessions]

    async def create_session(self, data: SessionCreate, admin: User) -> SessionResponse:
        _validate_times(data.start_time, data.end_time)
        cohort = await _get_cohort(data.cohort_id)
        now = datetime.now(timezone.utc)
        session = Session(
            title=data.title,
            description=data.description,
            cohort_id=cohort.id,
            track=cohort.track,
            session_date=data.session_date,
            start_time=data.start_time,
            end_time=data.end_time,
            meeting_link=data.meeting_link,
            recording_link=data.recording_link,
            status=SessionStatus(data.status),
            created_by=admin.id,
            created_at=now,
            updated_at=now,
        )
        await session.insert()
        return await _session_response(session)

    async def get_session(self, session_id: str) -> SessionResponse:
        session = await Session.get(_parse_oid(session_id, "session"))
        if session is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
        return await _session_response(session)

    async def update_session(self, session_id: str, data: SessionUpdate) -> SessionResponse:
        session = await Session.get(_parse_oid(session_id, "session"))
        if session is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")

        updates = data.model_dump(exclude_unset=True, by_alias=False)
        if "cohort_id" in updates and updates["cohort_id"]:
            cohort = await _get_cohort(updates["cohort_id"])
            session.cohort_id = cohort.id
            session.track = cohort.track
        for field in ("title", "description", "session_date", "start_time", "end_time", "meeting_link", "recording_link"):
            if field in updates and updates[field] is not None:
                setattr(session, field, updates[field])
        if "status" in updates and updates["status"] is not None:
            session.status = SessionStatus(updates["status"])

        _validate_times(session.start_time, session.end_time)
        session.updated_at = datetime.now(timezone.utc)
        await session.save()
        return await _session_response(session)

    async def archive_session(self, session_id: str) -> SessionResponse:
        session = await Session.get(_parse_oid(session_id, "session"))
        if session is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
        session.status = SessionStatus.ARCHIVED
        session.updated_at = datetime.now(timezone.utc)
        await session.save()
        return await _session_response(session)

    async def attendance_list(self, session_id: str) -> list[AttendanceRow]:
        session = await Session.get(_parse_oid(session_id, "session"))
        if session is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
        cohort = await ProgramCohort.get(session.cohort_id)
        if cohort is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Cohort not found")

        rows: list[AttendanceRow] = []
        for fellow_id in cohort.fellows:
            fellow = await User.get(fellow_id)
            if fellow is None:
                continue
            record = await Attendance.find_one({"session_id": session.id, "fellow_id": fellow_id})
            rows.append(
                AttendanceRow(
                    fellow_id=str(fellow_id),
                    fellow_name=fellow.full_name,
                    email=str(fellow.email),
                    selected_track=LEARNING_TRACK_TO_SELECTED_TRACK.get(fellow.learning_track),
                    status=record.status.value if record else ATTENDANCE_STATUS_NOT_MARKED,
                    remarks=record.remarks if record else "",
                    marked_by=str(record.marked_by) if record else None,
                    marked_at=record.marked_at if record else None,
                ),
            )
        return rows

    async def mark_attendance(self, session_id: str, payload: AttendanceBulkUpdate, admin: User) -> list[AttendanceRow]:
        session = await Session.get(_parse_oid(session_id, "session"))
        if session is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
        if session.status == SessionStatus.ARCHIVED:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cannot mark attendance for archived sessions.")
        cohort = await ProgramCohort.get(session.cohort_id)
        if cohort is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Cohort not found")

        allowed = {str(fellow_id): fellow_id for fellow_id in cohort.fellows}
        now = datetime.now(timezone.utc)
        for item in payload.attendance:
            fellow_oid = allowed.get(item.fellow_id)
            if fellow_oid is None:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "Attendance can only be marked for fellows assigned to this cohort.")
            record = await Attendance.find_one({"session_id": session.id, "fellow_id": fellow_oid})
            if record:
                record.status = AttendanceStatus(item.status)
                record.remarks = item.remarks.strip()
                record.marked_by = admin.id
                record.marked_at = now
                record.updated_at = now
                await record.save()
            else:
                await Attendance(
                    session_id=session.id,
                    fellow_id=fellow_oid,
                    status=AttendanceStatus(item.status),
                    remarks=item.remarks.strip(),
                    marked_by=admin.id,
                    marked_at=now,
                    created_at=now,
                    updated_at=now,
                ).insert()

        return await self.attendance_list(session_id)

    async def stats(self) -> SessionStatsResponse:
        sessions = await Session.find_all().to_list()
        active_sessions = [session for session in sessions if session.status != SessionStatus.ARCHIVED]
        counts = {item.value: 0 for item in SessionStatus}
        attendance_percentages: list[int] = []
        needing_attendance = 0

        for session in sessions:
            counts[session.status.value] += 1
            if session.status == SessionStatus.ARCHIVED:
                continue
            cohort = await ProgramCohort.get(session.cohort_id)
            fellow_count = len(cohort.fellows) if cohort else 0
            records = await Attendance.find(Attendance.session_id == session.id).to_list()
            if fellow_count and len(records) < fellow_count:
                needing_attendance += 1
            if fellow_count:
                attended = sum(1 for record in records if record.status in {AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.EXCUSED})
                attendance_percentages.append(round((attended / fellow_count) * 100))

        average = round(sum(attendance_percentages) / len(attendance_percentages)) if attendance_percentages else 0
        return SessionStatsResponse(
            totalSessions=len(active_sessions),
            scheduled=counts[SessionStatus.SCHEDULED.value],
            completed=counts[SessionStatus.COMPLETED.value],
            cancelled=counts[SessionStatus.CANCELLED.value],
            averageAttendancePercentage=average,
            sessionsNeedingAttendance=needing_attendance,
        )


class SessionFellowService:
    async def list_sessions(self, user: User) -> list[SessionResponse]:
        cohorts = await _assigned_cohorts(user)
        cohort_ids = {cohort.id for cohort in cohorts}
        sessions = [
            session
            for session in await Session.find_all().to_list()
            if session.cohort_id in cohort_ids and session.status != SessionStatus.ARCHIVED
        ]
        sessions.sort(key=lambda session: (session.session_date, session.start_time))
        return [await _session_response(session) for session in sessions]

    async def get_session(self, user: User, session_id: str) -> SessionResponse:
        cohorts = await _assigned_cohorts(user)
        cohort_ids = {cohort.id for cohort in cohorts}
        session = await Session.get(_parse_oid(session_id, "session"))
        if session is None or session.status == SessionStatus.ARCHIVED:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
        if session.cohort_id not in cohort_ids:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "You are not assigned to this cohort.")
        return await _session_response(session)

    async def attendance_history(self, user: User) -> list[FellowAttendanceRow]:
        sessions = await self.list_sessions(user)
        rows: list[FellowAttendanceRow] = []
        for session_response in sessions:
            session = await Session.get(_parse_oid(session_response.id, "session"))
            record = await Attendance.find_one({"session_id": session.id, "fellow_id": user.id}) if session else None
            rows.append(
                FellowAttendanceRow(
                    id=str(record.id) if record else None,
                    session_id=session_response.id,
                    session_title=session_response.title,
                    session_date=session_response.session_date,
                    status=record.status.value if record else ATTENDANCE_STATUS_NOT_MARKED,
                    remarks=record.remarks if record else "",
                    marked_at=record.marked_at if record else None,
                ),
            )
        return rows

    async def summary(self, user: User) -> AttendanceSummary:
        rows = await self.attendance_history(user)
        total = len(rows)
        present = sum(1 for row in rows if row.status == ATTENDANCE_STATUS_PRESENT)
        absent = sum(1 for row in rows if row.status == ATTENDANCE_STATUS_ABSENT)
        late = sum(1 for row in rows if row.status == ATTENDANCE_STATUS_LATE)
        excused = sum(1 for row in rows if row.status == ATTENDANCE_STATUS_EXCUSED)
        attended = present + late + excused
        return AttendanceSummary(
            totalSessions=total,
            present=present,
            absent=absent,
            late=late,
            excused=excused,
            attendancePercentage=round((attended / total) * 100) if total else 0,
        )
