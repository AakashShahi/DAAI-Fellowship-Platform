from datetime import datetime, timezone

from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.models.learning_module_model import LearningModule, LearningModuleStatus
from app.models.learning_progress_model import (
    LearningProgress,
    LearningProgressMilestone,
    LearningProgressModule,
    LearningProgressStatus,
    LearningTrackSlug,
    parse_learning_track_slug,
    user_learning_track_to_slug,
)
from app.models.lesson_model import Lesson, LessonStatus
from app.models.lesson_progress_model import LessonProgress
from app.models.track_model import Track
from app.models.user_model import User
from app.schema.learning_progress_schema import (
    LearningProgressResponse,
    LearningProgressUpdateRequest,
)


TRACK_SLUG_LOOKUPS: dict[LearningTrackSlug, tuple[str, ...]] = {
    LearningTrackSlug.QA: ("qa",),
    LearningTrackSlug.SALESFORCE: ("salesforce",),
    LearningTrackSlug.AWS_PRACTITIONER: ("aws-practitioner",),
    LearningTrackSlug.AWS_ARCHITECT: ("aws-architect", "aws-solutions-architect"),
}


def _status_from_percentage(percentage: int) -> LearningProgressStatus:
    if percentage >= 100:
        return LearningProgressStatus.COMPLETED
    if percentage > 0:
        return LearningProgressStatus.IN_PROGRESS
    return LearningProgressStatus.NOT_STARTED


