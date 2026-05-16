from datetime import datetime, timezone

from beanie import PydanticObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status

from app.constants.curriculum import (
    MODEL_LESSON_STATUS_TO_IS_PUBLISHED,
    MODEL_MODULE_STATUS_TO_API,
    MODULE_STATUS_ARCHIVED,
    MODULE_STATUS_DRAFT,
    MODULE_STATUS_PUBLISHED,
    MODULE_STATUS_TO_MODEL,
    MODULE_STATUS_VALUES,
)
from app.constants.learning_tracks import (
    LEARNING_TRACK_TO_SELECTED_TRACK,
    SELECTED_TRACK_VALUES,
)
from app.models.learning_module_model import LearningModule, LearningModuleStatus
from app.models.lesson_model import Lesson, LessonResourceLink, LessonStatus
from app.models.lesson_progress_model import LessonProgress, LessonProgressStatus
from app.models.user_model import User
from app.schema.curriculum_schema import (
    CurriculumModuleCreate,
    CurriculumModuleResponse,
    CurriculumModuleSummary,
    CurriculumModuleUpdate,
    CurriculumStatsResponse,
    FellowLessonDetail,
    FellowLessonSummary,
    FellowModuleDetail,
    FellowModuleSummary,
    FellowProgressSummary,
    LessonCreatePayload,
    LessonResponse,
    LessonUpdatePayload,
    ModuleProgressSummary,
    ProgressUpdateResponse,
)


def _parse_oid(value: str, label: str) -> PydanticObjectId:
    try:
        return PydanticObjectId(value)
    except (InvalidId, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {label} id",
        ) from exc


def _module_status_value(module: LearningModule) -> str:
    return MODEL_MODULE_STATUS_TO_API.get(module.status, MODULE_STATUS_DRAFT)


def _lesson_duration(lesson: Lesson) -> int:
    return lesson.estimated_duration_minutes or lesson.estimated_minutes or 0


def _resource_links(lesson: Lesson) -> list[LessonResourceLink]:
    if lesson.resource_links:
        return lesson.resource_links
    if lesson.resource_url:
        return [
            LessonResourceLink(
                title="Resource",
                url=lesson.resource_url,
                type="external",
            ),
        ]
    return []


def _lesson_response(lesson: Lesson) -> LessonResponse:
    return LessonResponse(
        id=str(lesson.id),
        title=lesson.title,
        description=lesson.description,
        content=lesson.content,
        video_url=lesson.video_url,
        resource_links=_resource_links(lesson),
        order=lesson.order,
        estimated_duration_minutes=_lesson_duration(lesson),
        is_published=lesson.status == LessonStatus.PUBLISHED,
        created_at=lesson.created_at,
        updated_at=lesson.updated_at,
    )


async def _module_lessons(module: LearningModule, published_only: bool = False) -> list[Lesson]:
    query = {"module_id": module.id}
    if published_only:
        query["status"] = LessonStatus.PUBLISHED.value
    lessons = await Lesson.find(query).sort(Lesson.order).to_list()
    return lessons


async def _module_response(module: LearningModule) -> CurriculumModuleResponse:
    lessons = await _module_lessons(module)
    return CurriculumModuleResponse(
        id=str(module.id),
        title=module.title,
        track=module.track,
        description=module.description,
        order=module.order,
        status=_module_status_value(module),
        lessons=[_lesson_response(lesson) for lesson in lessons],
        lessons_count=len(lessons),
        created_at=module.created_at,
        updated_at=module.updated_at,
    )


async def _module_summary(module: LearningModule) -> CurriculumModuleSummary:
    lessons_count = await Lesson.find(Lesson.module_id == module.id).count()
    return CurriculumModuleSummary(
        id=str(module.id),
        title=module.title,
        track=module.track,
        description=module.description,
        order=module.order,
        status=_module_status_value(module),
        lessons_count=lessons_count,
        created_at=module.created_at,
        updated_at=module.updated_at,
    )


