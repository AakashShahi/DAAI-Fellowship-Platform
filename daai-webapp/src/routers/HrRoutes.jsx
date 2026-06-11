import { Navigate, Route } from 'react-router-dom'
import { ROLES } from '../constants/roles'
import HrLayout from '../layouts/HrLayout'
import ComingSoonPage from '../pages/ComingSoonPage'
import HrDashboard from '../pages/dashboards/HrDashboard'
import MentorSubmissionReviewPage from '../pages/mentor/MentorSubmissionReviewPage'
import MentorSubmissionsPage from '../pages/mentor/MentorSubmissionsPage'
import { protectRole } from './routeGuards'

export const hrRoutesElement = (
  <Route
    path="/hr"
    element={protectRole([ROLES.HR], <HrLayout />)}
  >
    <Route index element={<Navigate to="/hr/dashboard" replace />} />
    <Route path="dashboard" element={<HrDashboard />} />
    <Route path="assignments/review" element={<MentorSubmissionsPage />} />
    <Route path="submissions" element={<Navigate to="/hr/assignments/review" replace />} />
    <Route
      path="submissions/:submissionId"
      element={<MentorSubmissionReviewPage />}
    />
    <Route
      path="cohorts"
      element={
        <ComingSoonPage
          title="Assigned cohorts"
          description="View cohorts and session schedules."
        />
      }
    />
    <Route
      path="fellows"
      element={
        <ComingSoonPage
          title="Fellow management"
          description="A roster of fellows you support, progress snapshots, and notes will live here."
        />
      }
    />
    <Route
      path="sessions"
      element={
        <ComingSoonPage
          title="Sessions"
          description="Schedule and session history will connect here."
        />
      }
    />
    <Route
      path="feedback"
      element={
        <ComingSoonPage
          title="Feedback"
          description="Structured feedback and review notes."
        />
      }
    />
    <Route path="resources" element={<Navigate to="/hr/feedback" replace />} />
  </Route>
)
