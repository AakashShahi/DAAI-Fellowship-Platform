# DAAI Fellowship Platform — Project Overview

A comprehensive reference covering what the platform does, how it is built, and how it runs — from code architecture to containerized deployment.

---

## 1. What It Is

The DAAI Fellowship Platform manages the full lifecycle of a structured fellowship program: applications, cohort enrollment, learning tracks, module/lesson progression, assignment submission and review, quiz attempts, session scheduling, and attendance tracking.

**Key actors and their access:**

| Role | Access |
|------|--------|
| `SUPER_ADMIN` / `ADMIN` | Full platform management — cohorts, curriculum, fellows, sessions, assignments, submissions |
| `TRAINER` | Reviews submissions; reads tracks |
| `MENTOR` | Reviews submissions; reads tracks |
| `FELLOW` | Accesses their own learning track, assignments, quizzes, sessions, attendance |
| `EMPLOYER` | Employer dashboard (read-only, portal under development) |

---

## 2. Repository Layout

```
DAAI-Fellowship-Platform/
├── daai-backend/     FastAPI REST API
├── daai-webapp/      React SPA (Vite)
├── docs/             This document and future architecture references
└── CLAUDE.md         Developer guidance for Claude Code
```

Both sub-projects share a JWT-based auth contract, a common role set, and a MongoDB database. They communicate exclusively over HTTP — the frontend calls the backend API; there is no shared code between them.

---

## 3. Backend Architecture

### Stack

- **Python 3.12**, **FastAPI**, **Uvicorn** (ASGI server)
- **MongoDB** via **Motor** (async driver) + **Beanie ODM** (document models)
- **JWT** (python-jose) for authentication, **passlib/bcrypt** for password hashing
- **Redis + Celery** declared in `requirements.txt` — placeholder for background tasks (not yet wired)

### Layered Pattern

Every feature follows a strict four-layer chain — no layer may skip another:

```
HTTP Request
    ↓
Route handler (app/api/v1/routes/)   ← thin, delegates immediately
    ↓
Service (app/services/)              ← all business logic lives here
    ↓
Repository (app/repositories/)       ← all DB queries live here
    ↓
Beanie Document Model (app/models/)  ← MongoDB collection definition
```

### Key Files

| File | Responsibility |
|------|---------------|
| `app/main.py` | FastAPI app factory; registers all routers; configures CORS (localhost:517x); mounts `/uploads` static dir; lifespan manages DB init and teardown |
| `app/core/config.py` | `pydantic-settings` `Settings` class loaded from `.env`; accessed as singleton via `lru_cache` |
| `app/core/database.py` | Creates Motor `AsyncMongoClient`; calls `init_beanie()` registering all document models; `get_database()` used by repositories |
| `app/api/v1/router.py` | Central router — all new routes must be included here under `/api/v1` |
| `app/dependencies/auth_dependency.py` | Reusable FastAPI `Depends` guards: `current_user`, `current_admin`, `require_fellow`, `current_submission_reviewer` |
| `app/utils/jwt.py` | `decode_access_token` / `create_access_token` helpers |

### API Route Prefixes

All routes live under `/api/v1` unless marked legacy:

| Prefix | Module | Description |
|--------|--------|-------------|
| `/api/v1/auth` | `auth_routes` | Register, login, JWT issue |
| `/api/v1/applications` | `application_routes` | Fellowship applications |
| `/api/v1/admin/fellows` | `admin_fellow_routes` | Admin: manage fellow records |
| `/api/v1/admin/cohorts` | `admin_cohort_routes` | Admin: cohort CRUD |
| `/api/v1/admin/curriculum` | `admin_curriculum_routes` | Admin: module/lesson management |
| `/api/v1/admin/assignments` | `admin_assignment_v2_routes` | Admin: assignment management |
| `/api/v1/admin/sessions` | `admin_session_routes` | Admin: session scheduling + attendance |
| `/api/v1/fellow` | `fellow_routes` | Fellow-facing (track, progress, enrollment) |
| `/api/v1/learning` | `learning_fellow_routes` | Fellow: module/lesson content |
| `/api/v1/learning-progress` | `learning_progress_routes` | Track lesson completion |
| `/api/v1/submissions` | `submission_review_routes` | Assignment submission review |
| `/api/v1/quizzes` | `quiz_routes` | Quiz attempts |
| `/api/v1/profile` | `profile_routes` | User profile read/update |
| `/api/v1/tracks` | `track_routes` | Learning track catalog |

