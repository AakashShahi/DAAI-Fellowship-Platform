# DAAI Fellowship Platform — Work Plan

> **Purpose:** Actionable checklist to take this project from current development state to a production-ready, staged deployment. Every item is grounded in code findings — nothing invented.
>
> **Priority levels:** 🔴 Critical (blocks production) · 🟠 High · 🟡 Medium · 🟢 Nice-to-have

---

## Current State Summary

| Area | Status |
|------|--------|
| Backend routes & services | Fully implemented |
| Admin panel (frontend) | ~95% complete |
| Fellow portal (frontend) | ~90% complete (Certificates, Announcements are stubs) |
| Mentor portal | ~30% complete (4 of 6 pages are Coming Soon) |
| Employer/Trainer dashboards | Placeholder only |
| Deployment infrastructure | Dockerfiles exist, no compose, no CI/CD |
| Hosting | **Not hosted anywhere** — no AWS, GCP, Render, Fly.io, or any cloud config found |
| Security hardening | Several gaps (see Section 1) |
| Test suite | Zero tests in either sub-project |

---

## Section 1 — Security Vulnerabilities (Fix Before Production)

### 1.1 🔴 No Rate Limiting on Auth Endpoints
**Where:** `daai-backend/app/main.py` — no middleware applied  
**Risk:** Brute-force attacks on `/api/v1/auth/login`, `/api/v1/auth/register`, `/api/v1/auth/forgot-password`  
**Fix:** Add `slowapi` or `fastapi-limiter` (backed by Redis, which is already in requirements)
```python
# Example: 5 login attempts per minute per IP
@limiter.limit("5/minute")
@router.post("/login")
```

### 1.2 🔴 JWT Secret Has a Hardcoded Fallback
**Where:** `daai-backend/app/core/config.py` line 23 — `JWT_SECRET: str = "change-me"`  
**Risk:** If `.env` is missing, tokens are signed with a known secret — full auth bypass  
**Fix:** Add a startup validator that raises on weak secrets:
```python
@field_validator("JWT_SECRET")
def jwt_secret_must_be_strong(cls, v):
    if v == "change-me" or len(v) < 32:
        raise ValueError("JWT_SECRET must be set to a strong random value")
    return v
```

