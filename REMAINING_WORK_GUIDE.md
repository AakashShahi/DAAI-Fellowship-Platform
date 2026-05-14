# DAAI Fellowship Platform — Remaining Work Roadmap

A centralized Fellowship Management System designed to manage fellows, trainers, admins, employers, learning tracks, quizzes, progress tracking, and career opportunities.

This README documents the remaining work, recommended Git branch strategy, implementation phases, testing checklist, and production-readiness tasks.

---

## 1. Current Project Status

The project already has the foundation for authentication, role-based routing, dashboard structure, profile settings, quiz pages, and fellow learning track selection.

### Completed Areas

- Login and registration flow exists.
- Role-based redirects exist for:
  - `SUPER_ADMIN`
  - `ADMIN`
  - `TRAINER`
  - `FELLOW`
  - `EMPLOYER`
- Admin dashboard layout and admin route structure exist.
- Quiz pages exist:
  - quiz category list
  - quiz attempt page
  - quiz result page
  - quiz attempts page
- Profile settings has backend integration for:
  - fetching profile
  - updating profile
  - changing password
  - selecting fellow learning track
- Fellow dashboard supports selecting one learning track:
  - QA
  - Salesforce
  - AWS Practitioner
  - AWS Architect
- App routing has been refactored into route guards, dashboard pages, and shared dashboard components.

---

## 2. Main Problem Right Now

The website has structure, but it still feels incomplete because many dashboard areas are not connected to real backend data yet.

Current issues:

- Fellow dashboard still contains fallback/static learning progress.
- Quiz attempts are filtered on the frontend instead of backend.
- Admin quiz management is not production-level yet.
- Trainer dashboard is still basic.
- Employer dashboard is still basic.
- Admin dashboard cards are still static.
- Loading, empty, and error states are inconsistent.
- Some UI/UX areas feel messy and need polish.
- Backend and frontend tests are still missing for important flows.

The solution is to improve the platform phase by phase using focused Git branches.

---

## 3. Recommended Branch Strategy

Do not work on many features in one branch.

Use one branch per feature or phase.

### Branch Naming Format

```bash
feat/<feature-name>
fix/<bug-name>
chore/<cleanup-name>
test/<test-area>
```

### Recommended Branches

| Phase | Branch Name | Purpose |
|---|---|---|
| Phase 1 | `feat/fellow-learning-progress` | Add backend learning progress and connect fellow dashboard |
| Phase 2 | `feat/quiz-track-filtering` | Backend-supported quiz filtering by learning track |
| Phase 3 | `feat/fellow-dashboard-real-data` | Improve fellow dashboard with real data and UX |
| Phase 4 | `feat/admin-quiz-management` | Complete quiz CRUD for admin |
| Phase 5 | `feat/admin-dashboard-metrics` | Replace static admin dashboard data |
| Phase 6 | `feat/trainer-dashboard` | Build trainer dashboard features |
| Phase 7 | `feat/employer-dashboard` | Build employer dashboard features |
| Phase 8 | `chore/ui-ux-polish` | Improve visual consistency and responsiveness |
| Phase 9 | `test/core-platform-flows` | Add backend and frontend tests |
| Phase 10 | `chore/production-readiness` | Env, security, seed data, deployment docs |

---

## 4. Git Workflow

Before starting every new phase:

```bash
git checkout main
git pull origin main
git checkout -b feat/fellow-learning-progress
```

After completing work:

```bash
git status
git add .
git commit -m "feat: add fellow learning progress integration"
git push origin feat/fellow-learning-progress
```

Then create a Pull Request into `main`.

After PR is merged:

```bash
git checkout main
git pull origin main
```

Then create the next feature branch.

---

# 5. Phase 1 — Fellow Learning Progress Backend

## Branch

```bash
feat/fellow-learning-progress
```

## Goal

Make fellow dashboard progress real instead of static/fallback.

A fellow should select one learning track, and the backend should store that fellow's progress for that selected track.

## Backend Requirements

Create a learning progress model/table.

Suggested fields:

```txt
id
fellow_id
learning_track
modules_progress
completion_percentage
milestones
status
created_at
updated_at
```

### Suggested Learning Progress Data Shape

