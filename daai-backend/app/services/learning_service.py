from datetime import datetime, timezone

from beanie import PydanticObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.models.enrollment_model import Enrollment, EnrollmentStatus
from app.models.learning_module_model import LearningModule, LearningModuleStatus
from app.models.lesson_model import Lesson, LessonStatus
from app.models.lesson_progress_model import LessonProgress, LessonProgressStatus
from app.models.track_model import Track
from app.models.user_model import User
from app.schema.learning_schema import (
    FellowLearningSummaryResponse,
    FellowModuleDetailResponse,
    FellowModulesListResponse,
    LearningModuleCreate,
    LearningModuleFellowSummary,
    LearningModuleResponse,
    LearningModuleUpdate,
    LessonCompleteResponse,
    LessonCreate,
    LessonFellowDetail,
    LessonFellowSummary,
    LessonResponse,
    LessonUpdate,
)


def _parse_oid(value: str, field: str) -> PydanticObjectId:
    try:
        return PydanticObjectId(value)
    except (InvalidId, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {field} id",
        ) from exc


def _module_response(m: LearningModule) -> LearningModuleResponse:
    return LearningModuleResponse(
        id=str(m.id),
        title=m.title,
        description=m.description,
        track_id=str(m.track_id),
        order=m.order,
        status=m.status,
        created_at=m.created_at,
        updated_at=m.updated_at,
    )


def _lesson_response(lesson: Lesson) -> LessonResponse:
    return LessonResponse(
        id=str(lesson.id),
        title=lesson.title,
        content=lesson.content,
        video_url=lesson.video_url,
        resource_url=lesson.resource_url,
        module_id=str(lesson.module_id),
        track_id=str(lesson.track_id),
        order=lesson.order,
        estimated_minutes=lesson.estimated_minutes,
        status=lesson.status,
        created_at=lesson.created_at,
        updated_at=lesson.updated_at,
    )


async def _active_enrollment_track_id(user: User) -> PydanticObjectId | None:
    e = await Enrollment.find_one(
        {
            "fellow_id": user.id,
            "status": EnrollmentStatus.ACTIVE.value,
        },
    )
    return e.track_id if e else None


class ModuleAdminService:
    async def list_modules(self, track_id: str | None) -> list[LearningModuleResponse]:
        if track_id:
            oid = _parse_oid(track_id, "track")
            modules = await LearningModule.find(LearningModule.track_id == oid).sort(
                LearningModule.order,
            ).to_list()
        else:
            modules = await LearningModule.find_all().sort(LearningModule.order).to_list()
        return [_module_response(m) for m in modules]

    async def get_module(self, module_id: str) -> LearningModuleResponse:
        oid = _parse_oid(module_id, "module")
        m = await LearningModule.get(oid)
        if m is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Module not found")
        return _module_response(m)

    async def create_module(self, data: LearningModuleCreate) -> LearningModuleResponse:
        track_oid = _parse_oid(data.track_id, "track")
        track = await Track.get(track_oid)
        if track is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Track not found")
        now = datetime.now(timezone.utc)
        m = LearningModule(
            title=data.title.strip(),
            description=data.description.strip(),
            track_id=track_oid,
            order=data.order,
            status=data.status,
            created_at=now,
            updated_at=now,
        )
        await m.insert()
        return _module_response(m)

    async def update_module(
        self,
        module_id: str,
        data: LearningModuleUpdate,
    ) -> LearningModuleResponse:
        oid = _parse_oid(module_id, "module")
        m = await LearningModule.get(oid)
        if m is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Module not found")
        if data.title is not None:
            m.title = data.title.strip()
        if data.description is not None:
            m.description = data.description.strip()
        if data.order is not None:
            m.order = data.order
        if data.status is not None:
            m.status = data.status
        m.updated_at = datetime.now(timezone.utc)
        await m.save()
        return _module_response(m)

    async def delete_module(self, module_id: str) -> None:
        oid = _parse_oid(module_id, "module")
        m = await LearningModule.get(oid)
        if m is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Module not found")
        lesson_count = await Lesson.find(Lesson.module_id == oid).count()
        if lesson_count > 0:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Cannot delete a module that still has lessons",
            )
        await m.delete()


