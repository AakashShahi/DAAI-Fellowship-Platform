from datetime import datetime

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
