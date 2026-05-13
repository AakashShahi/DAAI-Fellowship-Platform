from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class QuizCategoryResponse(BaseModel):
    slug: str
    title: str
    description: str
    difficulty_label: str


class QuizQuestionResponse(BaseModel):
    id: str
    category: str
    question: str
    options: list[str]


class QuizQuestionAdminResponse(QuizQuestionResponse):
    correct_answer: str
    explanation: str
    difficulty: str
    is_active: bool


class QuizQuestionCreateRequest(BaseModel):
    category: str
    question: str = Field(min_length=1)
    options: list[str] = Field(min_length=2)
    correct_answer: str = Field(min_length=1)
    explanation: str = ""
    difficulty: Literal["easy", "medium"] = "easy"
    is_active: bool = True


class QuizQuestionUpdateRequest(BaseModel):
    category: str | None = None
    question: str | None = Field(default=None, min_length=1)
    options: list[str] | None = Field(default=None, min_length=2)
    correct_answer: str | None = Field(default=None, min_length=1)
    explanation: str | None = None
    difficulty: Literal["easy", "medium"] | None = None
    is_active: bool | None = None


class QuizQuestionStatusRequest(BaseModel):
    is_active: bool


class QuizCategoryPerformanceResponse(BaseModel):
    category: str
    category_title: str
    total_questions: int
    active_questions: int
    attempts: int
    average_percentage: int
    pass_rate: int


class QuizSubmitRequest(BaseModel):
    selected_answers: dict[str, str] = Field(min_length=1)


class QuizAnswerResultResponse(BaseModel):
    question_id: str
    question: str
    selected_answer: str
    correct_answer: str
    explanation: str = ""
    is_correct: bool


class QuizAttemptResponse(BaseModel):
    id: str
    category: str
    category_title: str
    score: int
    total_questions: int
    answers: list[QuizAnswerResultResponse]
    submitted_at: datetime


class QuizAttemptSummaryResponse(BaseModel):
    id: str
    category: str
    category_title: str
    score: int
    total_questions: int
    submitted_at: datetime