### 1.3 🔴 No 401/403 Response Interceptor in Frontend
**Where:** `daai-webapp/src/api/axiosClient.js` — only a request interceptor exists  
**Risk:** Expired tokens silently fail; users see broken pages instead of being redirected to login  
**Fix:** Add a response interceptor:
```js
axiosClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### 1.4 🔴 No Error Boundary in React App
**Where:** `daai-webapp/src/App.jsx` and `main.jsx` — no ErrorBoundary wrapping  
**Risk:** Any unhandled render error crashes the entire app (white screen)  
**Fix:** Create `src/components/ErrorBoundary.jsx` and wrap `<App />` in `main.jsx`

### 1.5 🟠 File Upload Has No Type or Size Validation
**Where:** `daai-backend/app/services/application_service.py`  
**Risk:** Executable files can be uploaded; DoS via large files; no MIME type validation  
**Fix:**
- Whitelist allowed extensions: `.pdf`, `.doc`, `.docx`, `.png`, `.jpg`
- Enforce max size: 10MB explicit limit before reading
- Validate actual file magic bytes, not just the `content_type` header

### 1.6 🟠 CORS Is Hardcoded to Localhost
**Where:** `daai-backend/app/main.py` lines 40–52  
**Risk:** Production deployment will be broken (all CORS requests blocked)  
**Fix:** Move origins to `Settings`:
```python
ALLOWED_ORIGINS: list[str] = ["http://localhost:5173"]
```
Then use `settings.ALLOWED_ORIGINS` in `CORSMiddleware`.

### 1.7 🟠 Token Refresh Flow Is Unimplemented
**Where:** Refresh tokens are stored in `sessionStorage` (`daai-webapp/src/lib/authStorage.js`) but never used  
**Risk:** Users get silently logged out when the 60-minute token expires  
**Fix:** Add `POST /api/v1/auth/refresh` backend endpoint + call it from the Axios response interceptor on 401 before forcing logout

### 1.8 🟠 Duplicate Admin Guard Logic in Route Files
**Where:** Several route files (`admin_assignment_v2_routes.py`, `admin_fellow_routes.py`, etc.) define a local `current_admin_only()` instead of importing `current_admin` from `app/dependencies/auth_dependency.py`  
**Risk:** Inconsistent enforcement — a change to one copy won't apply to others  
**Fix:** Delete all local copies and use `from app.dependencies.auth_dependency import current_admin` everywhere

### 1.9 🟡 Password Reset Token Returned in Dev Response
**Where:** `daai-backend/app/services/auth_service.py` lines 75–79  
**Fix:** Log to server console instead; never include in HTTP response body even in dev

### 1.10 🟡 `DEBUG=True` in `.example.env`
**Where:** `daai-backend/.example.env`  
**Risk:** Developers copy the example and deploy with `DEBUG=True`, exposing stack traces  
**Fix:** Change example to `DEBUG=False` and add a comment

### 1.11 🟡 No HTTPS Enforcement Middleware
**Where:** Backend has no HTTP→HTTPS redirect or HSTS header  
**Fix:** Add via reverse proxy (Nginx/ALB) at infrastructure level, and add `Strict-Transport-Security` header to FastAPI responses in production

---

## Section 2 — Missing Features to Complete

### 2.1 🔴 Mentor Portal (4 of 6 pages are stubs)
**Where:** `daai-webapp/src/routers/MentorRoutes.jsx`

| Page | Path | Status |
|------|------|--------|
| Assigned Cohorts | `/mentor/cohorts` | Coming Soon |
| Assigned Fellows | `/mentor/fellows` | Coming Soon |
| Mentoring Sessions | `/mentor/sessions` | Coming Soon |
| Fellow Feedback | `/mentor/feedback` | Coming Soon |
| Submissions | `/mentor/submissions` | ✅ Done |
| Dashboard | `/mentor/dashboard` | ✅ Done |

**What to build:** Fetch assigned cohorts/fellows via existing `/api/v1/admin/` or `/api/v1/fellow` endpoints. Sessions page can reuse `SessionTable` component from admin.

### 2.2 🟠 Fellow Certificates Page
**Where:** `daai-webapp/src/routers/FellowRoutes.jsx` — Coming Soon  
**What to build:** Certificate generation/display; requires backend endpoint to check eligibility and return certificate data. Models and submission tracking already exist.

### 2.3 🟠 Fellow Announcements Page
**Where:** `daai-webapp/src/routers/FellowRoutes.jsx` — Coming Soon  
**What to build:** Needs an `Announcement` model and CRUD endpoints on the backend (none exist yet). Admin posts → Fellows read.

### 2.4 🟠 Admin Tracks "Manage" Button
**Where:** `daai-webapp/src/pages/admin/AdminTracksPage.jsx` line 205 — button is disabled  
**Fix:** Wire up the existing track CRUD service to enable editing

### 2.5 🟡 Contact Form
**Where:** `daai-webapp/src/pages/public/ContactPage.jsx` — shows alert placeholder  
**Fix:** Connect to the email service (`POST /api/v1/applications` or a new `/api/v1/contact` endpoint) or a third-party form service

### 2.6 🟡 Employer & Trainer Dashboards
**Where:** `daai-webapp/src/pages/dashboards/EmployerDashboard.jsx` and `TrainerDashboard.jsx` — both are placeholder shells  
**What to build:** Determine what employers and trainers actually need to see; design and implement

### 2.7 🟡 Background Task Queue (Celery/Redis)
**Where:** `celery` and `redis` are in `requirements.txt` but no task files exist  
**Current risk:** Email sending is synchronous — it blocks HTTP responses  
**Fix:** Create `daai-backend/app/tasks/email_tasks.py` with Celery tasks. Wire existing `email_service.py` calls to dispatch tasks instead of awaiting directly.

### 2.8 🟡 Missing 404 Page
**Where:** `daai-webapp/src/routers/AppRouter.jsx` line 70 — all unknown routes redirect to `/dashboard`  
**Fix:** Create `src/pages/NotFoundPage.jsx` and change the catch-all:
```jsx
<Route path="*" element={<NotFoundPage />} />
```

---

## Section 3 — Code Quality Improvements

### 3.1 🟠 No Tests in Either Sub-project
**Fix approach:**
- **Backend:** Add `pytest` + `httpx` (`AsyncClient`) for route-level tests. Start with auth routes and admin CRUD.
- **Frontend:** Add Vitest + React Testing Library. Start with `authStore`, `axiosClient` interceptors, and route guard components.

### 3.2 🟠 Service-Level Error Handling in Frontend
**Where:** `src/services/authService.js`, `assignmentService.js`, `fellowService.js`, `learningService.js` — all pass errors through raw  
**Pattern to follow:** `src/hooks/useLogin.js` already has the right pattern (`error.response?.data?.detail`)  
**Fix:** Add a shared `extractError(err)` utility in `src/lib/` and use it consistently in services

### 3.3 🟡 Legacy Route Duplication in Backend
**Where:** `quiz_routes`, `profile_routes`, `learning_progress_routes` are mounted twice (on `app` directly AND via `api_router`)  
**Fix:** Remove the direct mounts from `app/main.py` after verifying the `/api/v1/` prefixed versions work for all frontend consumers

### 3.4 🟡 Two Parallel Assignment Systems
**Where:** `assignment_admin_routes.py` (V1) and `admin_assignment_v2_routes.py` (V2) — both exist  
**Fix:** Decide on V2 as canonical, deprecate V1 routes, update any frontend service calls still pointing to V1 endpoints

---

## Section 4 — Staging Instance Setup (Render Free Plan)

The project is **not currently hosted anywhere**. The chosen platform is **Render** — it supports Docker natively, has a genuinely free tier for both backend and frontend, auto-deploys from GitHub, and manages SSL automatically.

### Free Tier Limits to Know

| Resource | Free Limit | Impact |
|----------|-----------|--------|
| Backend (Web Service) | 750 hrs/mo, sleeps after 15 min idle | First request after sleep takes ~30s to wake |
| Frontend (Static Site) | Unlimited, never sleeps | No impact |
| MongoDB Atlas M0 | 512MB storage, shared cluster | Fine for staging; don't use for production |
| Bandwidth | 100GB/mo | More than enough for staging |
| Build minutes | 500/mo | ~10 deploys/day easily |

### 4.1 Prerequisites

Before touching Render, complete these once:

1. **MongoDB Atlas free cluster**
   - Go to cloud.mongodb.com → Create free M0 cluster (region: closest to you)
   - Create a database user (username + strong password — save it)
   - Add `0.0.0.0/0` to IP Allowlist (Render IPs change, so open access is required for free tier)
   - Get the connection string: `mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/daai_fellowship`

2. **Generate a strong JWT secret**
   ```bash
   # Run this locally to generate a 64-char secret
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