```json
{
  "learningTrack": "aws-practitioner",
  "completionPercentage": 35,
  "status": "in_progress",
  "modules": [
    {
      "moduleId": "cloud-basics",
      "title": "Cloud Computing Basics",
      "status": "completed",
      "completionPercentage": 100
    },
    {
      "moduleId": "iam-basics",
      "title": "AWS IAM Basics",
      "status": "in_progress",
      "completionPercentage": 40
    }
  ],
  "milestones": [
    {
      "title": "Complete first quiz",
      "status": "completed"
    },
    {
      "title": "Score above 70% in AWS IAM quiz",
      "status": "pending"
    }
  ]
}
```

## APIs Needed

```txt
GET /api/learning-progress/me
GET /api/learning-progress/me/{learningTrack}
PUT /api/learning-progress/me
```

## Backend Rules

- Only authenticated fellows can access their own progress.
- A fellow should not access another fellow's progress.
- Admin, trainer, and employer should not update fellow progress using this endpoint.
- Progress should be connected to the selected learning track.
- Learning track values must be stable slugs:
  - `qa`
  - `salesforce`
  - `aws-practitioner`
  - `aws-architect`

## Frontend Requirements

Create:

```txt
src/services/learningProgressService.js
```

Suggested service methods:

```js
getMyLearningProgress()
getMyLearningProgressByTrack(learningTrack)
updateMyLearningProgress(payload)
```

## Fellow Dashboard Changes

Replace:

- fake progress
- static modules
- fallback `0%`
- hardcoded milestones

With:

- real completion percentage
- real module progress
- real milestones
- real learning status

## Manual Testing

Test these cases:

1. Fellow logs in and selects `QA`.
2. Dashboard fetches progress for `QA`.
3. Fellow changes track to `AWS Practitioner`.
4. Dashboard fetches progress for `AWS Practitioner`.
5. Non-fellow role tries to update progress and receives forbidden response.
6. Fellow cannot access another fellow's progress.

## Commit Message

```bash
git add .
git commit -m "feat: add fellow learning progress backend integration"
```

---

# 6. Phase 2 — Quiz Track Filtering

## Branch

```bash
feat/quiz-track-filtering
```

## Goal

Move quiz attempt filtering from frontend to backend.

Currently, the fellow dashboard may filter quiz attempts using category text on the frontend. This is not reliable. The backend should support filtering quiz attempts by learning track.

## Backend Requirements

Add stable quiz category slugs:

```txt
qa
salesforce
aws-practitioner
aws-architect
```

Add query filter support:

```txt
GET /api/quizzes/my-attempts?learningTrack=qa
GET /api/quizzes/my-attempts?learningTrack=salesforce
GET /api/quizzes/my-attempts?learningTrack=aws-practitioner
GET /api/quizzes/my-attempts?learningTrack=aws-architect
```

## Frontend Requirements

When the fellow has selected a learning track, call the backend using the selected track slug.

Example:

```txt
/api/quizzes/my-attempts?learningTrack=aws-practitioner
```

Do not filter quiz attempts manually in the React component.

## Manual Testing

1. Fellow selects `QA`.
2. Dashboard shows only QA attempts.
3. Fellow selects `Salesforce`.
4. Dashboard shows only Salesforce attempts.
5. API returns empty array if no attempts exist.
6. Dashboard shows a clean empty state.

## Commit Message

```bash
git add .
git commit -m "feat: add learning track filtering for quiz attempts"
```

---

# 7. Phase 3 — Fellow Dashboard Real Data and UX

## Branch

```bash
feat/fellow-dashboard-real-data
```

## Goal

Make the fellow dashboard useful, interactive, and clean.

## Required Dashboard Sections

The fellow dashboard should show:

- Selected learning track card
- Progress overview
- Current module
- Next recommended action
- Recent quiz attempts
- Weak topics
- Milestones
- Continue learning button
- Take quiz button

## Behavior

### If No Track Is Selected

Show only the learning track selection screen.

Do not show all dashboards or all track cards.

### If Track Is Selected

Show only the dashboard for that selected track.

Example:

If fellow selects `AWS Practitioner`, they should not see QA, Salesforce, or AWS Architect dashboard cards.

## UX Improvements

Add:

- loading skeletons
- empty state cards
- retry buttons for failed API calls
- better spacing
- consistent card design
- clear call-to-action buttons

## Empty State Examples

