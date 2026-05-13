from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.models.quiz_model import (
    QUIZ_CATEGORY_DESCRIPTIONS,
    QUIZ_CATEGORY_DIFFICULTY_LABELS,
    QUIZ_CATEGORY_LABELS,
    QuizAnswerResult,
    QuizAttempt,
    QuizCategory,
    QuizDifficulty,
    QuizQuestion,
)
from app.repositories.quiz_repository import QuizRepository
from app.schema.quiz_schema import (
    QuizAnswerResultResponse,
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

PASSING_PERCENTAGE = 70


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
                description=QUIZ_CATEGORY_DESCRIPTIONS[category],
                difficulty_label=QUIZ_CATEGORY_DIFFICULTY_LABELS[category],
            )
            for category in QuizCategory
        ]

    async def get_questions(self, category: str) -> list[QuizQuestionResponse]:
        quiz_category = self.parse_category(category)
        questions = await self.quiz_repository.get_questions_by_category(quiz_category)

        return [self.to_question_response(question) for question in questions]

    async def get_admin_questions(self) -> list[QuizQuestionAdminResponse]:
        questions = await self.quiz_repository.get_all_questions()
        return [self.to_admin_question_response(question) for question in questions]

    async def create_admin_question(
        self,
        payload: QuizQuestionCreateRequest,
    ) -> QuizQuestionAdminResponse:
        quiz_category = self.parse_category(payload.category)
        difficulty = QuizDifficulty(payload.difficulty)
        self.validate_question_options(payload.options, payload.correct_answer)

        try:
            question = await self.quiz_repository.create_question(
                QuizQuestion(
                    category=quiz_category,
                    question=payload.question,
                    options=payload.options,
                    correct_answer=payload.correct_answer,
                    explanation=payload.explanation,
                    difficulty=difficulty,
                    is_active=payload.is_active,
                )
            )
        except DuplicateKeyError as exc:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A question with this text already exists in this category",
            ) from exc

        return self.to_admin_question_response(question)

    async def update_admin_question(
        self,
        question_id: str,
        payload: QuizQuestionUpdateRequest,
    ) -> QuizQuestionAdminResponse:
        question = await self.get_existing_question(question_id)
        update_data = payload.dict(exclude_unset=True)

        if "category" in update_data:
            question.category = self.parse_category(update_data["category"])
        if "question" in update_data:
            question.question = update_data["question"]
        if "options" in update_data:
            question.options = update_data["options"]
        if "correct_answer" in update_data:
            question.correct_answer = update_data["correct_answer"]
        if "explanation" in update_data:
            question.explanation = update_data["explanation"]
        if "difficulty" in update_data:
            question.difficulty = QuizDifficulty(update_data["difficulty"])
        if "is_active" in update_data:
            question.is_active = update_data["is_active"]

        self.validate_question_options(question.options, question.correct_answer)

        try:
            saved_question = await self.quiz_repository.save_question(question)
        except DuplicateKeyError as exc:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A question with this text already exists in this category",
            ) from exc

        return self.to_admin_question_response(saved_question)

    async def update_admin_question_status(
        self,
        question_id: str,
        payload: QuizQuestionStatusRequest,
    ) -> QuizQuestionAdminResponse:
        question = await self.get_existing_question(question_id)
        question.is_active = payload.is_active
        saved_question = await self.quiz_repository.save_question(question)
        return self.to_admin_question_response(saved_question)

    async def get_quiz_performance(self) -> list[QuizCategoryPerformanceResponse]:
        questions = await self.quiz_repository.get_all_questions()
        attempts = await self.quiz_repository.get_all_attempts()

        performance: list[QuizCategoryPerformanceResponse] = []
        for category in QuizCategory:
            category_questions = [
                question for question in questions if question.category == category
            ]
            category_attempts = [
                attempt for attempt in attempts if attempt.category == category
            ]
            percentages = [
                round((attempt.score / attempt.total_questions) * 100)
                for attempt in category_attempts
            ]
            passed_attempts = [
                percentage
                for percentage in percentages
                if percentage >= PASSING_PERCENTAGE
            ]

            performance.append(
                QuizCategoryPerformanceResponse(
                    category=category.value,
                    category_title=QUIZ_CATEGORY_LABELS[category],
                    total_questions=len(category_questions),
                    active_questions=sum(
                        1 for question in category_questions if question.is_active
                    ),
                    attempts=len(category_attempts),
                    average_percentage=round(sum(percentages) / len(percentages))
                    if percentages
                    else 0,
                    pass_rate=round((len(passed_attempts) / len(percentages)) * 100)
                    if percentages
                    else 0,
                )
            )

        return performance

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
                    explanation=question.explanation,
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
    def to_admin_question_response(
        question: QuizQuestion,
    ) -> QuizQuestionAdminResponse:
        return QuizQuestionAdminResponse(
            id=str(question.id),
            category=question.category.value,
            question=question.question,
            options=question.options,
            correct_answer=question.correct_answer,
            explanation=question.explanation,
            difficulty=question.difficulty.value,
            is_active=question.is_active,
        )

    async def get_existing_question(self, question_id: str) -> QuizQuestion:
        question = await self.quiz_repository.get_question_by_id(question_id)
        if question is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz question not found",
            )

        return question

    @staticmethod
    def validate_question_options(options: list[str], correct_answer: str) -> None:
        normalized_options = [option.strip() for option in options]
        if any(not option for option in normalized_options):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Options cannot be empty",
            )

        if len(set(normalized_options)) != len(normalized_options):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Options must be unique",
            )

        if correct_answer not in options:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Correct answer must match one of the options",
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
            answers=[
                QuizAnswerResultResponse(
                    question_id=answer.question_id,
                    question=answer.question,
                    selected_answer=answer.selected_answer,
                    correct_answer=answer.correct_answer,
                    explanation=answer.explanation,
                    is_correct=answer.is_correct,
                )
                for answer in attempt.answers
            ],
            submitted_at=attempt.submitted_at,
        )