class LessonAdminService:
    async def list_lessons(
        self,
        module_id: str | None,
        track_id: str | None,
    ) -> list[LessonResponse]:
        if module_id:
            oid = _parse_oid(module_id, "module")
            lessons = await Lesson.find(Lesson.module_id == oid).sort(Lesson.order).to_list()
        elif track_id:
            toid = _parse_oid(track_id, "track")
            lessons = await Lesson.find(Lesson.track_id == toid).sort(Lesson.order).to_list()
        else:
            lessons = await Lesson.find_all().sort(Lesson.order).to_list()
        return [_lesson_response(lesson) for lesson in lessons]

    async def get_lesson(self, lesson_id: str) -> LessonResponse:
        oid = _parse_oid(lesson_id, "lesson")
        lesson = await Lesson.get(oid)
        if lesson is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Lesson not found")
        return _lesson_response(lesson)

    async def create_lesson(self, data: LessonCreate) -> LessonResponse:
        module_oid = _parse_oid(data.module_id, "module")
        module = await LearningModule.get(module_oid)
        if module is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Module not found")
        now = datetime.now(timezone.utc)
        lesson = Lesson(
            title=data.title.strip(),
            content=data.content,
            video_url=data.video_url.strip(),
            resource_url=data.resource_url.strip(),
            module_id=module_oid,
            track_id=module.track_id,
            order=data.order,
            estimated_minutes=data.estimated_minutes,
            status=data.status,
            created_at=now,
            updated_at=now,
        )
        await lesson.insert()
        return _lesson_response(lesson)

    async def update_lesson(self, lesson_id: str, data: LessonUpdate) -> LessonResponse:
        oid = _parse_oid(lesson_id, "lesson")
        lesson = await Lesson.get(oid)
        if lesson is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Lesson not found")
        if data.title is not None:
            lesson.title = data.title.strip()
        if data.content is not None:
            lesson.content = data.content
        if data.video_url is not None:
            lesson.video_url = data.video_url.strip()
        if data.resource_url is not None:
            lesson.resource_url = data.resource_url.strip()
        if data.order is not None:
            lesson.order = data.order
        if data.estimated_minutes is not None:
            lesson.estimated_minutes = data.estimated_minutes
        if data.status is not None:
            lesson.status = data.status
        if data.module_id is not None:
            new_mod = _parse_oid(data.module_id, "module")
            module = await LearningModule.get(new_mod)
            if module is None:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Module not found")
            lesson.module_id = new_mod
            lesson.track_id = module.track_id
        lesson.updated_at = datetime.now(timezone.utc)
        await lesson.save()
        return _lesson_response(lesson)

    async def delete_lesson(self, lesson_id: str) -> None:
        oid = _parse_oid(lesson_id, "lesson")
        lesson = await Lesson.get(oid)
        if lesson is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Lesson not found")
        progress_count = await LessonProgress.find(LessonProgress.lesson_id == oid).count()
        if progress_count > 0:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Cannot delete a lesson that has fellow progress recorded",
            )
        await lesson.delete()