```txt
No quiz attempts yet.
Take your first AWS Practitioner quiz to unlock progress insights.
```

```txt
No progress found yet.
Start your first module to begin tracking your learning journey.
```

## Commit Message

```bash
git add .
git commit -m "feat: connect fellow dashboard to real learning data"
```

---

# 8. Phase 4 — Admin Quiz Management CRUD

## Branch

```bash
feat/admin-quiz-management
```

## Goal

Allow admin to properly manage quiz questions from the UI.

## Features Needed

Admin should be able to:

- create quiz questions
- edit quiz questions
- delete quiz questions
- assign question to learning track/category
- set difficulty
- set active/inactive state
- add multiple answer options
- select correct answer
- search questions
- filter by category
- filter by difficulty
- filter by active/inactive status
- confirm before deleting

## Suggested Routes

```txt
/admin/quizzes
/admin/quizzes/new
/admin/quizzes/:id/edit
```

## Validation Rules

- Question title is required.
- At least two options are required.
- Correct answer is required.
- Learning track/category is required.
- Difficulty is required.
- Duplicate options should not be allowed.

## Commit Message

```bash
git add .
git commit -m "feat: complete admin quiz management CRUD"
```

---

# 9. Phase 5 — Admin Dashboard Real Metrics

## Branch

```bash
feat/admin-dashboard-metrics
```

## Goal

Replace static dashboard cards with real backend data.

## Backend API

Create:

```txt
GET /api/admin/dashboard/summary
```

Suggested response:

```json
{
  "totalApplications": 120,
  "acceptedFellows": 45,
  "activeCohorts": 3,
  "trainers": 8,
  "employers": 12,
  "pendingReviews": 18,
  "totalQuizzes": 40,
  "activeFellows": 38
}
```

## Frontend Dashboard Cards

Show:

- Total applications
- Accepted fellows
- Active fellows
- Active cohorts
- Trainers
- Employers
- Pending reviews
- Total quizzes

## Optional Enhancements

Add:

- recent activity list
- pending actions panel
- learning track distribution
- quiz attempt summary
- small charts if useful

## Commit Message

```bash
git add .
git commit -m "feat: add real admin dashboard metrics"
```

---

# 10. Phase 6 — Trainer Dashboard

## Branch

```bash
feat/trainer-dashboard
```

## Goal

Make trainer dashboard useful for monitoring fellows.

## Trainer Should See

- assigned fellows
- fellow learning track
- fellow progress percentage
- latest quiz score
- weak topics
- trainer notes
- upcoming sessions

## Suggested Routes

```txt
/trainer/dashboard
/trainer/fellows
/trainer/fellows/:id
/trainer/sessions
```

## Backend APIs

Suggested endpoints:

```txt
GET /api/trainer/dashboard/summary
GET /api/trainer/fellows
GET /api/trainer/fellows/{fellowId}
POST /api/trainer/fellows/{fellowId}/notes
GET /api/trainer/sessions
```

## Commit Message

```bash
git add .
git commit -m "feat: build trainer dashboard with fellow progress"
```

---

# 11. Phase 7 — Employer Dashboard

## Branch

```bash
feat/employer-dashboard
```

## Goal

Give employers a proper workflow for finding and shortlisting fellows.

## Employer Should Be Able To

- complete employer profile
- create job/opportunity posts
- view fellows by learning track
- view fellow profile and progress summary
- shortlist fellows
- track interview status
- update hiring status

## Suggested Routes

```txt
/employer/dashboard
/employer/opportunities
/employer/opportunities/new
/employer/opportunities/:id/edit
/employer/fellows
/employer/shortlist
```

## Backend APIs

Suggested endpoints:

```txt
GET /api/employer/dashboard/summary
POST /api/employer/opportunities
GET /api/employer/opportunities
PUT /api/employer/opportunities/{id}
DELETE /api/employer/opportunities/{id}
GET /api/employer/fellows?learningTrack=qa
POST /api/employer/shortlist/{fellowId}
GET /api/employer/shortlist
PUT /api/employer/hiring-status/{fellowId}
```

## Commit Message

```bash
git add .
git commit -m "feat: build employer opportunity dashboard"
```

---

# 12. Phase 8 — UI/UX Polish

## Branch

```bash
chore/ui-ux-polish
```

## Goal

Make the platform feel clean, professional, and consistent.