> **Legacy note:** `quiz_routes`, `profile_routes`, and `learning_progress_routes` are also mounted directly on `app` (outside `api_router`) at `/api/quizzes`, `/api/profile`, `/api/learning-progress`. New routes should only go through `api_router`.

### Data Models (MongoDB Collections)

`User`, `FellowshipApplication`, `Track`, `Batch`, `Enrollment`, `ProgramCohort`, `LearningModule`, `Lesson`, `LearningProgress`, `LessonProgress`, `Assignment`, `Submission`, `Session`, `Attendance`, `QuizQuestion`, `QuizAttempt`

All are registered in `app/core/database.py:init_beanie()`.

---

## 4. Frontend Architecture

### Stack

- **React 19**, **Vite 8**, **Tailwind CSS v4**
- **Zustand** (auth state), **Axios** (HTTP), **React Router v7**
- **Radix UI** primitives, **Lucide React** icons
- **React Compiler** enabled via `babel-plugin-react-compiler`

### Routing

`src/routers/AppRouter.jsx` composes four named route trees:

```
/              publicRouteElements     (PublicRoutes.jsx)
/admin/*       adminRoutesElement      (AdminRoutes.jsx)   — SUPER_ADMIN, ADMIN
/fellow/*      fellowRoutesElement     (FellowRoutes.jsx)  — FELLOW
/mentor/*      mentorRoutesElement     (MentorRoutes.jsx)  — MENTOR
/trainer/dashboard                    — TRAINER
/employer/dashboard                   — EMPLOYER
/dashboard     DashboardRedirect      — redirects by role
```

Route guards in `src/routers/routeGuards.jsx`:
- `protect(element)` — wraps in `ProtectedRoute` (checks `isAuthenticated`)
- `protectRole(roles, element)` — adds `RoleBasedRoute` on top (checks `user.role`)

### Auth State

```
sessionStorage ←→ src/lib/authStorage.js ←→ src/store/authStore.js (Zustand)
```

- Auth is **session-scoped** — closing the tab clears tokens.
- Stored keys: `token`, `refresh_token`, `user` (JSON), `role`.
- `useAuthStore` exposes: `setAuth`, `updateUser`, `logout`.

### HTTP Client

`src/api/axiosClient.js` — Axios instance with:
- `baseURL`: `VITE_API_BASE_URL` env var (default `http://127.0.0.1:8000/api/v1`)
- Request interceptor: reads token from `authStorage` and attaches `Authorization: Bearer <token>`

### Fellow Portal Gate

Fellows must select a learning track before accessing most routes. `FellowTrackGuard` (nested in `FellowRoutes.jsx`) enforces this — any fellow without a track is redirected to `/fellow/select-track`.

### Services Layer

`src/services/` contains plain async functions that call `axiosClient` — one file per domain (`fellowshipService.js`, `profileService.js`, `submissionService.js`, `quizService.js`, etc.). Components call services directly; no query library (React Query etc.) is used.

### UI Primitives

`src/components/ui/` is a custom component library built on Radix UI primitives + Tailwind (Button, Card, Dialog, DataTable, Table, Pagination, Input, Select, Skeleton, etc.). Always use these; do not create parallel low-level components.

### Layouts

Each route group has a layout component that renders `<Outlet>`:
- `AdminLayout` — admin sidebar + topbar
- `FellowLayout` — fellow portal sidebar + topbar
- `PublicLayout` — public-facing navbar + footer

---

## 5. Auth & RBAC Flow

```
[Browser]                            [Backend]
  │  POST /api/v1/auth/login            │
  │─────────────────────────────────►  │
  │◄─────────── { token, user } ───────│
  │  sessionStorage.setItem(token)      │
  │                                     │
  │  GET /api/v1/fellow/dashboard       │
  │  Authorization: Bearer <token> ─►  │
  │                          decode_access_token()
  │                          UserRepository.get_by_id()
  │                          role check (Depends)
  │◄────────────────── 200 / 403 ───────│
```

Frontend role check: `RoleBasedRoute` compares `user.role` from Zustand against the `allowedRoles` array passed to `protectRole()`.

---

## 6. Key Data Workflows

**Fellow onboarding:**
```
Public applies → FellowshipApplication created
Admin reviews → application status updated
Admin creates ProgramCohort → enrolls fellow (Enrollment)
Fellow logs in → selects Track → FellowTrackGuard passes
Fellow accesses LearningModules → Lessons → marks LessonProgress
```

**Assignment lifecycle:**
```
Admin creates Assignment (with track/cohort scope)
Fellow views assignments → submits (Submission record created, file upload to /uploads)
Admin/Mentor/Trainer opens /admin/submissions → reviews → grades/feedback
```

