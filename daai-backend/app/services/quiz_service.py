from fastapi import HTTPException, status

from app.models.quiz_model import (
    QUIZ_CATEGORY_LABELS,
    QuizAnswerResult,
    QuizAttempt,
    QuizCategory,
    QuizQuestion,
)
from app.repositories.quiz_repository import QuizRepository
from app.schema.quiz_schema import (
    QuizAttemptResponse,
    QuizAttemptSummaryResponse,
    QuizCategoryResponse,
    QuizQuestionResponse,
    QuizSubmitRequest,
)


class QuizService:
    def __init__(self, quiz_repository: QuizRepository | None = None):
        self.quiz_repository = quiz_repository or QuizRepository()

    @staticmethod
    def parse_category(category: str) -> QuizCategory:
        normalized_category = category.strip().lower()

        for quiz_category in QuizCategory:
            if normalized_category == quiz_category.value:
                return quiz_category

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz category not found",
        )

    async def get_categories(self) -> list[QuizCategoryResponse]:
        await self.quiz_repository.ensure_default_questions()
        return [
            QuizCategoryResponse(
                slug=category.value,
                title=QUIZ_CATEGORY_LABELS[category],
            )
            for category in QuizCategory
        ]

    async def get_questions(self, category: str) -> list[QuizQuestionResponse]:
        quiz_category = self.parse_category(category)
        questions = await self.quiz_repository.get_questions_by_category(quiz_category)

        return [self.to_question_response(question) for question in questions]

    async def submit_quiz(
        self,
        category: str,
        user_id: str,
        payload: QuizSubmitRequest,
    ) -> QuizAttemptResponse:
        quiz_category = self.parse_category(category)
        questions = await self.quiz_repository.get_questions_by_category(quiz_category)

        if not questions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No questions found for this category",
            )

        question_ids = {str(question.id) for question in questions}
        submitted_question_ids = set(payload.selected_answers.keys())

        if submitted_question_ids != question_ids:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Submit one answer for every quiz question",
            )

        answers: list[QuizAnswerResult] = []
        for question in questions:
            selected_answer = payload.selected_answers[str(question.id)]
            if selected_answer not in question.options:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Selected answer is not a valid option",
                )

            answers.append(
                QuizAnswerResult(
                    question_id=str(question.id),
                    question=question.question,
                    selected_answer=selected_answer,
                    correct_answer=question.correct_answer,
                    is_correct=selected_answer == question.correct_answer,
                )
            )

        score = sum(1 for answer in answers if answer.is_correct)
        attempt = await self.quiz_repository.create_attempt(
            QuizAttempt(
                user_id=user_id,
                category=quiz_category,
                score=score,
                total_questions=len(questions),
                answers=answers,
            )
        )

        return self.to_attempt_response(attempt)

    async def get_my_attempts(self, user_id: str) -> list[QuizAttemptSummaryResponse]:
        attempts = await self.quiz_repository.get_attempts_by_user(user_id)
        return [self.to_attempt_summary_response(attempt) for attempt in attempts]

    async def get_my_attempt(
        self,
        attempt_id: str,
        user_id: str,
    ) -> QuizAttemptResponse:
        attempt = await self.quiz_repository.get_attempt_by_id(attempt_id, user_id)
        if attempt is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz attempt not found",
            )

        return self.to_attempt_response(attempt)

    @staticmethod
    def to_question_response(question: QuizQuestion) -> QuizQuestionResponse:
        return QuizQuestionResponse(
            id=str(question.id),
            category=question.category.value,
            question=question.question,
            options=question.options,
        )

    @staticmethod
    def to_attempt_summary_response(
        attempt: QuizAttempt,
    ) -> QuizAttemptSummaryResponse:
        return QuizAttemptSummaryResponse(
            id=str(attempt.id),
            category=attempt.category.value,
            category_title=QUIZ_CATEGORY_LABELS[attempt.category],
            score=attempt.score,
            total_questions=attempt.total_questions,
            submitted_at=attempt.submitted_at,
        )

    @staticmethod
    def to_attempt_response(attempt: QuizAttempt) -> QuizAttemptResponse:
        return QuizAttemptResponse(
            id=str(attempt.id),
            category=attempt.category.value,
            category_title=QUIZ_CATEGORY_LABELS[attempt.category],
            score=attempt.score,
            total_questions=attempt.total_questions,
            answers=attempt.answers,
            submitted_at=attempt.submitted_at,
        )
