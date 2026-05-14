import { Navigate, Route } from 'react-router-dom'
import { ROLES } from '../constants/roles'
import AdminLayout from '../layouts/AdminLayout'
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
import { protectRole } from './routeGuards'

export const adminRoutesElement = (
  <Route
    path="/admin"
    element={protectRole(
      [ROLES.SUPER_ADMIN, ROLES.ADMIN],
      <AdminLayout />,
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
)
