from datetime import datetime, timezone
from enum import Enum

from beanie import Document
from pydantic import BaseModel, Field
from pymongo import ASCENDING, IndexModel


class QuizCategory(str, Enum):
    QA = "qa"
    SALESFORCE = "salesforce"
    AWS_PRACTITIONER = "aws-practitioner"
    AWS_SOLUTIONS_ARCHITECT = "aws-solutions-architect"


class QuizDifficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"


QUIZ_CATEGORY_LABELS: dict[QuizCategory, str] = {
    QuizCategory.QA: "QA",
    QuizCategory.SALESFORCE: "Salesforce",
    QuizCategory.AWS_PRACTITIONER: "AWS Practitioner",
    QuizCategory.AWS_SOLUTIONS_ARCHITECT: "AWS Solutions Architect",
}

QUIZ_CATEGORY_DESCRIPTIONS: dict[QuizCategory, str] = {
    QuizCategory.QA: "Build confidence with software testing, bug reporting, and quality basics.",
    QuizCategory.SALESFORCE: "Practice core CRM concepts, objects, automation, and reporting fundamentals.",
    QuizCategory.AWS_PRACTITIONER: "Review cloud basics, AWS services, security, pricing, and shared responsibility.",
    QuizCategory.AWS_SOLUTIONS_ARCHITECT: "Strengthen architecture decisions for resilient, scalable AWS workloads.",
}

QUIZ_CATEGORY_DIFFICULTY_LABELS: dict[QuizCategory, str] = {
    QuizCategory.QA: "Beginner",
    QuizCategory.SALESFORCE: "Beginner",
    QuizCategory.AWS_PRACTITIONER: "Foundational",
    QuizCategory.AWS_SOLUTIONS_ARCHITECT: "Intermediate",
}


class QuizQuestion(Document):
    category: QuizCategory
    question: str = Field(min_length=1)
    options: list[str] = Field(min_length=2)
    correct_answer: str = Field(min_length=1)
    explanation: str = ""
    difficulty: QuizDifficulty = QuizDifficulty.EASY
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "quiz_questions"
        indexes = [
            IndexModel([("category", ASCENDING)]),
            IndexModel([("category", ASCENDING), ("question", ASCENDING)], unique=True),
        ]


class QuizAnswerResult(BaseModel):
    question_id: str
    question: str
    selected_answer: str
    correct_answer: str
    explanation: str = ""
    is_correct: bool


class QuizAttempt(Document):
    user_id: str
    category: QuizCategory
    score: int = Field(ge=0)
    total_questions: int = Field(gt=0)
    answers: list[QuizAnswerResult]
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "quiz_attempts"
        indexes = [
            IndexModel([("user_id", ASCENDING)]),
            IndexModel([("user_id", ASCENDING), ("submitted_at", ASCENDING)]),
        ]