class LearningProgressService:
    async def get_my_progress(self, user: User) -> LearningProgressResponse:
        learning_track = self._selected_track_slug(user)
        progress = await self._get_or_create_progress(user, learning_track)
        return self.to_response(progress)

    async def get_my_progress_by_track(
        self,
        user: User,
        learning_track: str,
    ) -> LearningProgressResponse:
        requested_track = self._parse_slug(learning_track)
        self._ensure_selected_track(user, requested_track)
        progress = await self._get_or_create_progress(user, requested_track)
        return self.to_response(progress)

    async def update_my_progress(
        self,
        user: User,
        data: LearningProgressUpdateRequest,
    ) -> LearningProgressResponse:
        self._ensure_selected_track(user, data.learning_track)
        progress = await self._get_or_create_progress(user, data.learning_track)
        fields_set = data.model_fields_set

        if "modules" in fields_set and data.modules is not None:
            progress.modules_progress = [
                LearningProgressModule(
                    module_id=module.module_id,
                    title=module.title,
                    status=module.status,
                    completion_percentage=module.completion_percentage,
                )
                for module in data.modules
            ]

        if "milestones" in fields_set and data.milestones is not None:
            progress.milestones = [
                LearningProgressMilestone(
                    title=milestone.title,
                    status=milestone.status,
                )
                for milestone in data.milestones
            ]

        if data.completion_percentage is not None:
            progress.completion_percentage = data.completion_percentage
        elif "modules" in fields_set:
            progress.completion_percentage = self._completion_from_modules(
                progress.modules_progress,
            )

        progress.status = data.status or _status_from_percentage(
            progress.completion_percentage,
        )
        progress.updated_at = datetime.now(timezone.utc)
        await progress.save()

        return self.to_response(progress)

    async def sync_progress_for_track(self, user: User, track: Track) -> None:
        try:
            learning_track = self._parse_slug(track.slug)
        except HTTPException:
            return

        progress = await self._get_or_create_progress(user, learning_track)
        catalog_progress = await self._build_catalog_progress(user, learning_track)
        if catalog_progress is None:
            return

        modules, completion_percentage = catalog_progress
        progress.modules_progress = modules
        progress.completion_percentage = completion_percentage
        progress.status = _status_from_percentage(completion_percentage)
        progress.updated_at = datetime.now(timezone.utc)
        await progress.save()

    async def _get_or_create_progress(
        self,
        user: User,
        learning_track: LearningTrackSlug,
    ) -> LearningProgress:
        progress = await LearningProgress.find_one(
            {
                "fellow_id": user.id,
                "learning_track": learning_track.value,
            },
        )
        catalog_progress = await self._build_catalog_progress(user, learning_track)
        now = datetime.now(timezone.utc)

        if progress is None:
            modules, completion_percentage = catalog_progress or ([], 0)
            progress = LearningProgress(
                fellow_id=user.id,
                learning_track=learning_track,
                modules_progress=modules,
                completion_percentage=completion_percentage,
                milestones=[],
                status=_status_from_percentage(completion_percentage),
                created_at=now,
                updated_at=now,
            )
            try:
                await progress.insert()
            except DuplicateKeyError:
                existing_progress = await LearningProgress.find_one(
                    {
                        "fellow_id": user.id,
                        "learning_track": learning_track.value,
                    },
                )
                if existing_progress is None:
                    raise
                progress = existing_progress
            return progress

        if catalog_progress is not None:
            modules, completion_percentage = catalog_progress
            progress.modules_progress = modules
            progress.completion_percentage = completion_percentage
            progress.status = _status_from_percentage(completion_percentage)
            progress.updated_at = now
            await progress.save()

        return progress

    async def _build_catalog_progress(
        self,
        user: User,
        learning_track: LearningTrackSlug,
    ) -> tuple[list[LearningProgressModule], int] | None:
        track = await self._find_track_by_slug(learning_track)
        if track is None:
            return None

        modules = await LearningModule.find(
            {
                "track_id": track.id,
                "status": LearningModuleStatus.PUBLISHED.value,
            },
        ).sort(LearningModule.order).to_list()

        module_progress: list[LearningProgressModule] = []
        total_lessons = 0
        completed_lessons = 0

        for module in modules:
            lessons = await Lesson.find(
                {
                    "module_id": module.id,
                    "status": LessonStatus.PUBLISHED.value,
                },
            ).sort(Lesson.order).to_list()
            module_total = len(lessons)
            module_completed = 0

            for lesson in lessons:
                progress = await LessonProgress.find_one(
                    {
                        "fellow_id": user.id,
                        "lesson_id": lesson.id,
                    },
                )
                if progress is not None:
                    module_completed += 1

            total_lessons += module_total
            completed_lessons += module_completed
            module_percentage = (
                round((module_completed / module_total) * 100)
                if module_total
                else 0
            )
            module_progress.append(
                LearningProgressModule(
                    module_id=str(module.id),
                    title=module.title,
                    status=_status_from_percentage(module_percentage),
                    completion_percentage=module_percentage,
                ),
            )

        completion_percentage = (
            round((completed_lessons / total_lessons) * 100)
            if total_lessons
            else 0
        )
        return module_progress, completion_percentage

    async def _find_track_by_slug(self, learning_track: LearningTrackSlug) -> Track | None:
        for slug in TRACK_SLUG_LOOKUPS[learning_track]:
            track = await Track.find_one(Track.slug == slug)
            if track is not None:
                return track

        return None

    @staticmethod
    def _selected_track_slug(user: User) -> LearningTrackSlug:
        learning_track = user_learning_track_to_slug(user.learning_track)
        if learning_track is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Select a learning track before viewing progress",
            )

        return learning_track

    @staticmethod
    def _parse_slug(value: str) -> LearningTrackSlug:
        try:
            return parse_learning_track_slug(value)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Learning track not found",
            ) from exc

    def _ensure_selected_track(
        self,
        user: User,
        requested_track: LearningTrackSlug,
    ) -> None:
        selected_track = self._selected_track_slug(user)
        if selected_track != requested_track:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Learning progress is only available for your selected track",
            )

    @staticmethod
    def _completion_from_modules(modules: list[LearningProgressModule]) -> int:
        if not modules:
            return 0

        return round(
            sum(module.completion_percentage for module in modules) / len(modules),
        )

    @staticmethod
    def to_response(progress: LearningProgress) -> LearningProgressResponse:
        return LearningProgressResponse(
            id=str(progress.id),
            learning_track=progress.learning_track,
            completion_percentage=progress.completion_percentage,
            status=progress.status,
            modules=progress.modules_progress,
            milestones=progress.milestones,
            created_at=progress.created_at,
            updated_at=progress.updated_at,
        )
