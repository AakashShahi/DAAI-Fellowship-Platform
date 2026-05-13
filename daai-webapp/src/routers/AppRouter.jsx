import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import AdminDashboard from '../pages/admin/AdminDashboard'
import ApplicationsPage from '../pages/admin/ApplicationsPage'
import CohortsPage from '../pages/admin/CohortsPage'
import EmployersPage from '../pages/admin/EmployersPage'
import FellowsPage from '../pages/admin/FellowsPage'
import OpportunitiesPage from '../pages/admin/OpportunitiesPage'
import ReportsPage from '../pages/admin/ReportsPage'
import SettingsPage from '../pages/admin/SettingsPage'
import TrainersPage from '../pages/admin/TrainersPage'
import Login from '../pages/Login'
import QuizAttemptsPage from '../pages/quizzes/QuizAttemptsPage'
import QuizAttemptPage from '../pages/quizzes/QuizAttemptPage'
import QuizListPage from '../pages/quizzes/QuizListPage'
import QuizResultPage from '../pages/quizzes/QuizResultPage'
import Register from '../pages/Register'
import useAuthStore from '../store/authStore'

const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  TRAINER: 'TRAINER',
  FELLOW: 'FELLOW',
  EMPLOYER: 'EMPLOYER',
}

const ROLE_DASHBOARD_PATHS = {
  [ROLES.SUPER_ADMIN]: '/admin/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.TRAINER]: '/trainer/dashboard',
  [ROLES.FELLOW]: '/fellow/dashboard',
  [ROLES.EMPLOYER]: '/employer/dashboard',
}

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function RoleBasedRoute({ allowedRoles, children }) {
  const user = useAuthStore((state) => state.user)
  const userRole = user?.role

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Unauthorized />
  }

  return children
}

function DashboardRedirect() {
  const user = useAuthStore((state) => state.user)
  const dashboardPath = ROLE_DASHBOARD_PATHS[user?.role]

  if (!dashboardPath) {
    return <Unauthorized />
  }

  return <Navigate to={dashboardPath} replace />
}

function RoleDashboard({ eyebrow, title, description, children }) {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return (
    <main className="app-home">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            D
          </span>
          <span>
            <strong>DAAI</strong>
            <small>Fellowship</small>
          </span>
        </div>

        <button type="button" className="secondary-button" onClick={logout}>
          Logout
        </button>
      </header>

      <section className="welcome-panel">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <p>
          {user?.email
            ? `Signed in as ${user.email}`
            : 'You are signed in and ready to continue.'}
        </p>

        {children}
      </section>
    </main>
  )
}

function TrainerDashboard() {
  return (
    <RoleDashboard
      eyebrow="Trainer Dashboard"
      title="Guide fellows and learning progress"
      description="Track assigned fellows, sessions, learning activities, and training support from one place."
    />
  )
}

function FellowDashboard() {
  const fellowActions = [
    {
      title: 'Take Quizzes',
      description: 'Practice QA, Salesforce, and AWS quiz categories.',
      to: '/quizzes',
      cta: 'Start quiz',
    },
    {
      title: 'View Quiz Attempts / Results',
      description: 'Review quiz results after completing an attempt.',
      to: '/quizzes',
      cta: 'View quizzes',
    },
    {
      title: 'Learning Progress',
      description: 'Track your fellowship learning milestones.',
      to: '/fellow/dashboard',
      cta: 'Coming soon',
    },
    {
      title: 'Opportunities',
      description: 'Explore fellowship opportunities and next steps.',
      to: '/fellow/dashboard',
      cta: 'Coming soon',
    },
  ]

  return (
    <RoleDashboard
      eyebrow="Fellow Dashboard"
      title="Continue your fellowship journey"
      description="Access your learning updates, opportunities, and fellowship progress."
    >
      <div className="dashboard-actions">
        {fellowActions.map((action) => (
          <Link key={action.title} className="dashboard-action-card" to={action.to}>
            <span>{action.title}</span>
            <p>{action.description}</p>
            <strong>{action.cta}</strong>
          </Link>
        ))}
      </div>
    </RoleDashboard>
  )
}

function EmployerDashboard() {
  return (
    <RoleDashboard
      eyebrow="Employer Dashboard"
      title="Connect with fellowship talent"
      description="Manage opportunities, review fellow profiles, and follow hiring activity."
    />
  )
}

function Unauthorized() {
  return (
    <main className="app-home">
      <section className="status-panel">
        <p className="eyebrow">Unauthorized</p>
        <h1>Access denied</h1>
        <p>You do not have permission to view this page.</p>
        <Link className="secondary-button" to="/dashboard">
          Back to dashboard
        </Link>
      </section>
    </main>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes"
          element={
            <ProtectedRoute>
              <QuizListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes/attempts"
          element={
            <ProtectedRoute>
              <QuizAttemptsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes/attempts/:attemptId"
          element={
            <ProtectedRoute>
              <QuizResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes/:category"
          element={
            <ProtectedRoute>
              <QuizAttemptPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes/:category/result"
          element={
            <ProtectedRoute>
              <QuizResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <DashboardLayout />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="fellows" element={<FellowsPage />} />
          <Route path="cohorts" element={<CohortsPage />} />
          <Route path="trainers" element={<TrainersPage />} />
          <Route path="employers" element={<EmployersPage />} />
          <Route path="opportunities" element={<OpportunitiesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route
          path="/trainer/dashboard"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={[ROLES.TRAINER]}>
                <TrainerDashboard />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/fellow/dashboard"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={[ROLES.FELLOW]}>
                <FellowDashboard />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/dashboard"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={[ROLES.EMPLOYER]}>
                <EmployerDashboard />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
