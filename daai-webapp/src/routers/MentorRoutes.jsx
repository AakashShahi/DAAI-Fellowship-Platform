import { Navigate, Route } from 'react-router-dom'
import { ROLES } from '../constants/roles'
import MentorLayout from '../layouts/MentorLayout'
import ComingSoonPage from '../pages/ComingSoonPage'
import MentorDashboard from '../pages/dashboards/MentorDashboard'
import MentorSubmissionReviewPage from '../pages/mentor/MentorSubmissionReviewPage'
import MentorSubmissionsPage from '../pages/mentor/MentorSubmissionsPage'
import { protectRole } from './routeGuards'

export const mentorRoutesElement = (
  <Route
    path="/mentor"
    element={protectRole([ROLES.MENTOR, ROLES.TRAINER], <MentorLayout />)}
  >
    <Route index element={<Navigate to="/mentor/dashboard" replace />} />
    <Route path="dashboard" element={<MentorDashboard />} />
    <Route path="assignments/review" element={<MentorSubmissionsPage />} />
    <Route path="submissions" element={<Navigate to="/mentor/assignments/review" replace />} />
    <Route
      path="submissions/:submissionId"
      element={<MentorSubmissionReviewPage />}
    />
    <Route
      path="cohorts"
      element={
        <ComingSoonPage
          title="Assigned cohorts"
          description="View cohorts you mentor and session schedules."
        />
      }
    />
    <Route
      path="fellows"
      element={
        <ComingSoonPage
          title="Assigned fellows"
          description="A roster of fellows you support, progress snapshots, and notes will live here."
        />
      }
    />
    <Route
      path="sessions"
      element={
        <ComingSoonPage
          title="Mentoring sessions"
          description="Schedule 1:1s, office hours, and session history will connect here."
        />
      }
    />
    <Route
      path="feedback"
      element={
        <ComingSoonPage
          title="Fellow feedback"
          description="Structured feedback and review notes for assignments and capstones."
        />
      }
    />
    <Route path="resources" element={<Navigate to="/mentor/feedback" replace />} />
  </Route>
)
