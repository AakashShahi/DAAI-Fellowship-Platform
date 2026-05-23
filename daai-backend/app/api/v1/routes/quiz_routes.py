from fastapi import APIRouter, Depends

from app.dependencies.auth_dependency import current_admin, current_user
from app.models.user_model import User
from app.schema.quiz_schema import (
    QuizAttemptResponse,
    QuizAttemptSummaryResponse,
    QuizCategoryResponse,
    QuizCategoryPerformanceResponse,
    QuizQuestionAdminResponse,
    QuizQuestionCreateRequest,
    QuizQuestionResponse,
    QuizQuestionStatusRequest,
    QuizSubmitRequest,
    QuizQuestionUpdateRequest,
)
from app.services.quiz_service import QuizService

router = APIRouter()


@router.get("/categories", response_model=list[QuizCategoryResponse])
async def get_quiz_categories(user: User = Depends(current_user)):
    quiz_service = QuizService()
    return await quiz_service.get_categories(user)


@router.get("/my-attempts", response_model=list[QuizAttemptSummaryResponse])
async def get_my_quiz_attempts(user: User = Depends(current_user)):
    quiz_service = QuizService()
    return await quiz_service.get_my_attempts(str(user.id), user)


@router.get("/my-attempts/{attempt_id}", response_model=QuizAttemptResponse)
async def get_my_quiz_attempt(
    attempt_id: str,
    user: User = Depends(current_user),
):
    quiz_service = QuizService()
    return await quiz_service.get_my_attempt(attempt_id, str(user.id), user)


@router.get("/admin/questions", response_model=list[QuizQuestionAdminResponse])
async def get_admin_quiz_questions(user: User = Depends(current_admin)):
    quiz_service = QuizService()
    return await quiz_service.get_admin_questions()


@router.post("/admin/questions", response_model=QuizQuestionAdminResponse)
async def create_admin_quiz_question(
    payload: QuizQuestionCreateRequest,
    user: User = Depends(current_admin),
):
    quiz_service = QuizService()
    return await quiz_service.create_admin_question(payload)


@router.put(
    "/admin/questions/{question_id}",
    response_model=QuizQuestionAdminResponse,
)
async def update_admin_quiz_question(
    question_id: str,
    payload: QuizQuestionUpdateRequest,
    user: User = Depends(current_admin),
):
    quiz_service = QuizService()
    return await quiz_service.update_admin_question(question_id, payload)


@router.patch(
    "/admin/questions/{question_id}/status",
    response_model=QuizQuestionAdminResponse,
)
async def update_admin_quiz_question_status(
    question_id: str,
    payload: QuizQuestionStatusRequest,
    user: User = Depends(current_admin),
):
    quiz_service = QuizService()
    return await quiz_service.update_admin_question_status(question_id, payload)


@router.get(
    "/admin/performance",
    response_model=list[QuizCategoryPerformanceResponse],
)
async def get_admin_quiz_performance(user: User = Depends(current_admin)):
    quiz_service = QuizService()
    return await quiz_service.get_quiz_performance()


@router.get("/{category}/questions", response_model=list[QuizQuestionResponse])
async def get_quiz_questions(
    category: str,
    user: User = Depends(current_user),
):
    quiz_service = QuizService()
    return await quiz_service.get_questions(category, user)


@router.post("/{category}/submit", response_model=QuizAttemptResponse)
async def submit_quiz(
    category: str,
    payload: QuizSubmitRequest,
    user: User = Depends(current_user),
):
    quiz_service = QuizService()
    return await quiz_service.submit_quiz(category, str(user.id), payload, user)
