from beanie import PydanticObjectId
from bson.errors import InvalidId
from pymongo.errors import DuplicateKeyError

from app.data.quiz_seed import DEFAULT_QUIZ_QUESTIONS
from app.models.quiz_model import QuizAttempt, QuizCategory, QuizQuestion


class QuizRepository:
    async def ensure_default_questions(self) -> None:
        for question_data in DEFAULT_QUIZ_QUESTIONS:
            existing_question = await QuizQuestion.find_one(
                QuizQuestion.category == question_data["category"],
                QuizQuestion.question == question_data["question"],
            )
            if existing_question:
                existing_question.options = question_data["options"]
                existing_question.correct_answer = question_data["correct_answer"]
                existing_question.explanation = question_data["explanation"]
                existing_question.difficulty = question_data["difficulty"]
                existing_question.is_active = question_data["is_active"]
                await existing_question.save()
                continue

            try:
                await QuizQuestion(**question_data).insert()
            except DuplicateKeyError:
                continue

    async def get_questions_by_category(
        self,
        category: QuizCategory,
    ) -> list[QuizQuestion]:
        await self.ensure_default_questions()
        return await QuizQuestion.find(
            QuizQuestion.category == category,
            QuizQuestion.is_active == True,  # noqa: E712
        ).to_list()

    async def get_all_questions(self) -> list[QuizQuestion]:
        await self.ensure_default_questions()
        return await QuizQuestion.find_all().sort("category", "question").to_list()

    async def get_question_by_id(self, question_id: str) -> QuizQuestion | None:
        try:
            object_id = PydanticObjectId(question_id)
        except InvalidId:
            return None

        return await QuizQuestion.get(object_id)

    async def create_question(self, question: QuizQuestion) -> QuizQuestion:
        await question.insert()
        return question

    async def save_question(self, question: QuizQuestion) -> QuizQuestion:
        await question.save()
        return question

    async def get_all_attempts(self) -> list[QuizAttempt]:
        return await QuizAttempt.find_all().to_list()

    async def create_attempt(self, attempt: QuizAttempt) -> QuizAttempt:
        await attempt.insert()
        return attempt

    async def get_attempts_by_user(self, user_id: str) -> list[QuizAttempt]:
        return await QuizAttempt.find(QuizAttempt.user_id == user_id).sort(
            "-submitted_at",
        ).to_list()

    async def get_attempt_by_id(
        self,
        attempt_id: str,
        user_id: str,
    ) -> QuizAttempt | None:
        try:
            object_id = PydanticObjectId(attempt_id)
        except InvalidId:
            return None

        return await QuizAttempt.find_one(
            QuizAttempt.id == object_id,
            QuizAttempt.user_id == user_id,
        )