async def _ensure_selected_track(user: User) -> str:
    selected_track = LEARNING_TRACK_TO_SELECTED_TRACK.get(user.learning_track)
    if selected_track is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please select a learning track first.",
        )
    return selected_track


async def _get_fellow_module(user: User, module_id: str) -> LearningModule:
    selected_track = await _ensure_selected_track(user)
    module = await LearningModule.get(_parse_oid(module_id, "module"))
    if module is None or module.status != LearningModuleStatus.PUBLISHED:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Module not found")
    if module.track != selected_track:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not enrolled in this track.",
        )
    return module


class CurriculumAdminService:
    async def list_modules(
        self,
        *,
        track: str | None = None,
        status_filter: str | None = None,
    ) -> list[CurriculumModuleSummary]:
        if track and track not in SELECTED_TRACK_VALUES:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid track filter")
        if status_filter and status_filter not in MODULE_STATUS_VALUES:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid status filter")

        modules = await LearningModule.find_all().to_list()
        modules = [module for module in modules if module.track]
        if track:
            modules = [module for module in modules if module.track == track]
        if status_filter:
            modules = [
                module
                for module in modules
                if _module_status_value(module) == status_filter
            ]
        modules.sort(key=lambda module: (module.track or "", module.order, module.title))
        return [await _module_summary(module) for module in modules]

    async def create_module(
        self,
        data: CurriculumModuleCreate,
    ) -> CurriculumModuleResponse:
        now = datetime.now(timezone.utc)
        module = LearningModule(
            title=data.title,
            track=data.track,
            description=data.description,
            order=data.order,
            status=MODULE_STATUS_TO_MODEL[data.status],
            created_at=now,
            updated_at=now,
        )
        await module.insert()
        for lesson_data in data.lessons:
            await self.add_lesson(str(module.id), lesson_data)
        return await self.get_module(str(module.id))

    async def get_module(self, module_id: str) -> CurriculumModuleResponse:
        module = await LearningModule.get(_parse_oid(module_id, "module"))
        if module is None or module.track is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Module not found")
        return await _module_response(module)

    async def update_module(
        self,
        module_id: str,
        data: CurriculumModuleUpdate,
    ) -> CurriculumModuleResponse:
        module = await LearningModule.get(_parse_oid(module_id, "module"))
        if module is None or module.track is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Module not found")

        update_data = data.model_dump(exclude_unset=True, by_alias=False)
        if "title" in update_data:
            module.title = update_data["title"]
        if "track" in update_data:
            module.track = update_data["track"]
            lessons = await _module_lessons(module)
            for lesson in lessons:
                lesson.track = module.track
                lesson.updated_at = datetime.now(timezone.utc)
                await lesson.save()
        if "description" in update_data:
            module.description = update_data["description"] or ""
        if "order" in update_data:
            module.order = update_data["order"]
        if "status" in update_data:
            module.status = MODULE_STATUS_TO_MODEL[update_data["status"]]
        module.updated_at = datetime.now(timezone.utc)
        await module.save()
        return await self.get_module(module_id)

    async def archive_module(self, module_id: str) -> CurriculumModuleSummary:
        module = await LearningModule.get(_parse_oid(module_id, "module"))
        if module is None or module.track is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Module not found")
        module.status = MODULE_STATUS_TO_MODEL[MODULE_STATUS_ARCHIVED]
        module.updated_at = datetime.now(timezone.utc)
        await module.save()
        return await _module_summary(module)

    async def add_lesson(
        self,
        module_id: str,
        data: LessonCreatePayload,
    ) -> LessonResponse:
        module = await LearningModule.get(_parse_oid(module_id, "module"))
        if module is None or module.track is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Module not found")
        now = datetime.now(timezone.utc)
        lesson = Lesson(
            title=data.title,
            description=data.description,
            content=data.content,
            video_url=data.video_url,
            resource_links=[
                LessonResourceLink(**link.model_dump()) for link in data.resource_links
            ],
            module_id=module.id,
            track=module.track,
            order=data.order,
            estimated_minutes=data.estimated_duration_minutes,
            estimated_duration_minutes=data.estimated_duration_minutes,
            status=LessonStatus.PUBLISHED if data.is_published else LessonStatus.DRAFT,
            created_at=now,
            updated_at=now,
        )
        await lesson.insert()
        return _lesson_response(lesson)

    async def update_lesson(
        self,
        module_id: str,
        lesson_id: str,
        data: LessonUpdatePayload,
    ) -> LessonResponse:
        module = await LearningModule.get(_parse_oid(module_id, "module"))
        lesson = await Lesson.get(_parse_oid(lesson_id, "lesson"))
        if module is None or module.track is None or lesson is None or lesson.module_id != module.id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Lesson not found")

        update_data = data.model_dump(exclude_unset=True, by_alias=False)
        if "title" in update_data:
            lesson.title = update_data["title"]
        if "description" in update_data:
            lesson.description = update_data["description"] or ""
        if "content" in update_data:
            lesson.content = update_data["content"] or ""
        if "video_url" in update_data:
            lesson.video_url = update_data["video_url"] or ""
        if "resource_links" in update_data:
            lesson.resource_links = [
                LessonResourceLink(**link) for link in (update_data["resource_links"] or [])
            ]
        if "order" in update_data:
            lesson.order = update_data["order"]
        if "estimated_duration_minutes" in update_data:
            lesson.estimated_duration_minutes = update_data["estimated_duration_minutes"]
            lesson.estimated_minutes = update_data["estimated_duration_minutes"]
        if "is_published" in update_data:
            lesson.status = LessonStatus.PUBLISHED if update_data["is_published"] else LessonStatus.DRAFT
        lesson.updated_at = datetime.now(timezone.utc)
        await lesson.save()
        return _lesson_response(lesson)

    async def delete_lesson(self, module_id: str, lesson_id: str) -> None:
        module = await LearningModule.get(_parse_oid(module_id, "module"))
        lesson = await Lesson.get(_parse_oid(lesson_id, "lesson"))
        if module is None or lesson is None or lesson.module_id != module.id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Lesson not found")
        lesson.status = LessonStatus.ARCHIVED
        lesson.updated_at = datetime.now(timezone.utc)
        await lesson.save()

    async def get_stats(self) -> CurriculumStatsResponse:
        modules = [module for module in await LearningModule.find_all().to_list() if module.track]
        total_lessons = 0
        for module in modules:
            total_lessons += await Lesson.find(Lesson.module_id == module.id).count()
        return CurriculumStatsResponse(
            totalModules=len(modules),
            publishedModules=sum(1 for module in modules if module.status == LearningModuleStatus.PUBLISHED),
            draftModules=sum(1 for module in modules if module.status == LearningModuleStatus.DRAFT),
            archivedModules=sum(1 for module in modules if module.status == LearningModuleStatus.ARCHIVED),
            totalLessons=total_lessons,
        )


