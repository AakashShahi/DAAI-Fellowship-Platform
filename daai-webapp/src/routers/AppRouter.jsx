import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import Login from '../pages/Login'
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

function DashboardLayout({ eyebrow, title, description }) {
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
      </section>
    </main>
  )
}

function AdminDashboard() {
  return (
    <DashboardLayout
      eyebrow="Admin Dashboard"
      title="Manage the fellowship platform"
      description="Review users, cohorts, trainers, fellows, employers, and platform operations from the admin workspace."
    />
  )
}

function TrainerDashboard() {
  return (
    <DashboardLayout
      eyebrow="Trainer Dashboard"
      title="Guide fellows and learning progress"
      description="Track assigned fellows, sessions, learning activities, and training support from one place."
    />
  )
}

function FellowDashboard() {
  return (
    <DashboardLayout
      eyebrow="Fellow Dashboard"
      title="Continue your fellowship journey"
      description="Access your learning updates, opportunities, and fellowship progress."
    />
  )
}

function EmployerDashboard() {
  return (
    <DashboardLayout
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
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <AdminDashboard />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
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
