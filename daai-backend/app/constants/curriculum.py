from app.models.learning_module_model import LearningModuleStatus
from app.models.lesson_model import LessonStatus
from app.models.lesson_progress_model import LessonProgressStatus


MODULE_STATUS_DRAFT = "draft"
MODULE_STATUS_PUBLISHED = "published"
MODULE_STATUS_ARCHIVED = "archived"

MODULE_STATUS_VALUES = {
    MODULE_STATUS_DRAFT,
    MODULE_STATUS_PUBLISHED,
    MODULE_STATUS_ARCHIVED,
}

MODULE_STATUS_TO_MODEL = {
    MODULE_STATUS_DRAFT: LearningModuleStatus.DRAFT,
    MODULE_STATUS_PUBLISHED: LearningModuleStatus.PUBLISHED,
    MODULE_STATUS_ARCHIVED: LearningModuleStatus.ARCHIVED,
}

MODEL_MODULE_STATUS_TO_API = {
    LearningModuleStatus.DRAFT: MODULE_STATUS_DRAFT,
    LearningModuleStatus.PUBLISHED: MODULE_STATUS_PUBLISHED,
    LearningModuleStatus.ARCHIVED: MODULE_STATUS_ARCHIVED,
}

LESSON_STATUS_TO_MODEL = {
    False: LessonStatus.DRAFT,
    True: LessonStatus.PUBLISHED,
}

MODEL_LESSON_STATUS_TO_IS_PUBLISHED = {
    LessonStatus.DRAFT: False,
    LessonStatus.PUBLISHED: True,
    LessonStatus.ARCHIVED: False,
}

RESOURCE_TYPE_ARTICLE = "article"
RESOURCE_TYPE_VIDEO = "video"
RESOURCE_TYPE_DOCUMENT = "document"
RESOURCE_TYPE_EXTERNAL = "external"
RESOURCE_TYPE_ASSIGNMENT = "assignment"

RESOURCE_TYPE_VALUES = {
    RESOURCE_TYPE_ARTICLE,
    RESOURCE_TYPE_VIDEO,
    RESOURCE_TYPE_DOCUMENT,
    RESOURCE_TYPE_EXTERNAL,
    RESOURCE_TYPE_ASSIGNMENT,
}

PROGRESS_STATUS_VALUES = {
    LessonProgressStatus.NOT_STARTED.value,
    LessonProgressStatus.IN_PROGRESS.value,
    LessonProgressStatus.COMPLETED.value,
}
