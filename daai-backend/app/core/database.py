import logging

from beanie import init_beanie
from pymongo import AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase

from app.core.config import settings
from app.models.assignment_model import Assignment
from app.models.attendance_model import Attendance
from app.models.batch_model import Batch
from app.models.enrollment_model import Enrollment
from app.models.learning_module_model import LearningModule
from app.models.lesson_model import Lesson
from app.models.lesson_progress_model import LessonProgress
from app.models.quiz_model import QuizAttempt, QuizQuestion
from app.models.program_cohort_model import ProgramCohort
from app.models.session_model import Session
from app.models.submission_model import Submission
from app.models.track_model import Track
from app.models.user_model import User

logger = logging.getLogger(__name__)

client: AsyncMongoClient | None = None
db: AsyncDatabase | None = None


async def init_db() -> AsyncDatabase:
    global client, db

    client = AsyncMongoClient(
        settings.MONGODB_URL,
        serverSelectionTimeoutMS=settings.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
    )
    db = client[settings.DATABASE_NAME]

    await client.admin.command("ping")
    await init_beanie(
        database=db,
        document_models=[
            User,
            QuizQuestion,
            QuizAttempt,
            Track,
            Batch,
            Enrollment,
            LearningModule,
            Lesson,
            LessonProgress,
            Assignment,
            Submission,
            ProgramCohort,
            Session,
            Attendance,
        ],
    )

    logger.info("MongoDB connected: %s", settings.DATABASE_NAME)
    return db


async def close_mongo_connection():
    global client, db

    if client is not None:
        await client.close()
        client = None
        db = None
        logger.info("MongoDB disconnected")


def get_database() -> AsyncDatabase:
    if db is None:
        raise RuntimeError("Database has not been initialized")

    return db