**Session & attendance:**
```
Admin creates Session (date, type, cohort)
Admin opens session detail → marks Attendance per fellow
Fellow views /fellow/attendance → sees their record
```

---

## 7. Environment Configuration

### Backend (`daai-backend/.env`)

Copy from `.example.env`:

```env
MONGODB_URL=mongodb+srv://...          # required
DATABASE_NAME=daai_fellowship
JWT_SECRET=<long-random-string>        # required, change from default
ACCESS_TOKEN_EXPIRE_MINUTES=60
DEBUG=True
SMTP_HOST=...                          # optional, for email features
```

### Frontend (`daai-webapp/.env`)

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1   # or production URL
```

---

## 8. Running Locally

**Backend:**
```bash
cd daai-backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
cp .example.env .env   # then edit MONGODB_URL and JWT_SECRET
uvicorn app.main:app --reload
# API: http://127.0.0.1:8000
# Docs: http://127.0.0.1:8000/docs
```

**Frontend:**
```bash
cd daai-webapp
npm install
npm run dev
# App: http://localhost:5173
```

**Seed data:**
```bash
cd daai-backend
python seed.py              # initial seed
SEED_RESET=1 python seed.py # wipe and re-seed
```

---

## 9. Containerization

### Backend image (`daai-backend/Dockerfile`)

```
python:3.12-slim
  → install requirements.txt
  → COPY app source
  → EXPOSE 8000
  → CMD uvicorn app.main:app --host 0.0.0.0 --port 8000
  → HEALTHCHECK: GET /api/v1/health/ every 30s
```

Build and run:
```bash
cd daai-backend
docker build -t daai-backend .
docker run -p 8000:8000 --env-file .env daai-backend
```

### Frontend image (`daai-webapp/Dockerfile`)

Two-stage build:
```
Stage 1 — node:22-alpine
  → npm ci
  → ARG VITE_API_BASE_URL (baked into bundle at build time)
  → npm run build  →  dist/

Stage 2 — nginx:alpine
  → COPY dist/ → /usr/share/nginx/html
  → COPY nginx.conf → /etc/nginx/conf.d/default.conf
  → EXPOSE 80
  → HEALTHCHECK: GET / every 30s
```

> `VITE_API_BASE_URL` is a **build argument** — it is compiled into the JavaScript bundle, not read at runtime. You must pass the correct URL at image build time.

Build and run:
```bash
cd daai-webapp
docker build --build-arg VITE_API_BASE_URL=https://api.example.com/api/v1 -t daai-webapp .
docker run -p 80:80 daai-webapp
```

### Nginx (`daai-webapp/nginx.conf`)

- Serves static files from `/usr/share/nginx/html`
- SPA fallback: all unmatched paths → `index.html` (required for React Router client-side routing)
- `/health` endpoint returns `200 ok` for container health checks

### Running Both Containers Together

No `docker-compose.yml` exists yet. Manual approach:

```bash
# Create a shared network
docker network create daai-net

# Backend
docker run -d --name daai-backend --network daai-net -p 8000:8000 --env-file daai-backend/.env daai-backend

# Frontend (API URL must point to the backend container or host)
docker run -d --name daai-webapp --network daai-net -p 80:80 daai-webapp
```

---

## 10. CI/CD

**Current pipeline:** `.github/workflows/codeql.yml`

- **Tool:** GitHub CodeQL (static security analysis)
- **Languages analyzed:** JavaScript/TypeScript, Python
- **Triggers:** push to `main`, pull requests to `main`, weekly schedule (Tuesday 11:21 UTC)
- **What it does:** scans for security vulnerabilities; results appear in GitHub Security tab

**What does not exist yet:**
- Automated Docker build + push on merge
- Deploy-to-staging / deploy-to-production pipeline
- Test runner in CI (unit, integration, e2e)
- Cloud infrastructure configuration (no Kubernetes manifests, no Terraform, no cloud provider configs)

---

## 11. Known Gaps

| Area | Status |
|------|--------|
| `docker-compose.yml` | Missing — no single-command local startup |
| Deployment pipeline | Missing — no automated build/push/deploy |
| Redis / Celery | In `requirements.txt` but not wired up — background tasks not implemented |
| Legacy route duplication | `quiz_routes`, `profile_routes`, `learning_progress_routes` mounted on both `app` and `api_router` |
| Test suite | No test files found in either sub-project |
| Cloud/IaC | No Kubernetes, Terraform, or cloud provider config |