3. **Push repo to GitHub** — Render pulls directly from GitHub

---

### 4.2 Step-by-Step: Deploy Backend (Web Service)

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub account and select the `DAAI-Fellowship-Platform` repo
3. Fill in the settings:

   | Field | Value |
   |-------|-------|
   | **Name** | `daai-backend` |
   | **Region** | Oregon (US West) or closest |
   | **Branch** | `main` |
   | **Root Directory** | `daai-backend` |
   | **Runtime** | **Docker** (Render auto-detects the Dockerfile) |
   | **Instance Type** | Free |

4. Under **Environment Variables**, add every variable below (click "Add Environment Variable" for each):

   | Key | Value |
   |-----|-------|
   | `APP_ENV` | `staging` |
   | `DEBUG` | `False` |
   | `MONGODB_URL` | `mongodb+srv://user:pass@cluster0.xxx.mongodb.net/daai_fellowship` |
   | `DATABASE_NAME` | `daai_fellowship` |
   | `JWT_SECRET` | *(64-char string from step above)* |
   | `JWT_ALGORITHM` | `HS256` |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` |
   | `ALLOWED_ORIGINS` | `https://daai-webapp.onrender.com` *(update after frontend is deployed)* |
   | `SMTP_HOST` | *(your SMTP — Gmail, SendGrid, etc.)* |
   | `SMTP_PORT` | `587` |
   | `SMTP_USERNAME` | *(SMTP user)* |
   | `SMTP_PASSWORD` | *(SMTP password)* |
   | `SMTP_FROM_EMAIL` | `no-reply@your-domain.com` |
   | `SMTP_USE_TLS` | `True` |