class CurriculumFellowService:
    async def list_modules(self, user: User) -> list[FellowModuleSummary]:
        selected_track = await _ensure_selected_track(user)
        modules = await LearningModule.find(
            {"track": selected_track, "status": LearningModuleStatus.PUBLISHED.value},
        ).sort(LearningModule.order).to_list()
        return [await self._module_summary(user, module) for module in modules]

    async def _module_summary(
        self,
        user: User,
        module: LearningModule,
    ) -> FellowModuleSummary:
        lessons = await _module_lessons(module, published_only=True)
        completed = 0
        for lesson in lessons:
            progress = await LessonProgress.find_one(
                {"fellow_id": user.id, "lesson_id": lesson.id},
            )
            if progress and progress.status == LessonProgressStatus.COMPLETED:
                completed += 1
        percentage = round((completed / len(lessons)) * 100) if lessons else 0
        return FellowModuleSummary(
            id=str(module.id),
            title=module.title,
            track=module.track,
            description=module.description,
            order=module.order,
            lesson_count=len(lessons),
            completed_lesson_count=completed,
            completion_percentage=percentage,
        )

    async def get_module(self, user: User, module_id: str) -> FellowModuleDetail:
        module = await _get_fellow_module(user, module_id)
        lessons = await _module_lessons(module, published_only=True)
        lesson_rows = []
        for lesson in lessons:
            progress = await LessonProgress.find_one(
                {"fellow_id": user.id, "lesson_id": lesson.id},
            )
            progress_status = (
                progress.status.value if progress else LessonProgressStatus.NOT_STARTED.value
            )
            lesson_rows.append(
                FellowLessonSummary(
                    id=str(lesson.id),
                    title=lesson.title,
                    description=lesson.description,
                    order=lesson.order,
                    estimated_duration_minutes=_lesson_duration(lesson),
                    progress_status=progress_status,
                    completed=progress_status == LessonProgressStatus.COMPLETED.value,
                ),
            )
        return FellowModuleDetail(
            module=await self._module_summary(user, module),
            lessons=lesson_rows,
        )

    async def get_lesson(
        self,
        user: User,
        module_id: str,
        lesson_id: str,
    ) -> FellowLessonDetail:
        module = await _get_fellow_module(user, module_id)
        lesson = await Lesson.get(_parse_oid(lesson_id, "lesson"))
        if (
            lesson is None
            or lesson.module_id != module.id
            or lesson.status != LessonStatus.PUBLISHED
        ):
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Lesson not found")
        progress = await LessonProgress.find_one(
            {"fellow_id": user.id, "lesson_id": lesson.id},
        )
        progress_status = (
            progress.status.value if progress else LessonProgressStatus.NOT_STARTED.value
        )
        lesson_response = _lesson_response(lesson).model_dump()
        return FellowLessonDetail(
            **lesson_response,
            module_id=str(module.id),
            track=module.track,
            progress_status=progress_status,
            completed=progress_status == LessonProgressStatus.COMPLETED.value,
        )

    async def update_progress(
        self,
        user: User,
        module_id: str,
        lesson_id: str,
        progress_status: str,
    ) -> ProgressUpdateResponse:
        module = await _get_fellow_module(user, module_id)
        lesson = await Lesson.get(_parse_oid(lesson_id, "lesson"))
        if (
            lesson is None
            or lesson.module_id != module.id
            or lesson.status != LessonStatus.PUBLISHED
        ):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Lesson is not available")

        now = datetime.now(timezone.utc)
        progress = await LessonProgress.find_one(
            {"fellow_id": user.id, "lesson_id": lesson.id},
        )
        if progress is None:
            progress = LessonProgress(
                fellow_id=user.id,
                track=module.track,
                module_id=module.id,
                lesson_id=lesson.id,
                created_at=now,
            )

        progress.status = LessonProgressStatus(progress_status)
        progress.completed_at = now if progress.status == LessonProgressStatus.COMPLETED else None
        progress.updated_at = now
        await progress.save() if progress.id else await progress.insert()
        return ProgressUpdateResponse(
            module_id=str(module.id),
            lesson_id=str(lesson.id),
            status=progress.status.value,
            completed_at=progress.completed_at,
        )

    async def progress_summary(self, user: User) -> FellowProgressSummary:
        modules = await self.list_modules(user)
        module_progress = []
        total_lessons = 0
        completed_lessons = 0
        for module in modules:
            total_lessons += module.lesson_count
            completed_lessons += module.completed_lesson_count
            module_progress.append(
                ModuleProgressSummary(
                    module_id=module.id,
                    title=module.title,
                    total_lessons=module.lesson_count,
                    completed_lessons=module.completed_lesson_count,
                    completion_percentage=module.completion_percentage,
                ),
            )
        percentage = round((completed_lessons / total_lessons) * 100) if total_lessons else 0
        return FellowProgressSummary(
            total_modules=len(modules),
            total_lessons=total_lessons,
            completed_lessons=completed_lessons,
            completion_percentage=percentage,
            module_progress=module_progress,
        )