## Fix These UI Problems

- Remove unnecessary global back arrows.
- Use page-level back links only when needed.
- Make dashboard cards consistent.
- Improve button spacing.
- Use consistent page headers.
- Improve typography hierarchy.
- Add consistent empty state cards.
- Add consistent loading skeletons.
- Improve mobile responsiveness.
- Avoid too many colors.
- Avoid too many dashboard cards.
- Keep layout clean and role-specific.

## Navigation Rule

Do not add global back arrows everywhere.

Use contextual links only when useful:

```txt
← Back to quizzes
← Back to dashboard
```

## Responsive QA Checklist

Check these pages on mobile:

- fellow dashboard
- profile settings
- quiz attempt page
- quiz result page
- admin dashboard
- trainer dashboard
- employer dashboard

## Commit Message

```bash
git add .
git commit -m "chore: polish dashboard UI and responsive states"
```

---

# 13. Phase 9 — Testing

## Branch

```bash
test/core-platform-flows
```

## Goal

Make the project stable before demo or production deployment.

## Backend Tests Needed

### Auth Tests

- login
- register
- protected route rejection
- invalid token rejection
- role-based access rejection

### Profile Tests

- get profile
- update profile
- change password
- update learning track
- reject non-fellow learning track update

### Quiz Tests

- get quiz categories
- submit quiz
- get quiz attempts
- get quiz attempt result
- filter attempts by learning track

### Admin Quiz Tests

- create quiz question
- edit quiz question
- delete quiz question
- activate/deactivate quiz question
- validation errors

## Frontend Tests Needed

- login page
- register page
- protected route behavior
- fellow dashboard without selected track
- fellow dashboard with selected track
- profile settings validation
- save profile
- change password
- quiz attempt page
- quiz result page

## Commit Message

```bash
git add .
git commit -m "test: add core auth profile quiz and dashboard tests"
```

---

# 14. Phase 10 — Production Readiness

## Branch

```bash
chore/production-readiness
```

## Goal

Prepare the platform for real deployment and demo stability.

## Environment Configuration

Document required environment variables.

### Backend `.env`

```env
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRE_MINUTES=
CORS_ORIGINS=
ENVIRONMENT=development
```

### Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Security Tasks

- Confirm JWT expiry behavior.
- Add refresh token strategy if needed.
- Rate-limit login endpoint.
- Rate-limit password change endpoint.
- Ensure password hashes are never returned.
- Ensure role cannot be modified through unsafe profile update payload.
- Ensure learning track cannot be updated by non-fellow role.
- Add production CORS origins.

## Data Seeding

Create seed data for:

- admin account
- trainers
- employers
- fellows
- learning tracks
- quiz categories
- quiz questions
- sample quiz attempts

## Commit Message

```bash
git add .
git commit -m "chore: add production readiness configuration and seed data"
```

---

# 15. Suggested Implementation Order

Follow this order strictly:

```txt
1. feat/fellow-learning-progress
2. feat/quiz-track-filtering
3. feat/fellow-dashboard-real-data
4. feat/admin-quiz-management
5. feat/admin-dashboard-metrics
6. feat/trainer-dashboard
7. feat/employer-dashboard
8. chore/ui-ux-polish
9. test/core-platform-flows
10. chore/production-readiness
```

Do not start employer dashboard before fellow dashboard and quiz progress are working.

Do not polish UI before core data is connected.

Do not write large tests before features are stable.

---

# 16. Verification Commands

## Frontend

```bash
cd daai-webapp
npm run lint
npm run build
npm run dev
```

## Backend

```bash
cd daai-backend
./venv/bin/python -m compileall app
./venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
```

If your backend command uses a different app path, use the correct one from your project.

Example:

```bash
uvicorn main:app --reload
```

or:

```bash
uvicorn app.main:app --reload
```

---

# 17. Manual Demo Checklist

Before showing the project to anyone, verify:

## Auth

- User can register.
- User can login.
- Wrong password is rejected.
- Protected pages cannot be opened without login.
- Role-based redirect works.

## Fellow

- Fellow can select one learning track.
- Fellow dashboard shows only selected track.
- Fellow dashboard shows real progress.
- Fellow can attempt quiz.
- Fellow can view quiz result.
- Fellow can view previous attempts.

## Admin

