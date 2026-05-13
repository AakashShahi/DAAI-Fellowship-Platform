from fastapi import APIRouter, Depends

from app.dependencies.auth_dependency import current_user
from app.models.user_model import User
from app.schema.quiz_schema import (
    QuizAttemptResponse,
    QuizAttemptSummaryResponse,
    QuizCategoryResponse,
    QuizQuestionResponse,
    QuizSubmitRequest,
)
from app.services.quiz_service import QuizService

router = APIRouter()


@router.get("/categories", response_model=list[QuizCategoryResponse])
async def get_quiz_categories(user: User = Depends(current_user)):
    quiz_service = QuizService()
    return await quiz_service.get_categories()


@router.get("/my-attempts", response_model=list[QuizAttemptSummaryResponse])
async def get_my_quiz_attempts(user: User = Depends(current_user)):
    quiz_service = QuizService()
    return await quiz_service.get_my_attempts(str(user.id))


@router.get("/my-attempts/{attempt_id}", response_model=QuizAttemptResponse)
async def get_my_quiz_attempt(
    attempt_id: str,
    user: User = Depends(current_user),
):
    quiz_service = QuizService()
    return await quiz_service.get_my_attempt(attempt_id, str(user.id))


@router.get("/{category}/questions", response_model=list[QuizQuestionResponse])
async def get_quiz_questions(
    category: str,
    user: User = Depends(current_user),
):
    quiz_service = QuizService()
    return await quiz_service.get_questions(category)


@router.post("/{category}/submit", response_model=QuizAttemptResponse)
async def submit_quiz(
    category: str,
    payload: QuizSubmitRequest,
    user: User = Depends(current_user),
):
    quiz_service = QuizService()
    return await quiz_service.submit_quiz(category, str(user.id), payload)