class FellowLearningService:
    async def list_modules(self, user: User) -> FellowModulesListResponse:
        track_id = await _active_enrollment_track_id(user)
        if track_id is None:
            return FellowModulesListResponse(enrolled=False, track_id=None, modules=[])

        modules = await LearningModule.find(
            {
                "track_id": track_id,
                "status": LearningModuleStatus.PUBLISHED.value,
            },
        ).sort(LearningModule.order).to_list()

        summaries: list[LearningModuleFellowSummary] = []
        for m in modules:
            lessons = await Lesson.find(
                {
                    "module_id": m.id,
                    "status": LessonStatus.PUBLISHED.value,
                },
            ).sort(Lesson.order).to_list()
            completed = 0
            for lesson in lessons:
                p = await LessonProgress.find_one(
                    {
                        "fellow_id": user.id,
                        "lesson_id": lesson.id,
                    },
                )
                if p:
                    completed += 1
            summaries.append(
                LearningModuleFellowSummary(
                    id=str(m.id),
                    title=m.title,
                    description=m.description,
                    order=m.order,
                    status=m.status,
                    lesson_count=len(lessons),
                    completed_lesson_count=completed,
                ),
            )

        return FellowModulesListResponse(
            enrolled=True,
            track_id=str(track_id),
            modules=summaries,
        )

    async def get_module_detail(self, user: User, module_id: str) -> FellowModuleDetailResponse:
        track_id = await _active_enrollment_track_id(user)
        if track_id is None:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                "Active enrollment is required to view modules",
            )
        oid = _parse_oid(module_id, "module")
        m = await LearningModule.get(oid)
        if m is None or m.track_id != track_id or m.status != LearningModuleStatus.PUBLISHED:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Module not found")

        lessons = await Lesson.find(
            {
                "module_id": m.id,
                "status": LessonStatus.PUBLISHED.value,
            },
        ).sort(Lesson.order).to_list()

        lesson_rows: list[LessonFellowSummary] = []
        for lesson in lessons:
            p = await LessonProgress.find_one(
                {"fellow_id": user.id, "lesson_id": lesson.id},
            )
            lesson_rows.append(
                LessonFellowSummary(
                    id=str(lesson.id),
                    title=lesson.title,
                    order=lesson.order,
                    estimated_minutes=lesson.estimated_minutes,
                    status=lesson.status,
                    completed=p is not None,
                ),
            )

        return FellowModuleDetailResponse(
            module=_module_response(m),
            lessons=lesson_rows,
        )

    async def get_lesson_detail(self, user: User, lesson_id: str) -> LessonFellowDetail:
        track_id = await _active_enrollment_track_id(user)
        if track_id is None:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                "Active enrollment is required to view lessons",
            )
        oid = _parse_oid(lesson_id, "lesson")
        lesson = await Lesson.get(oid)
        if (
            lesson is None
            or lesson.track_id != track_id
            or lesson.status != LessonStatus.PUBLISHED
        ):
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Lesson not found")

        p = await LessonProgress.find_one({"fellow_id": user.id, "lesson_id": lesson.id})
        return LessonFellowDetail(
            id=str(lesson.id),
            title=lesson.title,
            content=lesson.content,
            video_url=lesson.video_url,
            resource_url=lesson.resource_url,
            module_id=str(lesson.module_id),
            track_id=str(lesson.track_id),
            order=lesson.order,
            estimated_minutes=lesson.estimated_minutes,
            status=lesson.status,
            completed=p is not None,
        )

    async def complete_lesson(self, user: User, lesson_id: str) -> LessonCompleteResponse:
        track_id = await _active_enrollment_track_id(user)
        if track_id is None:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                "Active enrollment is required to complete lessons",
            )
        oid = _parse_oid(lesson_id, "lesson")
        lesson = await Lesson.get(oid)
        if (
            lesson is None
            or lesson.track_id != track_id
            or lesson.status != LessonStatus.PUBLISHED
        ):
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Lesson is not part of your enrolled track or is not available",
            )

        existing = await LessonProgress.find_one(
            {"fellow_id": user.id, "lesson_id": lesson.id},
        )
        now = datetime.now(timezone.utc)
        if existing:
            return LessonCompleteResponse(ok=True, completed_at=existing.completed_at)

        module = await LearningModule.get(lesson.module_id)
        if module is None:
            raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Invalid module")

        progress = LessonProgress(
            fellow_id=user.id,
            track_id=track_id,
            module_id=lesson.module_id,
            lesson_id=lesson.id,
            status=LessonProgressStatus.COMPLETED,
            completed_at=now,
            created_at=now,
            updated_at=now,
        )
        try:
            await progress.insert()
        except DuplicateKeyError as exc:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Lesson progress already recorded",
            ) from exc

        return LessonCompleteResponse(ok=True, completed_at=now)

    async def learning_summary(self, user: User) -> FellowLearningSummaryResponse:
        track_id = await _active_enrollment_track_id(user)
        if track_id is None:
            return FellowLearningSummaryResponse(
                enrolled=False,
                total_lessons=0,
                completed_lessons=0,
                total_modules=0,
                modules_fully_completed=0,
            )

        modules = await LearningModule.find(
            {
                "track_id": track_id,
                "status": LearningModuleStatus.PUBLISHED.value,
            },
        ).to_list()

        total_lessons = 0
        completed_lessons = 0
        modules_fully_completed = 0
        total_modules_with_lessons = 0

        for m in modules:
            lessons = await Lesson.find(
                {
                    "module_id": m.id,
                    "status": LessonStatus.PUBLISHED.value,
                },
            ).to_list()
            if not lessons:
                continue
            total_modules_with_lessons += 1
            total_lessons += len(lessons)
            mod_completed = 0
            for lesson in lessons:
                p = await LessonProgress.find_one(
                    {"fellow_id": user.id, "lesson_id": lesson.id},
                )
                if p:
                    completed_lessons += 1
                    mod_completed += 1
            if mod_completed == len(lessons):
                modules_fully_completed += 1

        return FellowLearningSummaryResponse(
            enrolled=True,
            total_lessons=total_lessons,
            completed_lessons=completed_lessons,
            total_modules=total_modules_with_lessons,
            modules_fully_completed=modules_fully_completed,
        )
