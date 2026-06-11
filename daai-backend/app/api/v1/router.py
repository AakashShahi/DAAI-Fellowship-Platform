from fastapi import APIRouter

from app.api.v1.routes import (
    admin_cohort_routes,
    admin_curriculum_routes,
    admin_staff_routes,
    admin_assignment_v2_routes,
    admin_session_routes,
    application_routes,
    assignment_admin_routes,
    admin_fellow_routes,
    auth_routes,
    batch_routes,
    chatbot_routes,
    enrollment_routes,
    fellow_routes,
    fellows_admin_routes,
    health_routes,
    learning_fellow_routes,
    learning_progress_routes,
    lesson_routes,
    module_routes,
    profile_routes,
    quiz_routes,
    submission_review_routes,
    track_routes,
    dashboard_routes,
)

api_router = APIRouter()

api_router.include_router(
    auth_routes.router,
    prefix="/auth",
    tags=["Authentication"]
)

api_router.include_router(
    application_routes.router,
    prefix="/applications",
    tags=["Applications"],
)

api_router.include_router(
    admin_fellow_routes.router,
    prefix="/admin",
    tags=["Admin Fellow Management"],
)

api_router.include_router(
    admin_cohort_routes.router,
    prefix="/admin",
    tags=["Admin Cohort Management"],
)

api_router.include_router(
    admin_curriculum_routes.router,
    prefix="/admin",
    tags=["Admin Curriculum Management"],
)

api_router.include_router(
    admin_assignment_v2_routes.router,
    prefix="/admin",
    tags=["Admin Assignment Management"],
)

api_router.include_router(
    admin_session_routes.router,
    prefix="/admin",
    tags=["Admin Session Management"],
)

api_router.include_router(
    health_routes.router,
    prefix="/health",
    tags=["Health"]
)

api_router.include_router(
    quiz_routes.router,
    prefix="/quizzes",
    tags=["Quizzes"]
)

api_router.include_router(
    profile_routes.router,
    prefix="/profile",
    tags=["Profile"],
)

api_router.include_router(
    track_routes.router,
    prefix="/tracks",
    tags=["Tracks"],
)

api_router.include_router(
    batch_routes.router,
    prefix="/batches",
    tags=["Batches"],
)

api_router.include_router(
    enrollment_routes.router,
    prefix="/enrollments",
    tags=["Enrollments"],
)

api_router.include_router(
    fellows_admin_routes.router,
    prefix="/fellows",
    tags=["Fellows"],
)

api_router.include_router(
    fellow_routes.router,
    prefix="/fellow",
    tags=["Fellow"],
)

api_router.include_router(
    module_routes.router,
    prefix="/modules",
    tags=["Modules"],
)

api_router.include_router(
    lesson_routes.router,
    prefix="/lessons",
    tags=["Lessons"],
)

api_router.include_router(
    learning_fellow_routes.router,
    prefix="/learning",
    tags=["Learning"],
)

api_router.include_router(
    learning_progress_routes.router,
    prefix="/learning-progress",
    tags=["Learning Progress"],
)

api_router.include_router(
    assignment_admin_routes.router,
    prefix="/assignments",
    tags=["Assignments"],
)

api_router.include_router(
    submission_review_routes.router,
    prefix="/submissions",
    tags=["Submissions"],
)

api_router.include_router(
    admin_staff_routes.router,
    prefix="/admin",
    tags=["Admin Staff Management"],
)

api_router.include_router(
    dashboard_routes.router,
    prefix="/dashboard",
    tags=["Dashboard"],
)

api_router.include_router(
    chatbot_routes.router,
    prefix="/chatbot",
    tags=["Chatbot"],
)