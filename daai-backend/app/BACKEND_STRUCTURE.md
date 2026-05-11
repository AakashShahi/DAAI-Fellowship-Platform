# DAAI Fellowship Platform Backend Structure

This document explains the backend folder structure for the DAAI Fellowship Platform built using:

- FastAPI
- MongoDB
- Motor
- Beanie ODM
- JWT Authentication
- Redis + Celery

The architecture follows a scalable modular monolith structure suitable for production-grade systems.

---

# Backend Folder Structure

```txt
daai-backend/
├── app/
│
│   ├── main.py
│
│   ├── api/
│   │   ├── v1/
│   │   │   ├── routes/
│   │   │   └── router.py
│
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── database.py
│
│   ├── models/
│   │   ├── user_model.py
│   │   └── course_model.py
│
│   ├── schemas/
│   │   ├── user_schema.py
│   │   └── auth_schema.py
│
│   ├── services/
│   │   ├── auth_service.py
│   │   └── user_service.py
│
│   ├── repositories/
│   │   ├── user_repository.py
│   │   └── course_repository.py
│
│   ├── middleware/
│   │   └── auth_middleware.py
│
│   ├── dependencies/
│   │   └── auth_dependency.py
│
│   ├── utils/
│   │   ├── helpers.py
│   │   ├── constants.py
│   │   └── validators.py
│
│   ├── tasks/
│   │   └── email_tasks.py
│
│   ├── websocket/
│   │   └── notification_socket.py
│
│   ├── uploads/
│   │
│   └── tests/
│
├── requirements.txt
├── .env
├── .example.env
├── .gitignore
└── README.md
```

---

# Folder Explanations

---

# app/

Main application source folder.

Contains all backend logic and modules.

---

# main.py

Main FastAPI application entry point.

Responsible for:

- Creating FastAPI app
- Registering routers
- Middleware setup
- Startup events
- Database initialization

Example:

```python
from fastapi import FastAPI

app = FastAPI(
    title="DAAI Fellowship Platform",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {
        "message": "Backend Running"
    }
```

---

# api/

Contains API route definitions.

Separates API versions cleanly.

Example:

```txt
api/
└── v1/
    ├── routes/
    └── router.py
```

---

# api/v1/routes/

Contains all route files.

Example:

```txt
routes/
├── auth_routes.py
├── user_routes.py
├── course_routes.py
├── attendance_routes.py
└── exam_routes.py
```

---

# Example Route File

```python
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_users():
    return {"message": "Users fetched"}
```

---

# router.py

Central router aggregator.

Example:

```python
from fastapi import APIRouter
from app.api.v1.routes import auth_routes

api_router = APIRouter()

api_router.include_router(
    auth_routes.router,
    prefix="/auth",
    tags=["Authentication"]
)
```

---

# core/

Contains core system configuration and initialization logic.

---

# config.py

Loads environment variables and app settings.

Example:

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str
    MONGODB_URL: str

    class Config:
        env_file = ".env"

settings = Settings()
```

---

# security.py

Handles:

- JWT token creation
- Password hashing
- Token verification

Example:

```python
from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def hash_password(password: str):
    return pwd_context.hash(password)
```

---

# database.py

Initializes MongoDB connection.

Example:

```python
from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient("mongodb://localhost:27017")
database = client.daai_fellowship
```

---

# models/

Contains database models.

Beanie ODM models go here.

Example:

```python
from beanie import Document

class User(Document):
    full_name: str
    email: str
    role: str
```

---

# schemas/

Contains request/response validation schemas.

Used for:

- Request body validation
- Response serialization

Example:

```python
from pydantic import BaseModel

class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str
```

---

# services/

Contains business logic.

Routes should remain thin.
Heavy logic belongs here.

Example:

```python
class AuthService:

    async def register_user(self, user_data):
        pass
```

---

# repositories/

Handles direct database operations.

Keeps database logic separate from services.

Example:

```python
class UserRepository:

    async def get_user_by_email(self, email: str):
        pass
```

---

# middleware/

Contains FastAPI middleware.

Examples:

- Logging middleware
- Request tracking
- Authentication middleware

Example:

```python
from starlette.middleware.base import BaseHTTPMiddleware
```

---

# dependencies/

Reusable FastAPI dependencies.

Examples:

- Current user
- Admin permission check
- JWT validation

Example:

```python
from fastapi import Depends
```

---

# utils/

Contains utility/helper functions.

Examples:

- Date formatting
- Constants
- Validators
- File helpers

Example:

```python
def generate_slug(title: str):
    return title.lower().replace(" ", "-")
```

---

# tasks/

Background tasks using Celery.

Examples:

- Send emails
- Generate certificates
- Notifications
- Scheduled jobs

Example:

```python
from celery import Celery
```

---

# websocket/

Real-time websocket handlers.

Examples:

- Notifications
- Live attendance
- Discussion chat

Example:

```python
from fastapi import WebSocket
```

---

# uploads/

Temporary local file storage.

Examples:

- CV uploads
- Assignments
- Certificates

Production recommendation:
Use MinIO or S3 later.

---

# tests/

Contains backend test files.

Examples:

- Unit tests
- API tests
- Integration tests

Example:

```txt
tests/
├── test_auth.py
├── test_users.py
└── test_courses.py
```

---

# Recommended Development Flow

Recommended order of implementation:

1. Config setup
2. MongoDB connection
3. Authentication
4. RBAC system
5. User module
6. Fellowship applications
7. Course/module system
8. Attendance system
9. Exams system
10. Notifications
11. Analytics

---

# Recommended Module Structure

Each major feature should follow:

```txt
feature/
├── routes/
├── schemas/
├── services/
├── repositories/
└── models/
```

Example:

```txt
attendance/
├── attendance_routes.py
├── attendance_schema.py
├── attendance_service.py
├── attendance_repository.py
└── attendance_model.py
```

---

# Architecture Principles

This backend follows:

- Modular Monolith Architecture
- Separation of Concerns
- Service Layer Pattern
- Repository Pattern
- Dependency Injection
- Async-first Architecture

---

# Best Practices

## Keep Routes Thin

Bad:

```python
@router.post("/")
async def create_user():
    # 200 lines of logic
```

Good:

```python
@router.post("/")
async def create_user(data):
    return await user_service.create_user(data)
```

---

## Keep Business Logic in Services

Services should:

- Validate workflows
- Handle logic
- Coordinate repositories

---

## Keep DB Logic in Repositories

Repositories should:

- Query database
- Update collections
- Handle persistence only

---

# Recommended Future Additions

Later you can add:

```txt
├── cache/
├── permissions/
├── events/
├── queues/
├── audit_logs/
├── integrations/
└── ai/
```

---

# Recommended Technologies

## Backend

- FastAPI
- MongoDB
- Beanie ODM
- Motor
- Redis
- Celery

## Authentication

- JWT
- Passlib
- Python-Jose

## File Storage

- MinIO
- AWS S3

## Deployment

- Docker
- Docker Compose
- Nginx

---

# Final Notes

This structure is designed to support:

- Thousands of students
- Multiple fellowship batches
- Real-time systems
- Employer integrations
- Analytics dashboards
- AI features
- Scalable API architecture

without requiring major refactoring later.