5. Click **Create Web Service** — Render builds the Docker image and deploys
6. Note the URL: `https://daai-backend.onrender.com`
7. Verify: open `https://daai-backend.onrender.com/api/v1/health/` — should return `{"status": "ok"}`

---

### 4.3 Step-by-Step: Deploy Frontend (Static Site)

1. Go to Render → **New → Static Site**
2. Connect same GitHub repo
3. Fill in the settings:

   | Field | Value |
   |-------|-------|
   | **Name** | `daai-webapp` |
   | **Branch** | `main` |
   | **Root Directory** | `daai-webapp` |
   | **Build Command** | `npm install && npm run build` |
   | **Publish Directory** | `dist` |

4. Under **Environment Variables**, add:

   | Key | Value |
   |-----|-------|
   | `VITE_API_BASE_URL` | `https://daai-backend.onrender.com/api/v1` |

   > `VITE_` variables are baked into the bundle at build time — Render passes them as build environment variables automatically.

5. Under **Redirects/Rewrites**, add this rule for SPA routing:

   | Source | Destination | Action |
   |--------|-------------|--------|
   | `/*` | `/index.html` | Rewrite |

   *(This replaces the nginx SPA fallback since Render Static Sites don't use nginx)*

6. Click **Create Static Site**
7. Note the URL: `https://daai-webapp.onrender.com`
8. Go back to the **backend service → Environment → update `ALLOWED_ORIGINS`** to `https://daai-webapp.onrender.com` and redeploy

---

### 4.4 Auto-Deploy on Push (Already Free)

Render automatically redeploys both services on every push to `main`. No extra configuration needed.

To also trigger deploys from PRs, go to each service → **Settings → Auto-Deploy → Enable for Pull Requests**.

---

### 4.5 GitHub Actions CI/CD (Optional Enhancement)

If you want to run lint/tests before Render deploys, add `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  backend-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install ruff
        working-directory: daai-backend
      - run: ruff check app/
        working-directory: daai-backend

  frontend-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "22" }
      - run: npm ci
        working-directory: daai-webapp
      - run: npm run lint
        working-directory: daai-webapp
      - run: npm run build
        working-directory: daai-webapp
        env:
          VITE_API_BASE_URL: https://daai-backend.onrender.com/api/v1
```

Render will still auto-deploy after the checks pass since it watches the branch directly.

---

### 4.6 Local Dev with Docker Compose

Create `docker-compose.yml` at repo root for running everything locally with one command:

```yaml
services:
  backend:
    build: ./daai-backend
    env_file: ./daai-backend/.env
    ports:
      - "8000:8000"
    depends_on:
      - mongo
    volumes:
      - ./daai-backend/uploads:/app/uploads

  frontend:
    build:
      context: ./daai-webapp
      args:
        VITE_API_BASE_URL: http://localhost:8000/api/v1
    ports:
      - "80:80"
    depends_on:
      - backend

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

Run with:
```bash
docker compose up --build
# Backend: http://localhost:8000
# Frontend: http://localhost:80
# Docs: http://localhost:8000/docs
```

---

### 4.7 Handling the Free Tier Cold Start

The backend sleeps after 15 minutes of inactivity. The first request wakes it up (~30s delay). For staging this is acceptable, but you can mitigate it:

**Option A: UptimeRobot ping (free)**
- Create a free account at uptimerobot.com
- Add HTTP monitor: `https://daai-backend.onrender.com/api/v1/health/`
- Set interval: every 14 minutes
- This keeps the backend awake at all times at zero cost

**Option B: Accept the sleep** — fine for demo/staging use where you know to expect it

---

### 4.8 Environment Variables Reference

**Backend (set in Render dashboard → Environment):**
```env
APP_ENV=staging
DEBUG=False
MONGODB_URL=mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/daai_fellowship
DATABASE_NAME=daai_fellowship
JWT_SECRET=<64-char hex string>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOWED_ORIGINS=https://daai-webapp.onrender.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your@gmail.com
SMTP_PASSWORD=<app password>
SMTP_FROM_EMAIL=no-reply@daai-fellowship.com
SMTP_FROM_NAME=DAAI Fellowship
SMTP_USE_TLS=True
```

**Frontend (set in Render dashboard → Environment, used at build time):**
```env
VITE_API_BASE_URL=https://daai-backend.onrender.com/api/v1
```

---

## Section 5 — Production Readiness Checklist

Work through these in order before going live:

### Infrastructure
- [ ] `docker-compose.yml` created and tested locally
- [ ] Staging environment live and accessible
- [ ] Production environment provisioned (separate from staging)
- [ ] MongoDB Atlas production cluster with backups enabled
- [ ] Domain and SSL certificate configured (Cloudflare or provider-managed)
- [ ] Environment secrets stored in platform secret manager (not in repo)

### Security
- [ ] Rate limiting on auth endpoints (Section 1.1)
- [ ] JWT_SECRET startup validator (Section 1.2)
- [ ] Axios 401 response interceptor (Section 1.3)
- [ ] React Error Boundary (Section 1.4)
- [ ] File upload type + size validation (Section 1.5)
- [ ] CORS origins moved to env config (Section 1.6)
- [ ] Token refresh endpoint + frontend flow (Section 1.7)
- [ ] Duplicate admin guard removed (Section 1.8)
- [ ] `DEBUG=False` enforced in production
- [ ] HTTPS enforced via reverse proxy or Render/Fly managed TLS

### Features
- [ ] Mentor portal complete (Section 2.1)
- [ ] Token refresh working (Section 1.7)
- [ ] 404 page added (Section 2.8)
- [ ] Contact form working (Section 2.5)
- [ ] Background email tasks (Section 2.7)

### Testing
- [ ] Backend: at least auth + admin route tests passing in CI
- [ ] Frontend: at least auth store + route guard tests passing in CI

### Monitoring
- [ ] Application error tracking (Sentry free tier — add to both frontend and backend)
- [ ] Uptime monitoring (UptimeRobot free tier)
- [ ] MongoDB Atlas monitoring enabled

---

## Section 6 — Recommended Work Order

```
Week 1: Security foundations
  → Fix JWT_SECRET validator
  → Fix CORS to use env config
  → Add Axios response interceptor + logout on 401
  → Add React Error Boundary
  → Add 404 page

Week 2: Deployment pipeline
  → Write docker-compose.yml
  → Deploy staging to Render (or Fly.io)
  → Add GitHub Actions deploy-on-push workflow

Week 3: Feature completion
  → Implement mentor portal pages (cohorts, fellows, sessions, feedback)
  → Wire Admin Tracks "Manage" button
  → Remove legacy route duplication in backend

Week 4: Hardening
  → Add rate limiting (slowapi + Redis)
  → Add file upload validation
  → Add token refresh endpoint + frontend flow
  → Add Celery/Redis background email tasks
  → Add Sentry to both apps

Week 5+: Nice-to-have
  → Fellow Certificates
  → Announcements system
  → Employer / Trainer dashboards
  → Test suite
```

---

## Appendix: Files That Need Creation

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Local multi-container dev + staging reference |
| `.github/workflows/deploy-staging.yml` | Automated staging deploy on push to main |
| `daai-backend/app/middleware/rate_limit.py` | Rate limiting with slowapi |
| `daai-backend/app/tasks/email_tasks.py` | Celery email background tasks |
| `daai-webapp/src/components/ErrorBoundary.jsx` | Global React error boundary |
| `daai-webapp/src/pages/NotFoundPage.jsx` | 404 page |
| `daai-webapp/src/lib/extractError.js` | Shared error extraction utility |
| `daai-backend/.env.staging` | Staging environment config (gitignored) |
