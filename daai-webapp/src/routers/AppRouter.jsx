import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ROLES } from '../constants/roles'
import DashboardLayout from '../layouts/DashboardLayout'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminQuizManagementPage from '../pages/admin/AdminQuizManagementPage'
import ApplicationsPage from '../pages/admin/ApplicationsPage'
import CohortsPage from '../pages/admin/CohortsPage'
import EmployersPage from '../pages/admin/EmployersPage'
import FellowsPage from '../pages/admin/FellowsPage'
import OpportunitiesPage from '../pages/admin/OpportunitiesPage'
import ReportsPage from '../pages/admin/ReportsPage'
import SettingsPage from '../pages/admin/SettingsPage'
import TrainersPage from '../pages/admin/TrainersPage'
import EmployerDashboard from '../pages/dashboards/EmployerDashboard'
import FellowDashboard from '../pages/dashboards/FellowDashboard'
import TrainerDashboard from '../pages/dashboards/TrainerDashboard'
import LearningTrackDetailPage from '../pages/learningTracks/LearningTrackDetailPage'
import Login from '../pages/Login'
import ProfileSettingsPage from '../pages/ProfileSettingsPage'
import QuizAttemptsPage from '../pages/quizzes/QuizAttemptsPage'
import QuizAttemptPage from '../pages/quizzes/QuizAttemptPage'
import QuizListPage from '../pages/quizzes/QuizListPage'
import QuizResultPage from '../pages/quizzes/QuizResultPage'
import Register from '../pages/Register'
import DashboardRedirect from '../routes/DashboardRedirect'
import ProtectedRoute from '../routes/ProtectedRoute'
import RoleBasedRoute from '../routes/RoleBasedRoute'

const protect = (element) => <ProtectedRoute>{element}</ProtectedRoute>

const protectRole = (allowedRoles, element) =>
  protect(<RoleBasedRoute allowedRoles={allowedRoles}>{element}</RoleBasedRoute>)

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={protect(<DashboardRedirect />)} />
        <Route path="/quizzes" element={protect(<QuizListPage />)} />
        <Route
          path="/quizzes/attempts"
          element={protect(<QuizAttemptsPage />)}
        />
        <Route
          path="/quizzes/attempts/:attemptId"
          element={protect(<QuizResultPage />)}
        />
        <Route
          path="/quizzes/:category"
          element={protect(<QuizAttemptPage />)}
        />
        <Route
          path="/quizzes/:category/result"
          element={protect(<QuizResultPage />)}
        />
        <Route
          path="/profile/settings"
          element={protect(<ProfileSettingsPage />)}
        />
        <Route
          path="/learning-tracks/:trackSlug"
          element={protectRole([ROLES.FELLOW], <LearningTrackDetailPage />)}
        />
        <Route
          path="/courses/:trackSlug"
          element={protectRole([ROLES.FELLOW], <LearningTrackDetailPage />)}
        />

        <Route
          path="/admin"
          element={protectRole(
            [ROLES.SUPER_ADMIN, ROLES.ADMIN],
            <DashboardLayout />,
          )}
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="fellows" element={<FellowsPage />} />
          <Route path="cohorts" element={<CohortsPage />} />
          <Route path="trainers" element={<TrainersPage />} />
          <Route path="employers" element={<EmployersPage />} />
          <Route path="opportunities" element={<OpportunitiesPage />} />
          <Route path="quizzes" element={<AdminQuizManagementPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route
          path="/trainer/dashboard"
          element={protectRole([ROLES.TRAINER], <TrainerDashboard />)}
        />
        <Route
          path="/fellow/dashboard"
          element={protectRole([ROLES.FELLOW], <FellowDashboard />)}
        />
        <Route
          path="/employer/dashboard"
          element={protectRole([ROLES.EMPLOYER], <EmployerDashboard />)}
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