- Admin can access admin dashboard.
- Admin dashboard shows real data.
- Admin can create quiz question.
- Admin can edit quiz question.
- Admin can delete quiz question.
- Admin can filter quiz questions.

## Trainer

- Trainer can view assigned fellows.
- Trainer can view fellow progress.
- Trainer can add notes or feedback if implemented.

## Employer

- Employer can view fellows.
- Employer can create opportunities.
- Employer can shortlist fellows.

## UI

- Pages look good on desktop.
- Pages look good on mobile.
- Buttons are not overflowing.
- Cards have consistent spacing.
- Loading states are not plain text.
- Empty states are clear.

---

# 18. Coding Assistant Prompt for Phase 1

Use this prompt when implementing Phase 1:

```txt
We are working on the DAAI Fellowship Platform.

Current state:
- Fellow can select only one learning track: QA, Salesforce, AWS Practitioner, or AWS Architect.
- Profile settings already saves learningTrack.
- Fellow dashboard currently has fallback/static learning progress.
- Quiz attempt filtering is not fully backend-supported yet.

Task:
Implement backend learning progress integration for fellows.

Requirements:
1. Add a backend learning progress model linked to the authenticated fellow.
2. Store learningTrack, module progress, completion percentage, milestones, and status.
3. Add APIs:
   - GET /api/learning-progress/me
   - GET /api/learning-progress/me/{learningTrack}
   - PUT /api/learning-progress/me
4. Ensure only authenticated fellows can access/update their own progress.
5. Do not allow ADMIN/TRAINER/EMPLOYER to update fellow learning progress through this endpoint.
6. Add frontend service:
   - src/services/learningProgressService.js
7. Connect fellow dashboard to real backend progress data.
8. Replace static 0% progress and fake modules with API data.
9. Add loading skeleton and empty state when progress does not exist.
10. Keep code clean and avoid adding unnecessary global back buttons.
11. Do not change unrelated routes or pages.

After changes, run:
- npm run build in frontend
- python -m compileall app in backend

Return a summary of changed files and how to test manually.
```

---

# 19. Coding Assistant Prompt for Phase 2

```txt
We are working on the DAAI Fellowship Platform.

Current state:
- Fellows can select one learning track.
- Quiz attempts exist.
- Fellow dashboard currently should show attempts related to the selected learning track.

Task:
Move quiz attempt filtering from frontend to backend.

Requirements:
1. Add stable learning track/category slugs:
   - qa
   - salesforce
   - aws-practitioner
   - aws-architect
2. Update quiz category or quiz attempt model if needed to store learningTrack/category slug.
3. Add backend filter support:
   - GET /api/quizzes/my-attempts?learningTrack=qa
   - GET /api/quizzes/my-attempts?learningTrack=salesforce
   - GET /api/quizzes/my-attempts?learningTrack=aws-practitioner
   - GET /api/quizzes/my-attempts?learningTrack=aws-architect
4. Update frontend quiz service to pass selected learningTrack.
5. Remove frontend-only text filtering from fellow dashboard.
6. Add empty state when no attempts exist for selected track.
7. Do not change unrelated routes or pages.

After changes, run:
- npm run build
- python -m compileall app

Return changed files and manual testing steps.
```

---

# 20. Definition of Done

A phase is complete only when:

- The feature works in UI.
- Backend API is connected.
- No unrelated files are changed.
- Build passes.
- Basic manual testing is done.
- Commit message is clear.
- PR is created and reviewed.
- Branch is merged into `main`.

---

# 21. Important Development Rules

Follow these rules to avoid making the project messy again:

1. One branch = one feature.
2. Do not change many unrelated files in one task.
3. Do not add global back arrows everywhere.
4. Keep role strings in constants.
5. Keep learning track strings in constants.
6. Keep API calls inside service files.
7. Keep dashboard components reusable.
8. Use backend filtering instead of frontend hacks.
9. Use clean empty states.
10. Test before committing.

---

# 22. Recommended Next Action

Start with this branch:

```bash
git checkout main
git pull origin main
git checkout -b feat/fellow-learning-progress
```

Then implement Phase 1.

After Phase 1 is merged, continue with:

```bash
git checkout main
git pull origin main
git checkout -b feat/quiz-track-filtering
```

This sequence will make the platform cleaner, more useful, and easier to complete.
