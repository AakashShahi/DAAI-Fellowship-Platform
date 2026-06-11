import { Navigate, Route } from 'react-router-dom'
import { ROLES } from '../constants/roles'
import AdminLayout from '../layouts/AdminLayout'
import AdminAssignmentEditPage from '../pages/admin/AdminAssignmentEditPage'
import AdminAssignmentsPage from '../pages/admin/AdminAssignmentsPage'
import AdminAnnouncementsPage from '../pages/admin/AdminAnnouncementsPage'
import AssignmentFormPage from '../pages/admin/AssignmentFormPage'
import AssignmentSubmissionsPage from '../pages/admin/AssignmentSubmissionsPage'
import AdminAttendancePage from '../pages/admin/AdminAttendancePage'
import AdminBatchesPage from '../pages/admin/AdminBatchesPage'
import AdminCertificatesPage from '../pages/admin/AdminCertificatesPage'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminEnrollmentsPage from '../pages/admin/AdminEnrollmentsPage'
import AdminLessonsPage from '../pages/admin/AdminLessonsPage'
import AdminModulesPage from '../pages/admin/AdminModulesPage'
import StaffListPage from '../pages/admin/StaffListPage'
import StaffCreatePage from '../pages/admin/StaffCreatePage'
import StaffEditPage from '../pages/admin/StaffEditPage'
import StaffDetailPage from '../pages/admin/StaffDetailPage'
import ModuleDetailPage from '../pages/admin/ModuleDetailPage'
import ModuleFormPage from '../pages/admin/ModuleFormPage'
import AdminQuizManagementPage from '../pages/admin/AdminQuizManagementPage'
import AdminSubmissionReviewPage from '../pages/admin/AdminSubmissionReviewPage'
import AdminSubmissionsPage from '../pages/admin/AdminSubmissionsPage'
import AdminSessionDetailPage from '../pages/admin/AdminSessionDetailPage'
import AdminSessionsPage from '../pages/admin/AdminSessionsPage'
import AdminTracksPage from '../pages/admin/AdminTracksPage'
import ApplicationsPage from '../pages/admin/ApplicationsPage'
import ApplicationDetailPage from '../pages/admin/ApplicationDetailPage'
import AttendanceManagementPage from '../pages/admin/AttendanceManagementPage'
import CohortCreatePage from '../pages/admin/CohortCreatePage'
import CohortDetailPage from '../pages/admin/CohortDetailPage'
import CohortsPage from '../pages/admin/CohortsPage'
import EmployersPage from '../pages/admin/EmployersPage'
import FellowsPage from '../pages/admin/FellowsPage'
import OpportunitiesPage from '../pages/admin/OpportunitiesPage'
import ReportsPage from '../pages/admin/ReportsPage'
import SettingsPage from '../pages/admin/SettingsPage'
import SessionFormPage from '../pages/admin/SessionFormPage'
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
    <Route path="applications/:applicationId" element={<ApplicationDetailPage />} />
    <Route path="staff" element={<StaffListPage />} />
    <Route path="staff/new" element={<StaffCreatePage />} />
    <Route path="staff/:staffId" element={<StaffDetailPage />} />
    <Route path="staff/:staffId/edit" element={<StaffEditPage />} />
    <Route path="fellows" element={<FellowsPage />} />
    <Route path="cohorts" element={<CohortsPage />} />
    <Route path="cohorts/new" element={<CohortCreatePage />} />
    <Route path="cohorts/:cohortId" element={<CohortDetailPage />} />
    <Route path="trainers" element={<TrainersPage />} />
    <Route path="employers" element={<EmployersPage />} />
    <Route path="opportunities" element={<OpportunitiesPage />} />
    <Route path="tracks" element={<AdminTracksPage />} />
    <Route path="batches" element={<AdminBatchesPage />} />
    <Route path="enrollments" element={<AdminEnrollmentsPage />} />
    <Route path="modules" element={<AdminModulesPage />} />
    <Route path="modules/new" element={<ModuleFormPage />} />
    <Route path="modules/:moduleId" element={<ModuleDetailPage />} />
    <Route path="modules/:moduleId/edit" element={<ModuleFormPage />} />
    <Route path="lessons" element={<AdminLessonsPage />} />
    <Route path="assignments" element={<AdminAssignmentsPage />} />
    <Route path="assignments/new" element={<AssignmentFormPage />} />
    <Route path="assignments/:assignmentId" element={<AdminAssignmentEditPage />} />
    <Route path="assignments/:assignmentId/edit" element={<AssignmentFormPage />} />
    <Route path="assignments/:assignmentId/submissions" element={<AssignmentSubmissionsPage />} />
    <Route path="sessions" element={<AdminSessionsPage />} />
    <Route path="sessions/new" element={<SessionFormPage />} />
    <Route path="sessions/:sessionId" element={<AdminSessionDetailPage />} />
    <Route path="sessions/:sessionId/edit" element={<SessionFormPage />} />
    <Route path="sessions/:sessionId/attendance" element={<AttendanceManagementPage />} />
    <Route path="submissions" element={<AdminSubmissionsPage />} />
    <Route path="submissions/:submissionId" element={<AdminSubmissionReviewPage />} />
    <Route path="quizzes" element={<AdminQuizManagementPage />} />
    <Route path="attendance" element={<AdminAttendancePage />} />
    <Route path="announcements" element={<AdminAnnouncementsPage />} />
    <Route path="certificates" element={<AdminCertificatesPage />} />
    <Route path="reports" element={<ReportsPage />} />
    <Route path="settings" element={<SettingsPage />} />
  </Route>
)
